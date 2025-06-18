import { supabase, refreshSupabaseAuth } from '../supabase';

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Campus Events API

export const createCampusEvent = async (eventData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const cleanedData = {
      ...eventData,
      created_by: user.email,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('campus_events')
      .insert([cleanedData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating campus event:', error);
    return { data: null, error: error.message };
  }
};

export const getCampusEvents = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    let query = supabase
      .from('campus_events')
      .select(`
        *,
        event_registrations (
          id,
          student_id,
          status,
          registration_date,
          students (
            id,
            first_name,
            last_name,
            email
          )
        ),
        event_notifications (
          id,
          target_type,
          status,
          sent_count,
          recipient_count
        )
      `);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.event_type && filters.event_type !== 'all') {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.date_from) {
      query = query.gte('start_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('start_date', filters.date_to);
    }

    // For marketing users, show only published events unless they created them
    if (user.role === 'counselor') {
      query = query.or(`is_published.eq.true,created_by.eq.${user.email}`);
    }

    query = query.order('start_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching campus events:', error);
    return { data: null, error: error.message };
  }
};

export const getCampusEventById = async (eventId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('campus_events')
      .select(`
        *,
        event_registrations (
          id,
          student_id,
          status,
          registration_date,
          attendance_marked_at,
          students (
            id,
            first_name,
            last_name,
            email,
            phone,
            programs (
              name,
              code
            ),
            batches (
              batch_code,
              name
            )
          )
        ),
        event_notifications (
          id,
          target_type,
          status,
          sent_count,
          recipient_count,
          sent_at,
          notification_content
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching campus event:', error);
    return { data: null, error: error.message };
  }
};

export const updateCampusEvent = async (eventId, eventData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const cleanedData = {
      ...eventData,
      updated_by: user.email,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('campus_events')
      .update(cleanedData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating campus event:', error);
    return { data: null, error: error.message };
  }
};

export const deleteCampusEvent = async (eventId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { error } = await supabase
      .from('campus_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting campus event:', error);
    return { error: error.message };
  }
};

export const publishCampusEvent = async (eventId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('campus_events')
      .update({
        is_published: true,
        status: 'published',
        updated_by: user.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error publishing campus event:', error);
    return { data: null, error: error.message };
  }
};

// Event Notifications API

export const sendEventNotification = async (eventId, notificationOptions) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Get event details
    const { data: event, error: eventError } = await getCampusEventById(eventId);
    if (eventError) throw new Error(eventError);

    // Get target students based on criteria
    let targetStudents = [];
    const { target_type, target_criteria = {} } = notificationOptions;

    if (target_type === 'counselor_students') {
      // Get students assigned to the current counselor
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id, first_name, last_name, email, phone,
          enrollments (
            counselor_id,
            users:counselor_id (
              full_name,
              email
            )
          ),
          programs (
            id, name, code
          )
        `)
        .eq('academic_status', 'Active');
      
      if (studentsError) throw studentsError;
      
      // Filter students by current user's counselor assignments
      targetStudents = (students || []).filter(student => 
        student.enrollments && 
        student.enrollments.some(enrollment => enrollment.counselor_id === user.id)
      );
    } else if (target_type === 'all_students') {
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id, first_name, last_name, email, phone,
          programs (
            id, name, code
          )
        `)
        .eq('academic_status', 'Active');
      
      if (studentsError) throw studentsError;
      targetStudents = students || [];
    }

    // Create notification content
    const notificationContent = {
      subject: `Important Campus Event: ${event.title}`,
      body: generateEventEmailBody(event, user),
      event_details: {
        title: event.title,
        description: event.description,
        start_date: event.start_date,
        start_time: event.start_time,
        location: event.location
      }
    };

    // Create notification record
    const notificationRecord = {
      event_id: eventId,
      notification_type: 'email',
      target_type,
      target_criteria,
      recipient_count: targetStudents.length,
      status: 'sent',
      sent_count: targetStudents.length,
      failed_count: 0,
      notification_content: notificationContent,
      sent_at: new Date().toISOString(),
      created_by: user.email
    };

    const { data: notification, error: notificationError } = await supabase
      .from('event_notifications')
      .insert([notificationRecord])
      .select()
      .single();

    if (notificationError) throw notificationError;

    // Log the email sending (in a real implementation, integrate with email service)
    console.log(`Email notification sent to ${targetStudents.length} students about ${event.title}`);
    
    return {
      data: {
        notification_id: notification.id,
        total_recipients: targetStudents.length,
        sent_count: targetStudents.length,
        event_title: event.title
      },
      error: null
    };
  } catch (error) {
    console.error('Error sending event notification:', error);
    return { data: null, error: error.message };
  }
};

// Helper function to generate email body
const generateEventEmailBody = (event, sender) => {
  const eventDate = new Date(event.start_date).toLocaleDateString();
  const eventTime = event.start_time || 'TBD';
  
  return `Dear Student,

We are pleased to inform you about an upcoming campus event:

Event: ${event.title}
Date: ${eventDate}
Time: ${eventTime}
Location: ${event.location || 'TBD'}

${event.description || ''}

We look forward to your participation!

Best regards,
${sender.full_name || sender.email}
SMIS - Student Management Information System`;
};

// Get Counselors for notification targeting
export const getCounselors = async () => {
  try {
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'counselor')
      .order('full_name');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching counselors:', error);
    return { data: null, error: error.message };
  }
};

// Get Programs for targeting
export const getPrograms = async () => {
  try {
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('programs')
      .select('id, name, code')
      .eq('status', 'Active')
      .order('name');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching programs:', error);
    return { data: null, error: error.message };
  }
};

// Event Registrations API

export const registerStudentForEvent = async (eventId, studentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const registrationData = {
      event_id: eventId,
      student_id: studentId,
      registration_source: 'manual',
      created_by: user.email
    };

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([registrationData])
      .select(`
        *,
        students (
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) throw error;

    // Update event registered count
    const { error: updateError } = await supabase
      .rpc('increment_event_registration_count', { event_id: eventId });
    
    if (updateError) console.warn('Failed to update registration count:', updateError);

    return { data, error: null };
  } catch (error) {
    console.error('Error registering student for event:', error);
    return { data: null, error: error.message };
  }
};

export const unregisterStudentFromEvent = async (eventId, studentId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('student_id', studentId);

    if (error) throw error;

    // Update event registered count
    const { error: updateError } = await supabase
      .rpc('decrement_event_registration_count', { event_id: eventId });
    
    if (updateError) console.warn('Failed to update registration count:', updateError);

    return { error: null };
  } catch (error) {
    console.error('Error unregistering student from event:', error);
    return { error: error.message };
  }
};

export const markEventAttendance = async (eventId, studentId, attended = true) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('event_registrations')
      .update({
        status: attended ? 'attended' : 'no_show',
        attendance_marked_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marking event attendance:', error);
    return { data: null, error: error.message };
  }
};

// Notification Templates API

export const getNotificationTemplates = async () => {
  try {
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return { data: null, error: error.message };
  }
};

// Statistics and Analytics

export const getEventStatistics = async (eventId) => {
  try {
    refreshSupabaseAuth();

    const { data: event, error: eventError } = await getCampusEventById(eventId);
    if (eventError) throw eventError;

    const registrations = event.event_registrations || [];
    const notifications = event.event_notifications || [];

    const stats = {
      total_registrations: registrations.length,
      attended: registrations.filter(r => r.status === 'attended').length,
      no_shows: registrations.filter(r => r.status === 'no_show').length,
      pending: registrations.filter(r => r.status === 'registered').length,
      capacity_utilization: event.capacity ? (registrations.length / event.capacity) * 100 : 0,
      notifications_sent: notifications.reduce((sum, n) => sum + (n.sent_count || 0), 0),
      total_recipients: notifications.reduce((sum, n) => sum + (n.recipient_count || 0), 0)
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    return { data: null, error: error.message };
  }
}; 