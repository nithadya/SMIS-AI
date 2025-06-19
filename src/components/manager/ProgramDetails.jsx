import React, { useState, useEffect } from 'react';
import { 
  getProgramById, 
  getFeeStructure, 
  getMarketingMaterials,
  createFeeStructure,
  createMarketingMaterial,
  updateFeeStructure,
  deleteFeeStructure
} from '../../lib/api/programs';
import { MagicCard } from '../ui/MagicCard';
import { ShimmerButton } from '../ui/ShimmerButton';

const ProgramDetails = ({ programId, onBack }) => {
  const [program, setProgram] = useState(null);
  const [feeStructure, setFeeStructure] = useState([]);
  const [marketingMaterials, setMarketingMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fee form state
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [feeFormData, setFeeFormData] = useState({
    fee_type: '',
    amount: '',
    currency: 'LKR',
    is_mandatory: true,
    description: ''
  });

  // Marketing material form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({
    material_type: '',
    name: '',
    description: '',
    file_url: ''
  });

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
    }
  }, [programId]);

  const fetchProgramDetails = async () => {
    setLoading(true);
    try {
      const [programResult, feeResult, materialResult] = await Promise.all([
        getProgramById(programId),
        getFeeStructure(programId),
        getMarketingMaterials(programId)
      ]);

      if (programResult.error) throw new Error(programResult.error);
      if (feeResult.error) throw new Error(feeResult.error);
      if (materialResult.error) throw new Error(materialResult.error);

      setProgram(programResult.data);
      setFeeStructure(feeResult.data || []);
      setMarketingMaterials(materialResult.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching program details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const feeData = {
        ...feeFormData,
        program_id: programId,
        amount: parseFloat(feeFormData.amount)
      };

      const result = editingFee 
        ? await updateFeeStructure(editingFee.id, feeData)
        : await createFeeStructure(feeData);

      if (result.error) throw new Error(result.error);

      await fetchProgramDetails();
      setShowFeeForm(false);
      setEditingFee(null);
      resetFeeForm();
      alert(editingFee ? 'Fee updated successfully!' : 'Fee created successfully!');
    } catch (err) {
      console.error('Error saving fee:', err);
      alert('Failed to save fee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!confirm('Are you sure you want to delete this fee?')) return;

    setLoading(true);
    try {
      const result = await deleteFeeStructure(feeId);
      if (result.error) throw new Error(result.error);

      await fetchProgramDetails();
      alert('Fee deleted successfully!');
    } catch (err) {
      console.error('Error deleting fee:', err);
      alert('Failed to delete fee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const materialData = {
        ...materialFormData,
        program_id: programId
      };

      const result = await createMarketingMaterial(materialData);
      if (result.error) throw new Error(result.error);

      await fetchProgramDetails();
      setShowMaterialForm(false);
      resetMaterialForm();
      alert('Marketing material created successfully!');
    } catch (err) {
      console.error('Error creating material:', err);
      alert('Failed to create material: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFeeForm = () => {
    setFeeFormData({
      fee_type: '',
      amount: '',
      currency: 'LKR',
      is_mandatory: true,
      description: ''
    });
  };

  const resetMaterialForm = () => {
    setMaterialFormData({
      material_type: '',
      name: '',
      description: '',
      file_url: ''
    });
  };

  const handleEditFee = (fee) => {
    setEditingFee(fee);
    setFeeFormData({
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      currency: fee.currency,
      is_mandatory: fee.is_mandatory,
      description: fee.description || ''
    });
    setShowFeeForm(true);
  };

  if (loading && !program) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Program</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchProgramDetails}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Program not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fee Structure' },
    { id: 'marketing', label: 'Marketing Materials' },
    { id: 'analytics', label: 'Analytics' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <MagicCard className="p-6">
        <h2 className="text-2xl font-bold mb-4">Program Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{program.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <p className="text-gray-900">{program.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <p className="text-gray-900">{program.duration}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <p className="text-gray-900">{program.level}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <p className="text-gray-900">{program.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`px-2 py-1 text-sm rounded-full ${
              program.status === 'Active' ? 'bg-green-100 text-green-800' :
              program.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {program.status}
            </span>
          </div>
        </div>
      </MagicCard>

      <MagicCard className="p-6">
        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <p className="text-gray-700">{program.description}</p>
      </MagicCard>

      {program.marketing_description && (
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-3">Marketing Description</h3>
          <p className="text-gray-700">{program.marketing_description}</p>
        </MagicCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {program.intakes && program.intakes.length > 0 && (
          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold mb-3">Intakes</h3>
            <ul className="space-y-1">
              {program.intakes.map((intake, index) => (
                <li key={index} className="text-gray-700">• {intake}</li>
              ))}
            </ul>
          </MagicCard>
        )}

        {program.eligibility && program.eligibility.length > 0 && (
          <MagicCard className="p-6">
            <h3 className="text-lg font-semibold mb-3">Eligibility Requirements</h3>
            <ul className="space-y-1">
              {program.eligibility.map((requirement, index) => (
                <li key={index} className="text-gray-700">• {requirement}</li>
              ))}
            </ul>
          </MagicCard>
        )}
      </div>

      {program.careers && program.careers.length > 0 && (
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-3">Career Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {program.careers.map((career, index) => (
              <div key={index} className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-gray-700">{career}</span>
              </div>
            ))}
          </div>
        </MagicCard>
      )}
    </div>
  );

  const renderFeeStructure = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fee Structure</h2>
        <ShimmerButton
          onClick={() => {
            setEditingFee(null);
            resetFeeForm();
            setShowFeeForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Fee
        </ShimmerButton>
      </div>

      {showFeeForm && (
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingFee ? 'Edit Fee' : 'Add New Fee'}
          </h3>
          <form onSubmit={handleCreateFee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Type *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Tuition Fee, Registration Fee"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={feeFormData.fee_type}
                  onChange={(e) => setFeeFormData(prev => ({ ...prev, fee_type: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={feeFormData.amount}
                  onChange={(e) => setFeeFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={feeFormData.currency}
                  onChange={(e) => setFeeFormData(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_mandatory"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={feeFormData.is_mandatory}
                  onChange={(e) => setFeeFormData(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                />
                <label htmlFor="is_mandatory" className="ml-2 text-sm text-gray-700">
                  Mandatory Fee
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={feeFormData.description}
                onChange={(e) => setFeeFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {loading ? 'Saving...' : (editingFee ? 'Update Fee' : 'Add Fee')}
              </ShimmerButton>
              <button
                type="button"
                onClick={() => {
                  setShowFeeForm(false);
                  setEditingFee(null);
                  resetFeeForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </MagicCard>
      )}

      <div className="grid grid-cols-1 gap-4">
        {feeStructure.map((fee) => (
          <MagicCard key={fee.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{fee.fee_type}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {fee.currency} {parseFloat(fee.amount).toLocaleString()}
                </p>
                {fee.description && (
                  <p className="text-gray-600 mb-2">{fee.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    fee.is_mandatory ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {fee.is_mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                  <span>Created: {new Date(fee.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditFee(fee)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteFee(fee.id)}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>

      {feeStructure.length === 0 && (
        <MagicCard className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Structure</h3>
          <p className="text-gray-600 mb-4">No fees have been added for this program yet.</p>
          <ShimmerButton
            onClick={() => setShowFeeForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add First Fee
          </ShimmerButton>
        </MagicCard>
      )}
    </div>
  );

  const renderMarketingMaterials = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Marketing Materials</h2>
        <ShimmerButton
          onClick={() => {
            resetMaterialForm();
            setShowMaterialForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Material
        </ShimmerButton>
      </div>

      {showMaterialForm && (
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Marketing Material</h3>
          <form onSubmit={handleCreateMaterial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={materialFormData.material_type}
                  onChange={(e) => setMaterialFormData(prev => ({ ...prev, material_type: e.target.value }))}
                >
                  <option value="">Select Type</option>
                  <option value="brochure">Brochure</option>
                  <option value="flyer">Flyer</option>
                  <option value="video">Video</option>
                  <option value="presentation">Presentation</option>
                  <option value="curriculum">Curriculum</option>
                  <option value="handbook">Handbook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={materialFormData.name}
                  onChange={(e) => setMaterialFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/file.pdf"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={materialFormData.file_url}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, file_url: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={materialFormData.description}
                onChange={(e) => setMaterialFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <ShimmerButton
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {loading ? 'Adding...' : 'Add Material'}
              </ShimmerButton>
              <button
                type="button"
                onClick={() => {
                  setShowMaterialForm(false);
                  resetMaterialForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </MagicCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {marketingMaterials.map((material) => (
          <MagicCard key={material.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{material.name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {material.material_type}
              </span>
            </div>
            {material.description && (
              <p className="text-gray-600 mb-4">{material.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Created: {new Date(material.created_at).toLocaleDateString()}
              </span>
              {material.file_url && (
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                >
                  View File
                </a>
              )}
            </div>
          </MagicCard>
        ))}
      </div>

      {marketingMaterials.length === 0 && (
        <MagicCard className="p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Marketing Materials</h3>
          <p className="text-gray-600 mb-4">No marketing materials have been added for this program yet.</p>
          <ShimmerButton
            onClick={() => setShowMaterialForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add First Material
          </ShimmerButton>
        </MagicCard>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Program Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MagicCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Batches</h3>
          <p className="text-3xl font-bold text-blue-600">
            {program.batches ? program.batches.length : 0}
          </p>
        </MagicCard>
        
        <MagicCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Batches</h3>
          <p className="text-3xl font-bold text-green-600">
            {program.batches ? program.batches.filter(b => b.status === 'Open' || b.status === 'Full').length : 0}
          </p>
        </MagicCard>
        
        <MagicCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Capacity</h3>
          <p className="text-3xl font-bold text-purple-600">
            {program.batches ? program.batches.reduce((sum, b) => sum + (b.capacity || 0), 0) : 0}
          </p>
        </MagicCard>
      </div>

      {program.batches && program.batches.length > 0 && (
        <MagicCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Batch Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Batch Code</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Start Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Capacity</th>
                  <th className="text-left py-2">Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {program.batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-gray-100">
                    <td className="py-2 font-medium">{batch.batch_code}</td>
                    <td className="py-2">{batch.name}</td>
                    <td className="py-2">{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        batch.status === 'Open' ? 'bg-green-100 text-green-800' :
                        batch.status === 'Full' ? 'bg-yellow-100 text-yellow-800' :
                        batch.status === 'Closed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-2">{batch.capacity || 0}</td>
                    <td className="py-2">{batch.enrolled || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MagicCard>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
            >
              ← Back to Programs
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
            <p className="text-gray-600">Program Code: {program.code}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            program.status === 'Active' ? 'bg-green-100 text-green-800' :
            program.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {program.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'fees' && renderFeeStructure()}
      {activeTab === 'marketing' && renderMarketingMaterials()}
      {activeTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default ProgramDetails;