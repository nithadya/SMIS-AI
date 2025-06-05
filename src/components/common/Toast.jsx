import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export const Toast = () => {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 3000,
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f9fafb' : '#111827',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
        },
        loading: {
          iconTheme: {
            primary: '#8B5CF6',
            secondary: 'white',
          },
        },
      }}
    />
  );
};

// Helper functions for showing toasts
export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  custom: (message, options) => toast(message, options),
}; 