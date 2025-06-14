import { supabase, refreshSupabaseAuth } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get all registrations with filtering
export const getRegistrations = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    let query = supabase
      .from('enrollments')
      .select(`
        id,
        inquiry_id,
        student_name,
        program_id,
        counselor_id,
        status,
        current_step,
        is_registered,
        created_at,
        updated_at,
        created_by,
        updated_by,
        programs:program_id (
          id,
          name,
          code,
          duration
        ),
        users:counselor_id (
          id,
          full_name,
          email
        ),
        registration_data (
          id,
          enrollment_id,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          gender,
          address,
          city,
          country,
          selected_program_id,
          selected_batch,
          batch_id,
          previous_education,
          institution,
          year_completed,
          grade_results,
          payment_method,
          payment_status,
          payment_amount,
          payment_reference,
          notes,
          special_requirements,
          created_at,
          updated_at,
          created_by,
          updated_by,
          selected_program:selected_program_id (
            id,
            name,
            code
          )
        ),
        registration_documents (
          id,
          enrollment_id,
          document_type,
          document_name,
          file_path,
          file_size,
          mime_type,
          uploaded_by,
          uploaded_at
        ),
        enrollment_steps (
          id,
          enrollment_id,
          step_number,
          step_name,
          completed,
          completion_date,
          created_at,
          updated_at
        )
      `);

    // Apply filters
    if (filters.program && filters.program !== 'all') {
      query = query.eq('program_id', filters.program);
    }
    if (filters.counselor && filters.counselor !== 'all') {
      query = query.eq('counselor_id', filters.counselor);
    }
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'ready_for_registration') {
        query = query.eq('status', 'Enrollment Confirmation').eq('current_step', 6).is('is_registered', null);
      } else {
        query = query.eq('status', filters.status);
      }
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

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getRegistrations:', error);
    return { data: null, error: error.message };
  }
};

// Get registration by enrollment ID
export const getRegistrationByEnrollmentId = async (enrollmentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        inquiry_id,
        student_name,
        program_id,
        counselor_id,
        status,
        current_step,
        is_registered,
        created_at,
        updated_at,
        created_by,
        updated_by,
        programs:program_id (
          id,
          name,
          code,
          duration
        ),
        users:counselor_id (
          id,
          full_name,
          email
        ),
        registration_data (
          id,
          enrollment_id,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          gender,
          address,
          city,
          country,
          selected_program_id,
          selected_batch,
          batch_id,
          previous_education,
          institution,
          year_completed,
          grade_results,
          payment_method,
          payment_status,
          payment_amount,
          payment_reference,
          notes,
          special_requirements,
          created_at,
          updated_at,
          created_by,
          updated_by,
          selected_program:selected_program_id (
            id,
            name,
            code
          )
        ),
        registration_documents (
          id,
          enrollment_id,
          document_type,
          document_name,
          file_path,
          file_size,
          mime_type,
          uploaded_by,
          uploaded_at
        ),
        enrollment_steps (
          id,
          enrollment_id,
          step_number,
          step_name,
          completed,
          completion_date,
          created_at,
          updated_at
        )
      `)
      .eq('id', enrollmentId)
      .single();

    if (error) {
      console.error('Error fetching registration:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getRegistrationByEnrollmentId:', error);
    return { data: null, error: error.message };
  }
};

// Save registration data
export const saveRegistrationData = async (enrollmentId, registrationData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Prepare data for saving - ensure proper data types
    const dataToSave = {
      enrollment_id: enrollmentId,
      first_name: registrationData.first_name || null,
      last_name: registrationData.last_name || null,
      email: registrationData.email || null,
      phone: registrationData.phone || null,
      date_of_birth: registrationData.date_of_birth || null,
      gender: registrationData.gender || null,
      address: registrationData.address || null,
      city: registrationData.city || null,
      country: registrationData.country || null,
      selected_program_id: registrationData.selected_program_id || null,
      selected_batch: registrationData.selected_batch || null,
      batch_id: registrationData.batch_id || null,
      previous_education: registrationData.previous_education || null,
      institution: registrationData.institution || null,
      year_completed: registrationData.year_completed || null,
      grade_results: registrationData.grade_results || null,
      payment_method: registrationData.payment_method || null,
      payment_status: registrationData.payment_status || 'pending',
      payment_amount: registrationData.payment_amount ? parseFloat(registrationData.payment_amount) : null,
      payment_reference: registrationData.payment_reference || null,
      notes: registrationData.notes || null,
      special_requirements: registrationData.special_requirements || null,
      created_by: user.email,
      updated_by: user.email
    };

    // Use upsert to insert or update
    const { data, error } = await supabase
      .from('registration_data')
      .upsert(dataToSave, { 
        onConflict: 'enrollment_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving registration data:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in saveRegistrationData:', error);
    return { data: null, error: error.message };
  }
};

// Upload registration document
export const uploadRegistrationDocument = async (enrollmentId, documentData, file) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${enrollmentId}_${documentData.document_type}_${Date.now()}.${fileExt}`;
    const filePath = `registration-documents/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    // Save document metadata to database
    const documentRecord = {
      enrollment_id: enrollmentId,
      document_type: documentData.document_type,
      document_name: documentData.document_name || file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.email
    };

    const { data, error } = await supabase
      .from('registration_documents')
      .insert([documentRecord])
      .select()
      .single();

    if (error) {
      console.error('Error saving document metadata:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in uploadRegistrationDocument:', error);
    return { data: null, error: error.message };
  }
};

// Delete registration document
export const deleteRegistrationDocument = async (documentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Get document details first
    const { data: document, error: fetchError } = await supabase
      .from('registration_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      console.error('Error fetching document:', fetchError);
      throw fetchError;
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete document record from database
    const { error } = await supabase
      .from('registration_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document record:', error);
      throw error;
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Error in deleteRegistrationDocument:', error);
    return { data: null, error: error.message };
  }
};

// Complete registration process
export const completeRegistration = async (enrollmentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Update enrollment to mark as registered
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        is_registered: true,
        status: 'Registered',
        updated_by: user.email
      })
      .eq('id', enrollmentId)
      .select(`
        id,
        inquiry_id,
        student_name,
        program_id,
        counselor_id,
        status,
        current_step,
        is_registered,
        created_at,
        updated_at,
        created_by,
        updated_by,
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
        registration_data (
          id,
          enrollment_id,
          first_name,
          last_name,
          email,
          phone,
          date_of_birth,
          gender,
          address,
          city,
          country,
          selected_program_id,
          selected_batch,
          batch_id,
          previous_education,
          institution,
          year_completed,
          grade_results,
          payment_method,
          payment_status,
          payment_amount,
          payment_reference,
          notes,
          special_requirements,
          created_at,
          updated_at,
          created_by,
          updated_by
        ),
        registration_documents (
          id,
          enrollment_id,
          document_type,
          document_name,
          file_path,
          file_size,
          mime_type,
          uploaded_by,
          uploaded_at
        ),
        enrollment_steps (
          id,
          enrollment_id,
          step_number,
          step_name,
          completed,
          completion_date,
          created_at,
          updated_at
        )
      `)
      .single();

    if (error) {
      console.error('Error completing registration:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in completeRegistration:', error);
    return { data: null, error: error.message };
  }
};

// Get all programs for dropdown
export const getPrograms = async () => {
  try {
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getPrograms:', error);
    return { data: null, error: error.message };
  }
};

// Get document download URL
export const getDocumentDownloadUrl = async (filePath) => {
  try {
    refreshSupabaseAuth();

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating download URL:', error);
      throw error;
    }

    return { data: data.signedUrl, error: null };
  } catch (error) {
    console.error('Error in getDocumentDownloadUrl:', error);
    return { data: null, error: error.message };
  }
};

// Get batches by program
export const getBatchesByProgram = async (programId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code
        )
      `)
      .eq('program_id', programId)
      .in('status', ['Open', 'Upcoming'])
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getBatchesByProgram:', error);
    return { data: null, error: error.message };
  }
}; 