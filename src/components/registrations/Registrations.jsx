import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getRegistrations, 
  getRegistrationByEnrollmentId, 
  saveRegistrationData, 
  uploadRegistrationDocument,
  deleteRegistrationDocument,
  completeRegistration,
  getPrograms,
  getBatchesByProgram,
  getDocumentDownloadUrl
} from '../../lib/api/registrations';
import { showToast } from '../common/Toast';

const Registrations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');

  const [registrations, setRegistrations] = useState([]);
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [filters, setFilters] = useState({
    program: 'all',
    counselor: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    selected_program_id: '',
    selected_batch: '',
    batch_id: '',
    previous_education: '',
    institution: '',
    year_completed: '',
    grade_results: '',
    payment_method: '',
    payment_status: 'pending',
    payment_amount: '',
    payment_reference: '',
    notes: '',
    special_requirements: ''
  });

  const registrationSteps = [
    { id: 1, name: 'Personal Information', icon: '👤' },
    { id: 2, name: 'Academic Details', icon: '🎓' },
    { id: 3, name: 'Document Upload', icon: '📄' },
    { id: 4, name: 'Payment Information', icon: '💰' },
    { id: 5, name: 'Review & Complete', icon: '✅' }
  ];

  const documentTypes = [
    { value: 'id_card', label: 'National ID Card' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'academic_transcripts', label: 'Academic Transcripts' },
    { value: 'passport_photo', label: 'Passport Size Photo' },
    { value: 'payment_receipt', label: 'Payment Receipt' },
    { value: 'medical_certificate', label: 'Medical Certificate' },
    { value: 'other', label: 'Other Document' }
  ];

  useEffect(() => {
    fetchPrograms();
    if (enrollmentId) {
      fetchRegistrationDetails(enrollmentId);
    } else {
      fetchRegistrations();
    }
  }, [enrollmentId, filters]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await getPrograms();
      if (error) {
        showToast.error(error);
        return;
      }
      setPrograms(data || []);
    } catch (error) {
      showToast.error('Failed to fetch programs');
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await getRegistrations(filters);
      if (error) {
        showToast.error(error);
        return;
      }
      setRegistrations(data || []);
    } catch (error) {
      showToast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationDetails = async (id) => {
    setLoading(true);
    try {
      const { data, error } = await getRegistrationByEnrollmentId(id);
      if (error) {
        showToast.error(error);
        return;
      }
      setActiveRegistration(data);
      
      // Populate form data if registration data exists
      if (data.registration_data && data.registration_data.length > 0) {
        const regData = data.registration_data[0];
        setFormData({
          first_name: regData.first_name || '',
          last_name: regData.last_name || '',
          email: regData.email || '',
          phone: regData.phone || '',
          date_of_birth: regData.date_of_birth || '',
          gender: regData.gender || '',
          address: regData.address || '',
          city: regData.city || '',
          country: regData.country || '',
          selected_program_id: regData.selected_program_id || '',
          selected_batch: regData.selected_batch || '',
          batch_id: regData.batch_id || '',
          previous_education: regData.previous_education || '',
          institution: regData.institution || '',
          year_completed: regData.year_completed || '',
          grade_results: regData.grade_results || '',
          payment_method: regData.payment_method || '',
          payment_status: regData.payment_status || 'pending',
          payment_amount: regData.payment_amount || '',
          payment_reference: regData.payment_reference || '',
          notes: regData.notes || '',
          special_requirements: regData.special_requirements || ''
        });
      }
    } catch (error) {
      showToast.error('Failed to fetch registration details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Fetch batches when program is selected
    if (field === 'selected_program_id' && value) {
      fetchBatchesByProgram(value);
      // Clear batch selection when program changes
      setFormData(prev => ({
        ...prev,
        selected_batch: '',
        batch_id: ''
      }));
    }
    
    // Set batch_id when batch is selected
    if (field === 'selected_batch' && value) {
      const selectedBatch = batches.find(batch => batch.batch_code === value);
      if (selectedBatch) {
        setFormData(prev => ({
          ...prev,
          batch_id: selectedBatch.id
        }));
      }
    }
  };

  const fetchBatchesByProgram = async (programId) => {
    try {
      const { data, error } = await getBatchesByProgram(programId);
      if (error) {
        showToast.error(error);
        return;
      }
      setBatches(data || []);
    } catch (error) {
      showToast.error('Failed to fetch batches');
      setBatches([]);
    }
  };

  const handleSaveStep = async () => {
    if (!activeRegistration) return;
    
    setSaving(true);
    try {
      const { data, error } = await saveRegistrationData(activeRegistration.id, formData);
      if (error) {
        showToast.error(error);
        return;
      }
      showToast.success('Registration data saved successfully');
      
      // Refresh registration details
      await fetchRegistrationDetails(activeRegistration.id);
    } catch (error) {
      showToast.error('Failed to save registration data');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!activeRegistration || !file) return;
    
    setUploading(true);
    try {
      const documentData = {
        document_type: documentType,
        document_name: file.name
      };
      
      const { data, error } = await uploadRegistrationDocument(
        activeRegistration.id, 
        documentData, 
        file
      );
      
      if (error) {
        showToast.error(error);
        return;
      }
      
      showToast.success('Document uploaded successfully');
      
      // Refresh registration details
      await fetchRegistrationDetails(activeRegistration.id);
    } catch (error) {
      showToast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const { error } = await deleteRegistrationDocument(documentId);
      if (error) {
        showToast.error(error);
        return;
      }
      
      showToast.success('Document deleted successfully');
      
      // Refresh registration details
      await fetchRegistrationDetails(activeRegistration.id);
    } catch (error) {
      showToast.error('Failed to delete document');
    }
  };

  const handleCompleteRegistration = async () => {
    if (!activeRegistration) return;
    
    if (!window.confirm('Are you sure you want to complete this registration? This action cannot be undone.')) return;
    
    setSaving(true);
    try {
      // Save current form data first
      await saveRegistrationData(activeRegistration.id, formData);
      
      // Complete registration
      const { data, error } = await completeRegistration(activeRegistration.id);
      if (error) {
        showToast.error(error);
        return;
      }
      
      showToast.success('Registration completed successfully');
      
      // Navigate back to registrations list
      navigate('/registrations');
    } catch (error) {
      showToast.error('Failed to complete registration');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const { data: url, error } = await getDocumentDownloadUrl(document.file_path);
      if (error) {
        showToast.error(error);
        return;
      }
      
      // Open download URL in new tab
      window.open(url, '_blank');
    } catch (error) {
      showToast.error('Failed to download document');
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center overflow-x-auto pb-4">
        {registrationSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => setActiveStep(step.id)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${activeStep === step.id 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : activeStep > step.id
                      ? 'bg-green-100 text-green-600 border-2 border-green-200 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-600 border-2 border-slate-200 hover:bg-slate-200'
                  }
                `}
              >
                {activeStep > step.id ? '✓' : step.icon}
              </button>
              <span className={`
                ml-2 text-sm font-medium whitespace-nowrap
                ${activeStep === step.id ? 'text-blue-600' : 'text-slate-600'}
              `}>
                {step.name}
              </span>
            </div>
            {index < registrationSteps.length - 1 && (
              <div className="w-16 h-[2px] mx-4 bg-slate-200 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth *</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Gender *</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>
    </div>
  );

  const renderAcademicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Selected Program *</label>
          <select
            value={formData.selected_program_id}
            onChange={(e) => handleInputChange('selected_program_id', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            required
          >
            <option value="">Select program</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name} ({program.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Selected Batch</label>
          <select
            value={formData.selected_batch}
            onChange={(e) => handleInputChange('selected_batch', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            disabled={!formData.selected_program_id}
          >
            <option value="">Select batch</option>
            {batches.map(batch => (
              <option key={batch.id} value={batch.batch_code}>
                {batch.name} - {batch.schedule} ({batch.enrolled}/{batch.capacity})
              </option>
            ))}
          </select>
          {!formData.selected_program_id && (
            <p className="text-xs text-slate-500 mt-1">Please select a program first</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Previous Education</label>
          <input
            type="text"
            value={formData.previous_education}
            onChange={(e) => handleInputChange('previous_education', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="e.g., GCE A/L, Diploma"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Institution</label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => handleInputChange('institution', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="Previous school/college"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Year Completed</label>
          <input
            type="text"
            value={formData.year_completed}
            onChange={(e) => handleInputChange('year_completed', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="e.g., 2023"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Grade/Results</label>
          <input
            type="text"
            value={formData.grade_results}
            onChange={(e) => handleInputChange('grade_results', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="e.g., 3A's, GPA 3.5"
          />
        </div>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Document Upload</h4>
        <p className="text-sm text-blue-700">
          Upload required documents for the registration. Accepted formats: PDF, JPG, PNG (Max 5MB each)
        </p>
      </div>

      {/* Document Upload Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map(docType => (
          <div key={docType.value} className="border border-slate-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {docType.label}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    showToast.error('File size must be less than 5MB');
                    return;
                  }
                  handleFileUpload(docType.value, file);
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Uploaded Documents */}
      {activeRegistration?.registration_documents && activeRegistration.registration_documents.length > 0 && (
        <div className="mt-8">
          <h4 className="font-medium text-slate-900 mb-4">Uploaded Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRegistration.registration_documents.map(doc => (
              <div key={doc.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-slate-900 text-sm">{doc.document_name}</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
          <select
            value={formData.payment_method}
            onChange={(e) => handleInputChange('payment_method', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="">Select payment method</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Credit/Debit Card</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status</label>
          <select
            value={formData.payment_status}
            onChange={(e) => handleInputChange('payment_status', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial Payment</option>
            <option value="paid">Fully Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Amount</label>
          <input
            type="number"
            value={formData.payment_amount}
            onChange={(e) => handleInputChange('payment_amount', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Payment Reference</label>
          <input
            type="text"
            value={formData.payment_reference}
            onChange={(e) => handleInputChange('payment_reference', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            placeholder="Receipt/Transaction number"
          />
        </div>
      </div>
    </div>
  );

  const renderReviewAndComplete = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h4 className="font-medium text-slate-900 mb-4">Registration Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-slate-700 mb-2">Personal Information</h5>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Name:</span> {formData.first_name} {formData.last_name}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
              <p><span className="font-medium">Date of Birth:</span> {formData.date_of_birth}</p>
              <p><span className="font-medium">Gender:</span> {formData.gender}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-slate-700 mb-2">Academic Information</h5>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Program:</span> {programs.find(p => p.id === formData.selected_program_id)?.name || 'Not selected'}</p>
              <p><span className="font-medium">Batch:</span> {formData.selected_batch || 'Not specified'}</p>
              <p><span className="font-medium">Previous Education:</span> {formData.previous_education || 'Not specified'}</p>
              <p><span className="font-medium">Institution:</span> {formData.institution || 'Not specified'}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-slate-700 mb-2">Payment Information</h5>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Method:</span> {formData.payment_method || 'Not specified'}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                  formData.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                  formData.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  formData.payment_status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {formData.payment_status}
                </span>
              </p>
              <p><span className="font-medium">Amount:</span> {formData.payment_amount || '0.00'}</p>
              <p><span className="font-medium">Reference:</span> {formData.payment_reference || 'Not provided'}</p>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-slate-700 mb-2">Documents</h5>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Uploaded:</span> {activeRegistration?.registration_documents?.length || 0} documents</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          placeholder="Any additional notes or comments..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
        <textarea
          value={formData.special_requirements}
          onChange={(e) => handleInputChange('special_requirements', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          placeholder="Any special requirements or accommodations needed..."
        />
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
        return renderPaymentInfo();
      case 5:
        return renderReviewAndComplete();
      default:
        return renderPersonalInfo();
    }
  };

  const renderRegistrationForm = () => (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Registration</h1>
            <p className="text-slate-600 mt-1">
              Complete the registration process for {activeRegistration?.student_name}
            </p>
          </div>
          <button
            onClick={() => navigate('/registrations')}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            ← Back to List
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {renderStepContent()}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <div className="flex space-x-3">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSaveStep}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </button>

            {activeStep < registrationSteps.length ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCompleteRegistration}
                disabled={saving}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Completing...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRegistrationsList = () => (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Student Registrations</h1>
        <p className="text-slate-600 mt-1">
          Manage student registrations and complete the registration process
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Program</label>
            <select
              value={filters.program}
              onChange={(e) => setFilters(prev => ({ ...prev, program: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Enrollment Confirmation">Ready for Registration</option>
              <option value="Registration Complete">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchRegistrations}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-600 mt-2">Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {registration.student_name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {registration.registration_data?.[0]?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {registration.programs?.name || 'No program'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {registration.programs?.code || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registration.status === 'Registration Complete'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {registration.users?.full_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(registration.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/registrations?enrollmentId=${registration.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {registration.status === 'Registration Complete' ? 'View' : 'Complete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {activeRegistration ? renderRegistrationForm() : renderRegistrationsList()}
    </div>
  );
};

export default Registrations; 