import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request

MODEL_DIR = Path(__file__).resolve().parent
COMPRESSED_MODEL_PATH = MODEL_DIR / "model_compressed.joblib"
DEFAULT_MODEL_PATH = COMPRESSED_MODEL_PATH if COMPRESSED_MODEL_PATH.is_file() else MODEL_DIR / "Model.pkl"
MODEL_PATH = Path(os.environ.get("MODEL_PATH", DEFAULT_MODEL_PATH)).expanduser()
if not MODEL_PATH.is_absolute():
    MODEL_PATH = (Path(__file__).resolve().parent / MODEL_PATH).resolve()

if not MODEL_PATH.is_file():
    raise FileNotFoundError(
        f"Model artifact not found at {MODEL_PATH}. "
        "Train it with: python3 wait/server/Model/train.py"
    )

artifact = joblib.load(MODEL_PATH)
if isinstance(artifact, dict):
    model = artifact["model"]
    FEATURE_NAMES = artifact["feature_names"]
    TARGET_NAME = artifact.get("target_name")
else:
    model = artifact
    FEATURE_NAMES = None
    TARGET_NAME = None

COLS = [
    "location", "Furnishing", "facing", "Bathroom", "Balcony", "Ownership",
    "BHK", "Property_Type", "Carpet_Area", "Super_Area", "Current_Floor",
    "Total_Floors", "Parking_Count", "Parking_Type", "overlooking_Garden_Park",
    "overlooking_Main_Road", "overlooking_Pool", "Has_Society",
]
CATEGORY_COLS = [
    "location", "Furnishing", "facing", "Ownership", "Property_Type", "Parking_Type",
]

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify(status="ok", model=MODEL_PATH.name, target=TARGET_NAME)


@app.post("/predict")
def predict():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error="A JSON object is required"), 400

    missing = [column for column in COLS if column not in data]
    if missing:
        return jsonify(error=f"missing: {missing}"), 400

    try:
        row = pd.DataFrame([{column: data[column] for column in COLS}], columns=COLS)
        if FEATURE_NAMES is not None:
            row = pd.get_dummies(row, columns=CATEGORY_COLS, dtype=int)
            row = row.reindex(columns=FEATURE_NAMES, fill_value=0)
        price = float(model.predict(row)[0])
    except (TypeError, ValueError) as error:
        return jsonify(error=str(error)), 400

    if TARGET_NAME == "Total_Price_in_Lakhs":
        price *= 100_000

    return jsonify(price=price)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "8000")))