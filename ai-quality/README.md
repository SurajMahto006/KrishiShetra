# KrishiShetra AI Crop Quality Assessment Service

> **Status: Development / Training Phase**
> A trained model (`best.pt`) does not yet exist. The service runs and responds correctly,
> but analysis results will return `"status": "MODEL_NOT_LOADED"` until a model is trained.
> See **Training** section below.

---

## What this service does

This is a standalone Python microservice that accepts a crop image and returns a structured
JSON quality assessment using a YOLOv8 object detection model trained on the VegQual dataset.

It is architecturally separate from the KrishiShetra Node.js/Express backend and does not
modify any existing farmer-facing pages.

---

## Dataset: VegQual

| Property | Value |
|---|---|
| Source | figshare.com |
| DOI | https://doi.org/10.6084/m9.figshare.27305656 |
| License | CC BY 4.0 (attribution required) |
| Images | 2,032 raw images |
| Annotations | 4,736 bounding box instances |
| Format | YOLO TXT (`class_id cx cy w h` normalized) |
| Split | train 70% · valid 20% · test 10% |
| Image size | 640 × 640 px |

### Classes confirmed from dataset documentation (14 total)

Each YOLO class is a **flat detection label** combining crop + condition:

| class_id | Label |
|---|---|
| 0 | Tomato Fresh |
| 1 | Tomato Defective |
| 2 | Potato Fresh |
| 3 | Potato Defective |
| 4 | Bitter Gourd Fresh |
| 5 | Bitter Gourd Defective |
| 6 | Pointed Gourd Fresh |
| 7 | Pointed Gourd Defective |
| 8 | Onion Fresh |
| 9 | Onion Defective |
| 10 | Brinjal Fresh |
| 11 | Brinjal Defective |
| 12 | *(7th vegetable Fresh — verify from `data.yaml` after download)* |
| 13 | *(7th vegetable Defective — verify from `data.yaml` after download)* |

> The class list is read at runtime from the trained model's internal metadata.
> It is never hardcoded in the application.

### Unsupported crops (not in VegQual)

Wheat, Rice, Soybean, Cotton, Sugarcane, Maize, Groundnut, and all fruit varieties
are **not** in VegQual and will not be recognized by the trained model.
Additional dataset sources must be incorporated before those crops can be assessed.

---

## Architecture

```
POST /api/quality/analyze (multipart image)
        ↓
image_validation.py     — format, size, corruption guard
        ↓
[raw image bytes → Ultralytics YOLO]
        ↓
inference.py            — model.predict() → parse flat label → crop + condition
        ↓
schemas.py              — structured nullable JSON response
```

Ultralytics handles all internal preprocessing (letterbox resize, normalization).
No manual preprocessing pipeline is used in this service.

---

## Directory structure

```
ai-quality/
├── README.md
├── requirements.txt
├── .env.example
├── .gitignore
├── app/
│   ├── main.py            FastAPI app + endpoints
│   ├── schemas.py         Pydantic request/response models
│   ├── image_validation.py  Format, size, corruption checks
│   ├── preprocessing.py   Minimal image prep helpers (not resize/normalize)
│   ├── model_loader.py    One-time model load at startup
│   └── inference.py       Crop-agnostic YOLO inference interface
├── training/
│   ├── config/
│   │   └── vegqual.yaml   Dataset config for Ultralytics training
│   ├── prepare_dataset.py  Validate dataset structure before training
│   ├── train.py           Training script (argparse CLI)
│   └── evaluate.py        Evaluation — real metrics only
├── models/
│   └── .gitkeep           Trained .pt files go here (gitignored)
├── data/
│   └── README.md          Dataset download instructions
├── outputs/
│   └── .gitkeep           Training run outputs (gitignored)
└── tests/
    └── test_api.py        pytest integration tests
```

---

## Installation

```bash
cd ai-quality

# Create a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env          # Windows
# cp .env.example .env          # Linux/macOS
# Edit .env as needed
```

### GPU training (recommended)

Before installing requirements, install the CUDA-enabled PyTorch build:
```bash
# Example for CUDA 12.1 — check https://pytorch.org/get-started/locally/ for your version
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```
Then install the rest of `requirements.txt`.

---

## Dataset download

See [`data/README.md`](data/README.md) for step-by-step instructions.

---

## Training

```bash
# 1. Validate dataset structure first
python training/prepare_dataset.py --data data/vegqual/data.yaml

# 2. Train (GPU auto-detected; add --device cpu to force CPU)
python training/train.py \
  --data data/vegqual/data.yaml \
  --model yolov8n.pt \
  --epochs 50 \
  --imgsz 640 \
  --batch 16 \
  --output outputs/ \
  --name vegqual-run1

# Trained weights will be at: outputs/vegqual-run1/weights/best.pt
```

---

## Evaluation

```bash
# Run after training — prints real metrics, saves confusion matrix
python training/evaluate.py \
  --model outputs/vegqual-run1/weights/best.pt \
  --data data/vegqual/data.yaml \
  --split test \
  --output outputs/eval/
```

**Evaluation results placeholder** — to be filled after first training run:

| Metric | Value |
|---|---|
| mAP@0.5 | *not yet trained* |
| mAP@0.5:0.95 | *not yet trained* |
| Precision (macro) | *not yet trained* |
| Recall (macro) | *not yet trained* |

---

## Starting the service

```bash
# No model loaded (health endpoint still works)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

# With trained model
MODEL_PATH=outputs/vegqual-run1/weights/best.pt uvicorn app.main:app --host 0.0.0.0 --port 8001
```

---

## API

### `GET /api/quality/health`

```json
{
  "service": "KrishiShetra AI Quality Service",
  "modelLoaded": false,
  "modelVersion": "krishishetra-quality-v1",
  "supportedCrops": [],
  "status": "MODEL_NOT_LOADED"
}
```

### `POST /api/quality/analyze`

```bash
curl -X POST http://localhost:8001/api/quality/analyze \
  -F "file=@/path/to/tomato.jpg"
```

**Response (model loaded, detection found):**
```json
{
  "success": true,
  "crop": "Tomato",
  "cropConfidence": 0.94,
  "condition": "Fresh",
  "conditionConfidence": 0.94,
  "visibleDefects": "Low",
  "status": "AI_ASSESSED",
  "modelVersion": "krishishetra-quality-v1"
}
```

**Response (model not loaded):**
```json
{
  "success": false,
  "crop": null,
  "cropConfidence": null,
  "condition": null,
  "conditionConfidence": null,
  "visibleDefects": null,
  "status": "MODEL_NOT_LOADED",
  "modelVersion": "krishishetra-quality-v1"
}
```

---

## Limitations

- Trained on VegQual only: **7 vegetable species, 2 conditions**
- Does not recognize crops outside the trained class list
- Results are visual assessments only — not a laboratory or Agmark certification
- Accuracy is limited by VegQual's 2,032-image dataset size
- Performance on images from different lighting conditions, angles, or packaging is unknown until evaluated
- `visibleDefects` field is derived from the condition class label ("Defective" → "High", "Fresh" → "Low") — the model does not separately quantify defect area

---

## Adding new crops (future)

To extend beyond VegQual:
1. Obtain a YOLO-format annotated dataset for the new crop
2. Merge class lists, retrain (or fine-tune from `best.pt`)
3. No application code changes are required — class names are read from model metadata at runtime

---

## Attribution

VegQual Dataset:
> *Author(s)*. VegQual: Dataset for Multi-Class Vegetable Quality Assessment and Defect Detection.
> figshare. Dataset. https://doi.org/10.6084/m9.figshare.27305656
> Licensed under CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
