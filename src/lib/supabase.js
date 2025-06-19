import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ghnlwaxzzqxlegrrdrhz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobmx3YXh6enF4bGVncnJkcmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTY0NzksImV4cCI6MjA2NTM3MjQ3OX0.uHhVjC7m38uoDqicEkYgnkeNwG_nSYzjRbO9fJ8GVHk';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Function to get the current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Export a function to refresh auth when needed
export const refreshSupabaseAuth = () => {
  // Since RLS is disabled, we don't need complex auth setup
  return true;
};

// Debug logging in development
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Environment:', import.meta.env.VITE_NODE_ENV || 'development');
}

export { supabase }; 