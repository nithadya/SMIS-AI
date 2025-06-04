import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Welcome to SMIS ICBT</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">5,909</p>
        </div>
        <div className="stat-card">
          <h3>Total Teachers</h3>
          <p className="stat-number">60</p>
        </div>
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-number">100</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Fee Status</h3>
          <div className="fee-stats">
            <div className="fee-item">
              <span>Paid Fees</span>
              <strong>1,335</strong>
            </div>
            <div className="fee-item">
              <span>Pending Fees</span>
              <strong>4,366</strong>
            </div>
            <div className="fee-item">
              <span>Overdue Fees</span>
              <strong>208</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Notice Board</h3>
          <div className="notice-list">
            <div className="notice-item">
              <h4>Parent-Teacher Meeting</h4>
              <p>Scheduled for next Friday at 3 PM</p>
            </div>
            <div className="notice-item">
              <h4>Annual Sports Day</h4>
              <p>Preparations start next week</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Recent Messages</h3>
          <div className="message-list">
            <div className="message-item">
              <div className="message-header">
                <h4>Sarah Johnson</h4>
                <span>2 hours ago</span>
              </div>
              <p>Regarding the upcoming science fair...</p>
            </div>
            <div className="message-item">
              <div className="message-header">
                <h4>Mike Peterson</h4>
                <span>5 hours ago</span>
              </div>
              <p>About the new curriculum changes...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 