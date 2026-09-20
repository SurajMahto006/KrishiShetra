"""
schemas.py — Pydantic v2 request/response models.

All prediction fields on QualityResponse are Optional (nullable).
The API never returns a 500 due to a missing field; it returns null instead.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Status constants — kept here so inference.py and main.py share the same values
# ─────────────────────────────────────────────────────────────────────────────

class AnalysisStatus:
    AI_ASSESSED      = "AI_ASSESSED"       # model ran, detection found
    AI_CROP_MISMATCH = "AI_CROP_MISMATCH"  # detection found, but does not match selected crop
    NO_DETECTION     = "NO_DETECTION"      # model ran, nothing detected above threshold
    MODEL_NOT_LOADED = "MODEL_NOT_LOADED"  # weights file absent or not yet loaded
    VALIDATION_ERROR = "VALIDATION_ERROR"  # image failed pre-flight checks


# ─────────────────────────────────────────────────────────────────────────────
# Health endpoint response
# ─────────────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    service: str = Field(
        default="KrishiShetra AI Quality Service",
        description="Service identifier",
    )
    modelLoaded: bool = Field(
        description="True when a trained .pt model is loaded and ready"
    )
    modelVersion: Optional[str] = Field(
        default=None,
        description="Version string from MODEL_VERSION env var",
    )
    modelPath: Optional[str] = Field(
        default=None,
        description="Resolved model weights path (from MODEL_PATH env var)",
    )
    supportedClassCount: int = Field(
        default=0,
        description="Total number of detection classes in the loaded model (0 when not loaded)",
    )
    supportedCrops: list[str] = Field(
        default_factory=list,
        description="Unique crop names derived from the loaded model's class list",
    )
    status: str = Field(
        description="MODEL_READY or MODEL_NOT_LOADED",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Analysis endpoint response
# ─────────────────────────────────────────────────────────────────────────────

class BoundingBox(BaseModel):
    x1: float = Field(description="Bounding box top-left X coordinate in pixels")
    y1: float = Field(description="Bounding box top-left Y coordinate in pixels")
    x2: float = Field(description="Bounding box bottom-right X coordinate in pixels")
    y2: float = Field(description="Bounding box bottom-right Y coordinate in pixels")


class DetectionItem(BaseModel):
    crop: str = Field(description="Detected crop name, e.g. 'Tomato'")
    condition: str = Field(description="'Fresh' or 'Defective'")
    confidence: float = Field(ge=0.0, le=1.0, description="Detection confidence score (0–1)")
    boundingBox: BoundingBox = Field(description="Bounding box coordinates")


class QualityResponse(BaseModel):
    success: bool = Field(
        description="False when a validation error or unrecoverable fault occurred"
    )
    status: str = Field(
        description="One of: AI_ASSESSED, NO_DETECTION, MODEL_NOT_LOADED, VALIDATION_ERROR",
    )
    crop: Optional[str] = Field(
        default=None,
        description="Top-confidence crop name, e.g. 'Tomato'. Null when no detection or no model.",
    )
    condition: Optional[str] = Field(
        default=None,
        description="Top-confidence condition ('Fresh' or 'Defective'). Null when unavailable.",
    )
    confidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Detection confidence for the top bounding box (0–1). Null when unavailable.",
    )
    # Legacy aliases kept for backward compatibility — both equal the single YOLO confidence score.
    cropConfidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Alias for confidence. YOLO encodes crop+condition in one class.",
    )
    conditionConfidence: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description=(
            "Same value as confidence — YOLO encodes crop+condition in one class, "
            "so both share the same detection confidence score."
        ),
    )
    assessmentType: str = Field(
        default="visual_condition_detection",
        description="Type of assessment performed by the model.",
    )
    modelVersion: Optional[str] = Field(
        default=None,
        description="Model version string at time of inference",
    )
    detectionCount: int = Field(
        default=0,
        description="Total number of valid objects detected in the image",
    )
    imageCondition: Optional[str] = Field(
        default=None,
        description="Derived image-level condition: 'No detection', 'Fresh', 'Defective', or 'Mixed'",
    )
    detections: list[DetectionItem] = Field(
        default_factory=list,
        description="List of all detected objects with crop, condition, confidence, and bounding box",
    )
    annotatedImageId: Optional[str] = Field(
        default=None,
        description="Unique identifier for the annotated detection image, if generated.",
    )
    annotatedImageUrl: Optional[str] = Field(
        default=None,
        description="Relative URL to retrieve the annotated detection image (e.g. /api/quality/annotated/{id}).",
    )
    selectedCrop: Optional[str] = Field(
        default=None,
        description="The farmer-selected crop passed for validation, if provided.",
    )
    isCropMatch: Optional[bool] = Field(
        default=None,
        description="True if detected crop matches selectedCrop, False if mismatch, None if unverified.",
    )


# ─────────────────────────────────────────────────────────────────────────────
# Internal dataclass returned by inference.py
# (not exposed directly as an API response)
# ─────────────────────────────────────────────────────────────────────────────

from dataclasses import dataclass, field


@dataclass
class InferenceResult:
    status: str                          # AnalysisStatus constant
    crop: Optional[str] = None
    cropConfidence: Optional[float] = None
    condition: Optional[str] = None
    conditionConfidence: Optional[float] = None
    detectionCount: int = 0
    imageCondition: Optional[str] = None
    detections: list[DetectionItem] = field(default_factory=list)
    annotatedImageId: Optional[str] = None
    annotatedImageUrl: Optional[str] = None

    def to_response(self, model_version: Optional[str]) -> QualityResponse:
        return QualityResponse(
            success=(self.status == AnalysisStatus.AI_ASSESSED),
            status=self.status,
            crop=self.crop,
            condition=self.condition,
            confidence=self.cropConfidence,
            cropConfidence=self.cropConfidence,
            conditionConfidence=self.conditionConfidence,
            assessmentType="visual_condition_detection",
            modelVersion=model_version,
            detectionCount=self.detectionCount,
            imageCondition=self.imageCondition,
            detections=self.detections,
            annotatedImageId=self.annotatedImageId,
            annotatedImageUrl=self.annotatedImageUrl,
        )
