import React from 'react';

const EnrollmentStats = ({ enrollments }) => {
  // Calculate stats
  const totalEnrollments = enrollments.length;
  
  const statusCounts = {
    'Initial Inquiry': 0,
    'Counseling Session': 0,
    'Document Submission': 0,
    'Document Verification': 0,
    'Payment Processing': 0,
    'Enrollment Confirmation': 0
  };
  
  enrollments.forEach(enrollment => {
    if (enrollment.status && statusCounts.hasOwnProperty(enrollment.status)) {
      statusCounts[enrollment.status]++;
    }
  });
  
  // Calculate completion rate
  const completedEnrollments = statusCounts['Enrollment Confirmation'] || 0;
  const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <span className="text-sm text-slate-500 block mb-1">Total Enrollments</span>
        <span className="text-2xl font-semibold text-slate-800">{totalEnrollments}</span>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <span className="text-sm text-slate-500 block mb-1">Completion Rate</span>
        <div className="flex items-center">
          <span className="text-2xl font-semibold text-slate-800">{completionRate.toFixed(1)}%</span>
          <div className="ml-4 flex-1 bg-slate-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <span className="text-sm text-slate-500 block mb-1">Current Phase</span>
        <div className="space-y-2 mt-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center text-sm">
              <span className="text-slate-600">{status}</span>
              <span className="font-medium text-slate-800">{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <span className="text-sm text-slate-500 block mb-1">Enrollment Timeline</span>
        <div className="flex items-center justify-between mt-2">
          {Object.entries(statusCounts).map(([status, count], index) => {
            const percentage = totalEnrollments > 0 ? (count / totalEnrollments) * 100 : 0;
            return (
              <div 
                key={status} 
                className="flex flex-col items-center"
                title={`${status}: ${count}`}
              >
                <div 
                  className={`w-2 rounded-full ${
                    percentage > 0 ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                  style={{ height: `${Math.max(percentage * 0.8, 5)}px` }}
                ></div>
                <span className="text-xs text-slate-500 mt-1">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStats; 