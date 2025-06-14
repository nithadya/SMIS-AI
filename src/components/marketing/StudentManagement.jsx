import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getStudents, 
  getStudentById,
  getStudentByStudentId,
  getStudentPayments,
  getStudentDocuments,
  getStudentStats,
  searchStudents,
  updateStudent,
  addStudentPayment
} from '../../lib/api/students';
import { getPrograms } from '../../lib/api/batches';
import { showToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

const StudentManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [studentPayments, setStudentPayments] = useState([]);
  const [studentDocuments, setStudentDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const [filters, setFilters] = useState({
    search: '',
    program: 'all',
    batch: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_type: 'Tuition',
    amount: '',
    payment_method: 'Cash',
    payment_reference: '',
    description: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await getStudents(filters);
      if (error) {
        showToast.error(error);
        return;
      }
      setStudents(data || []);
    } catch (error) {
      showToast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const { data, error } = await getPrograms();
      if (error) {
        showToast.error(error);
        return;
      }
      setPrograms(data || []);
    } catch (error) {
      showToast.error('Failed to fetch programs');
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await getStudentStats();
      if (error) {
        showToast.error(error);
        return;
      }
      setStats(data || {});
    } catch (error) {
      showToast.error('Failed to fetch statistics');
    }
  };

  const handleStudentSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchStudents();
      return;
    }

    try {
      // Try to search by student ID first
      if (searchTerm.includes('-')) {
        const { data: studentData, error } = await getStudentByStudentId(searchTerm.toUpperCase());
        if (!error && studentData) {
          setStudents([studentData]);
          return;
        }
      }

      // General search
      const { data, error } = await searchStudents(searchTerm);
      if (error) {
        showToast.error(error);
        return;
      }
      setStudents(data || []);
    } catch (error) {
      showToast.error('Search failed');
    }
  };

  const openStudentModal = async (student) => {
    setSelectedStudent(student);
    setActiveTab('overview');
    setShowStudentModal(true);

    // Fetch additional data
    try {
      const [paymentsResult, documentsResult] = await Promise.all([
        getStudentPayments(student.id),
        getStudentDocuments(student.enrollment_id)
      ]);

      if (paymentsResult.data) setStudentPayments(paymentsResult.data);
      if (documentsResult.data) setStudentDocuments(documentsResult.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await addStudentPayment({
        ...paymentForm,
        student_id: selectedStudent.id,
        enrollment_id: selectedStudent.enrollment_id,
        amount: parseFloat(paymentForm.amount)
      });

      if (error) {
        showToast.error(error);
        return;
      }

      showToast.success('Payment added successfully');
      setShowPaymentModal(false);
      setPaymentForm({
        payment_type: 'Tuition',
        amount: '',
        payment_method: 'Cash',
        payment_reference: '',
        description: ''
      });

      // Refresh payments
      const { data: updatedPayments } = await getStudentPayments(selectedStudent.id);
      setStudentPayments(updatedPayments || []);
    } catch (error) {
      showToast.error('Failed to add payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success-light dark:bg-success-light/10 text-success-main border-success-main/20';
      case 'graduated':
        return 'bg-purple-100 dark:bg-purple-100/10 text-purple-600 dark:text-purple-400 border-purple-200/20 dark:border-purple-700/20';
      case 'suspended':
        return 'bg-warning-light dark:bg-warning-light/10 text-warning-main border-warning-main/20';
      case 'withdrawn':
        return 'bg-red-100 dark:bg-red-100/10 text-red-600 dark:text-red-400 border-red-200/20 dark:border-red-700/20';
      case 'on hold':
        return 'bg-secondary-100 dark:bg-secondary-100/10 text-secondary-600 dark:text-secondary-400 border-secondary-200/20 dark:border-secondary-700/20';
      default:
        return 'bg-secondary-100 dark:bg-secondary-100/10 text-secondary-600 dark:text-secondary-400 border-secondary-200/20 dark:border-secondary-700/20';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const StudentModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowStudentModal(false);
          setSelectedStudent(null);
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card glass max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-secondary-200/10 dark:border-secondary-700/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {selectedStudent?.first_name} {selectedStudent?.last_name}
              </h2>
              <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                Student ID: {selectedStudent?.student_id}
              </p>
            </div>
            <button
              onClick={() => setShowStudentModal(false)}
              className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-6">
            {['overview', 'academic', 'documents', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Email</label>
                    <p className="text-secondary-800 dark:text-secondary-200">{selectedStudent?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Phone</label>
                    <p className="text-secondary-800 dark:text-secondary-200">{selectedStudent?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Date of Birth</label>
                    <p className="text-secondary-800 dark:text-secondary-200">
                      {selectedStudent?.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Gender</label>
                    <p className="text-secondary-800 dark:text-secondary-200">{selectedStudent?.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Address</label>
                    <p className="text-secondary-800 dark:text-secondary-200">{selectedStudent?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
                  Academic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Program</label>
                    <p className="text-secondary-800 dark:text-secondary-200">{selectedStudent?.programs?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Batch</label>
                    <p className="text-secondary-800 dark:text-secondary-200">{selectedStudent?.batches?.batch_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Enrollment Date</label>
                    <p className="text-secondary-800 dark:text-secondary-200">
                      {selectedStudent?.enrollment_date ? new Date(selectedStudent.enrollment_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Status</label>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedStudent?.academic_status)}`}>
                      {selectedStudent?.academic_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
                Academic Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-700 dark:text-secondary-300">Current Program</h4>
                  <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
                    <p className="font-medium">{selectedStudent?.programs?.name}</p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Duration: {selectedStudent?.programs?.duration}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Batch: {selectedStudent?.batches?.batch_code}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Schedule: {selectedStudent?.batches?.schedule}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-700 dark:text-secondary-300">Previous Education</h4>
                  <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
                    <p className="font-medium">{selectedStudent?.previous_education || 'N/A'}</p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Institution: {selectedStudent?.institution || 'N/A'}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Year: {selectedStudent?.year_completed || 'N/A'}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Results: {selectedStudent?.grade_results || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
                  Documents
                </h3>
              </div>

              {studentDocuments.length === 0 ? (
                <div className="text-center py-8 text-secondary-500 dark:text-secondary-400">
                  No documents found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentDocuments.map((doc) => (
                    <div key={doc.id} className="bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-800 dark:text-secondary-200">
                            {doc.document_name}
                          </h4>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                            Type: {doc.document_type}
                          </p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Size: {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="text-primary-500 hover:text-primary-600 text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-secondary-200">
                  Payment History
                </h3>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary"
                >
                  Add Payment
                </button>
              </div>

              {studentPayments.length === 0 ? (
                <div className="text-center py-8 text-secondary-500 dark:text-secondary-400">
                  No payments found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary-200/10 dark:border-secondary-700/10">
                        <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase">Type</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase">Amount</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase">Method</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200/10 dark:divide-secondary-700/10">
                      {studentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                            {payment.payment_type}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-secondary-800 dark:text-secondary-200">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                            {payment.payment_method}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              payment.payment_status === 'Completed' 
                                ? 'bg-success-light text-success-main'
                                : payment.payment_status === 'Pending'
                                ? 'bg-warning-light text-warning-main'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {payment.payment_status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                            {payment.payment_reference || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  const PaymentModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowPaymentModal(false);
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card glass max-w-md w-full"
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-6">
            Add Payment
          </h3>

          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Payment Type
              </label>
              <select
                value={paymentForm.payment_type}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_type: e.target.value })}
                className="input-field"
                required
              >
                <option value="Registration Fee">Registration Fee</option>
                <option value="Tuition">Tuition</option>
                <option value="Installment">Installment</option>
                <option value="Late Fee">Late Fee</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Payment Method
              </label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                className="input-field"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                className="input-field"
                placeholder="Transaction/Receipt number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Payment description..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Add Payment
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="p-6 space-dots">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
              Student Management
            </h1>
            <p className="text-secondary-500 dark:text-secondary-400">Manage and view student information</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card glass p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Students</p>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{stats.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="card glass p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/20">
                <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Active Students</p>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{stats.activeStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="card glass p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Graduated</p>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{stats.graduatedStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="card glass p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-100 dark:bg-accent-900/20">
                <svg className="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Programs</p>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{Object.keys(stats.programCounts || {}).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                if (e.target.value.trim()) {
                  handleStudentSearch(e.target.value);
                }
              }}
              className="input-field w-full"
            />
          </div>

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
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="On Hold">On Hold</option>
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

      {/* Students Table */}
      <div className="card glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200/10 dark:border-secondary-700/10">
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Student</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Program</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Batch</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Enrollment Date</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-secondary-500 dark:text-secondary-400">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <motion.tr 
                    key={student.id}
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                    className="transition-colors cursor-pointer"
                    onClick={() => openStudentModal(student)}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                          {student.student_id}
                        </div>
                        <div className="text-sm text-secondary-600 dark:text-secondary-400">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                      {student.programs?.name || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                      {student.batches?.batch_code || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary-700 dark:text-secondary-300">
                      {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.academic_status)}`}>
                        {student.academic_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStudentModal(student);
                        }}
                        className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                      >
                        View Details
                      </button>
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
        {showStudentModal && <StudentModal key="student-modal" />}
        {showPaymentModal && <PaymentModal key="payment-modal" />}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement; 