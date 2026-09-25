import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ isDark, toggleTheme }) => {
  const { pathname } = useLocation();

  if (pathname === "/forge") {
    return null;
  }

  return (
    <nav className="nav-bar">
      <Link to="/" className="nav-item">
        HOME
      </Link>
      <Link to="/projects" className="nav-item">
        PROJECTS
      </Link>
      <Link to="/research" className="nav-item">
        RESEARCH
      </Link>
      <Link to="/experience" className="nav-item">
        EXPERIENCE
      </Link>
      <Link to="/contact" className="nav-item">
        CONTACT
      </Link>
      <div className="nav-bar-right">
        <div
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <svg
              className="theme-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              className="theme-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
