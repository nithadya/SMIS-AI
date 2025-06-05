import React, { useState } from 'react';

const StudentSearch = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('campusId');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue, searchType);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-56">
            <label htmlFor="searchType" className="block text-sm font-medium text-slate-700 mb-2">
              Search By
            </label>
            <select
              id="searchType"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 
                bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 
                transition-all duration-200"
            >
              <option value="campusId">Campus ID</option>
              <option value="nic">NIC Number</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="searchValue" className="block text-sm font-medium text-slate-700 mb-2">
              {searchType === 'campusId' ? 'Campus ID' : 'NIC Number'}
            </label>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  id="searchValue"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={`Enter ${searchType === 'campusId' ? 'Campus ID' : 'NIC Number'}`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                    text-slate-600 placeholder-slate-400 bg-white focus:outline-none focus:border-blue-500 
                    focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg 
                  hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 
                  transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 
                  disabled:hover:translate-y-0"
                disabled={!searchValue.trim()}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentSearch; 