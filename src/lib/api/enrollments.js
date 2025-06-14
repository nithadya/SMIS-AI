import { supabase, refreshSupabaseAuth } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Create a new enrollment from an inquiry
export const createEnrollmentFromInquiry = async (inquiryId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    // Get the inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code
        ),
        users:counselor_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', inquiryId)
      .single();

    if (inquiryError) {
      console.error('Inquiry fetch error:', inquiryError);
      throw inquiryError;
    }
    if (!inquiry) throw new Error('Inquiry not found');

    // Check if enrollment already exists for this inquiry
    const { data: existingEnrollment, error: existingError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('inquiry_id', inquiryId)
      .single();

    if (existingEnrollment) {
      console.log('Enrollment already exists for this inquiry:', existingEnrollment.id);
      return { data: existingEnrollment, error: null };
    }

    // Create enrollment first
    const enrollmentData = {
      inquiry_id: inquiryId,
      student_name: inquiry.name,
      program_id: inquiry.program_id,
      counselor_id: inquiry.counselor_id,
      status: 'Initial Inquiry',
      current_step: 1,
      created_by: user.email
    };

    console.log('Creating enrollment with data:', enrollmentData);

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert([enrollmentData])
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment creation error:', enrollmentError);
      throw enrollmentError;
    }

    // Check if enrollment steps already exist
    const { data: existingSteps, error: stepsCheckError } = await supabase
      .from('enrollment_steps')
      .select('step_number')
      .eq('enrollment_id', enrollment.id);

    if (stepsCheckError) {
      console.error('Steps check error:', stepsCheckError);
      throw stepsCheckError;
    }

    // Only create steps if they don't exist
    if (!existingSteps || existingSteps.length === 0) {
      // Create the 6 enrollment steps
      const steps = [
        { step_number: 1, step_name: 'Initial Inquiry', completed: true, completion_date: new Date().toISOString() },
        { step_number: 2, step_name: 'Counseling Session', completed: false },
        { step_number: 3, step_name: 'Document Submission', completed: false },
        { step_number: 4, step_name: 'Document Verification', completed: false },
        { step_number: 5, step_name: 'Payment Processing', completed: false },
        { step_number: 6, step_name: 'Enrollment Confirmation', completed: false }
      ];

      const stepsToInsert = steps.map(step => ({
        ...step,
        enrollment_id: enrollment.id
      }));

      console.log('Creating enrollment steps:', stepsToInsert);

      const { error: stepsError } = await supabase
        .from('enrollment_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        console.error('Steps creation error:', stepsError);
        throw stepsError;
      }
    } else {
      console.log('Enrollment steps already exist, skipping creation');
    }

    // Add an initial note
    const noteData = {
      enrollment_id: enrollment.id,
      content: `Enrollment created from inquiry. Student interested in ${inquiry.programs?.name || 'a program'}.`,
      author: user.full_name
    };

    console.log('Creating enrollment note:', noteData);

    const { error: noteError } = await supabase
      .from('enrollment_notes')
      .insert([noteData]);

    if (noteError) {
      console.error('Note creation error:', noteError);
      throw noteError;
    }

    // Update the inquiry status to 'completed'
    console.log('Updating inquiry status to completed');
    
    const { error: updateInquiryError } = await supabase
      .from('inquiries')
      .update({ status: 'completed' })
      .eq('id', inquiryId);

    if (updateInquiryError) {
      console.error('Inquiry update error:', updateInquiryError);
      throw updateInquiryError;
    }

    return { data: enrollment, error: null };
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return { data: null, error: error.message };
  }
};

// Get all enrollments with filtering
export const getEnrollments = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    let query = supabase
      .from('enrollments')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code
        ),
        users:counselor_id (
          id,
          full_name,
          email
        ),
        enrollment_steps (
          id,
          step_number,
          step_name,
          completed,
          completion_date
        )
      `);

    // Apply filters
    if (filters.program && filters.program !== 'all') {
      query = query.eq('program_id', filters.program);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.counselor && filters.counselor !== 'all') {
      query = query.eq('counselor_id', filters.counselor);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    // Order by created_at desc to show newest first
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Filter data based on user role
    let filteredData = data;
    if (user.role === 'counselor') {
      filteredData = data.filter(enrollment => 
        enrollment.counselor_id === user.id || 
        enrollment.created_by === user.email
      );
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return { data: null, error: error.message };
  }
};

// Get a single enrollment by ID
export const getEnrollmentById = async (id) => {
  try {
    // Refresh auth before making API calls
    refreshSupabaseAuth();
    
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code
        ),
        users:counselor_id (
          id,
          full_name,
          email
        ),
        enrollment_steps (
          id,
          step_number,
          step_name,
          completed,
          completion_date
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get enrollment notes
    const { data: notes, error: notesError } = await supabase
      .from('enrollment_notes')
      .select('*')
      .eq('enrollment_id', id)
      .order('created_at', { ascending: false });

    if (notesError) throw notesError;

    return { 
      data: { 
        ...data, 
        notes: notes || [] 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return { data: null, error: error.message };
  }
};

// Update enrollment step
export const updateEnrollmentStep = async (enrollmentId, stepNumber, completed) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    // Update the step
    const { data: step, error: stepError } = await supabase
      .from('enrollment_steps')
      .update({ 
        completed,
        completion_date: completed ? new Date().toISOString() : null,
      })
      .eq('enrollment_id', enrollmentId)
      .eq('step_number', stepNumber)
      .select()
      .single();

    if (stepError) throw stepError;

    // If marking as completed, update the enrollment status and current step
    if (completed) {
      // Get the step name
      const stepNames = [
        'Initial Inquiry',
        'Counseling Session',
        'Document Submission',
        'Document Verification',
        'Payment Processing',
        'Enrollment Confirmation'
      ];
      
      const currentStepName = stepNames[stepNumber - 1];
      const nextStep = stepNumber < 6 ? stepNumber + 1 : 6;
      const nextStepName = stepNames[nextStep - 1];
      
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({ 
          status: nextStepName,
          current_step: nextStep,
          updated_by: user.email
        })
        .eq('id', enrollmentId);

      if (enrollmentError) throw enrollmentError;

      // Add a note about the step completion
      const { error: noteError } = await supabase
        .from('enrollment_notes')
        .insert([
          {
            enrollment_id: enrollmentId,
            content: `Completed step: ${currentStepName}. Moving to ${nextStepName}.`,
            author: user.full_name
          }
        ]);

      if (noteError) throw noteError;
    }

    // Get the updated enrollment with all steps
    const { data: enrollment, error: getError } = await getEnrollmentById(enrollmentId);
    
    if (getError) throw getError;

    return { data: enrollment, error: null };
  } catch (error) {
    console.error('Error updating enrollment step:', error);
    return { data: null, error: error.message };
  }
};

// Move to next step in enrollment process
export const moveToNextStep = async (enrollmentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    // Get the current enrollment
    const { data: enrollment, error: getError } = await getEnrollmentById(enrollmentId);
    if (getError) throw getError;
    if (!enrollment) throw new Error('Enrollment not found');

    const currentStep = enrollment.current_step;
    
    // Check if we're already at the last step
    if (currentStep >= 6) {
      return { data: enrollment, error: 'Already at the final step' };
    }

    // Get the step name
    const stepNames = [
      'Initial Inquiry',
      'Counseling Session',
      'Document Submission',
      'Document Verification',
      'Payment Processing',
      'Enrollment Confirmation'
    ];
    
    const nextStep = currentStep + 1;
    const nextStepName = stepNames[nextStep - 1];
    
    // Update the enrollment to move to the next step
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({ 
        status: nextStepName,
        current_step: nextStep,
        updated_by: user.email
      })
      .eq('id', enrollmentId);

    if (enrollmentError) throw enrollmentError;

    // Add a note about moving to the next step
    const { error: noteError } = await supabase
      .from('enrollment_notes')
      .insert([
        {
          enrollment_id: enrollmentId,
          content: `Moved to next step: ${nextStepName}.`,
          author: user.full_name
        }
      ]);

    if (noteError) throw noteError;

    // Get the updated enrollment
    const { data: updatedEnrollment, error: updatedError } = await getEnrollmentById(enrollmentId);
    if (updatedError) throw updatedError;

    return { data: updatedEnrollment, error: null };
  } catch (error) {
    console.error('Error moving to next step:', error);
    return { data: null, error: error.message };
  }
};

// Move to previous step in enrollment process
export const moveToPreviousStep = async (enrollmentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    // Get the current enrollment
    const { data: enrollment, error: getError } = await getEnrollmentById(enrollmentId);
    if (getError) throw getError;
    if (!enrollment) throw new Error('Enrollment not found');

    const currentStep = enrollment.current_step;
    
    // Check if we're already at the first step
    if (currentStep <= 1) {
      return { data: enrollment, error: 'Already at the first step' };
    }

    // Get the step name
    const stepNames = [
      'Initial Inquiry',
      'Counseling Session',
      'Document Submission',
      'Document Verification',
      'Payment Processing',
      'Enrollment Confirmation'
    ];
    
    const previousStep = currentStep - 1;
    const previousStepName = stepNames[previousStep - 1];
    
    // Update the enrollment to move to the previous step
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({ 
        status: previousStepName,
        current_step: previousStep,
        updated_by: user.email
      })
      .eq('id', enrollmentId);

    if (enrollmentError) throw enrollmentError;

    // Add a note about moving to the previous step
    const { error: noteError } = await supabase
      .from('enrollment_notes')
      .insert([
        {
          enrollment_id: enrollmentId,
          content: `Moved back to previous step: ${previousStepName}.`,
          author: user.full_name
        }
      ]);

    if (noteError) throw noteError;

    // Get the updated enrollment
    const { data: updatedEnrollment, error: updatedError } = await getEnrollmentById(enrollmentId);
    if (updatedError) throw updatedError;

    return { data: updatedEnrollment, error: null };
  } catch (error) {
    console.error('Error moving to previous step:', error);
    return { data: null, error: error.message };
  }
};

// Add enrollment note
export const addEnrollmentNote = async (enrollmentId, content) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('enrollment_notes')
      .insert([
        {
          enrollment_id: enrollmentId,
          content,
          author: user.full_name
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding enrollment note:', error);
    return { data: null, error: error.message };
  }
}; 