import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken, logoutUser } from "../api";
import "../styles/Navbar.css";
import logoPath from "../assets/collabify-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = !!getAuthToken();
  const navigate = useNavigate();
  const closeMenu = () => {
    setIsOpen(false);
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
    window.location.reload(); // Force reload to update auth state
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".navbar-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoPath} alt="Collabify" className="logo-image" />
          <span className="logo-text">collabify</span>
        </Link>

        <div
          className="menu-icon"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Menu"
        >
          <div className={`hamburger ${isOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <ul className={`nav-menu ${isOpen ? "active" : ""} touch-friendly`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link
                  to="/profiles"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Discover
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/feed"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Feed
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/friends"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Friends
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/messages"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Messages
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/upload"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Upload
                </Link>
              </li>
              <li className="nav-item profile-item">
                <Link
                  to="/profile"
                  className="nav-link profile-link"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="profile-circle">
                    <span>U</span>
                  </div>
                </Link>
              </li>
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/login"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/register"
                  className="nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
