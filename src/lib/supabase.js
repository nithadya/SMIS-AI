import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghnlwaxzzqxlegrrdrhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobmx3YXh6enF4bGVncnJkcmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTY0NzksImV4cCI6MjA2NTM3MjQ3OX0.uHhVjC7m38uoDqicEkYgnkeNwG_nSYzjRbO9fJ8GVHk';

// Create a Supabase client with the anonymous key
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Function to get the current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Setup auth header for all requests
const setupAuthHeader = () => {
  const user = getCurrentUser();
  if (user && user.email) {
    // For RLS policies - this is the critical part
    supabase.auth.setSession({
      access_token: user.email,
      refresh_token: user.email
    });
  }
};

// Call this function initially
setupAuthHeader();

// Export a function to refresh auth when needed
export const refreshSupabaseAuth = () => {
  setupAuthHeader();
};

export { supabase }; 