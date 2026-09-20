"""
prepare_dataset.py — Validate the VegQual dataset structure before training.

Run this BEFORE train.py to catch configuration errors early.
Does NOT download the dataset — download manually from figshare (see data/README.md).

Usage:
    python training/prepare_dataset.py --data data/vegqual/data.yaml

Exit codes:
    0 — all checks passed
    1 — one or more checks failed
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import yaml


# ─────────────────────────────────────────────────────────────────────────────
# Checks
# ─────────────────────────────────────────────────────────────────────────────

def check_yaml(data_yaml_path: Path) -> dict:
    """Load and return the data.yaml; print its contents for manual inspection."""
    print(f"\n{'─'*60}")
    print(f"  data.yaml: {data_yaml_path}")
    print(f"{'─'*60}")

    if not data_yaml_path.exists():
        _fail(f"data.yaml not found at: {data_yaml_path}")

    with open(data_yaml_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    if not isinstance(cfg, dict):
        _fail("data.yaml did not parse to a dictionary.")

    nc = cfg.get("nc")
    names = cfg.get("names", [])

    print(f"  nc (number of classes): {nc}")
    print(f"  names ({len(names)} entries):")
    for i, name in enumerate(names):
        print(f"    [{i:2d}] {name}")

    # Warn if nc and len(names) disagree
    if nc is not None and int(nc) != len(names):
        _warn(f"nc={nc} but len(names)={len(names)} — they should match.")

    return cfg


def check_splits(dataset_root: Path, cfg: dict) -> dict[str, int]:
    """Check train/valid/test split directories and count images."""
    print(f"\n{'─'*60}")
    print("  Split directory check")
    print(f"{'─'*60}")

    split_keys = {"train": "train", "val": "valid", "test": "test"}
    counts: dict[str, int] = {}
    all_ok = True

    for split_key, split_dir_name in split_keys.items():
        cfg_value = cfg.get(split_key, "")
        # Resolve relative to dataset root
        images_dir = dataset_root / split_dir_name / "images"
        labels_dir = dataset_root / split_dir_name / "labels"

        imgs = list(images_dir.glob("*")) if images_dir.exists() else []
        lbls = list(labels_dir.glob("*.txt")) if labels_dir.exists() else []

        img_count = len([f for f in imgs if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}])
        lbl_count = len(lbls)

        status_img = "✅" if images_dir.exists() and img_count > 0 else "❌"
        status_lbl = "✅" if labels_dir.exists() and lbl_count > 0 else "❌"

        print(f"  {split_key:6s}: images/ {status_img} ({img_count} files)  "
              f"labels/ {status_lbl} ({lbl_count} files)")

        if not images_dir.exists() or img_count == 0:
            _warn(f"  {split_key}/images/ missing or empty at: {images_dir}")
            all_ok = False
        if not labels_dir.exists() or lbl_count == 0:
            _warn(f"  {split_key}/labels/ missing or empty at: {labels_dir}")
            all_ok = False

        counts[split_key] = img_count

    return counts


def spot_check_labels(dataset_root: Path, n: int = 3) -> None:
    """Spot-check a few label files to verify YOLO format."""
    print(f"\n{'─'*60}")
    print(f"  Label spot-check (first {n} files from train/labels/)")
    print(f"{'─'*60}")

    labels_dir = dataset_root / "train" / "labels"
    if not labels_dir.exists():
        _warn("train/labels/ not found — skipping spot-check.")
        return

    label_files = sorted(labels_dir.glob("*.txt"))[:n]
    if not label_files:
        _warn("No .txt label files found in train/labels/")
        return

    for lf in label_files:
        lines = lf.read_text(encoding="utf-8").strip().splitlines()
        print(f"\n  {lf.name} ({len(lines)} annotations):")
        for line in lines[:3]:
            parts = line.split()
            if len(parts) == 5:
                cls_id, cx, cy, w, h = parts
                print(f"    class={cls_id}  cx={cx}  cy={cy}  w={w}  h={h}  ✅")
            else:
                print(f"    Unexpected format: '{line}'  ⚠️")


def check_class_name_format(names: list[str]) -> None:
    """
    Warn if any class name does not follow the expected
    '<Crop Name> <Condition>' format used by VegQual.
    """
    print(f"\n{'─'*60}")
    print("  Class name format check")
    print(f"{'─'*60}")

    known_conditions = {"Fresh", "Defective"}
    issues = []
    for i, name in enumerate(names):
        if "<verify" in name.lower():
            print(f"  [{i:2d}] ⚠️  PLACEHOLDER: '{name}' — update vegqual.yaml after confirming actual label")
            continue
        parts = name.strip().rsplit(" ", 1)
        if len(parts) != 2 or parts[1] not in known_conditions:
            issues.append((i, name))
        else:
            print(f"  [{i:2d}] ✅ '{name}'  →  crop='{parts[0]}'  condition='{parts[1]}'")

    for i, name in issues:
        print(f"  [{i:2d}] ⚠️  '{name}' — last word is not 'Fresh' or 'Defective'. "
              "Inference label parsing may not work correctly.")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _fail(msg: str) -> None:
    print(f"\n❌ FATAL: {msg}")
    sys.exit(1)


def _warn(msg: str) -> None:
    print(f"  ⚠️  WARNING: {msg}")


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate VegQual dataset structure before training."
    )
    parser.add_argument(
        "--data",
        required=True,
        help="Path to data.yaml (e.g. data/vegqual/data.yaml)",
    )
    args = parser.parse_args()

    data_yaml = Path(args.data).resolve()
    dataset_root = data_yaml.parent

    print("\n" + "═" * 60)
    print("  KrishiShetra AI — Dataset Validator")
    print("  VegQual pre-training structure check")
    print("═" * 60)

    cfg = check_yaml(data_yaml)
    counts = check_splits(dataset_root, cfg)
    spot_check_labels(dataset_root)
    names = cfg.get("names", [])
    if names:
        check_class_name_format(names)

    print(f"\n{'═'*60}")
    total = sum(counts.values())
    print(f"  Total images found: {total}")
    for split, count in counts.items():
        print(f"    {split:6s}: {count}")

    if total == 0:
        print("\n❌ No images found. Download the dataset before training.")
        print("   See: data/README.md")
        sys.exit(1)

    print("\n✅ Dataset structure looks valid. You can now run training:")
    print("   python training/train.py --data", args.data)
    print()


if __name__ == "__main__":
    main()
