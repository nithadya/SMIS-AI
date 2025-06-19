import React, { useState, useEffect } from 'react';
import { getInquiryStats } from '../../lib/api/inquiries';

const InquiryStats = ({ filters }) => {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    followUp: 0,
    converted: 0,
    completed: 0,
    lost: 0,
    conversionRate: 0,
    responseRate: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await getInquiryStats(filters);
      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      // Calculate conversion metrics
      const total = data.total || 0;
      const converted = data.converted || 0;
      const completed = data.completed || 0;
      const contacted = data.contacted || 0;
      const lost = data.lost || 0;

      // Conversion rate: (converted + completed) / total inquiries
      const conversionRate = total > 0 ? ((converted + completed) / total * 100) : 0;
      
      // Response rate: (contacted + follow-up + converted + completed) / total
      const responded = contacted + (data.followUp || 0) + converted + completed;
      const responseRate = total > 0 ? (responded / total * 100) : 0;

      setStats({
        ...data,
        conversionRate: Math.round(conversionRate * 100) / 100,
        responseRate: Math.round(responseRate * 100) / 100,
        avgResponseTime: data.avgResponseTime || 0
      });
    } catch (error) {
      console.error('Error fetching inquiry stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color = 'blue', trend = null }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}
            {title.includes('Rate') && '%'}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Inquiries"
        value={stats.total}
        subtitle="All time inquiries"
        color="blue"
      />
      
      <StatCard
        title="Conversion Rate"
        value={stats.conversionRate}
        subtitle={`${stats.converted + stats.completed} converted`}
        color="green"
      />
      
      <StatCard
        title="Response Rate"
        value={stats.responseRate}
        subtitle="Inquiries contacted"
        color="purple"
      />
      
      <StatCard
        title="Average Response Time"
        value={stats.avgResponseTime}
        subtitle="Hours to first contact"
        color="orange"
      />

      {/* Status Breakdown */}
      <StatCard
        title="New Inquiries"
        value={stats.new}
        subtitle="Awaiting first contact"
        color="blue"
      />
      
      <StatCard
        title="In Progress"
        value={stats.contacted + stats.followUp}
        subtitle="Active follow-ups"
        color="yellow"
      />
      
      <StatCard
        title="Ready to Convert"
        value={stats.converted}
        subtitle="Ready for enrollment"
        color="green"
      />
      
      <StatCard
        title="Lost Opportunities"
        value={stats.lost}
        subtitle="Not interested/unreachable"
        color="red"
      />
    </div>
  );
};

export default InquiryStats; 