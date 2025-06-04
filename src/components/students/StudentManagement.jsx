import React, { useState } from 'react';
import './StudentManagement.css';
import StudentSearch from './StudentSearch';
import StudentDetails from './StudentDetails';
import StudentPayments from './StudentPayments';

const StudentManagement = () => {
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  // Mock student data - replace with actual API call
  const mockStudentData = {
    personalInfo: {
      name: "John Smith",
      nicNo: "991234567V",
      campusId: "ICB2023001",
      dateOfBirth: "1999-05-15",
      gender: "Male",
      email: "john.smith@email.com",
      phone: "+94 77 123 4567",
      address: "123 Main St, Colombo"
    },
    academicInfo: {
      batch: "Batch 2023",
      stream: "Information Technology",
      enrollmentDate: "2023-09-01",
      registrationStatus: "Active",
      currentSemester: "2nd Semester"
    },
    documents: {
      nicCopy: "nic_copy.pdf",
      birthCertificate: "birth_cert.pdf",
      registrationForm: "reg_form.pdf",
      profilePhoto: "profile.jpg"
    },
    payments: {
      totalFees: 850000,
      paidAmount: 425000,
      dueAmount: 425000,
      nextPaymentDate: "2024-03-15",
      paymentHistory: [
        {
          id: "P001",
          date: "2023-09-01",
          amount: 250000,
          type: "Registration Fee",
          status: "Paid"
        },
        {
          id: "P002",
          date: "2023-12-15",
          amount: 175000,
          type: "Semester Fee",
          status: "Paid"
        },
        {
          id: "P003",
          date: "2024-03-15",
          amount: 175000,
          type: "Semester Fee",
          status: "Pending"
        }
      ]
    }
  };

  const handleSearch = (searchValue, searchType) => {
    // Mock search functionality - replace with actual API call
    console.log(`Searching for ${searchValue} by ${searchType}`);
    setActiveStudent(mockStudentData);
  };

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>Student Management</h1>
        <p>Access and manage student information</p>
      </div>

      <StudentSearch onSearch={handleSearch} />

      {activeStudent && (
        <div className="student-info-container">
          <div className="student-header">
            <div className="student-basic-info">
              <img 
                src={`data:image/jpeg;base64,${activeStudent.documents.profilePhoto}`} 
                alt="Student" 
                className="student-photo"
              />
              <div>
                <h2>{activeStudent.personalInfo.name}</h2>
                <p>Campus ID: {activeStudent.personalInfo.campusId}</p>
                <p>NIC: {activeStudent.personalInfo.nicNo}</p>
              </div>
            </div>
            <div className="student-status">
              <span className="status-badge active">
                {activeStudent.academicInfo.registrationStatus}
              </span>
            </div>
          </div>

          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Student Details
            </button>
            <button 
              className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payment History
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' ? (
              <StudentDetails student={activeStudent} />
            ) : (
              <StudentPayments payments={activeStudent.payments} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 