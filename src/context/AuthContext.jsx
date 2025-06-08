import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const users = {
  'manager@gmail.com': { password: 'manager123', role: 'manager' },
  'marketing@gmail.com': { password: 'marketing123', role: 'marketing' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const userInfo = users[email];
    if (userInfo && userInfo.password === password) {
      setUser({ email, role: userInfo.role });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 