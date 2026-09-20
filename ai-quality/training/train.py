"""
train.py — YOLOv8 training script for KrishiShetra AI Quality Service.

Uses transfer learning from a COCO-pretrained YOLOv8n checkpoint.
Ultralytics handles all preprocessing (letterbox resize, normalization)
internally — do NOT add manual preprocessing before calling model.train().

Usage:
    python training/train.py --data data/vegqual/data.yaml

Full example with all options:
    python training/train.py \\
        --data  data/vegqual/data.yaml \\
        --model yolov8n.pt \\
        --epochs 50 \\
        --imgsz 640 \\
        --batch  16 \\
        --output outputs/ \\
        --name   vegqual-run1 \\
        --device ""

After training, the best weights will be at:
    outputs/<name>/weights/best.pt

Set MODEL_PATH in your .env to that path to load the model in the API.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Train YOLOv8 on VegQual dataset for crop quality assessment."
    )
    parser.add_argument(
        "--data",
        required=True,
        help="Path to data.yaml (e.g. data/vegqual/data.yaml)",
    )
    parser.add_argument(
        "--model",
        default="yolov8n.pt",
        help=(
            "Base checkpoint for transfer learning. "
            "Default 'yolov8n.pt' downloads COCO-pretrained weights automatically. "
            "Pass a path to an existing .pt file to fine-tune from it."
        ),
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=50,
        help="Number of training epochs (default: 50).",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help=(
            "Training image size in pixels (default: 640). "
            "Ultralytics handles letterbox resize internally — "
            "do not pre-resize images before training."
        ),
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help=(
            "Batch size (default: 16). Use -1 for Ultralytics auto-batch. "
            "Reduce to 8 or 4 if you run out of GPU memory."
        ),
    )
    parser.add_argument(
        "--output",
        default="outputs",
        help="Root directory for training run outputs (default: outputs/).",
    )
    parser.add_argument(
        "--name",
        default="vegqual-run1",
        help="Run name — output will be saved to <output>/<name>/ (default: vegqual-run1).",
    )
    parser.add_argument(
        "--device",
        default="",
        help=(
            "Device for training. '' = auto-detect (GPU if available, else CPU). "
            "'cpu' = force CPU (slow). '0' = first GPU. '0,1' = multi-GPU."
        ),
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=0,
        help="Number of dataloader workers (default: 0). 0 = load data in the main process (safe on Windows).",
    )
    return parser.parse_args()


def check_gpu() -> str:
    """
    Check GPU availability and print a warning if only CPU is available.
    Returns the recommended device string.
    """
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            logger.info("GPU detected: %s", gpu_name)
            return "0"
        else:
            logger.warning(
                "No GPU detected — training will run on CPU.\n"
                "  Estimated time for 50 epochs on VegQual (~2k images): 6–12 hours.\n"
                "  To use a GPU, install the CUDA build of PyTorch:\n"
                "  https://pytorch.org/get-started/locally/"
            )
            return "cpu"
    except ImportError:
        logger.error("PyTorch is not installed. Run: pip install -r requirements.txt")
        sys.exit(1)


def main() -> None:
    args = parse_args()

    # ── Validate inputs ───────────────────────────────────────────────────────
    data_path = Path(args.data)
    if not data_path.exists():
        logger.error(
            "data.yaml not found at '%s'.\n"
            "  Download VegQual dataset first — see data/README.md\n"
            "  Then validate with: python training/prepare_dataset.py --data %s",
            args.data,
            args.data,
        )
        sys.exit(1)

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # ── GPU check ─────────────────────────────────────────────────────────────
    device = args.device
    if device == "":
        device = check_gpu()

    logger.info("=" * 60)
    logger.info("  KrishiShetra AI — Training")
    logger.info("  Base model  : %s", args.model)
    logger.info("  Dataset     : %s", args.data)
    logger.info("  Epochs      : %d", args.epochs)
    logger.info("  Image size  : %d", args.imgsz)
    logger.info("  Batch size  : %d", args.batch)
    logger.info("  Device      : %s", device)
    logger.info("  Output dir  : %s/%s", args.output, args.name)
    logger.info("=" * 60)

    # ── Import Ultralytics ────────────────────────────────────────────────────
    try:
        from ultralytics import YOLO
    except ImportError:
        logger.error("Ultralytics is not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    # ── Load base model (downloads yolov8n.pt from Ultralytics Hub if needed) ─
    logger.info("Loading base checkpoint: %s", args.model)
    model = YOLO(args.model)

    # ── Train ─────────────────────────────────────────────────────────────────
    # Ultralytics handles all preprocessing internally:
    #   - letterbox resize to args.imgsz
    #   - pixel normalization to [0, 1]
    #   - data augmentation (mosaic, flip, etc.)
    # Do NOT add manual preprocessing before this call.
    logger.info("Starting training ...")
    results = model.train(
        data=str(data_path.resolve()),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=device,
        project=str(output_dir.resolve()),
        name=args.name,
        workers=args.workers,
        # Transfer learning friendly defaults:
        pretrained=True,    # use COCO pretrained weights as starting point
        exist_ok=False,     # fail if run name already exists (prevent overwrite)
        verbose=True,
    )

    # ── Report output path ────────────────────────────────────────────────────
    best_weights = output_dir / args.name / "weights" / "best.pt"
    logger.info("=" * 60)
    logger.info("Training complete.")
    if best_weights.exists():
        logger.info("Best weights saved to: %s", best_weights)
        logger.info(
            "\nTo start the API with this model:\n"
            "  MODEL_PATH=%s uvicorn app.main:app --host 0.0.0.0 --port 8001",
            best_weights,
        )
        logger.info(
            "\nTo evaluate on the test split:\n"
            "  python training/evaluate.py --model %s --data %s --split test",
            best_weights,
            args.data,
        )
    else:
        logger.warning(
            "Expected best.pt not found at '%s'. "
            "Check Ultralytics output above for errors.",
            best_weights,
        )
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
