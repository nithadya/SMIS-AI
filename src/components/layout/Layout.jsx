import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AppRoutes from '../../routes';
import './Layout.css';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Router>
      <div className="layout">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <div className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <Header toggleSidebar={toggleSidebar} />
          <main className="content">
            <AppRoutes />
          </main>
        </div>
      </div>
    </Router>
  );
};

export default Layout; 