import React, { useState } from 'react';

const Registrations = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      country: ''
    },
    academicInfo: {
      program: '',
      batch: '',
      previousEducation: '',
      institution: '',
      yearCompleted: '',
      grade: ''
    },
    documents: {
      idCard: null,
      transcripts: null,
      photo: null
    }
  });

  const steps = [
    { id: 1, name: 'Personal Information' },
    { id: 2, name: 'Academic Details' },
    { id: 3, name: 'Document Upload' },
    { id: 4, name: 'Review & Submit' }
  ];

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${activeStep === step.id 
                  ? 'bg-blue-500 text-white' 
                  : activeStep > step.id
                    ? 'bg-green-100 text-green-600 border-2 border-green-200'
                    : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
                }
              `}>
                {activeStep > step.id ? '✓' : step.id}
              </div>
              <span className={`
                ml-2 text-sm font-medium hidden sm:block
                ${activeStep === step.id ? 'text-blue-600' : 'text-slate-600'}
              `}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-16 sm:w-24 h-[2px] mx-2 bg-slate-200" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
        <input
          type="text"
          value={formData.personalInfo.firstName}
          onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
        <input
          type="text"
          value={formData.personalInfo.lastName}
          onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.personalInfo.email}
          onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.personalInfo.phone}
          onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
        <input
          type="date"
          value={formData.personalInfo.dateOfBirth}
          onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
        <select
          value={formData.personalInfo.gender}
          onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <textarea
          value={formData.personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
        <select
          value={formData.academicInfo.program}
          onChange={(e) => handleInputChange('academicInfo', 'program', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">Select program</option>
          <option value="bit">Bachelor of Information Technology</option>
          <option value="bbm">Bachelor of Business Management</option>
          <option value="eng">Bachelor of Engineering</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Batch</label>
        <select
          value={formData.academicInfo.batch}
          onChange={(e) => handleInputChange('academicInfo', 'batch', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          <option value="">Select batch</option>
          <option value="2024-1">2024 Batch 1 (February)</option>
          <option value="2024-2">2024 Batch 2 (July)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Previous Education</label>
        <input
          type="text"
          value={formData.academicInfo.previousEducation}
          onChange={(e) => handleInputChange('academicInfo', 'previousEducation', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          placeholder="e.g., GCE A/L"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
        <input
          type="text"
          value={formData.academicInfo.institution}
          onChange={(e) => handleInputChange('academicInfo', 'institution', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Year Completed</label>
        <input
          type="text"
          value={formData.academicInfo.yearCompleted}
          onChange={(e) => handleInputChange('academicInfo', 'yearCompleted', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Grade/Results</label>
        <input
          type="text"
          value={formData.academicInfo.grade}
          onChange={(e) => handleInputChange('academicInfo', 'grade', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">ID Card/Passport</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={(e) => handleFileUpload('idCard', e.target.files[0])}
            className="hidden"
            id="idCard"
            accept="image/*,.pdf"
          />
          <label
            htmlFor="idCard"
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-sm"
          >
            Choose File
          </label>
          <span className="text-sm text-slate-500">
            {formData.documents.idCard?.name || 'No file chosen'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Academic Transcripts</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={(e) => handleFileUpload('transcripts', e.target.files[0])}
            className="hidden"
            id="transcripts"
            accept=".pdf"
          />
          <label
            htmlFor="transcripts"
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-sm"
          >
            Choose File
          </label>
          <span className="text-sm text-slate-500">
            {formData.documents.transcripts?.name || 'No file chosen'}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Passport Size Photo</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={(e) => handleFileUpload('photo', e.target.files[0])}
            className="hidden"
            id="photo"
            accept="image/*"
          />
          <label
            htmlFor="photo"
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer text-sm"
          >
            Choose File
          </label>
          <span className="text-sm text-slate-500">
            {formData.documents.photo?.name || 'No file chosen'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Full Name</span>
            <span className="text-base font-medium text-slate-800">
              {formData.personalInfo.firstName} {formData.personalInfo.lastName}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Email</span>
            <span className="text-base font-medium text-slate-800">{formData.personalInfo.email}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Phone</span>
            <span className="text-base font-medium text-slate-800">{formData.personalInfo.phone}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Date of Birth</span>
            <span className="text-base font-medium text-slate-800">{formData.personalInfo.dateOfBirth}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Program</span>
            <span className="text-base font-medium text-slate-800">{formData.academicInfo.program}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Batch</span>
            <span className="text-base font-medium text-slate-800">{formData.academicInfo.batch}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Previous Education</span>
            <span className="text-base font-medium text-slate-800">{formData.academicInfo.previousEducation}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Institution</span>
            <span className="text-base font-medium text-slate-800">{formData.academicInfo.institution}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">Uploaded Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">ID Card/Passport</span>
            <span className="text-base font-medium text-slate-800">
              {formData.documents.idCard?.name || 'Not uploaded'}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Academic Transcripts</span>
            <span className="text-base font-medium text-slate-800">
              {formData.documents.transcripts?.name || 'Not uploaded'}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <span className="block text-sm text-slate-500 mb-1">Passport Size Photo</span>
            <span className="text-base font-medium text-slate-800">
              {formData.documents.photo?.name || 'Not uploaded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderAcademicInfo();
      case 3:
        return renderDocumentUpload();
      case 4:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">New Registration</h1>
        <p className="text-slate-500">Complete the registration form to enroll a new student</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-200">
          {renderStepIndicator()}
        </div>

        <div className="p-6">
          {renderStepContent()}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-between">
          <button
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${activeStep === 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (activeStep === steps.length) {
                // Submit form
                console.log('Form submitted:', formData);
              } else {
                setActiveStep(prev => Math.min(steps.length, prev + 1));
              }
            }}
            className="px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            {activeStep === steps.length ? 'Submit Registration' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Registrations; 