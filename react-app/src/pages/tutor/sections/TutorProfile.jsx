import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { Save, Send, Edit, AlertCircle, Clock as ClockIcon, CheckCircle } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Science', 'Computer Science', 'Accountancy', 'Business Studies', 'Economics'];
const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'];
const CLASSES = [{ v: '1-5', l: '1st – 5th' }, { v: '6-8', l: '6th – 8th' }, { v: '9-10', l: '9th – 10th' }, { v: '11-12', l: '11th – 12th' }, { v: 'College', l: 'College' }, { v: 'Competitive', l: 'Competitive Exams' }];
const MODES = ['Home Tuition', 'Online'];

export default function TutorProfile() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', experience: '', tagline: '', bio: '', area: '', city: 'New Delhi', fee: '', boards: [], subjects: [], classes: [], mode: [] });
  const [photoFile, setPhotoFile] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const isLocked = profile?.profileSubmitted && profile?.status === 'pending';

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '', phone: profile.phone || '', experience: profile.experience || '',
        tagline: profile.tagline || '', bio: profile.bio || '', area: profile.area || '',
        city: profile.city || 'New Delhi', fee: profile.fee || '',
        boards: profile.boards || [], subjects: profile.subjects || [], classes: profile.classes || [], mode: profile.mode || []
      });
    }
  }, [profile]);

  function toggleArr(key, val) {
    if (isLocked) return;
    setForm(p => ({ ...p, [key]: p[key].includes(val) ? p[key].filter(v => v !== val) : [...p[key], val] }));
  }
  function set(k, v) { if (isLocked) return; setForm(p => ({ ...p, [k]: v })); }

  const isSubmit = !profile?.profileSubmitted;
  const isReapply = profile?.status === 'rejected';

  async function handleSave() {
    setSaving(true); setMsg(null);

    const data = {
      ...form, experience: Number(form.experience) || 0, fee: Number(form.fee) || 0,
      location: form.area, preferredLocation: form.area, email: user.email, updatedAt: serverTimestamp()
    };

    if (isSubmit || isReapply) {
      if (!data.fullName || !data.phone || !data.area || !data.bio || data.subjects.length === 0 || data.classes.length === 0) {
        setMsg({ type: 'error', text: 'Please fill in all mandatory fields.' }); setSaving(false); return;
      }
      if (!profile?.profileImageUrl && !photoFile) { setMsg({ type: 'error', text: 'Please upload a Profile Photo.' }); setSaving(false); return; }
      if (!profile?.documentUrl && !certFile) { setMsg({ type: 'error', text: 'Please upload an Education Certificate.' }); setSaving(false); return; }
      data.status = 'pending'; data.rejectionReason = null; data.profileCompleted = true; data.profileSubmitted = true; data.submittedAt = serverTimestamp();
    }

    try {
      if (photoFile) {
        const photoRef = ref(storage, `tutors/${user.uid}/profile.jpg`);
        await uploadBytes(photoRef, photoFile);
        data.profileImageUrl = await getDownloadURL(photoRef);
      }
      if (certFile) {
        const certRef = ref(storage, `tutors/${user.uid}/certificate`);
        await uploadBytes(certRef, certFile);
        data.documentUrl = await getDownloadURL(certRef);
      }
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setMsg({ type: 'success', text: isSubmit || isReapply ? 'Profile submitted for approval!' : 'Profile updated!' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to save.' });
    }
    setSaving(false);
  }

  const statusBanner = () => {
    if (!profile?.profileSubmitted || !profile?.status) return (
      <div className="status-banner" style={{ background: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)', border: '1px solid #64B5F6', color: '#1565C0' }}>
        <Edit size={22} />
        <div className="banner-content"><div className="banner-title">Welcome to Delhi Private Tutors!</div><div className="banner-text">Complete your profile and upload documents to submit for review.</div></div>
      </div>
    );
    if (profile?.status === 'pending') return (
      <div className="status-banner pending"><ClockIcon size={22} /><div className="banner-content"><div className="banner-title">Profile Under Review</div><div className="banner-text">Your application is being reviewed by our team.</div></div></div>
    );
    if (profile?.status === 'approved') return (
      <div className="status-banner approved"><CheckCircle size={22} /><div className="banner-content"><div className="banner-title">Profile Approved!</div><div className="banner-text">You're verified and can access student leads.</div></div></div>
    );
    if (profile?.status === 'rejected') return (
      <div className="status-banner rejected"><AlertCircle size={22} /><div className="banner-content"><div className="banner-title">Profile Rejected</div><div className="banner-text">Reason: {profile.rejectionReason || 'No reason provided'}</div></div></div>
    );
    return null;
  };

  return (
    <>
      <div className="page-header"><h1 className="page-title">My <em>Profile</em></h1></div>
      {msg && <div className={`msg-bar msg-${msg.type}`} style={{ display: 'flex' }}>{msg.text}</div>}
      {statusBanner()}

      <div className="card">
        <div className="card-header"><h3 className="card-title">Basic Information</h3></div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} disabled={isLocked} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user?.email || ''} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} disabled={isLocked} /></div>
          <div className="form-group"><label className="form-label">Years of Experience</label><input className="form-input" type="number" value={form.experience} onChange={e => set('experience', e.target.value)} disabled={isLocked} /></div>
          <div className="form-group full"><label className="form-label">Tagline</label><input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} disabled={isLocked} placeholder="e.g. Math Expert with 5 years experience" /></div>
          <div className="form-group full"><label className="form-label">Bio</label><textarea className="form-textarea" value={form.bio} onChange={e => set('bio', e.target.value)} disabled={isLocked} style={{ minHeight: 100 }} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Subjects & Classes</h3></div>
        <div className="form-grid">
          <div className="form-group full"><label className="form-label">Boards You Teach</label>
            <div className="check-group">{BOARDS.map(b => <label key={b} className={`check-pill ${form.boards.includes(b) ? 'selected' : ''}`}><input type="checkbox" hidden checked={form.boards.includes(b)} onChange={() => toggleArr('boards', b)} />{b}</label>)}</div>
          </div>
          <div className="form-group full"><label className="form-label">Subjects You Teach</label>
            <div className="check-group">{SUBJECTS.map(s => <label key={s} className={`check-pill ${form.subjects.includes(s) ? 'selected' : ''}`}><input type="checkbox" hidden checked={form.subjects.includes(s)} onChange={() => toggleArr('subjects', s)} />{s}</label>)}</div>
          </div>
          <div className="form-group full"><label className="form-label">Classes You Teach</label>
            <div className="check-group">{CLASSES.map(c => <label key={c.v} className={`check-pill ${form.classes.includes(c.v) ? 'selected' : ''}`}><input type="checkbox" hidden checked={form.classes.includes(c.v)} onChange={() => toggleArr('classes', c.v)} />{c.l}</label>)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Location & Teaching Mode</h3></div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Area</label><input className="form-input" value={form.area} onChange={e => set('area', e.target.value)} disabled={isLocked} /></div>
          <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} disabled={isLocked} /></div>
          <div className="form-group full"><label className="form-label">Teaching Mode</label>
            <div className="check-group">{MODES.map(m => <label key={m} className={`check-pill ${form.mode.includes(m) ? 'selected' : ''}`}><input type="checkbox" hidden checked={form.mode.includes(m)} onChange={() => toggleArr('mode', m)} />{m}</label>)}</div>
          </div>
          <div className="form-group"><label className="form-label">Monthly Fee (₹)</label><input className="form-input" type="number" value={form.fee} onChange={e => set('fee', e.target.value)} disabled={isLocked} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Documents</h3></div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <div className="file-upload">
              <p>{photoFile ? photoFile.name : profile?.profileImageUrl ? '✓ Photo uploaded' : 'Click to upload (JPG/PNG, max 5MB)'}</p>
              <input type="file" accept=".jpg,.jpeg,.png" onChange={e => setPhotoFile(e.target.files[0])} disabled={isLocked} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Education Certificate</label>
            <div className="file-upload">
              <p>{certFile ? certFile.name : profile?.documentUrl ? '✓ Certificate uploaded' : 'Click to upload (JPG/PDF, max 6MB)'}</p>
              <input type="file" accept=".jpg,.jpeg,.pdf" onChange={e => setCertFile(e.target.files[0])} disabled={isLocked} />
            </div>
          </div>
        </div>
      </div>

      {!isLocked && (
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '.5rem' }}>
          {isSubmit || isReapply ? <><Send size={16} /> {saving ? 'Submitting...' : isReapply ? 'Save & Reapply' : 'Submit Profile'}</> : <><Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}</>}
        </button>
      )}
    </>
  );
}
