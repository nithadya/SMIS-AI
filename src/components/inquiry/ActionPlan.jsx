import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getInquiryActionPlan, 
  updateInquiryWithActionPlan 
} from '../../lib/api/inquiries';
import { createEnrollmentFromInquiry } from '../../lib/api/enrollments';
import { showToast } from '../common/Toast';

const ActionPlan = ({ inquiry, onUpdate }) => {
  const [actionPlan, setActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (inquiry?.id) {
      fetchActionPlan();
    }
  }, [inquiry?.id]);

  const fetchActionPlan = async () => {
    if (!inquiry?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await getInquiryActionPlan(inquiry.id);
      if (error) {
        showToast.error(error);
        return;
      }
      setActionPlan(data);
    } catch (error) {
      console.error('Error fetching action plan:', error);
      showToast.error('Failed to load action plan');
    } finally {
      setLoading(false);
    }
  };

  const updateActionPlan = async (updatedPlan) => {
    setUpdating(true);
    try {
      const { data, error } = await updateInquiryWithActionPlan(
        inquiry.id, 
        { status: inquiry.status }, // Let the API determine the correct status
        updatedPlan
      );
      
      if (error) {
        showToast.error(error);
        return;
      }

      setActionPlan(updatedPlan);
      if (onUpdate) {
        onUpdate(data);
      }
      showToast.success('Action plan updated successfully');
    } catch (error) {
      console.error('Error updating action plan:', error);
      showToast.error('Failed to update action plan');
    } finally {
      setUpdating(false);
    }
  };

  const toggleTask = async (taskId) => {
    if (!actionPlan) return;

    const updatedTasks = actionPlan.tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'completed' ? 'pending' : 'completed',
          completedAt: task.status === 'pending' ? new Date().toISOString() : null
        };
      }
      return task;
    });

    const updatedPlan = {
      ...actionPlan,
      tasks: updatedTasks
    };

    await updateActionPlan(updatedPlan);
  };

  const addTask = async () => {
    if (!newTask.trim() || !actionPlan) return;

    const newTaskObj = {
      id: Date.now(),
      text: newTask.trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      category: 'custom',
      createdAt: new Date().toISOString()
    };

    const updatedPlan = {
      ...actionPlan,
      tasks: [...actionPlan.tasks, newTaskObj]
    };

    await updateActionPlan(updatedPlan);
    setNewTask('');
    setShowAddTask(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !actionPlan) return;

    const noteObj = {
      id: Date.now(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      author: 'Current User' // You can get this from auth context
    };

    const updatedPlan = {
      ...actionPlan,
      notes: [...(actionPlan.notes || []), noteObj]
    };

    await updateActionPlan(updatedPlan);
    setNewNote('');
  };

  const handleCreateEnrollment = async () => {
    if (!inquiry) return;

    try {
      setUpdating(true);
      const { data, error } = await createEnrollmentFromInquiry(inquiry.id);

      if (error) {
        showToast.error(error);
        return;
      }

      // Mark enrollment as created in action plan
      const updatedPlan = {
        ...actionPlan,
        enrollmentCreated: true,
        enrollmentId: data.id
      };

      await updateActionPlan(updatedPlan);
      showToast.success('Enrollment created successfully!');
    } catch (error) {
      console.error('Error creating enrollment:', error);
      showToast.error('Failed to create enrollment');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'contact': return '📞';
      case 'information': return '📧';
      case 'consultation': return '🏫';
      case 'follow-up': return '🔄';
      case 'enrollment': return '📝';
      case 'custom': return '⭐';
      default: return '📋';
    }
  };

  const getCompletionPercentage = () => {
    if (!actionPlan?.tasks?.length) return 0;
    const completed = actionPlan.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / actionPlan.tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!actionPlan) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-slate-500 text-center">No action plan available</p>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();
  const canCreateEnrollment = completionPercentage === 100 && !actionPlan.enrollmentCreated;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Action Plan</h3>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-slate-600">
            Progress: {completionPercentage}%
          </div>
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3 mb-6">
        <AnimatePresence>
          {actionPlan.tasks?.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                task.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                disabled={updating}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                {task.status === 'completed' && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(task.category)}</span>
                  <p className={`text-sm ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                    {task.text}
                  </p>
                </div>
                {task.date && (
                  <p className="text-xs text-slate-500 mt-1">Due: {task.date}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Task */}
      <div className="mb-6">
        {showAddTask ? (
          <div className="space-y-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new task..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <div className="flex space-x-2">
              <button
                onClick={addTask}
                disabled={!newTask.trim() || updating}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTask('');
                }}
                className="px-3 py-1 bg-slate-600 text-white rounded-md text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Custom Task
          </button>
        )}
      </div>

      {/* Enrollment Action */}
      {canCreateEnrollment && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-800">Ready for Enrollment</h4>
              <p className="text-xs text-green-600">All action plan tasks completed</p>
            </div>
            <button
              onClick={handleCreateEnrollment}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Creating...' : 'Create Enrollment'}
            </button>
          </div>
        </div>
      )}

      {/* Notes Section */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-3">Notes</h4>
        <div className="space-y-2 mb-3">
          {actionPlan.notes?.map((note) => (
            <div key={note.id} className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-700">{note.text}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(note.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={2}
          />
          <button
            onClick={addNote}
            disabled={!newNote.trim() || updating}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPlan; 