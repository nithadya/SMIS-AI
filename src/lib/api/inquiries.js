import { supabase } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const createInquiry = async (inquiryData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');

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