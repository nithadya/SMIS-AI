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

    // Get assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('counselor_assignments')
      .select(`
        *,
        inquiries (
          id, name, email, phone, program, status, created_at
        )
      `)
      .eq('counselor_id', counselorId)
      .order('assigned_date', { ascending: false });

    if (assignmentsError) throw assignmentsError;

    // Get interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('counselor_interactions')
      .select('*')
      .eq('counselor_id', counselorId)
      .order('actual_date', { ascending: false })
      .limit(50);

    if (interactionsError) throw interactionsError;

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

// Calculate and store performance metrics
export const calculatePerformanceMetrics = async (counselorId, period = 'monthly') => {
  try {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
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

    // Get assignments data
    const { data: assignments } = await supabase
      .from('counselor_assignments')
      .select('*')
      .eq('counselor_id', counselorId)
      .gte('assigned_date', startDate.toISOString())
      .lt('assigned_date', endDate.toISOString());

    // Get interactions data
    const { data: interactions } = await supabase
      .from('counselor_interactions')
      .select('*')
      .eq('counselor_id', counselorId)
      .gte('actual_date', startDate.toISOString())
      .lt('actual_date', endDate.toISOString());

    // Calculate metrics
    const totalAssignments = assignments?.length || 0;
    const activeAssignments = assignments?.filter(a => a.status === 'active').length || 0;
    const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
    
    const totalInteractions = interactions?.length || 0;
    const successfulContacts = interactions?.filter(i => 
      ['successful_contact', 'information_provided', 'enrollment_completed'].includes(i.outcome)
    ).length || 0;
    
    const conversions = interactions?.filter(i => i.outcome === 'enrollment_completed').length || 0;
    const conversionRate = totalInteractions > 0 ? (conversions / totalInteractions) * 100 : 0;
    
    const avgSatisfaction = interactions?.length > 0 
      ? interactions.filter(i => i.satisfaction_rating).reduce((sum, i) => sum + i.satisfaction_rating, 0) / 
        interactions.filter(i => i.satisfaction_rating).length
      : 0;
    
    const avgDuration = interactions?.length > 0
      ? interactions.reduce((sum, i) => sum + (i.duration_minutes || 0), 0) / interactions.length
      : 0;

    // Calculate performance score (0-100)
    const performanceScore = Math.min(100, 
      (conversionRate * 0.4) + 
      (avgSatisfaction * 20 * 0.3) + 
      (Math.min(successfulContacts / Math.max(totalInteractions, 1), 1) * 100 * 0.3)
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
      successful_contacts: successfulContacts,
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

    // Get recent interactions
    const { data: recentInteractions, error: interactionsError } = await supabase
      .from('counselor_interactions')
      .select(`
        *,
        users:counselor_id (full_name),
        inquiries (name, email)
      `)
      .order('actual_date', { ascending: false })
      .limit(20);

    if (interactionsError) throw interactionsError;

    // Calculate team statistics
    const totalCounselors = teamOverview.length;
    const activeCounselors = teamOverview.filter(c => c.interactions_last_7_days > 0).length;
    const avgConversionRate = teamOverview.length > 0 
      ? teamOverview.reduce((sum, c) => sum + (c.conversion_rate_percentage || 0), 0) / teamOverview.length 
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