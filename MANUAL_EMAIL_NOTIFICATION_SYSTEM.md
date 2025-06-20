# Manual Email Notification System

## Overview
The SMIS event notification system has been updated to use a manual email approach instead of automated email sending. This ensures reliable email delivery by leveraging the user's default email client.

## How It Works

### 1. Event Creation and Management
- Create events through the Schedules interface
- Set event capacity limits for registration tracking
- Publish events to make them available for student registration

### 2. Notification Process

#### Step 1: Select Event and Recipients
1. Navigate to **Schedules** page
2. Find the event you want to notify students about
3. Click the **"Notify"** button on the event card
4. Select which counselors' students should be notified:
   - Check individual counselors
   - Use "Select All" for all counselors
   - Only students registered under selected counselors will be included

#### Step 2: Generate Email Content
1. Click **"📧 Open Email Client"** button
2. The system will:
   - Generate unique booking codes for each student
   - Create personalized email content with event details
   - Prepare recipient list with all student email addresses
   - Store booking tokens in the database

#### Step 3: Manual Email Sending
1. Your default email client will open automatically with:
   - **To:** All student email addresses (pre-filled)
   - **Subject:** Event invitation with booking details
   - **Body:** Complete event information including:
     - Event details (title, date, time, location)
     - Event ID for booking
     - Individual booking codes for each student
     - Instructions for booking seats

2. **Simply click "Send" in your email client**

## Student Booking Process

### For Students:
1. Receive email with event invitation
2. Visit the booking portal at: `[Your Domain]/book-seat`
3. Enter required information:
   - **Email Address:** Their registered email
   - **Event ID:** Provided in the invitation email
   - **Booking Code:** Their unique code from the email
4. Click "Book My Seat" to confirm registration

### Booking Portal Features:
- Real-time event detail display
- Form validation
- Success/error messaging
- Automatic seat booking confirmation
- Database updates for attendance tracking

## Technical Features

### Security & Validation
- **Unique Tokens:** Each student gets a unique booking code
- **Email Verification:** Booking codes are tied to specific email addresses
- **Expiration:** Booking codes expire after 7 days
- **One-Time Use:** Each booking code can only be used once
- **Event Validation:** System validates event ID exists and is active

### Database Integration
- **Real-time Tracking:** Automatic registration count updates
- **Audit Trail:** Complete record of notifications and bookings
- **Capacity Management:** Prevents overbooking based on event capacity
- **Status Tracking:** Monitor notification delivery and booking statistics

## Email Content Structure

### Full Email Content Includes:
```
📅 Event: [Event Title]
📆 Date: [Event Date]
⏰ Time: [Start Time - End Time]
📍 Location: [Event Location]
🆔 Event ID: [Event ID for booking]
🎫 Capacity: [Available seats]

📝 Description: [Event description]

🎯 HOW TO BOOK YOUR SEAT:
1. Visit our booking portal: [Booking URL]
2. Enter your email address
3. Enter Event ID: [Event ID]
4. Enter your unique booking code

📧 STUDENT BOOKING CODES:
• [Student Name] ([email]): [Unique Code]
• [Student Name] ([email]): [Unique Code]
...

⚠️ IMPORTANT NOTES:
• Each student must use their unique booking code
• Booking codes expire in 7 days
• Seats are limited and allocated first-come, first-served
• Please forward this email to students or inform them of their codes
```

## Benefits of Manual Email Approach

### Reliability
- ✅ No dependency on external email services
- ✅ Uses your familiar email client and SMTP settings
- ✅ Guaranteed delivery through your existing email infrastructure
- ✅ No email service API keys or configurations needed

### Control & Flexibility
- ✅ Full control over when emails are sent
- ✅ Ability to customize content before sending
- ✅ Option to add additional recipients manually
- ✅ Can save as draft for review before sending

### Compliance & Security
- ✅ Uses your organization's email security policies
- ✅ Maintains email audit trails in your system
- ✅ No third-party email service data handling
- ✅ Full compliance with your email governance

## Troubleshooting

### If Email Client Doesn't Open:
1. Check your default email client settings
2. Manually copy the email content and recipient list
3. Create a new email in your preferred client
4. The notification system will still generate the booking codes

### If Students Can't Book:
1. Verify they're using the correct Event ID
2. Check if their email matches the registered student email
3. Ensure booking code hasn't expired (7 days)
4. Confirm the booking code hasn't been used already

### For Large Email Lists:
- If recipient list is too large for your email client, the system provides a shorter email version
- Consider breaking notifications into smaller groups by selecting fewer counselors at once

## System Requirements
- Modern web browser with mailto: protocol support
- Default email client configured (Outlook, Thunderbird, Apple Mail, etc.)
- Internet connection for accessing the booking portal
- Students need access to web browser for booking

## Future Enhancements
- Email template customization
- Bulk booking code generation for offline distribution
- SMS notification integration
- Advanced reporting and analytics
- Calendar integration for event reminders 