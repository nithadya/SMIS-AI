import React, { useState } from 'react';

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'under review':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const renderDiscountPrograms = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">Available Discount Programs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discountData.discountPrograms.map(program => (
          <div key={program.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-medium text-slate-800">{program.name}</h4>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                {program.discountAmount}
              </span>
            </div>
            <p className="text-slate-600 text-sm mb-4">{program.description}</p>
            <div className="mb-4">
              <h5 className="text-sm font-medium text-slate-700 mb-2">Eligibility Criteria</h5>
              <ul className="space-y-2">
                {program.eligibilityCriteria.map((criteria, index) => (
                  <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    {criteria}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">Valid until: {program.validUntil}</span>
              <button 
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-800">Application Status</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {discountData.applications.map(application => (
          <div key={application.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-medium text-slate-800">{application.studentName}</h4>
                <span className="text-sm text-slate-500">{application.program}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Discount Type:</span>
                <span className="text-slate-700">{application.discountType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Submitted:</span>
                <span className="text-slate-700">{application.submittedDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Documents:</span>
                <span className="text-slate-700">{application.documents.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApplicationForm = () => (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-2xl w-full mx-4">
        <h3 className="text-xl font-semibold text-slate-800 mb-6">Discount Application Form</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
            <input 
              type="text" 
              placeholder="Enter student name"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
            <select className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10">
              <option value="">Select program</option>
              <option value="bit">Bachelor of Information Technology</option>
              <option value="bbm">Bachelor of Business Management</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Discount Program</label>
            <input 
              type="text" 
              value={selectedProgram?.name || ''} 
              disabled 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supporting Documents</label>
            <div className="relative">
              <input 
                type="file" 
                multiple
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-slate-500">Upload required documents</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button 
            className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            onClick={() => setShowApplicationForm(false)}
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Student Discounts</h1>
        <p className="text-slate-500">Explore available discount programs and track applications</p>
      </div>

      <div className="space-y-8">
        {renderDiscountPrograms()}
        {renderApplicationStatus()}
      </div>

      {showApplicationForm && renderApplicationForm()}
    </div>
  );
};

export default StudentDiscount; 