import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthToken, logoutUser, fetchCurrentUserProfile } from "../api";
import "../styles/Navbar.css";
import logoPath from "../assets/collabify-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [me, setMe] = useState(null);
  const isAuthenticated = !!getAuthToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUserProfile()
        .then((data) => setMe(data))
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, [isAuthenticated]);

  const toggleMenu = () => setIsOpen((o) => !o);
  const closeMenu  = () => setIsOpen(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
    window.location.reload();
  };

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
            <span></span><span></span><span></span>
          </div>
        </div>

        <ul className={`nav-menu ${isOpen ? "active" : ""} touch-friendly`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/profiles" className="nav-link" onClick={closeMenu}>
                  Discover
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/feed" className="nav-link" onClick={closeMenu}>
                  Feed
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/friends" className="nav-link" onClick={closeMenu}>
                  Friends
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/messages" className="nav-link" onClick={closeMenu}>
                  Messages
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload" className="nav-link" onClick={closeMenu}>
                  Upload
                </Link>
              </li>
              <li className="nav-item profile-item">
                <Link
                  to="/profile"
                  className="nav-link profile-link"
                  onClick={closeMenu}
                >
                  {me && me.profile_picture ? (
                    <img
                      src={me.profile_picture}
                      alt={me.username}
                      className="profile-circle"
                    />
                  ) : (
                    <div className="profile-circle">
                      <span>
                        {me
                          ? me.username.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={closeMenu}>
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
