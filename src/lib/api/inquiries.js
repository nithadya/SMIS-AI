import { supabase, refreshSupabaseAuth } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const createInquiry = async (inquiryData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    // Remove empty string values for foreign key fields
    const cleanedData = {
      ...inquiryData,
      program_id: inquiryData.program_id || null,
      source_id: inquiryData.source_id || null,
      counselor_id: inquiryData.counselor_id || null,
      status: inquiryData.status || 'new',
      created_by: user.email,
      created_at: new Date().toISOString(),
      program: null, // Set to null since we're using program_id
      source: null  // Set to null since we're using source_id
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert([cleanedData])
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code
        ),
        sources:source_id (
          id,
          name
        ),
        users:counselor_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return { data: null, error: error.message };
  }
};

export const getInquiries = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    let query = supabase
      .from('inquiries')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code
        ),
        sources:source_id (
          id,
          name
        ),
        users:counselor_id (
          id,
          full_name,
          email,
          role
        )
      `);

    // Apply filters
    if (filters.source && filters.source !== 'all') {
      query = query.eq('source_id', filters.source);
    }
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
      filteredData = data.filter(inquiry => 
        inquiry.counselor_id === user.id || 
        inquiry.created_by === user.email
      );
    }

    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return { data: null, error: error.message };
  }
};

export const updateInquiry = async (id, updates) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('inquiries')
      .update({
        ...updates,
        updated_by: user.email
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return { data: null, error: error.message };
  }
};

export const getPrograms = async () => {
  try {
    // Refresh auth before making API calls
    refreshSupabaseAuth();
    
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching programs:', error);
    return { data: null, error: error.message };
  }
};

export const getSources = async () => {
  try {
    // Refresh auth before making API calls
    refreshSupabaseAuth();
    
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching sources:', error);
    return { data: null, error: error.message };
  }
};

export const getCounselors = async () => {
  try {
    // Refresh auth before making API calls
    refreshSupabaseAuth();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'counselor')
      .order('full_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching counselors:', error);
    return { data: null, error: error.message };
  }
};

export const updateInquiryWithActionPlan = async (id, updates, actionPlanData = null) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    // Refresh auth before making API calls
    refreshSupabaseAuth();

    // Determine the correct status based on action plan completion
    let finalStatus = updates.status;
    
    if (actionPlanData) {
      const completedTasks = actionPlanData.tasks?.filter(task => task.status === 'completed').length || 0;
      const totalTasks = actionPlanData.tasks?.length || 0;
      
      // Auto-determine status based on action plan progress
      if (completedTasks === 0) {
        finalStatus = 'new';
      } else if (completedTasks > 0 && completedTasks < totalTasks) {
        finalStatus = 'follow-up';
      } else if (completedTasks === totalTasks && !actionPlanData.enrollmentCreated) {
        finalStatus = 'converted'; // Ready for enrollment
      } else if (actionPlanData.enrollmentCreated) {
        finalStatus = 'completed'; // Enrollment created
      }
    }

    const updateData = {
      ...updates,
      status: finalStatus,
      updated_by: user.email,
      last_contact: new Date().toISOString()
    };

    // Store action plan data if provided
    if (actionPlanData) {
      updateData.action_plan_data = actionPlanData;
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating inquiry with action plan:', error);
    return { data: null, error: error.message };
  }
};

export const getInquiryActionPlan = async (inquiryId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('inquiries')
      .select('action_plan_data, status')
      .eq('id', inquiryId)
      .single();

    if (error) throw error;

    // Return default action plan if none exists
    const defaultActionPlan = {
      tasks: [
        {
          id: 1,
          text: 'Initial phone call to discuss program details',
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          category: 'contact'
        },
        {
          id: 2,
          text: 'Send program brochure and fee structure via email',
          status: 'pending',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'information'
        },
        {
          id: 3,
          text: 'Schedule campus visit or online consultation',
          status: 'pending',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'consultation'
        },
        {
          id: 4,
          text: 'Follow up on program interest and answer questions',
          status: 'pending',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'follow-up'
        },
        {
          id: 5,
          text: 'Assist with enrollment process and documentation',
          status: 'pending',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'enrollment'
        }
      ],
      enrollmentCreated: false,
      nextFollowUp: null,
      notes: []
    };

    const actionPlan = data.action_plan_data || defaultActionPlan;
    
    return { 
      data: { 
        ...actionPlan, 
        inquiryStatus: data.status 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching action plan:', error);
    return { data: null, error: error.message };
  }
};

export const getInquiryStats = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Build query with filters
    let query = supabase.from('inquiries').select('*');

    // Apply filters
    if (filters.source && filters.source !== 'all') {
      query = query.eq('source_id', filters.source);
    }
    if (filters.program && filters.program !== 'all') {
      query = query.eq('program_id', filters.program);
    }
    if (filters.counselor && filters.counselor !== 'all') {
      query = query.eq('counselor_id', filters.counselor);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    const { data: inquiries, error } = await query;
    if (error) throw error;

    // Calculate statistics
    const total = inquiries.length;
    const statusCounts = inquiries.reduce((acc, inquiry) => {
      const status = inquiry.status || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate average response time (hours between created_at and last_contact)
    const responseTimes = inquiries
      .filter(inq => inq.last_contact && inq.created_at && inq.status !== 'new')
      .map(inq => {
        const created = new Date(inq.created_at);
        const contacted = new Date(inq.last_contact);
        return (contacted - created) / (1000 * 60 * 60); // Convert to hours
      });

    const avgResponseTime = responseTimes.length > 0 
      ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100
      : 0;

    const stats = {
      total,
      new: statusCounts.new || 0,
      contacted: statusCounts.contacted || 0,
      followUp: statusCounts['follow-up'] || 0,
      converted: statusCounts.converted || 0,
      completed: statusCounts.completed || 0,
      lost: statusCounts.lost || 0,
      avgResponseTime
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    return { data: null, error: error.message };
  }
}; 