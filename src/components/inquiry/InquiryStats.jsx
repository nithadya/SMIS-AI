import React from 'react';
import './InquiryStats.css';

const InquiryStats = () => {
  // Mock data for demonstration
  const stats = {
    total: {
      count: 156,
      trend: '+12%'
    },
    new: {
      count: 45,
      trend: '+8%'
    },
    followUp: {
      count: 78,
      trend: '+15%'
    },
    converted: {
      count: 23,
      trend: '+5%'
    }
  };

  const conversionRates = {
    overall: 68,
    web: 72,
    phone: 65,
    email: 58,
    walkIn: 85
  };

  return (
    <div className="inquiry-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Inquiries</h3>
            <span className="trend positive">{stats.total.trend}</span>
          </div>
          <p className="stat-number">{stats.total.count}</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>New Inquiries</h3>
            <span className="trend positive">{stats.new.trend}</span>
          </div>
          <p className="stat-number">{stats.new.count}</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Follow-ups Required</h3>
            <span className="trend positive">{stats.followUp.trend}</span>
          </div>
          <p className="stat-number">{stats.followUp.count}</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Converted</h3>
            <span className="trend positive">{stats.converted.trend}</span>
          </div>
          <p className="stat-number">{stats.converted.count}</p>
        </div>
      </div>

      <div className="conversion-stats">
        <h3>Conversion Rates by Source</h3>
        <div className="conversion-grid">
          <div className="conversion-item">
            <div className="conversion-label">
              <span>Overall</span>
              <span className="conversion-rate">{conversionRates.overall}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${conversionRates.overall}%` }}
              />
            </div>
          </div>

          <div className="conversion-item">
            <div className="conversion-label">
              <span>Web Form</span>
              <span className="conversion-rate">{conversionRates.web}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${conversionRates.web}%` }}
              />
            </div>
          </div>

          <div className="conversion-item">
            <div className="conversion-label">
              <span>Phone</span>
              <span className="conversion-rate">{conversionRates.phone}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${conversionRates.phone}%` }}
              />
            </div>
          </div>

          <div className="conversion-item">
            <div className="conversion-label">
              <span>Email</span>
              <span className="conversion-rate">{conversionRates.email}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${conversionRates.email}%` }}
              />
            </div>
          </div>

          <div className="conversion-item">
            <div className="conversion-label">
              <span>Walk-in</span>
              <span className="conversion-rate">{conversionRates.walkIn}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${conversionRates.walkIn}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryStats; 