import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 5000;

// ✅ Fix for ES Modules (Get __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Enable CORS for all requests
app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Allow Vite frontend
    methods: ["POST", "GET"], // ✅ Allow these methods
    allowedHeaders: ["Content-Type"], // ✅ Allow these headers
  })
);

app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// ✅ API to Extract Text from PDF Using `pdf-parse`
app.post("/extract-text", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const pdfPath = path.resolve(req.file.path);

  try {
    // ✅ Read the PDF file
    const dataBuffer = fs.readFileSync(pdfPath);

    // ✅ Extract text using `pdf-parse`
    const data = await pdfParse(dataBuffer);

    // ✅ Clean up the uploaded file
    fs.unlinkSync(pdfPath);

    // ✅ Send extracted text to frontend
    res.json({ extractedText: data.text });
  } catch (error) {
    console.error("Error extracting text:", error);
    res.status(500).json({ error: "Failed to extract text from PDF" });
  }
});

// ✅ CORS Error Debugging Route
app.get("/test", (req, res) => {
  res.json({ message: "CORS is working!" });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ PDF Extraction Backend running on http://localhost:${port}`);
});
