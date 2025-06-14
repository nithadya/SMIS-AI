import React from 'react';

const EnrollmentStepDetails = ({ step, isActive }) => {
  // Define step-specific details and requirements
  const stepDetails = {
    'Initial Inquiry': {
      description: 'Initial contact with the student and gathering basic information.',
      requirements: [
        'Student personal information collected',
        'Program of interest identified',
        'Initial counseling session scheduled'
      ]
    },
    'Counseling Session': {
      description: 'One-on-one session with a counselor to discuss program details and requirements.',
      requirements: [
        'Program details explained to student',
        'Financial requirements discussed',
        'Student questions addressed',
        'Next steps outlined'
      ]
    },
    'Document Submission': {
      description: 'Collection of required documents for enrollment processing.',
      requirements: [
        'Application form completed',
        'Educational certificates submitted',
        'Identification documents provided',
        'Passport-sized photographs submitted',
        'Previous academic records received'
      ]
    },
    'Document Verification': {
      description: 'Verification of submitted documents for authenticity and completeness.',
      requirements: [
        'Educational certificates verified',
        'Identification documents validated',
        'Application form reviewed for completeness',
        'Previous academic records checked'
      ]
    },
    'Payment Processing': {
      description: 'Processing of initial payment or registration fees.',
      requirements: [
        'Fee structure explained',
        'Payment method selected',
        'Initial payment processed',
        'Receipt generated and provided'
      ]
    },
    'Enrollment Confirmation': {
      description: 'Final confirmation of enrollment and providing access to student resources.',
      requirements: [
        'Enrollment letter generated',
        'Student ID assigned',
        'Course materials provided',
        'Student portal access granted',
        'Orientation schedule shared'
      ]
    }
  };

  const details = stepDetails[step.step_name] || {
    description: 'Step details not available.',
    requirements: []
  };

  return (
    <div className={`p-5 rounded-lg border ${
      step.completed 
        ? 'bg-green-50 border-green-200' 
        : isActive
          ? 'bg-blue-50 border-blue-200'
          : 'bg-slate-50 border-slate-200'
    }`}>
      <h4 className={`text-lg font-medium mb-2 ${
        step.completed 
          ? 'text-green-700' 
          : isActive
            ? 'text-blue-700'
            : 'text-slate-700'
      }`}>
        {step.step_name}
      </h4>
      
      <p className="text-sm text-slate-600 mb-4">{details.description}</p>
      
      <div className="mb-4">
        <h5 className="text-sm font-medium text-slate-700 mb-2">Requirements:</h5>
        <ul className="space-y-1">
          {details.requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 text-green-600' 
                  : isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-200 text-slate-600'
              }`}>
                {step.completed ? '✓' : ''}
              </span>
              <span className={step.completed ? 'text-slate-500' : 'text-slate-600'}>
                {req}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      {step.completed && step.completion_date && (
        <div className="text-xs text-green-600">
          Completed on: {new Date(step.completion_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default EnrollmentStepDetails; 