import React, { useState } from "react";
import axios from "axios";
import "./styles.css";
import "./skin.css";

export default function SkinCancerDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Image Upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Send Image to Flask API for AI Prediction
  const handleSubmit = async () => {
    if (!image) {
      setError("Please upload an image before detecting.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const prediction = response.data.prediction;
      setResult(prediction);
      setLoading(false);
    } catch (error) {
      console.error("Error detecting skin cancer:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
};


  return (
    <div className="dashboard-container">
      <h1>Skin Cancer Detection</h1>
      <p className="description">Upload an image of the affected skin area and let our AI analyze it.</p>

      {/* Image Upload */}
      <label className="upload-box">
        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        <div className="upload-area">
          {preview ? <img src={preview} alt="Preview" className="preview-image" /> : <p className="upload-text">Click to upload an image</p>}
        </div>
      </label>

      {/* Error Message */}
      {error && <p className="error-message">{error}</p>}

      {/* Detect Button */}
      <button onClick={handleSubmit} disabled={loading} className="detect-button">
        {loading ? "Processing..." : "Detect"}
      </button>

      {/* Result Display */}
      {result && (
        <div className={`result-box ${result.includes("Benign") ? "benign" : "malignant"}`}>
          <p className="result-text">Prediction: {result}</p>
        </div>
      )}
    </div>
  );
}
