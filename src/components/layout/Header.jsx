import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../common/Toast';

// Icons
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  SunIcon, 
  MoonIcon, 
  Bars3Icon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast.loading('Searching...');
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    showToast.success('Logged out successfully');
    navigate('/', { replace: true });
    setShowUserMenu(false);
  };

  const menuItems = [
    { label: 'Profile Settings', onClick: () => navigate('/profile') },
    { label: 'Account Settings', onClick: () => navigate('/account') },
    { label: 'Logout', onClick: handleLogout, danger: true },
  ];

  // Get initials from user email
  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email
      .split('@')[0]
      .split('.')
      .map(part => part[0].toUpperCase())
      .join('');
  };

  // Get user role with first letter capitalized
  const getUserRole = () => {
    if (!user?.role) return 'User';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <header className={`fixed top-0 right-0 h-16 z-30 left-[256px] group-[.sidebar-collapsed]/sidebar:left-[80px] transition-all duration-300 glass`}>
      <div className="flex justify-between items-center h-full px-4">
        <div className="flex items-center space-x-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-lg glass hover:glow-sm transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className={`w-6 h-6 ${isDark ? 'text-secondary-400' : 'text-secondary-600'}`} />
          </motion.button>
          
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative group">
              <motion.input
                initial={false}
                animate={{ width: searchQuery ? '300px' : '240px' }}
                transition={{ duration: 0.2 }}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg glass transition-all duration-200 focus:glow-sm"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg glass hover:glow-sm transition-all duration-200"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-secondary-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-secondary-600" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg glass hover:glow-sm transition-all duration-200"
          >
            <BellIcon className={`w-5 h-5 ${isDark ? 'text-secondary-400' : 'text-secondary-600'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse-glow" />
          </motion.button>
          
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-2 pr-3 py-1.5 rounded-lg glass hover:glow-sm transition-all duration-200"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-sm font-semibold animate-shimmer overflow-hidden">
                  {getInitials()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-main rounded-full border-2 border-white dark:border-secondary-800" />
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-secondary-200' : 'text-secondary-900'
                }`}>{user?.email?.split('@')[0] || 'User'}</p>
                <p className={`text-xs ${
                  isDark ? 'text-secondary-400' : 'text-secondary-500'
                }`}>{getUserRole()}</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 ${isDark ? 'text-secondary-400' : 'text-secondary-600'}`} />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute right-0 mt-2 w-56 rounded-lg glass glow-sm py-1"
                >
                  {menuItems.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <motion.button 
                        whileHover={{ x: 4 }}
                        onClick={item.onClick}
                        className={`w-full px-4 py-2 text-left text-sm ${
                          item.danger
                            ? 'text-error-main hover:bg-error-light/10'
                            : isDark
                              ? 'text-secondary-200 hover:bg-secondary-700/50'
                              : 'text-secondary-700 hover:bg-secondary-50/50'
                        }`}
                      >
                        {item.label}
                      </motion.button>
                      {index < menuItems.length - 1 && (
                        <div className={`my-1 border-t ${
                          isDark ? 'border-secondary-700/50' : 'border-secondary-200/50'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 