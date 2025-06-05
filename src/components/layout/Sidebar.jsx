import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();

  const navSections = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', icon: '📊', path: '/dashboard' },
        { title: 'Analytics', icon: '📈', path: '/analytics' },
      ]
    },
    {
      title: 'Student Management',
      items: [
        { title: 'Students', icon: '👨‍🎓', path: '/student-management' },
        { title: 'Inquiries', icon: '❓', path: '/inquiry-management' },
        { title: 'Enrollments', icon: '📝', path: '/enrollments' },
        { title: 'Registrations', icon: '✍️', path: '/registrations' },
      ]
    },
    {
      title: 'Academic',
      items: [
        { title: 'Programs', icon: '📚', path: '/programs' },
        { title: 'Batches', icon: '👥', path: '/batches' },
        { title: 'Schedules', icon: '📅', path: '/schedules' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { title: 'Payments', icon: '💰', path: '/payments' },
        { title: 'Currency', icon: '💱', path: '/currency-support' },
        { title: 'Discounts', icon: '🏷️', path: '/student-discount' },
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => `
        flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group
        ${isActive ? 
          'bg-gradient-to-r from-primary-400/20 to-accent-400/20 glow-sm text-primary-500 dark:text-primary-400' : 
          'hover:bg-secondary-100/50 dark:hover:bg-secondary-800/50 text-secondary-600 dark:text-secondary-400'
        }
      `}
    >
      <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
      {!isCollapsed && (
        <motion.span 
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="ml-3 font-medium"
        >
          {item.title}
        </motion.span>
      )}
    </NavLink>
  );

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen glass fixed left-0 top-0 z-30 border-r border-secondary-200/10 dark:border-secondary-800/10"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-secondary-200/10 dark:border-secondary-800/10">
          <motion.div 
            className="flex items-center space-x-3"
            animate={{ opacity: isCollapsed ? 0.5 : 1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            {!isCollapsed && (
              <motion.h1 
                className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                SMIS
              </motion.h1>
            )}
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-200 dark:scrollbar-thumb-secondary-700 scrollbar-track-transparent">
          <motion.nav 
            className="p-4 space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {navSections.map((section) => (
              <motion.div key={section.title} variants={item}>
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <motion.div key={item.path} variants={item}>
                      <NavItem item={item} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.nav>
        </div>

        <div className="p-4 border-t border-secondary-200/10 dark:border-secondary-800/10">
          <motion.div 
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-secondary-100/50 dark:hover:bg-secondary-800/50 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xl group-hover:rotate-12 transition-transform">⚙️</span>
            {!isCollapsed && (
              <motion.span 
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium text-secondary-600 dark:text-secondary-400"
              >
                Settings
              </motion.span>
            )}
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar; 