from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import io
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React integration

# Load the pre-trained model
MODEL_PATH = "skin_cancer_cnn.h5"
model = load_model(MODEL_PATH)

# Define class labels (modify based on your dataset)
CLASS_LABELS = ["Benign", "Malignant"]


@app.route("/")
def home():
    return "Skin Cancer Classification API is running!"


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img = Image.open(io.BytesIO(file.read())).resize(
        (128, 128)
    )  # Resize to match model input
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0  # Normalize

    predictions = model.predict(img_array)
    predicted_class = CLASS_LABELS[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    return jsonify({"prediction": predicted_class, "confidence": confidence})


if __name__ == "__main__":
    app.run(debug=True)
