import React, { useState } from 'react';

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
    <div className="bg-slate-50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Action Plan</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">
            {tasks.filter(t => t.status === 'completed').length} Completed
          </span>
          <span className="text-amber-600">
            {tasks.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              task.status === 'completed' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-slate-200'
            }`}
          >
            <div className="pt-1">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => toggleTaskStatus(task.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${
                task.status === 'completed' 
                ? 'text-slate-500 line-through' 
                : 'text-slate-700'
              }`}>
                {task.text}
              </p>
              <span className="text-xs text-slate-500">{task.date}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new follow-up task..."
            className="flex-1 px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Next Follow-up</h4>
        <p className="text-sm text-slate-600 mb-4">Scheduled for: {inquiry.nextFollowUp}</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            Reschedule
          </button>
          <button className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPlan; 