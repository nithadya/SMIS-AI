import React, { useState, useEffect } from 'react';
import { getAllPrograms } from '../../lib/api/programs';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories derived from actual data
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const result = await getAllPrograms({ status: 'Active' }); // Only fetch active programs for marketing
      
      if (result.error) {
        throw new Error(result.error);
      }

      const programsData = result.data || [];
      setPrograms(programsData);
      setFilteredPrograms(programsData);
      
      // Extract unique categories from the data
      const uniqueCategories = [...new Set(programsData.map(p => p.category))]
        .filter(Boolean)
        .map(category => ({
          id: category,
          name: category,
          count: programsData.filter(p => p.category === category).length
        }));
      
      setCategories(uniqueCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(err.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter programs when category changes
    if (selectedCategory === 'all') {
      setFilteredPrograms(programs);
    } else {
      setFilteredPrograms(programs.filter(program => program.category === selectedCategory));
    }
  }, [selectedCategory, programs]);

  // Function to handle sending marketing materials
  const handleSendMaterials = (material) => {
    console.log('Sending marketing material:', material);
    alert(`Sending ${material.name} to program marketing materials...`);
  };

  // Helper function to get careers by category and program
  const getCareersByProgram = (program) => {
    if (program.careers && program.careers.length > 0) {
      return program.careers;
    }
    
    // Fallback career suggestions based on category if no careers are defined
    const { category, name } = program;
    if (category === 'Information Technology') {
      if (name.toLowerCase().includes('software engineering')) {
        return ['Software Developer', 'Full Stack Developer', 'DevOps Engineer', 'Technical Lead'];
      } else if (name.toLowerCase().includes('artificial intelligence')) {
        return ['AI Engineer', 'Machine Learning Specialist', 'Data Scientist', 'AI Research Analyst'];
      } else if (name.toLowerCase().includes('business information systems')) {
        return ['Business Analyst', 'Systems Analyst', 'IT Consultant', 'Project Manager'];
      } else {
        return ['Software Developer', 'System Administrator', 'Network Engineer', 'IT Consultant'];
      }
    } else if (category === 'Business') {
      if (name.toLowerCase().includes('digital marketing')) {
        return ['Digital Marketing Specialist', 'Social Media Manager', 'SEO Specialist', 'Content Marketing Manager'];
      } else {
        return ['Business Analyst', 'Management Consultant', 'Project Manager', 'Entrepreneur'];
      }
    } else if (category === 'Science') {
      if (name.toLowerCase().includes('psychology')) {
        return ['Clinical Psychologist', 'Counselor', 'Research Psychologist', 'HR Specialist'];
      } else if (name.toLowerCase().includes('biomedical')) {
        return ['Biomedical Technician', 'Laboratory Analyst', 'Research Assistant', 'Medical Device Specialist'];
      }
    }
    return ['Graduate Trainee', 'Specialist', 'Consultant', 'Manager'];
  };

  // Helper function to get program fees
  const getProgramFees = (program) => {
    if (program.fee_structure && program.fee_structure.length > 0) {
      const mainFee = program.fee_structure.find(fee => 
        fee.fee_type.toLowerCase().includes('tuition') || 
        fee.fee_type.toLowerCase().includes('program')
      ) || program.fee_structure[0];
      
      return {
        local: `${mainFee.currency} ${parseFloat(mainFee.amount).toLocaleString()}`,
        international: mainFee.currency === 'LKR' ? 'USD 3,500' : `${mainFee.currency} ${parseFloat(mainFee.amount).toLocaleString()}`
      };
    }
    
    // Fallback fees based on level
    return {
      local: program.level === 'Higher Diploma' ? 'LKR 450,000/year' : 'LKR 650,000/year',
      international: program.level === 'Higher Diploma' ? 'USD 3,500/year' : 'USD 5,000/year'
    };
  };

  // Helper function to get eligibility requirements
  const getEligibility = (program) => {
    if (program.eligibility && program.eligibility.length > 0) {
      return program.eligibility;
    }
    
    // Fallback eligibility based on level
    return program.level === 'Higher Diploma' ? [
      'Minimum 3 "S" passes in GCE A/L',
      'Credit pass in English at O/L',
      'Basic mathematics proficiency'
    ] : [
      'Minimum 3 "S" passes in GCE A/L with good grades',
      'Credit pass in English at O/L',
      'Mathematics proficiency',
      'Relevant subject background preferred'
    ];
  };

  // Get program materials
  const getMaterials = (program) => {
    if (program.program_marketing_materials && program.program_marketing_materials.length > 0) {
      return program.program_marketing_materials.map(material => ({
        type: material.material_type,
        name: material.name,
        size: '2.4 MB', // Default size as we don't store file size
        url: material.file_url || '#'
      }));
    }
    
    // Default materials
    return [
      {
        type: 'brochure',
        name: 'Program Brochure 2024',
        size: '2.4 MB',
        url: '#'
      },
      {
        type: 'curriculum',
        name: 'Detailed Curriculum',
        size: '1.8 MB',
        url: '#'
      }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Programs</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchPrograms}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderProgramList = () => (
    <div>
      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
            }`}
          >
            All Programs ({programs.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-blue-50'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
          <p className="text-gray-600">
            {selectedCategory === 'all' 
              ? 'No programs are currently available.' 
              : `No programs found in the ${selectedCategory} category.`}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPrograms.map(program => {
            const fees = getProgramFees(program);
            const intakes = program.intakes && program.intakes.length > 0 
              ? program.intakes 
              : ['February', 'July', 'October'];

            return (
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
                    <span className="text-base font-medium text-slate-800">{intakes[0]}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 group-hover:bg-blue-50/50 transition-colors">
                <span className="block text-sm text-slate-500 mb-1.5">Local Fee</span>
                    <span className="text-base font-medium text-slate-800">{fees.local}</span>
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
            );
          })}
      </div>
      )}
    </div>
  );

  const renderProgramDetails = () => {
    if (!activeProgram) return null;

    const fees = getProgramFees(activeProgram);
    const eligibility = getEligibility(activeProgram);
    const careers = getCareersByProgram(activeProgram);
    const materials = getMaterials(activeProgram);
    const intakes = activeProgram.intakes && activeProgram.intakes.length > 0 
      ? activeProgram.intakes 
      : ['February', 'July', 'October'];

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">{activeProgram.name}</h2>
              <p className="text-sm text-slate-500 mt-2">{activeProgram.code}</p>
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
            <button 
              className={`px-8 py-4 text-sm font-medium border-b-2 transition-all duration-200
                ${activeTab === 'fees' 
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('fees')}
              aria-selected={activeTab === 'fees'}
              role="tab"
            >
              Fee Structure
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Program Overview */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Program Overview</h3>
              <p className="text-slate-600 leading-relaxed">{activeProgram.description}</p>
                {activeProgram.marketing_description && (
                  <p className="text-slate-600 leading-relaxed mt-4">{activeProgram.marketing_description}</p>
                )}
            </div>

              {/* Program Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">Program Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Duration:</span>
                      <span className="text-slate-800 font-medium">{activeProgram.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Level:</span>
                      <span className="text-slate-800 font-medium">{activeProgram.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Category:</span>
                      <span className="text-slate-800 font-medium">{activeProgram.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`font-medium ${
                        activeProgram.status === 'Active' ? 'text-green-600' : 'text-slate-600'
                      }`}>
                        {activeProgram.status}
                      </span>
                    </div>
                  </div>
                  </div>

                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">Intake Information</h4>
                  <div className="space-y-3">
                    {intakes.map((intake, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-600">Intake {index + 1}:</span>
                        <span className="text-slate-800 font-medium">{intake}</span>
                  </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Eligibility Requirements */}
              {eligibility.length > 0 && (
              <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Eligibility Requirements</h4>
                  <ul className="space-y-2">
                    {eligibility.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-slate-600">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {/* Career Opportunities */}
              {careers.length > 0 && (
              <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Career Opportunities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {careers.map((career, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span className="text-slate-600">{career}</span>
                      </div>
                  ))}
                  </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Marketing Materials</h3>
              {materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {materials.map((material, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-800">{material.name}</h4>
                          <p className="text-sm text-slate-500 capitalize">{material.type} • {material.size}</p>
          </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full capitalize">
                          {material.type}
                    </span>
                  </div>
                      <div className="flex gap-2">
                        {material.url && material.url !== '#' ? (
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Download
                          </a>
                        ) : (
                          <span className="px-4 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed">
                            Not Available
                          </span>
                        )}
                    <button 
                      onClick={() => handleSendMaterials(material)}
                          className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    >
                          Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">No marketing materials available for this program.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Fee Structure</h3>
              {activeProgram.fee_structure && activeProgram.fee_structure.length > 0 ? (
                <div className="space-y-4">
                  {activeProgram.fee_structure.map((fee, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800">{fee.fee_type}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          fee.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {fee.is_mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {fee.currency} {parseFloat(fee.amount).toLocaleString()}
                      </p>
                      {fee.description && (
                        <p className="text-slate-600 text-sm">{fee.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-800 mb-2">Local Students</h4>
                    <p className="text-2xl font-bold text-blue-600">{fees.local}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <h4 className="font-semibold text-slate-800 mb-2">International Students</h4>
                    <p className="text-2xl font-bold text-blue-600">{fees.international}</p>
                  </div>
                </div>
              )}
          </div>
        )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Program Information</h1>
        <p className="text-slate-600">
          Explore our comprehensive range of academic programs and their details
        </p>
      </div>

      {/* Main Content */}
        {activeProgram ? renderProgramDetails() : renderProgramList()}
    </div>
  );
};

export default Programs; 