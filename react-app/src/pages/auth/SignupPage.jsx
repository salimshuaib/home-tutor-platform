import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { handleError } from '../../utils/errorHandler';
import { Eye, EyeOff, UserPlus, BookOpen, Presentation, ShieldCheck } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();

const BLOCKED_DOMAINS = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com'];

function isEmailBlocked(email) {
  if (!email) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase();
  return BLOCKED_DOMAINS.some(b => domain === b || domain.endsWith('.' + b));
}

export default function SignupPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  function normalizeRole(r) {
    const v = (r || '').toLowerCase();
    if (v === 'student' || v === 'parent') return 'student';
    if (v === 'tutor') return 'tutor';
    return null;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isEmailBlocked(email)) {
      setError('Temporary email addresses are not allowed. Please use a valid email.');
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const userData = {
        role,
        fullName,
        email,
        phone,
        createdAt: serverTimestamp()
      };

      if (role === 'tutor') {
        userData.profileCompleted = false;
        userData.profileSubmitted = false;
        userData.status = null;
        userData.approvalSeen = false;
        userData.submittedAt = null;
        userData.rejectionReason = null;
        userData.reviewedAt = null;
        userData.profileImageUrl = null;
        userData.documentUrl = null;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      try { await sendEmailVerification(user); } catch {}

      sessionStorage.setItem('verifyEmail', email);
      sessionStorage.setItem('pendingVerification', 'true');
      navigate('/verify-email');

    } catch (err) {
      setError(handleError(err, 'Signup'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
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
          const r = normalizeRole(userDoc.data().role);
          if (!r) navigate('/select-role');
          else navigate(r === 'tutor' ? '/tutor' : '/student');
        }
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(handleError(err, 'Google Sign-Up'));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  const brandingContent = role === 'student' ? {
    heading: <>Find the <span className="accent">Right Tutor</span></>,
    desc: 'Post your tuition requirement for free and get connected with verified, qualified home tutors across Delhi within 24 hours.'
  } : {
    heading: <>Start Getting <span className="accent">Tuition Leads</span></>,
    desc: 'Register as a verified tutor today. Get daily student leads in your area and build a strong, consistent income from tutoring.'
  };

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
              <h1 className="branding-heading">{brandingContent.heading}</h1>
              <p className="branding-desc">{brandingContent.desc}</p>
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
            {/* Role Selector — visible ONLY on signup */}
            <div className="role-selector" style={{ display: 'grid' }}>
              <button className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')} type="button">
                <div className="role-btn-icon"><BookOpen size={18} /></div>
                <div className="role-btn-label">I'm a Student / Parent</div>
              </button>
              <button className={`role-btn ${role === 'tutor' ? 'active' : ''}`} onClick={() => setRole('tutor')} type="button">
                <div className="role-btn-icon"><Presentation size={18} /></div>
                <div className="role-btn-label">I'm a Tutor</div>
              </button>
            </div>

            <div className="mode-toggle">
              <Link to="/login" className="mode-btn" style={{ textDecoration: 'none' }}>Log In</Link>
              <button className="mode-btn active">Sign Up</button>
            </div>

            <h2 className="form-heading">
              {role === 'student' ? 'Find the right tutor' : 'Start getting tuition leads'}
            </h2>
            <p className="form-subheading">
              {role === 'student'
                ? 'Create your account to post tuition inquiries for free'
                : 'Create your tutor account and start receiving student leads'}
            </p>

            {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}

            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label" htmlFor="full-name">Full Name</label>
                <input className="form-input" type="text" id="full-name" placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>

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

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input className="form-input" type="tel" id="phone" placeholder="+91 9XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                <UserPlus size={16} />
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
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
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
