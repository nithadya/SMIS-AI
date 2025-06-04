import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';
import StudentManagement from '../components/students/StudentManagement';
import InquiryManagement from '../components/inquiry/InquiryManagement';
import Programs from '../components/programs/Programs';
import Batches from '../components/batches/Batches';
import Enrollments from '../components/enrollments/Enrollments';
import Registrations from '../components/registrations/Registrations';
import Schedules from '../components/schedules/Schedules';
import Payments from '../components/payments/Payments';
import CurrencySupport from '../components/currency/CurrencySupport';
import StudentDiscount from '../components/discount/StudentDiscount';
import Analytics from '../components/analytics/Analytics';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/student-management" element={<StudentManagement />} />
      <Route path="/inquiry-management" element={<InquiryManagement />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/batches" element={<Batches />} />
      <Route path="/enrollments" element={<Enrollments />} />
      <Route path="/registrations" element={<Registrations />} />
      <Route path="/schedules" element={<Schedules />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/currency-support" element={<CurrencySupport />} />
      <Route path="/student-discount" element={<StudentDiscount />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
};

export default AppRoutes; 