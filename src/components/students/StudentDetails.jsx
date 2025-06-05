import React from 'react';

const StudentDetails = ({ student }) => {
  const { personalInfo, academicInfo, documents } = student;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Full Name</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.name}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">NIC Number</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.nicNo}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Date of Birth</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.dateOfBirth}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Gender</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.gender}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Email</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.email}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Phone</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.phone}
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Address</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {personalInfo.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Academic Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Batch</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {academicInfo.batch}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Stream</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {academicInfo.stream}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Enrollment Date</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {academicInfo.enrollmentDate}
              </p>
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-500 mb-2">Current Semester</label>
              <p className="text-sm text-slate-800 font-medium group-hover:text-blue-600 transition-colors">
                {academicInfo.currentSemester}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Documents</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 
              hover:bg-blue-50/50 transition-all duration-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white 
                shadow-sm text-2xl group-hover:scale-110 transition-transform duration-200">
                📄
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-800 mb-2 group-hover:text-blue-600 
                  transition-colors">
                  NIC Copy
                </h4>
                <button 
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 
                    transition-colors"
                  aria-label="View NIC copy document"
                >
                  View Document
                </button>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 
              hover:bg-blue-50/50 transition-all duration-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white 
                shadow-sm text-2xl group-hover:scale-110 transition-transform duration-200">
                📜
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-800 mb-2 group-hover:text-blue-600 
                  transition-colors">
                  Birth Certificate
                </h4>
                <button 
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 
                    transition-colors"
                  aria-label="View birth certificate document"
                >
                  View Document
                </button>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-4 rounded-xl bg-slate-50 
              hover:bg-blue-50/50 transition-all duration-200">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white 
                shadow-sm text-2xl group-hover:scale-110 transition-transform duration-200">
                📝
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-800 mb-2 group-hover:text-blue-600 
                  transition-colors">
                  Registration Form
                </h4>
                <button 
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 
                    transition-colors"
                  aria-label="View registration form document"
                >
                  View Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails; 