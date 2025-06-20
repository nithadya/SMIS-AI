import { supabase } from '../supabase';

// Auth helper functions
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const refreshSupabaseAuth = () => {
  // Since RLS is disabled, we don't need complex auth setup
  return true;
};

// Notification Types
export const NOTIFICATION_TYPES = {
  PAYMENT_REMINDER: 'payment_reminder',
  PROCESS_INCOMPLETE: 'process_incomplete',
  ENROLLMENT_PENDING: 'enrollment_pending',
  DOCUMENT_MISSING: 'document_missing',
  FOLLOW_UP_REQUIRED: 'follow_up_required',
  EVENT_REMINDER: 'event_reminder',
  GENERAL_ANNOUNCEMENT: 'general_announcement',
  DEADLINE_APPROACHING: 'deadline_approaching',
  STATUS_UPDATE: 'status_update'
};

// Target Types
export const TARGET_TYPES = {
  ALL_STUDENTS: 'all_students',
  COUNSELOR_STUDENTS: 'counselor_students',
  PROGRAM_STUDENTS: 'program_students',
  BATCH_STUDENTS: 'batch_students',
  PENDING_PAYMENT_STUDENTS: 'pending_payment_students',
  INCOMPLETE_PROCESS_STUDENTS: 'incomplete_process_students',
  SPECIFIC_STUDENTS: 'specific_students'
};

// Get all notifications with pagination and filtering
export const getNotifications = async (filters = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    let query = supabase
      .from('notifications')
      .select(`
        *,
        notification_recipients (
          id,
          status,
          delivered_at,
          read_at
        )
      `);

    // Apply filters
    if (filters.type && filters.type !== 'all') {
      query = query.eq('notification_type', filters.type);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    // For marketing users, only show their notifications
    if (user.role === 'counselor') {
      query = query.eq('created_by', user.email);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error: error.message };
  }
};

// Get notification statistics
export const getNotificationStatistics = async () => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    let notificationsQuery = supabase
      .from('notifications')
      .select('id, notification_type, status, recipient_count, sent_count');

    // For marketing users, only their notifications
    if (user.role === 'counselor') {
      notificationsQuery = notificationsQuery.eq('created_by', user.email);
    }

    const { data: notifications, error } = await notificationsQuery;
    if (error) throw error;

    const stats = {
      total: notifications?.length || 0,
      sent: notifications?.filter(n => n.status === 'sent').length || 0,
      pending: notifications?.filter(n => n.status === 'draft').length || 0,
      failed: notifications?.filter(n => n.status === 'failed').length || 0,
      totalRecipients: notifications?.reduce((sum, n) => sum + (n.recipient_count || 0), 0) || 0,
      totalSent: notifications?.reduce((sum, n) => sum + (n.sent_count || 0), 0) || 0,
      byType: {
        payment_reminder: notifications?.filter(n => n.notification_type === 'payment_reminder').length || 0,
        process_incomplete: notifications?.filter(n => n.notification_type === 'process_incomplete').length || 0,
        general_announcement: notifications?.filter(n => n.notification_type === 'general_announcement').length || 0,
        event_reminder: notifications?.filter(n => n.notification_type === 'event_reminder').length || 0,
      }
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    return { data: null, error: error.message };
  }
};



// Get students assigned to current counselor/marketing staff
export const getMyStudents = async () => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Get students through enrollments where counselor_id matches current user
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        programs (
          id,
          name,
          code
        ),
        enrollments!inner (
          id,
          counselor_id,
          status
        )
      `)
      .eq('enrollments.counselor_id', user.id)
      .eq('academic_status', 'Active');

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching my students:', error);
    return { data: null, error: error.message };
  }
};

// Email utility function to open default email client
const openEmailClient = (emailData) => {
  const { recipients, subject, body } = emailData;
  
  // Create mailto URL with multiple recipients
  const recipientEmails = recipients.map(r => r.email).join(';');
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  // Create mailto link
  const mailtoLink = `mailto:${recipientEmails}?subject=${encodedSubject}&body=${encodedBody}`;
  
  // Open default email client
  try {
    window.open(mailtoLink, '_self');
    return true;
  } catch (error) {
    console.error('Error opening email client:', error);
    return false;
  }
};

// Send notification to assigned students
export const sendNotificationToMyStudents = async (notificationData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Get assigned students
    const { data: students, error: studentsError } = await getMyStudents();
    if (studentsError) throw new Error(studentsError);

    if (!students || students.length === 0) {
      throw new Error('No students assigned to you');
    }

    // Create notification record
    const notification = {
      title: notificationData.title,
      content: notificationData.message,
      notification_type: 'general_announcement',
      target_type: 'counselor_students',
      target_criteria: { counselor_id: user.id },
      recipient_count: students.length,
      sent_count: 0,
      status: 'draft',
      priority: notificationData.priority || 'medium',
      created_by: user.email
    };

    const { data: notificationRecord, error: notificationError } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (notificationError) throw notificationError;

    // Create recipient records
    const recipients = students.map(student => ({
      notification_id: notificationRecord.id,
      recipient_type: 'student',
      recipient_id: student.id,
      recipient_email: student.email,
      status: 'pending',
      delivered_at: null
    }));

    const { error: recipientsError } = await supabase
      .from('notification_recipients')
      .insert(recipients);

    if (recipientsError) throw recipientsError;

    // Prepare email data
    const emailData = {
      recipients: students,
      subject: `SMIS Notification: ${notificationData.title}`,
      body: `Dear Students,

${notificationData.message}

Best regards,
${user.full_name}
Student Management Information System (SMIS)

---
This is an automated notification from SMIS. Please do not reply to this email.`
    };

    // Open email client
    const emailOpened = openEmailClient(emailData);
    
    if (emailOpened) {
      // Update notification status to sent (assuming user will send the email)
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_count: students.length,
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationRecord.id);

      if (updateError) throw updateError;

      // Update recipient status to sent
      const { error: recipientUpdateError } = await supabase
        .from('notification_recipients')
        .update({
          status: 'sent',
          delivered_at: new Date().toISOString()
        })
        .eq('notification_id', notificationRecord.id);

      if (recipientUpdateError) throw recipientUpdateError;
    }

    return { 
      data: { 
        notification: notificationRecord, 
        recipients: recipients.length,
        emails: students.map(s => s.email),
        emailOpened
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error sending notification to students:', error);
    return { data: null, error: error.message };
  }
};



// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Delete recipients first (foreign key constraint)
    const { error: recipientsError } = await supabase
      .from('notification_recipients')
      .delete()
      .eq('notification_id', notificationId);

    if (recipientsError) throw recipientsError;

    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { data: null, error: error.message };
  }
};

// Get students for notification targeting (for managers)
export const getStudentsForNotification = async (targetType, criteria = {}) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    let query = supabase
      .from('students')
      .select(`
        *,
        programs (
          id,
          name,
          code
        ),
        enrollments (
          id,
          counselor_id,
          status,
          users:counselor_id (
            full_name,
            email
          )
        )
      `)
      .eq('academic_status', 'Active');

    // Apply targeting criteria
    switch (targetType) {
      case 'counselor_students':
        if (criteria.counselor_id) {
          query = query.eq('enrollments.counselor_id', criteria.counselor_id);
        }
        break;
      case 'program_students':
        if (criteria.program_id) {
          query = query.eq('program_id', criteria.program_id);
        }
        break;
      case 'batch_students':
        if (criteria.batch_id) {
          query = query.eq('batch_id', criteria.batch_id);
        }
        break;
      // 'all_students' doesn't need additional filtering
    }

    const { data, error } = await query;
    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching students for notification:', error);
    return { data: null, error: error.message };
  }
};

// Send payment reminder (for managers)
export const sendPaymentReminder = async (targetType, criteria, customMessage) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // This would integrate with payment system to find students with pending payments
    // For now, we'll use a simplified approach
    const { data: students, error: studentsError } = await getStudentsForNotification(targetType, criteria);
    if (studentsError) throw new Error(studentsError);

    if (!students || students.length === 0) {
      throw new Error('No students found for the specified criteria');
    }

    const title = 'Payment Reminder';
    const content = customMessage || 
      `Dear Student,\n\nThis is a friendly reminder regarding your pending payment.\n\n` +
      `Please complete your payment at your earliest convenience to avoid any disruption to your studies.\n\n` +
      `If you have any questions or need assistance, please contact our finance department.\n\n` +
      `Best regards,\nSMIS Finance Team`;

    // Create and send notification (similar to other notification functions)
    // Implementation would be similar to sendNotificationToMyStudents
    
    return { data: { recipients: students.length }, error: null };
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return { data: null, error: error.message };
  }
};

// Send process incomplete notification (for managers)
export const sendProcessIncompleteNotification = async (processType, targetType, criteria, customMessage) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data: students, error: studentsError } = await getStudentsForNotification(targetType, criteria);
    if (studentsError) throw new Error(studentsError);

    if (!students || students.length === 0) {
      throw new Error('No students found for the specified criteria');
    }

    const title = `${processType} Process Reminder`;
    const content = customMessage || 
      `Dear Student,\n\nWe noticed that your ${processType.toLowerCase()} process is incomplete.\n\n` +
      `Please complete the required steps to continue with your enrollment.\n\n` +
      `If you need assistance, please contact your assigned counselor.\n\n` +
      `Best regards,\nSMIS Team`;

    // Create and send notification
    // Implementation would be similar to other notification functions
    
    return { data: { recipients: students.length }, error: null };
  } catch (error) {
    console.error('Error sending process incomplete notification:', error);
    return { data: null, error: error.message };
  }
};

// Send general notification (for managers)
export const sendGeneralNotification = async (targetType, criteria, title, message, priority) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data: students, error: studentsError } = await getStudentsForNotification(targetType, criteria);
    if (studentsError) throw new Error(studentsError);

    if (!students || students.length === 0) {
      throw new Error('No students found for the specified criteria');
    }

    // Create and send notification
    // Implementation would be similar to other notification functions
    
    return { data: { recipients: students.length }, error: null };
  } catch (error) {
    console.error('Error sending general notification:', error);
    return { data: null, error: error.message };
  }
}; 