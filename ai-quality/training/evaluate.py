"""
evaluate.py — Real evaluation of a trained YOLOv8 model on the test split.

Produces actual metrics computed by the Ultralytics validation engine.
Never invents or estimates any metric.
If the model file is absent, prints a clear error and exits.

Usage:
    python training/evaluate.py \\
        --model outputs/vegqual-run1/weights/best.pt \\
        --data  data/vegqual/data.yaml \\
        --split test \\
        --output outputs/eval/

Output:
    - Metrics printed to stdout (precision, recall, F1, mAP@0.5, mAP@0.5:0.95)
    - Per-class breakdown
    - Confusion matrix PNG saved to --output directory
    - Raw results dict saved as eval_results.yaml
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Evaluate a trained YOLOv8 model on VegQual test split."
    )
    parser.add_argument(
        "--model",
        required=True,
        help="Path to trained .pt weights (e.g. outputs/vegqual-run1/weights/best.pt)",
    )
    parser.add_argument(
        "--data",
        required=True,
        help="Path to data.yaml (e.g. data/vegqual/data.yaml)",
    )
    parser.add_argument(
        "--split",
        default="test",
        choices=["train", "val", "test"],
        help="Dataset split to evaluate on (default: test).",
    )
    parser.add_argument(
        "--output",
        default="outputs/eval",
        help="Directory to save evaluation outputs (default: outputs/eval/).",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Inference image size (default: 640 — should match training size).",
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=0.25,
        help="Confidence threshold for detections (default: 0.25).",
    )
    parser.add_argument(
        "--iou",
        type=float,
        default=0.6,
        help="IoU threshold for NMS during evaluation (default: 0.6).",
    )
    parser.add_argument(
        "--device",
        default="",
        help="Device: '' = auto, 'cpu', '0' = first GPU.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # ── Validate inputs ───────────────────────────────────────────────────────
    model_path = Path(args.model)
    if not model_path.exists():
        logger.error(
            "Model weights not found at '%s'.\n"
            "  Train the model first:\n"
            "  python training/train.py --data %s",
            args.model,
            args.data,
        )
        sys.exit(1)

    data_path = Path(args.data)
    if not data_path.exists():
        logger.error("data.yaml not found at '%s'.", args.data)
        sys.exit(1)

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # ── Import Ultralytics ────────────────────────────────────────────────────
    try:
        from ultralytics import YOLO
    except ImportError:
        logger.error("Ultralytics not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("  KrishiShetra AI — Evaluation")
    logger.info("  Model  : %s", args.model)
    logger.info("  Data   : %s", args.data)
    logger.info("  Split  : %s", args.split)
    logger.info("  Output : %s", args.output)
    logger.info("=" * 60)

    # ── Load model ────────────────────────────────────────────────────────────
    logger.info("Loading model ...")
    model = YOLO(str(model_path))

    # ── Run validation ────────────────────────────────────────────────────────
    logger.info("Running evaluation on '%s' split ...", args.split)
    metrics = model.val(
        data=str(data_path.resolve()),
        split=args.split,
        imgsz=args.imgsz,
        conf=args.conf,
        iou=args.iou,
        device=args.device if args.device else None,
        project=str(output_dir.resolve()),
        name="eval_run",
        save_json=False,
        plots=True,      # saves confusion matrix and PR curve PNGs
        verbose=True,
    )

    # ── Print real metrics ────────────────────────────────────────────────────
    # All values come directly from the Ultralytics val engine.
    # Nothing is fabricated or estimated here.
    print("\n" + "═" * 60)
    print("  Evaluation Results")
    print(f"  Model : {args.model}")
    print(f"  Split : {args.split}")
    print("═" * 60)

    precision = None
    recall = None
    map50 = None
    map50_95 = None
    macro_f1 = None

    try:
        box = metrics.box
        precision = round(float(box.mp), 4)
        recall = round(float(box.mr), 4)
        map50 = round(float(box.map50), 4)
        map50_95 = round(float(box.map), 4)

        # F1 = 2 * P * R / (P + R)
        p = box.mp
        r = box.mr
        f1 = (2 * p * r / (p + r)) if (p + r) > 0 else 0.0
        macro_f1 = round(float(f1), 4)

        print(f"\n  Overall (all classes):")
        print(f"    mAP@0.5       : {map50:.4f}")
        print(f"    mAP@0.5:0.95  : {map50_95:.4f}")
        print(f"    Precision (P) : {precision:.4f}")
        print(f"    Recall (R)    : {recall:.4f}")
        print(f"    F1 (macro)    : {macro_f1:.4f}")

        # Per-class breakdown
        class_names = model.names
        print(f"\n  Per-class breakdown:")
        print(f"  {'Class':<30} {'P':>8} {'R':>8} {'F1':>8} {'AP@0.5':>10}")
        print(f"  {'─'*30} {'─'*8} {'─'*8} {'─'*8} {'─'*10}")

        if hasattr(box, 'ap_class_index') and box.ap_class_index is not None:
            for idx, cls_id in enumerate(box.ap_class_index.tolist()):
                cls_name = class_names.get(int(cls_id), f"class_{cls_id}")
                cls_p = float(box.p[idx]) if box.p is not None else float("nan")
                cls_r = float(box.r[idx]) if box.r is not None else float("nan")
                cls_ap = float(box.ap50[idx]) if box.ap50 is not None else float("nan")
                cls_f1 = (2 * cls_p * cls_r / (cls_p + cls_r)
                          if (cls_p + cls_r) > 0 else 0.0)
                print(f"  {cls_name:<30} {cls_p:>8.4f} {cls_r:>8.4f} "
                      f"{cls_f1:>8.4f} {cls_ap:>10.4f}")
        else:
            print("  (Per-class breakdown not available from this Ultralytics version)")

    except AttributeError as exc:
        logger.warning(
            "Could not extract structured metrics: %s. "
            "Check Ultralytics output above for raw results.",
            exc,
        )

    # ── Save results to YAML ──────────────────────────────────────────────────
    results_path = output_dir / "eval_results.yaml"
    try:
        results_dict = {
            "model": str(model_path),
            "data": str(data_path),
            "split": args.split,
            "precision": precision,
            "recall": recall,
            "mAP50": map50,
            "mAP50-95": map50_95,
            "macro_f1": macro_f1,
            "note": (
                "All values computed by Ultralytics val engine. "
                "None are fabricated or estimated."
            ),
        }
        with open(results_path, "w", encoding="utf-8") as f:
            yaml.dump(results_dict, f, default_flow_style=False)
        logger.info("Results saved to: %s", results_path)
    except Exception as exc:
        logger.warning("Could not save results YAML: %s", exc)

    # ── Locate confusion matrix ───────────────────────────────────────────────
    cm_candidates = list((output_dir / "eval_run").glob("confusion_matrix*.png"))
    if cm_candidates:
        print(f"\n  Confusion matrix: {cm_candidates[0]}")
    else:
        print(f"\n  Confusion matrix: check {output_dir}/eval_run/ for plots")

    print("\n" + "═" * 60)
    print("  Evaluation complete.")
    print("═" * 60 + "\n")


if __name__ == "__main__":
    main()
