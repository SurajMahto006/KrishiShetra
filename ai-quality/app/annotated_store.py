"""
annotated_store.py — Storage and retrieval for annotated inference images.

Keeps recent annotated images in an in-memory LRU cache and persists
them to the temporary directory (tmp/annotated) so they can be retrieved
by the frontend via GET /api/quality/annotated/{image_id}.
"""

from __future__ import annotations

import logging
import os
from collections import OrderedDict
from typing import Optional

logger = logging.getLogger("ai_quality.annotated_store")

# Maximum number of annotated images to keep in memory
MAX_MEMORY_ITEMS = 100

# In-memory LRU cache: image_id -> bytes
_MEMORY_CACHE: OrderedDict[str, bytes] = OrderedDict()


def _get_storage_dir() -> str:
    """Return the directory used for persisting annotated images."""
    temp_dir = os.getenv("TEMP_DIR", "tmp")
    target = os.path.join(temp_dir, "annotated")
    os.makedirs(target, exist_ok=True)
    return target


def save_annotated_image(image_id: str, image_bytes: bytes) -> str:
    """
    Save annotated image bytes to in-memory cache and disk.

    Args:
        image_id: Unique string identifier (e.g. uuid hex).
        image_bytes: Raw JPEG image bytes.

    Returns:
        The image_id.
    """
    # Clean ID
    clean_id = image_id.replace(".jpg", "").replace(".jpeg", "")

    # 1. Update in-memory LRU cache
    if clean_id in _MEMORY_CACHE:
        _MEMORY_CACHE.move_to_end(clean_id)
    _MEMORY_CACHE[clean_id] = image_bytes
    if len(_MEMORY_CACHE) > MAX_MEMORY_ITEMS:
        _MEMORY_CACHE.popitem(last=False)

    # 2. Persist to disk
    try:
        storage_dir = _get_storage_dir()
        file_path = os.path.join(storage_dir, f"{clean_id}.jpg")
        with open(file_path, "wb") as f:
            f.write(image_bytes)
    except Exception as exc:
        logger.warning("Could not persist annotated image %s to disk: %s", clean_id, exc)

    return clean_id


def get_annotated_image(image_id: str) -> Optional[bytes]:
    """
    Retrieve annotated image bytes by ID. Checks in-memory cache first, then disk.

    Args:
        image_id: Identifier (with or without .jpg extension).

    Returns:
        bytes if found, None otherwise.
    """
    clean_id = image_id.replace(".jpg", "").replace(".jpeg", "")

    # 1. Check in-memory cache
    if clean_id in _MEMORY_CACHE:
        _MEMORY_CACHE.move_to_end(clean_id)
        return _MEMORY_CACHE[clean_id]

    # 2. Check disk
    try:
        storage_dir = _get_storage_dir()
        file_path = os.path.join(storage_dir, f"{clean_id}.jpg")
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                data = f.read()
            # Restore to memory cache
            _MEMORY_CACHE[clean_id] = data
            if len(_MEMORY_CACHE) > MAX_MEMORY_ITEMS:
                _MEMORY_CACHE.popitem(last=False)
            return data
    except Exception as exc:
        logger.warning("Error reading annotated image %s from disk: %s", clean_id, exc)

    return None


def clear_store() -> None:
    """Clear in-memory cache (primarily for tests)."""
    _MEMORY_CACHE.clear()
