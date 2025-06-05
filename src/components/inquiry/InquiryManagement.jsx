import React, { useState } from 'react';
import InquiryFilters from './InquiryFilters';
import InquiryList from './InquiryList';
import InquiryForm from './InquiryForm';
import InquiryStats from './InquiryStats';
import ActionPlan from './ActionPlan';

const InquiryManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filters, setFilters] = useState({
    source: 'all',
    program: 'all',
    status: 'all',
    counselor: 'all',
    dateRange: 'all'
  });

  // Mock data for demonstration
  const mockInquiries = [
    {
      id: 'INQ001',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+94 77 123 4567',
      source: 'Web Form',
      program: 'Information Technology',
      status: 'New',
      date: '2024-03-10',
      counselor: 'Sarah Wilson',
      lastContact: '2024-03-10',
      nextFollowUp: '2024-03-12',
      notes: 'Interested in evening classes'
    },
    // Add more mock data as needed
  ];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleInquirySelect = (inquiry) => {
    setSelectedInquiry(inquiry);
    setActiveTab('details');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Inquiry Management</h1>
          <p className="text-slate-500">Track and manage student inquiries and follow-ups</p>
        </div>
        <button 
          onClick={() => setActiveTab('new')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Inquiry
        </button>
      </div>

      <InquiryStats />

      <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-6 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <InquiryFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex gap-4 mb-6 border-b border-slate-200 pb-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'list' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('list')}
            >
              Inquiry List
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'details'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('details')}
              disabled={!selectedInquiry}
            >
              Inquiry Details
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'new'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('new')}
            >
              New Inquiry
            </button>
          </div>

          <div>
            {activeTab === 'list' && (
              <InquiryList
                inquiries={mockInquiries}
                onSelect={handleInquirySelect}
                filters={filters}
              />
            )}
            {activeTab === 'details' && selectedInquiry && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Inquiry Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Name</label>
                        <p className="text-sm font-medium text-slate-800">{selectedInquiry.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Email</label>
                        <p className="text-sm font-medium text-slate-800">{selectedInquiry.email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Phone</label>
                        <p className="text-sm font-medium text-slate-800">{selectedInquiry.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Program</label>
                        <p className="text-sm font-medium text-slate-800">{selectedInquiry.program}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Source</label>
                        <p className="text-sm font-medium text-slate-800">{selectedInquiry.source}</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Counselor</label>
                        <p className="text-sm font-medium text-slate-800">{selectedInquiry.counselor}</p>
                      </div>
                    </div>
                  </div>

                  <ActionPlan inquiry={selectedInquiry} />
                </div>
              </div>
            )}
            {activeTab === 'new' && (
              <InquiryForm 
                onSubmit={(data) => {
                  console.log('New inquiry:', data);
                  setActiveTab('list');
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryManagement; 