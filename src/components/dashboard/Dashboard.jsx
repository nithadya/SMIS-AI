import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagicCard, AnimatedList, ScrollProgress } from '../ui';
import StatCard from './StatCard';
import theme from '../../config/theme';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Mock data for demonstration
  const dashboardData = {
    totalStudents: 5909,
    activeStudents: 4521,
    newEnrollments: 234,
    graduatedStudents: 892,
    feeStatus: {
      paid: 1335,
      pending: 4366,
      overdue: 208,
      totalRevenue: 892650,
      collectionRate: 78
    },
    recentActivity: [
      { id: 1, type: 'enrollment', student: 'John Doe', program: 'Computer Science', date: '2024-03-15' },
      { id: 2, type: 'payment', student: 'Jane Smith', amount: '$1,500', date: '2024-03-14' },
      { id: 3, type: 'inquiry', student: 'Mike Johnson', program: 'Data Science', date: '2024-03-14' },
      { id: 4, type: 'graduation', student: 'Sarah Wilson', program: 'Business Admin', date: '2024-03-13' },
    ],
    performanceMetrics: {
      enrollmentGrowth: 12.5,
      studentRetention: 94.2,
      graduationRate: 89.7,
      satisfactionScore: 4.6
    },
    upcomingEvents: [
      { id: 1, title: 'New Semester Orientation', date: '2024-04-01', type: 'academic' },
      { id: 2, title: 'Faculty Meeting', date: '2024-03-20', type: 'staff' },
      { id: 3, title: 'Career Fair', date: '2024-03-25', type: 'event' },
      { id: 4, title: 'Exam Week', date: '2024-05-15', type: 'academic' },
    ]
  };

  const stats = [
    { 
      title: 'Total Students', 
      value: dashboardData.totalStudents.toLocaleString(), 
      icon: '👥', 
      color: 'primary',
      trend: '+5.2%'
    },
    { 
      title: 'Active Students', 
      value: dashboardData.activeStudents.toLocaleString(), 
      icon: '📚', 
      color: 'accent',
      trend: '+3.8%'
    },
    { 
      title: 'New Enrollments', 
      value: dashboardData.newEnrollments.toLocaleString(), 
      icon: '✨', 
      color: 'success',
      trend: '+12.4%'
    },
    { 
      title: 'Graduated', 
      value: dashboardData.graduatedStudents.toLocaleString(), 
      icon: '🎓', 
      color: 'info',
      trend: '+8.9%'
    },
  ];

  const renderWelcomeSection = () => (
    <MagicCard className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2"
          >
            Welcome to SMIS ICBT
          </motion.h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manage your institution with powerful tools and insights
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, programs..." 
            className="flex-1 md:w-64 px-4 py-2.5 rounded-lg glass text-secondary-700 dark:text-secondary-300 placeholder-secondary-400 dark:placeholder-secondary-600 focus:glow-sm transition-all duration-200"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 bg-gradient-to-r from-primary-400 to-accent-400 text-white rounded-lg hover:glow-sm transition-all duration-200"
          >
            <span role="img" aria-label="search">🔍</span>
          </motion.button>
        </div>
      </div>
    </MagicCard>
  );

  const renderStats = () => (
    <AnimatedList
      gridCols="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      animation="fade-up"
      staggerDelay={0.1}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </AnimatedList>
  );

  const renderFeeStatus = () => (
    <MagicCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Fee Status Overview
        </h2>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-primary-400/20 to-accent-400/20 text-primary-500 dark:text-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100/50 dark:hover:bg-secondary-800/50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300">
              Revenue Overview
            </h3>
            <div className="text-2xl font-bold text-success-main">
              ${dashboardData.feeStatus.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dashboardData.feeStatus.collectionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-success-main to-success-dark rounded-full"
            />
          </div>
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            Collection Rate: {dashboardData.feeStatus.collectionRate}%
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <motion.div className="glass p-4 rounded-xl" whileHover={{ scale: 1.02 }}>
            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Paid</div>
            <div className="text-2xl font-semibold text-success-main">
              {dashboardData.feeStatus.paid.toLocaleString()}
            </div>
          </motion.div>
          <motion.div className="glass p-4 rounded-xl" whileHover={{ scale: 1.02 }}>
            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Pending</div>
            <div className="text-2xl font-semibold text-warning-main">
              {dashboardData.feeStatus.pending.toLocaleString()}
            </div>
          </motion.div>
          <motion.div className="glass p-4 rounded-xl col-span-2" whileHover={{ scale: 1.02 }}>
            <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Overdue</div>
            <div className="text-2xl font-semibold text-error-main">
              {dashboardData.feeStatus.overdue.toLocaleString()}
            </div>
          </motion.div>
        </div>
      </div>
    </MagicCard>
  );

  const renderPerformanceMetrics = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
        Performance Metrics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="glass p-4 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📈</span>
            <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Enrollment Growth
            </h3>
          </div>
          <div className="text-2xl font-semibold text-success-main">
            {dashboardData.performanceMetrics.enrollmentGrowth}%
          </div>
        </motion.div>
        <motion.div 
          className="glass p-4 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔄</span>
            <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Student Retention
            </h3>
          </div>
          <div className="text-2xl font-semibold text-info-main">
            {dashboardData.performanceMetrics.studentRetention}%
          </div>
        </motion.div>
        <motion.div 
          className="glass p-4 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎓</span>
            <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Graduation Rate
            </h3>
          </div>
          <div className="text-2xl font-semibold text-accent-400">
            {dashboardData.performanceMetrics.graduationRate}%
          </div>
        </motion.div>
        <motion.div 
          className="glass p-4 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⭐</span>
            <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
              Satisfaction Score
            </h3>
          </div>
          <div className="text-2xl font-semibold text-warning-main">
            {dashboardData.performanceMetrics.satisfactionScore}
          </div>
        </motion.div>
      </div>
    </MagicCard>
  );

  const renderUpcomingEvents = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
        Upcoming Events
      </h2>
      <AnimatedList
        as="ul"
        className="space-y-4"
        animation="fade-left"
        staggerDelay={0.1}
      >
        {dashboardData.upcomingEvents.map((event) => (
          <motion.li
            key={event.id}
            className="glass p-4 rounded-xl flex items-center justify-between group hover:glow-sm transition-all duration-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {event.type === 'academic' ? '📚' :
                 event.type === 'staff' ? '👥' : '🎉'}
              </span>
              <div>
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">
                  {event.title}
                </h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  {event.date}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              📅
            </motion.button>
          </motion.li>
        ))}
      </AnimatedList>
    </MagicCard>
  );

  const renderRecentActivity = () => (
    <MagicCard className="p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
        Recent Activity
      </h2>
      <AnimatedList
        as="ul"
        className="space-y-4"
        animation="fade-left"
        staggerDelay={0.1}
      >
        {dashboardData.recentActivity.map((activity) => (
          <motion.li
            key={activity.id}
            className="glass p-4 rounded-xl flex items-center justify-between group hover:glow-sm transition-all duration-200"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {activity.type === 'enrollment' ? '📝' :
                 activity.type === 'payment' ? '💰' :
                 activity.type === 'inquiry' ? '❓' : '🎓'}
              </span>
              <div>
                <h3 className="font-medium text-secondary-700 dark:text-secondary-300">
                  {activity.student}
                </h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  {activity.type === 'payment' ? `Paid ${activity.amount}` :
                   activity.type === 'graduation' ? `Graduated from ${activity.program}` :
                   `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - ${activity.program}`}
                </p>
              </div>
            </div>
            <span className="text-sm text-secondary-400 dark:text-secondary-500">
              {activity.date}
            </span>
          </motion.li>
        ))}
      </AnimatedList>
    </MagicCard>
  );

  return (
    <>
      <ScrollProgress />
      <div className="space-y-6 p-6">
        {renderWelcomeSection()}
        {renderStats()}
        <div className="grid grid-cols-1 gap-6">
          {renderFeeStatus()}
          {renderPerformanceMetrics()}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderUpcomingEvents()}
          {renderRecentActivity()}
        </div>
      </div>
    </>
  );
};

export default Dashboard; 