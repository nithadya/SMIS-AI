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

// Get student payment history by enrollment_id
export const getStudentPayments = async (studentId) => {
  try {
    // First get the student's enrollment_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('enrollment_id')
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('Error fetching student:', studentError);
      throw studentError;
    }

    if (!student.enrollment_id) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('student_payments')
      .select('*')
      .eq('enrollment_id', student.enrollment_id)
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

// Get student payment summary and history by enrollment_id
export const getStudentPaymentsByEnrollment = async (enrollmentId) => {
  try {
    const { data, error } = await supabase
      .from('student_payments')
      .select(`
        *,
        enrollments!inner(
          id,
          student_name,
          program_id,
          programs(id, name, code)
        )
      `)
      .eq('enrollment_id', enrollmentId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching enrollment payments:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentPaymentsByEnrollment:', error);
    return { data: null, error: error.message };
  }
};

// Get student payment summary including fee structure - FIXED VERSION
export const getStudentPaymentSummaryByEnrollment = async (studentId) => {
  try {
    // First get the student with their enrollment information
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        last_name,
        email,
        enrollment_id,
        program_id,
        programs:program_id (
          id,
          name,
          code
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('Error fetching student:', studentError);
      throw studentError;
    }

    if (!student.enrollment_id) {
      // If no enrollment_id, return basic structure with zeros
      return {
        data: {
          student,
          totalRequired: 0,
          totalPaid: 0,
          totalDue: 0,
          registrationFee: 0,
          programFee: 0,
          registrationPaid: 0,
          programPaid: 0,
          payments: []
        },
        error: null
      };
    }

    // Get fee structure for the program
    const { data: feeStructure, error: feeError } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('program_id', student.program_id);

    // If no fee structure, use defaults
    const registrationFee = feeStructure?.find(fee => fee.fee_type === 'Registration Fee')?.amount || 50000;
    const programFee = feeStructure?.find(fee => fee.fee_type === 'Program Fee')?.amount || 0;

    // Get all payments for this enrollment
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select('*')
      .eq('enrollment_id', student.enrollment_id)
      .order('created_at', { ascending: false });

    // Calculate totals (even if payments query fails)
    const validPayments = payments || [];
    const completedPayments = validPayments.filter(p => p.payment_status === 'Completed');
    
    const registrationPaid = completedPayments
      .filter(p => p.payment_type === 'Registration Fee')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const programPaid = completedPayments
      .filter(p => p.payment_type === 'Program Fee')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const totalRequired = parseFloat(registrationFee) + parseFloat(programFee);
    const totalPaid = registrationPaid + programPaid;
    const totalDue = Math.max(0, totalRequired - totalPaid);

    return {
      data: {
        student,
        totalRequired,
        totalPaid,
        totalDue,
        registrationFee: parseFloat(registrationFee),
        programFee: parseFloat(programFee),
        registrationPaid,
        programPaid,
        payments: validPayments.map(payment => ({
          id: payment.id,
          payment_date: payment.payment_date,
          created_at: payment.created_at,
          amount: parseFloat(payment.amount || 0),
          payment_type: payment.payment_type,
          payment_status: payment.payment_status,
          payment_method: payment.payment_method,
          payment_reference: payment.payment_reference,
          description: payment.description
        }))
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getStudentPaymentSummaryByEnrollment:', error);
    return { 
      data: {
        student: null,
        totalRequired: 0,
        totalPaid: 0,
        totalDue: 0,
        registrationFee: 0,
        programFee: 0,
        registrationPaid: 0,
        programPaid: 0,
        payments: []
      }, 
      error: error.message 
    };
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
      enrollment_id: paymentData.enrollment_id,
      payment_type: paymentData.payment_type,
      amount: parseFloat(paymentData.amount),
      payment_method: paymentData.payment_method,
      payment_status: 'Completed',
      payment_date: new Date().toISOString(),
      payment_reference: paymentData.payment_reference || null,
      description: paymentData.description || null,
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