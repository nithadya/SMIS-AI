import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghnlwaxzzqxlegrrdrhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobmx3YXh6enF4bGVncnJkcmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTY0NzksImV4cCI6MjA2NTM3MjQ3OX0.uHhVjC7m38uoDqicEkYgnkeNwG_nSYzjRbO9fJ8GVHk';

// Create a Supabase client with the anonymous key
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't persist the session
  }
});

// Function to get the current user's email
const getCurrentUserEmail = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).email : null;
};

// Add an interceptor to add the user's email to each request
supabase.realtime.setAuth(getCurrentUserEmail() || 'anonymous');

export { supabase }; 