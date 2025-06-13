import React, { useState, useEffect } from 'react';
import { getPrograms, getSources, getCounselors } from '../../lib/api/inquiries';

const InquiryFilters = ({ filters, onFilterChange }) => {
  const [programs, setPrograms] = useState([]);
  const [sources, setSources] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, sourcesRes, counselorsRes] = await Promise.all([
          getPrograms(),
          getSources(),
          getCounselors()
        ]);

        if (programsRes.data) setPrograms(programsRes.data);
        if (sourcesRes.data) setSources(sourcesRes.data);
        if (counselorsRes.data) setCounselors(counselorsRes.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
        <select
          value={filters.source}
          onChange={(e) => handleChange('source', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          disabled={loading}
        >
          <option value="all">All Sources</option>
          {sources.map(source => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
        <select
          value={filters.program}
          onChange={(e) => handleChange('program', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow-up">Follow-up</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Counselor</label>
        <select
          value={filters.counselor}
          onChange={(e) => handleChange('counselor', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
        <select
          value={filters.dateRange}
          onChange={(e) => handleChange('dateRange', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      <button 
        className="w-full px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        onClick={() => onFilterChange({
          source: 'all',
          program: 'all',
          status: 'all',
          counselor: 'all',
          dateRange: 'all'
        })}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default InquiryFilters; 