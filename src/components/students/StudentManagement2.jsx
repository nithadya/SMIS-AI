import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard, AnimatedList, ScrollProgress } from '../ui';
import { 
  searchStudentsAdvanced, 
  getStudentProfile, 
  getStudentAcademicAnalytics,
  getStudentManagementStats,
  getStudentRetentionAnalytics,
  updateStudentStatus,
  addStudentNote
} from '../../lib/api/students';
import { Toast } from '../common/Toast';

const StudentManagement2 = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [managementStats, setManagementStats] = useState(null);
  const [retentionAnalytics, setRetentionAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    program: 'all',
    batch: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [toast, setToast] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [statusChange, setStatusChange] = useState({ status: '', reason: '' });

  useEffect(() => {
    loadManagementStats();
    loadRetentionAnalytics();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || Object.values(selectedFilters).some(f => f !== 'all')) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedFilters]);

  const loadManagementStats = async () => {
    try {
      const { data, error } = await getStudentManagementStats();
      if (error) throw new Error(error);
      setManagementStats(data);
    } catch (error) {
      console.error('Error loading management stats:', error);
      showToast('Failed to load management statistics', 'error');
    }
  };

  const loadRetentionAnalytics = async () => {
    try {
      const { data, error } = await getStudentRetentionAnalytics();
      if (error) throw new Error(error);
      setRetentionAnalytics(data);
    } catch (error) {
      console.error('Error loading retention analytics:', error);
      showToast('Failed to load retention analytics', 'error');
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await searchStudentsAdvanced(searchQuery, selectedFilters);
      if (error) throw new Error(error);
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching students:', error);
      showToast('Failed to search students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      const { data, error } = await getStudentAcademicAnalytics(studentId);
      if (error) throw new Error(error);
      setStudentDetails(data);
    } catch (error) {
      console.error('Error loading student details:', error);
      showToast('Failed to load student details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedView('student-details');
    loadStudentDetails(student.id);
  };

  const handleStatusUpdate = async () => {
    if (!selectedStudent || !statusChange.status) return;
    
    setLoading(true);
    try {
      const { error } = await updateStudentStatus(
        selectedStudent.id, 
        statusChange.status, 
        statusChange.reason
      );
      if (error) throw new Error(error);
      
      showToast('Student status updated successfully', 'success');
      setShowStatusModal(false);
      loadStudentDetails(selectedStudent.id);
      performSearch(); // Refresh search results
    } catch (error) {
      console.error('Error updating student status:', error);
      showToast('Failed to update student status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedStudent?.enrollment_id || !newNote.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await addStudentNote(selectedStudent.enrollment_id, newNote.trim());
      if (error) throw new Error(error);
      
      showToast('Note added successfully', 'success');
      setShowNoteModal(false);
      setNewNote('');
      loadStudentDetails(selectedStudent.id);
    } catch (error) {
      console.error('Error adding note:', error);
      showToast('Failed to add note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Comprehensive student data and analytics platform
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, name, email, or phone..."
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300 min-w-[250px]"
        />
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
        >
          <option value="overview">Overview</option>
          <option value="search">Search Students</option>
          <option value="analytics">Analytics</option>
          <option value="student-details">Student Details</option>
        </select>
      </div>
    </div>
  );

  const renderSearchFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <select
        value={selectedFilters.status}
        onChange={(e) => setSelectedFilters({ ...selectedFilters, status: e.target.value })}
        className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
      >
        <option value="all">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Graduated">Graduated</option>
        <option value="Suspended">Suspended</option>
        <option value="Withdrawn">Withdrawn</option>
        <option value="On Hold">On Hold</option>
      </select>
      
      <select
        value={selectedFilters.dateRange}
        onChange={(e) => setSelectedFilters({ ...selectedFilters, dateRange: e.target.value })}
        className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">This Quarter</option>
        <option value="year">This Year</option>
      </select>

      <div className="col-span-2 flex gap-2">
        <button
          onClick={() => setSelectedFilters({ program: 'all', batch: 'all', status: 'all', dateRange: 'all' })}
          className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
        >
          Clear Filters
        </button>
        <button
          onClick={performSearch}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  const renderOverviewCards = () => {
    if (!managementStats || !managementStats.overview) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((index) => (
            <MagicCard key={`loading-card-${index}`} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                  <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                  <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
                </div>
              </div>
            </MagicCard>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
            Student Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">Total Students</span>
              <span className="text-2xl font-semibold text-primary-500">{managementStats.overview?.totalStudents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">Active</span>
              <span className="text-xl font-semibold text-success-main">{managementStats.overview?.activeStudents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">Graduated</span>
              <span className="text-xl font-semibold text-info-main">{managementStats.overview?.graduatedStudents || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">On Hold</span>
              <span className="text-xl font-semibold text-warning-main">{managementStats.overview?.onHoldStudents || 0}</span>
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
            Financial Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">Total Revenue</span>
              <span className="text-xl font-semibold text-success-main">
                {formatCurrency(managementStats.financials?.totalRevenue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">Pending</span>
              <span className="text-xl font-semibold text-warning-main">
                {formatCurrency(managementStats.financials?.pendingAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-secondary-600 dark:text-secondary-400">This Month</span>
              <span className="text-xl font-semibold text-info-main">
                {formatCurrency(managementStats.financials?.monthlyRevenue || 0)}
              </span>
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
            Program Distribution
          </h3>
          <div className="space-y-3">
            {managementStats.programDistribution && Object.entries(managementStats.programDistribution).length > 0 ? (
              Object.entries(managementStats.programDistribution).slice(0, 4).map(([program, count]) => (
                <div key={`program-${program}`} className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600 dark:text-secondary-400 truncate">
                    {program.split(' ').slice(0, 3).join(' ')}
                  </span>
                  <span className="text-sm font-semibold text-primary-500">{count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-secondary-500">No program data available</div>
            )}
          </div>
        </MagicCard>
      </div>
    );
  };

  const renderSearchResults = () => (
    <MagicCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300">
          Search Results ({Array.isArray(searchResults) ? searchResults.length : 0})
        </h3>
        {loading && <div className="text-primary-500">Searching...</div>}
      </div>
      
      {!Array.isArray(searchResults) || searchResults.length === 0 && !loading ? (
        <div className="text-center py-8 text-secondary-500">
          {searchQuery.trim() || Object.values(selectedFilters).some(f => f !== 'all') 
            ? 'No students found matching your criteria' 
            : 'Enter search criteria to find students'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(searchResults) && searchResults.map((student) => (
            <motion.div
              key={`student-${student.id || student.student_id || Math.random()}`}
              className="glass p-4 rounded-xl cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleStudentSelect(student)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {student.first_name?.[0] || 'S'}{student.last_name?.[0] || 'T'}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-secondary-700 dark:text-secondary-300">
                    {student.first_name || 'Unknown'} {student.last_name || 'Student'}
                  </h4>
                  <p className="text-sm text-secondary-500">{student.student_id || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Program:</span>
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {student.programs?.code || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Batch:</span>
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {student.batches?.batch_code || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">Status:</span>
                  <span className={`font-medium ${
                    student.academic_status === 'Active' ? 'text-success-main' :
                    student.academic_status === 'Graduated' ? 'text-info-main' :
                    student.academic_status === 'On Hold' ? 'text-warning-main' : 'text-error-main'
                  }`}>
                    {student.academic_status || 'Unknown'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </MagicCard>
  );

  const renderStudentDetails = () => {
    if (!selectedStudent) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
              No Student Selected
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Please search for and select a student to view their details
            </p>
            <button
              onClick={() => setSelectedView('search')}
              className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
            >
              Go to Search
            </button>
          </div>
        </div>
      );
    }

    if (!studentDetails) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-secondary-600 dark:text-secondary-400">Loading student details...</p>
          </div>
        </div>
      );
    }

    const student = studentDetails.student;
    const performance = studentDetails.performance;
    const financials = studentDetails.financials;
    const riskAssessment = studentDetails.riskAssessment;

    return (
      <div className="space-y-6">
        {/* Student Header */}
        <MagicCard className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-xl">
                  {student.first_name?.[0]}{student.last_name?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary-700 dark:text-secondary-300">
                  {student.first_name} {student.last_name}
                </h2>
                <p className="text-lg text-secondary-600 dark:text-secondary-400">
                  {student.student_id}
                </p>
                <p className="text-secondary-500">{student.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </MagicCard>

        {/* Student Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Academic Information */}
          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
              Academic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Program</label>
                <p className="font-medium">{student.programs?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Batch</label>
                <p className="font-medium">{student.batches?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Status</label>
                <p className={`font-medium ${
                  student.academic_status === 'Active' ? 'text-success-main' :
                  student.academic_status === 'Graduated' ? 'text-info-main' :
                  student.academic_status === 'On Hold' ? 'text-warning-main' : 'text-error-main'
                }`}>
                  {student.academic_status}
                </p>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Enrollment Date</label>
                <p className="font-medium">{new Date(student.enrollment_date).toLocaleDateString()}</p>
              </div>
            </div>
          </MagicCard>

          {/* Performance Metrics */}
          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">GPA</span>
                <span className="font-semibold">{performance.gpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Attendance</span>
                <span className="font-semibold">{performance.attendanceRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Assignment Completion</span>
                <span className="font-semibold">{performance.assignmentCompletion.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Participation</span>
                <span className="font-semibold">{performance.participationScore.toFixed(1)}%</span>
              </div>
            </div>
          </MagicCard>

          {/* Risk Assessment */}
          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
              Risk Assessment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600 dark:text-secondary-400">Risk Level</span>
                <span className={`font-bold text-lg ${getRiskColor(riskAssessment.level)}`}>
                  {riskAssessment.level}
                </span>
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Risk Factors</label>
                {riskAssessment?.factors && riskAssessment.factors.length > 0 ? (
                  <ul className="list-disc list-inside text-sm">
                    {riskAssessment.factors.map((factor) => (
                      <li key={factor} className="text-warning-main">{factor}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-success-main text-sm">No risk factors identified</p>
                )}
              </div>
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Recommendation</label>
                <p className="text-sm font-medium">{riskAssessment?.recommendation || 'No recommendation available'}</p>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Financial Information */}
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-main">
                {formatCurrency(financials.totalPaid)}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-main">
                {formatCurrency(financials.pendingPayments)}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-info-main">
                {financials?.paymentHistory?.length || 0}
              </div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Transactions</div>
            </div>
          </div>

          {/* Recent Payments */}
          <div>
            <h4 className="text-md font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
              Recent Payments
            </h4>
            <div className="space-y-2">
              {financials?.paymentHistory && financials.paymentHistory.length > 0 ? (
                financials.paymentHistory.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center py-2 border-b border-secondary-200 dark:border-secondary-700">
                    <div>
                      <span className="font-medium">{payment.payment_type}</span>
                      <span className="text-sm text-secondary-500 ml-2">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                      <div className={`text-sm ${
                        payment.payment_status === 'Completed' ? 'text-success-main' :
                        payment.payment_status === 'Pending' ? 'text-warning-main' : 'text-error-main'
                      }`}>
                        {payment.payment_status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-secondary-500">No payment history available</div>
              )}
            </div>
          </div>
        </MagicCard>

        {/* Documents and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
              Documents ({studentDetails?.documents?.length || 0})
            </h3>
            <div className="space-y-2">
              {studentDetails?.documents && studentDetails.documents.length > 0 ? (
                studentDetails.documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center py-2">
                    <div>
                      <div className="font-medium">{doc.document_name}</div>
                      <div className="text-sm text-secondary-500">{doc.document_type}</div>
                    </div>
                    <div className="text-sm text-secondary-500">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 text-center py-4">No documents uploaded</p>
              )}
            </div>
          </MagicCard>

          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
              Notes ({studentDetails?.notes?.length || 0})
            </h3>
            <div className="space-y-3">
              {studentDetails?.notes && studentDetails.notes.length > 0 ? (
                studentDetails.notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="glass p-3 rounded-lg">
                    <div className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                      {note.author} • {new Date(note.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm">{note.content}</div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 text-center py-4">No notes available</p>
              )}
            </div>
          </MagicCard>
        </div>
      </div>
    );
  };

  const renderRetentionAnalytics = () => {
    if (!retentionAnalytics) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MagicCard className="p-6 text-center">
            <div className="text-3xl font-bold text-primary-500">
              {retentionAnalytics.overview.retentionRate.toFixed(1)}%
            </div>
            <div className="text-secondary-600 dark:text-secondary-400">Overall Retention</div>
          </MagicCard>
          
          <MagicCard className="p-6 text-center">
            <div className="text-3xl font-bold text-success-main">
              {retentionAnalytics.riskAssessment.lowRisk}
            </div>
            <div className="text-secondary-600 dark:text-secondary-400">Low Risk Students</div>
          </MagicCard>
          
          <MagicCard className="p-6 text-center">
            <div className="text-3xl font-bold text-warning-main">
              {retentionAnalytics.riskAssessment.mediumRisk}
            </div>
            <div className="text-secondary-600 dark:text-secondary-400">Medium Risk Students</div>
          </MagicCard>
          
          <MagicCard className="p-6 text-center">
            <div className="text-3xl font-bold text-error-main">
              {retentionAnalytics.riskAssessment.highRisk}
            </div>
            <div className="text-secondary-600 dark:text-secondary-400">High Risk Students</div>
          </MagicCard>
        </div>

        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
            Retention by Program
          </h3>
          <div className="space-y-3">
            {retentionAnalytics.programRetention && Object.entries(retentionAnalytics.programRetention).length > 0 ? (
              Object.entries(retentionAnalytics.programRetention).map(([program, data]) => (
                <div key={program} className="flex justify-between items-center py-2 border-b border-secondary-200 dark:border-secondary-700">
                  <div>
                    <div className="font-medium">{program}</div>
                    <div className="text-sm text-secondary-500">
                      {data.active} active, {data.graduated} graduated of {data.total} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      data.retentionRate >= 90 ? 'text-success-main' :
                      data.retentionRate >= 80 ? 'text-warning-main' : 'text-error-main'
                    }`}>
                      {data.retentionRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-secondary-500">No retention data available</div>
            )}
          </div>
        </MagicCard>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'overview':
        return (
          <>
            {renderOverviewCards()}
            {managementStats?.recentEnrollments?.length > 0 && (
              <MagicCard className="p-6">
                <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-4">
                  Recent Enrollments (Last 30 Days)
                </h3>
                <div className="space-y-3">
                  {managementStats.recentEnrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex justify-between items-center py-2 border-b border-secondary-200 dark:border-secondary-700">
                      <div>
                        <div className="font-medium">{enrollment.first_name} {enrollment.last_name}</div>
                        <div className="text-sm text-secondary-500">{enrollment.programs?.name}</div>
                      </div>
                      <div className="text-sm text-secondary-500">
                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </MagicCard>
            )}
          </>
        );
      case 'search':
        return (
          <>
            {renderSearchFilters()}
            {renderSearchResults()}
          </>
        );
      case 'analytics':
        return renderRetentionAnalytics();
      case 'student-details':
        return renderStudentDetails();
      default:
        return renderOverviewCards();
    }
  };

  return (
    <>
      <ScrollProgress />
      <div className="p-6">
        {renderHeader()}
        {renderContent()}

        {/* Status Update Modal */}
        <AnimatePresence>
          {showStatusModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowStatusModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4">Update Student Status</h3>
                <div className="space-y-4">
                  <select
                    value={statusChange.status}
                    onChange={(e) => setStatusChange({ ...statusChange, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                  <textarea
                    value={statusChange.reason}
                    onChange={(e) => setStatusChange({ ...statusChange, reason: e.target.value })}
                    placeholder="Reason for status change..."
                    className="w-full px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
                    rows={3}
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!statusChange.status || loading}
                      className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Note Modal */}
        <AnimatePresence>
          {showNoteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowNoteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4">Add Student Note</h3>
                <div className="space-y-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter note content..."
                    className="w-full px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
                    rows={4}
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowNoteModal(false)}
                      className="px-4 py-2 rounded-lg glass text-secondary-700 dark:text-secondary-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || loading}
                      className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </>
  );
};

export default StudentManagement2; 