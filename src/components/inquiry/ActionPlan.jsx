import React, { useState } from 'react';
import './ActionPlan.css';

const ActionPlan = ({ inquiry }) => {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      text: 'Initial phone call to discuss program details',
      status: 'completed',
      date: '2024-03-10'
    },
    {
      id: 2,
      text: 'Send program brochure and fee structure via email',
      status: 'pending',
      date: '2024-03-12'
    },
    {
      id: 3,
      text: 'Schedule campus visit',
      status: 'pending',
      date: '2024-03-15'
    }
  ]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'completed' ? 'pending' : 'completed'
        };
      }
      return task;
    }));
  };

  return (
    <div className="action-plan">
      <div className="action-plan-header">
        <h3>Action Plan</h3>
        <div className="task-stats">
          <span className="completed">
            {tasks.filter(t => t.status === 'completed').length} Completed
          </span>
          <span className="pending">
            {tasks.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${task.status}`}>
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => toggleTaskStatus(task.id)}
              />
            </div>
            <div className="task-content">
              <p className="task-text">{task.text}</p>
              <span className="task-date">{task.date}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="form-group">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new follow-up task..."
            className="form-input"
          />
          <button type="submit" className="button button-primary">
            Add Task
          </button>
        </div>
      </form>

      <div className="follow-up-reminder">
        <h4>Next Follow-up</h4>
        <p>Scheduled for: {inquiry.nextFollowUp}</p>
        <div className="reminder-actions">
          <button className="button button-secondary">
            Reschedule
          </button>
          <button className="button button-primary">
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPlan; 