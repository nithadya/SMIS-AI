import React from 'react';
import './StudentDetails.css';

const StudentDetails = ({ student }) => {
  const { personalInfo, academicInfo, documents } = student;

  return (
    <div className="student-details">
      <div className="details-grid">
        <div className="details-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{personalInfo.name}</p>
            </div>
            <div className="info-item">
              <label>NIC Number</label>
              <p>{personalInfo.nicNo}</p>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <p>{personalInfo.dateOfBirth}</p>
            </div>
            <div className="info-item">
              <label>Gender</label>
              <p>{personalInfo.gender}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{personalInfo.email}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{personalInfo.phone}</p>
            </div>
            <div className="info-item full-width">
              <label>Address</label>
              <p>{personalInfo.address}</p>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Academic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Batch</label>
              <p>{academicInfo.batch}</p>
            </div>
            <div className="info-item">
              <label>Stream</label>
              <p>{academicInfo.stream}</p>
            </div>
            <div className="info-item">
              <label>Enrollment Date</label>
              <p>{academicInfo.enrollmentDate}</p>
            </div>
            <div className="info-item">
              <label>Current Semester</label>
              <p>{academicInfo.currentSemester}</p>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Documents</h3>
          <div className="documents-grid">
            <div className="document-item">
              <div className="document-icon">📄</div>
              <div className="document-info">
                <h4>NIC Copy</h4>
                <button className="view-button">View Document</button>
              </div>
            </div>
            <div className="document-item">
              <div className="document-icon">📜</div>
              <div className="document-info">
                <h4>Birth Certificate</h4>
                <button className="view-button">View Document</button>
              </div>
            </div>
            <div className="document-item">
              <div className="document-icon">📝</div>
              <div className="document-info">
                <h4>Registration Form</h4>
                <button className="view-button">View Document</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails; 