import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AvailabilityPage from './pages/AvailabilityPage';
import AuthPage from './pages/AuthPage';
import BookingCancelledPage from './pages/BookingCancelledPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingsPage from './pages/BookingsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PublicBookingPage from './pages/PublicBookingPage';
import ServicesPage from './pages/ServicesPage';
import PaymentsPage from './pages/PaymentsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminLoginPage from './admin/AdminLoginPage';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const hasToken = Boolean(localStorage.getItem('token'));

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const hasToken = Boolean(localStorage.getItem('token'));

  if (hasToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const hasAdminToken = Boolean(localStorage.getItem('adminToken'));

  if (!hasAdminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default function App() {
  return (
   
      <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
        <Route path="/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
        <Route path="/book/:slug" element={<PublicBookingPage />} />
        <Route path="/public/:slug" element={<PublicBookingPage />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="/booking/cancelled" element={<BookingCancelledPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
   
  );
}
