import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  getCampusEvents,
  createCampusEvent,
  updateCampusEvent,
  deleteCampusEvent,
  publishCampusEvent,
  sendEventNotification,
  getCounselors,
  getPrograms
} from '../../lib/api/schedules';
import { showToast } from '../common/Toast';

// EventModal component extracted outside to prevent re-creation on each render
const EventModal = ({ 
  showEventModal, 
  setShowEventModal, 
  selectedEvent, 
  setSelectedEvent, 
  eventForm, 
  setEventForm, 
  handleCreateEvent, 
  handleUpdateEvent, 
  loading 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowEventModal(false);
        setSelectedEvent(null);
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
        <h3 className="text-xl font-semibold text-slate-800">
          {selectedEvent ? 'Edit Event' : 'Create New Event'}
        </h3>
        <button
          onClick={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          className="text-slate-500 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Type *
            </label>
            <select
              value={eventForm.event_type}
              onChange={(e) => setEventForm(prev => ({ ...prev, event_type: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="general">General</option>
              <option value="open_week">Open Week</option>
              <option value="orientation">Orientation</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <select
              value={eventForm.priority}
              onChange={(e) => setEventForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              value={eventForm.start_date}
              onChange={(e) => setEventForm(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={eventForm.end_date}
              onChange={(e) => setEventForm(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={eventForm.start_time}
              onChange={(e) => setEventForm(prev => ({ ...prev, start_time: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={eventForm.end_time}
              onChange={(e) => setEventForm(prev => ({ ...prev, end_time: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Capacity
            </label>
            <input
              type="number"
              value={eventForm.capacity}
              onChange={(e) => setEventForm(prev => ({ ...prev, capacity: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Maximum attendees"
              min="1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Event description..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowEventModal(false);
              setSelectedEvent(null);
            }}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : (selectedEvent ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </motion.div>
  </motion.div>
);

const Schedules = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('calendar');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [programs, setPrograms] = useState([]);

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'general',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
    target_audience: ['all'],
    program_ids: [],
    priority: 'normal'
  });

  const [notificationForm, setNotificationForm] = useState({
    target_type: 'all_students',
    target_criteria: {}
  });

  const [filters, setFilters] = useState({
    status: 'all',
    event_type: 'all',
    date_from: '',
    date_to: ''
  });

  // Load initial data
  useEffect(() => {
    loadEvents();
    loadCounselors();
    loadPrograms();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await getCampusEvents(filters);
      if (error) {
        showToastMessage(error, 'error');
        return;
      }
      setEvents(data || []);
    } catch (error) {
      showToastMessage('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCounselors = async () => {
    try {
      const { data, error } = await getCounselors();
      if (!error) {
        setCounselors(data || []);
      }
    } catch (error) {
      console.error('Failed to load counselors:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const { data, error } = await getPrograms();
      if (!error) {
        setPrograms(data || []);
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    if (filters.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    if (filters.event_type !== 'all') {
      filtered = filtered.filter(event => event.event_type === filters.event_type);
    }

    if (filters.date_from) {
      filtered = filtered.filter(event => new Date(event.start_date) >= new Date(filters.date_from));
    }

    if (filters.date_to) {
      filtered = filtered.filter(event => new Date(event.start_date) <= new Date(filters.date_to));
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await createCampusEvent(eventForm);
      if (error) {
        showToastMessage(error, 'error');
        return;
      }

      showToastMessage('Event created successfully', 'success');
      setShowEventModal(false);
      resetEventForm();
      loadEvents();
    } catch (error) {
      showToastMessage('Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const { data, error } = await updateCampusEvent(selectedEvent.id, eventForm);
      if (error) {
        showToastMessage(error, 'error');
        return;
      }

      showToastMessage('Event updated successfully', 'success');
      setShowEventModal(false);
      setSelectedEvent(null);
      resetEventForm();
      loadEvents();
    } catch (error) {
      showToastMessage('Failed to update event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      const { error } = await deleteCampusEvent(eventId);
      if (error) {
        showToastMessage(error, 'error');
        return;
      }

      showToastMessage('Event deleted successfully', 'success');
      loadEvents();
    } catch (error) {
      showToastMessage('Failed to delete event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEvent = async (eventId) => {
    setLoading(true);
    try {
      const { data, error } = await publishCampusEvent(eventId);
      if (error) {
        showToastMessage(error, 'error');
        return;
      }

      showToastMessage('Event published successfully', 'success');
      loadEvents();
    } catch (error) {
      showToastMessage('Failed to publish event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    try {
      const { data, error } = await sendEventNotification(selectedEvent.id, notificationForm);
      if (error) {
        showToastMessage(error, 'error');
        return;
      }

      showToastMessage(`Notification sent to ${data.total_recipients} students`, 'success');
      setShowNotificationModal(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      showToastMessage('Failed to send notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEventModal = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setEventForm({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'general',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        location: event.location || '',
        capacity: event.capacity || '',
        target_audience: event.target_audience || ['all'],
        program_ids: event.program_ids || [],
        priority: event.priority || 'normal'
      });
    } else {
      setSelectedEvent(null);
      resetEventForm();
    }
    setShowEventModal(true);
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: 'general',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      location: '',
      capacity: '',
      target_audience: ['all'],
      program_ids: [],
      priority: 'normal'
    });
  };

  const openNotificationModal = (event) => {
    setSelectedEvent(event);
    setNotificationForm({
      target_type: 'counselor_students',
      target_criteria: {}
    });
    setShowNotificationModal(true);
  };

  const showToastMessage = (message, type = 'info') => {
    if (type === 'success') {
      showToast.success(message);
    } else if (type === 'error') {
      showToast.error(message);
    } else {
      showToast.info(message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'draft':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'open_week':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'orientation':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'workshop':
        return 'bg-teal-50 text-teal-600 border-teal-200';
      case 'seminar':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'exam':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'holiday':
        return 'bg-green-50 text-green-600 border-green-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canManageEvents = user?.role === 'manager';
  const canSendNotifications = user?.role === 'counselor' || user?.role === 'manager';

  const EventCard = ({ event }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(event.event_type)}`}>
            {event.event_type.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
            {event.status.toUpperCase()}
          </span>
        </div>
        
        <div className="flex gap-2">
          {canSendNotifications && event.is_published && (
            <button
              onClick={() => openNotificationModal(event)}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Notify
            </button>
          )}
          {canManageEvents && (
            <>
              <button
                onClick={() => openEventModal(event)}
                className="px-3 py-1 text-xs bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Edit
              </button>
              {!event.is_published && (
                <button
                  onClick={() => handlePublishEvent(event.id)}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      <h4 className="text-lg font-medium text-slate-800 mb-4">{event.title}</h4>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-slate-500 text-sm min-w-[4rem]">Date:</span>
          <span className="text-sm text-slate-700">
            {formatDate(event.start_date)}
            {event.end_date && event.end_date !== event.start_date && (
              ` - ${formatDate(event.end_date)}`
            )}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-slate-500 text-sm min-w-[4rem]">Time:</span>
          <span className="text-sm text-slate-700">
            {formatTime(event.start_time)}
            {event.end_time && ` - ${formatTime(event.end_time)}`}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-slate-500 text-sm min-w-[4rem]">Location:</span>
          <span className="text-sm text-slate-700">{event.location || 'TBD'}</span>
        </div>
        {event.description && (
          <div className="flex items-start gap-2">
            <span className="text-slate-500 text-sm min-w-[4rem]">Details:</span>
            <span className="text-sm text-slate-700">{event.description}</span>
          </div>
        )}
      </div>

      {event.capacity && (
        <div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((event.registered_count || 0) / event.capacity * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm text-slate-600">
            {event.registered_count || 0}/{event.capacity} Registered
          </span>
        </div>
      )}

      {/* Show notification stats if any */}
      {event.event_notifications && event.event_notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Notifications sent: {event.event_notifications.reduce((total, n) => total + (n.sent_count || 0), 0)} students
          </div>
        </div>
      )}
    </motion.div>
  );



  const NotificationModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowNotificationModal(false);
          setSelectedEvent(null);
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-lg"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-800">
            Send Event Notification
          </h3>
          <button
            onClick={() => {
              setShowNotificationModal(false);
              setSelectedEvent(null);
            }}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {selectedEvent && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-800">{selectedEvent.title}</h4>
            <p className="text-sm text-slate-600">
              {formatDate(selectedEvent.start_date)} • {formatTime(selectedEvent.start_time)}
            </p>
          </div>
        )}

        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Send To
            </label>
            <select
              value={notificationForm.target_type}
              onChange={(e) => setNotificationForm({ ...notificationForm, target_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="counselor_students">My Assigned Students</option>
              <option value="all_students">All Active Students</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will send an email notification to students about the event. 
              The notification will include event details, date, time, and location.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowNotificationModal(false);
                setSelectedEvent(null);
              }}
              className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Events & Schedules</h1>
          <p className="text-slate-600">Manage campus events and notify students</p>
        </div>
        
        {canManageEvents && (
          <button
            onClick={() => openEventModal()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
            <select
              value={filters.event_type}
              onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="open_week">Open Week</option>
              <option value="orientation">Orientation</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-4">No events found</div>
            {canManageEvents && (
              <button
                onClick={() => openEventModal()}
                className="text-blue-500 hover:text-blue-600"
              >
                Create your first event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEventModal && (
          <EventModal 
            showEventModal={showEventModal}
            setShowEventModal={setShowEventModal}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            eventForm={eventForm}
            setEventForm={setEventForm}
            handleCreateEvent={handleCreateEvent}
            handleUpdateEvent={handleUpdateEvent}
            loading={loading}
          />
        )}
        {showNotificationModal && <NotificationModal />}
      </AnimatePresence>
    </div>
  );
};

export default Schedules; 