import { supabase } from '../supabase.js';

export const getDashboardStats = async () => {
  try {
    // Get overview stats
    const [
      enrollmentsResponse,
      studentsResponse,
      paymentsResponse,
      inquiriesResponse,
      programsResponse,
      batchesResponse
    ] = await Promise.all([
      supabase.from('enrollments').select('*'),
      supabase.from('students').select('*'),
      supabase.from('student_payments').select('*'),
      supabase.from('inquiries').select('*'),
      supabase.from('programs').select('*'),
      supabase.from('batches').select('*')
    ]);

    const totalEnrollments = enrollmentsResponse.data?.length || 0;
    const totalStudents = studentsResponse.data?.length || 0;
    const totalInquiries = inquiriesResponse.data?.length || 0;
    const totalPrograms = programsResponse.data?.length || 0;
    const totalBatches = batchesResponse.data?.length || 0;
    
    // Calculate payment stats
    const payments = paymentsResponse.data || [];
    const totalRevenue = payments
      .filter(p => p.payment_status === 'Completed')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    
    const pendingPayments = payments
      .filter(p => p.payment_status === 'Pending')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return {
      success: true,
      data: {
        overview: {
          totalEnrollments,
          totalStudents,
          totalInquiries,
          totalPrograms,
          totalBatches,
          totalRevenue,
          pendingPayments
        }
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getEnrollmentTrends = async () => {
  try {
    // Get enrollment trends by month
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('status, created_at')
      .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    // Group by month and status
    const trendsMap = {};
    const statusCounts = {};

    enrollments.forEach(enrollment => {
      const month = new Date(enrollment.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!trendsMap[month]) {
        trendsMap[month] = {};
      }
      
      trendsMap[month][enrollment.status] = (trendsMap[month][enrollment.status] || 0) + 1;
      statusCounts[enrollment.status] = (statusCounts[enrollment.status] || 0) + 1;
    });

    const trends = Object.keys(trendsMap).map(month => ({
      month,
      ...trendsMap[month]
    }));

    const statusCountsArray = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));

    return {
      success: true,
      data: {
        trends,
        statusCounts: statusCountsArray
      }
    };
  } catch (error) {
    console.error('Error fetching enrollment trends:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getProgramAnalytics = async () => {
  try {
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select(`
        id, name, code,
        enrollments (id, status),
        students (id)
      `);

    if (programsError) throw programsError;

    const analytics = programs.map(program => {
      const totalEnrollments = program.enrollments?.length || 0;
      const registeredStudents = program.students?.length || 0;
      const conversionRate = totalEnrollments > 0 
        ? ((registeredStudents / totalEnrollments) * 100).toFixed(1)
        : '0.0';

      return {
        name: program.name,
        code: program.code,
        totalEnrollments,
        registeredStudents,
        conversionRate
      };
    });

    return {
      success: true,
      data: analytics
    };
  } catch (error) {
    console.error('Error fetching program analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getPaymentAnalytics = async () => {
  try {
    const { data: payments, error } = await supabase
      .from('student_payments')
      .select(`
        *,
        students (
          first_name, last_name,
          enrollments (
            programs (name)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Monthly revenue
    const monthlyRevenueMap = {};
    payments
      .filter(p => p.payment_status === 'Completed')
      .forEach(payment => {
        const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + parseFloat(payment.amount || 0);
      });

    const monthlyRevenue = Object.keys(monthlyRevenueMap).map(month => ({
      month,
      revenue: monthlyRevenueMap[month]
    }));

    // Payment methods distribution
    const methodsMap = {};
    payments.forEach(payment => {
      const method = payment.payment_method || 'Unknown';
      methodsMap[method] = (methodsMap[method] || 0) + parseFloat(payment.amount || 0);
    });

    const paymentMethods = Object.keys(methodsMap).map(method => ({
      name: method,
      value: methodsMap[method]
    }));

    // Recent payments
    const recentPayments = payments.slice(0, 10).map(payment => ({
      studentName: `${payment.students?.first_name || ''} ${payment.students?.last_name || ''}`.trim(),
      program: payment.students?.enrollments?.[0]?.programs?.name || 'N/A',
      amount: parseFloat(payment.amount || 0),
      status: payment.payment_status,
      date: payment.created_at
    }));

    return {
      success: true,
      data: {
        monthlyRevenue,
        paymentMethods,
        recentPayments
      }
    };
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getBatchAnalytics = async () => {
  try {
    const { data: batches, error } = await supabase
      .from('batches')
      .select('*');

    if (error) throw error;

    return {
      success: true,
      data: {
        totalBatches: batches.length,
        activeBatches: batches.filter(b => b.status === 'Active').length
      }
    };
  } catch (error) {
    console.error('Error fetching batch analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getCounselorPerformance = async () => {
  try {
    const { data: counselors, error } = await supabase
      .from('users')
      .select(`
        id, first_name, last_name,
        inquiries_assigned:inquiries!assigned_counselor_id (id, status),
        enrollments_counseled:enrollments!counselor_id (id, status)
      `)
      .eq('role', 'counselor');

    if (error) throw error;

    const performance = counselors.map(counselor => {
      const totalInquiries = counselor.inquiries_assigned?.length || 0;
      const totalEnrollments = counselor.enrollments_counseled?.length || 0;
      const conversionRate = totalInquiries > 0 
        ? ((totalEnrollments / totalInquiries) * 100).toFixed(1)
        : '0.0';

      return {
        name: `${counselor.first_name} ${counselor.last_name}`,
        totalInquiries,
        totalEnrollments,
        conversionRate: parseFloat(conversionRate)
      };
    });

    return {
      success: true,
      data: performance
    };
  } catch (error) {
    console.error('Error fetching counselor performance:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getRecentActivities = async () => {
  try {
    const activities = [];
    
    // Recent enrollments
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        id, created_at, status,
        programs (name),
        students (first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (enrollments) {
      enrollments.forEach(enrollment => {
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'enrollment',
          icon: '📝',
          title: 'New Enrollment',
          description: `${enrollment.students?.first_name} ${enrollment.students?.last_name} enrolled in ${enrollment.programs?.name}`,
          timestamp: enrollment.created_at
        });
      });
    }

    // Recent payments
    const { data: payments } = await supabase
      .from('student_payments')
      .select(`
        id, created_at, amount, payment_status,
        students (first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (payments) {
      payments.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment',
          icon: '💰',
          title: 'Payment Received',
          description: `${payment.students?.first_name} ${payment.students?.last_name} paid LKR ${parseFloat(payment.amount || 0).toLocaleString()}`,
          timestamp: payment.created_at
        });
      });
    }

    // Recent inquiries
    const { data: inquiries } = await supabase
      .from('inquiries')
      .select(`
        id, created_at, status, inquiry_type,
        students (first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (inquiries) {
      inquiries.forEach(inquiry => {
        activities.push({
          id: `inquiry-${inquiry.id}`,
          type: 'inquiry',
          icon: '❓',
          title: 'New Inquiry',
          description: `${inquiry.students?.first_name} ${inquiry.students?.last_name} submitted a ${inquiry.inquiry_type} inquiry`,
          timestamp: inquiry.created_at
        });
      });
    }

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      success: true,
      data: activities.slice(0, 15)
    };
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 