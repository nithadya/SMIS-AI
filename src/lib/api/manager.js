import { supabase, refreshSupabaseAuth } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Advanced Inquiries Analytics
export const getAdvancedInquiryAnalytics = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { dateRange = '30', selectedSource = 'all', selectedCounselor = 'all' } = filters;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get inquiry analytics
    let inquiryQuery = supabase
      .from('inquiries')
      .select(`
        id,
        name,
        email,
        phone,
        source,
        status,
        created_at,
        last_contact,
        next_follow_up,
        counselor_id,
        program_id,
        users:counselor_id (
          id,
          full_name,
          email
        ),
        programs:program_id (
          id,
          name
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (selectedSource !== 'all') {
      inquiryQuery = inquiryQuery.eq('source', selectedSource);
    }

    if (selectedCounselor !== 'all') {
      inquiryQuery = inquiryQuery.eq('counselor_id', selectedCounselor);
    }

    const { data: inquiries, error: inquiryError } = await inquiryQuery;
    if (inquiryError) throw new Error(inquiryError.message);

    // Get enrollments for conversion tracking
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        inquiry_id,
        status,
        created_at,
        is_registered
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (enrollmentError) throw new Error(enrollmentError.message);

    // Calculate analytics
    const totalInquiries = inquiries.length;
    const totalConversions = enrollments.filter(e => e.is_registered).length;
    const conversionRate = totalInquiries > 0 ? (totalConversions / totalInquiries) * 100 : 0;

    // Source effectiveness
    const sourceStats = {};
    inquiries.forEach(inquiry => {
      const source = inquiry.source || 'Unknown';
      if (!sourceStats[source]) {
        sourceStats[source] = { inquiries: 0, conversions: 0 };
      }
      sourceStats[source].inquiries++;
      
      // Check if this inquiry led to enrollment
      const enrollment = enrollments.find(e => e.inquiry_id === inquiry.id);
      if (enrollment && enrollment.is_registered) {
        sourceStats[source].conversions++;
      }
    });

    const sourceEffectiveness = Object.entries(sourceStats).map(([source, stats]) => ({
      name: source,
      inquiries: stats.inquiries,
      conversions: stats.conversions,
      rate: stats.inquiries > 0 ? (stats.conversions / stats.inquiries) * 100 : 0,
      cost: getSourceCost(source) // Mock function for cost data
    }));

    // Response time analytics
    const responseTimeData = await calculateResponseTimes(inquiries);

    // Team performance
    const teamPerformance = await calculateTeamPerformance(inquiries, enrollments);

    return {
      data: {
        overview: {
          totalInquiries,
          conversionRate: conversionRate.toFixed(1),
          averageResponseTime: responseTimeData.averageResponseTime,
          satisfactionScore: 4.6, // Mock - integrate with actual satisfaction data
          trends: {
            inquiries: '+15.3%', // Mock - calculate from historical data
            conversion: '+8.2%',
            responseTime: '-12.4%',
            satisfaction: '+5.7%'
          }
        },
        sourceEffectiveness,
        conversionFunnel: calculateConversionFunnel(inquiries, enrollments),
        responseTimeAnalytics: responseTimeData.monthlyData,
        counselorPerformance: teamPerformance,
        qualityMetrics: await getQualityMetrics()
      },
      error: null
    };

  } catch (error) {
    console.error('Error fetching advanced inquiry analytics:', error);
    return { data: null, error: error.message };
  }
};

// Enrollment & Registration Management Analytics
export const getEnrollmentRegistrationAnalytics = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { program = 'all', status = 'all', counselor = 'all', dateRange = '30' } = filters;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    // Get enrollment data with related information
    let enrollmentQuery = supabase
      .from('enrollments')
      .select(`
        id,
        inquiry_id,
        student_name,
        program_id,
        batch,
        status,
        current_step,
        is_registered,
        created_at,
        updated_at,
        counselor_id,
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
        ),
        registration_data (
          id,
          payment_status,
          created_at,
          updated_at
        ),
        registration_documents (
          id,
          document_type,
          uploaded_at
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (program !== 'all') {
      enrollmentQuery = enrollmentQuery.eq('program_id', program);
    }

    if (status !== 'all') {
      enrollmentQuery = enrollmentQuery.eq('status', status);
    }

    if (counselor !== 'all') {
      enrollmentQuery = enrollmentQuery.eq('counselor_id', counselor);
    }

    const { data: enrollments, error: enrollmentError } = await enrollmentQuery;
    if (enrollmentError) throw new Error(enrollmentError.message);

    // Calculate metrics
    const totalEnrollments = enrollments.length;
    const pendingRegistrations = enrollments.filter(e => !e.is_registered).length;
    const completedRegistrations = enrollments.filter(e => e.is_registered).length;
    const completionRate = totalEnrollments > 0 ? (completedRegistrations / totalEnrollments) * 100 : 0;

    // Status distribution
    const statusStats = {};
    enrollments.forEach(enrollment => {
      const status = enrollment.status || 'Unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusStats).map(([status, count]) => ({
      status,
      count,
      percentage: totalEnrollments > 0 ? (count / totalEnrollments) * 100 : 0
    }));

    // Processing trends
    const processingTrends = await calculateProcessingTrends(enrollments);

    // Documentation analytics
    const documentationAnalytics = await calculateDocumentationAnalytics(enrollments);

    // Workflow metrics
    const workflowMetrics = await calculateWorkflowMetrics(enrollments);

    // Calculate average processing time
    const completedEnrollments = enrollments.filter(e => e.is_registered);
    const avgProcessingTime = completedEnrollments.length > 0 
      ? completedEnrollments.reduce((sum, e) => {
          const days = Math.ceil((new Date(e.updated_at) - new Date(e.created_at)) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedEnrollments.length 
      : 0;

    return {
      data: {
        overview: {
          totalEnrollments,
          pendingRegistrations,
          completionRate: completionRate.toFixed(1),
          documentationPending: documentationAnalytics.totalPending,
          avgProcessingTime: avgProcessingTime.toFixed(1),
          trends: {
            enrollments: '+12.5%', // Mock - calculate from historical data
            registrations: '+8.7%',
            completion: '+5.3%',
            processingTime: '-15.2%'
          }
        },
        statusDistribution,
        processingTrends,
        documentationAnalytics,
        workflowMetrics
      },
      error: null
    };

  } catch (error) {
    console.error('Error fetching enrollment registration analytics:', error);
    return { data: null, error: error.message };
  }
};

// Helper functions
const getSourceCost = (source) => {
  const costs = {
    'Website': 125,
    'Social Media': 95,
    'Referrals': 45,
    'Direct Walk-in': 0,
    'Google Ads': 180,
    'Facebook Ads': 110,
    'Print Media': 200
  };
  return costs[source] || 100;
};

const calculateResponseTimes = async (inquiries) => {
  // Mock calculation - implement actual response time logic
  const averageResponseTime = 18.5;
  const monthlyData = [
    { month: 'Jan', avgTime: 24.5, target: 20, satisfaction: 4.2 },
    { month: 'Feb', avgTime: 22.1, target: 20, satisfaction: 4.3 },
    { month: 'Mar', avgTime: 19.8, target: 20, satisfaction: 4.5 },
    { month: 'Apr', avgTime: 18.5, target: 20, satisfaction: 4.6 },
    { month: 'May', avgTime: 17.2, target: 20, satisfaction: 4.7 },
    { month: 'Jun', avgTime: 16.8, target: 20, satisfaction: 4.8 }
  ];
  
  return { averageResponseTime, monthlyData };
};

const calculateTeamPerformance = async (inquiries, enrollments) => {
  // Group by counselor
  const counselorStats = {};
  
  inquiries.forEach(inquiry => {
    if (inquiry.users) {
      const counselorId = inquiry.counselor_id;
      const counselorName = inquiry.users.full_name;
      
      if (!counselorStats[counselorId]) {
        counselorStats[counselorId] = {
          name: counselorName,
          inquiries: 0,
          conversions: 0,
          responseTime: 0,
          satisfaction: 4.5,
          efficiency: 85
        };
      }
      
      counselorStats[counselorId].inquiries++;
      
      // Check conversions
      const conversion = enrollments.find(e => e.inquiry_id === inquiry.id && e.is_registered);
      if (conversion) {
        counselorStats[counselorId].conversions++;
      }
    }
  });

  return Object.values(counselorStats).map(counselor => ({
    ...counselor,
    responseTime: 15.2 + Math.random() * 10, // Mock response time
    satisfaction: 4.3 + Math.random() * 0.7,
    efficiency: 75 + Math.random() * 20
  }));
};

const calculateConversionFunnel = (inquiries, enrollments) => {
  const totalInquiries = inquiries.length;
  const infoProvided = Math.floor(totalInquiries * 0.791);
  const followUp = Math.floor(totalInquiries * 0.596);
  const counseling = Math.floor(totalInquiries * 0.472);
  const applications = Math.floor(totalInquiries * 0.366);
  const completed = enrollments.filter(e => e.is_registered).length;

  return [
    { stage: 'Initial Inquiry', value: totalInquiries, percentage: 100 },
    { stage: 'Information Provided', value: infoProvided, percentage: (infoProvided / totalInquiries) * 100 },
    { stage: 'Follow-up Contact', value: followUp, percentage: (followUp / totalInquiries) * 100 },
    { stage: 'Counseling Session', value: counseling, percentage: (counseling / totalInquiries) * 100 },
    { stage: 'Application Submitted', value: applications, percentage: (applications / totalInquiries) * 100 },
    { stage: 'Enrollment Completed', value: completed, percentage: (completed / totalInquiries) * 100 }
  ];
};

const getQualityMetrics = async () => {
  // Mock quality metrics - implement actual calculation
  return [
    { metric: 'First Contact Resolution', value: 67.8, target: 70, trend: '+3.2%' },
    { metric: 'Customer Satisfaction', value: 4.6, target: 4.5, trend: '+5.7%' },
    { metric: 'Follow-up Completion', value: 89.2, target: 85, trend: '+2.1%' },
    { metric: 'Information Accuracy', value: 94.5, target: 95, trend: '+1.8%' }
  ];
};

const calculateProcessingTrends = async (enrollments) => {
  // Mock monthly trends calculation
  return [
    { month: 'Jan', enrollments: 78, registrations: 65, completion: 75 },
    { month: 'Feb', enrollments: 92, registrations: 78, completion: 82 },
    { month: 'Mar', enrollments: 105, registrations: 89, completion: 85 },
    { month: 'Apr', enrollments: 118, registrations: 95, completion: 78 },
    { month: 'May', enrollments: 132, registrations: 108, completion: 81 },
    { month: 'Jun', enrollments: 147, registrations: 125, completion: 85 }
  ];
};

const calculateDocumentationAnalytics = async (enrollments) => {
  const documentTypes = ['ID Documents', 'Academic Records', 'Medical Certificates', 'Payment Receipts'];
  const analytics = [];
  let totalPending = 0;

  for (const type of documentTypes) {
    // Mock calculation based on enrollment data
    const submitted = Math.floor(enrollments.length * (0.8 + Math.random() * 0.2));
    const verified = Math.floor(submitted * (0.9 + Math.random() * 0.08));
    const pending = submitted - verified;
    const rate = submitted > 0 ? (verified / submitted) * 100 : 0;
    
    totalPending += pending;
    
    analytics.push({
      type,
      submitted,
      verified,
      pending,
      rate
    });
  }

  return { analytics, totalPending };
};

const calculateWorkflowMetrics = async (enrollments) => {
  return [
    { stage: 'Initial Application', avgTime: 2.1, target: 2.0, efficiency: 95 },
    { stage: 'Document Review', avgTime: 3.4, target: 3.0, efficiency: 88 },
    { stage: 'Verification Process', avgTime: 5.2, target: 4.0, efficiency: 77 },
    { stage: 'Final Approval', avgTime: 1.8, target: 2.0, efficiency: 111 }
  ];
};

// Sorting configuration management
export const updateSortingMethod = async (method) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // In a real implementation, you might store this in a settings table
    // For now, return success
    return { data: { method }, error: null };
    
  } catch (error) {
    console.error('Error updating sorting method:', error);
    return { data: null, error: error.message };
  }
};

// Export report functionality
export const exportAnalyticsReport = async (reportType, filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Mock export functionality
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportType}_report_${timestamp}.csv`;
    
    // In a real implementation, generate and download the report
    console.log(`Exporting ${reportType} report with filters:`, filters);
    
    return { data: { filename, downloadUrl: '#' }, error: null };
    
  } catch (error) {
    console.error('Error exporting report:', error);
    return { data: null, error: error.message };
  }
};