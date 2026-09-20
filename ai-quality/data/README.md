# KrishiShetra AI Quality Service — Dataset Download Instructions

## VegQual Dataset

**Source:** figshare — https://doi.org/10.6084/m9.figshare.27305656
**License:** CC BY 4.0 (attribution required — see README.md)

---

## Download steps

1. Open https://figshare.com/articles/dataset/VegQual_Dataset_for_Multi-Class_Vegetable_Quality_Assessment_and_Defect_Detection/27305656
2. Click **Download** (the full dataset zip, typically `VegQual.zip` or similar)
3. Extract the zip into this `data/` directory so the final structure is:

```
ai-quality/
└── data/
    └── vegqual/
        ├── data.yaml          ← dataset manifest (read by Ultralytics)
        ├── train/
        │   ├── images/
        │   │   ├── img001.jpg
        │   │   └── ...
        │   └── labels/
        │       ├── img001.txt
        │       └── ...
        ├── valid/
        │   ├── images/
        │   └── labels/
        └── test/
            ├── images/
            └── labels/
```

4. Open `data/vegqual/data.yaml` and confirm:
   - `nc:` (number of classes) shows 14
   - `names:` lists all 14 class labels
   - The 7th vegetable species (classes 12/13) is confirmed here

5. Run the dataset validator:
   ```bash
   python training/prepare_dataset.py --data data/vegqual/data.yaml
   ```

---

## Alternate: Roboflow hosted version

If figshare is unavailable, VegQual may also be available on Roboflow Universe.
Search for "VegQual" on https://universe.roboflow.com and download in YOLOv8 format.
Confirm the class list matches before training.

---

## Important: data.yaml path references

Ultralytics requires the `path:` field in `data.yaml` to point correctly to the dataset root.
After extraction, edit `data/vegqual/data.yaml` if needed to ensure `path:` is an absolute
path or relative to the `ai-quality/` directory.

Example corrected `data.yaml`:
```yaml
path: ../data/vegqual    # relative to ultralytics working directory
train: train/images
val: valid/images
test: test/images

nc: 14
names:
  - Tomato Fresh
  - Tomato Defective
  - Potato Fresh
  - Potato Defective
  - Bitter Gourd Fresh
  - Bitter Gourd Defective
  - Pointed Gourd Fresh
  - Pointed Gourd Defective
  - Onion Fresh
  - Onion Defective
  - Brinjal Fresh
  - Brinjal Defective
  - <class12 name from actual data.yaml>
  - <class13 name from actual data.yaml>
```
