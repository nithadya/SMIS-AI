import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const InquiryStats = ({ inquiries = [] }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthInquiries = inquiries.filter(inq => new Date(inq.created_at) >= lastMonth);
    const prevMonthInquiries = inquiries.filter(inq => {
      const date = new Date(inq.created_at);
      return date >= new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()) &&
             date < lastMonth;
    });

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const growth = ((current - previous) / previous) * 100;
      return growth > 0 ? `+${growth.toFixed(0)}%` : `${growth.toFixed(0)}%`;
    };

    const bySource = inquiries.reduce((acc, inq) => {
      const sourceName = inq.sources?.name || 'Unknown';
      acc[sourceName] = (acc[sourceName] || 0) + 1;
      return acc;
    }, {});

    const totalConverted = inquiries.filter(inq => inq.status === 'converted').length;
    const totalInquiries = inquiries.length;
    const conversionRate = totalInquiries > 0 
      ? ((totalConverted / totalInquiries) * 100).toFixed(1)
      : 0;

    const sourceConversionRates = Object.entries(bySource).reduce((acc, [source, count]) => {
      const convertedFromSource = inquiries.filter(
        inq => inq.sources?.name === source && inq.status === 'converted'
      ).length;
      acc[source] = count > 0 ? ((convertedFromSource / count) * 100).toFixed(1) : 0;
      return acc;
    }, {});

    return {
      total: {
        count: inquiries.length,
        trend: calculateGrowth(lastMonthInquiries.length, prevMonthInquiries.length)
      },
      new: {
        count: inquiries.filter(inq => inq.status === 'new').length,
        trend: '+0%'
      },
      followUp: {
        count: inquiries.filter(inq => inq.status === 'follow-up').length,
        trend: '+0%'
      },
      converted: {
        count: totalConverted,
        trend: '+0%'
      },
      conversionRates: {
        overall: parseFloat(conversionRate),
        ...Object.entries(sourceConversionRates).reduce((acc, [key, value]) => {
          acc[key.toLowerCase().replace(/\s+/g, '')] = parseFloat(value);
          return acc;
        }, {})
      }
    };
  }, [inquiries]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard 
        title="Total Inquiries" 
        count={stats.total.count}
        trend={stats.total.trend}
      />
      <StatCard 
        title="New Inquiries" 
        count={stats.new.count}
        trend={stats.new.trend}
      />
      <StatCard 
        title="Follow-ups" 
        count={stats.followUp.count}
        trend={stats.followUp.trend}
      />
      <StatCard 
        title="Converted" 
        count={stats.converted.count}
        trend={stats.converted.trend}
      />

      <div className="md:col-span-2 lg:col-span-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Conversion Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ConversionBar label="Overall" rate={stats.conversionRates.overall} />
              {stats.conversionRates.webform && (
                <ConversionBar label="Web Form" rate={stats.conversionRates.webform} />
              )}
              {stats.conversionRates.phone && (
                <ConversionBar label="Phone" rate={stats.conversionRates.phone} />
              )}
            </div>
            <div>
              {stats.conversionRates.email && (
                <ConversionBar label="Email" rate={stats.conversionRates.email} />
              )}
              {stats.conversionRates.walkin && (
                <ConversionBar label="Walk-in" rate={stats.conversionRates.walkin} />
              )}
              {stats.conversionRates.socialmedia && (
                <ConversionBar label="Social Media" rate={stats.conversionRates.socialmedia} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryStats; 