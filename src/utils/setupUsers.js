import { supabase } from '../lib/supabase';

const users = [
  {
    email: 'danusha@smis.edu.lk',
    password: 'danusha123',
    role: 'manager',
    full_name: 'Danusha'
  },
  {
    email: 'udeshi@smis.edu.lk',
    password: 'udeshi123',
    role: 'counselor',
    full_name: 'Udeshi'
  },
  {
    email: 'himas@smis.edu.lk',
    password: 'himas123',
    role: 'counselor',
    full_name: 'Himas'
  },
  {
    email: 'ashani@smis.edu.lk',
    password: 'ashani123',
    role: 'counselor',
    full_name: 'Ashani'
  },
  {
    email: 'fairy@smis.edu.lk',
    password: 'fairy123',
    role: 'counselor',
    full_name: 'Fairy'
  }
];

export const setupUsers = async () => {
  for (const user of users) {
    try {
      // Check if user already exists in Auth
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.full_name,
              role: user.role
            }
          }
        });

        if (error) {
          console.error(`Error creating auth user ${user.email}:`, error.message);
          continue;
        }

        console.log(`Created user ${user.email} successfully`);
      } else {
        console.log(`User ${user.email} already exists`);
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error.message);
    }
  }
}; 