import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        setIsAdmin(adminDoc.exists());
      } catch (err) {
        console.error('Admin check failed:', err);
        setIsAdmin(false);
      }
      setChecking(false);
    }
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="loading-overlay">
        <h2>Verifying access...</h2>
        <p style={{ color: '#8892B0', marginTop: '1rem' }}>Checking admin credentials</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
