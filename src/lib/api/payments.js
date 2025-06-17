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
        *,
        students(id, first_name, last_name, email, enrollment_id),
        enrollments(id, student_name, program_id, status)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student payments:', error);
    throw error;
  }
};

// Get pending payments with detailed calculation
export const getPendingPayments = async () => {
  try {
    // Get all enrollments with their programs and fee structures
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_name,
        program_id,
        status,
        created_at,
        programs(id, name, code),
        student_payments(payment_type, amount, payment_status)
      `);

    if (enrollmentsError) throw enrollmentsError;

    // Get fee structures for all programs
    const { data: feeStructures, error: feeError } = await supabase
      .from('fee_structure')
      .select('*');

    if (feeError) throw feeError;

    const pendingPayments = [];

    for (const enrollment of enrollments) {
      const programFees = feeStructures.filter(fee => fee.program_id === enrollment.program_id);
      
      // Calculate total fees
      const registrationFee = programFees.find(fee => fee.fee_type === 'Registration Fee')?.amount || 50000;
      const programFee = programFees.find(fee => fee.fee_type === 'Program Fee')?.amount || 0;
      const totalRequired = parseFloat(registrationFee) + parseFloat(programFee);

      // Calculate total paid
      const totalPaid = enrollment.student_payments
        ?.filter(payment => payment.payment_status === 'Completed')
        ?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0;

      // Calculate pending amounts
      const registrationPaid = enrollment.student_payments
        ?.filter(payment => payment.payment_type === 'Registration Fee' && payment.payment_status === 'Completed')
        ?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0;

      const programPaid = enrollment.student_payments
        ?.filter(payment => payment.payment_type === 'Program Fee' && payment.payment_status === 'Completed')
        ?.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) || 0;

      const pendingRegistration = Math.max(0, parseFloat(registrationFee) - registrationPaid);
      const pendingProgram = Math.max(0, parseFloat(programFee) - programPaid);
      const totalPending = pendingRegistration + pendingProgram;

      // Only include if there are pending payments or first payment was below registration fee
      if (totalPending > 0 || (totalPaid > 0 && registrationPaid < parseFloat(registrationFee))) {
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
          is_registration_incomplete: registrationPaid < parseFloat(registrationFee)
        });
      }
    }

    return pendingPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error calculating pending payments:', error);
    throw error;
  }
};

// Create a new payment transaction
export const createPaymentTransaction = async (paymentData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const { data, error } = await supabase
      .from('student_payments')
      .insert([{
        student_id: paymentData.student_id,
        enrollment_id: paymentData.enrollment_id,
        payment_type: paymentData.payment_type,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_reference: paymentData.payment_reference,
        payment_status: paymentData.payment_status || 'Completed',
        description: paymentData.description,
        receipt_number: paymentData.receipt_number,
        created_by: user.email || 'system'
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

// Get payment summary for a student
export const getStudentPaymentSummary = async (enrollmentId) => {
  try {
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        student_name,
        program_id,
        programs(id, name, code),
        student_payments(payment_type, amount, payment_status, payment_date)
      `)
      .eq('id', enrollmentId)
      .single();

    if (enrollmentError) throw enrollmentError;

    const { data: feeStructure, error: feeError } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('program_id', enrollment.program_id);

    if (feeError) throw feeError;

    const registrationFee = feeStructure.find(fee => fee.fee_type === 'Registration Fee')?.amount || 50000;
    const programFee = feeStructure.find(fee => fee.fee_type === 'Program Fee')?.amount || 0;

    const payments = enrollment.student_payments || [];
    const completedPayments = payments.filter(p => p.payment_status === 'Completed');
    
    const registrationPaid = completedPayments
      .filter(p => p.payment_type === 'Registration Fee')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const programPaid = completedPayments
      .filter(p => p.payment_type === 'Program Fee')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return {
      enrollment_id: enrollmentId,
      student_name: enrollment.student_name,
      program: enrollment.programs,
      registration_fee: parseFloat(registrationFee),
      program_fee: parseFloat(programFee),
      registration_paid: registrationPaid,
      program_paid: programPaid,
      pending_registration: Math.max(0, parseFloat(registrationFee) - registrationPaid),
      pending_program: Math.max(0, parseFloat(programFee) - programPaid),
      total_paid: registrationPaid + programPaid,
      total_pending: Math.max(0, parseFloat(registrationFee) + parseFloat(programFee) - registrationPaid - programPaid),
      payments: payments
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