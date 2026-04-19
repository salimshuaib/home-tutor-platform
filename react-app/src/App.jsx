import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import SelectRolePage from './pages/auth/SelectRolePage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Landing
import HomePage from './pages/landing/HomePage';

// Dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import TutorDashboard from './pages/tutor/TutorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Auth required — no specific role */}
            <Route path="/select-role" element={
              <ProtectedRoute><SelectRolePage /></ProtectedRoute>
            } />

            {/* Student dashboard */}
            <Route path="/student/*" element={
              <ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>
            } />

            {/* Tutor dashboard */}
            <Route path="/tutor/*" element={
              <ProtectedRoute requiredRole="tutor"><TutorDashboard /></ProtectedRoute>
            } />

            {/* Admin dashboard */}
            <Route path="/admin/*" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
