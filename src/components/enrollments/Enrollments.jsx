import React, { useState, useEffect } from 'react';
import { 
  getEnrollments, 
  getEnrollmentById, 
  updateEnrollmentStep, 
  addEnrollmentNote,
  moveToNextStep,
  moveToPreviousStep
} from '../../lib/api/enrollments';
import { showToast } from '../common/Toast';
import EnrollmentFilters from './EnrollmentFilters';
import EnrollmentStats from './EnrollmentStats';
import EnrollmentStepDetails from './EnrollmentStepDetails';
import { refreshSupabaseAuth } from '../../lib/supabase';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    program: 'all',
    status: 'all',
    counselor: 'all',
    dateRange: 'all'
  });
  const [updatingStep, setUpdatingStep] = useState(null);
  const [addingNote, setAddingNote] = useState(false);
  const [navigatingStep, setNavigatingStep] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  // Fetch enrollments on component mount and when filters change
  useEffect(() => {
    fetchEnrollments();
  }, [filters]);

  // Set the current step as selected when active enrollment changes
  useEffect(() => {
    if (activeEnrollment && activeEnrollment.enrollment_steps) {
      const currentStep = activeEnrollment.enrollment_steps.find(
        step => step.step_number === activeEnrollment.current_step
      );
      if (currentStep) {
        setSelectedStep(currentStep);
      }
    }
  }, [activeEnrollment]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await getEnrollments(filters);
      if (error) {
        showToast.error(error);
        return;
      }
      setEnrollments(data || []);
    } catch (error) {
      showToast.error('Failed to fetch enrollments');
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentDetails = async (enrollmentId) => {
    setLoading(true);
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await getEnrollmentById(enrollmentId);
      if (error) {
        showToast.error(error);
        return;
      }
      setActiveEnrollment(data);
    } catch (error) {
      showToast.error('Failed to fetch enrollment details');
      console.error('Error fetching enrollment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (enrollmentId, stepNumber) => {
    setUpdatingStep(stepNumber);
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await updateEnrollmentStep(enrollmentId, stepNumber, true);
      if (error) {
        showToast.error(error);
        return;
      }
      
      // Update the active enrollment with new data
      setActiveEnrollment(data);
      
      // Also update the enrollment in the list
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === enrollmentId ? {
            ...enrollment,
            status: data.status,
            current_step: data.current_step,
            enrollment_steps: data.enrollment_steps
          } : enrollment
        )
      );
      
      showToast.success(`Step ${stepNumber} completed successfully`);
    } catch (error) {
      showToast.error('Failed to update enrollment step');
      console.error('Error updating enrollment step:', error);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !activeEnrollment) return;
    
    setAddingNote(true);
    try {
      // Refresh auth before API calls
      refreshSupabaseAuth();
      
      const { data, error } = await addEnrollmentNote(activeEnrollment.id, newNote);
      if (error) {
        showToast.error(error);
        return;
      }
      
      // Update the active enrollment with the new note
      setActiveEnrollment(prev => ({
        ...prev,
        notes: [data, ...(prev.notes || [])]
      }));
      
      setNewNote('');
      showToast.success('Note added successfully');
    } catch (error) {
      showToast.error('Failed to add note');
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  const handleNextStep = async () => {
    if (!activeEnrollment) return;
    
    setNavigatingStep(true);
    try {
      const { data, error } = await moveToNextStep(activeEnrollment.id);
      
      if (error) {
        if (error === 'Already at the final step') {
          showToast.info('Already at the final step');
        } else {
          showToast.error(error);
        }
        return;
      }
      
      // Update the active enrollment with new data
      setActiveEnrollment(data);
      
      // Also update the enrollment in the list
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === activeEnrollment.id ? {
            ...enrollment,
            status: data.status,
            current_step: data.current_step,
            enrollment_steps: data.enrollment_steps
          } : enrollment
        )
      );
      
      // Update selected step
      const newCurrentStep = data.enrollment_steps.find(
        step => step.step_number === data.current_step
      );
      if (newCurrentStep) {
        setSelectedStep(newCurrentStep);
      }
      
      showToast.success('Moved to next step successfully');
    } catch (error) {
      showToast.error('Failed to move to next step');
      console.error('Error moving to next step:', error);
    } finally {
      setNavigatingStep(false);
    }
  };

  const handlePreviousStep = async () => {
    if (!activeEnrollment) return;
    
    setNavigatingStep(true);
    try {
      const { data, error } = await moveToPreviousStep(activeEnrollment.id);
      
      if (error) {
        if (error === 'Already at the first step') {
          showToast.info('Already at the first step');
        } else {
          showToast.error(error);
        }
        return;
      }
      
      // Update the active enrollment with new data
      setActiveEnrollment(data);
      
      // Also update the enrollment in the list
      setEnrollments(prev => 
        prev.map(enrollment => 
          enrollment.id === activeEnrollment.id ? {
            ...enrollment,
            status: data.status,
            current_step: data.current_step,
            enrollment_steps: data.enrollment_steps
          } : enrollment
        )
      );
      
      // Update selected step
      const newCurrentStep = data.enrollment_steps.find(
        step => step.step_number === data.current_step
      );
      if (newCurrentStep) {
        setSelectedStep(newCurrentStep);
      }
      
      showToast.success('Moved to previous step successfully');
    } catch (error) {
      showToast.error('Failed to move to previous step');
      console.error('Error moving to previous step:', error);
    } finally {
      setNavigatingStep(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSelectStep = (step) => {
    setSelectedStep(step);
  };

  const renderProgressSteps = (enrollment) => {
    if (!enrollment || !enrollment.enrollment_steps) return null;
    
    // Sort steps by step_number
    const sortedSteps = [...enrollment.enrollment_steps].sort((a, b) => a.step_number - b.step_number);
    
    return (
      <div className="space-y-6">
        <div className="relative">
          {sortedSteps.map((step, index) => {
            const isCurrentStep = enrollment.current_step === step.step_number;
            const isSelected = selectedStep && selectedStep.id === step.id;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-start mb-4 last:mb-0 ${index < sortedSteps.length - 1 ? 'pb-4' : ''} ${
                  isSelected ? 'bg-slate-50 rounded-lg p-2 -m-2' : ''
                }`}
                onClick={() => handleSelectStep(step)}
                role="button"
                tabIndex={0}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step.completed 
                    ? 'bg-green-100 text-green-600 border-2 border-green-200' 
                    : isCurrentStep
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
                  }
                `}>
                  {step.completed ? '✓' : step.step_number}
                </div>
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <div>
                    <span className={`block text-sm font-medium ${
                      step.completed 
                        ? 'text-green-600' 
                        : isCurrentStep
                          ? 'text-blue-600'
                          : 'text-slate-600'
                    }`}>
                      {step.step_name}
                    </span>
                    {step.completion_date && (
                      <span className="text-xs text-slate-500">
                        {new Date(step.completion_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {isCurrentStep && !step.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepComplete(enrollment.id, step.step_number);
                      }}
                      disabled={updatingStep === step.step_number}
                      className={`px-3 py-1 text-xs rounded-lg ${
                        updatingStep === step.step_number
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } transition-colors`}
                    >
                      {updatingStep === step.step_number ? 'Updating...' : 'Complete'}
                    </button>
                  )}
                </div>
                {index < sortedSteps.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-slate-200 -translate-x-1/2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Step Details */}
        {selectedStep && (
          <div className="mt-6">
            <EnrollmentStepDetails 
              step={selectedStep} 
              isActive={activeEnrollment.current_step === selectedStep.step_number}
            />
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePreviousStep}
            disabled={navigatingStep || (activeEnrollment && activeEnrollment.current_step <= 1)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              navigatingStep || (activeEnrollment && activeEnrollment.current_step <= 1)
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Step
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={navigatingStep || (activeEnrollment && activeEnrollment.current_step >= 6)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              navigatingStep || (activeEnrollment && activeEnrollment.current_step >= 6)
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            Next Step
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderEnrollmentList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (enrollments.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-500">No enrollments found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrollments.map(enrollment => (
          <div 
            key={enrollment.id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => fetchEnrollmentDetails(enrollment.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-800">{enrollment.student_name}</h3>
                <span className="text-sm text-slate-500">{enrollment.id}</span>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                {enrollment.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Program:</span>
                <span className="text-slate-700">{enrollment.programs?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Batch:</span>
                <span className="text-slate-700">{enrollment.batch || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Counselor:</span>
                <span className="text-slate-700">{enrollment.users?.full_name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Updated:</span>
                <span className="text-slate-700">
                  {new Date(enrollment.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Simple progress bar for list view */}
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(enrollment.current_step / 6) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Step {enrollment.current_step} of 6</span>
              <span>{Math.round((enrollment.current_step / 6) * 100)}% Complete</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEnrollmentDetails = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!activeEnrollment) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{activeEnrollment.student_name}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {activeEnrollment.programs?.name || 'No Program'} • {activeEnrollment.batch || 'No Batch'}
              </p>
            </div>
            <button 
              className="px-4 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              onClick={() => setActiveEnrollment(null)}
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">Enrollment Progress</h3>
            {renderProgressSteps(activeEnrollment)}
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">Enrollment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Enrollment ID</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.id}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Status</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.status}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Counselor</span>
                <span className="text-base font-medium text-slate-800">{activeEnrollment.users?.full_name || '-'}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <span className="block text-sm text-slate-500 mb-1">Created At</span>
                <span className="text-base font-medium text-slate-800">
                  {new Date(activeEnrollment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Notes & Updates</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <button 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    addingNote || !newNote.trim()
                      ? 'bg-blue-300 text-white cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                >
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {activeEnrollment.notes && activeEnrollment.notes.length > 0 ? (
                activeEnrollment.notes.map(note => (
                  <div key={note.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">{note.author}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No notes available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Enrollment Management</h1>
        <p className="text-slate-500">Track and manage student enrollment progress</p>
      </div>

      {!activeEnrollment && <EnrollmentStats enrollments={enrollments} />}

      <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <EnrollmentFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        <div>
          {activeEnrollment ? renderEnrollmentDetails() : renderEnrollmentList()}
        </div>
      </div>
    </div>
  );
};

export default Enrollments; 