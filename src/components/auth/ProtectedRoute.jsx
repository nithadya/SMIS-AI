import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If children is a function, call it with the user
  if (typeof children === 'function') {
    return children({ user });
  }

  return children;
};

export default ProtectedRoute; 