import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar"; // Import Navbar
import Footer from "./Footer"; // Import Footer
import Login from "./Login";
import Signup from "./Signup";
import SkinCancerDetection from "./SkinCancerDetection";

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-container"> {/* ✅ Ensures proper alignment */}
        <Routes>
          {/* Redirect default route / to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<SkinCancerDetection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}