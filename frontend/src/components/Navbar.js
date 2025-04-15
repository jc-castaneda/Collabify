import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logoPath from '../assets/collabify-logo.png'; // Make sure to add the logo image to your assets folder

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoPath} alt="Collabify" className="logo-image" />
          <span className="logo-text">collabify</span>
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`hamburger ${isOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profiles" className="nav-link" onClick={() => setIsOpen(false)}>
              Discover
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/friends" className="nav-link" onClick={() => setIsOpen(false)}>
              Friends
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/messages" className="nav-link" onClick={() => setIsOpen(false)}>
              Messages
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/upload" className="nav-link" onClick={() => setIsOpen(false)}>
              Upload
            </Link>
          </li>
          <li className="nav-item profile-item">
            <Link to="/profile" className="nav-link profile-link" onClick={() => setIsOpen(false)}>
              <div className="profile-circle">
                <span>JD</span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;