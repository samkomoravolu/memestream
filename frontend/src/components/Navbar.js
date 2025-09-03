import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            MemeStream
          </Link>
          <div className="navbar-nav">
            {user ? (
              <>
                <Link to="/upload" className="nav-link">
                  Upload GIF
                </Link>
                <span className="nav-link">
                  Welcome, {user.email}
                </span>
                <button onClick={onLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
