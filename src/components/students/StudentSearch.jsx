import React, { useState } from 'react';
import './StudentSearch.css';

const StudentSearch = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('campusId');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue, searchType);
  };

  return (
    <div className="student-search">
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <div className="search-type">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="search-select"
            >
              <option value="campusId">Campus ID</option>
              <option value="nic">NIC Number</option>
            </select>
          </div>
          
          <div className="search-input-container">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Enter ${searchType === 'campusId' ? 'Campus ID' : 'NIC Number'}`}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentSearch; 