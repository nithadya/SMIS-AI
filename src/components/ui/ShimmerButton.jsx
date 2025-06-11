import React from 'react';
import { motion } from 'framer-motion';

export const ShimmerButton = ({ 
  children, 
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center px-6 py-2 
        overflow-hidden rounded-lg bg-gradient-to-r from-primary-500 to-accent-500
        text-white font-medium group focus:outline-none focus:ring-2 
        focus:ring-primary-500 focus:ring-offset-2 hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative">
        {children}
      </span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{ maskImage: 'linear-gradient(to right, transparent, white, transparent)' }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </motion.button>
  );
}; 