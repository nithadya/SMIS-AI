import { supabase } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get all students with filtering and search
export const getStudents = async (filters = {}) => {
  try {
    let query = supabase
      .from('students')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        ),
        batches:batch_id (
          id,
          batch_code,
          name,
          start_date,
          end_date
        ),
        enrollments:enrollment_id (
          id,
          status,
          created_at
        )
      `);

    // Apply filters
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    if (filters.program && filters.program !== 'all') {
      query = query.eq('program_id', filters.program);
    }
    
    if (filters.batch && filters.batch !== 'all') {
      query = query.eq('batch_id', filters.batch);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('academic_status', filters.status);
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
        query = query.gte('enrollment_date', startDate.toISOString().split('T')[0]);
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudents:', error);
    return { data: null, error: error.message };
  }
};

// Get student by ID with full details
export const getStudentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration,
          description
        ),
        batches:batch_id (
          id,
          batch_code,
          name,
          start_date,
          end_date,
          schedule,
          time_slot,
          lecturer
        ),
        enrollments:enrollment_id (
          id,
          status,
          current_step,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentById:', error);
    return { data: null, error: error.message };
  }
};

// Get student by student ID (e.g., BIT-01)
export const getStudentByStudentId = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration,
          description
        ),
        batches:batch_id (
          id,
          batch_code,
          name,
          start_date,
          end_date,
          schedule,
          time_slot,
          lecturer
        ),
        enrollments:enrollment_id (
          id,
          status,
          current_step,
          created_at,
          updated_at
        )
      `)
      .eq('student_id', studentId)
      .single();

    if (error) {
      console.error('Error fetching student by student ID:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentByStudentId:', error);
    return { data: null, error: error.message };
  }
};

// Get student payment history
export const getStudentPayments = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('student_payments')
      .select('*')
      .eq('student_id', studentId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching student payments:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentPayments:', error);
    return { data: null, error: error.message };
  }
};

// Get student documents
export const getStudentDocuments = async (enrollmentId) => {
  try {
    const { data, error } = await supabase
      .from('registration_documents')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching student documents:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentDocuments:', error);
    return { data: null, error: error.message };
  }
};

// Update student information
export const updateStudent = async (id, studentData) => {
  try {
    const user = getCurrentUser();
    
    const dataToUpdate = {
      ...studentData,
      updated_at: new Date().toISOString(),
      updated_by: user?.email || 'system'
    };

    const { data, error } = await supabase
      .from('students')
      .update(dataToUpdate)
      .eq('id', id)
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        ),
        batches:batch_id (
          id,
          batch_code,
          name,
          start_date,
          end_date
        )
      `)
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateStudent:', error);
    return { data: null, error: error.message };
  }
};

// Add payment record
export const addStudentPayment = async (paymentData) => {
  try {
    const user = getCurrentUser();
    
    const dataToInsert = {
      ...paymentData,
      created_at: new Date().toISOString(),
      created_by: user?.email || 'system'
    };

    const { data, error } = await supabase
      .from('student_payments')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error adding payment:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in addStudentPayment:', error);
    return { data: null, error: error.message };
  }
};

// Update payment record
export const updateStudentPayment = async (id, paymentData) => {
  try {
    const dataToUpdate = {
      ...paymentData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('student_payments')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateStudentPayment:', error);
    return { data: null, error: error.message };
  }
};

// Delete payment record
export const deleteStudentPayment = async (id) => {
  try {
    const { error } = await supabase
      .from('student_payments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteStudentPayment:', error);
    return { error: error.message };
  }
};

// Get student statistics
export const getStudentStats = async () => {
  try {
    // Get total students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Get active students
    const { count: activeStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('academic_status', 'Active');

    // Get graduated students
    const { count: graduatedStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('academic_status', 'Graduated');

    // Get students by program
    const { data: programStats } = await supabase
      .from('students')
      .select(`
        program_id,
        programs:program_id (name, code)
      `);

    const programCounts = programStats?.reduce((acc, student) => {
      const programName = student.programs?.name || 'Unknown';
      acc[programName] = (acc[programName] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      data: {
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        graduatedStudents: graduatedStudents || 0,
        programCounts
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    return { data: null, error: error.message };
  }
};

// Search students (for quick search)
export const searchStudents = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        last_name,
        email,
        programs:program_id (name, code),
        batches:batch_id (batch_code)
      `)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error('Error searching students:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in searchStudents:', error);
    return { data: null, error: error.message };
  }
}; 