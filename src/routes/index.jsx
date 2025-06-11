import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Lazy load components
const Dashboard = React.lazy(() => import('../components/dashboard/Dashboard'));
const Dashboard2 = React.lazy(() => import('../components/dashboard/Dashboard2'));
const StudentManagement = React.lazy(() => import('../components/students/StudentManagement'));
const StudentManagement2 = React.lazy(() => import('../components/students/StudentManagement2'));
const CounselorPerformance = React.lazy(() => import('../components/counselor/CounselorPerformance'));
const InquiryManagement = React.lazy(() => import('../components/inquiry/InquiryManagement'));
const AdvancedInquiryManagement = React.lazy(() => import('../components/inquiry/AdvancedInquiryManagement'));
const Programs = React.lazy(() => import('../components/programs/Programs'));
const Batches = React.lazy(() => import('../components/batches/Batches'));
const Enrollments = React.lazy(() => import('../components/enrollments/Enrollments'));
const Registrations = React.lazy(() => import('../components/registrations/Registrations'));
const Schedules = React.lazy(() => import('../components/schedules/Schedules'));
const Payments = React.lazy(() => import('../components/payments/Payments'));
const CurrencySupport = React.lazy(() => import('../components/currency/CurrencySupport'));
const StudentDiscount = React.lazy(() => import('../components/discount/StudentDiscount'));
const Analytics = React.lazy(() => import('../components/analytics/Analytics'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Main routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard2" element={<Dashboard2 />} />
        <Route path="/student-management/*" element={<StudentManagement />} />
        <Route path="/student-management2/*" element={<StudentManagement2 />} />
        <Route path="/counselor-performance/*" element={<CounselorPerformance />} />
        <Route path="/inquiry-management/*" element={<InquiryManagement />} />
        <Route path="/advanced-inquiry/*" element={<AdvancedInquiryManagement />} />
        <Route path="/programs/*" element={<Programs />} />
        <Route path="/batches/*" element={<Batches />} />
        <Route path="/enrollments/*" element={<Enrollments />} />
        <Route path="/registrations/*" element={<Registrations />} />
        <Route path="/schedules/*" element={<Schedules />} />
        <Route path="/payments/*" element={<Payments />} />
        <Route path="/currency-support" element={<CurrencySupport />} />
        <Route path="/student-discount" element={<StudentDiscount />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 