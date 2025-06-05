import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { Toast } from '../common/Toast';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    } ${isSidebarCollapsed ? 'group/sidebar sidebar-collapsed' : ''}`}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sidebar isCollapsed={isSidebarCollapsed} />
          <Header toggleSidebar={toggleSidebar} />
          
          <main className={`pt-20 pb-8 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>

          {/* Mobile overlay */}
          {isMobile && !isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={toggleSidebar}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <Toast />
    </div>
  );
};

export default Layout; 