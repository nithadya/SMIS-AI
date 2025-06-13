import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to get user from localStorage on initial load
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update localStorage whenever user changes
  useEffect(() => {
    const setupSession = async () => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        // Set the user's email as the current user for RLS policies
        await supabase.auth.setSession({
          access_token: user.email,
          refresh_token: user.email
        });
      } else {
        localStorage.removeItem('user');
        await supabase.auth.signOut();
      }
    };

    setupSession();
  }, [user]);

  const login = async (email, password) => {
    try {
      // Check email and password directly in the database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !userData) {
        console.error('Login error:', error?.message || 'Invalid credentials');
        return { success: false, error: 'Invalid email or password' };
      }

      // Set the user's email as the current user for RLS policies
      await supabase.auth.setSession({
        access_token: userData.email,
        refresh_token: userData.email
      });

      // Set user data in state (which will trigger the useEffect to save to localStorage)
      setUser(userData);

      return { 
        success: true,
        redirectTo: '/'  // This will show the correct dashboard based on role
      };
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 