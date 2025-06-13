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

export const createUsers = async () => {
  for (const user of users) {
    try {
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
        console.error(`Error creating user ${user.email}:`, error.message);
        continue;
      }

      // Insert into users table
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name
          }
        ]);

      if (userError) {
        console.error(`Error inserting user data for ${user.email}:`, userError.message);
      }
    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error.message);
    }
  }
}; 