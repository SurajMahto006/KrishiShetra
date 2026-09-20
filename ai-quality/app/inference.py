"""
inference.py — Crop-agnostic YOLOv8 inference interface.

Design rules:
  - Calls model.predict() with the raw image path.
    Ultralytics handles all internal preprocessing (letterbox, normalize, tensor).
  - Reads class names from model.names — no hardcoded crop list.
  - Parses the flat VegQual label (e.g. "fresh_tomato", "defected_bitter_gourd")
    into crop + condition by stripping the leading condition prefix.
  - Returns an InferenceResult dataclass. Never raises — all errors are
    captured and expressed as a status field.
  - If model is None: returns MODEL_NOT_LOADED without touching YOLO.
  - If nothing is detected above the confidence threshold: returns NO_DETECTION.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

from app.schemas import AnalysisStatus, BoundingBox, DetectionItem, InferenceResult

logger = logging.getLogger(__name__)

# Underscore-prefixes used in VegQual YOLO class names.
# Maps the raw prefix (lower-case, with trailing underscore) to the display condition.
_PREFIX_TO_CONDITION: dict[str, str] = {
    "fresh_":    "Fresh",
    "defected_": "Defective",
}


def run_inference(image_path: str, model, selected_crop: Optional[str] = None) -> InferenceResult:
    """
    Run YOLO detection on a single image and return a structured InferenceResult.

    Args:
        image_path:    Path to a validated temporary image file.
        model:         Loaded Ultralytics YOLO instance, or None.
        selected_crop: Optional farmer-selected crop (e.g. 'Tomato') for multi-object matching.

    Returns:
        InferenceResult — never raises.
    """
    # ── Guard: no model loaded ────────────────────────────────────────────────
    if model is None:
        return InferenceResult(
            status=AnalysisStatus.MODEL_NOT_LOADED,
            detectionCount=0,
            imageCondition=None,
            detections=[],
        )

    import time
    t_start = time.perf_counter()

    # ── Read inference config from env ────────────────────────────────────────
    conf_threshold = float(os.getenv("CONF_THRESHOLD", "0.10"))
    iou_threshold  = float(os.getenv("IOU_THRESHOLD", "0.45"))
    # Use 416 for fast responsive inference while preserving multi-object accuracy
    imgsz          = int(os.getenv("IMGSZ", "416"))

    # ── Run YOLO prediction ───────────────────────────────────────────────────
    t_inf_start = time.perf_counter()
    try:
        from app import model_loader
        device = model_loader.get_device()
        device_str = "CUDA:0" if "cuda" in str(device).lower() else "CPU"
        logger.info("[AI Quality] device=%s", device_str)
        results = model.predict(
            source=image_path,
            conf=conf_threshold,
            iou=iou_threshold,
            imgsz=imgsz,
            device=device,
            verbose=False,   # suppress per-frame console output
            save=False,      # do not write annotated images to disk
        )
    except Exception as exc:
        logger.error("YOLO prediction failed on '%s': %s", image_path, exc, exc_info=True)
        return InferenceResult(
            status=AnalysisStatus.VALIDATION_ERROR,  # re-use closest status
            detectionCount=0,
            imageCondition=None,
            detections=[],
        )
    inference_ms = (time.perf_counter() - t_inf_start) * 1000
    logger.info("[AI Quality] inference=%.1fms", inference_ms)

    # ── Parse detections ──────────────────────────────────────────────────────
    t_parse_start = time.perf_counter()
    if not results or len(results) == 0:
        return InferenceResult(
            status=AnalysisStatus.NO_DETECTION,
            detectionCount=0,
            imageCondition="No detection",
            detections=[],
        )

    result = results[0]  # single image → single Results object
    boxes = result.boxes

    if boxes is None:
        return InferenceResult(
            status=AnalysisStatus.NO_DETECTION,
            detectionCount=0,
            imageCondition="No detection",
            detections=[],
        )
    try:
        if len(boxes) == 0:
            return InferenceResult(
                status=AnalysisStatus.NO_DETECTION,
                detectionCount=0,
                imageCondition="No detection",
                detections=[],
            )
    except TypeError:
        pass

    # ── Extract all valid detections ──────────────────────────────────────────
    # boxes.xyxy: [N, 4], boxes.conf: [N], boxes.cls: [N]
    try:
        if hasattr(boxes.xyxy, "tolist"):
            xyxy_list = boxes.xyxy.tolist()
        elif isinstance(boxes.xyxy, (list, tuple)):
            xyxy_list = list(boxes.xyxy)
        else:
            xyxy_list = []

        if hasattr(boxes.conf, "tolist"):
            confs = [float(c) for c in boxes.conf.tolist()]
        elif isinstance(boxes.conf, (list, tuple)):
            confs = [float(c) for c in boxes.conf]
        else:
            confs = []

        if hasattr(boxes.cls, "int") and hasattr(boxes.cls.int(), "tolist"):
            cls_ids = boxes.cls.int().tolist()
        elif hasattr(boxes.cls, "tolist"):
            cls_ids = [int(x) for x in boxes.cls.tolist()]
        elif isinstance(boxes.cls, (list, tuple)):
            cls_ids = [int(x) for x in boxes.cls]
        else:
            cls_ids = []
    except Exception as exc:
        logger.error("Failed to extract box data from YOLO result: %s", exc)
        return InferenceResult(
            status=AnalysisStatus.NO_DETECTION,
            detectionCount=0,
            imageCondition="No detection",
            detections=[],
        )

    if not confs:
        return InferenceResult(
            status=AnalysisStatus.NO_DETECTION,
            detectionCount=0,
            imageCondition="No detection",
            detections=[],
        )

    class_names: dict[int, str] = getattr(model, "names", {}) or getattr(result, "names", {})
    detections: list[DetectionItem] = []

    for i in range(len(confs)):
        cls_id = int(cls_ids[i]) if i < len(cls_ids) else -1
        flat_label = class_names.get(cls_id, "")

        if not flat_label:
            logger.warning("Unknown class id %d from model.names", cls_id)
            continue

        crop, condition = _parse_flat_label(flat_label)
        if crop is None or condition is None:
            logger.warning(
                "Could not parse crop/condition from label '%s' (class_id=%d). "
                "Expected format: '<condition>_<crop_name>' (e.g. 'fresh_tomato').",
                flat_label,
                cls_id,
            )
            continue

        conf = round(float(confs[i]), 4)
        box_coords = xyxy_list[i] if i < len(xyxy_list) else [0.0, 0.0, 0.0, 0.0]
        bbox = BoundingBox(
            x1=round(float(box_coords[0]), 2),
            y1=round(float(box_coords[1]), 2),
            x2=round(float(box_coords[2]), 2),
            y2=round(float(box_coords[3]), 2),
        )

        detections.append(
            DetectionItem(
                crop=crop,
                condition=condition,
                confidence=conf,
                boundingBox=bbox,
            )
        )

    if not detections:
        return InferenceResult(
            status=AnalysisStatus.NO_DETECTION,
            detectionCount=0,
            imageCondition="No detection",
            detections=[],
        )

    # Sort all detections by confidence descending
    detections.sort(key=lambda d: d.confidence, reverse=True)

    # ── Multi-Object / Selected-Crop Decision Logic ───────────────────────────
    # If selected_crop is provided, inspect ALL detections and find the highest-confidence
    # detection matching the farmer's selected crop.
    status = AnalysisStatus.AI_ASSESSED
    if selected_crop and selected_crop.strip():
        norm_selected = selected_crop.strip().lower()
        matching_detections = [
            d for d in detections
            if d.crop and d.crop.strip().lower() == norm_selected
        ]
        if matching_detections:
            # Pick highest-confidence matching detection for primary assessment
            primary_detection = max(matching_detections, key=lambda d: d.confidence)
            status = AnalysisStatus.AI_ASSESSED
            logger.info(
                "Matched selected crop '%s': found %d detections, best confidence=%.4f (%s)",
                selected_crop,
                len(matching_detections),
                primary_detection.confidence,
                primary_detection.condition,
            )
        else:
            # No detection matches selected_crop → CROP MISMATCH
            primary_detection = detections[0]  # keep top detection for transparency
            status = AnalysisStatus.AI_CROP_MISMATCH
            logger.info(
                "Crop mismatch: selected '%s', but detected %d objects of types: %s",
                selected_crop,
                len(detections),
                list({d.crop for d in detections}),
            )
    else:
        primary_detection = detections[0]
        status = AnalysisStatus.AI_ASSESSED

    # Derive image-level condition across all detections
    has_fresh = any(d.condition == "Fresh" for d in detections)
    has_defective = any(d.condition == "Defective" for d in detections)

    if has_fresh and has_defective:
        image_condition = "Mixed"
    elif has_fresh:
        image_condition = "Fresh"
    elif has_defective:
        image_condition = "Defective"
    else:
        image_condition = "No detection"

    parsing_ms = (time.perf_counter() - t_parse_start) * 1000
    logger.info("[AI Quality] parsing=%.1fms", parsing_ms)

    # ── Render Annotated Image (draws ALL detected objects) ───────────────────
    annotated_id: Optional[str] = None
    annotated_url: Optional[str] = None
    t_ann_start = time.perf_counter()

    try:
        img = None
        if hasattr(result, "orig_img") and result.orig_img is not None:
            img = result.orig_img.copy()
        elif os.path.exists(image_path):
            import cv2
            img = cv2.imread(image_path)

        if img is not None and len(detections) > 0:
            import cv2
            import uuid
            from ultralytics.utils.plotting import Annotator
            from app import annotated_store

            try:
                annotator = Annotator(img, pil=True)
            except Exception:
                annotator = Annotator(img, pil=False)

            for d in detections:
                label_str = f"{d.crop} • {d.condition} • {d.confidence * 100:.1f}%"
                box = [d.boundingBox.x1, d.boundingBox.y1, d.boundingBox.x2, d.boundingBox.y2]
                color = (50, 160, 40) if d.condition == "Fresh" else (45, 45, 210)
                annotator.box_label(box, label=label_str, color=color)

            rendered = annotator.result()
            ok, enc = cv2.imencode(".jpg", rendered, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
            if ok:
                annotated_id = uuid.uuid4().hex[:16]
                annotated_store.save_annotated_image(annotated_id, enc.tobytes())
                annotated_url = f"/api/quality/annotated/{annotated_id}"
    except Exception as exc:
        logger.warning("[AI Quality] annotation failed: %s", exc)

    annotation_ms = (time.perf_counter() - t_ann_start) * 1000
    logger.info("[AI Quality] annotation=%.1fms", annotation_ms)

    return InferenceResult(
        status=status,
        crop=primary_detection.crop,
        cropConfidence=primary_detection.confidence,
        condition=primary_detection.condition,
        conditionConfidence=primary_detection.confidence,
        detectionCount=len(detections),
        imageCondition=image_condition,
        detections=detections,
        annotatedImageId=annotated_id,
        annotatedImageUrl=annotated_url,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _parse_flat_label(label: str) -> tuple[Optional[str], Optional[str]]:
    """
    Parse a VegQual flat detection label into (crop, condition).

    VegQual encodes both crop identity and quality as a single YOLO class name
    using an underscore-separated prefix:
        "<condition>_<crop_name>"
    where <condition> is the leading prefix ("fresh_" or "defected_") and
    <crop_name> is the remainder (may itself contain underscores for multi-word crops).

    The crop name is converted to display form: underscores → spaces, title-cased.

    Examples:
        "fresh_tomato"           → ("Tomato",        "Fresh")
        "defected_tomato"        → ("Tomato",        "Defective")
        "defected_bitter_gourd"  → ("Bitter Gourd",  "Defective")
        "fresh_pointed_gourd"    → ("Pointed Gourd", "Fresh")
        "tomato"                 → (None, None)  — no recognised prefix
        ""                       → (None, None)  — empty

    Returns:
        (crop_name, condition) or (None, None) if the label is unrecognised.
    """
    normalised = label.strip().lower()

    condition: Optional[str] = None
    remainder: str = ""

    for prefix, cond in _PREFIX_TO_CONDITION.items():
        if normalised.startswith(prefix):
            condition = cond
            remainder = normalised[len(prefix):]  # everything after the prefix
            break

    if condition is None:
        logger.warning(
            "Label '%s' does not start with a known condition prefix (%s). "
            "Check data.yaml class names.",
            label,
            ", ".join(sorted(_PREFIX_TO_CONDITION.keys())),
        )
        return None, None

    if not remainder:
        logger.warning("Label '%s' has a condition prefix but no crop name.", label)
        return None, None

    # Convert underscore-separated tokens to title-cased display name.
    # e.g. "bitter_gourd" → "Bitter Gourd"
    crop = " ".join(word.capitalize() for word in remainder.split("_"))

    return crop, condition
