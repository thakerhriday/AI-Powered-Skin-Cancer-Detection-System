import React, { useState, useEffect } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url"; // PDF Worker
import "./skin.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker; // Set PDF worker path

export default function SkinCancerDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ehrFile, setEhrFile] = useState(null);
  const [extractedEHRText, setExtractedEHRText] = useState("");

  // Scroll to top when result or advice is updated
  useEffect(() => {
    if (result || advice) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [result, advice]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleEHRChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setEhrFile(file);
      extractTextFromEHR(file);
    }
  };

  const extractTextFromEHR = async (file) => {
    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }

        setExtractedEHRText(text);
        console.log("Extracted EHR Text:", text);
      };
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      setError("Error reading PDF file.");
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please upload an image before detecting.");
      return;
    }
  
    setLoading(true);
    setError("");
    setResult(null);
    setAdvice(null);
  
    const formData = new FormData();
    formData.append("file", image);
    formData.append("ehr_text", extractedEHRText || "");
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setResult(response.data.prediction);
      setAdvice(response.data.advice);
  
    } catch (error) {
      console.error("Error detecting skin cancer:", error);
      setError("Something went wrong. Please try again.");
    }
  
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h1>Skin Cancer Detection</h1>
      <p className="description">Upload an image of the affected skin area and let our AI analyze it.</p>

      <label className="upload-box">
        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        <div className="upload-area">
          {preview ? <img src={preview} alt="Preview" className="preview-image" /> : <p className="upload-text">Click to upload an image</p>}
        </div>
      </label>

      <p className="description">Upload an EHR PDF file for additional analysis.</p>
      <label className="upload-box">
        <input type="file" accept="application/pdf" onChange={handleEHRChange} className="hidden" />
        <div className="upload-area">
          {ehrFile ? <p>{ehrFile.name}</p> : <p className="upload-text">Click to upload EHR (PDF)</p>}
        </div>
      </label>

      {extractedEHRText && (
        <div className="ehr-text-box">
          <h3>Extracted EHR Data:</h3>
          <p>{extractedEHRText.slice(0, 500)}...</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="detect-button">
        {loading ? "Processing..." : "Detect"}
      </button>

      {result && (
        <div className={`result-box ${result.includes("Benign") ? "benign" : "malignant"}`}>
          <p className="result-text">Prediction: {result}</p>
        </div>
      )}

      {advice && (
        <div className="advice-box">
          <h3>Follow-Up Advice</h3>
          <div dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, "<br>") }} />
        </div>
      )}
    </div>
  );
}
