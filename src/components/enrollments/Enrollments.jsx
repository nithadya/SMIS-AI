import React, { useState } from 'react';

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
    <div className="relative">
      {steps.map((step, index) => (
        <div 
          key={step.name} 
          className={`flex items-start mb-4 last:mb-0 ${index < steps.length - 1 ? 'pb-4' : ''}`}
        >
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${step.completed 
              ? 'bg-green-100 text-green-600 border-2 border-green-200' 
              : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
            }
          `}>
            {step.completed ? '✓' : index + 1}
          </div>
          <div className="ml-4 flex-1">
            <span className={`block text-sm font-medium ${step.completed ? 'text-green-600' : 'text-slate-600'}`}>
              {step.name}
            </span>
            {step.date && (
              <span className="text-xs text-slate-500">{step.date}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-slate-200 -translate-x-1/2" />
          )}
        </div>
      ))}
    </div>
  );

  const renderEnrollmentList = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {enrollmentData.map(enrollment => (
        <div 
          key={enrollment.id}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setActiveEnrollment(enrollment)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-slate-800">{enrollment.studentName}</h3>
              <span className="text-sm text-slate-500">{enrollment.id}</span>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {enrollment.status}
            </span>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Program:</span>
              <span className="text-slate-700">{enrollment.program}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Batch:</span>
              <span className="text-slate-700">{enrollment.batch}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Counselor:</span>
              <span className="text-slate-700">{enrollment.counselor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Last Updated:</span>
              <span className="text-slate-700">{enrollment.lastUpdated}</span>
            </div>
          </div>

          {renderProgressSteps(enrollment.steps)}
        </div>
      ))}
    </div>
  );

  const renderEnrollmentDetails = () => {
    if (!activeEnrollment) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{activeEnrollment.studentName}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {activeEnrollment.program} • {activeEnrollment.batch}
              </p>
            </div>
            <button 
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              onClick={() => setActiveEnrollment(null)}
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">Enrollment Progress</h3>
            {renderProgressSteps(activeEnrollment.steps)}
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">Enrollment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Enrollment ID</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.id}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Source</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.source}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Counselor</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.counselor}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Last Updated</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Notes & Updates</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <button 
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
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
            <div className="space-y-4">
              {activeEnrollment.notes.map(note => (
                <div key={note.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">{note.author}</span>
                    <span className="text-xs text-slate-500">{note.date}</span>
                  </div>
                  <p className="text-sm text-slate-600">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Enrollment Management</h1>
        <p className="text-slate-500">Track and manage student enrollment progress</p>
      </div>

      <div>
        {activeEnrollment ? renderEnrollmentDetails() : renderEnrollmentList()}
      </div>
    </div>
  );
};

export default Enrollments; 