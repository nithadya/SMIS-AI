import React from 'react';
import { motion } from 'framer-motion';
import { MagicCard } from '../ui';

const StatCard = ({ title, value, icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    accent: 'from-accent-400 to-accent-600',
    success: 'from-success-main to-success-dark',
    warning: 'from-warning-main to-warning-dark',
    error: 'from-error-main to-error-dark',
    info: 'from-info-main to-info-dark'
  };

  const trendColor = trend?.startsWith('+') ? 'text-success-main' : 'text-error-main';

  return (
    <MagicCard 
      className="p-6"
      showGradient={false}
      hoverScale={1.03}
    >
      <div className="flex items-center gap-4 group">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg text-xl`}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm text-secondary-500 dark:text-secondary-400 font-medium transition-colors">
              {title}
            </h3>
            {trend && (
              <span className={`text-sm font-medium ${trendColor}`}>
                {trend}
              </span>
            )}
          </div>
          <p className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </div>
    </MagicCard>
  );
};

export default StatCard; 