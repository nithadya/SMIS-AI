import { supabase } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get all programs with comprehensive data
export const getAllPrograms = async (filters = {}) => {
  try {
    let query = supabase
      .from('programs')
      .select(`
        *,
        fee_structure (*),
        international_fee_structure (*),
        program_marketing_materials (*),
        payment_installment_plans (*)
      `);

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    if (filters.level && filters.level !== 'all') {
      query = query.eq('level', filters.level);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getAllPrograms:', error);
    return { data: null, error: error.message };
  }
};

// Get program by ID with all related data
export const getProgramById = async (programId) => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select(`
        *,
        fee_structure (*),
        international_fee_structure (*),
        program_marketing_materials (*),
        payment_installment_plans (*),
        batches:batches(
          id,
          batch_code,
          name,
          start_date,
          end_date,
          status,
          capacity,
          enrolled
        )
      `)
      .eq('id', programId)
      .single();

    if (error) {
      console.error('Error fetching program by ID:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getProgramById:', error);
    return { data: null, error: error.message };
  }
};

// Create new program
export const createProgram = async (programData) => {
  try {
    const currentUser = getCurrentUser();
    
    const programPayload = {
      ...programData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('programs')
      .insert([programPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating program:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createProgram:', error);
    return { data: null, error: error.message };
  }
};

// Update program
export const updateProgram = async (programId, programData) => {
  try {
    const currentUser = getCurrentUser();
    
    const programPayload = {
      ...programData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('programs')
      .update(programPayload)
      .eq('id', programId)
      .select()
      .single();

    if (error) {
      console.error('Error updating program:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateProgram:', error);
    return { data: null, error: error.message };
  }
};

// Archive program (soft delete by setting status to 'Archived')
export const archiveProgram = async (programId) => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .update({ 
        status: 'Archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', programId)
      .select()
      .single();

    if (error) {
      console.error('Error archiving program:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in archiveProgram:', error);
    return { data: null, error: error.message };
  }
};

// Delete program (hard delete - permanently removes from database)
export const deleteProgram = async (programId) => {
  try {
    // First delete related data
    await Promise.all([
      supabase.from('fee_structure').delete().eq('program_id', programId),
      supabase.from('international_fee_structure').delete().eq('program_id', programId),
      supabase.from('program_marketing_materials').delete().eq('program_id', programId),
      supabase.from('payment_installment_plans').delete().eq('program_id', programId)
    ]);

    // Then delete the program
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId);

    if (error) {
      console.error('Error deleting program:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteProgram:', error);
    return { error: error.message };
  }
};

// Delete multiple programs
export const deleteMultiplePrograms = async (programIds) => {
  try {
    const results = await Promise.all(
      programIds.map(id => deleteProgram(id))
    );

    const errors = results.filter(result => result.error).map(result => result.error);
    
    if (errors.length > 0) {
      throw new Error(`Failed to delete some programs: ${errors.join(', ')}`);
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteMultiplePrograms:', error);
    return { error: error.message };
  }
};

// Fee Structure Management
export const getFeeStructure = async (programId) => {
  try {
    const { data, error } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching fee structure:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getFeeStructure:', error);
    return { data: null, error: error.message };
  }
};

export const createFeeStructure = async (feeData) => {
  try {
    const feePayload = {
      ...feeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('fee_structure')
      .insert([feePayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating fee structure:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createFeeStructure:', error);
    return { data: null, error: error.message };
  }
};

export const updateFeeStructure = async (feeId, feeData) => {
  try {
    const feePayload = {
      ...feeData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('fee_structure')
      .update(feePayload)
      .eq('id', feeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating fee structure:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateFeeStructure:', error);
    return { data: null, error: error.message };
  }
};

export const deleteFeeStructure = async (feeId) => {
  try {
    const { error } = await supabase
      .from('fee_structure')
      .delete()
      .eq('id', feeId);

    if (error) {
      console.error('Error deleting fee structure:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteFeeStructure:', error);
    return { error: error.message };
  }
};

// International Fee Structure Management
export const getInternationalFeeStructure = async (programId) => {
  try {
    const { data, error } = await supabase
      .from('international_fee_structure')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching international fee structure:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getInternationalFeeStructure:', error);
    return { data: null, error: error.message };
  }
};

export const createInternationalFeeStructure = async (feeData) => {
  try {
    const feePayload = {
      ...feeData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('international_fee_structure')
      .insert([feePayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating international fee structure:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createInternationalFeeStructure:', error);
    return { data: null, error: error.message };
  }
};

// Marketing Materials Management
export const getMarketingMaterials = async (programId) => {
  try {
    const { data, error } = await supabase
      .from('program_marketing_materials')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketing materials:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getMarketingMaterials:', error);
    return { data: null, error: error.message };
  }
};

export const createMarketingMaterial = async (materialData) => {
  try {
    const currentUser = getCurrentUser();
    
    const materialPayload = {
      ...materialData,
      created_by: currentUser?.email || 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('program_marketing_materials')
      .insert([materialPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating marketing material:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createMarketingMaterial:', error);
    return { data: null, error: error.message };
  }
};

export const updateMarketingMaterial = async (materialId, materialData) => {
  try {
    const currentUser = getCurrentUser();
    
    const materialPayload = {
      ...materialData,
      updated_by: currentUser?.email || 'system',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('program_marketing_materials')
      .update(materialPayload)
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error updating marketing material:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateMarketingMaterial:', error);
    return { data: null, error: error.message };
  }
};

export const deleteMarketingMaterial = async (materialId) => {
  try {
    const { data, error } = await supabase
      .from('program_marketing_materials')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting marketing material:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in deleteMarketingMaterial:', error);
    return { data: null, error: error.message };
  }
};

// Search programs
export const searchPrograms = async (searchTerm, filters = {}) => {
  try {
    let query = supabase
      .from('programs')
      .select(`
        *,
        fee_structure (*),
        international_fee_structure (*),
        program_marketing_materials (*)
      `);

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    if (filters.level && filters.level !== 'all') {
      query = query.eq('level', filters.level);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: allPrograms, error } = await query;

    if (error) {
      console.error('Error searching programs:', error);
      throw error;
    }

    // If no search term, return all results
    if (!searchTerm || !searchTerm.trim()) {
      return { data: allPrograms, error: null };
    }

    // Filter results client-side for better handling
    const searchPattern = searchTerm.trim().toLowerCase();
    const filteredPrograms = allPrograms.filter(program => {
      return (
        (program.name && program.name.toLowerCase().includes(searchPattern)) ||
        (program.code && program.code.toLowerCase().includes(searchPattern)) ||
        (program.description && program.description.toLowerCase().includes(searchPattern)) ||
        (program.category && program.category.toLowerCase().includes(searchPattern))
      );
    });

    return { data: filteredPrograms, error: null };
  } catch (error) {
    console.error('Error in searchPrograms:', error);
    return { data: null, error: error.message };
  }
};

// Get program statistics
export const getProgramStats = async () => {
  try {
    const { data: programs, error: programsError } = await supabase
      .from('programs')
      .select('id, status, category, level, created_at');

    if (programsError) {
      throw programsError;
    }

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('program_id');

    if (enrollmentsError) {
      throw enrollmentsError;
    }

    const stats = {
      total: programs.length,
      active: programs.filter(p => p.status === 'Active').length,
      inactive: programs.filter(p => p.status === 'Inactive').length,
      draft: programs.filter(p => p.status === 'Draft').length,
      archived: programs.filter(p => p.status === 'Archived').length,
      byCategory: {},
      byLevel: {},
      enrollmentCount: {}
    };

    // Calculate by category
    programs.forEach(program => {
      if (!stats.byCategory[program.category]) {
        stats.byCategory[program.category] = 0;
      }
      stats.byCategory[program.category]++;
    });

    // Calculate by level
    programs.forEach(program => {
      if (!stats.byLevel[program.level]) {
        stats.byLevel[program.level] = 0;
      }
      stats.byLevel[program.level]++;
    });

    // Calculate enrollment count per program
    enrollments.forEach(enrollment => {
      if (enrollment.program_id) {
        if (!stats.enrollmentCount[enrollment.program_id]) {
          stats.enrollmentCount[enrollment.program_id] = 0;
        }
        stats.enrollmentCount[enrollment.program_id]++;
      }
    });

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error in getProgramStats:', error);
    return { data: null, error: error.message };
  }
};

// Get programs dropdown data (for other components)
export const getProgramsDropdown = async () => {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('id, name, code, status')
      .eq('status', 'Active')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching programs dropdown:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getProgramsDropdown:', error);
    return { data: null, error: error.message };
  }
};

// Duplicate program
export const duplicateProgram = async (programId, newProgramData = {}) => {
  try {
    // Get original program
    const { data: originalProgram, error: fetchError } = await getProgramById(programId);
    
    if (fetchError || !originalProgram) {
      throw new Error('Failed to fetch original program');
    }

    // Create new program data
    const duplicatedProgram = {
      ...originalProgram,
      ...newProgramData,
      name: newProgramData.name || `${originalProgram.name} (Copy)`,
      code: newProgramData.code || `${originalProgram.code}_COPY`,
      status: 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove ID and other auto-generated fields
    delete duplicatedProgram.id;
    delete duplicatedProgram.fee_structure;
    delete duplicatedProgram.international_fee_structure;
    delete duplicatedProgram.program_marketing_materials;
    delete duplicatedProgram.payment_installment_plans;
    delete duplicatedProgram.batches;

    const { data: newProgram, error: createError } = await createProgram(duplicatedProgram);

    if (createError) {
      throw createError;
    }

    return { data: newProgram, error: null };
  } catch (error) {
    console.error('Error in duplicateProgram:', error);
    return { data: null, error: error.message };
  }
}; 