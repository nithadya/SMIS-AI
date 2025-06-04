import React, { useState } from 'react';
import './Registration.css';

const Registration = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { number: 1, title: 'Personal Information' },
    { number: 2, title: 'Program Selection' },
    { number: 3, title: 'Document Upload' },
    { number: 4, title: 'Payment' },
    { number: 5, title: 'Confirmation' }
  ];

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step) => (
        <div 
          key={step.number} 
          className={`step ${activeStep >= step.number ? 'active' : ''}`}
        >
          <div className="step-number">
            {activeStep > step.number ? '✓' : step.number}
          </div>
          <div className="step-title">{step.title}</div>
          {step.number < steps.length && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="form-section">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input 
            type="text" 
            id="firstName" 
            placeholder="Enter first name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input 
            type="text" 
            id="lastName" 
            placeholder="Enter last name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Enter email address"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            placeholder="Enter phone number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth</label>
          <input 
            type="date" 
            id="dob"
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <textarea 
            id="address" 
            placeholder="Enter your address"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="registration-page">
      <div className="page-header">
        <div className="header-content">
          <h1>New Registration</h1>
          <p>Process new student registration</p>
        </div>
      </div>

      {renderStepIndicator()}

      <div className="registration-form">
        {renderPersonalInfo()}

        <div className="form-actions">
          <button 
            className="button button-secondary"
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
          >
            Previous
          </button>
          <button 
            className="button button-primary"
            onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
          >
            {activeStep === 5 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registration; 