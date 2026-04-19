import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay">
        <h2>Loading...</h2>
        <p style={{ color: '#8892B0', marginTop: '1rem' }}>Setting up your dashboard</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has no role yet, send to select-role
  if (!userProfile?.role && requiredRole) {
    return <Navigate to="/select-role" replace />;
  }

  // If required role doesn't match
  if (requiredRole && userProfile?.role !== requiredRole) {
    const redirectTo = userProfile?.role === 'tutor' ? '/tutor' : '/student';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
