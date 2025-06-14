import { supabase, refreshSupabaseAuth } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get all programs
export const getPrograms = async () => {
  try {
    // Temporarily remove auth check for testing
    // const user = getCurrentUser();
    // if (!user) throw new Error('Not authenticated');
    
    // refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getPrograms:', error);
    return { data: null, error: error.message };
  }
};

// Get all batches with filtering
export const getBatches = async (filters = {}) => {
  console.log('getBatches called with filters:', filters);
  try {
    // Temporarily remove auth check for testing
    // const user = getCurrentUser();
    // console.log('Current user:', user);
    // if (!user) throw new Error('Not authenticated');
    
    // refreshSupabaseAuth();

    let query = supabase
      .from('batches')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        )
      `);

    console.log('Base query created');

    // Apply filters
    if (filters.program && filters.program !== 'all') {
      query = query.eq('program_id', filters.program);
      console.log('Applied program filter:', filters.program);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
      console.log('Applied status filter:', filters.status);
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
        console.log('Applied date filter:', startDate.toISOString());
      }
    }

    query = query.order('created_at', { ascending: false });
    console.log('About to execute query');

    const { data, error } = await query;
    console.log('Query result:', { data, error, dataLength: data?.length });

    if (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getBatches:', error);
    return { data: null, error: error.message };
  }
};

// Get batch by ID
export const getBatchById = async (id) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getBatchById:', error);
    return { data: null, error: error.message };
  }
};

// Get batches by program ID
export const getBatchesByProgram = async (programId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        )
      `)
      .eq('program_id', programId)
      .eq('status', 'Open')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching batches by program:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getBatchesByProgram:', error);
    return { data: null, error: error.message };
  }
};

// Create a new batch
export const createBatch = async (batchData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const dataToInsert = {
      ...batchData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('batches')
      .insert([dataToInsert])
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        )
      `)
      .single();

    if (error) {
      console.error('Error creating batch:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createBatch:', error);
    return { data: null, error: error.message };
  }
};

// Update batch
export const updateBatch = async (id, batchData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const dataToUpdate = {
      ...batchData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('batches')
      .update(dataToUpdate)
      .eq('id', id)
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        )
      `)
      .single();

    if (error) {
      console.error('Error updating batch:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateBatch:', error);
    return { data: null, error: error.message };
  }
};

// Delete batch
export const deleteBatch = async (id) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error in deleteBatch:', error);
    return { data: null, error: error.message };
  }
};

// Update batch enrollment count
export const updateBatchEnrollment = async (batchId, increment = true) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Get current batch data
    const { data: batch, error: fetchError } = await getBatchById(batchId);
    if (fetchError) throw fetchError;

    const newEnrolled = increment ? batch.enrolled + 1 : Math.max(0, batch.enrolled - 1);
    const newStatus = newEnrolled >= batch.capacity ? 'Full' : 'Open';

    const { data, error } = await supabase
      .from('batches')
      .update({ 
        enrolled: newEnrolled,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', batchId)
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        )
      `)
      .single();

    if (error) {
      console.error('Error updating batch enrollment:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateBatchEnrollment:', error);
    return { data: null, error: error.message };
  }
}; 