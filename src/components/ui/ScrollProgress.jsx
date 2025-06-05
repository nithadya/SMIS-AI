import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgress = ({
  color = 'from-primary-400 to-accent-400',
  height = 'h-1',
  position = 'top', // 'top' or 'bottom'
  showGradient = true,
  showGlow = true
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} z-50 ${height} origin-left
        ${showGradient ? `bg-gradient-to-r ${color}` : 'bg-primary-400'}
        ${showGlow ? 'glow-sm' : ''}
      `}
      style={{ scaleX }}
    />
  );
}; 