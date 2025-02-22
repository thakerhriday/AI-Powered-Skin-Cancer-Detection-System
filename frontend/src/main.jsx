import React from "react";  // ✅ Add this line
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App.jsx';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
