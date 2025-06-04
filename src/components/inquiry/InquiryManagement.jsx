import React, { useState } from 'react';
import './InquiryManagement.css';
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
    <div className="inquiry-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Inquiry Management</h1>
          <p>Track and manage student inquiries and follow-ups</p>
        </div>
        <button 
          className="button button-primary"
          onClick={() => setActiveTab('new')}
        >
          New Inquiry
        </button>
      </div>

      <InquiryStats />

      <div className="inquiry-container">
        <div className="inquiry-sidebar">
          <InquiryFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        <div className="inquiry-content">
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Inquiry List
            </button>
            <button
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
              disabled={!selectedInquiry}
            >
              Inquiry Details
            </button>
            <button
              className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              New Inquiry
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'list' && (
              <InquiryList
                inquiries={mockInquiries}
                onSelect={handleInquirySelect}
                filters={filters}
              />
            )}
            {activeTab === 'details' && selectedInquiry && (
              <div className="inquiry-details">
                <div className="details-grid">
                  <div className="details-section">
                    <h3>Inquiry Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Name</label>
                        <p>{selectedInquiry.name}</p>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <p>{selectedInquiry.email}</p>
                      </div>
                      <div className="info-item">
                        <label>Phone</label>
                        <p>{selectedInquiry.phone}</p>
                      </div>
                      <div className="info-item">
                        <label>Program</label>
                        <p>{selectedInquiry.program}</p>
                      </div>
                      <div className="info-item">
                        <label>Source</label>
                        <p>{selectedInquiry.source}</p>
                      </div>
                      <div className="info-item">
                        <label>Counselor</label>
                        <p>{selectedInquiry.counselor}</p>
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