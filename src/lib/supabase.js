import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ghnlwaxzzqxlegrrdrhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobmx3YXh6enF4bGVncnJkcmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTY0NzksImV4cCI6MjA2NTM3MjQ3OX0.uHhVjC7m38uoDqicEkYgnkeNwG_nSYzjRbO9fJ8GVHk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 