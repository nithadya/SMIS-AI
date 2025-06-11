import React from 'react';
import { motion } from 'framer-motion';

export const MagicCard = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl
        bg-white/10 dark:bg-secondary-900/50
        backdrop-blur-sm border border-secondary-200/10 dark:border-secondary-800/10
        shadow-sm hover:shadow-md
        transition-all duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      whileTap={{ scale: onClick ? 0.99 : 1 }}
    >
      {children}
      <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-br from-primary-500/5 via-accent-500/5 to-primary-500/5" />
    </motion.div>
  );
}; 