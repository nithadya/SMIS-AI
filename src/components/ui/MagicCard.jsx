import React from 'react';
import { motion } from 'framer-motion';

export const MagicCard = ({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(120, 119, 198, 0.1)',
  hoverScale = 1.02,
  showSpotlight = true,
  showGlow = true,
  showGradient = true,
  showShineBorder = true
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!showSpotlight) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      className={`
        relative overflow-hidden rounded-xl
        ${showGlow ? 'hover:glow-sm' : ''}
        ${className}
      `}
      onMouseMove={handleMouseMove}
    >
      {showSpotlight && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 40%)`,
          }}
        />
      )}
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/10 to-accent-400/10 animate-gradient-x" />
      )}
      <div className="relative z-10">
        {children}
      </div>
      {showShineBorder && (
        <div className="absolute inset-0 pointer-events-none shine-border" />
      )}
    </motion.div>
  );
}; 