import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAllPrograms, 
  createProgram, 
  updateProgram, 
  archiveProgram,
  deleteProgram,
  deleteMultiplePrograms,
  duplicateProgram,
  getProgramStats,
  getFeeStructure,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getMarketingMaterials,
  createMarketingMaterial,
  deleteMarketingMaterial
} from '../../lib/api/programs';
import { useAuth } from '../../context/AuthContext';
import { AnimatedGradientText } from '../ui/AnimatedGradientText';
import { ShimmerButton } from '../ui/ShimmerButton';
import { MagicCard } from '../ui/MagicCard';
import ProgramDetails from './ProgramDetails';

const ProgramManagement = () => {
  const { user } = useAuth();
  
  // Redirect if user is not a manager
  useEffect(() => {
    if (user && user.role !== 'manager') {
      window.location.href = '/programs'; // Redirect to marketing view
    }
  }, [user]);

  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [deletingPrograms, setDeletingPrograms] = useState(new Set());
  const [archivingPrograms, setArchivingPrograms] = useState(new Set());
  const [selectedPrograms, setSelectedPrograms] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    status: 'all',
    search: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    category: '',
    level: '',
    intakes: ['February', 'July', 'October'],
    eligibility: [],
    careers: [],
    marketing_description: '',
    status: 'Active'
  });

  // Fetch programs and stats
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [programsResult, statsResult] = await Promise.all([
        getAllPrograms(filters),
        getProgramStats()
      ]);

      if (programsResult.error) {
        throw new Error(programsResult.error);
      }

      if (statsResult.error) {
        throw new Error(statsResult.error);
      }

      setPrograms(programsResult.data || []);
      setStats(statsResult.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter programs based on search and filters
  useEffect(() => {
    let filtered = programs;

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm) ||
        program.code.toLowerCase().includes(searchTerm) ||
        program.description?.toLowerCase().includes(searchTerm) ||
        program.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(program => program.category === filters.category);
    }

    // Apply level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(program => program.level === filters.level);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(program => program.status === filters.status);
    }

    setFilteredPrograms(filtered);
  }, [programs, filters]);

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createProgram(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await fetchData();
      setShowCreateForm(false);
      resetForm();
      alert('Program created successfully!');
    } catch (err) {
      console.error('Error creating program:', err);
      alert('Failed to create program: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setLoading(true);

    try {
      const result = await updateProgram(selectedProgram.id, formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await fetchData();
      setShowEditForm(false);
      setSelectedProgram(null);
      resetForm();
      alert('Program updated successfully!');
    } catch (err) {
      console.error('Error updating program:', err);
      alert('Failed to update program: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProgram = async (programId, programName) => {
    const confirmMessage = `Are you sure you want to archive the program "${programName}"?\n\nThis will:\n- Set the program status to "Archived"\n- Hide it from active program lists\n- Preserve all historical data\n\nThis action can be reversed by editing the program and changing its status back to "Active".`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // Add to archiving set for loading state
    setArchivingPrograms(prev => new Set(prev).add(programId));

    try {
      const result = await archiveProgram(programId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await fetchData();
      if (selectedProgram?.id === programId) {
        setSelectedProgram(null);
      }
      alert(`Program "${programName}" has been archived successfully!\n\nThe program is now hidden from active lists but can be restored by changing its status back to "Active".`);
    } catch (err) {
      console.error('Error archiving program:', err);
      alert('Failed to archive program: ' + err.message);
    } finally {
      // Remove from archiving set
      setArchivingPrograms(prev => {
        const newSet = new Set(prev);
        newSet.delete(programId);
        return newSet;
      });
    }
  };

  const handleDeleteProgram = async (programId, programName) => {
    const confirmMessage = `⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to PERMANENTLY DELETE the program "${programName}"?\n\nThis will:\n- COMPLETELY remove the program from the database\n- Delete ALL related data (fees, materials, etc.)\n- This action CANNOT be undone\n\nIf you want to hide the program temporarily, use "Archive" instead.\n\nType "DELETE" to confirm permanent deletion:`;
    
    const userConfirmation = prompt(confirmMessage);
    if (userConfirmation !== 'DELETE') {
      alert('Deletion cancelled. Program was not deleted.');
      return;
    }

    // Add to deleting set for loading state
    setDeletingPrograms(prev => new Set(prev).add(programId));

    try {
      const result = await deleteProgram(programId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await fetchData();
      if (selectedProgram?.id === programId) {
        setSelectedProgram(null);
      }
      alert(`Program "${programName}" has been permanently deleted from the database.`);
    } catch (err) {
      console.error('Error deleting program:', err);
      alert('Failed to delete program: ' + err.message);
    } finally {
      // Remove from deleting set
      setDeletingPrograms(prev => {
        const newSet = new Set(prev);
        newSet.delete(programId);
        return newSet;
      });
    }
  };

  const handleDuplicateProgram = async (programId) => {
    setLoading(true);

    try {
      const result = await duplicateProgram(programId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      await fetchData();
      alert('Program duplicated successfully!');
    } catch (err) {
      console.error('Error duplicating program:', err);
      alert('Failed to duplicate program: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setFormData({
      name: program.name || '',
      code: program.code || '',
      description: program.description || '',
      duration: program.duration || '',
      category: program.category || '',
      level: program.level || '',
      intakes: program.intakes || ['February', 'July', 'October'],
      eligibility: program.eligibility || [],
      careers: program.careers || [],
      marketing_description: program.marketing_description || '',
      status: program.status || 'Active'
    });
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      duration: '',
      category: '',
      level: '',
      intakes: ['February', 'July', 'October'],
      eligibility: [],
      careers: [],
      marketing_description: '',
      status: 'Active'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleDeleteSelected = async () => {
    if (selectedPrograms.size === 0) {
      alert('Please select programs to delete.');
      return;
    }

    const programNames = filteredPrograms
      .filter(p => selectedPrograms.has(p.id))
      .map(p => p.name)
      .join(', ');

    const confirmMessage = `⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to PERMANENTLY DELETE ${selectedPrograms.size} selected programs?\n\nPrograms: ${programNames}\n\nThis will:\n- COMPLETELY remove all programs from the database\n- Delete ALL related data (fees, materials, etc.)\n- This action CANNOT be undone\n\nType "DELETE ALL" to confirm permanent deletion:`;
    
    const userConfirmation = prompt(confirmMessage);
    if (userConfirmation !== 'DELETE ALL') {
      alert('Deletion cancelled. No programs were deleted.');
      return;
    }

    setLoading(true);

    try {
      const result = await deleteMultiplePrograms(Array.from(selectedPrograms));
      
      if (result.error) {
        throw new Error(result.error);
      }

      await fetchData();
      setSelectedPrograms(new Set());
      setIsSelectMode(false);
      alert(`${selectedPrograms.size} programs have been permanently deleted from the database.`);
    } catch (err) {
      console.error('Error deleting selected programs:', err);
      alert('Failed to delete selected programs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgram = (programId) => {
    setSelectedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        newSet.delete(programId);
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPrograms.size === filteredPrograms.length) {
      setSelectedPrograms(new Set());
    } else {
      setSelectedPrograms(new Set(filteredPrograms.map(p => p.id)));
    }
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    const statCards = [
      { label: 'Total Programs', value: stats.total, color: 'bg-blue-500' },
      { label: 'Active Programs', value: stats.active, color: 'bg-green-500' },
      { label: 'Draft Programs', value: stats.draft, color: 'bg-yellow-500' },
      { label: 'Archived Programs', value: stats.archived, color: 'bg-red-500' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <MagicCard key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{stat.value}</span>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>
    );
  };

  const renderFilterBar = () => (
    <MagicCard className="p-6 mb-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search programs..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">All Categories</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Business">Business</option>
            <option value="Science">Science</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.level}
            onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
          >
            <option value="all">All Levels</option>
            <option value="Higher Diploma">Higher Diploma</option>
            <option value="Bachelor">Bachelor</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsSelectMode(!isSelectMode);
              setSelectedPrograms(new Set());
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isSelectMode 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isSelectMode ? 'Cancel Selection' : 'Select Mode'}
          </button>
          
          {isSelectMode && (
            <>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {selectedPrograms.size === filteredPrograms.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedPrograms.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  🗑️ Delete Selected ({selectedPrograms.size})
                </button>
              )}
            </>
          )}

          <ShimmerButton
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            + Create Program
          </ShimmerButton>
        </div>
      </div>
    </MagicCard>
  );

  const renderProgramsGrid = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Programs ({filteredPrograms.length})
        </h2>
        {isSelectMode && selectedPrograms.size > 0 && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {selectedPrograms.size} selected
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredPrograms.map((program) => (
        <MagicCard key={program.id} className={`p-6 ${selectedPrograms.has(program.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                {isSelectMode && (
                  <input
                    type="checkbox"
                    checked={selectedPrograms.has(program.id)}
                    onChange={() => handleSelectProgram(program.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                )}
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {program.name}
                </h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                program.status === 'Active' ? 'bg-green-100 text-green-800' :
                program.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                program.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {program.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Code: {program.code}</p>
            <p className="text-sm text-gray-700 line-clamp-3 mb-4">
              {program.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <p className="text-gray-600">{program.duration}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Level:</span>
              <p className="text-gray-600">{program.level}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Category:</span>
              <p className="text-gray-600">{program.category}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Intakes:</span>
              <p className="text-gray-600">{program.intakes?.join(', ')}</p>
            </div>
          </div>

          {!isSelectMode && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedProgram(program);
                  setShowDetails(true);
                }}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => handleEditProgram(program)}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDuplicateProgram(program.id)}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200 transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleArchiveProgram(program.id, program.name)}
                disabled={archivingPrograms.has(program.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors font-medium ${
                  archivingPrograms.has(program.id)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
                title={`Archive ${program.name}`}
              >
                {archivingPrograms.has(program.id) ? (
                  <>⏳ Archiving...</>
                ) : (
                  <>📦 Archive</>
                )}
              </button>
              <button
                onClick={() => handleDeleteProgram(program.id, program.name)}
                disabled={deletingPrograms.has(program.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors font-medium border ${
                  deletingPrograms.has(program.id)
                    ? 'bg-gray-400 text-white border-gray-400 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 border-red-600'
                }`}
                title={`Permanently Delete ${program.name}`}
              >
                {deletingPrograms.has(program.id) ? (
                  <>⏳ Deleting...</>
                ) : (
                  <>🗑️ Delete</>
                )}
              </button>
            </div>
          )}

          {isSelectMode && (
            <div className="text-center py-2">
              <span className="text-sm text-gray-500">
                {selectedPrograms.has(program.id) ? '✓ Selected' : 'Click checkbox to select'}
              </span>
            </div>
          )}
        </MagicCard>
      ))}
      </div>
    </div>
  );

  const renderProgramForm = (isEdit = false) => (
    <MagicCard className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Program' : 'Create New Program'}
      </h2>

      <form onSubmit={isEdit ? handleUpdateProgram : handleCreateProgram} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Code *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 3 years, 2 semesters"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Business">Business</option>
              <option value="Science">Science</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
            >
              <option value="">Select Level</option>
              <option value="Higher Diploma">Higher Diploma</option>
              <option value="Bachelor">Bachelor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marketing Description
          </label>
          <textarea
            rows="3"
            placeholder="Marketing-focused description for promotional materials"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.marketing_description}
            onChange={(e) => handleInputChange('marketing_description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligibility Requirements
          </label>
          {formData.eligibility.map((requirement, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={requirement}
                onChange={(e) => handleArrayInputChange('eligibility', index, e.target.value)}
                placeholder="Enter eligibility requirement"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('eligibility', index)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('eligibility')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            + Add Requirement
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Career Opportunities
          </label>
          {formData.careers.map((career, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={career}
                onChange={(e) => handleArrayInputChange('careers', index, e.target.value)}
                placeholder="Enter career opportunity"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('careers', index)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('careers')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            + Add Career
          </button>
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t">
          <button
            type="button"
            onClick={() => {
              if (isEdit) {
                setShowEditForm(false);
                setSelectedProgram(null);
              } else {
                setShowCreateForm(false);
              }
              resetForm();
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <ShimmerButton
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Program' : 'Create Program')}
          </ShimmerButton>
        </div>
      </form>
    </MagicCard>
  );

  if (loading && !programs.length) {
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
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show details view if selected
  if (showDetails && selectedProgram) {
    return (
      <ProgramDetails 
        programId={selectedProgram.id}
        onBack={() => {
          setShowDetails(false);
          setSelectedProgram(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <AnimatedGradientText className="text-3xl font-bold mb-2">
          Program Management
        </AnimatedGradientText>
        <p className="text-gray-600">
          Comprehensive tools for program creation, modification, and management within the system
        </p>
      </div>

      {/* Show Create Form */}
      {showCreateForm && (
        <div className="mb-8">
          {renderProgramForm(false)}
        </div>
      )}

      {/* Show Edit Form */}
      {showEditForm && selectedProgram && (
        <div className="mb-8">
          {renderProgramForm(true)}
        </div>
      )}

      {/* Show Main Interface */}
      {!showCreateForm && !showEditForm && (
        <>
          {renderStatsCards()}
          {renderFilterBar()}
          
          {filteredPrograms.length === 0 ? (
            <MagicCard className="p-12 text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.category !== 'all' || filters.level !== 'all' || filters.status !== 'all'
                  ? 'No programs match your current filters.'
                  : 'You haven\'t created any programs yet.'}
              </p>
              <ShimmerButton
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First Program
              </ShimmerButton>
            </MagicCard>
          ) : (
            renderProgramsGrid()
          )}
        </>
      )}
    </div>
  );
};

export default ProgramManagement; 