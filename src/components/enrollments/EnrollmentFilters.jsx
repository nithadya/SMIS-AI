import React, { useState, useEffect } from 'react';
import { getPrograms } from '../../lib/api/inquiries';
import { getCounselors } from '../../lib/api/inquiries';
import { showToast } from '../common/Toast';

const EnrollmentFilters = ({ filters, onFilterChange }) => {
  const [programs, setPrograms] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterData = async () => {
      setLoading(true);
      try {
        // Fetch programs
        const { data: programsData, error: programsError } = await getPrograms();
        if (programsError) {
          showToast.error('Failed to fetch programs');
          console.error('Error fetching programs:', programsError);
        } else {
          setPrograms(programsData || []);
        }

        // Fetch counselors
        const { data: counselorsData, error: counselorsError } = await getCounselors();
        if (counselorsError) {
          showToast.error('Failed to fetch counselors');
          console.error('Error fetching counselors:', counselorsError);
        } else {
          setCounselors(counselorsData || []);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Initial Inquiry', label: 'Initial Inquiry' },
    { value: 'Counseling Session', label: 'Counseling Session' },
    { value: 'Document Submission', label: 'Document Submission' },
    { value: 'Document Verification', label: 'Document Verification' },
    { value: 'Payment Processing', label: 'Payment Processing' },
    { value: 'Enrollment Confirmation', label: 'Enrollment Confirmation' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Filters</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Program
            </label>
            <select
              className="w-full rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              value={filters.program}
              onChange={(e) => handleFilterChange('program', e.target.value)}
              disabled={loading}
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Counselor
            </label>
            <select
              className="w-full rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              value={filters.counselor}
              onChange={(e) => handleFilterChange('counselor', e.target.value)}
              disabled={loading}
            >
              <option value="all">All Counselors</option>
              {counselors.map(counselor => (
                <option key={counselor.id} value={counselor.id}>
                  {counselor.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date Range
            </label>
            <select
              className="w-full rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <button
          className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          onClick={() => onFilterChange({
            status: 'all',
            program: 'all',
            counselor: 'all',
            dateRange: 'all'
          })}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default EnrollmentFilters; 