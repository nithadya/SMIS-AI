import React, { useState } from 'react';
import './StudentDiscount.css';

const StudentDiscount = () => {
  // Mock data for demonstration
  const discountData = {
    discountPrograms: [
      {
        id: 1,
        name: 'Early Bird Registration',
        description: 'Special discount for early registrations before semester start',
        discountAmount: '15%',
        eligibilityCriteria: [
          'Register at least 2 months before semester start',
          'Full payment of registration fee',
          'Complete application submission'
        ],
        validUntil: '2024-05-01'
      },
      {
        id: 2,
        name: 'Academic Excellence',
        description: 'Discount for students with outstanding academic records',
        discountAmount: '25%',
        eligibilityCriteria: [
          'GPA of 3.5 or higher',
          'Letter of recommendation',
          'Academic transcript submission'
        ],
        validUntil: '2024-12-31'
      },
      {
        id: 3,
        name: 'Family Discount',
        description: 'Special rates for siblings enrolling together',
        discountAmount: '20%',
        eligibilityCriteria: [
          'Two or more siblings enrolling simultaneously',
          'Proof of relationship',
          'Both registrations must be active'
        ],
        validUntil: '2024-12-31'
      }
    ],
    applications: [
      {
        id: 'APP001',
        studentName: 'Alice Cooper',
        program: 'Bachelor of Information Technology',
        discountType: 'Academic Excellence',
        status: 'Under Review',
        submittedDate: '2024-03-08',
        documents: ['Transcript', 'Recommendation Letter']
      },
      {
        id: 'APP002',
        studentName: 'Bob Wilson',
        program: 'Bachelor of Business Management',
        discountType: 'Early Bird Registration',
        status: 'Approved',
        submittedDate: '2024-03-05',
        documents: ['Registration Receipt']
      }
    ]
  };

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const renderDiscountPrograms = () => (
    <div className="discount-programs">
      <h3>Available Discount Programs</h3>
      <div className="program-cards">
        {discountData.discountPrograms.map(program => (
          <div key={program.id} className="program-card">
            <div className="program-header">
              <h4>{program.name}</h4>
              <span className="discount-amount">{program.discountAmount}</span>
            </div>
            <p className="program-description">{program.description}</p>
            <div className="eligibility-criteria">
              <h5>Eligibility Criteria</h5>
              <ul>
                {program.eligibilityCriteria.map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>
            <div className="program-footer">
              <span className="validity">Valid until: {program.validUntil}</span>
              <button 
                className="button button-primary"
                onClick={() => {
                  setSelectedProgram(program);
                  setShowApplicationForm(true);
                }}
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApplicationStatus = () => (
    <div className="application-status">
      <h3>Application Status</h3>
      <div className="status-cards">
        {discountData.applications.map(application => (
          <div key={application.id} className="status-card">
            <div className="status-header">
              <div className="student-info">
                <h4>{application.studentName}</h4>
                <span className="program-name">{application.program}</span>
              </div>
              <span className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                {application.status}
              </span>
            </div>
            <div className="application-details">
              <div className="detail-row">
                <span className="label">Discount Type:</span>
                <span className="value">{application.discountType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Submitted:</span>
                <span className="value">{application.submittedDate}</span>
              </div>
              <div className="detail-row">
                <span className="label">Documents:</span>
                <span className="value">{application.documents.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApplicationForm = () => (
    <div className="modal">
      <div className="modal-content">
        <h3>Discount Application Form</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Student Name</label>
            <input type="text" placeholder="Enter student name" />
          </div>
          <div className="form-group">
            <label>Program</label>
            <select>
              <option value="">Select program</option>
              <option value="bit">Bachelor of Information Technology</option>
              <option value="bbm">Bachelor of Business Management</option>
            </select>
          </div>
          <div className="form-group">
            <label>Discount Program</label>
            <input 
              type="text" 
              value={selectedProgram?.name || ''} 
              disabled 
            />
          </div>
          <div className="form-group">
            <label>Supporting Documents</label>
            <div className="file-upload">
              <input type="file" multiple />
              <p className="upload-hint">Upload required documents</p>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button 
            className="button button-secondary"
            onClick={() => setShowApplicationForm(false)}
          >
            Cancel
          </button>
          <button className="button button-primary">
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="student-discount-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Student Discounts</h1>
          <p>Explore available discount programs and track applications</p>
        </div>
      </div>

      <div className="discount-grid">
        {renderDiscountPrograms()}
        {renderApplicationStatus()}
      </div>

      {showApplicationForm && renderApplicationForm()}
    </div>
  );
};

export default StudentDiscount; 