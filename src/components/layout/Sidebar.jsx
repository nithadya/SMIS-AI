import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();

  const navItems = [
    { title: 'Dashboard', icon: '📊', path: '/dashboard' },
    { title: 'Student Management', icon: '👨‍🎓', path: '/student-management' },
    { title: 'Inquiry Management', icon: '❓', path: '/inquiry-management' },
    { title: 'Programs', icon: '📚', path: '/programs' },
    { title: 'Batches', icon: '👥', path: '/batches' },
    { title: 'Enrollments', icon: '📝', path: '/enrollments' },
    { title: 'Registrations', icon: '✍️', path: '/registrations' },
    { title: 'Schedules', icon: '📅', path: '/schedules' },
    { title: 'Payments', icon: '💰', path: '/payments' },
    { title: 'Currency Support', icon: '💱', path: '/currency-support' },
    { title: 'Student Discount', icon: '🏷️', path: '/student-discount' },
    { title: 'Analytics', icon: '📈', path: '/analytics' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <h2>{isCollapsed ? 'SMIS' : 'SMIS ICBT'}</h2>
          {!isCollapsed && (
            <p className="subtitle">
              Student Management<br />Information System
            </p>
          )}
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-text">{item.title}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 