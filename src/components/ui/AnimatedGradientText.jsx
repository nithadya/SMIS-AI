import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedGradientText = ({ children, className = '' }) => {
  return (
    <motion.span
      className={`bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      animate={{
        backgroundPosition: ['0%', '100%', '0%'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}; 