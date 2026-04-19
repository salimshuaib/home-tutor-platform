import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      if (user.emailVerified) {
        redirectByRole();
      }
    } else {
      const stored = sessionStorage.getItem('verifyEmail');
      if (stored) setEmail(stored);
      else navigate('/login');
    }
  }, [user]);

  async function redirectByRole() {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? (userDoc.data().role || 'student') : 'student';
      navigate(role === 'tutor' ? '/tutor' : '/student');
    } catch {
      navigate('/student');
    }
  }

  async function checkVerification() {
    setChecking(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Session expired. Please go back and log in again.');
        setChecking(false);
        return;
      }

      await currentUser.reload();

      if (currentUser.emailVerified) {
        setSuccess('Email verified! Redirecting to your dashboard...');
        sessionStorage.removeItem('verifyEmail');
        sessionStorage.removeItem('pendingVerification');
        setTimeout(() => redirectByRole(), 1000);
      } else {
        setError('Email not yet verified. Please click the verification link in your inbox first.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function resendEmail() {
    setResending(true);
    setError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('Session expired. Please go back and sign up again.');
        return;
      }
      await sendEmailVerification(currentUser);
      setSuccess('Verification email sent! Check your inbox and spam folder.');
    } catch (e) {
      if (e.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError('Failed to resend. Please try again.');
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <nav>
        <Link className="nav-logo" to="/">
          <img src="/assets/logo.png" alt="Logo" className="logo" />
          <div className="nav-logo-text">Delhi <span>Private</span><br />Tutors</div>
        </Link>
      </nav>

      <main className="verify-page">
        <div className="verify-bg" />
        <div className="verify-card">
          <div className="verify-icon">📧</div>
          <h1 className="verify-heading">Please verify your email</h1>
          <div className="verify-email-address">{email}</div>
          <p className="verify-text">
            We've sent a verification link to your email address. Please check your <strong>inbox</strong> and <strong>spam/junk folder</strong>, click the verification link, then come back and press the button below.
          </p>

          {error && <div className="msg-box msg-error" style={{ display: 'block' }}>{error}</div>}
          {success && <div className="msg-box msg-success" style={{ display: 'block' }}>{success}</div>}

          <div className="verify-actions">
            <button className="btn-verified" onClick={checkVerification} disabled={checking}>
              <CheckCircle size={16} />
              {checking ? 'Checking...' : 'I Have Verified My Email'}
            </button>
            <button className="btn-resend" onClick={resendEmail} disabled={resending}>
              <Mail size={16} />
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>

          <div className="verify-footer">
            Wrong email? <Link to="/login">Go back and sign up again</Link>
          </div>
        </div>
      </main>
    </>
  );
}
