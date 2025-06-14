import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBatches, getPrograms } from '../../lib/api/batches';
import { showToast } from '../common/Toast';

const BatchView = () => {
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [filters, setFilters] = useState({
    program: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchBatches();
    fetchPrograms();
  }, [filters]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await getBatches(filters);
      if (error) {
        showToast.error(error);
        return;
      }
      setBatches(data || []);
    } catch (error) {
      showToast.error('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await getPrograms();
      if (error) {
        showToast.error(error);
        return;
      }
      setPrograms(data || []);
    } catch (error) {
      showToast.error('Failed to fetch programs');
    }
  };

  const categorizedBatches = {
    open: batches.filter(batch => 
      batch.status === 'Open' && (batch.enrolled || 0) < batch.capacity
    ),
    full: batches.filter(batch => 
      batch.status === 'Full' || (batch.enrolled || 0) >= batch.capacity
    ),
    upcoming: batches.filter(batch => 
      batch.status === 'Upcoming'
    ),
    ongoing: batches.filter(batch => {
      const today = new Date();
      const startDate = new Date(batch.start_date);
      const endDate = new Date(batch.end_date);
      return startDate <= today && today <= endDate && batch.status !== 'Completed';
    }),
    ended: batches.filter(batch => 
      batch.status === 'Completed' || batch.status === 'Closed'
    )
  };

  const getTabCount = (category) => categorizedBatches[category]?.length || 0;

  const getCapacityColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-100 dark:bg-blue-100/10 text-blue-600 dark:text-blue-400 border-blue-200/20 dark:border-blue-700/20';
      case 'open':
        return 'bg-green-100 dark:bg-green-100/10 text-green-600 dark:text-green-400 border-green-200/20 dark:border-green-700/20';
      case 'full':
        return 'bg-yellow-100 dark:bg-yellow-100/10 text-yellow-600 dark:text-yellow-400 border-yellow-200/20 dark:border-yellow-700/20';
      case 'closed':
      case 'completed':
        return 'bg-gray-100 dark:bg-gray-100/10 text-gray-600 dark:text-gray-400 border-gray-200/20 dark:border-gray-700/20';
      default:
        return 'bg-gray-100 dark:bg-gray-100/10 text-gray-600 dark:text-gray-400 border-gray-200/20 dark:border-gray-700/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return '🔵';
      case 'open':
        return '🟢';
      case 'full':
        return '🔴';
      case 'closed':
      case 'completed':
        return '⚫';
      default:
        return '🟡';
    }
  };

  const renderCapacityIndicator = (batch) => {
    const enrolled = batch.enrolled || 0;
    const capacity = batch.capacity;
    const percentage = (enrolled / capacity) * 100;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-secondary-600 dark:text-secondary-400">Enrollment</span>
          <span className="font-medium">{enrolled}/{capacity}</span>
        </div>
        <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getCapacityColor(enrolled, capacity)} transition-all duration-300`}
          />
        </div>
        <div className="text-xs text-secondary-500 dark:text-secondary-400">
          {percentage.toFixed(1)}% filled
        </div>
      </div>
    );
  };

  const BatchCard = ({ batch }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="card glass hover:glow-sm transition-all duration-200"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-1">
              {batch.batch_code}
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">{batch.name}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
              {batch.programs?.name || 'No Program'}
            </p>
          </div>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
            {batch.status}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Start Date</p>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                {new Date(batch.start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">End Date</p>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                {new Date(batch.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {batch.schedule && (
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Schedule</p>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.schedule}</p>
              {batch.time_slot && (
                <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.time_slot}</p>
              )}
            </div>
          )}

          {batch.lecturer && (
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Lecturer</p>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">{batch.lecturer}</p>
            </div>
          )}

          <div>
            {renderCapacityIndicator(batch)}
          </div>

          {batch.description && (
            <div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Description</p>
              <p className="text-sm text-secondary-700 dark:text-secondary-300 line-clamp-2">
                {batch.description}
              </p>
            </div>
          )}
        </div>

        {activeTab === 'open' && (
          <div className="mt-4 pt-4 border-t border-secondary-200/10 dark:border-secondary-700/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                Available Spots
              </span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {batch.capacity - (batch.enrolled || 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const tabs = [
    { key: 'open', label: 'Open for Enrollment', icon: '🟢' },
    { key: 'upcoming', label: 'Upcoming', icon: '🔵' },
    { key: 'ongoing', label: 'Ongoing', icon: '🟡' },
    { key: 'full', label: 'Full', icon: '🔴' },
    { key: 'ended', label: 'Ended', icon: '⚫' }
  ];

  return (
    <div className="p-6 space-dots">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
          Batch Overview
        </h1>
        <p className="text-secondary-500 dark:text-secondary-400">
          View batch enrollment status and availability
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filters.program}
          onChange={(e) => setFilters({ ...filters, program: e.target.value })}
          className="input-field w-auto"
        >
          <option value="all">All Programs</option>
          {programs.map(program => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          className="input-field w-auto"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
              }`}>
                {getTabCount(tab.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Batch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card glass animate-pulse">
              <div className="p-6 space-y-4">
                <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                  <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : categorizedBatches[activeTab]?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} batches
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400">
              {activeTab === 'open' && "There are no batches currently open for enrollment."}
              {activeTab === 'upcoming' && "No upcoming batches scheduled."}
              {activeTab === 'ongoing' && "No batches are currently in progress."}
              {activeTab === 'full' && "No batches are currently full."}
              {activeTab === 'ended' && "No completed or closed batches."}
            </p>
          </div>
        ) : (
          categorizedBatches[activeTab]?.map(batch => (
            <BatchCard key={batch.id} batch={batch} />
          ))
        )}
      </div>

      {/* Summary Stats */}
      {!loading && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {tabs.map(tab => (
            <div key={tab.key} className="card glass text-center p-4">
              <div className="text-2xl mb-2">{tab.icon}</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {getTabCount(tab.key)}
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                {tab.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchView; 