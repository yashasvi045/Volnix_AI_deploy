from pathlib import Path

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

MODEL_PATH = Path(__file__).resolve().parent / "model" / "model.pkl"
model = None


def load_model():
    global model
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. Run train_model.py first."
            )
        model = joblib.load(MODEL_PATH)
    return model


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "text is required"}), 400

    classifier = load_model()
    urgency = classifier.predict([text])[0]
    return jsonify({"urgency": urgency})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
