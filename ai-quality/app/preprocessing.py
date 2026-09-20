"""
preprocessing.py — Minimal image preparation helpers.

Scope: helpers for getting validated image bytes into a form that can be
passed to Ultralytics YOLO's model.predict().

What this module does NOT do:
  - Letterbox resize          → Ultralytics handles internally
  - Normalize pixel values    → Ultralytics handles internally
  - Convert to tensor         → Ultralytics handles internally

Keeping this module minimal prevents any train/serve preprocessing mismatch,
because Ultralytics applies identical transforms during training and inference.
"""

from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path
from typing import Optional

from PIL import Image


def bytes_to_pil(image_bytes: bytes) -> Image.Image:
    """
    Decode raw image bytes to a Pillow Image object.
    Converts to RGB to ensure 3-channel consistency (drops alpha if present).
    Does NOT resize or normalize.
    """
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    return img


def save_to_temp(image_bytes: bytes, suffix: str = ".jpg", temp_dir: Optional[str] = None) -> str:
    """
    Write image bytes to a named temporary file and return the path.

    Ultralytics model.predict() accepts a file path or numpy array.
    Using a temp file avoids any in-memory format conversion.

    The caller is responsible for deleting the file after use.
    Use delete_temp() for that.

    Args:
        image_bytes: Raw image bytes (already validated).
        suffix:      File extension for the temp file (default: .jpg).
        temp_dir:    Directory for temp files. Uses system default if None.

    Returns:
        Absolute path string to the temporary file.
    """
    dir_path = temp_dir or tempfile.gettempdir()
    os.makedirs(dir_path, exist_ok=True)

    fd, path = tempfile.mkstemp(suffix=suffix, dir=dir_path)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(image_bytes)
    except Exception:
        os.unlink(path)
        raise

    return path


def delete_temp(path: str) -> None:
    """
    Delete a temporary file. Silently ignores missing files.
    Called after inference completes to avoid storing farmer images.
    """
    try:
        os.unlink(path)
    except FileNotFoundError:
        pass
    except Exception as exc:
        # Log but do not raise — a leftover temp file is not a fatal error
        import logging
        logging.getLogger(__name__).warning("Could not delete temp file %s: %s", path, exc)


def get_image_suffix(filename: str) -> str:
    """Return the file extension in lowercase, defaulting to .jpg."""
    ext = Path(filename).suffix.lower()
    return ext if ext else ".jpg"
