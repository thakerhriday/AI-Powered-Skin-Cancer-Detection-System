from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import google.generativeai as genai  # Gemini SDK
import os
from PIL import Image  # For image processing
import io  # For in-memory file handling

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

# Load AI Model
try:
    model = tf.keras.models.load_model("final.h5")
except Exception as e:
    print("Error loading AI model:", e)
    model = None

# Configure Gemini API Key (Replace with your actual key)
genai.configure(api_key="AIzaSyBT4v2DIuDyWv39qmhByiHQ0vI4OderyyQ")


@app.after_request
def add_cors_headers(response):
    """
    Ensure CORS headers are included in all responses.
    """
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


def preprocess_image(image_file):
    """
    Preprocess the uploaded image for the model.
    - Converts image to RGB (ensuring 3 channels)
    - Resizes it to 28x28 (adjust based on your model's expected input size)
    - Normalizes pixel values to [0,1]
    """
    try:
        image = Image.open(image_file).convert("RGB")  # Convert to RGB
        image = image.resize((28, 28))  # Resize to match model input
        image = np.array(image) / 255.0  # Normalize pixel values
        image = np.expand_dims(image, axis=0).astype(np.float32)  # Add batch dimension
        return image
    except Exception as e:
        print("Image Processing Error:", e)
        return None


def get_gemini_advice(prediction, ehr_text):
    """
    Generate medical advice based on AI prediction and EHR text using Gemini AI.
    """
    prompt = f"""
    The AI model has analyzed a skin image and detected the following result: {prediction}.
    The patient's provided health details (EHR) include: {ehr_text}.

    Based on this information, give a general assessment of the condition and suggest next steps.
    Avoid medical diagnoses but provide general recommendations.
    """

    try:
        model = genai.GenerativeModel("gemini-pro")  # Initialize the Gemini model
        response = model.generate_content(prompt)  # Generate content

        if response and response.text:
            return response.text.strip()
        else:
            return "Unable to generate advice at this moment. Please consult a medical professional."

    except Exception as e:
        print("Error generating advice:", e)
        return "Unable to generate advice at this moment. Please consult a medical professional."


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":  # Handle CORS preflight request
        return jsonify({"message": "CORS Preflight OK"}), 200

    if "file" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    if model is None:
        return jsonify({"error": "AI Model not loaded"}), 500

    file = request.files["file"]
    ehr_text = request.form.get("ehr_text", "")

    image = preprocess_image(file)
    if image is None:
        return jsonify({"error": "Failed to process image"}), 500

    try:
        prediction = model.predict(image)
        result = "Malignant" if prediction[0][0] > 0.5 else "Benign"
    except Exception as e:
        print("Model Prediction Error:", e)
        return jsonify({"error": "Error during prediction"}), 500

    # Get Gemini AI advice based on prediction and EHR text
    advice = get_gemini_advice(result, ehr_text)

    return jsonify({"prediction": result, "advice": advice})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # Accessible on any network
