import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Presentation } from 'lucide-react';

export default function SelectRolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function selectRole(role) {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // If already has a role, redirect
      if (userDoc.exists() && userDoc.data().role) {
        const existingRole = userDoc.data().role;
        navigate(existingRole === 'tutor' ? '/tutor' : '/student');
        return;
      }

      const fullData = { email: user.email, role };
      if (role === 'tutor') {
        fullData.profileCompleted = false;
        fullData.profileSubmitted = false;
        fullData.status = null;
        fullData.approvalSeen = false;
        fullData.submittedAt = null;
        fullData.rejectionReason = null;
        fullData.reviewedAt = null;
        fullData.profileImageUrl = null;
        fullData.documentUrl = null;
      }

      if (!userDoc.exists()) {
        fullData.createdAt = serverTimestamp();
        await setDoc(userDocRef, fullData);
      } else {
        if (!userDoc.data().createdAt) {
          fullData.createdAt = serverTimestamp();
        }
        await setDoc(userDocRef, fullData, { merge: true });
      }

      navigate(role === 'tutor' ? '/tutor' : '/student');
    } catch (err) {
      console.error("Role update error:", err);
      setError('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try { await signOut(auth); } catch {}
    navigate('/login');
  }

  return (
    <div className="select-role-page">
      <div className="brand-header">
        <img src="/assets/logo.png" alt="Logo" className="logo" style={{ marginRight: 12 }} />
        <div className="logo-text">
          <h1>Delhi <span>Private</span><br />Tutors</h1>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={handleLogout} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Sign Out</button>
      </div>

      <div className="card" style={{ display: loading ? 'none' : 'block' }}>
        <h2>Welcome!</h2>
        <p>Please select your account type to continue.</p>

        <div className="role-options">
          <button className="role-btn role-btn-student" onClick={() => selectRole('student')} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
            <BookOpen size={20} />
            Continue as Student / Parent
          </button>

          <button className="role-btn role-btn-tutor" onClick={() => selectRole('tutor')} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
            <Presentation size={20} />
            Continue as Tutor
          </button>
        </div>

        {error && <div className="error-msg" style={{ display: 'block' }}>{error}</div>}
      </div>

      {loading && (
        <div className="loading-overlay">
          <h2>Setting up your dashboard...</h2>
          <p style={{ color: '#8892B0', marginTop: '1rem' }}>This will only take a moment</p>
        </div>
      )}
    </div>
  );
}
