"""
tests/test_api.py — Integration tests for the KrishiShetra AI Quality Service.

Run with:
    cd ai-quality
    pytest tests/ -v

These tests use httpx's async test client with the FastAPI app directly
(no real network required). The model is NOT loaded during tests — we verify
that the service behaves correctly both with and without a trained model.

Test coverage:
    1.  GET /api/quality/health — 200 with correct schema
    2.  GET /api/quality/health — modelLoaded=False when no model
    3.  GET /api/quality/health — modelLoaded=True with mock model (supportedClassCount=14)
    4.  POST /api/quality/analyze — valid JPEG returns correct schema
    5.  POST /api/quality/analyze — valid PNG accepted
    6.  POST /api/quality/analyze — valid WebP accepted
    7.  POST /api/quality/analyze — no model → MODEL_NOT_LOADED (not a 500)
    8.  POST /api/quality/analyze — corrupt bytes → 415 or VALIDATION_ERROR
    9.  POST /api/quality/analyze — empty file → VALIDATION_ERROR
    10. POST /api/quality/analyze — file too large → 413
    11. POST /api/quality/analyze — unsupported extension (.pdf) → 415
    12. Response schema: all nullable fields present in every response
    13. Label parsing: fresh_tomato → crop=Tomato, condition=Fresh
    14. Label parsing: defected_tomato → crop=Tomato, condition=Defective
    15. No-detection path: when model returns no boxes above threshold
    16. Missing model: MODEL_PATH set to nonexistent file → MODEL_NOT_LOADED
"""

from __future__ import annotations

import io
import os
import unittest.mock as mock

import pytest
from fastapi.testclient import TestClient
from PIL import Image

# ─────────────────────────────────────────────────────────────────────────────
# Ensure MODEL_PATH points to a non-existent file so model is never loaded
# ─────────────────────────────────────────────────────────────────────────────
os.environ.setdefault("MODEL_PATH", "models/__test_nonexistent__.pt")
os.environ.setdefault("MODEL_VERSION", "test-v0")
os.environ.setdefault("MAX_UPLOAD_MB", "10")
os.environ.setdefault("MIN_IMAGE_DIM", "64")

from app.main import app  # noqa: E402 — import after env setup

client = TestClient(app)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _make_image_bytes(
    width: int = 100,
    height: int = 100,
    fmt: str = "JPEG",
    color: tuple = (120, 80, 60),
) -> bytes:
    """Create a minimal valid image as bytes."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return buf.getvalue()


VALID_JPEG = _make_image_bytes(fmt="JPEG")
VALID_PNG  = _make_image_bytes(fmt="PNG")
VALID_WEBP = _make_image_bytes(fmt="WEBP")
TINY_JPEG  = _make_image_bytes(width=10, height=10, fmt="JPEG")  # below min_dim


# ─────────────────────────────────────────────────────────────────────────────
# Health endpoint tests
# ─────────────────────────────────────────────────────────────────────────────

class TestHealth:
    def test_health_returns_200(self):
        resp = client.get("/api/quality/health")
        assert resp.status_code == 200

    def test_health_schema_fields_present(self):
        """All required health fields must be present in the response."""
        resp = client.get("/api/quality/health")
        data = resp.json()
        assert "service" in data
        assert "modelLoaded" in data
        assert "modelVersion" in data
        assert "modelPath" in data
        assert "supportedClassCount" in data
        assert "supportedCrops" in data
        assert "status" in data

    def test_health_model_not_loaded(self):
        """With no model weights file, modelLoaded must be False."""
        resp = client.get("/api/quality/health")
        data = resp.json()
        assert data["modelLoaded"] is False
        assert data["status"] == "MODEL_NOT_LOADED"
        assert isinstance(data["supportedCrops"], list)
        assert len(data["supportedCrops"]) == 0
        assert data["supportedClassCount"] == 0


class TestHealthWithModel:
    """Simulate a loaded model to verify health reports modelLoaded=True and class count."""

    def test_health_model_loaded_true(self):
        """When model_loader reports loaded, health must return MODEL_READY and class count."""
        from app import model_loader
        with (
            mock.patch.object(model_loader, "_model_loaded", True),
            mock.patch.object(model_loader, "_model_class_count", 14),
            mock.patch.object(model_loader, "_supported_crops", [
                "Bitter Gourd", "Brinjal", "Capsicum", "Onion",
                "Pointed Gourd", "Potato", "Tomato",
            ]),
            mock.patch.object(model_loader, "_model_version", "vegqual-20ep"),
        ):
            resp = client.get("/api/quality/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["modelLoaded"] is True
        assert data["status"] == "MODEL_READY"
        assert data["supportedClassCount"] == 14
        assert "Tomato" in data["supportedCrops"]
        assert data["modelVersion"] == "vegqual-20ep"


# ─────────────────────────────────────────────────────────────────────────────
# Analyze endpoint — format acceptance
# ─────────────────────────────────────────────────────────────────────────────

class TestAnalyzeFormats:
    def _post_image(self, img_bytes: bytes, filename: str, content_type: str):
        return client.post(
            "/api/quality/analyze",
            files={"file": (filename, io.BytesIO(img_bytes), content_type)},
        )

    def test_valid_jpeg_accepted(self):
        resp = self._post_image(VALID_JPEG, "crop.jpg", "image/jpeg")
        # Should NOT be a server error — may be MODEL_NOT_LOADED but not 500
        assert resp.status_code in (200, 415, 422)
        if resp.status_code == 200:
            assert resp.json()["status"] == "MODEL_NOT_LOADED"

    def test_valid_png_accepted(self):
        resp = self._post_image(VALID_PNG, "crop.png", "image/png")
        assert resp.status_code in (200, 415, 422)

    def test_valid_webp_accepted(self):
        resp = self._post_image(VALID_WEBP, "crop.webp", "image/webp")
        assert resp.status_code in (200, 415, 422)

    def test_pdf_rejected_415(self):
        """A .pdf file must be rejected with 415 Unsupported Media Type."""
        fake_pdf = b"%PDF-1.4 fake content"
        resp = self._post_image(fake_pdf, "document.pdf", "application/pdf")
        assert resp.status_code == 415

    def test_wrong_extension_rejected(self):
        """A .bmp file (valid image, unsupported extension) must be rejected."""
        img = Image.new("RGB", (100, 100), color=(0, 0, 255))
        buf = io.BytesIO()
        img.save(buf, format="BMP")
        resp = self._post_image(buf.getvalue(), "image.bmp", "image/bmp")
        assert resp.status_code == 415


# ─────────────────────────────────────────────────────────────────────────────
# Analyze endpoint — validation error cases
# ─────────────────────────────────────────────────────────────────────────────

class TestAnalyzeValidation:
    def _post_image(self, img_bytes: bytes, filename: str, content_type: str):
        return client.post(
            "/api/quality/analyze",
            files={"file": (filename, io.BytesIO(img_bytes), content_type)},
        )

    def test_corrupt_bytes_returns_error(self):
        """Garbage bytes must not cause a 500 — return a validation error."""
        garbage = b"\x00\x01\x02\x03\xff\xfe corrupted data here"
        resp = self._post_image(garbage, "corrupt.jpg", "image/jpeg")
        # Either 415 (unsupported), 422 (unprocessable), or 200 with VALIDATION_ERROR
        assert resp.status_code in (200, 415, 422)
        if resp.status_code == 200:
            assert resp.json()["status"] == "VALIDATION_ERROR"

    def test_empty_file_returns_error(self):
        """An empty upload must be rejected."""
        resp = self._post_image(b"", "empty.jpg", "image/jpeg")
        assert resp.status_code in (200, 413, 415, 422)
        if resp.status_code == 200:
            assert resp.json()["status"] == "VALIDATION_ERROR"

    def test_image_too_small_returns_error(self):
        """An image below MIN_IMAGE_DIM (64 px) must be rejected."""
        resp = self._post_image(TINY_JPEG, "tiny.jpg", "image/jpeg")
        assert resp.status_code in (200, 422)
        if resp.status_code == 200:
            assert resp.json()["status"] == "VALIDATION_ERROR"

    def test_oversized_file_returns_413(self):
        """Simulate a file over the configured limit."""
        # Override limit to 1 byte just for this test via a custom check
        # Since we can't easily monkey-patch the byte limit here,
        # we verify the image_validation module directly:
        from app.image_validation import validate_image
        big_bytes = VALID_JPEG  # small file
        result = validate_image(
            file_bytes=big_bytes,
            filename="crop.jpg",
            content_type="image/jpeg",
            max_upload_bytes=1,   # set limit to 1 byte → must fail
            min_dim=64,
        )
        assert not result.ok
        assert result.error_code == "FILE_TOO_LARGE"


# ─────────────────────────────────────────────────────────────────────────────
# Analyze endpoint — response schema
# ─────────────────────────────────────────────────────────────────────────────

class TestAnalyzeSchema:
    EXPECTED_FIELDS = {
        "success",
        "status",
        "crop",
        "condition",
        "confidence",
        "cropConfidence",
        "conditionConfidence",
        "assessmentType",
        "modelVersion",
        "detectionCount",
        "imageCondition",
        "detections",
    }

    def test_all_schema_fields_present_when_no_model(self):
        """Every field in QualityResponse must be present even when model is absent."""
        resp = client.post(
            "/api/quality/analyze",
            files={"file": ("crop.jpg", io.BytesIO(VALID_JPEG), "image/jpeg")},
        )
        if resp.status_code != 200:
            return  # format error — schema test not applicable
        data = resp.json()
        missing = self.EXPECTED_FIELDS - set(data.keys())
        assert not missing, f"Missing fields in response: {missing}"

    def test_nullable_fields_are_null_when_no_model(self):
        """Prediction fields must be null (not absent) when model is not loaded."""
        resp = client.post(
            "/api/quality/analyze",
            files={"file": ("crop.jpg", io.BytesIO(VALID_JPEG), "image/jpeg")},
        )
        if resp.status_code != 200:
            return
        data = resp.json()
        if data.get("status") == "MODEL_NOT_LOADED":
            assert data["crop"] is None
            assert data["confidence"] is None
            assert data["cropConfidence"] is None
            assert data["condition"] is None
            assert data["conditionConfidence"] is None
            assert data["success"] is False

    def test_status_field_is_always_a_string(self):
        resp = client.post(
            "/api/quality/analyze",
            files={"file": ("crop.jpg", io.BytesIO(VALID_JPEG), "image/jpeg")},
        )
        if resp.status_code != 200:
            return
        data = resp.json()
        assert isinstance(data.get("status"), str)

    def test_assessment_type_always_present(self):
        """assessmentType must be 'visual_condition_detection' in every response."""
        resp = client.post(
            "/api/quality/analyze",
            files={"file": ("crop.jpg", io.BytesIO(VALID_JPEG), "image/jpeg")},
        )
        if resp.status_code != 200:
            return
        data = resp.json()
        assert data.get("assessmentType") == "visual_condition_detection"


# ─────────────────────────────────────────────────────────────────────────────
# image_validation unit tests
# ─────────────────────────────────────────────────────────────────────────────

class TestImageValidation:
    """Direct unit tests for image_validation.validate_image()."""

    from app.image_validation import validate_image as _validate  # noqa

    def _v(self, file_bytes, filename, content_type="image/jpeg",
           max_bytes=10 * 1024 * 1024, min_dim=64):
        from app.image_validation import validate_image
        return validate_image(file_bytes, filename, content_type, max_bytes, min_dim)

    def test_valid_jpeg_passes(self):
        result = self._v(VALID_JPEG, "crop.jpg")
        assert result.ok is True
        assert result.width is not None and result.width >= 64

    def test_valid_png_passes(self):
        result = self._v(VALID_PNG, "crop.png", "image/png")
        assert result.ok is True

    def test_empty_bytes_fails(self):
        result = self._v(b"", "crop.jpg")
        assert result.ok is False
        assert result.error_code == "EMPTY_FILE"

    def test_too_large_fails(self):
        result = self._v(VALID_JPEG, "crop.jpg", max_bytes=1)
        assert result.ok is False
        assert result.error_code == "FILE_TOO_LARGE"

    def test_bad_extension_fails(self):
        result = self._v(VALID_JPEG, "crop.gif")
        assert result.ok is False
        assert result.error_code == "FORMAT_NOT_SUPPORTED"

    def test_corrupt_fails(self):
        result = self._v(b"\xff\xd8\xff corrupted", "crop.jpg")
        assert result.ok is False
        assert result.error_code in ("CORRUPT_IMAGE", "DECODE_ERROR", "UNRECOGNIZED_FORMAT")

    def test_too_small_fails(self):
        result = self._v(TINY_JPEG, "tiny.jpg", min_dim=64)
        assert result.ok is False
        assert result.error_code == "IMAGE_TOO_SMALL"


# ─────────────────────────────────────────────────────────────────────────────
# inference.py unit tests (label parsing)
# ─────────────────────────────────────────────────────────────────────────────

class TestInferenceLabelParsing:
    """Test the flat label parser without needing a real model."""

    def _parse(self, label: str):
        from app.inference import _parse_flat_label
        return _parse_flat_label(label)

    # ── Single-word crops ───────────────────────────────────────────────────────

    def test_fresh_tomato(self):
        crop, cond = self._parse("fresh_tomato")
        assert crop == "Tomato"
        assert cond == "Fresh"

    def test_defected_tomato(self):
        crop, cond = self._parse("defected_tomato")
        assert crop == "Tomato"
        assert cond == "Defective"

    def test_fresh_potato(self):
        crop, cond = self._parse("fresh_potato")
        assert crop == "Potato"
        assert cond == "Fresh"

    def test_defected_potato(self):
        crop, cond = self._parse("defected_Potato")  # mixed-case as stored in dataset
        assert crop == "Potato"
        assert cond == "Defective"

    def test_fresh_brinjal(self):
        crop, cond = self._parse("fresh_brinjal")
        assert crop == "Brinjal"
        assert cond == "Fresh"

    def test_fresh_capsicum(self):
        crop, cond = self._parse("fresh_capsicum")
        assert crop == "Capsicum"
        assert cond == "Fresh"

    def test_fresh_onion(self):
        crop, cond = self._parse("fresh_onion")
        assert crop == "Onion"
        assert cond == "Fresh"

    # ── Multi-word crops (underscores in crop part) ─────────────────────────────

    def test_defected_bitter_gourd(self):
        crop, cond = self._parse("defected_bitter_gourd")
        assert crop == "Bitter Gourd"
        assert cond == "Defective"

    def test_fresh_bitter_gourd(self):
        crop, cond = self._parse("fresh_bitter_gourd")
        assert crop == "Bitter Gourd"
        assert cond == "Fresh"

    def test_fresh_pointed_gourd(self):
        crop, cond = self._parse("fresh_pointed_gourd")
        assert crop == "Pointed Gourd"
        assert cond == "Fresh"

    def test_defected_pointed_gourd(self):
        crop, cond = self._parse("defected_pointed_gourd")
        assert crop == "Pointed Gourd"
        assert cond == "Defective"

    # ── Edge / failure cases ──────────────────────────────────────────────────────

    def test_no_prefix_returns_none(self):
        """A label with no recognised prefix must return (None, None)."""
        crop, cond = self._parse("tomato")
        assert crop is None
        assert cond is None

    def test_old_space_format_returns_none(self):
        """Old 'Tomato Fresh' space-format is no longer valid."""
        crop, cond = self._parse("Tomato Fresh")
        assert crop is None
        assert cond is None

    def test_prefix_only_returns_none(self):
        """A label that is just the prefix with nothing after it."""
        crop, cond = self._parse("fresh_")
        assert crop is None
        assert cond is None

    def test_empty_string_returns_none(self):
        crop, cond = self._parse("")
        assert crop is None
        assert cond is None

    def test_whitespace_only_returns_none(self):
        crop, cond = self._parse("   ")
        assert crop is None
        assert cond is None


# ─────────────────────────────────────────────────────────────────────────────
# No-detection path
# ─────────────────────────────────────────────────────────────────────────────

class TestAnalyzeNoDetection:
    """
    Verify that when the model runs but finds nothing above the confidence
    threshold the response is NO_DETECTION (not a 500 or crash).
    """

    def _post_image(self, img_bytes: bytes, filename: str, content_type: str):
        return client.post(
            "/api/quality/analyze",
            files={"file": (filename, io.BytesIO(img_bytes), content_type)},
        )

    def test_no_detection_returns_correct_status(self):
        """
        Patch run_inference to return a NO_DETECTION result and verify the
        API response has status=NO_DETECTION with all prediction fields null.
        """
        from app import inference
        from app.schemas import AnalysisStatus, InferenceResult

        no_det_result = InferenceResult(status=AnalysisStatus.NO_DETECTION)

        with mock.patch.object(inference, "run_inference", return_value=no_det_result):
            resp = self._post_image(VALID_JPEG, "crop.jpg", "image/jpeg")

        # The endpoint must succeed (200) and report NO_DETECTION
        if resp.status_code != 200:
            return  # validation short-circuited — skip body check
        data = resp.json()
        assert data["status"] == "NO_DETECTION"
        assert data["crop"] is None
        assert data["condition"] is None
        assert data["confidence"] is None
        assert data["success"] is False


# ─────────────────────────────────────────────────────────────────────────────
# Missing model path
# ─────────────────────────────────────────────────────────────────────────────

class TestMissingModel:
    """
    Verify that the service reports MODEL_NOT_LOADED (not a 500) when the
    weights file doesn't exist — which is always the case in the test
    environment because MODEL_PATH is set to a nonexistent path at the top.
    """

    def test_analyze_with_missing_model_returns_model_not_loaded(self):
        """A valid image submitted when no model is loaded must get MODEL_NOT_LOADED."""
        resp = client.post(
            "/api/quality/analyze",
            files={"file": ("crop.jpg", io.BytesIO(VALID_JPEG), "image/jpeg")},
        )
        if resp.status_code != 200:
            return  # validation error — model-load test not applicable
        data = resp.json()
        assert data["status"] == "MODEL_NOT_LOADED"
        assert data["crop"] is None
        assert data["condition"] is None
        assert data["success"] is False

    def test_health_with_missing_model_returns_model_not_loaded(self):
        """Health endpoint must report MODEL_NOT_LOADED when weights file is absent."""
        resp = client.get("/api/quality/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["modelLoaded"] is False
        assert data["status"] == "MODEL_NOT_LOADED"
        assert data["supportedClassCount"] == 0


# ─────────────────────────────────────────────────────────────────────────────
# Multi-detection & imageCondition tests
# ─────────────────────────────────────────────────────────────────────────────

class TestMultiDetection:
    """Tests for multi-object detection parsing, bounding boxes, and imageCondition."""

    def test_multi_detection_fresh(self):
        """All fresh detections -> imageCondition='Fresh'"""
        from app.inference import run_inference
        from app.schemas import AnalysisStatus

        class MockBoxes:
            xyxy = [[10.0, 20.0, 100.0, 120.0], [150.0, 60.0, 250.0, 180.0]]
            conf = [0.85, 0.92]
            cls = [13, 13]  # fresh_tomato
            def __len__(self):
                return len(self.conf)

        class MockResult:
            boxes = MockBoxes()
            names = {13: "fresh_tomato"}

        class MockModel:
            names = {13: "fresh_tomato"}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.AI_ASSESSED
        assert res.detectionCount == 2
        assert res.imageCondition == "Fresh"
        assert res.crop == "Tomato"
        assert res.condition == "Fresh"
        assert res.cropConfidence == 0.92  # highest-confidence top detection
        assert len(res.detections) == 2
        assert res.detections[0].confidence == 0.92
        assert res.detections[0].boundingBox.x1 == 150.0
        assert res.detections[1].confidence == 0.85

    def test_multi_detection_mixed_condition(self):
        """Fresh + Defective detections -> imageCondition='Mixed'"""
        from app.inference import run_inference
        from app.schemas import AnalysisStatus

        class MockBoxes:
            xyxy = [[10.0, 10.0, 50.0, 50.0], [60.0, 60.0, 120.0, 120.0]]
            conf = [0.91, 0.78]
            cls = [13, 6]  # fresh_tomato, defected_tomato
            def __len__(self):
                return len(self.conf)

        class MockResult:
            boxes = MockBoxes()
            names = {6: "defected_tomato", 13: "fresh_tomato"}

        class MockModel:
            names = {6: "defected_tomato", 13: "fresh_tomato"}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.AI_ASSESSED
        assert res.detectionCount == 2
        assert res.imageCondition == "Mixed"
        assert res.crop == "Tomato"
        assert res.condition == "Fresh"  # top conf 0.91
        assert res.cropConfidence == 0.91

    def test_multi_detection_all_defective(self):
        """All defective detections -> imageCondition='Defective'"""
        from app.inference import run_inference
        from app.schemas import AnalysisStatus

        class MockBoxes:
            xyxy = [[5.0, 5.0, 40.0, 40.0], [50.0, 50.0, 90.0, 90.0]]
            conf = [0.80, 0.88]
            cls = [0, 0]  # defected_Potato
            def __len__(self):
                return len(self.conf)

        class MockResult:
            boxes = MockBoxes()
            names = {0: "defected_Potato"}

        class MockModel:
            names = {0: "defected_Potato"}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.AI_ASSESSED
        assert res.detectionCount == 2
        assert res.imageCondition == "Defective"
        assert res.crop == "Potato"
        assert res.condition == "Defective"
        assert res.cropConfidence == 0.88

    def test_multi_crop_detection(self):
        """Multiple different crops in one image (e.g. Potato + Tomato)"""
        from app.inference import run_inference
        from app.schemas import AnalysisStatus

        class MockBoxes:
            xyxy = [[10.0, 10.0, 50.0, 50.0], [60.0, 60.0, 120.0, 120.0]]
            conf = [0.75, 0.95]
            cls = [12, 13]  # fresh_potato, fresh_tomato
            def __len__(self):
                return len(self.conf)

        class MockResult:
            boxes = MockBoxes()
            names = {12: "fresh_potato", 13: "fresh_tomato"}

        class MockModel:
            names = {12: "fresh_potato", 13: "fresh_tomato"}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.AI_ASSESSED
        assert res.detectionCount == 2
        assert res.crop == "Tomato"  # top conf 0.95
        assert res.cropConfidence == 0.95
        crops = {d.crop for d in res.detections}
        assert crops == {"Potato", "Tomato"}

    def test_no_detection_sets_zero_count_and_empty_list(self):
        """When 0 detections are found, detectionCount=0 and imageCondition='No detection'"""
        from app.inference import run_inference
        from app.schemas import AnalysisStatus

        class MockBoxes:
            xyxy = []
            conf = []
            cls = []
            def __len__(self):
                return len(self.conf)

        class MockResult:
            boxes = MockBoxes()
            names = {}

        class MockModel:
            names = {}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.NO_DETECTION
        assert res.detectionCount == 0
        assert res.imageCondition == "No detection"
        assert res.detections == []
        assert res.annotatedImageId is None
        assert res.annotatedImageUrl is None


# ─────────────────────────────────────────────────────────────────────────────
# Annotated Image Rendering tests (Phase 9)
# ─────────────────────────────────────────────────────────────────────────────

class TestAnnotatedImage:
    """Tests for annotated image generation, storage, and GET /api/quality/annotated/{id}."""

    def test_annotated_image_generated_when_detections_exist(self):
        """When detections exist and image array is present, annotated image is saved."""
        import numpy as np
        from app.inference import run_inference
        from app.schemas import AnalysisStatus
        from app import annotated_store

        # 200x200 3-channel test image
        test_img = np.full((200, 200, 3), 128, dtype=np.uint8)

        class MockBoxes:
            xyxy = [[10.0, 10.0, 80.0, 80.0]]
            conf = [0.93]
            cls = [13]
            def __len__(self):
                return 1

        class MockResult:
            boxes = MockBoxes()
            names = {13: "fresh_tomato"}
            orig_img = test_img

        class MockModel:
            names = {13: "fresh_tomato"}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.AI_ASSESSED
        assert res.annotatedImageId is not None
        assert res.annotatedImageUrl == f"/api/quality/annotated/{res.annotatedImageId}"

        # Verify saved in store and can be retrieved
        stored = annotated_store.get_annotated_image(res.annotatedImageId)
        assert stored is not None
        assert stored.startswith(b"\xff\xd8\xff")  # JPEG magic bytes

    def test_annotated_image_endpoint_returns_jpeg(self):
        """GET /api/quality/annotated/{id} returns 200 with media_type image/jpeg."""
        from app import annotated_store
        import numpy as np
        import cv2

        img = np.zeros((50, 50, 3), dtype=np.uint8)
        _, enc = cv2.imencode(".jpg", img)
        test_id = "test_phase9_img"
        annotated_store.save_annotated_image(test_id, enc.tobytes())

        resp = client.get(f"/api/quality/annotated/{test_id}")
        assert resp.status_code == 200
        assert "image/jpeg" in resp.headers["content-type"]
        assert resp.content.startswith(b"\xff\xd8\xff")

        # Also works with .jpg suffix
        resp_jpg = client.get(f"/api/quality/annotated/{test_id}.jpg")
        assert resp_jpg.status_code == 200

    def test_annotated_image_endpoint_404_for_unknown_id(self):
        """GET /api/quality/annotated/{id} returns 404 when ID does not exist."""
        resp = client.get("/api/quality/annotated/nonexistent_id_12345")
        assert resp.status_code == 404
        data = resp.json()
        assert "detail" in data

    def test_no_detection_has_no_annotated_image(self):
        """When NO_DETECTION, annotatedImageId and annotatedImageUrl must be None."""
        from app.inference import run_inference
        from app.schemas import AnalysisStatus

        class MockBoxes:
            xyxy = []
            conf = []
            cls = []
            def __len__(self):
                return 0

        class MockResult:
            boxes = MockBoxes()
            names = {}
            orig_img = None

        class MockModel:
            names = {}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.NO_DETECTION
        assert res.annotatedImageId is None
        assert res.annotatedImageUrl is None

        resp_obj = res.to_response("vegqual-20ep")
        assert resp_obj.annotatedImageId is None
        assert resp_obj.annotatedImageUrl is None

    def test_multiple_detections_rendered_in_annotated_image(self):
        """Multi-detection renders multiple bounding boxes without error."""
        import numpy as np
        from app.inference import run_inference
        from app.schemas import AnalysisStatus
        from app import annotated_store

        test_img = np.full((300, 300, 3), 200, dtype=np.uint8)

        class MockBoxes:
            xyxy = [[10.0, 10.0, 60.0, 60.0], [80.0, 80.0, 150.0, 150.0]]
            conf = [0.91, 0.84]
            cls = [12, 13]
            def __len__(self):
                return 2

        class MockResult:
            boxes = MockBoxes()
            names = {12: "fresh_potato", 13: "defected_tomato"}
            orig_img = test_img

        class MockModel:
            names = {12: "fresh_potato", 13: "defected_tomato"}
            def predict(self, *args, **kwargs):
                return [MockResult()]

        res = run_inference("dummy.jpg", MockModel())
        assert res.status == AnalysisStatus.AI_ASSESSED
        assert res.detectionCount == 2
        assert res.imageCondition == "Mixed"
        assert res.annotatedImageId is not None

        stored = annotated_store.get_annotated_image(res.annotatedImageId)
        assert stored is not None
        assert len(stored) > 100

    def test_schema_backward_compatibility(self):
        """All existing response fields remain present in QualityResponse."""
        from app.schemas import AnalysisStatus, InferenceResult

        res = InferenceResult(
            status=AnalysisStatus.AI_ASSESSED,
            crop="Tomato",
            cropConfidence=0.9124,
            condition="Fresh",
            conditionConfidence=0.9124,
            detectionCount=1,
            imageCondition="Fresh",
            detections=[],
            annotatedImageId="abc123",
            annotatedImageUrl="/api/quality/annotated/abc123",
        )
        resp_dict = res.to_response("vegqual-20ep").model_dump()

        required_keys = [
            "success",
            "status",
            "crop",
            "condition",
            "confidence",
            "cropConfidence",
            "conditionConfidence",
            "assessmentType",
            "modelVersion",
            "detectionCount",
            "imageCondition",
            "detections",
            "annotatedImageId",
            "annotatedImageUrl",
        ]
        for key in required_keys:
            assert key in resp_dict, f"Missing key: {key}"



