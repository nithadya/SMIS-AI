import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagicCard, AnimatedList, ScrollProgress } from '../ui';
import { ALL_PROGRAMS } from '../../constants/programs';

const StudentManagement2 = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    program: 'all',
    batch: 'all',
    status: 'all',
    performanceLevel: 'all'
  });

  // Mock data for demonstration - updated with real ICBT programs
  const studentData = {
    overview: {
      totalStudents: 5909,
      activeStudents: 4521,
      onLeave: 234,
      graduated: 892,
      atRisk: 162,
      performanceMetrics: {
        highPerformers: 1247,
        averagePerformers: 2853,
        needsAttention: 421
      }
    },
    retentionAnalytics: {
      overallRate: 92,
      byProgram: {
        'BSc (Hons) Software Engineering': 94,
        'BSc (Hons) Business and Management': 91,
        'BSc (Hons) Information Technology in Artificial Intelligence': 89,
        'BSc (Hons) Digital Marketing': 88,
        'Higher Diploma in Computing and Software Engineering': 90,
        'BSc (Hons) in Psychology': 93
      },
      predictedChurnRisk: {
        high: 162,
        medium: 348,
        low: 4011
      }
    },
    recentActivity: [
      {
        id: 1,
        student: 'John Doe',
        action: 'Grade Update',
        details: 'Final Project: A+',
        timestamp: '2024-03-15T10:30:00'
      },
      {
        id: 2,
        student: 'Jane Smith',
        action: 'Attendance Alert',
        details: 'Missed 3 consecutive classes',
        timestamp: '2024-03-15T09:15:00'
      },
      {
        id: 3,
        student: 'Mike Johnson',
        action: 'Performance Improvement',
        details: 'GPA increased by 0.5',
        timestamp: '2024-03-14T16:45:00'
      }
    ],
    aiInsights: [
      {
        id: 1,
        type: 'Performance',
        insight: 'Students in BSc (Hons) Software Engineering evening batch show 15% better performance in practical assignments',
        recommendation: 'Consider adjusting morning batch teaching methods to match evening success patterns',
        confidence: 89
      },
      {
        id: 2,
        type: 'Retention',
        insight: 'Students in Higher Diploma programs with peer mentor support are 25% more likely to complete their program',
        recommendation: 'Expand peer mentoring program to all first-year students',
        confidence: 92
      },
      {
        id: 3,
        type: 'Academic',
        insight: 'BSc (Hons) Information Technology in AI students who complete early assignments show 30% higher final grades',
        recommendation: 'Implement early warning system for assignment tracking in AI program',
        confidence: 87
      }
    ]
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Comprehensive student data and analytics platform
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students..."
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300 min-w-[200px]"
        />
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
        >
          <option value="overview">Overview</option>
          <option value="academic">Academic Records</option>
          <option value="analytics">Analytics</option>
          <option value="predictions">AI Predictions</option>
        </select>
      </div>
    </div>
  );

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Student Distribution
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Active Students</span>
            <span className="text-2xl font-semibold text-primary-500">{studentData.overview.activeStudents}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">On Leave</span>
            <span className="text-2xl font-semibold text-warning-main">{studentData.overview.onLeave}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Graduated</span>
            <span className="text-2xl font-semibold text-success-main">{studentData.overview.graduated}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">At Risk</span>
            <span className="text-2xl font-semibold text-error-main">{studentData.overview.atRisk}</span>
          </div>
        </div>
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Performance Overview
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">High Performers</span>
            <span className="text-2xl font-semibold text-success-main">
              {studentData.overview.performanceMetrics.highPerformers}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Average Performers</span>
            <span className="text-2xl font-semibold text-info-main">
              {studentData.overview.performanceMetrics.averagePerformers}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Needs Attention</span>
            <span className="text-2xl font-semibold text-warning-main">
              {studentData.overview.performanceMetrics.needsAttention}
            </span>
          </div>
        </div>
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
          Retention Analytics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary-600 dark:text-secondary-400">Overall Rate</span>
            <span className="text-2xl font-semibold text-primary-500">{studentData.retentionAnalytics.overallRate}%</span>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Churn Risk Distribution</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-error-main">High Risk</span>
              <span className="font-semibold text-error-main">{studentData.retentionAnalytics.predictedChurnRisk.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-warning-main">Medium Risk</span>
              <span className="font-semibold text-warning-main">{studentData.retentionAnalytics.predictedChurnRisk.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-success-main">Low Risk</span>
              <span className="font-semibold text-success-main">{studentData.retentionAnalytics.predictedChurnRisk.low}</span>
            </div>
          </div>
        </div>
      </MagicCard>
    </div>
  );

  const renderAIInsights = () => (
    <MagicCard className="p-6 mb-6">
      <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
        AI-Driven Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentData.aiInsights.map((insight) => (
          <motion.div
            key={insight.id}
            className="glass p-4 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {insight.type === 'Performance' ? '📊' :
                 insight.type === 'Retention' ? '🎯' : '📚'}
              </span>
              <h4 className="font-medium text-secondary-700 dark:text-secondary-300">
                {insight.type}
              </h4>
            </div>
            <p className="text-secondary-600 dark:text-secondary-400 mb-3 text-sm">
              {insight.insight}
            </p>
            <div className="bg-secondary-50 dark:bg-secondary-800 p-3 rounded-lg mb-3">
              <p className="text-sm font-medium text-primary-500">
                Recommendation:
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {insight.recommendation}
              </p>
            </div>
            <div className="text-sm text-secondary-500">
              Confidence: {insight.confidence}%
            </div>
          </motion.div>
        ))}
      </div>
    </MagicCard>
  );

  const renderRecentActivity = () => (
    <MagicCard className="p-6">
      <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
        Recent Activity
      </h3>
      <AnimatedList
        as="div"
        className="space-y-4"
        animation="fade-up"
        staggerDelay={0.1}
      >
        {studentData.recentActivity.map((activity) => (
          <motion.div
            key={activity.id}
            className="glass p-4 rounded-xl flex items-center justify-between"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                {activity.action === 'Grade Update' ? '📝' :
                 activity.action === 'Attendance Alert' ? '⚠️' : '📈'}
              </span>
              <div>
                <h4 className="font-medium text-secondary-700 dark:text-secondary-300">
                  {activity.student}
                </h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {activity.action}: {activity.details}
                </p>
              </div>
            </div>
            <span className="text-sm text-secondary-500">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
      </AnimatedList>
    </MagicCard>
  );

  return (
    <>
      <ScrollProgress />
      <div className="p-6">
        {renderHeader()}
        {renderOverviewCards()}
        {renderAIInsights()}
        {renderRecentActivity()}
      </div>
    </>
  );
};

export default StudentManagement2; 