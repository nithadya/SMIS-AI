import React, { useState } from 'react';
import './InquiryForm.css';

const InquiryForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: '',
    source: '',
    counselor: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="inquiry-form">
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Program of Interest *</label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Program</option>
              <option value="it">Information Technology</option>
              <option value="business">Business Management</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Source *</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Source</option>
              <option value="web">Web Form</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Counselor *</label>
            <select
              name="counselor"
              value={formData.counselor}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Counselor</option>
              <option value="sarah">Sarah Wilson</option>
              <option value="john">John Smith</option>
              <option value="mary">Mary Johnson</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Enter any additional notes or comments..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="button button-primary">
            Create Inquiry
          </button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm; 