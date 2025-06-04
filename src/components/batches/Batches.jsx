import React, { useState } from 'react';
import './Batches.css';

const Batches = () => {
  // Mock data for demonstration
  const batchData = [
    {
      id: 'BIT2024-1',
      program: 'Bachelor of Information Technology',
      startDate: '2024-05-01',
      endDate: '2024-08-30',
      schedule: 'Monday, Wednesday, Friday',
      timeSlot: '9:00 AM - 12:00 PM',
      capacity: 40,
      enrolled: 35,
      status: 'Upcoming',
      lecturer: 'Dr. Sarah Wilson'
    },
    {
      id: 'BBM2024-1',
      program: 'Bachelor of Business Management',
      startDate: '2024-06-15',
      endDate: '2024-10-15',
      schedule: 'Tuesday, Thursday',
      timeSlot: '2:00 PM - 5:00 PM',
      capacity: 35,
      enrolled: 20,
      status: 'Open',
      lecturer: 'Prof. Michael Brown'
    },
    {
      id: 'BIT2024-2',
      program: 'Bachelor of Information Technology',
      startDate: '2024-09-01',
      endDate: '2024-12-20',
      schedule: 'Monday, Wednesday, Friday',
      timeSlot: '1:00 PM - 4:00 PM',
      capacity: 40,
      enrolled: 15,
      status: 'Open',
      lecturer: 'Dr. James Anderson'
    }
  ];

  const [activeView, setActiveView] = useState('calendar');
  const [selectedBatch, setSelectedBatch] = useState(null);

  const getCapacityColor = (enrolled, capacity) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#eab308';
    return '#22c55e';
  };

  const renderCapacityIndicator = (batch) => {
    const percentage = (batch.enrolled / batch.capacity) * 100;
    return (
      <div className="capacity-indicator">
        <div className="capacity-bar">
          <div 
            className="capacity-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getCapacityColor(batch.enrolled, batch.capacity)
            }}
          />
        </div>
        <span className="capacity-text">
          {batch.enrolled}/{batch.capacity} Enrolled
        </span>
      </div>
    );
  };

  const renderCalendarView = () => (
    <div className="calendar-view">
      {batchData.map(batch => (
        <div 
          key={batch.id}
          className="batch-card"
          onClick={() => setSelectedBatch(batch)}
        >
          <div className="batch-header">
            <h3>{batch.program}</h3>
            <span className={`status-badge ${batch.status.toLowerCase()}`}>
              {batch.status}
            </span>
          </div>
          
          <div className="batch-details">
            <div className="detail-item">
              <span className="label">Batch ID:</span>
              <span className="value">{batch.id}</span>
            </div>
            <div className="detail-item">
              <span className="label">Schedule:</span>
              <span className="value">{batch.schedule}</span>
            </div>
            <div className="detail-item">
              <span className="label">Time:</span>
              <span className="value">{batch.timeSlot}</span>
            </div>
            <div className="detail-item">
              <span className="label">Lecturer:</span>
              <span className="value">{batch.lecturer}</span>
            </div>
          </div>

          {renderCapacityIndicator(batch)}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="list-view">
      <table className="batch-table">
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Program</th>
            <th>Schedule</th>
            <th>Time Slot</th>
            <th>Lecturer</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {batchData.map(batch => (
            <tr 
              key={batch.id}
              onClick={() => setSelectedBatch(batch)}
              className="batch-row"
            >
              <td>{batch.id}</td>
              <td>{batch.program}</td>
              <td>{batch.schedule}</td>
              <td>{batch.timeSlot}</td>
              <td>{batch.lecturer}</td>
              <td>{renderCapacityIndicator(batch)}</td>
              <td>
                <span className={`status-badge ${batch.status.toLowerCase()}`}>
                  {batch.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="batches-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Batch Schedule</h1>
          <p>View and manage upcoming batch schedules and enrollment status</p>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-button ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveView('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`toggle-button ${activeView === 'list' ? 'active' : ''}`}
            onClick={() => setActiveView('list')}
          >
            List View
          </button>
        </div>
      </div>

      <div className="batches-container">
        {activeView === 'calendar' ? renderCalendarView() : renderListView()}
      </div>
    </div>
  );
};

export default Batches; 