import React, { useState } from 'react';
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
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Student Management</h1>
        <p className="text-lg text-slate-500">Access and manage student information</p>
      </div>

      <StudentSearch onSearch={handleSearch} />

      {activeStudent && (
        <div className="bg-white rounded-xl shadow-sm mt-8 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex gap-6 items-start">
                <div className="relative group">
                  <img 
                    src={`data:image/jpeg;base64,${activeStudent.documents.profilePhoto}`} 
                    alt={activeStudent.personalInfo.name}
                    className="w-20 h-20 rounded-xl object-cover ring-2 ring-slate-200 
                      group-hover:ring-blue-500 transition-all duration-200"
                  />
                  <button 
                    className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-lg shadow-sm 
                      border border-slate-200 text-slate-500 hover:text-blue-600 
                      transition-colors duration-200"
                    aria-label="Update profile photo"
                  >
                    📷
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    {activeStudent.personalInfo.name}
                  </h2>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">
                      Campus ID: <span className="font-medium">{activeStudent.personalInfo.campusId}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      NIC: <span className="font-medium">{activeStudent.personalInfo.nicNo}</span>
                    </p>
                  </div>
                </div>
              </div>
              <span className={`
                px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2
                ${activeStudent.academicInfo.registrationStatus === 'Active' 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-yellow-50 text-yellow-600'
                }
              `}>
                <span className={`w-2 h-2 rounded-full ${
                  activeStudent.academicInfo.registrationStatus === 'Active'
                    ? 'bg-green-600 animate-pulse'
                    : 'bg-yellow-600'
                }`} />
                {activeStudent.academicInfo.registrationStatus}
              </span>
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex flex-wrap">
              <button 
                className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                  ${activeTab === 'details' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                onClick={() => setActiveTab('details')}
                aria-selected={activeTab === 'details'}
                role="tab"
              >
                Student Details
              </button>
              <button 
                className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                  ${activeTab === 'payments' 
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                onClick={() => setActiveTab('payments')}
                aria-selected={activeTab === 'payments'}
                role="tab"
              >
                Payment History
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
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