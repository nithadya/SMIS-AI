import React, { useState, useEffect } from 'react';
import StudentSearch from './StudentSearch';
import StudentDetails from './StudentDetails';
import StudentPayments from './StudentPayments';
import { 
  getStudents, 
  getStudentPaymentSummaryByEnrollment,
  addStudentPayment 
} from '../../lib/api/students';
import { showToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

const StudentManagement = () => {
  const { user } = useAuth();
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [students, setStudents] = useState([]);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    payment_type: 'Registration Fee',
    amount: '',
    payment_method: 'Cash',
    payment_reference: '',
    description: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await getStudents();
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchValue, searchType) => {
    try {
      setLoading(true);
      let foundStudent = null;
      
      if (searchType === 'name') {
        foundStudent = students.find(s => 
          s.first_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
          s.last_name?.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else if (searchType === 'email') {
        foundStudent = students.find(s => 
          s.email?.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else if (searchType === 'id') {
        foundStudent = students.find(s => 
          s.student_id?.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      if (foundStudent) {
        setActiveStudent(foundStudent);
        // Load payment data for this student
        await loadStudentPaymentData(foundStudent.enrollment_id);
      } else {
        showToast.error('Student not found');
        setActiveStudent(null);
        setPaymentData(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentPaymentData = async (enrollmentId) => {
    try {
      const { data, error } = await getStudentPaymentSummaryByEnrollment(enrollmentId);
      if (error) {
        console.error('Payment data error:', error);
        return;
      }
      setPaymentData(data);
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await addStudentPayment({
        ...paymentForm,
        enrollment_id: activeStudent.enrollment_id,
        amount: parseFloat(paymentForm.amount)
      });

      if (error) {
        showToast.error(error);
        return;
      }

      showToast.success('Payment added successfully');
      setShowPaymentModal(false);
      setPaymentForm({
        payment_type: 'Registration Fee',
        amount: '',
        payment_method: 'Cash',
        payment_reference: '',
        description: ''
      });

      // Refresh payment data
      await loadStudentPaymentData(activeStudent.enrollment_id);
    } catch (error) {
      showToast.error('Failed to add payment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Student Management
            </h1>
            <p className="text-slate-600">
              Search and manage student information, view details and payment history
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <StudentSearch 
              onSearch={handleSearch} 
              loading={loading}
            />
          </div>
        </div>

        {activeStudent && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    {activeStudent.first_name} {activeStudent.last_name}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Student ID: {activeStudent.student_id} • {activeStudent.email}
                  </p>
                </div>
                {activeTab === 'payments' && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      transition-colors duration-200 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Payment
                  </button>
                )}
              </div>
            </div>

            <div className="border-b border-slate-200">
              <div className="flex flex-wrap">
                <button 
                  className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                    ${activeTab === 'details' 
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  onClick={() => setActiveTab('details')}
                  aria-selected={activeTab === 'details'}
                  role="tab"
                >
                  Student Details
                </button>
                <button 
                  className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                    ${activeTab === 'payments' 
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  onClick={() => setActiveTab('payments')}
                  aria-selected={activeTab === 'payments'}
                  role="tab"
                >
                  Payment History
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'details' ? (
                <StudentDetails student={{
                  personalInfo: {
                    name: `${activeStudent.first_name} ${activeStudent.last_name}`,
                    nicNo: activeStudent.nic || 'N/A',
                    campusId: activeStudent.student_id || 'N/A',
                    dateOfBirth: activeStudent.date_of_birth ? new Date(activeStudent.date_of_birth).toLocaleDateString() : 'N/A',
                    gender: activeStudent.gender || 'N/A',
                    email: activeStudent.email || 'N/A',
                    phone: activeStudent.phone || 'N/A',
                    address: activeStudent.address || 'N/A'
                  },
                  academicInfo: {
                    batch: activeStudent.batches?.name || 'N/A',
                    stream: activeStudent.programs?.name || 'N/A',
                    enrollmentDate: activeStudent.created_at ? new Date(activeStudent.created_at).toLocaleDateString() : 'N/A',
                    registrationStatus: activeStudent.academic_status || 'Active',
                    currentSemester: 'N/A'
                  },
                  documents: {}
                }} />
              ) : (
                paymentData ? (
                  <StudentPayments payments={paymentData} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500">Loading payment data...</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Add Payment</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Type
                  </label>
                  <select
                    value={paymentForm.payment_type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    required
                  >
                    <option value="Registration Fee">Registration Fee</option>
                    <option value="Program Fee">Program Fee</option>
                    <option value="Installment">Installment</option>
                    <option value="Late Fee">Late Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    placeholder="Enter amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={paymentForm.payment_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    placeholder="Enter reference number (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                      focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    rows="3"
                    placeholder="Payment description (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      transition-colors duration-200 focus:outline-none focus:ring-2 
                      focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement; 