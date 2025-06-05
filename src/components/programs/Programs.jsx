import React, { useState } from 'react';

const Programs = () => {
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  // Mock data for demonstration
  const programs = [
    {
      id: 1,
      name: 'Bachelor of Information Technology',
      shortName: 'BIT',
      description: 'A comprehensive program covering software development, networking, and system administration.',
      duration: '4 years',
      intakes: ['February', 'July'],
      fees: {
        local: 'LKR 850,000/year',
        international: 'USD 6,500/year'
      },
      eligibility: [
        'Minimum 3 "S" passes in GCE A/L',
        'Credit pass in English at O/L',
        'Basic mathematics proficiency'
      ],
      careers: [
        'Software Developer',
        'System Administrator',
        'Network Engineer',
        'IT Consultant'
      ],
      materials: [
        {
          type: 'brochure',
          name: 'Program Brochure 2024',
          size: '2.4 MB',
          url: '/materials/bit-brochure-2024.pdf'
        },
        {
          type: 'curriculum',
          name: 'Detailed Curriculum',
          size: '1.8 MB',
          url: '/materials/bit-curriculum.pdf'
        }
      ]
    },
    {
      id: 2,
      name: 'Bachelor of Business Management',
      shortName: 'BBM',
      description: 'Develop essential business management skills with focus on modern business practices.',
      duration: '3 years',
      intakes: ['March', 'September'],
      fees: {
        local: 'LKR 750,000/year',
        international: 'USD 5,500/year'
      },
      eligibility: [
        'Minimum 3 "S" passes in GCE A/L',
        'Credit pass in English at O/L',
        'Basic mathematics knowledge'
      ],
      careers: [
        'Business Analyst',
        'Management Consultant',
        'Project Manager',
        'Entrepreneur'
      ],
      materials: [
        {
          type: 'brochure',
          name: 'Program Brochure 2024',
          size: '2.1 MB',
          url: '/materials/bbm-brochure-2024.pdf'
        },
        {
          type: 'presentation',
          name: 'Program Overview',
          size: '3.5 MB',
          url: '/materials/bbm-overview.pptx'
        }
      ]
    }
  ];

  const renderProgramList = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {programs.map(program => (
        <div 
          key={program.id}
          className={`group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out cursor-pointer
            ${activeProgram?.id === program.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
          onClick={() => setActiveProgram(program)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveProgram(program)}
          aria-label={`View details for ${program.name}`}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {program.name}
            </h3>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
              {program.duration}
            </span>
          </div>
          <p className="text-slate-600 mb-8 leading-relaxed">{program.description}</p>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 rounded-lg p-4 group-hover:bg-blue-50/50 transition-colors">
              <span className="block text-sm text-slate-500 mb-1.5">Next Intake</span>
              <span className="text-base font-medium text-slate-800">{program.intakes[0]}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 group-hover:bg-blue-50/50 transition-colors">
              <span className="block text-sm text-slate-500 mb-1.5">Local Fee</span>
              <span className="text-base font-medium text-slate-800">{program.fees.local}</span>
            </div>
          </div>
          <button 
            className="w-full px-6 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg 
              hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 
              transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
            aria-label={`View detailed information about ${program.name}`}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );

  const renderProgramDetails = () => {
    if (!activeProgram) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{activeProgram.name}</h2>
              <p className="text-sm text-slate-500 mt-2">{activeProgram.shortName}</p>
            </div>
            <button 
              className="px-6 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 
                focus:bg-slate-300 rounded-lg transition-all duration-200 ease-in-out
                focus:ring-2 focus:ring-slate-500/20"
              onClick={() => setActiveProgram(null)}
              aria-label="Return to program list"
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200">
          <div className="flex flex-wrap">
            <button 
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                ${activeTab === 'details' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('details')}
              aria-selected={activeTab === 'details'}
              role="tab"
            >
              Program Details
            </button>
            <button 
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                ${activeTab === 'materials' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('materials')}
              aria-selected={activeTab === 'materials'}
              role="tab"
            >
              Marketing Materials
            </button>
          </div>
        </div>

        {activeTab === 'details' ? (
          <div className="p-6 sm:p-8 space-y-10">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Program Overview</h3>
              <p className="text-slate-600 leading-relaxed">{activeProgram.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Key Information</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4 hover:bg-blue-50/50 transition-colors">
                    <span className="block text-sm text-slate-500 mb-1.5">Duration</span>
                    <span className="text-base font-medium text-slate-800">{activeProgram.duration}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 hover:bg-blue-50/50 transition-colors">
                    <span className="block text-sm text-slate-500 mb-1.5">Intakes</span>
                    <span className="text-base font-medium text-slate-800">{activeProgram.intakes.join(', ')}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 hover:bg-blue-50/50 transition-colors">
                    <span className="block text-sm text-slate-500 mb-1.5">Local Students Fee</span>
                    <span className="text-base font-medium text-slate-800">{activeProgram.fees.local}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 hover:bg-blue-50/50 transition-colors">
                    <span className="block text-sm text-slate-500 mb-1.5">International Students Fee</span>
                    <span className="text-base font-medium text-slate-800">{activeProgram.fees.international}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Eligibility Criteria</h3>
                <ul className="space-y-4" role="list">
                  {activeProgram.eligibility.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500 mr-4 
                        group-hover:bg-blue-600 group-hover:scale-125 transition-all duration-200"></span>
                      <span className="text-slate-600 group-hover:text-slate-800 transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Career Opportunities</h3>
                <ul className="space-y-4" role="list">
                  {activeProgram.careers.map((career, index) => (
                    <li key={index} className="flex items-start group">
                      <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500 mr-4 
                        group-hover:bg-green-600 group-hover:scale-125 transition-all duration-200"></span>
                      <span className="text-slate-600 group-hover:text-slate-800 transition-colors">
                        {career}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeProgram.materials.map((material, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-6 p-5 bg-slate-50 rounded-xl
                    hover:bg-blue-50/50 transition-all duration-200 ease-in-out"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl
                    shadow-sm group-hover:scale-110 transition-transform duration-200">
                    {material.type === 'brochure' ? '📄' : 
                     material.type === 'curriculum' ? '📚' : 
                     material.type === 'presentation' ? '📊' : '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {material.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {material.type} • {material.size}
                    </span>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg
                      hover:bg-blue-500 hover:text-white hover:border-transparent
                      focus:ring-2 focus:ring-blue-500/20
                      transition-all duration-200 ease-in-out transform group-hover:-translate-y-0.5"
                    aria-label={`Download ${material.name}`}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Academic Programs</h1>
        <p className="text-lg text-slate-500">Explore our comprehensive range of academic programs</p>
      </div>

      <div>
        {activeProgram ? renderProgramDetails() : renderProgramList()}
      </div>
    </div>
  );
};

export default Programs; 