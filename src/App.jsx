import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './components/dashboard/Dashboard';
import Dashboard2 from './components/dashboard/Dashboard2';
import Analytics from './components/analytics/Analytics';
import StudentManagement from './components/students/StudentManagement';
import StudentManagement2 from './components/students/StudentManagement2';
import CounselorPerformance from './components/counselor/CounselorPerformance';
import InquiryManagement from './components/inquiry/InquiryManagement';
import AdvancedInquiryManagement from './components/inquiry/AdvancedInquiryManagement';
import Programs from './components/programs/Programs';
import ProgramManagement2 from './components/programs/ProgramManagement2';
import Batches from './components/batches/Batches';
import Enrollments from './components/enrollments/Enrollments';
import Registrations from './components/registrations/Registrations';
import Schedules from './components/schedules/Schedules';
import Payments from './components/payments/Payments';
import CurrencySupport from './components/currency/CurrencySupport';
import StudentDiscount from './components/discount/StudentDiscount';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EnrollmentRegistrationManagement2 from './components/enrollments/EnrollmentRegistrationManagement2';
import Setup from './pages/Setup';

// Create router configuration with basename
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <ProtectedRoute>
          {({ user }) => user?.role === 'manager' ? <Dashboard2 /> : <Dashboard />}
        </ProtectedRoute>
      },
      {
        path: 'analytics',
        element: <Analytics />
      },
      {
        path: 'student-management',
        element: <StudentManagement />
      },
      {
        path: 'student-management2',
        element: <StudentManagement2 />
      },
      {
        path: 'counselor-performance',
        element: <CounselorPerformance />
      },
      {
        path: 'inquiry-management',
        element: <InquiryManagement />
      },
      {
        path: 'advanced-inquiry',
        element: <AdvancedInquiryManagement />
      },
      {
        path: 'programs',
        element: <Programs />
      },
      {
        path: 'programs2',
        element: <ProgramManagement2 />
      },
      {
        path: 'enrollments',
        element: <Enrollments />
      },
      {
        path: 'registrations',
        element: <Registrations />
      },
      {
        path: 'batches',
        element: <Batches />
      },
      {
        path: 'schedules',
        element: <Schedules />
      },
      {
        path: 'payments',
        element: <Payments />
      },
      {
        path: 'currency-support',
        element: <CurrencySupport />
      },
      {
        path: 'student-discount',
        element: <StudentDiscount />
      },
      {
        path: 'enrollment-registration2',
        element: <EnrollmentRegistrationManagement2 />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
], {
  basename: '/SMISFrontend'
});

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
        <Toaster position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
