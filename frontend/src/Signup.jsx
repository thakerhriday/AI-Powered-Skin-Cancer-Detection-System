import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // ✅ Ensure Firebase is correctly configured
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css"; // ✅ Import CSS file

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Signup Attempt with:", email, password); // ✅ Debugging log

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User Created:", userCredential.user); // ✅ Debugging log
      navigate("/dashboard"); // Redirect after signup
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password (min 6 chars)"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <Link to="/login" className="login-link">Already have an account? Login</Link>
    </div>
  );
}
