import React from 'react';
import './Header.css'; // Import the CSS file
import Navigation from '../nav/Nav';
import logo from '../../assets/logo.png';
import tnLogo from '../../assets/tn-logo.jpg';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="GCETJ logo" />
          </Link>
        </div>
        <div className="header-text">
          <p>CENTRE FOR ALUMNI RELATIONS AND CORPORATE AFFAIRS</p>
          <p>GOVERNMENT COLLEGE OF ENGINEERING, THANJAVUR - 613402.</p>
        </div>
        <div className="header-actions">
          <div className="logo">
            <Link to="/">
              <img src={tnLogo} alt="TN logo" />
            </Link>
          </div>
        </div>
      </div>

      <Navigation />
    </header>
  );
};

export default Header;
