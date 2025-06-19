import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getBatches, 
  createBatch, 
  updateBatch, 
  deleteBatch,
  getPrograms
} from '../../lib/api/batches';
import { showToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

// Extract BatchModal as a separate component to prevent re-creation on every render
const BatchModal = ({ 
  isEdit = false, 
  formData, 
  setFormData, 
  programs, 
  onSubmit, 
  onClose, 
  onReset 
}) => {
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          onReset();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card glass max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
            {isEdit ? 'Edit Batch' : 'Create New Batch'}
          </h2>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Batch Code *
                </label>
                <input
                  type="text"
                  value={formData.batch_code}
                  onChange={(e) => handleInputChange('batch_code', e.target.value)}
                  className="input-field"
                  placeholder="e.g., SE-2024-01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Software Engineering Batch 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Program *
                </label>
                <select
                  value={formData.program_id}
                  onChange={(e) => handleInputChange('program_id', e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Schedule
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Mon, Wed, Fri"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={formData.time_slot}
                  onChange={(e) => handleInputChange('time_slot', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 9:00 AM - 12:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only update if value is a valid number or empty
                    if (value === '' || (!isNaN(value) && parseInt(value) > 0)) {
                      handleInputChange('capacity', value === '' ? '' : parseInt(value));
                    }
                  }}
                  className="input-field"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Lecturer
                </label>
                <input
                  type="text"
                  value={formData.lecturer}
                  onChange={(e) => handleInputChange('lecturer', e.target.value)}
                  className="input-field"
                  placeholder="Lecturer name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Batch description..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReset();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {isEdit ? 'Update Batch' : 'Create Batch'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BatchManagement = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    program: 'all',
    dateRange: 'all'
  });

  const [formData, setFormData] = useState({
    batch_code: '',
    name: '',
    program_id: '',
    start_date: '',
    end_date: '',
    schedule: '',
    time_slot: '',
    capacity: 40,
    lecturer: '',
    description: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    console.log('BatchManagement component mounted');
    fetchBatches();
    fetchPrograms();
  }, []);

  useEffect(() => {
    console.log('Filters changed:', filters);
    fetchBatches();
  }, [filters]);

  const fetchBatches = async () => {
    console.log('fetchBatches called');
    setLoading(true);
    try {
      console.log('Calling getBatches API...');
      const { data, error } = await getBatches(filters);
      console.log('getBatches response:', { data, error, dataLength: data?.length });
      
      if (error) {
        console.error('API Error:', error);
        showToast.error(error);
        setBatches([]);
        return;
      }
      
      console.log('Setting batches state with data:', data);
      setBatches(data || []);
    } catch (error) {
      console.error('Fetch batches error:', error);
      showToast.error('Failed to fetch batches');
      setBatches([]);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await getPrograms();
      if (error) {
        console.error('Programs error:', error);
        showToast.error(error);
        return;
      }
      console.log('Programs fetched:', data);
      setPrograms(data || []);
    } catch (error) {
      console.error('Fetch programs error:', error);
      showToast.error('Failed to fetch programs');
    }
  };



  const handleCreateBatch = useCallback(async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await createBatch({
        ...formData,
        created_by: user?.email || 'manager'
      });
      
      if (error) {
        showToast.error(error);
        return;
      }

      showToast.success('Batch created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchBatches();
    } catch (error) {
      showToast.error('Failed to create batch');
    }
  }, [formData, user, fetchBatches]);

  const handleUpdateBatch = useCallback(async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await updateBatch(selectedBatch.id, {
        ...formData,
        updated_by: user?.email || 'manager'
      });
      
      if (error) {
        showToast.error(error);
        return;
      }

      showToast.success('Batch updated successfully');
      setShowEditModal(false);
      setSelectedBatch(null);
      resetForm();
      fetchBatches();
    } catch (error) {
      showToast.error('Failed to update batch');
    }
  }, [formData, user, selectedBatch, fetchBatches]);

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    
    try {
      const { error } = await deleteBatch(batchId);
      
      if (error) {
        showToast.error(error);
        return;
      }

      showToast.success('Batch deleted successfully');
      fetchBatches();
    } catch (error) {
      showToast.error('Failed to delete batch');
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      batch_code: '',
      name: '',
      program_id: '',
      start_date: '',
      end_date: '',
      schedule: '',
      time_slot: '',
      capacity: 40,
      lecturer: '',
      description: '',
      status: 'Upcoming'
    });
  }, [setFormData]);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
  }, []);

  const openEditModal = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      batch_code: batch.batch_code,
      name: batch.name,
      program_id: batch.program_id,
      start_date: batch.start_date,
      end_date: batch.end_date,
      schedule: batch.schedule,
      time_slot: batch.time_slot,
      capacity: batch.capacity,
      lecturer: batch.lecturer,
      description: batch.description || '',
      status: batch.status
    });
    setShowEditModal(true);
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
      case 'completed':
        return 'bg-purple-100 dark:bg-purple-100/10 text-purple-600 dark:text-purple-400 border-purple-200/20 dark:border-purple-700/20';
      default:
        return 'bg-secondary-100 dark:bg-secondary-100/10 text-secondary-600 dark:text-secondary-400 border-secondary-200/20 dark:border-secondary-700/20';
    }
  };

  return (
    <div className="p-6 space-dots">

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
              Batch Management
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400">Create and manage academic batches</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Create Batch
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Open">Open</option>
            <option value="Full">Full</option>
            <option value="Closed">Closed</option>
            <option value="Completed">Completed</option>
          </select>

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
      </div>

      {/* Batches Table */}
      <div className="card glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200/10 dark:border-secondary-700/10">
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Batch</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Program</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Schedule</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Capacity</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200/10 dark:divide-secondary-700/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-secondary-500 dark:text-secondary-400">
                    No batches found
                  </td>
                </tr>
              ) : (
                batches.map(batch => (
                  <motion.tr 
                    key={batch.id}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                          {batch.batch_code}
                        </div>
                        <div className="text-sm text-secondary-600 dark:text-secondary-400">
                          {batch.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                      {batch.programs?.name || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-secondary-700 dark:text-secondary-300">
                        <div>{batch.schedule}</div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {batch.time_slot}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <span className="font-medium">{batch.enrolled || 0}</span>
                        <span className="text-secondary-500 dark:text-secondary-400">/{batch.capacity}</span>
                      </div>
                      <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${((batch.enrolled || 0) / batch.capacity) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(batch)}
                          className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <BatchModal 
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            programs={programs}
            onSubmit={handleCreateBatch}
            onClose={handleCloseCreateModal}
            onReset={resetForm}
          />
        )}
        {showEditModal && (
          <BatchModal 
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            programs={programs}
            onSubmit={handleUpdateBatch}
            onClose={handleCloseEditModal}
            onReset={resetForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BatchManagement; 