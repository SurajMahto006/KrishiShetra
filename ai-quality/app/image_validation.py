"""
image_validation.py — Pre-flight checks for uploaded images.

Validates format, file size, minimum dimensions, and file integrity
BEFORE passing anything to YOLO. Does NOT resize or normalize.

Returns a typed ValidationResult so callers can branch without catching exceptions.
"""

from __future__ import annotations

import io
import os
from dataclasses import dataclass
from typing import Optional

from PIL import Image, UnidentifiedImageError


# ─────────────────────────────────────────────────────────────────────────────
# Allowed formats
# ─────────────────────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".jpg", ".jpeg", ".png", ".webp"})

ALLOWED_MIME_TYPES: frozenset[str] = frozenset({
    "image/jpeg",
    "image/png",
    "image/webp",
})

# Pillow format strings that correspond to allowed types
ALLOWED_PIL_FORMATS: frozenset[str] = frozenset({"JPEG", "PNG", "WEBP"})


# ─────────────────────────────────────────────────────────────────────────────
# Result type
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class ValidationResult:
    ok: bool
    error_code: Optional[str] = None   # machine-readable e.g. "FORMAT_NOT_SUPPORTED"
    message: Optional[str] = None      # human-readable
    width: Optional[int] = None        # set on success
    height: Optional[int] = None       # set on success


# ─────────────────────────────────────────────────────────────────────────────
# Main validator
# ─────────────────────────────────────────────────────────────────────────────

def validate_image(
    file_bytes: bytes,
    filename: str,
    content_type: Optional[str],
    max_upload_bytes: int,
    min_dim: int,
) -> ValidationResult:
    """
    Run all pre-flight checks on an uploaded image.

    Args:
        file_bytes:       Raw bytes of the uploaded file.
        filename:         Original filename from the multipart upload.
        content_type:     MIME type reported by the client (may be None or wrong).
        max_upload_bytes: Maximum allowed file size in bytes.
        min_dim:          Minimum allowed width and height in pixels.

    Returns:
        ValidationResult with ok=True on success, or ok=False with an error_code.
    """

    # ── 1. File size ─────────────────────────────────────────────────────────
    size = len(file_bytes)
    if size == 0:
        return ValidationResult(
            ok=False,
            error_code="EMPTY_FILE",
            message="Uploaded file is empty.",
        )
    if size > max_upload_bytes:
        mb = max_upload_bytes // (1024 * 1024)
        return ValidationResult(
            ok=False,
            error_code="FILE_TOO_LARGE",
            message=f"File size exceeds the {mb} MB limit.",
        )

    # ── 2. File extension ────────────────────────────────────────────────────
    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        return ValidationResult(
            ok=False,
            error_code="FORMAT_NOT_SUPPORTED",
            message=(
                f"File extension '{ext}' is not supported. "
                f"Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    # ── 3. MIME type (client-reported — treat as advisory, not authoritative) ─
    if content_type and content_type not in ALLOWED_MIME_TYPES:
        return ValidationResult(
            ok=False,
            error_code="MIME_NOT_SUPPORTED",
            message=(
                f"Content-Type '{content_type}' is not supported. "
                f"Accepted: {', '.join(sorted(ALLOWED_MIME_TYPES))}"
            ),
        )

    # ── 4. Pillow integrity check ─────────────────────────────────────────────
    try:
        # verify() detects truncated / corrupted files but closes the stream
        img_for_verify = Image.open(io.BytesIO(file_bytes))
        img_for_verify.verify()
    except UnidentifiedImageError:
        return ValidationResult(
            ok=False,
            error_code="UNRECOGNIZED_FORMAT",
            message="The file could not be identified as a valid image.",
        )
    except Exception as exc:
        return ValidationResult(
            ok=False,
            error_code="CORRUPT_IMAGE",
            message=f"Image appears to be corrupted or truncated: {exc}",
        )

    # ── 5. Re-open after verify() (verify() exhausts the stream) ────────────
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.load()  # force full decode
    except Exception as exc:
        return ValidationResult(
            ok=False,
            error_code="DECODE_ERROR",
            message=f"Image could not be decoded: {exc}",
        )

    # ── 6. Pillow format whitelist ───────────────────────────────────────────
    if img.format not in ALLOWED_PIL_FORMATS:
        return ValidationResult(
            ok=False,
            error_code="FORMAT_NOT_SUPPORTED",
            message=(
                f"Detected image format '{img.format}' is not supported. "
                f"Accepted formats: JPEG, PNG, WebP."
            ),
        )

    # ── 7. Minimum dimensions ────────────────────────────────────────────────
    w, h = img.size
    if w < min_dim or h < min_dim:
        return ValidationResult(
            ok=False,
            error_code="IMAGE_TOO_SMALL",
            message=(
                f"Image is {w}×{h} px. Minimum allowed size is "
                f"{min_dim}×{min_dim} px."
            ),
        )

    return ValidationResult(ok=True, width=w, height=h)
