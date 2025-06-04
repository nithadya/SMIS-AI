import React, { useState } from 'react';
import './Programs.css';

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
    <div className="program-list">
      {programs.map(program => (
        <div 
          key={program.id}
          className={`program-card ${activeProgram?.id === program.id ? 'active' : ''}`}
          onClick={() => setActiveProgram(program)}
        >
          <div className="program-card-header">
            <h3>{program.name}</h3>
            <span className="program-duration">{program.duration}</span>
          </div>
          <p className="program-description">{program.description}</p>
          <div className="program-highlights">
            <div className="highlight">
              <span className="label">Next Intake</span>
              <span className="value">{program.intakes[0]}</span>
            </div>
            <div className="highlight">
              <span className="label">Local Fee</span>
              <span className="value">{program.fees.local}</span>
            </div>
          </div>
          <button className="button button-primary">View Details</button>
        </div>
      ))}
    </div>
  );

  const renderProgramDetails = () => {
    if (!activeProgram) return null;

    return (
      <div className="program-details">
        <div className="details-header">
          <div>
            <h2>{activeProgram.name}</h2>
            <p className="program-code">{activeProgram.shortName}</p>
          </div>
          <button className="button button-secondary" onClick={() => setActiveProgram(null)}>
            Back to List
          </button>
        </div>

        <div className="details-tabs">
          <button 
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Program Details
          </button>
          <button 
            className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            Marketing Materials
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="details-content">
            <div className="details-section">
              <h3>Program Overview</h3>
              <p>{activeProgram.description}</p>
            </div>

            <div className="details-grid">
              <div className="details-section">
                <h3>Key Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="label">Duration</span>
                    <span className="value">{activeProgram.duration}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Intakes</span>
                    <span className="value">{activeProgram.intakes.join(', ')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Local Students Fee</span>
                    <span className="value">{activeProgram.fees.local}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">International Students Fee</span>
                    <span className="value">{activeProgram.fees.international}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Eligibility Criteria</h3>
                <ul className="eligibility-list">
                  {activeProgram.eligibility.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="details-section">
                <h3>Career Opportunities</h3>
                <ul className="career-list">
                  {activeProgram.careers.map((career, index) => (
                    <li key={index}>{career}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="materials-content">
            <div className="materials-grid">
              {activeProgram.materials.map((material, index) => (
                <div key={index} className="material-card">
                  <div className="material-icon">
                    {material.type === 'brochure' ? '📄' : 
                     material.type === 'curriculum' ? '📚' : 
                     material.type === 'presentation' ? '📊' : '📁'}
                  </div>
                  <div className="material-info">
                    <h4>{material.name}</h4>
                    <span className="material-meta">
                      {material.type} • {material.size}
                    </span>
                  </div>
                  <button className="button button-secondary">
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
    <div className="programs-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Academic Programs</h1>
          <p>Explore our comprehensive range of academic programs</p>
        </div>
      </div>

      <div className="programs-container">
        {activeProgram ? renderProgramDetails() : renderProgramList()}
      </div>
    </div>
  );
};

export default Programs; 