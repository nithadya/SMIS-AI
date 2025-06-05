import React from 'react';
import { motion } from 'framer-motion';

const InquiryStats = () => {
  // Mock data for demonstration
  const stats = {
    total: {
      count: 156,
      trend: '+12%'
    },
    new: {
      count: 45,
      trend: '+8%'
    },
    followUp: {
      count: 78,
      trend: '+15%'
    },
    converted: {
      count: 23,
      trend: '+5%'
    }
  };

  const conversionRates = {
    overall: 68,
    web: 72,
    phone: 65,
    email: 58,
    walkIn: 85
  };

  const StatCard = ({ title, count, trend }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl glass p-6 hover:glow-sm transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400/10 to-accent-400/10 animate-gradient-x" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent animate-text-gradient">{title}</h3>
          <span className={`text-sm px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-success-light text-success-main' : 'bg-warning-light text-warning-main'}`}>
            {trend}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-4xl font-bold text-secondary-700 dark:text-secondary-200">{count}</span>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none shine-border" />
    </motion.div>
  );

  const ConversionBar = ({ label, rate }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-secondary-600 dark:text-secondary-400">{label}</span>
        <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{rate}%</span>
      </div>
      <div className="relative h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full glow-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"
      >
        Inquiry Statistics
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Inquiries" count={stats.total.count} trend={stats.total.trend} />
        <StatCard title="New Inquiries" count={stats.new.count} trend={stats.new.trend} />
        <StatCard title="Follow-ups" count={stats.followUp.count} trend={stats.followUp.trend} />
        <StatCard title="Converted" count={stats.converted.count} trend={stats.converted.trend} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Conversion Rates
        </h3>
        <div className="space-y-4">
          <ConversionBar label="Overall" rate={conversionRates.overall} />
          <ConversionBar label="Web Inquiries" rate={conversionRates.web} />
          <ConversionBar label="Phone Inquiries" rate={conversionRates.phone} />
          <ConversionBar label="Email Inquiries" rate={conversionRates.email} />
          <ConversionBar label="Walk-in Inquiries" rate={conversionRates.walkIn} />
        </div>
      </motion.div>
    </div>
  );
};

export default InquiryStats; 