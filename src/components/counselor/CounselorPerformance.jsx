import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagicCard, AnimatedList, ScrollProgress } from '../ui';

const CounselorPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCounselor, setSelectedCounselor] = useState('all');

  // Mock data for demonstration
  const counselorData = {
    overview: {
      totalCounselors: 25,
      activeCounselors: 22,
      totalAssignments: 892,
      averageRating: 4.6
    },
    counselors: [
      {
        id: 1,
        name: 'Sarah Wilson',
        role: 'Senior Marketing Counselor',
        activeStudents: 45,
        conversionRate: 68,
        rating: 4.8,
        performance: {
          inquiriesHandled: 156,
          conversions: 89,
          followUps: 234,
          avgResponseTime: '2h 15m'
        }
      },
      {
        id: 2,
        name: 'Michael Chen',
        role: 'Marketing Counselor',
        activeStudents: 38,
        conversionRate: 62,
        rating: 4.5,
        performance: {
          inquiriesHandled: 142,
          conversions: 72,
          followUps: 198,
          avgResponseTime: '1h 45m'
        }
      },
      {
        id: 3,
        name: 'Emma Thompson',
        role: 'Senior Marketing Counselor',
        activeStudents: 42,
        conversionRate: 71,
        rating: 4.7,
        performance: {
          inquiriesHandled: 168,
          conversions: 94,
          followUps: 256,
          avgResponseTime: '1h 55m'
        }
      }
    ],
    performanceMetrics: {
      averageConversionRate: 65,
      averageResponseTime: '2h',
      averageFollowUps: 215,
      studentSatisfaction: 92
    },
    recentInteractions: [
      {
        id: 1,
        counselor: 'Sarah Wilson',
        student: 'John Doe',
        type: 'Initial Consultation',
        outcome: 'Program Enrollment',
        rating: 5,
        date: '2024-03-15T10:30:00'
      },
      {
        id: 2,
        counselor: 'Michael Chen',
        student: 'Alice Brown',
        type: 'Follow-up Meeting',
        outcome: 'Information Provided',
        rating: 4,
        date: '2024-03-15T11:45:00'
      },
      {
        id: 3,
        counselor: 'Emma Thompson',
        student: 'David Lee',
        type: 'Program Guidance',
        outcome: 'Application Started',
        rating: 5,
        date: '2024-03-15T14:20:00'
      }
    ],
    insights: [
      {
        id: 1,
        type: 'Performance',
        insight: 'Counselors with follow-up intervals under 48 hours show 25% higher conversion rates',
        recommendation: 'Implement automated follow-up reminders for all counselors',
        impact: 'High'
      },
      {
        id: 2,
        type: 'Workload',
        insight: 'Current student-to-counselor ratio is approaching optimal threshold',
        recommendation: 'Consider hiring 2 additional counselors for next quarter',
        impact: 'Medium'
      },
      {
        id: 3,
        type: 'Quality',
        insight: 'Video consultations receive 15% higher satisfaction ratings',
        recommendation: 'Encourage more video-based counseling sessions',
        impact: 'High'
      }
    ]
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Counselor Performance
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Monitor and optimize counselor effectiveness and student interactions
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
        <select
          value={selectedCounselor}
          onChange={(e) => setSelectedCounselor(e.target.value)}
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
        >
          <option value="all">All Counselors</option>
          {counselorData.counselors.map(counselor => (
            <option key={counselor.id} value={counselor.id}>
              {counselor.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Team Overview
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Total Counselors</span>
            <span className="text-2xl font-semibold text-primary-500">{counselorData.overview.totalCounselors}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Active Counselors</span>
            <span className="text-2xl font-semibold text-success-main">{counselorData.overview.activeCounselors}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Total Assignments</span>
            <span className="text-2xl font-semibold text-info-main">{counselorData.overview.totalAssignments}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Average Rating</span>
            <span className="text-2xl font-semibold text-warning-main">{counselorData.overview.averageRating} ⭐</span>
          </div>
        </div>
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Performance Metrics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Conversion Rate</span>
            <span className="text-2xl font-semibold text-success-main">{counselorData.performanceMetrics.averageConversionRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Response Time</span>
            <span className="text-2xl font-semibold text-primary-500">{counselorData.performanceMetrics.averageResponseTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Avg Follow-ups</span>
            <span className="text-2xl font-semibold text-info-main">{counselorData.performanceMetrics.averageFollowUps}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Satisfaction</span>
            <span className="text-2xl font-semibold text-warning-main">{counselorData.performanceMetrics.studentSatisfaction}%</span>
          </div>
        </div>
      </MagicCard>

      <MagicCard className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Top Performing Counselors
        </h3>
        <div className="space-y-4">
          {counselorData.counselors.map((counselor) => (
            <motion.div
              key={counselor.id}
              className="glass p-4 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-secondary-700 dark:text-secondary-300">
                    {counselor.name}
                  </h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {counselor.role}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Conversion Rate
                  </p>
                  <p className="text-lg font-semibold text-success-main">
                    {counselor.conversionRate}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </MagicCard>
    </div>
  );

  const renderCounselorDetails = () => (
    <MagicCard className="p-6 mb-6">
      <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
        Counselor Performance Details
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200 dark:border-secondary-700">
              <th className="text-left py-3 px-4">Counselor</th>
              <th className="text-left py-3 px-4">Active Students</th>
              <th className="text-left py-3 px-4">Inquiries</th>
              <th className="text-left py-3 px-4">Conversions</th>
              <th className="text-left py-3 px-4">Follow-ups</th>
              <th className="text-left py-3 px-4">Response Time</th>
              <th className="text-left py-3 px-4">Rating</th>
            </tr>
          </thead>
          <tbody>
            {counselorData.counselors.map((counselor) => (
              <motion.tr
                key={counselor.id}
                className="border-b border-secondary-200 dark:border-secondary-700 last:border-0"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              >
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-secondary-700 dark:text-secondary-300">{counselor.name}</div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">{counselor.role}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-secondary-600 dark:text-secondary-400">{counselor.activeStudents}</td>
                <td className="py-3 px-4 text-secondary-600 dark:text-secondary-400">{counselor.performance.inquiriesHandled}</td>
                <td className="py-3 px-4 text-success-main">{counselor.performance.conversions}</td>
                <td className="py-3 px-4 text-secondary-600 dark:text-secondary-400">{counselor.performance.followUps}</td>
                <td className="py-3 px-4 text-secondary-600 dark:text-secondary-400">{counselor.performance.avgResponseTime}</td>
                <td className="py-3 px-4">
                  <span className="text-warning-main">{counselor.rating} ⭐</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </MagicCard>
  );

  const renderRecentInteractions = () => (
    <MagicCard className="p-6 mb-6">
      <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
        Recent Interactions
      </h3>
      <AnimatedList
        as="div"
        className="space-y-4"
        animation="fade-up"
        staggerDelay={0.1}
      >
        {counselorData.recentInteractions.map((interaction) => (
          <motion.div
            key={interaction.id}
            className="glass p-4 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="font-medium text-secondary-700 dark:text-secondary-300">
                    {interaction.counselor}
                  </h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {interaction.type} with {interaction.student}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-success-main">
                  {interaction.outcome}
                </p>
                <p className="text-sm text-secondary-500">
                  {new Date(interaction.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatedList>
    </MagicCard>
  );

  const renderInsights = () => (
    <MagicCard className="p-6">
      <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
        Performance Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {counselorData.insights.map((insight) => (
          <motion.div
            key={insight.id}
            className="glass p-4 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {insight.type === 'Performance' ? '📈' :
                 insight.type === 'Workload' ? '⚖️' : '⭐'}
              </span>
              <h4 className="font-medium text-secondary-700 dark:text-secondary-300">
                {insight.type}
              </h4>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-3 text-sm">
              {insight.insight}
            </p>
            <div className="bg-secondary-50 dark:bg-secondary-800 p-3 rounded-lg mb-3">
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {insight.recommendation}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                insight.impact === 'High' ? 'bg-success-main/10 text-success-main' :
                'bg-warning-main/10 text-warning-main'
              }`}>
                {insight.impact} Impact
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </MagicCard>
  );

  return (
    <>
      <ScrollProgress />
      <div className="p-6">
        {renderHeader()}
        {renderOverviewCards()}
        {renderCounselorDetails()}
        {renderRecentInteractions()}
        {renderInsights()}
      </div>
    </>
  );
};

export default CounselorPerformance; 