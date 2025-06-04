import React from 'react';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <span className="hamburger"></span>
        </button>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>
      
      <div className="header-actions">
        <button className="notification-btn">
          <span className="notification-icon">🔔</span>
          <span className="notification-badge">3</span>
        </button>
        <div className="user-profile">
          <img
            src="https://via.placeholder.com/40"
            alt="User"
            className="profile-image"
          />
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 