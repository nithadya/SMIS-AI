import React, { useState } from 'react';
import './Schedules.css';

const Schedules = () => {
  // Mock data for demonstration
  const scheduleData = {
    upcomingEvents: [
      {
        id: 1,
        type: 'Program Session',
        title: 'BIT Semester Start',
        date: '2024-05-01',
        time: '09:00 AM',
        location: 'Main Campus - Block A',
        capacity: 40,
        registered: 35,
        status: 'Upcoming'
      },
      {
        id: 2,
        type: 'Workshop',
        title: 'Introduction to Programming',
        date: '2024-04-15',
        time: '02:00 PM',
        location: 'Computer Lab 1',
        capacity: 25,
        registered: 20,
        status: 'Open'
      },
      {
        id: 3,
        type: 'Marketing Event',
        title: 'Education Fair 2024',
        date: '2024-04-20',
        time: '10:00 AM',
        location: 'City Convention Center',
        capacity: 100,
        registered: 75,
        status: 'Open'
      }
    ],
    aiRecommendations: {
      batchTimings: [
        {
          program: 'Bachelor of Information Technology',
          recommendations: [
            {
              timeSlot: 'Morning (9 AM - 1 PM)',
              confidence: 85,
              reasoning: 'High historical attendance and student preference data',
              potentialEnrollment: 45
            },
            {
              timeSlot: 'Evening (5 PM - 9 PM)',
              confidence: 75,
              reasoning: 'Growing demand from working professionals',
              potentialEnrollment: 35
            }
          ]
        },
        {
          program: 'Bachelor of Business Management',
          recommendations: [
            {
              timeSlot: 'Afternoon (1 PM - 5 PM)',
              confidence: 80,
              reasoning: 'Optimal timing based on student surveys',
              potentialEnrollment: 40
            }
          ]
        }
      ],
      marketingEvents: [
        {
          type: 'Education Fair',
          recommendedDate: '2024-06-15',
          confidence: 90,
          reasoning: 'Aligns with pre-enrollment period and historical attendance patterns',
          expectedAttendance: 150
        },
        {
          type: 'Open House',
          recommendedDate: '2024-05-20',
          confidence: 85,
          reasoning: 'Strategic timing before major intake period',
          expectedAttendance: 80
        }
      ]
    }
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState('calendar');

  const renderCalendarView = () => (
    <div className="calendar-section">
      <div className="calendar-header">
        <div className="month-navigation">
          <button 
            className="button button-icon"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}
          >
            ←
          </button>
          <h3>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button 
            className="button button-icon"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}
          >
            →
          </button>
        </div>
        <div className="view-filters">
          <select className="filter-select">
            <option value="all">All Events</option>
            <option value="program">Program Sessions</option>
            <option value="workshop">Workshops</option>
            <option value="marketing">Marketing Events</option>
          </select>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-events">
          {scheduleData.upcomingEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <span className={`event-type ${event.type.toLowerCase().replace(' ', '-')}`}>
                  {event.type}
                </span>
                <span className={`event-status ${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </div>
              
              <h4 className="event-title">{event.title}</h4>
              
              <div className="event-details">
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{event.date}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{event.time}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Location:</span>
                  <span className="value">{event.location}</span>
                </div>
              </div>

              <div className="event-capacity">
                <div className="capacity-bar">
                  <div 
                    className="capacity-fill"
                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                  />
                </div>
                <span className="capacity-text">
                  {event.registered}/{event.capacity} Registered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIRecommendations = () => (
    <div className="recommendations-section">
      <div className="recommendations-grid">
        <div className="recommendation-card">
          <h3>Recommended Batch Timings</h3>
          <div className="recommendations-list">
            {scheduleData.aiRecommendations.batchTimings.map((program, index) => (
              <div key={index} className="program-recommendations">
                <h4>{program.program}</h4>
                {program.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="recommendation-item">
                    <div className="recommendation-header">
                      <span className="time-slot">{rec.timeSlot}</span>
                      <span className="confidence-score">
                        {rec.confidence}% Confidence
                      </span>
                    </div>
                    <p className="reasoning">{rec.reasoning}</p>
                    <div className="potential">
                      <span className="label">Potential Enrollment:</span>
                      <span className="value">{rec.potentialEnrollment} students</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="recommendation-card">
          <h3>Recommended Marketing Events</h3>
          <div className="recommendations-list">
            {scheduleData.aiRecommendations.marketingEvents.map((event, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-header">
                  <span className="event-type">{event.type}</span>
                  <span className="confidence-score">
                    {event.confidence}% Confidence
                  </span>
                </div>
                <div className="event-timing">
                  Recommended Date: {event.recommendedDate}
                </div>
                <p className="reasoning">{event.reasoning}</p>
                <div className="potential">
                  <span className="label">Expected Attendance:</span>
                  <span className="value">{event.expectedAttendance} visitors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="schedules-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Schedule Management</h1>
          <p>Manage program sessions, workshops, and marketing events</p>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-button ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveView('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`toggle-button ${activeView === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveView('recommendations')}
          >
            AI Recommendations
          </button>
        </div>
      </div>

      <div className="page-content">
        {activeView === 'calendar' ? renderCalendarView() : renderAIRecommendations()}
      </div>
    </div>
  );
};

export default Schedules; 