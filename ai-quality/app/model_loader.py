"""
model_loader.py — Single-instance YOLOv8 model loader.

The model is loaded once during FastAPI lifespan startup and stored in
a module-level singleton. All requests share the same model instance.

Design rules:
  - get_model() returns None (not an error) if the weights file is absent.
    Inference handles None gracefully and returns MODEL_NOT_LOADED status.
  - The model path and version are read from environment variables.
  - No model reload happens per-request.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Module-level singleton state
# ─────────────────────────────────────────────────────────────────────────────

_model = None          # Ultralytics YOLO instance or None
_model_loaded = False
_supported_crops: list[str] = []    # unique crop names from model.names
_model_class_count: int = 0         # total class count from model.names
_model_version: Optional[str] = None
_device: str = "cpu"


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def load_model() -> None:
    """
    Attempt to load the YOLOv8 model from MODEL_PATH env var.
    Called once during FastAPI lifespan startup.

    If the file does not exist, logs a warning and continues — the service
    starts successfully, but all /analyze calls return MODEL_NOT_LOADED.
    """
    global _model, _model_loaded, _supported_crops, _model_class_count, _model_version, _device

    model_path = os.getenv("MODEL_PATH", "outputs/vegqual-20ep/weights/best.pt")
    _model_version = os.getenv("MODEL_VERSION", "vegqual-20ep")

    path = Path(model_path)
    if not path.exists():
        logger.warning(
            "Model weights not found at '%s'. "
            "Service will start, but /analyze will return MODEL_NOT_LOADED. "
            "Train the model first — see training/train.py.",
            model_path,
        )
        _model = None
        _model_loaded = False
        _supported_crops = []
        _model_class_count = 0
        return

    logger.info("Loading YOLOv8 model from '%s' ...", model_path)
    try:
        # Import here so the rest of the app can import model_loader
        # even in environments where ultralytics is not installed (e.g., test stubs)
        from ultralytics import YOLO
        import torch

        _device = "cuda:0" if torch.cuda.is_available() else "cpu"
        logger.info("AI inference device: %s", "CUDA:0" if "cuda" in _device else "CPU")

        # Register safe globals for PyTorch 2.4+ if supported
        if hasattr(torch.serialization, "add_safe_globals"):
            try:
                import ultralytics.nn.tasks
                torch.serialization.add_safe_globals([ultralytics.nn.tasks.DetectionModel])
            except Exception as sg_err:
                logger.debug("Safe globals registration notice: %s", sg_err)

        # Scoped trusted checkpoint loader for our verified MODEL_PATH (handles PyTorch 2.6+ weights_only default)
        orig_torch_load = torch.load

        def _trusted_torch_load(*args, **kwargs):
            if "weights_only" not in kwargs:
                kwargs["weights_only"] = False
            return orig_torch_load(*args, **kwargs)

        try:
            torch.load = _trusted_torch_load
            _model = YOLO(str(path))
        finally:
            torch.load = orig_torch_load

        try:
            _model.to(_device)
        except Exception as dev_err:
            logger.warning("Could not transfer model to device '%s': %s", _device, dev_err)
        _model_loaded = True

        # Extract unique crop names from the flat underscore-prefixed class labels.
        # VegQual class names use the format "fresh_<crop>" / "defected_<crop>".
        # We strip the leading condition prefix to get the crop portion.
        raw_names: dict[int, str] = _model.names  # {0: "fresh_tomato", 1: "defected_tomato", ...}
        _model_class_count = len(raw_names)
        crops: set[str] = set()
        for label in raw_names.values():
            crop = _parse_crop_from_label(label)
            if crop:
                crops.add(crop)
        _supported_crops = sorted(crops)

        logger.info(
            "Model loaded successfully. Path: %s | Version: %s | Classes: %d | Crops: %s",
            model_path,
            _model_version,
            _model_class_count,
            ", ".join(_supported_crops) or "none",
        )

    except Exception as exc:
        logger.error("Failed to load model from '%s': %s", model_path, exc, exc_info=True)
        _model = None
        _model_loaded = False
        _supported_crops = []
        _model_class_count = 0


def get_model():
    """Return the loaded YOLO model instance, or None if not loaded."""
    return _model


def is_model_loaded() -> bool:
    return _model_loaded


def get_supported_crops() -> list[str]:
    return list(_supported_crops)


def get_supported_class_count() -> int:
    """Return the total number of classes in the loaded model (0 if not loaded)."""
    return _model_class_count


def get_model_version() -> Optional[str]:
    return _model_version


def get_device() -> str:
    """Return the detected PyTorch device ('cuda:0' or 'cpu')."""
    return _device


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _parse_crop_from_label(label: str) -> Optional[str]:
    """
    Extract the crop name from a VegQual flat detection label.

    VegQual labels use underscore-prefixed condition + crop format:
        "<condition>_<crop_name>"
    where <condition> is "fresh" or "defected" and <crop_name> may itself
    contain underscores for multi-word crops.

    Examples:
        "fresh_tomato"           → "Tomato"
        "defected_bitter_gourd"  → "Bitter Gourd"
        "fresh_pointed_gourd"    → "Pointed Gourd"
        "defected_Potato"        → "Potato"   (handles mixed-case dataset labels)

    Returns None for empty, prefix-only, or unrecognised labels.
    """
    normalised = label.strip().lower()
    for prefix in ("fresh_", "defected_"):
        if normalised.startswith(prefix):
            remainder = normalised[len(prefix):]
            if not remainder:
                return None
            return " ".join(word.capitalize() for word in remainder.split("_"))
    return None
