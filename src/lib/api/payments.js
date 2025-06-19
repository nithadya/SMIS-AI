import { supabase } from '../supabase.js';

// Get all payment plans for students
export const getPaymentPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_plans')
      .select(`
        *,
        students(id, first_name, last_name, email, enrollment_id),
        programs(id, name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment plans:', error);
    throw error;
  }
};

// Get payment transactions
export const getPaymentTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        students(id, first_name, last_name, email),
        payment_plans(id, total_amount, paid_amount, remaining_amount)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    throw error;
  }
};

// Get student payments with enrollment details
export const getStudentPayments = async () => {
  try {
    const { data, error } = await supabase
      .from('student_payments')
      .select(`
        id,
        payment_type,
        amount,
        payment_method,
        payment_reference,
        payment_date,
        payment_status,
        description,
        receipt_number,
        created_at,
        updated_at,
        created_by,
        enrollments!inner(
          id, 
          student_name, 
          program_id,
          status,
          programs(id, name, code)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Format the data to include student name at top level for easier access
    const formattedData = (data || []).map(payment => ({
      ...payment,
      student_name: payment.enrollments?.student_name || 'Unknown Student',
      program_name: payment.enrollments?.programs?.name || 'Unknown Program'
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching student payments:', error);
    throw error;
  }
};

// Get pending payments with detailed calculation - FIXED VERSION
export const getPendingPayments = async () => {
  try {
    // First, get all enrollments with their programs
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_name,
        program_id,
        status,
        created_at,
        programs(id, name, code)
      `);

    if (enrollmentsError) throw enrollmentsError;

    // Get all fee structures
    const { data: feeStructures, error: feeError } = await supabase
      .from('fee_structure')
      .select('*');

    if (feeError) throw feeError;

    // Get all student payments
    const { data: allPayments, error: paymentsError } = await supabase
      .from('student_payments')
      .select('*')
      .eq('payment_status', 'Completed');

    if (paymentsError) throw paymentsError;

    const pendingPayments = [];

    for (const enrollment of enrollments) {
      // Get fee structure for this program
      const programFees = feeStructures.filter(fee => fee.program_id === enrollment.program_id);
      
      // Calculate required amounts
      const registrationFee = programFees.find(fee => fee.fee_type === 'Registration Fee')?.amount || 50000;
      const programFee = programFees.find(fee => fee.fee_type === 'Program Fee')?.amount || 0;
      
      // Get payments for this enrollment
      const enrollmentPayments = allPayments.filter(payment => payment.enrollment_id === enrollment.id);
      
      // Calculate paid amounts
      const registrationPaid = enrollmentPayments
        .filter(payment => payment.payment_type === 'Registration Fee')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
      
      const programPaid = enrollmentPayments
        .filter(payment => payment.payment_type === 'Program Fee')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      // Calculate pending amounts
      const pendingRegistration = Math.max(0, parseFloat(registrationFee) - registrationPaid);
      const pendingProgram = Math.max(0, parseFloat(programFee) - programPaid);
      const totalPending = pendingRegistration + pendingProgram;
      const totalPaid = registrationPaid + programPaid;
      const totalRequired = parseFloat(registrationFee) + parseFloat(programFee);

      // Include if there are pending payments OR if registration is incomplete
      const isRegistrationIncomplete = registrationPaid < parseFloat(registrationFee);
      
      if (totalPending > 0 || isRegistrationIncomplete) {
        pendingPayments.push({
          id: enrollment.id,
          student_name: enrollment.student_name,
          program: enrollment.programs?.name || 'Unknown Program',
          program_code: enrollment.programs?.code || '',
          registration_fee: parseFloat(registrationFee),
          program_fee: parseFloat(programFee),
          total_required: totalRequired,
          total_paid: totalPaid,
          registration_paid: registrationPaid,
          program_paid: programPaid,
          pending_registration: pendingRegistration,
          pending_program: pendingProgram,
          total_pending: totalPending,
          enrollment_status: enrollment.status,
          created_at: enrollment.created_at,
          is_registration_incomplete: isRegistrationIncomplete,
          payment_count: enrollmentPayments.length
        });
      }
    }

    return pendingPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error calculating pending payments:', error);
    throw error;
  }
};

// Create a new payment transaction - FIXED VERSION
export const createPaymentTransaction = async (paymentData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Validate required fields
    if (!paymentData.enrollment_id || !paymentData.amount) {
      throw new Error('Enrollment ID and amount are required');
    }

    const { data, error } = await supabase
      .from('student_payments')
      .insert([{
        enrollment_id: paymentData.enrollment_id,
        payment_type: paymentData.payment_type || 'Registration Fee',
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method || 'Cash',
        payment_reference: paymentData.payment_reference,
        payment_status: paymentData.payment_status || 'Completed',
        description: paymentData.description,
        receipt_number: paymentData.receipt_number,
        created_by: user.email || 'system',
        payment_date: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const { data, error } = await supabase
      .from('student_payments')
      .update({ 
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Get payment summary for a student - FIXED VERSION
export const getStudentPaymentSummary = async (enrollmentId) => {
  try {
    console.log('Getting payment summary for enrollment ID:', enrollmentId);
    
    if (!enrollmentId) {
      throw new Error('Enrollment ID is required');
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_name,
        program_id,
        programs(id, name, code)
      `)
      .eq('id', enrollmentId)
      .single();

    if (enrollmentError) {
      console.error('Error fetching enrollment:', enrollmentError);
      throw enrollmentError;
    }

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    console.log('Found enrollment:', enrollment);

    // Get fee structure for the program
    const { data: feeStructure, error: feeError } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('program_id', enrollment.program_id);

    if (feeError) {
      console.error('Error fetching fee structure:', feeError);
      throw feeError;
    }

    // Get all payments for this enrollment
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .order('created_at', { ascending: false });

    if (paymentsError) throw paymentsError;

    const registrationFeeRecord = feeStructure.find(fee => fee.fee_type === 'Registration Fee');
    const programFeeRecord = feeStructure.find(fee => fee.fee_type === 'Program Fee');
    
    const registrationFee = registrationFeeRecord ? parseFloat(registrationFeeRecord.amount) : 50000;
    const programFee = programFeeRecord ? parseFloat(programFeeRecord.amount) : 0;

    const completedPayments = (payments || []).filter(p => p.payment_status === 'Completed');
    
    const registrationPaid = completedPayments
      .filter(p => p.payment_type === 'Registration Fee')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const programPaid = completedPayments
      .filter(p => p.payment_type === 'Program Fee')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const totalPaid = registrationPaid + programPaid;
    const totalRequired = registrationFee + programFee;

    return {
      enrollment_id: enrollmentId,
      student_name: enrollment.student_name,
      program: enrollment.programs,
      registration_fee: registrationFee,
      program_fee: programFee,
      registration_paid: registrationPaid,
      program_paid: programPaid,
      pending_registration: Math.max(0, registrationFee - registrationPaid),
      pending_program: Math.max(0, programFee - programPaid),
      total_paid: totalPaid,
      total_pending: Math.max(0, totalRequired - totalPaid),
      total_required: totalRequired,
      payments: payments || [],
      is_registration_complete: registrationPaid >= registrationFee,
      is_program_complete: programPaid >= programFee
    };
  } catch (error) {
    console.error('Error getting student payment summary:', error);
    throw error;
  }
};

// Get all enrollments for payment processing
export const getEnrollmentsForPayment = async () => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_name,
        program_id,
        status,
        programs(id, name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching enrollments for payment:', error);
    throw error;
  }
};

// Generate receipt number
export const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${timestamp}-${random}`;
};

// Get payment analytics
export const getPaymentAnalytics = async () => {
  try {
    const { data: payments, error } = await supabase
      .from('student_payments')
      .select(`
        amount,
        payment_type,
        payment_status,
        created_at,
        enrollments(
          programs(name)
        )
      `)
      .eq('payment_status', 'Completed');

    if (error) throw error;

    const totalRevenue = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const registrationRevenue = payments
      .filter(p => p.payment_type === 'Registration Fee')
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const programRevenue = payments
      .filter(p => p.payment_type === 'Program Fee')
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

    return {
      totalRevenue,
      registrationRevenue,
      programRevenue,
      totalTransactions: payments.length,
      avgTransactionAmount: payments.length > 0 ? totalRevenue / payments.length : 0
    };
  } catch (error) {
    console.error('Error getting payment analytics:', error);
    throw error;
  }
};

 