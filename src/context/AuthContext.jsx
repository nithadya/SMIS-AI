import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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

      // Set user data in state
      setUser(userData);

      // Return success and redirect to root path
      return { 
        success: true,
        redirectTo: '/'  // This will show the correct dashboard based on role
      };
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
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