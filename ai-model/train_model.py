from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


def build_training_data():
    samples = [
        ("medical emergency ambulance needed urgently", "High"),
        ("severe food shortage and people in danger", "High"),
        ("urgent shelter required after flooding", "High"),
        ("critical medicine required immediately", "High"),
        ("need volunteers for school lesson support", "Medium"),
        ("teaching support required for children", "Medium"),
        ("community event needs general help this week", "Medium"),
        ("clean water distribution assistance needed", "Medium"),
        ("need help with routine donation sorting", "Low"),
        ("general awareness camp volunteer support", "Low"),
        ("small neighborhood cleanup activity planned", "Low"),
        ("basic admin assistance at the center", "Low"),
    ]
    texts = [text for text, _ in samples]
    labels = [label for _, label in samples]
    return texts, labels


def train_and_save_model():
    texts, labels = build_training_data()
    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer()),
            (
                "clf",
                LogisticRegression(max_iter=1000, random_state=42),
            ),
        ]
    )
    model.fit(texts, labels)

    output_path = Path(__file__).resolve().parent / "model" / "model.pkl"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)
    print(f"Saved model to {output_path}")


if __name__ == "__main__":
    train_and_save_model()
