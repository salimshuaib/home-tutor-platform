import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { Mail, Phone, Calendar, Pencil, Save, Lock } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

export default function StudentProfile() {
  const { user, profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [msg, setMsg] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const initials = (profile?.fullName || 'S').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—';

  async function saveProfile() {
    try {
      await updateDoc(doc(db, 'users', user.uid), { fullName: name, phone });
      setMsg({ type: 'success', text: 'Profile updated!' });
      setEditing(false);
    } catch { setMsg({ type: 'error', text: 'Failed to update.' }); }
    setTimeout(() => setMsg(null), 4000);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    try {
      const cred = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, pwForm.newPw);
      setPwMsg({ type: 'success', text: 'Password changed!' });
      setTimeout(() => setShowPw(false), 2000);
    } catch { setPwMsg({ type: 'error', text: 'Error changing password.' }); }
  }

  return (
    <>
      <div className="page-header"><h1 className="page-title">My <em>Profile</em></h1></div>
      <div className="card">
        {msg && <div className={`msg-bar msg-${msg.type}`} style={{ display: 'flex' }}>{msg.text}</div>}
        <div className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            {editing ? (
              <>
                <input className="profile-edit-input" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 8 }} />
                <div className="profile-role">Student / Parent</div>
                <div className="profile-detail"><Mail size={16} /> {user?.email}</div>
                <div className="profile-detail"><Phone size={16} /> <input className="profile-edit-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" /></div>
              </>
            ) : (
              <>
                <h2>{profile?.fullName || 'Student'}</h2>
                <div className="profile-role">Student / Parent</div>
                <div className="profile-detail"><Mail size={16} /> {user?.email}</div>
                <div className="profile-detail"><Phone size={16} /> {profile?.phone || 'Not provided'}</div>
                <div className="profile-detail"><Calendar size={16} /> Member since {memberSince}</div>
              </>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {editing ? (
                <button className="btn btn-outline btn-sm" onClick={saveProfile}><Save size={14} /> Save</button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit Profile</button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setShowPw(true)}><Lock size={14} /> Change Password</button>
            </div>
          </div>
        </div>
      </div>

      {showPw && (
        <Modal title="Change Password" onClose={() => setShowPw(false)} size="sm">
          {pwMsg && <div className={`msg-bar msg-${pwMsg.type}`} style={{ display: 'flex' }}>{pwMsg.text}</div>}
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} required minLength={6} /></div>
            <div className="form-group"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required minLength={6} /></div>
            <button type="submit" className="btn btn-primary"><Lock size={16} /> Update Password</button>
          </form>
        </Modal>
      )}
    </>
  );
}
