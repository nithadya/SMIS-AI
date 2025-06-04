import React, { useState } from 'react';
import './Enrollments.css';

const Enrollments = () => {
  // Mock data for demonstration
  const enrollmentData = [
    {
      id: 'ENR001',
      studentName: 'John Smith',
      program: 'Bachelor of Information Technology',
      batch: 'BIT2024-1',
      status: 'Document Verification',
      lastUpdated: '2024-03-10',
      source: 'Website Inquiry',
      counselor: 'Sarah Wilson',
      steps: [
        { name: 'Initial Inquiry', completed: true, date: '2024-03-01' },
        { name: 'Counseling Session', completed: true, date: '2024-03-05' },
        { name: 'Document Submission', completed: true, date: '2024-03-08' },
        { name: 'Document Verification', completed: false },
        { name: 'Payment Processing', completed: false },
        { name: 'Enrollment Confirmation', completed: false }
      ],
      notes: [
        {
          id: 1,
          date: '2024-03-01',
          author: 'Sarah Wilson',
          content: 'Initial inquiry received through website. Student interested in evening batch.'
        },
        {
          id: 2,
          date: '2024-03-05',
          author: 'Sarah Wilson',
          content: 'Counseling session completed. Student has confirmed interest in BIT program.'
        }
      ]
    },
    {
      id: 'ENR002',
      studentName: 'Emma Davis',
      program: 'Bachelor of Business Management',
      batch: 'BBM2024-1',
      status: 'Payment Processing',
      lastUpdated: '2024-03-09',
      source: 'Walk-in',
      counselor: 'Michael Brown',
      steps: [
        { name: 'Initial Inquiry', completed: true, date: '2024-02-25' },
        { name: 'Counseling Session', completed: true, date: '2024-02-28' },
        { name: 'Document Submission', completed: true, date: '2024-03-05' },
        { name: 'Document Verification', completed: true, date: '2024-03-07' },
        { name: 'Payment Processing', completed: false },
        { name: 'Enrollment Confirmation', completed: false }
      ],
      notes: [
        {
          id: 1,
          date: '2024-02-25',
          author: 'Michael Brown',
          content: 'Walk-in inquiry. Student showed high interest in business program.'
        }
      ]
    }
  ];

  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [newNote, setNewNote] = useState('');

  const renderProgressSteps = (steps) => (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div 
          key={step.name} 
          className={`progress-step ${step.completed ? 'completed' : ''}`}
        >
          <div className="step-indicator">
            {step.completed ? '✓' : index + 1}
          </div>
          <div className="step-content">
            <span className="step-name">{step.name}</span>
            {step.date && (
              <span className="step-date">{step.date}</span>
            )}
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );

  const renderEnrollmentList = () => (
    <div className="enrollment-list">
      {enrollmentData.map(enrollment => (
        <div 
          key={enrollment.id}
          className="enrollment-card"
          onClick={() => setActiveEnrollment(enrollment)}
        >
          <div className="enrollment-header">
            <h3>{enrollment.studentName}</h3>
            <span className="enrollment-id">{enrollment.id}</span>
          </div>
          
          <div className="enrollment-info">
            <div className="info-row">
              <span className="label">Program:</span>
              <span className="value">{enrollment.program}</span>
            </div>
            <div className="info-row">
              <span className="label">Batch:</span>
              <span className="value">{enrollment.batch}</span>
            </div>
            <div className="info-row">
              <span className="label">Counselor:</span>
              <span className="value">{enrollment.counselor}</span>
            </div>
            <div className="info-row">
              <span className="label">Last Updated:</span>
              <span className="value">{enrollment.lastUpdated}</span>
            </div>
          </div>

          <div className="enrollment-status">
            <span className="status-label">Current Stage:</span>
            <span className="status-badge">{enrollment.status}</span>
          </div>

          {renderProgressSteps(enrollment.steps)}
        </div>
      ))}
    </div>
  );

  const renderEnrollmentDetails = () => {
    if (!activeEnrollment) return null;

    return (
      <div className="enrollment-details">
        <div className="details-header">
          <div>
            <h2>{activeEnrollment.studentName}</h2>
            <p className="enrollment-meta">
              {activeEnrollment.program} • {activeEnrollment.batch}
            </p>
          </div>
          <button 
            className="button button-secondary"
            onClick={() => setActiveEnrollment(null)}
          >
            Back to List
          </button>
        </div>

        <div className="details-content">
          <div className="details-section">
            <h3>Enrollment Progress</h3>
            {renderProgressSteps(activeEnrollment.steps)}
          </div>

          <div className="details-section">
            <h3>Enrollment Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Enrollment ID</span>
                <span className="value">{activeEnrollment.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Source</span>
                <span className="value">{activeEnrollment.source}</span>
              </div>
              <div className="info-item">
                <span className="label">Counselor</span>
                <span className="value">{activeEnrollment.counselor}</span>
              </div>
              <div className="info-item">
                <span className="label">Last Updated</span>
                <span className="value">{activeEnrollment.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <div className="section-header">
              <h3>Notes & Updates</h3>
              <div className="note-input">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button 
                  className="button button-primary"
                  onClick={() => {
                    if (newNote.trim()) {
                      // Add note logic here
                      setNewNote('');
                    }
                  }}
                >
                  Add Note
                </button>
              </div>
            </div>
            <div className="notes-list">
              {activeEnrollment.notes.map(note => (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <span className="note-author">{note.author}</span>
                    <span className="note-date">{note.date}</span>
                  </div>
                  <p className="note-content">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="enrollments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Enrollment Management</h1>
          <p>Track and manage student enrollment progress</p>
        </div>
      </div>

      <div className="enrollments-container">
        {activeEnrollment ? renderEnrollmentDetails() : renderEnrollmentList()}
      </div>
    </div>
  );
};

export default Enrollments; 