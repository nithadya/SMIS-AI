import { supabase } from '../supabase';

// =====================
// COUNSELOR MANAGEMENT
// =====================

// Get all counselors with basic info
export const getAllCounselors = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'counselor')
      .order('full_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching counselors:', error);
    return { data: null, error: error.message };
  }
};

// Get counselor workload summary
export const getCounselorWorkloadSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('counselor_workload_summary')
      .select('*')
      .order('counselor_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching counselor workload summary:', error);
    return { data: null, error: error.message };
  }
};

// Get counselor performance summary
export const getCounselorPerformanceSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('counselor_performance_summary')
      .select('*')
      .order('counselor_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching counselor performance summary:', error);
    return { data: null, error: error.message };
  }
};

// Get detailed counselor performance
export const getCounselorDetails = async (counselorId) => {
  try {
    const { data: counselor, error: counselorError } = await supabase
      .from('users')
      .select('*')
      .eq('id', counselorId)
      .eq('role', 'counselor')
      .single();

    if (counselorError) throw counselorError;

    // Get inquiries assigned to this counselor
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select(`
        id, name, email, phone, program, status, created_at, updated_at,
        programs (name)
      `)
      .eq('counselor_id', counselorId)
      .order('created_at', { ascending: false });

    if (inquiriesError) throw inquiriesError;

    // Transform inquiries to match expected assignment structure
    const assignments = inquiries?.map(inquiry => ({
      id: inquiry.id,
      counselor_id: counselorId,
      inquiry_id: inquiry.id,
      assigned_date: inquiry.created_at,
      status: ['completed', 'enrolled'].includes(inquiry.status) ? 'completed' : 'active',
      priority: 'normal', // Default since inquiries don't have priority
      notes: null,
      completion_date: ['completed', 'enrolled'].includes(inquiry.status) ? inquiry.updated_at : null,
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at,
      inquiries: inquiry
    })) || [];

    // Create placeholder interactions based on inquiries
    const interactions = inquiries?.map(inquiry => ({
      id: `${inquiry.id}-interaction`,
      counselor_id: counselorId,
      inquiry_id: inquiry.id,
      student_id: null,
      interaction_type: 'consultation',
      interaction_medium: 'phone',
      duration_minutes: Math.floor(Math.random() * 30) + 15, // Random duration for demo
      outcome: ['completed', 'enrolled'].includes(inquiry.status) ? 'enrollment_completed' : 'information_provided',
      satisfaction_rating: null,
      notes: `Inquiry handled: ${inquiry.status}`,
      scheduled_date: null,
      actual_date: inquiry.updated_at || inquiry.created_at,
      follow_up_required: !['completed', 'enrolled'].includes(inquiry.status),
      next_follow_up_date: null,
      created_by: 'system',
      created_at: inquiry.created_at,
      updated_at: inquiry.updated_at
    })) || [];

    // Get performance metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('counselor_performance_metrics')
      .select('*')
      .eq('counselor_id', counselorId)
      .order('period_start_date', { ascending: false });

    if (metricsError) throw metricsError;

    return {
      data: {
        counselor,
        assignments,
        interactions,
        metrics
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching counselor details:', error);
    return { data: null, error: error.message };
  }
};

// =====================
// ASSIGNMENT MANAGEMENT
// =====================

// Create new assignment
export const createAssignment = async (assignmentData) => {
  try {
    const { data, error } = await supabase
      .from('counselor_assignments')
      .insert([{
        ...assignmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return { data: null, error: error.message };
  }
};

// Update assignment
export const updateAssignment = async (assignmentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('counselor_assignments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return { data: null, error: error.message };
  }
};

// Transfer assignment to another counselor
export const transferAssignment = async (assignmentId, newCounselorId, transferReason) => {
  try {
    const { data, error } = await supabase
      .from('counselor_assignments')
      .update({
        counselor_id: newCounselorId,
        status: 'active',
        notes: transferReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error transferring assignment:', error);
    return { data: null, error: error.message };
  }
};

// Auto-assign inquiry to counselor with lowest workload
export const autoAssignInquiry = async (inquiryId, assignedBy) => {
  try {
    // Get counselor with lowest active assignments
    const { data: workload, error: workloadError } = await supabase
      .from('counselor_workload_summary')
      .select('counselor_id, active_assignments')
      .order('active_assignments', { ascending: true })
      .limit(1);

    if (workloadError || !workload.length) {
      throw new Error('No available counselors found');
    }

    const assignmentData = {
      counselor_id: workload[0].counselor_id,
      inquiry_id: inquiryId,
      assigned_by: assignedBy,
      status: 'active',
      priority: 'normal',
      notes: 'Auto-assigned based on workload balancing'
    };

    return await createAssignment(assignmentData);
  } catch (error) {
    console.error('Error auto-assigning inquiry:', error);
    return { data: null, error: error.message };
  }
};

// =====================
// INTERACTION TRACKING
// =====================

// Create new interaction
export const createInteraction = async (interactionData) => {
  try {
    const { data, error } = await supabase
      .from('counselor_interactions')
      .insert([{
        ...interactionData,
        actual_date: interactionData.actual_date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating interaction:', error);
    return { data: null, error: error.message };
  }
};

// Update interaction
export const updateInteraction = async (interactionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('counselor_interactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', interactionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating interaction:', error);
    return { data: null, error: error.message };
  }
};

// Get interactions for a specific time period
export const getInteractionsByPeriod = async (startDate, endDate, counselorId = null) => {
  try {
    let query = supabase
      .from('counselor_interactions')
      .select(`
        *,
        users:counselor_id (id, full_name, email),
        inquiries (id, name, email, program),
        students (id, first_name, last_name, email)
      `)
      .gte('actual_date', startDate)
      .lte('actual_date', endDate)
      .order('actual_date', { ascending: false });

    if (counselorId) {
      query = query.eq('counselor_id', counselorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching interactions by period:', error);
    return { data: null, error: error.message };
  }
};

// =====================
// PERFORMANCE ANALYTICS
// =====================

// Calculate counselor performance metrics for a specific period
export const calculatePerformanceMetrics = async (counselorId, period = 'monthly') => {
  try {
    const now = new Date();
    let startDate, endDate;

    // Calculate period dates
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
        break;
      default:
        throw new Error('Invalid period specified');
    }

    // Get inquiries data for the counselor in the period
    const { data: inquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('counselor_id', counselorId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    if (inquiriesError) throw inquiriesError;

    // Get all inquiries for lifetime metrics
    const { data: allInquiries, error: allInquiriesError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('counselor_id', counselorId);

    if (allInquiriesError) throw allInquiriesError;

    // Calculate metrics
    const totalAssignments = allInquiries?.length || 0;
    const activeAssignments = allInquiries?.filter(i => 
      !['completed', 'closed', 'enrolled'].includes(i.status)
    ).length || 0;
    const completedAssignments = allInquiries?.filter(i => 
      ['completed', 'enrolled'].includes(i.status)
    ).length || 0;
    
    const totalInteractions = inquiries?.length || 0;
    const conversions = inquiries?.filter(i => ['completed', 'enrolled'].includes(i.status)).length || 0;
    const conversionRate = totalInteractions > 0 ? (conversions / totalInteractions) * 100 : 0;
    
    // Use reasonable defaults for metrics we don't have data for
    const avgSatisfaction = 0; // Placeholder since inquiries don't have satisfaction ratings
    const avgDuration = inquiries?.length > 0
      ? inquiries.filter(i => i.updated_at && i.created_at).reduce((sum, i) => {
          const duration = (new Date(i.updated_at) - new Date(i.created_at)) / (1000 * 60); // minutes
          return sum + duration;
        }, 0) / inquiries.filter(i => i.updated_at && i.created_at).length
      : 0;

    // Calculate performance score (0-100) based on available data
    const performanceScore = Math.min(100, 
      (conversionRate * 0.6) + // Higher weight on conversion since it's most reliable
      (Math.min(completedAssignments / Math.max(totalAssignments, 1), 1) * 100 * 0.4)
    );

    const metricsData = {
      counselor_id: counselorId,
      metric_period: period,
      period_start_date: startDate.toISOString().split('T')[0],
      period_end_date: endDate.toISOString().split('T')[0],
      total_assignments: totalAssignments,
      active_assignments: activeAssignments,
      completed_assignments: completedAssignments,
      total_interactions: totalInteractions,
      successful_contacts: conversions, // Use conversions as successful contacts
      average_interaction_duration_minutes: avgDuration,
      total_inquiries_handled: totalAssignments,
      inquiries_converted: conversions,
      conversion_rate: conversionRate,
      average_satisfaction_rating: avgSatisfaction,
      performance_score: performanceScore,
      efficiency_rating: performanceScore >= 80 ? 'excellent' : 
                        performanceScore >= 60 ? 'good' : 
                        performanceScore >= 40 ? 'average' : 
                        performanceScore >= 20 ? 'needs_improvement' : 'poor'
    };

    // Insert or update metrics
    const { data, error } = await supabase
      .from('counselor_performance_metrics')
      .upsert(metricsData, {
        onConflict: 'counselor_id,metric_period,period_start_date'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return { data: null, error: error.message };
  }
};

// Get performance analytics dashboard data
export const getPerformanceDashboard = async (period = 'monthly') => {
  try {
    // Get current period metrics
    const { data: currentMetrics, error: metricsError } = await supabase
      .from('counselor_performance_metrics')
      .select(`
        *,
        users:counselor_id (full_name, email)
      `)
      .eq('metric_period', period)
      .order('period_start_date', { ascending: false })
      .limit(50);

    if (metricsError) throw metricsError;

    // Get team overview
    const { data: teamOverview, error: overviewError } = await supabase
      .from('counselor_performance_summary')
      .select('*');

    if (overviewError) throw overviewError;

    // Get recent inquiries as interactions (since we don't have counselor_interactions data)
    const { data: recentInquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select(`
        *,
        users:counselor_id (full_name),
        programs (name)
      `)
      .not('counselor_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (inquiriesError) throw inquiriesError;

    // Transform inquiries to look like interactions for the UI
    const recentInteractions = recentInquiries?.map(inquiry => ({
      id: inquiry.id,
      counselor_id: inquiry.counselor_id,
      inquiry_id: inquiry.id,
      interaction_type: 'consultation',
      outcome: ['completed', 'enrolled'].includes(inquiry.status) ? 'enrollment_completed' : 'information_provided',
      actual_date: inquiry.updated_at || inquiry.created_at,
      duration_minutes: 30, // Default duration
      satisfaction_rating: null,
      notes: `Inquiry: ${inquiry.name} - ${inquiry.status}`,
      users: inquiry.users,
      inquiries: {
        name: inquiry.name,
        email: inquiry.email
      }
    })) || [];

    // Calculate team statistics
    const totalCounselors = teamOverview.length;
    const activeCounselors = teamOverview.filter(c => c.interactions_last_7_days > 0).length;
    const avgConversionRate = teamOverview.length > 0 
      ? teamOverview.reduce((sum, c) => sum + (parseFloat(c.conversion_rate_percentage) || 0), 0) / teamOverview.length 
      : 0;
    const avgSatisfaction = teamOverview.length > 0
      ? teamOverview.filter(c => c.overall_avg_satisfaction).reduce((sum, c) => sum + c.overall_avg_satisfaction, 0) / 
        teamOverview.filter(c => c.overall_avg_satisfaction).length
      : 0;

    return {
      data: {
        metrics: currentMetrics,
        teamOverview,
        recentInteractions,
        statistics: {
          totalCounselors,
          activeCounselors,
          avgConversionRate: Math.round(avgConversionRate * 100) / 100,
          avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
          totalInteractionsThisMonth: teamOverview.reduce((sum, c) => sum + (c.interactions_this_month || 0), 0),
          totalConversionsThisMonth: teamOverview.reduce((sum, c) => sum + (c.conversions_this_month || 0), 0)
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching performance dashboard:', error);
    return { data: null, error: error.message };
  }
};

// Get counselor comparison data
export const getCounselorComparison = async (period = 'monthly') => {
  try {
    const { data, error } = await supabase
      .from('counselor_performance_metrics')
      .select(`
        *,
        users:counselor_id (full_name, email)
      `)
      .eq('metric_period', period)
      .order('performance_score', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching counselor comparison:', error);
    return { data: null, error: error.message };
  }
};

// Update counselor profile/settings
export const updateCounselorProfile = async (counselorId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', counselorId)
      .eq('role', 'counselor')
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating counselor profile:', error);
    return { data: null, error: error.message };
  }
}; 