import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { handleError } from '../../utils/errorHandler';
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resending, setResending] = useState(false);

  function normalizeRole(role) {
    const r = (role || '').toLowerCase();
    if (r === 'student' || r === 'parent') return 'student';
    if (r === 'tutor') return 'tutor';
    if (r === 'admin') return 'admin';
    return null;
  }

  function redirectByRole(role) {
    const r = normalizeRole(role);
    if (r === 'admin') navigate('/admin');
    else if (r === 'tutor') navigate('/tutor');
    else if (r === 'student') navigate('/student');
    else navigate('/select-role');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowVerifyBanner(false);
    setLoading(true);

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
      if (!isGoogle && !user.emailVerified) {
        setShowVerifyBanner(true);
        setLoading(false);
        return;
      }

      // Check admin
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().role === 'admin') {
          navigate('/admin');
          return;
        }
      } catch {}

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          role: null,
          email: user.email,
          fullName: user.displayName || '',
          createdAt: serverTimestamp()
        });
        navigate('/select-role');
        return;
      }

      const role = normalizeRole(userDoc.data().role);
      if (!role) navigate('/select-role');
      else redirectByRole(role);

    } catch (err) {
      const msg = handleError(err, 'Login');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in AuthContext handles the rest
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            role: null,
            email: user.email,
            fullName: user.displayName || '',
            createdAt: serverTimestamp()
          });
          navigate('/select-role');
        } else {
          // Check admin
          try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) { navigate('/admin'); return; }
          } catch {}
          const role = normalizeRole(userDoc.data().role);
          if (!role) navigate('/select-role');
          else redirectByRole(role);
        }
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(handleError(err, 'Google Sign-In'));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address above, then click "Forgot password?"');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('A password reset link has been sent to your email.');
      setError('');
    } catch (err) {
      setError(handleError(err, 'Forgot password'));
    }
  }

  async function resendVerification() {
    setResending(true);
    try {
      const user = auth.currentUser;
      if (!user) { setError('No session found. Please sign up again.'); return; }
      await sendEmailVerification(user);
      setSuccess('Verification email sent! Check your inbox and spam folder.');
    } catch (err) {
      setError(handleError(err, 'Resend verification'));
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
        <Link className="nav-back" to="/">
          ← Back to Home
        </Link>
      </nav>

      <main className="login-page">
        <div className="login-bg" />
        <div className="login-grid-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="login-container">
          {/* LEFT — Branding */}
          <div className="login-branding">
            <div className="branding-content">
              <img src="/assets/logo.png" alt="Logo" className="logo" style={{ height: 64, marginBottom: 28 }} />
              <h1 className="branding-heading">
                Find the <span className="accent">Right Tutor</span>
              </h1>
              <p className="branding-desc">
                Post your tuition requirement for free and get connected with verified, qualified home tutors across Delhi within 24 hours.
              </p>
              <div className="branding-stats">
                <div>
                  <div className="branding-stat-num">2,500+</div>
                  <div className="branding-stat-label">Active Tutors</div>
                </div>
                <div>
                  <div className="branding-stat-num">8,000+</div>
                  <div className="branding-stat-label">Happy Students</div>
                </div>
                <div>
                  <div className="branding-stat-num">4.9★</div>
                  <div className="branding-stat-label">Avg. Rating</div>
                </div>
              </div>
              <div className="branding-trust">
                <span className="branding-trust-badge"><ShieldCheck size={14} /> Verified & Trusted</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="login-form-panel">
            <div className="mode-toggle">
              <button className="mode-btn active">Log In</button>
              <Link to="/signup" className="mode-btn" style={{ textDecoration: 'none' }}>Sign Up</Link>
            </div>

            <h2 className="form-heading">Welcome back</h2>
            <p className="form-subheading">Sign in to find the right tutor for your needs</p>

            {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
            {success && <div className="success-message" style={{ display: 'block' }}>{success}</div>}

            {showVerifyBanner && (
              <div className="verification-banner" style={{ display: 'block' }}>
                <div className="vb-icon">📧</div>
                <div className="vb-heading">Please verify your email before continuing</div>
                <div className="vb-text">We sent a verification link to {email}. Check your inbox and spam/junk folder, then come back and log in.</div>
                <button className="btn-resend" disabled={resending} onClick={resendVerification}>
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input className="form-input" type="email" id="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input className="form-input" type={showPassword ? 'text' : 'password'} id="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-extras">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember me
                </label>
                <a href="#" className="forgot-link" onClick={handleForgotPassword}>Forgot password?</a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                <LogIn size={16} />
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <button className="btn-google" onClick={handleGoogle} disabled={googleLoading}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18, flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.04 10.04 0 0 0 1.14 12c0 1.62.39 3.16 1.04 4.52l3.66-2.43z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div className="form-footer">
              Don't have an account? <Link to="/signup">Create one now</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
