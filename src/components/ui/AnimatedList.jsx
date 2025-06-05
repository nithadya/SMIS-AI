import React from 'react';
import { motion } from 'framer-motion';

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const AnimatedList = ({ 
  children,
  className = '',
  itemClassName = '',
  as = 'div',
  staggerDelay = 0.1,
  animation = 'fade-up', // 'fade-up', 'fade-down', 'fade-left', 'fade-right'
  gridCols = '',
  gap = 'gap-6'
}) => {
  const animations = {
    'fade-up': { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } },
    'fade-down': { hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 } },
    'fade-left': { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } },
    'fade-right': { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const MotionComponent = motion[as];

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`${gridCols} ${gap} ${className}`}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={animations[animation]}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </MotionComponent>
  );
}; 