import React, { useState, useEffect } from 'react';
import { 
  getPendingPayments, 
  getStudentPayments, 
  createPaymentTransaction, 
  updatePaymentStatus,
  getEnrollmentsForPayment,
  generateReceiptNumber,
  getStudentPaymentSummary
} from '../../lib/api/payments';
import { searchStudents, getStudentPaymentSummaryByEnrollment } from '../../lib/api/students';
import { Toast } from '../common/Toast';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPayments, setPendingPayments] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentPayments, setSelectedStudentPayments] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    enrollment_id: '',
    payment_type: 'Registration Fee',
    amount: '',
    payment_method: 'Cash',
    payment_reference: '',
    description: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadPaymentData();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        handleStudentSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleStudentSearch = async (query) => {
    try {
      setSearchLoading(true);
      const { data, error } = await searchStudents(query);
      if (error) {
        console.error('Search error:', error);
        return;
      }
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching students:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    try {
      setSelectedStudent(student);
      setSearchQuery(`${student.first_name} ${student.last_name}`);
      setShowSearchResults(false);
      
      // Load student payment data - use enrollment_id instead of student.id
      const enrollmentId = student.enrollment_id || student.id;
      console.log('Loading payment data for enrollment ID:', enrollmentId);
      
      const { data: paymentData } = await getStudentPaymentSummaryByEnrollment(enrollmentId);
      setSelectedStudentPayments(paymentData);
    } catch (error) {
      console.error('Error loading student payment data:', error);
      showToast('Error loading student payment data', 'error');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedStudent(null);
    setSelectedStudentPayments(null);
    setShowSearchResults(false);
  };

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const [pendingData, paymentsData, enrollmentsData] = await Promise.all([
        getPendingPayments(),
        getStudentPayments(),
        getEnrollmentsForPayment()
      ]);
      
      setPendingPayments(pendingData);
      setStudentPayments(paymentsData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading payment data:', error);
      showToast('Error loading payment data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!paymentForm.enrollment_id || !paymentForm.amount) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const paymentData = {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        receipt_number: generateReceiptNumber(),
        payment_status: 'Completed'
      };

      await createPaymentTransaction(paymentData);
      
      showToast('Payment processed successfully', 'success');
      setShowPaymentModal(false);
      setPaymentForm({
        enrollment_id: '',
        payment_type: 'Registration Fee',
        amount: '',
        payment_method: 'Cash',
        payment_reference: '',
        description: ''
      });
      
      await loadPaymentData();
    } catch (error) {
      console.error('Error processing payment:', error);
      showToast('Error processing payment', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-600';
      case 'Pending': return 'bg-yellow-50 text-yellow-600';
      case 'Failed': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const renderStudentSearch = () => (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Student Payment Search</h3>
      
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name..."
            className="w-full px-4 py-3 pl-10 pr-10 rounded-lg border border-slate-200 text-sm 
              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {searchResults.map((student) => (
              <button
                key={student.id}
                onClick={() => handleSelectStudent(student)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.student_id} • {student.email}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {student.programs?.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {searchLoading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-slate-500">Searching...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected Student Payment Info */}
      {selectedStudent && selectedStudentPayments && (
        <div className="space-y-6">
          <div className="border border-slate-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-medium text-slate-800">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h4>
                <p className="text-sm text-slate-500">
                  ID: {selectedStudent.student_id} • {selectedStudent.email}
                </p>
                <p className="text-sm text-slate-500">
                  Program: {selectedStudent.programs?.name}
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Required</p>
                <p className="text-xl font-bold text-blue-800">
                  {formatCurrency(selectedStudentPayments.total_required || 0)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Total Paid</p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(selectedStudentPayments.total_paid || 0)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Total Due</p>
                <p className="text-xl font-bold text-red-800">
                  {formatCurrency(selectedStudentPayments.total_pending || 0)}
                </p>
              </div>
            </div>
            
            {/* Fee Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Registration Fee:</span>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    (selectedStudentPayments.registration_paid || 0) >= (selectedStudentPayments.registration_fee || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedStudentPayments.registration_paid || 0)} / {formatCurrency(selectedStudentPayments.registration_fee || 0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Program Fee:</span>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    (selectedStudentPayments.program_paid || 0) >= (selectedStudentPayments.program_fee || 0) 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedStudentPayments.program_paid || 0)} / {formatCurrency(selectedStudentPayments.program_fee || 0)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Payment History */}
            {selectedStudentPayments.payments && selectedStudentPayments.payments.length > 0 && (
              <div>
                <h5 className="text-md font-medium text-slate-800 mb-3">Payment History</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 text-slate-600">Date</th>
                        <th className="text-left py-2 text-slate-600">Type</th>
                        <th className="text-left py-2 text-slate-600">Amount</th>
                        <th className="text-left py-2 text-slate-600">Method</th>
                        <th className="text-left py-2 text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentPayments.payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100">
                          <td className="py-2 text-slate-700">
                            {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 text-slate-700">{payment.payment_type}</td>
                          <td className="py-2 font-medium text-slate-800">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-2 text-slate-700">{payment.payment_method}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.payment_status)}`}>
                              {payment.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {selectedStudent && !selectedStudentPayments && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading payment data...</p>
        </div>
      )}
    </div>
  );

  const renderPendingPayments = () => (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-semibold text-slate-800">Pending Payments</h3>
        <button 
          onClick={() => setShowPaymentModal(true)}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg 
            hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 
            transition-all duration-200"
        >
          Process Payment
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingPayments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No pending payments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingPayments.map(payment => (
            <div 
              key={payment.id} 
              className="group border border-slate-200 rounded-xl p-6 hover:border-blue-200 
                hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-base font-medium text-slate-800 group-hover:text-blue-600 
                  transition-colors">
                  {payment.student_name}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${payment.is_registration_incomplete 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-yellow-50 text-yellow-600'}`}
                >
                  {payment.is_registration_incomplete ? 'Registration Incomplete' : 'Pending'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Program:</span>
                  <span className="text-slate-700 font-medium">{payment.program}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registration Fee:</span>
                  <span className={`font-medium ${payment.pending_registration > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(payment.registration_paid)} / {formatCurrency(payment.registration_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Program Fee:</span>
                  <span className={`font-medium ${payment.pending_program > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(payment.program_paid)} / {formatCurrency(payment.program_fee)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-700">Total Pending:</span>
                    <span className="text-red-600">{formatCurrency(payment.total_pending)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  className="flex-1 px-4 py-2.5 text-sm text-slate-600 bg-slate-100 
                    hover:bg-slate-200 focus:bg-slate-300 rounded-lg transition-all duration-200"
                  onClick={() => {
                    setSelectedPayment(payment);
                    setPaymentForm(prev => ({
                      ...prev,
                      enrollment_id: payment.id,
                      amount: payment.pending_registration > 0 ? payment.pending_registration.toString() : payment.pending_program.toString(),
                      payment_type: payment.pending_registration > 0 ? 'Registration Fee' : 'Program Fee'
                    }));
                    setShowPaymentModal(true);
                  }}
                >
                  Pay Now
                </button>
                <button 
                  className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-500 
                    hover:bg-blue-600 focus:bg-blue-700 rounded-lg transition-all duration-200"
                  onClick={async () => {
                    try {
                      const summary = await getStudentPaymentSummary(payment.id);
                      alert(`Payment Summary for ${payment.student_name}:\n\nTotal Required: ${formatCurrency(summary.total_required)}\nTotal Paid: ${formatCurrency(summary.total_paid)}\nTotal Pending: ${formatCurrency(summary.total_pending)}\n\nPayments Made: ${summary.payments.length}`);
                    } catch (error) {
                      showToast('Error loading payment summary', 'error');
                    }
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecentTransactions = () => (
    <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-8">Recent Transactions</h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : studentPayments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentPayments.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800">
                      {transaction.students?.first_name} {transaction.students?.last_name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {transaction.students?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {transaction.payment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {transaction.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(transaction.payment_status)}`}>
                      {transaction.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {new Date(transaction.payment_date || transaction.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPaymentModal = () => (
    showPaymentModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Process Payment</h3>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Student
              </label>
              <select 
                value={paymentForm.enrollment_id}
                onChange={(e) => setPaymentForm({...paymentForm, enrollment_id: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                required
              >
                <option value="">Select student</option>
                {enrollments.map(enrollment => (
                  <option key={enrollment.id} value={enrollment.id}>
                    {enrollment.student_name} - {enrollment.programs?.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Type
              </label>
              <select 
                value={paymentForm.payment_type}
                onChange={(e) => setPaymentForm({...paymentForm, payment_type: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="Registration Fee">Registration Fee</option>
                <option value="Program Fee">Program Fee</option>
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
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
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
                onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reference Number
              </label>
              <input 
                type="text"
                value={paymentForm.payment_reference}
                onChange={(e) => setPaymentForm({...paymentForm, payment_reference: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                placeholder="Optional"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea 
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                rows="3"
                placeholder="Optional notes"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2.5 text-sm text-slate-600 bg-slate-100 
                  hover:bg-slate-200 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2.5 text-sm text-white bg-blue-500 
                  hover:bg-blue-600 focus:bg-blue-700 rounded-lg transition-all duration-200"
              >
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Payment Management</h2>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'pending' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Pending Payments
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'search' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Student Search
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'transactions' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Transactions
          </button>
        </div>
      </div>
      
      {activeTab === 'pending' && renderPendingPayments()}
      {activeTab === 'search' && renderStudentSearch()}
      {activeTab === 'transactions' && renderRecentTransactions()}
      
      {renderPaymentModal()}
      
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
};

export default Payments; 