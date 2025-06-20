import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../common/Toast';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { MagicCard } from '../ui/MagicCard';
import { ShimmerButton } from '../ui/ShimmerButton';
import { 
  getMyStudents, 
  sendNotificationToMyStudents, 
  getNotificationStatistics 
} from '../../lib/api/notifications';

// Separate NotificationModal component to prevent re-creation
const NotificationModal = ({ 
  isOpen, 
  onClose, 
  notificationForm, 
  setNotificationForm, 
  onSubmit, 
  sending, 
  myStudents 
}) => {
  const handleInputChange = useCallback((field, value) => {
    setNotificationForm(prev => {
      if (prev[field] === value) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  }, [setNotificationForm]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Send Notification to My Students</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={notificationForm.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter notification title"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={notificationForm.message || ''}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your message"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={notificationForm.priority || 'medium'}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> When you submit this form, your default email client will open with a pre-filled email containing your notification. All {myStudents.length} student emails will be automatically added to the TO field. You can then review and send the email from your email client.
            </p>
            {myStudents.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                  View student list ({myStudents.length} students)
                </summary>
                <div className="mt-2 text-xs text-blue-700 max-h-32 overflow-y-auto">
                  {myStudents.map((student, index) => (
                    <div key={student.id} className="py-1">
                      {index + 1}. {student.first_name} {student.last_name} ({student.email})
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || myStudents.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {sending ? 'Sending...' : `Send to ${myStudents.length} Students`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const NotificationCenter = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Data states
  const [myStudents, setMyStudents] = useState([]);
  const [stats, setStats] = useState({});
  
  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Form states
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [studentsResult, statsResult] = await Promise.all([
        getMyStudents(),
        getNotificationStatistics()
      ]);

      if (studentsResult.error) {
        console.error('Error loading students:', studentsResult.error);
        showToast.error('Failed to load assigned students');
      } else {
        setMyStudents(studentsResult.data || []);
      }

      if (statsResult.error) {
        console.error('Error loading stats:', statsResult.error);
      } else {
        setStats(statsResult.data || {});
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast.error('Failed to load notification center data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle send notification to my students
  const handleSendNotification = useCallback(async (e) => {
    e.preventDefault();
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const result = await sendNotificationToMyStudents(notificationForm);
      
      if (result.error) {
        showToast.error(`Failed to send notification: ${result.error}`);
      } else {
        if (result.data.emailOpened) {
          showToast.success(`Email client opened with notification for ${result.data.recipients} students!`);
        } else {
          showToast.error('Failed to open email client. Please check your system settings.');
        }
        setShowNotificationModal(false);
        setNotificationForm({ title: '', message: '', priority: 'medium' });
        // Reload stats without causing re-render issues
        setTimeout(() => {
          loadData();
        }, 100);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  }, [notificationForm, loadData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <AnimatedGradientText className="text-3xl font-bold mb-2">
            📢 Notification Center
          </AnimatedGradientText>
          <p className="text-gray-600">Send notifications to your assigned students</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="font-medium text-gray-800">{user?.full_name}</p>
          <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MagicCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{myStudents.length}</div>
            <div className="text-sm text-gray-600">My Students</div>
          </div>
        </MagicCard>
        
        <MagicCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Notifications Sent</div>
          </div>
        </MagicCard>
        
        <MagicCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalSent || 0}</div>
            <div className="text-sm text-gray-600">Total Recipients</div>
          </div>
        </MagicCard>
      </div>

      {/* Main Action */}
      <div className="flex justify-center">
        <MagicCard className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="text-6xl">📧</div>
            <h3 className="text-2xl font-semibold text-gray-800">Send Notification</h3>
            <p className="text-gray-600">
              Opens your email client with a pre-filled message to all assigned students
            </p>
            <ShimmerButton
              onClick={() => setShowNotificationModal(true)}
              disabled={myStudents.length === 0}
              className="w-full"
            >
              {myStudents.length === 0 ? 'No Students Assigned' : `Notify ${myStudents.length} Students`}
            </ShimmerButton>
          </div>
        </MagicCard>
      </div>

      {/* My Students Section */}
      {myStudents.length > 0 && (
        <MagicCard className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            👥 My Students ({myStudents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myStudents.slice(0, 9).map(student => (
              <div key={student.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800">
                  {student.first_name} {student.last_name}
                </div>
                <div className="text-sm text-gray-600">{student.email}</div>
                <div className="text-xs text-gray-500">
                  {student.programs?.name || 'No program assigned'}
                </div>
              </div>
            ))}
          </div>
          {myStudents.length > 9 && (
            <div className="mt-3 text-center text-sm text-gray-500">
              ... and {myStudents.length - 9} more students
            </div>
          )}
        </MagicCard>
      )}

      {/* No Students Message */}
      {myStudents.length === 0 && (
        <MagicCard className="p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">👤</div>
            <h3 className="text-xl font-semibold text-gray-600">No Students Assigned</h3>
            <p className="text-gray-500">
              You don't have any students assigned to you yet. Contact your administrator to get students assigned to your counseling role.
            </p>
          </div>
        </MagicCard>
      )}

      {/* Modals */}
      <AnimatePresence>
        <NotificationModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          notificationForm={notificationForm}
          setNotificationForm={setNotificationForm}
          onSubmit={handleSendNotification}
          sending={sending}
          myStudents={myStudents}
        />
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter; 