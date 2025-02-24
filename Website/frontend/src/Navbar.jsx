import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Ensure this is imported for styling

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">SkinCareAI</Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login" className="login-button">Login</Link></li>
        </ul>
      </div>
    </nav>
  );
}
