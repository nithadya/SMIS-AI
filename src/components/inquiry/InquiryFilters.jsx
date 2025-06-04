import React from 'react';
import './InquiryFilters.css';

const InquiryFilters = ({ filters, onFilterChange }) => {
  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="inquiry-filters">
      <h3>Filters</h3>
      
      <div className="filter-section">
        <label className="filter-label">Source</label>
        <select
          value={filters.source}
          onChange={(e) => handleChange('source', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Sources</option>
          <option value="web">Web Form</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
          <option value="walk-in">Walk-in</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Program</label>
        <select
          value={filters.program}
          onChange={(e) => handleChange('program', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Programs</option>
          <option value="it">Information Technology</option>
          <option value="business">Business Management</option>
          <option value="engineering">Engineering</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow-up">Follow-up</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Counselor</label>
        <select
          value={filters.counselor}
          onChange={(e) => handleChange('counselor', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Counselors</option>
          <option value="sarah">Sarah Wilson</option>
          <option value="john">John Smith</option>
          <option value="mary">Mary Johnson</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Date Range</label>
        <select
          value={filters.dateRange}
          onChange={(e) => handleChange('dateRange', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>

      <button 
        className="button button-secondary clear-filters"
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