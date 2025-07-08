import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Dashboard2 from "./components/dashboard/Dashboard2";
import Analytics from "./components/analytics/Analytics";
import StudentManagement from "./components/students/StudentManagement";
import StudentManagement2 from "./components/students/StudentManagement2";
import MarketingStudentManagement from "./components/marketing/StudentManagement";
import CounselorPerformance from "./components/counselor/CounselorPerformance";
import InquiryManagement from "./components/inquiry/InquiryManagement";
import AdvancedInquiryManagement from "./components/inquiry/AdvancedInquiryManagement";
import Programs from "./components/programs/Programs";
import ProgramManagement from "./components/manager/ProgramManagement";
import Batches from "./components/batches/Batches";
import BatchManagement from "./components/manager/BatchManagement";
import BatchView from "./components/marketing/BatchView";
import Enrollments from "./components/enrollments/Enrollments";
import Registrations from "./components/registrations/Registrations";
import Schedules from "./components/schedules/Schedules";
import PaymentManagement from "./components/payments/PaymentManagement";
import CurrencySupport from "./components/currency/CurrencySupport";
import StudentDiscount from "./components/discount/StudentDiscount";
import NotificationManagement from "./components/notifications/NotificationManagement";
import NotificationCenter from "./components/marketing/NotificationCenter";
import { AIPredictionProvider } from "./context/AIPredictionContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import EnrollmentRegistrationManagement2 from "./components/enrollments/EnrollmentRegistrationManagement2";
import AdvancedInquiries from "./components/manager/AdvancedInquiries";
import EnrollmentRegistrationManagement from "./components/manager/EnrollmentRegistrationManagement";
import Setup from "./pages/Setup";

// Create router configuration with basename
const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <AIPredictionProvider>
            <Layout />
          </AIPredictionProvider>
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: (
            <ProtectedRoute>
              {({ user }) =>
                user?.role === "manager" ? <Dashboard2 /> : <Dashboard />
              }
            </ProtectedRoute>
          ),
        },
        {
          path: "analytics",
          element: <Analytics />,
        },
        {
          path: "student-management",
          element: (
            <ProtectedRoute>
              {({ user }) =>
                user?.role === "manager" ? (
                  <StudentManagement />
                ) : (
                  <MarketingStudentManagement />
                )
              }
            </ProtectedRoute>
          ),
        },
        {
          path: "student-management2",
          element: <StudentManagement2 />,
        },
        {
          path: "counselor-performance",
          element: <CounselorPerformance />,
        },
        {
          path: "inquiry-management",
          element: <InquiryManagement />,
        },
        {
          path: "advanced-inquiry",
          element: <AdvancedInquiryManagement />,
        },
        {
          path: "advanced-inquiries",
          element: <AdvancedInquiries />,
        },
        {
          path: "programs",
          element: <Programs />,
        },
        {
          path: "programs2",
          element: <ProgramManagement />,
        },
        {
          path: "enrollments",
          element: <Enrollments />,
        },
        {
          path: "registrations",
          element: <Registrations />,
        },
        {
          path: "batches",
          element: (
            <ProtectedRoute>
              {({ user }) =>
                user?.role === "manager" ? <BatchManagement /> : <BatchView />
              }
            </ProtectedRoute>
          ),
        },
        {
          path: "schedules",
          element: <Schedules />,
        },
        {
          path: "payment-management",
          element: <PaymentManagement />,
        },
        {
          path: "currency-support",
          element: <CurrencySupport />,
        },
        {
          path: "student-discount",
          element: <StudentDiscount />,
        },
        {
          path: "enrollment-registration2",
          element: <EnrollmentRegistrationManagement2 />,
        },
        {
          path: "enrollment-registration-management",
          element: <EnrollmentRegistrationManagement />,
        },
        {
          path: "notification-management",
          element: <NotificationManagement />,
        },
        {
          path: "notification-center",
          element: <NotificationCenter />,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ],
  {
    basename: "/SMISFrontend",
  }
);

const App = () => {
  return (
    <>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster position="top-right" />
    </>
  );
};

export default App;
