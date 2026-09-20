"""
main.py — KrishiShetra AI Quality Service (FastAPI application).

Endpoints:
    GET  /api/quality/health   — service + model status
    POST /api/quality/analyze  — multipart image → quality JSON

Model is loaded once at startup via FastAPI lifespan.
All image pre-flight checks happen in image_validation.py before YOLO is called.
Temporary image files are deleted immediately after inference.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import image_validation, model_loader, inference, preprocessing, annotated_store
from app.schemas import AnalysisStatus, HealthResponse, InferenceResult, QualityResponse

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Config from environment
# ─────────────────────────────────────────────────────────────────────────────

MAX_UPLOAD_MB: int  = int(os.getenv("MAX_UPLOAD_MB", "10"))
MAX_UPLOAD_BYTES: int = MAX_UPLOAD_MB * 1024 * 1024
MIN_IMAGE_DIM: int  = int(os.getenv("MIN_IMAGE_DIM", "64"))
TEMP_DIR: Optional[str] = os.getenv("TEMP_DIR", "tmp") or None


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan — load model once at startup
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting KrishiShetra AI Quality Service ...")
    model_loader.load_model()
    if model_loader.is_model_loaded():
        logger.info("Model ready. Supported crops: %s", model_loader.get_supported_crops())
    else:
        logger.warning(
            "No trained model loaded. Service is running but /analyze will return "
            "MODEL_NOT_LOADED until a trained model is placed at MODEL_PATH."
        )
    yield
    logger.info("Service shutting down.")


# ─────────────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="KrishiShetra AI Crop Quality Service",
    description=(
        "Development/training-phase AI microservice for multi-crop visual quality assessment. "
        "Uses YOLOv8 object detection trained on VegQual dataset. "
        "Not a laboratory or Agmark certification service."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow KrishiShetra frontend origins.
# The Node.js backend serves the frontend on port 5000.
# Farmers may also open HTML pages directly (file://) during development.
# Listing specific origins here; add production domain when deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:3000",   # common alt dev port
        "http://127.0.0.1:3000",
        "null",                    # file:// origin is sent as "null" by browsers
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/quality/health
# ─────────────────────────────────────────────────────────────────────────────

@app.get(
    "/api/quality/health",
    response_model=HealthResponse,
    summary="Service and model health check",
)
async def health() -> HealthResponse:
    """
    Returns the current service status and model load state.

    Call this first to confirm whether the trained model is available.
    `supportedCrops` and `supportedClassCount` will be empty/0 until a model is loaded.
    """
    loaded = model_loader.is_model_loaded()
    return HealthResponse(
        modelLoaded=loaded,
        modelVersion=model_loader.get_model_version(),
        modelPath=os.getenv("MODEL_PATH", "outputs/vegqual-20ep/weights/best.pt"),
        supportedClassCount=model_loader.get_supported_class_count(),
        supportedCrops=model_loader.get_supported_crops(),
        status="MODEL_READY" if loaded else AnalysisStatus.MODEL_NOT_LOADED,
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/quality/analyze
# ─────────────────────────────────────────────────────────────────────────────

@app.post(
    "/api/quality/analyze",
    response_model=QualityResponse,
    summary="Analyze a crop image for quality assessment",
    responses={
        413: {"description": "Image file too large"},
        415: {"description": "Unsupported image format"},
        422: {"description": "Validation error (corrupt, too small, etc.)"},
    },
)
async def analyze(
    file: UploadFile = File(..., description="Crop image — JPG, JPEG, PNG, or WebP"),
    selected_crop: Optional[str] = Form(None, description="Farmer selected crop for mismatch validation"),
) -> QualityResponse:
    """
    Accept a crop image and return a quality assessment.

    The response always includes a `status` field:
    - `AI_ASSESSED`      — model ran, at least one detection found
    - `AI_CROP_MISMATCH` — model ran, but detected crop does not match selected crop
    - `NO_DETECTION`     — model ran, nothing detected above threshold
    - `MODEL_NOT_LOADED` — model weights are missing; train first
    - `VALIDATION_ERROR` — image failed pre-flight checks

    All prediction fields (`crop`, `condition`, etc.) are nullable.
    """
    import time
    t0_endpoint = time.perf_counter()
    model_version = model_loader.get_model_version()

    # ── 1. Read upload bytes ──────────────────────────────────────────────────
    t_decode_start = time.perf_counter()
    try:
        file_bytes = await file.read()
        logger.info("[AI Quality] image bytes=%d", len(file_bytes))
    except Exception as exc:
        logger.error("Failed to read uploaded file: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not read uploaded file.",
        )

    # ── 2. Pre-flight validation ──────────────────────────────────────────────
    validation = image_validation.validate_image(
        file_bytes=file_bytes,
        filename=file.filename or "upload",
        content_type=file.content_type,
        max_upload_bytes=MAX_UPLOAD_BYTES,
        min_dim=MIN_IMAGE_DIM,
    )

    image_decode_ms = (time.perf_counter() - t_decode_start) * 1000
    logger.info("[AI Quality] image_decode=%.1fms", image_decode_ms)

    if validation.width and validation.height:
        logger.info("[AI Quality] decoded shape=%dx%d", validation.height, validation.width)

    if not validation.ok:
        # Map specific error codes to HTTP status codes
        if validation.error_code == "FILE_TOO_LARGE":
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=validation.message,
            )
        if validation.error_code in ("FORMAT_NOT_SUPPORTED", "MIME_NOT_SUPPORTED"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=validation.message,
            )
        # All other validation failures → 422
        return QualityResponse(
            success=False,
            status=AnalysisStatus.VALIDATION_ERROR,
            modelVersion=model_version,
            crop=None,
            confidence=None,
            cropConfidence=None,
            condition=None,
            conditionConfidence=None,
            detectionCount=0,
            imageCondition=None,
            detections=[],
            selectedCrop=selected_crop,
            isCropMatch=None,
        )

    # ── 3. Write to temp file (Ultralytics accepts file paths) ────────────────
    suffix = preprocessing.get_image_suffix(file.filename or "upload.jpg")
    temp_path = preprocessing.save_to_temp(
        image_bytes=file_bytes,
        suffix=suffix,
        temp_dir=TEMP_DIR,
    )

    # ── 4. Run inference ──────────────────────────────────────────────────────
    try:
        result: InferenceResult = inference.run_inference(
            image_path=temp_path,
            model=model_loader.get_model(),
            selected_crop=selected_crop,
        )
    finally:
        # Always delete the temp file — even if inference raises
        preprocessing.delete_temp(temp_path)

    # ── 5. Return structured response with crop validation ────────────────────
    t_resp_start = time.perf_counter()
    resp = result.to_response(model_version=model_version)
    if selected_crop:
        resp.selectedCrop = selected_crop
        if result.status == AnalysisStatus.AI_CROP_MISMATCH:
            resp.success = False
            resp.status = AnalysisStatus.AI_CROP_MISMATCH
            resp.isCropMatch = False
        elif resp.crop and selected_crop.strip().lower() == resp.crop.strip().lower():
            resp.isCropMatch = True
            resp.success = True
            resp.status = AnalysisStatus.AI_ASSESSED
    response_ms = (time.perf_counter() - t_resp_start) * 1000
    total_ms = (time.perf_counter() - t0_endpoint) * 1000
    logger.info("[AI Quality] response=%.1fms", response_ms)
    logger.info("[AI Quality] total=%.1fms", total_ms)
    return resp


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/quality/annotated/{image_id}
# ─────────────────────────────────────────────────────────────────────────────

@app.get(
    "/api/quality/annotated/{image_id}",
    summary="Retrieve an annotated detection image by ID",
    responses={
        200: {
            "content": {"image/jpeg": {}},
            "description": "Annotated JPEG image with bounding boxes and condition labels",
        },
        404: {"description": "Annotated image not found or expired"},
    },
)
async def get_annotated_image(image_id: str):
    """
    Return the rendered JPEG detection image containing bounding boxes and labels.
    Accepts image_id with or without .jpg extension.
    """
    image_bytes = annotated_store.get_annotated_image(image_id)
    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotated image not found or expired.",
        )
    return Response(
        content=image_bytes,
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=3600"},
    )


# ─────────────────────────────────────────────────────────────────────────────
# Entry point for direct execution (uvicorn preferred in production)
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
