import { supabase } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Enhanced search functionality for managers - Fixed version
export const searchStudentsAdvanced = async (searchTerm, filters = {}) => {
  try {
    let query = supabase
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        city,
        country,
        enrollment_id,
        program_id,
        batch_id,
        enrollment_date,
        academic_status,
        previous_education,
        institution,
        year_completed,
        grade_results,
        created_at,
        updated_at,
        programs:program_id (
          id,
          name,
          code,
          duration,
          description
        ),
        batches:batch_id (
          id,
          batch_code,
          name,
          start_date,
          end_date,
          schedule,
          time_slot,
          lecturer,
          status
        ),
        enrollments:enrollment_id (
          id,
          status,
          current_step,
          created_at,
          updated_at,
          counselor_id
        )
      `);

    // Apply filters first
    if (filters.program && filters.program !== 'all') {
      query = query.eq('program_id', filters.program);
    }
    
    if (filters.batch && filters.batch !== 'all') {
      query = query.eq('batch_id', filters.batch);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('academic_status', filters.status);
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
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      if (startDate) {
        query = query.gte('enrollment_date', startDate.toISOString().split('T')[0]);
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data: allStudents, error } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    // If no search term, return all results
    if (!searchTerm || !searchTerm.trim()) {
      return { data: allStudents, error: null };
    }

    // Filter results client-side for better handling of special characters
    const searchPattern = searchTerm.trim().toLowerCase();
    const filteredStudents = allStudents.filter(student => {
      return (
        (student.student_id && student.student_id.toLowerCase().includes(searchPattern)) ||
        (student.first_name && student.first_name.toLowerCase().includes(searchPattern)) ||
        (student.last_name && student.last_name.toLowerCase().includes(searchPattern)) ||
        (student.email && student.email.toLowerCase().includes(searchPattern)) ||
        (student.phone && student.phone.toLowerCase().includes(searchPattern))
      );
    });

    return { data: filteredStudents, error: null };
  } catch (error) {
    console.error('Error in searchStudentsAdvanced:', error);
    return { data: null, error: error.message };
  }
};

// Get comprehensive student profile for managers
export const getStudentProfile = async (studentId) => {
  try {
    console.log('getStudentProfile called with studentId:', studentId);
    
    // Determine search field and clean up the ID
    const cleanedId = String(studentId).trim();
    const isUUID = cleanedId.includes('-') && cleanedId.length >= 30;
    const searchField = isUUID ? 'id' : 'student_id';
    
    console.log(`Searching by ${searchField} for value:`, cleanedId);

    // Get student data with relationships
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        programs:program_id (
          id,
          name,
          code,
          duration
        ),
        batches:batch_id (
          id,
          batch_code,
          start_date,
          end_date,
          time_slot,
          lecturer,
          capacity,
          enrolled,
          status
        ),
        enrollments:enrollment_id (
          id,
          status,
          current_step,
          created_at,
          updated_at,
          counselor_id,
          student_name
        )
      `)
      .eq(searchField, cleanedId);

    if (studentError) {
      console.error('Error fetching student profile:', studentError);
      return { data: null, error: studentError.message };
    }

    console.log('Student query result:', { count: studentData?.length, data: studentData });

    // Check if we found a student
    if (!studentData || studentData.length === 0) {
      console.warn(`Student with ${searchField} '${cleanedId}' not found`);
      
      // Try alternative lookup if initial search failed
      const alternativeField = isUUID ? 'student_id' : 'id';
      console.log(`Trying alternative search by ${alternativeField}...`);
      
      const { data: altStudentData, error: altError } = await supabase
        .from('students')
        .select(`
          *,
          programs:program_id (
            id,
            name,
            code,
            duration
          ),
          batches:batch_id (
            id,
            batch_code,
            start_date,
            end_date,
            time_slot,
            lecturer,
            capacity,
            enrolled,
            status
          ),
          enrollments:enrollment_id (
            id,
            status,
            current_step,
            created_at,
            updated_at,
            counselor_id,
            student_name
          )
        `)
        .eq(alternativeField, cleanedId);
      
      if (altError || !altStudentData || altStudentData.length === 0) {
        console.warn(`Student not found with either search method for ID: ${cleanedId}`);
        return { data: null, error: 'Student not found' };
      }
      
      console.log('Alternative search succeeded:', { count: altStudentData?.length });
      // Use alternative result
      const student = altStudentData[0];
      return await fetchStudentRelatedData(student);
    }

    // Take the first student if multiple found
    const student = studentData[0];
    console.log('Found student:', { id: student.id, student_id: student.student_id, name: `${student.first_name} ${student.last_name}` });
    
    return await fetchStudentRelatedData(student);
  } catch (error) {
    console.error('Error in getStudentProfile:', error);
    return { data: null, error: error.message };
  }
};

// Helper function to fetch related student data
const fetchStudentRelatedData = async (student) => {
  try {
    // Get payment history
    const { data: payments, error: paymentsError } = await supabase
      .from('student_payments')
      .select(`
        id,
        payment_type,
        amount,
        payment_method,
        payment_date,
        payment_status,
        receipt_number,
        description,
        created_at
      `)
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Get enrollment documents (only if enrollment_id exists)
    let documents = [];
    if (student.enrollment_id) {
      const { data: documentsData, error: documentsError } = await supabase
        .from('registration_documents')
        .select(`
          id,
          document_type,
          document_name,
          file_path,
          file_size,
          uploaded_at,
          uploaded_by
        `)
        .eq('enrollment_id', student.enrollment_id);

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
      } else {
        documents = documentsData || [];
      }
    }

    // Get enrollment notes (only if enrollment_id exists)
    let notes = [];
    if (student.enrollment_id) {
      const { data: notesData, error: notesError } = await supabase
        .from('enrollment_notes')
        .select(`
          id,
          content,
          author,
          created_at,
          updated_at
        `)
        .eq('enrollment_id', student.enrollment_id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
      } else {
        notes = notesData || [];
      }
    }

    console.log('Successfully fetched all student data:', {
      payments: payments?.length || 0,
      documents: documents.length,
      notes: notes.length
    });

    return {
      data: {
        student,
        payments: payments || [],
        documents,
        notes
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching student related data:', error);
    return { data: null, error: error.message };
  }
};

// Get student academic progress and performance analytics
export const getStudentAcademicAnalytics = async (studentId) => {
  try {
    const profileResult = await getStudentProfile(studentId);
    
    if (profileResult.error || !profileResult.data) {
      console.warn(`Unable to get student profile for ID ${studentId}:`, profileResult.error);
      return { data: null, error: profileResult.error || 'Student not found' };
    }

    const student = profileResult.data;

    // Calculate payment statistics
    const payments = student.payments || [];
    const totalPaid = payments
      .filter(p => p.payment_status === 'Completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const pendingPayments = payments
      .filter(p => p.payment_status === 'Pending')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Calculate enrollment progress
    const enrollmentData = student.student.enrollments;
    const progressPercentage = enrollmentData ? (enrollmentData.current_step / 6) * 100 : 0;

    // Performance indicators (mock for now - can be enhanced with actual grading system)
    const performanceMetrics = {
      gpa: 3.2 + Math.random() * 1.3, // Mock GPA between 3.2-4.5
      attendanceRate: 85 + Math.random() * 15, // Mock attendance 85-100%
      assignmentCompletion: 75 + Math.random() * 25, // Mock completion 75-100%
      participationScore: 80 + Math.random() * 20 // Mock participation 80-100%
    };

    // Risk assessment
    const riskFactors = [];
    if (performanceMetrics.gpa < 3.0) riskFactors.push('Low GPA');
    if (performanceMetrics.attendanceRate < 75) riskFactors.push('Poor Attendance');
    if (pendingPayments > 50000) riskFactors.push('Outstanding Payments');
    if (performanceMetrics.assignmentCompletion < 70) riskFactors.push('Assignment Delays');

    const riskLevel = riskFactors.length === 0 ? 'Low' : 
                    riskFactors.length <= 2 ? 'Medium' : 'High';

    return {
      data: {
        student: student.student,
        academicProgress: {
          enrollmentProgress: progressPercentage,
          currentStep: enrollmentData?.current_step || 1,
          enrollmentStatus: enrollmentData?.status || 'Active'
        },
        performance: performanceMetrics,
        financials: {
          totalPaid,
          pendingPayments,
          paymentHistory: payments,
          lastPayment: payments.length > 0 ? payments[0] : null
        },
        riskAssessment: {
          level: riskLevel,
          factors: riskFactors,
          recommendation: riskLevel === 'High' ? 'Requires immediate attention' :
                         riskLevel === 'Medium' ? 'Monitor closely' : 'On track'
        },
        documents: student.documents || [],
        notes: student.notes || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getStudentAcademicAnalytics:', error);
    return { data: null, error: error.message };
  }
};

// Get comprehensive student statistics for manager dashboard
export const getStudentManagementStats = async () => {
  try {
    // Get total student counts by status
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select('academic_status, program_id, enrollment_date, programs:program_id(name, code)');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      throw studentsError;
    }

    // Calculate status counts
    const statusCounts = allStudents.reduce((acc, student) => {
      acc[student.academic_status] = (acc[student.academic_status] || 0) + 1;
      return acc;
    }, {});

    // Calculate program distribution
    const programCounts = allStudents.reduce((acc, student) => {
      const programName = student.programs?.name || 'Unknown';
      acc[programName] = (acc[programName] || 0) + 1;
      return acc;
    }, {});

    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments = allStudents.filter(student => {
      if (!student.enrollment_date) return false;
      const enrollmentDate = new Date(student.enrollment_date);
      return enrollmentDate >= thirtyDaysAgo;
    });

    // Get payment statistics
    const { data: allPayments, error: paymentError } = await supabase
      .from('student_payments')
      .select('amount, payment_status, payment_date');

    let paymentStats = {
      totalRevenue: 0,
      pendingAmount: 0,
      monthlyRevenue: 0,
      totalTransactions: 0
    };

    if (!paymentError && allPayments) {
      const totalRevenue = allPayments
        .filter(p => p.payment_status === 'Completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      
      const pendingAmount = allPayments
        .filter(p => p.payment_status === 'Pending')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      const currentMonth = new Date();
      const monthlyRevenue = allPayments
        .filter(p => {
          if (!p.payment_date || p.payment_status !== 'Completed') return false;
          const paymentDate = new Date(p.payment_date);
          return paymentDate.getMonth() === currentMonth.getMonth() &&
                 paymentDate.getFullYear() === currentMonth.getFullYear();
        })
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      paymentStats = {
        totalRevenue,
        pendingAmount,
        monthlyRevenue,
        totalTransactions: allPayments.length
      };
    }

    return {
      data: {
        overview: {
          totalStudents: allStudents.length,
          activeStudents: statusCounts['Active'] || 0,
          graduatedStudents: statusCounts['Graduated'] || 0,
          suspendedStudents: statusCounts['Suspended'] || 0,
          withdrawnStudents: statusCounts['Withdrawn'] || 0,
          onHoldStudents: statusCounts['On Hold'] || 0
        },
        programDistribution: programCounts,
        recentEnrollments: recentEnrollments.slice(0, 10), // Limit to 10 recent enrollments
        financials: paymentStats
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getStudentManagementStats:', error);
    return { data: null, error: error.message };
  }
};

// Get student retention and performance analytics
export const getStudentRetentionAnalytics = async () => {
  try {
    // Get all students with their enrollment dates
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        academic_status,
        enrollment_date,
        graduation_date,
        programs:program_id (id, name)
      `);

    if (studentsError) {
      console.error('Error fetching students for analytics:', studentsError);
      throw studentsError;
    }

    // Calculate retention rates by program
    const programRetention = {};
    const overallStats = {
      totalEnrolled: students.length,
      active: 0,
      graduated: 0,
      withdrawn: 0,
      suspended: 0,
      onHold: 0
    };

    students.forEach(student => {
      const programName = student.programs?.name || 'Unknown';
      
      if (!programRetention[programName]) {
        programRetention[programName] = {
          total: 0,
          active: 0,
          graduated: 0,
          withdrawn: 0,
          retentionRate: 0
        };
      }

      programRetention[programName].total++;
      
      switch (student.academic_status) {
        case 'Active':
          programRetention[programName].active++;
          overallStats.active++;
          break;
        case 'Graduated':
          programRetention[programName].graduated++;
          overallStats.graduated++;
          break;
        case 'Withdrawn':
          programRetention[programName].withdrawn++;
          overallStats.withdrawn++;
          break;
        case 'Suspended':
          overallStats.suspended++;
          break;
        case 'On Hold':
          overallStats.onHold++;
          break;
      }
    });

    // Calculate retention rates (active + graduated / total)
    Object.keys(programRetention).forEach(program => {
      const data = programRetention[program];
      data.retentionRate = ((data.active + data.graduated) / data.total) * 100;
    });

    const overallRetentionRate = ((overallStats.active + overallStats.graduated) / overallStats.totalEnrolled) * 100;

    // Mock risk assessment data (can be enhanced with actual performance metrics)
    const riskAssessment = {
      highRisk: Math.floor(overallStats.active * 0.05), // 5% high risk
      mediumRisk: Math.floor(overallStats.active * 0.15), // 15% medium risk
      lowRisk: overallStats.active - Math.floor(overallStats.active * 0.2) // 80% low risk
    };

    return {
      data: {
        overview: {
          ...overallStats,
          retentionRate: overallRetentionRate
        },
        programRetention,
        riskAssessment,
        trends: {
          // Mock trend data - can be enhanced with historical data
          monthlyEnrollments: [45, 52, 38, 61, 49, 55], // Last 6 months
          monthlyWithdrawals: [2, 1, 3, 1, 2, 1],
          retentionTrend: [92, 91, 93, 92, 94, 92]
        }
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getStudentRetentionAnalytics:', error);
    return { data: null, error: error.message };
  }
};

// Add student note (for manager use)
export const addStudentNote = async (enrollmentId, noteContent) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('enrollment_notes')
      .insert({
        enrollment_id: enrollmentId,
        content: noteContent,
        author: currentUser.full_name || currentUser.email
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding student note:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in addStudentNote:', error);
    return { data: null, error: error.message };
  }
};

// Update student academic status
export const updateStudentStatus = async (studentId, newStatus, reason = '') => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Update student status
    const { data: student, error: updateError } = await supabase
      .from('students')
      .update({
        academic_status: newStatus,
        updated_at: new Date().toISOString(),
        updated_by: currentUser.email
      })
      .eq('id', studentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating student status:', updateError);
      throw updateError;
    }

    // Add note about status change
    if (student.enrollment_id && reason) {
      await addStudentNote(
        student.enrollment_id,
        `Academic status changed to ${newStatus}. Reason: ${reason}`
      );
    }

    return { data: student, error: null };
  } catch (error) {
    console.error('Error in updateStudentStatus:', error);
    return { data: null, error: error.message };
  }
};

// Get students by batch for manager batch management
export const getStudentsByBatch = async (batchId) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        last_name,
        email,
        phone,
        academic_status,
        enrollment_date,
        programs:program_id (name, code)
      `)
      .eq('batch_id', batchId)
      .order('student_id', { ascending: true });

    if (error) {
      console.error('Error fetching students by batch:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentsByBatch:', error);
    return { data: null, error: error.message };
  }
};

// Backwards compatibility functions
export const getStudents = async (filters = {}) => {
  return searchStudentsAdvanced('', filters);
};

export const getStudentById = async (id) => {
  const result = await getStudentProfile(id);
  return result.data ? { data: result.data.student, error: null } : result;
};

export const getStudentByStudentId = async (studentId) => {
  const result = await getStudentProfile(studentId);
  return result.data ? { data: result.data.student, error: null } : result;
};

// Student payment functions
export const getStudentPayments = async (studentId) => {
  try {
    const { data: payments, error } = await supabase
      .from('student_payments')
      .select('*')
      .eq('student_id', studentId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching student payments:', error);
      throw error;
    }

    return { data: payments, error: null };
  } catch (error) {
    console.error('Error in getStudentPayments:', error);
    return { data: null, error: error.message };
  }
};

export const addStudentPayment = async (paymentData) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('student_payments')
      .insert({
        ...paymentData,
        created_by: currentUser.email
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding student payment:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in addStudentPayment:', error);
    return { data: null, error: error.message };
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('students')
      .update({
        ...studentData,
        updated_at: new Date().toISOString(),
        updated_by: currentUser.email
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateStudent:', error);
    return { data: null, error: error.message };
  }
};

export const searchStudents = async (searchTerm) => {
  return searchStudentsAdvanced(searchTerm, {});
};

// Get student documents
export const getStudentDocuments = async (enrollmentId) => {
  try {
    const { data: documents, error } = await supabase
      .from('registration_documents')
      .select(`
        id,
        document_type,
        document_name,
        file_path,
        file_size,
        uploaded_at,
        uploaded_by
      `)
      .eq('enrollment_id', enrollmentId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching student documents:', error);
      throw error;
    }

    return { data: documents || [], error: null };
  } catch (error) {
    console.error('Error in getStudentDocuments:', error);
    return { data: null, error: error.message };
  }
};

// Get student statistics
export const getStudentStats = async () => {
  try {
    // Get total students count
    const { count: totalStudents, error: totalError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get active students count
    const { count: activeStudents, error: activeError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('academic_status', 'active');

    if (activeError) throw activeError;

    // Get students by program
    const { data: programData, error: programError } = await supabase
      .from('students')
      .select(`
        program_id,
        programs(name)
      `);

    if (programError) throw programError;

    // Count students by program
    const programStats = programData.reduce((acc, student) => {
      const programName = student.programs?.name || 'Unknown';
      acc[programName] = (acc[programName] || 0) + 1;
      return acc;
    }, {});

    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentEnrollments, error: recentError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .gte('enrollment_date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (recentError) throw recentError;

    const stats = {
      totalStudents: totalStudents || 0,
      activeStudents: activeStudents || 0,
      inactiveStudents: (totalStudents || 0) - (activeStudents || 0),
      recentEnrollments: recentEnrollments || 0,
      programDistribution: programStats
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error in getStudentStats:', error);
    return { data: null, error: error.message };
  }
};

// Payment summary function - delegates to payments API
export const getStudentPaymentSummaryByEnrollment = async (enrollmentId) => {
  try {
    // Import here to avoid circular dependency
    const { getStudentPaymentSummary } = await import('./payments.js');
    const data = await getStudentPaymentSummary(enrollmentId);
    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentPaymentSummaryByEnrollment:', error);
    return { data: null, error: error.message };
  }
}; 