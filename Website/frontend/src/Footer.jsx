import React from "react";
import "./Footer.css"; // Ensure styles are imported

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} SkinCareAI. All rights reserved.</p>
      <div className="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">🌍 Facebook</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
      </div>
    </footer>
  );
}
