import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // ✅ Import Firebase Auth
import { auth } from "./firebase"; // ✅ Ensure Firebase is correctly configured
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // ✅ Import CSS file

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Login Attempt with:", email, password); // ✅ Debugging log

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User Logged In:", userCredential.user);
      navigate("/dashboard"); // Redirect to dashboard after login
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h1>Login</h1>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleLogin}>
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
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <Link to="/signup" className="signup-link">Don't have an account? Sign up</Link>
    </div>
  );
}
