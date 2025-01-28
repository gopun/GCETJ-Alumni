import React from 'react';
import './Footer.css'; // Import the CSS file for styling

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          Copyright © Government College Of Engineering - Thanjavur , 2024.
          Designed by &nbsp;
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/gopu-v-7a319b113"
          >
            Gopu
          </a>
        </p>
        <ul className="footer-links">
          <li>
            <a href="#privacy">Privacy Policy</a>
          </li>
          <li>
            <a href="#terms">Terms of Service</a>
          </li>
          <li>
            <a href="#contact">Contact Us</a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
