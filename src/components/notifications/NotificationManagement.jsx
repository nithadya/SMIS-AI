import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  getNotifications,
  sendPaymentReminder,
  sendProcessIncompleteNotification,
  sendGeneralNotification,
  getNotificationStatistics,
  deleteNotification,
  getStudentsForNotification,
  NOTIFICATION_TYPES,
  TARGET_TYPES
} from '../../lib/api/notifications';
import { getPendingPayments } from '../../lib/api/payments';
import { getAllPrograms } from '../../lib/api/programs';
import { showToast } from '../common/Toast';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { MagicCard } from '../ui/MagicCard';
import { ShimmerButton } from '../ui/ShimmerButton';

const NotificationManagement = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPaymentReminderModal, setShowPaymentReminderModal] = useState(false);
  const [showProcessReminderModal, setShowProcessReminderModal] = useState(false);
  
  // Form states
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    target_type: TARGET_TYPES.ALL_STUDENTS,
    notification_type: NOTIFICATION_TYPES.GENERAL_ANNOUNCEMENT,
    priority: 'medium',
    program_ids: [],
    student_ids: []
  });

  const [paymentReminderForm, setPaymentReminderForm] = useState({
    target_students: 'all', // 'all' or 'specific'
    student_ids: [],
    custom_message: ''
  });

  const [processReminderForm, setProcessReminderForm] = useState({
    target_students: 'all',
    student_ids: [],
    process_type: 'enrollment'
  });

  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    date_from: '',
    date_to: ''
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadNotifications(),
        loadStatistics(),
        loadPendingPayments(),
        loadPrograms(),
        loadStudents()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await getNotifications(filters);
      if (error) throw new Error(error);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const { data, error } = await getNotificationStatistics();
      if (error) throw new Error(error);
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadPendingPayments = async () => {
    try {
      const data = await getPendingPayments();
      setPendingPayments(data || []);
    } catch (error) {
      console.error('Error loading pending payments:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const { data, error } = await getAllPrograms();
      if (error) throw new Error(error);
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await getStudentsForNotification({ academic_status: 'Active' });
      if (error) throw new Error(error);
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Handle payment reminder
  const handleSendPaymentReminder = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      
      const studentIds = paymentReminderForm.target_students === 'specific' 
        ? paymentReminderForm.student_ids 
        : [];

      const { data, error } = await sendPaymentReminder(
        studentIds, 
        paymentReminderForm.custom_message || null
      );

      if (error) throw new Error(error);

      showToast.success(data.message);
      setShowPaymentReminderModal(false);
      resetPaymentReminderForm();
      loadNotifications();
      loadStatistics();
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      showToast.error('Failed to send payment reminder: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Handle process incomplete reminder
  const handleSendProcessReminder = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      
      const studentIds = processReminderForm.target_students === 'specific' 
        ? processReminderForm.student_ids 
        : [];

      const { data, error } = await sendProcessIncompleteNotification(
        studentIds, 
        processReminderForm.process_type
      );

      if (error) throw new Error(error);

      showToast.success(data.message);
      setShowProcessReminderModal(false);
      resetProcessReminderForm();
      loadNotifications();
      loadStatistics();
    } catch (error) {
      console.error('Error sending process reminder:', error);
      showToast.error('Failed to send process reminder: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Handle general notification
  const handleSendGeneralNotification = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      
      const { data, error } = await sendGeneralNotification(notificationForm);

      if (error) throw new Error(error);

      showToast.success(data.message);
      setShowNotificationModal(false);
      resetNotificationForm();
      loadNotifications();
      loadStatistics();
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast.error('Failed to send notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const { error } = await deleteNotification(notificationId);
      if (error) throw new Error(error);

      showToast.success('Notification deleted successfully');
      loadNotifications();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast.error('Failed to delete notification: ' + error.message);
    }
  };

  // Reset forms
  const resetNotificationForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      target_type: TARGET_TYPES.ALL_STUDENTS,
      notification_type: NOTIFICATION_TYPES.GENERAL_ANNOUNCEMENT,
      priority: 'medium',
      program_ids: [],
      student_ids: []
    });
  };

  const resetPaymentReminderForm = () => {
    setPaymentReminderForm({
      target_students: 'all',
      student_ids: [],
      custom_message: ''
    });
  };

  const resetProcessReminderForm = () => {
    setProcessReminderForm({
      target_students: 'all',
      student_ids: [],
      process_type: 'enrollment'
    });
  };

  // Get notification type display name
  const getNotificationTypeDisplay = (type) => {
    const typeMap = {
      [NOTIFICATION_TYPES.PAYMENT_REMINDER]: 'Payment Reminder',
      [NOTIFICATION_TYPES.PROCESS_INCOMPLETE]: 'Process Incomplete',
      [NOTIFICATION_TYPES.ENROLLMENT_PENDING]: 'Enrollment Pending',
      [NOTIFICATION_TYPES.DOCUMENT_MISSING]: 'Document Missing',
      [NOTIFICATION_TYPES.FOLLOW_UP_REQUIRED]: 'Follow-up Required',
      [NOTIFICATION_TYPES.EVENT_REMINDER]: 'Event Reminder',
      [NOTIFICATION_TYPES.GENERAL_ANNOUNCEMENT]: 'General Announcement',
      [NOTIFICATION_TYPES.DEADLINE_APPROACHING]: 'Deadline Approaching',
      [NOTIFICATION_TYPES.STATUS_UPDATE]: 'Status Update'
    };
    return typeMap[type] || type;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ShimmerButton
            onClick={() => setShowPaymentReminderModal(true)}
            className="bg-red-500 hover:bg-red-600"
          >
            <span className="mr-2">💰</span>
            Payment Reminders
          </ShimmerButton>
          <ShimmerButton
            onClick={() => setShowProcessReminderModal(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <span className="mr-2">📋</span>
            Process Reminders
          </ShimmerButton>
          <ShimmerButton
            onClick={() => setShowNotificationModal(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <span className="mr-2">📢</span>
            General Notification
          </ShimmerButton>
        </div>
      </MagicCard>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MagicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.total_notifications}</p>
              </div>
              <div className="text-3xl">📧</div>
            </div>
          </MagicCard>
          <MagicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Recipients</p>
                <p className="text-2xl font-bold text-green-600">{statistics.total_recipients}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </MagicCard>
          <MagicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Payment Reminders</p>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.by_type[NOTIFICATION_TYPES.PAYMENT_REMINDER] || 0}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </MagicCard>
          <MagicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">{pendingPayments.length}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </MagicCard>
        </div>
      )}

      {/* Recent Notifications */}
      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notifications</h3>
        {notifications.slice(0, 5).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{notification.title}</h4>
                  <p className="text-sm text-gray-600">
                    {getNotificationTypeDisplay(notification.notification_type)} • 
                    {notification.sent_count} recipients • 
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </MagicCard>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <AnimatedGradientText className="text-3xl font-bold mb-2">
            Notification Management
          </AnimatedGradientText>
          <p className="text-gray-600">
            Send reminders, announcements, and notifications to students
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications History
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showPaymentReminderModal && <PaymentReminderModal />}
        {showProcessReminderModal && <ProcessReminderModal />}
        {showNotificationModal && <GeneralNotificationModal />}
      </AnimatePresence>
    </div>
  );
};

export default NotificationManagement; 