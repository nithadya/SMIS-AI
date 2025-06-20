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

    // For marketing users, show only published events
    if (user.role === 'counselor') {
      query = query.eq('is_published', true);
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

// Function to generate secure token
const generateSecureToken = () => {
  // Generate a secure token that's guaranteed to be under 255 characters
  return crypto.randomUUID();
};

// Function to get students by marketing person (counselor)
export const getStudentsByMarketingPerson = async (counselorEmail) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        created_by
      `)
      .eq('created_by', counselorEmail);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching students by marketing person:', error);
    return { data: null, error: error.message };
  }
};

// Function to send event notification emails with booking functionality
export const generateEventNotificationEmails = async (eventId, targetCounselors = []) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    refreshSupabaseAuth();

    // Get event details
    const { data: event, error: eventError } = await getCampusEventById(eventId);
    if (eventError) throw new Error(eventError);

    // Get all counselors if none specified
    let counselorsToNotify = targetCounselors;
    if (!counselorsToNotify.length) {
      const { data: counselors, error: counselorError } = await getCounselors();
      if (counselorError) throw new Error(counselorError);
      counselorsToNotify = counselors.map(c => c.email);
    }

    // Get all students for the specified counselors
    let allStudents = [];
    for (const counselorEmail of counselorsToNotify) {
      const { data: students, error: studentsError } = await getStudentsByMarketingPerson(counselorEmail);
      if (!studentsError && students) {
        allStudents = [...allStudents, ...students];
      }
    }

    if (!allStudents.length) {
      throw new Error('No students found for the specified marketing personnel');
    }

    // Generate tokens for each student
    const tokens = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    for (const student of allStudents) {
      const token = generateSecureToken();
      tokens.push({
        event_id: eventId,
        student_email: student.email,
        token: token,
        expires_at: expiresAt.toISOString(),
        is_used: false
      });
    }

    // Store tokens in database
    const { error: tokenError } = await supabase
      .from('event_notification_tokens')
      .insert(tokens);

    if (tokenError) throw tokenError;

    // Prepare email content for manual sending
    const baseUrl = window.location.origin;
    const bookingUrl = `${baseUrl}/book-seat`;
    
    // Collect all email addresses
    const allEmailAddresses = allStudents.map(student => student.email);
    
    // Prepare email content (plain text version for manual sending)
    const subject = `🎉 Event Invitation: ${event.title} - Book Your Seat!`;
    
         // Create personalized email content with booking codes
     const studentsWithTokens = allStudents.map((student, index) => ({
       ...student,
       token: tokens[index].token
     }));

     const emailBody = `Dear Students,

You are invited to an exciting upcoming event!

EVENT DETAILS:
═══════════════════════════════════════════════════════════════
📅 Event: ${event.title}
📆 Date: ${new Date(event.start_date).toLocaleDateString()}
⏰ Time: ${event.start_time || 'TBD'} - ${event.end_time || 'TBD'}
📍 Location: ${event.location || 'TBD'}
${event.capacity ? `🎫 Capacity: ${event.capacity} seats` : ''}
🆔 Event ID: ${eventId}

📝 Description: ${event.description || ''}
═══════════════════════════════════════════════════════════════

🎯 HOW TO BOOK YOUR SEAT:
1. Visit our booking portal: ${bookingUrl}
2. Enter your email address
3. Enter Event ID: ${eventId}
4. Enter your unique booking code (see individual student list below)

📧 STUDENT BOOKING CODES:
${studentsWithTokens.map(student => 
`• ${student.first_name} ${student.last_name} (${student.email}): ${student.token}`
).join('\n')}

⚠️ IMPORTANT NOTES:
• Each student must use their unique booking code
• Booking codes expire in 7 days
• Seats are limited and allocated on a first-come, first-served basis
• Please forward this email to the respective students or inform them of their booking codes
• If you have any questions, please contact your counselor or the administration office

We look forward to seeing you at this event!

Best regards,
SMIS - Student Management Information System

═══════════════════════════════════════════════════════════════
This is an automated invitation. Please do not reply to this email.
`;

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('event_notifications')
      .insert({
        event_id: eventId,
        notification_type: 'email_manual',
        target_type: 'counselor_students',
        target_criteria: { counselors: counselorsToNotify },
        recipient_count: allStudents.length,
        sent_count: 0, // Will be updated manually
        failed_count: 0,
        status: 'prepared',
        sent_at: new Date().toISOString(),
        notification_content: {
          subject: subject,
          template: 'event_booking_invitation_manual',
          body: emailBody
        },
        created_by: user.email
      })
      .select()
      .single();

    if (notificationError) throw notificationError;

    // Generate mailto link
    const maxUrlLength = 2000; // Safe URL length for most email clients
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(emailBody);
    
    // If the full body is too long, use a shorter version
    let finalBody = emailBody;
    let finalEncodedBody = encodedBody;
    
    const baseMailtoUrl = `mailto:?subject=${encodedSubject}&body=`;
    const bodyLength = baseMailtoUrl.length + finalEncodedBody.length;
    
    if (bodyLength > maxUrlLength) {
      // Create a shorter version
      const shortBody = `Dear Students,

You are invited to: ${event.title}
Date: ${new Date(event.start_date).toLocaleDateString()}
Time: ${event.start_time || 'TBD'} - ${event.end_time || 'TBD'}
Location: ${event.location || 'TBD'}
Event ID: ${eventId}

To book your seat:
1. Visit: ${bookingUrl}  
2. Use Event ID: ${eventId}
3. Use your unique booking code (contact counselor for code)

Best regards,
SMIS Team

Note: Full details with booking codes are in the original email.`;
      
      finalEncodedBody = encodeURIComponent(shortBody);
    }

    const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${finalEncodedBody}`;

    return {
      data: {
        notification,
        mailtoUrl,
        allEmailAddresses,
        subject,
        body: finalBody,
        totalStudents: allStudents.length,
        tokens: tokens.map(t => ({ student_email: t.student_email, token: t.token }))
      },
      error: null
    };

  } catch (error) {
    console.error('Error generating event notification emails:', error);
    return { data: null, error: error.message };
  }
};

// Function to handle seat booking from email link
export const bookEventSeat = async (eventId, studentEmail, token) => {
  try {
    refreshSupabaseAuth();

    // Verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from('event_notification_tokens')
      .select('*')
      .eq('token', token)
      .eq('event_id', eventId)
      .eq('student_email', studentEmail)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Invalid or expired booking link');
    }

    // Get student data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('email', studentEmail)
      .single();

    if (studentError || !student) {
      throw new Error('Student not found');
    }

    // Check if student is already registered
    const { data: existingRegistration, error: checkError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('student_id', student.id)
      .single();

    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }

    // Register student for event
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: student.id,
        registration_source: 'email_link',
        status: 'registered',
        created_by: 'system'
      })
      .select()
      .single();

    if (registrationError) throw registrationError;

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('event_notification_tokens')
      .update({ is_used: true, updated_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (updateTokenError) throw updateTokenError;

    // Update event registered count
    const { error: updateEventError } = await supabase
      .rpc('increment_event_registration_count', { event_id: eventId });

    if (updateEventError) throw updateEventError;

    return { data: registration, error: null };

  } catch (error) {
    console.error('Error booking event seat:', error);
    return { data: null, error: error.message };
  }
};

// Function to create the increment function in database
export const createIncrementFunction = async () => {
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION increment_event_registration_count(event_id UUID)
        RETURNS void AS $$
        BEGIN
          UPDATE campus_events 
          SET registered_count = registered_count + 1 
          WHERE id = event_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error creating increment function:', error);
    return { error: error.message };
  }
}; 