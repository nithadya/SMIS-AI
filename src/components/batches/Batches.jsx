import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Batches = () => {
  // Mock data for demonstration
  const batchData = [
    {
      id: 'BIT2024-1',
      program: 'Bachelor of Information Technology',
      startDate: '2024-05-01',
      endDate: '2024-08-30',
      schedule: 'Monday, Wednesday, Friday',
      timeSlot: '9:00 AM - 12:00 PM',
      capacity: 40,
      enrolled: 35,
      status: 'Upcoming',
      lecturer: 'Dr. Sarah Wilson'
    },
    {
      id: 'BBM2024-1',
      program: 'Bachelor of Business Management',
      startDate: '2024-06-15',
      endDate: '2024-10-15',
      schedule: 'Tuesday, Thursday',
      timeSlot: '2:00 PM - 5:00 PM',
      capacity: 35,
      enrolled: 20,
      status: 'Open',
      lecturer: 'Prof. Michael Brown'
    },
    {
      id: 'BIT2024-2',
      program: 'Bachelor of Information Technology',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
      schedule: 'Monday, Wednesday, Friday',
      timeSlot: '1:00 PM - 4:00 PM',
      capacity: 40,
      enrolled: 15,
      status: 'Open',
      lecturer: 'Dr. James Anderson'
    }
  ];

  const [activeView, setActiveView] = useState('calendar');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const getCapacityColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'from-error-main to-error-dark';
    if (percentage >= 70) return 'from-warning-main to-warning-dark';
    return 'from-success-main to-success-dark';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-info-light dark:bg-info-light/10 text-info-main border-info-main/20';
      case 'open':
        return 'bg-success-light dark:bg-success-light/10 text-success-main border-success-main/20';
      case 'full':
        return 'bg-warning-light dark:bg-warning-light/10 text-warning-main border-warning-main/20';
      case 'closed':
        return 'bg-secondary-100 dark:bg-secondary-100/10 text-secondary-600 dark:text-secondary-400 border-secondary-200/20 dark:border-secondary-700/20';
      default:
        return 'bg-secondary-100 dark:bg-secondary-100/10 text-secondary-600 dark:text-secondary-400 border-secondary-200/20 dark:border-secondary-700/20';
    }
  };

  const renderCapacityIndicator = (batch) => {
    const percentage = (batch.enrolled / batch.capacity) * 100;
    return (
      <div className="space-y-1">
        <div className="h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getCapacityColor(batch.enrolled, batch.capacity)} transition-all duration-300`}
          />
        </div>
        <span className="text-xs text-secondary-600 dark:text-secondary-400">
          {batch.enrolled}/{batch.capacity} Enrolled
        </span>
      </div>
    );
  };

  const renderCalendarView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {batchData.map(batch => (
        <motion.div 
          key={batch.id}
          whileHover={{ scale: 1.02 }}
          className="card glass hover:glow-sm transition-all duration-200 cursor-pointer"
          onClick={() => setSelectedBatch(batch)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-1">
                  {batch.id}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{batch.program}</p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
                {batch.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Start Date</p>
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">End Date</p>
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.endDate}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Schedule</p>
                <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.schedule}</p>
                <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.timeSlot}</p>
              </div>

              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Lecturer</p>
                <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.lecturer}</p>
              </div>

              <div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">Capacity</p>
                {renderCapacityIndicator(batch)}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="card glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200/10 dark:border-secondary-700/10">
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Batch ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Program</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Schedule</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Time Slot</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Lecturer</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Capacity</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200/10 dark:divide-secondary-700/10">
            {batchData.map(batch => (
              <motion.tr 
                key={batch.id}
                onClick={() => setSelectedBatch(batch)}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                className="transition-colors cursor-pointer"
              >
                <td className="py-4 px-4 text-sm">
                  <span className="font-medium bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    {batch.id}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">{batch.program}</td>
                <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">{batch.schedule}</td>
                <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">{batch.timeSlot}</td>
                <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">{batch.lecturer}</td>
                <td className="py-4 px-4 w-48">{renderCapacityIndicator(batch)}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-dots">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
          Batch Management
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400">Manage and monitor batch schedules and capacity</p>
      </div>

      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-lg glass p-1">
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeView === 'calendar'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeView === 'list'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {activeView === 'calendar' ? renderCalendarView() : renderListView()}
    </div>
  );
};

export default Batches; 