import React, { useState, useEffect } from 'react';
import InquiryFilters from './InquiryFilters';
import InquiryList from './InquiryList';
import InquiryForm from './InquiryForm';
import InquiryStats from './InquiryStats';
import ActionPlan from './ActionPlan';
import { getInquiries, updateInquiry } from '../../lib/api/inquiries';
import { createEnrollmentFromInquiry } from '../../lib/api/enrollments';
import { showToast } from '../common/Toast';
import { useNavigate } from 'react-router-dom';
import { refreshSupabaseAuth } from '../../lib/supabase';

const InquiryManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [creatingEnrollment, setCreatingEnrollment] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    source: 'all',
    program: 'all',
    status: 'all',
    counselor: 'all',
    dateRange: 'all'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await getInquiries(filters);
      if (error) {
        showToast.error(error);
        return;
      }
      setInquiries(data || []);
    } catch (error) {
      showToast.error('Failed to fetch inquiries');
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInquirySelect = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsEditing(false);
    setActiveTab('details');
  };

  const handleNewInquiry = (inquiry) => {
    setInquiries(prev => [inquiry, ...prev]);
    setActiveTab('list');
    showToast.success('New inquiry created successfully');
  };

  const handleUpdateInquiry = async (updatedData) => {
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await updateInquiry(selectedInquiry.id, updatedData);
      if (error) {
        showToast.error(error);
        return;
      }
      
      // Update the inquiries list
      setInquiries(prev => prev.map(inq => 
        inq.id === data.id ? data : inq
      ));
      
      // Update selected inquiry
      setSelectedInquiry(data);
      setIsEditing(false);
      showToast.success('Inquiry updated successfully');
      
      // If status is changed to completed, ask if they want to create an enrollment
      if (updatedData.status === 'completed' && selectedInquiry.status !== 'completed') {
        // Show a confirmation dialog before creating enrollment
        if (window.confirm('Inquiry marked as completed. Would you like to create an enrollment for this inquiry?')) {
          handleCreateEnrollment(data.id);
        }
      }
    } catch (error) {
      showToast.error('Failed to update inquiry');
      console.error('Error updating inquiry:', error);
    }
  };

  const handleCreateEnrollment = async (inquiryId) => {
    setCreatingEnrollment(true);
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await createEnrollmentFromInquiry(inquiryId);
      if (error) {
        console.error('Error details:', error);
        showToast.error(`Failed to create enrollment: ${error}`);
        return;
      }
      
      showToast.success('Enrollment created successfully');
      // Navigate to the enrollments page
      navigate('/enrollments');
    } catch (error) {
      showToast.error('Failed to create enrollment');
      console.error('Error creating enrollment:', error);
    } finally {
      setCreatingEnrollment(false);
    }
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

      <InquiryStats inquiries={inquiries} />

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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'list' && (
                <InquiryList
                  inquiries={inquiries}
                  onSelect={handleInquirySelect}
                  filters={filters}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
              {activeTab === 'details' && selectedInquiry && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Inquiry Details</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                  </div>
                  
                  {isEditing ? (
                    <InquiryForm 
                      initialData={selectedInquiry}
                      onSubmit={handleUpdateInquiry}
                      isEditing={true}
                    />
                  ) : (
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
                            <p className="text-sm font-medium text-slate-800">{selectedInquiry.programs?.name || '-'}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Source</label>
                            <p className="text-sm font-medium text-slate-800">{selectedInquiry.sources?.name || '-'}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Counselor</label>
                            <p className="text-sm font-medium text-slate-800">{selectedInquiry.users?.full_name || '-'}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Status</label>
                            <p className="text-sm font-medium text-slate-800">{selectedInquiry.status || '-'}</p>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 block mb-1">Created By</label>
                            <p className="text-sm font-medium text-slate-800">{selectedInquiry.created_by || '-'}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="text-xs text-slate-500 block mb-1">Notes</label>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">{selectedInquiry.notes || '-'}</p>
                        </div>
                      </div>

                      <ActionPlan inquiry={selectedInquiry} onUpdate={handleUpdateInquiry} />
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'new' && (
                <InquiryForm onSubmit={handleNewInquiry} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryManagement; 