import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { Send } from 'lucide-react';

export default function PostRequirement() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ className: '', subject: '', board: '', timing: '', budget: '', location: '', mode: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await addDoc(collection(db, 'requests'), {
        userId: user.uid,
        studentName: profile?.fullName || user.displayName || 'Student',
        className: form.className,
        subject: form.subject,
        timing: form.timing,
        budget: Number(form.budget),
        location: form.location,
        mode: form.mode,
        board: form.board,
        notes: form.notes,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setMsg({ type: 'success', text: 'Requirement posted successfully!' });
      setForm({ className: '', subject: '', board: '', timing: '', budget: '', location: '', mode: '', notes: '' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to post. Please try again.' });
    }
    setLoading(false);
  }

  return (
    <>
      <div className="page-header"><h1 className="page-title">Post a <em>Requirement</em></h1></div>
      <div className="card">
        {msg && <div className={`msg-bar msg-${msg.type}`} style={{ display: 'flex' }}>{msg.text}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Class / Grade *</label>
            <select className="form-select" value={form.className} onChange={e => set('className', e.target.value)} required>
              <option value="">Select Class</option>
              {['1st - 5th', '6th - 8th', '9th', '10th', '11th', '12th', 'College', 'Competitive Exams'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select className="form-select" value={form.subject} onChange={e => set('subject', e.target.value)} required>
              <option value="">Select Subject</option>
              {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Accountancy', 'Economics', 'All Subjects', 'Other'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Board</label>
            <select className="form-select" value={form.board} onChange={e => set('board', e.target.value)}>
              <option value="">Select Board (Optional)</option>
              {['CBSE', 'ICSE', 'State Board', 'IB', 'Other'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Timing *</label>
            <select className="form-select" value={form.timing} onChange={e => set('timing', e.target.value)} required>
              <option value="">Select Timing</option>
              {['Morning (8AM - 12PM)', 'Afternoon (12PM - 4PM)', 'Evening (4PM - 8PM)', 'Night (8PM - 10PM)', 'Flexible'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Budget (₹) *</label>
            <input className="form-input" type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 8000" required />
          </div>
          <div className="form-group">
            <label className="form-label">Location / Area *</label>
            <input className="form-input" type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Lajpat Nagar, South Delhi" required />
          </div>
          <div className="form-group">
            <label className="form-label">Mode *</label>
            <select className="form-select" value={form.mode} onChange={e => set('mode', e.target.value)} required>
              <option value="">Select Mode</option>
              {['Home Tuition', 'Online', 'Both (Flexible)'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label className="form-label">Additional Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any special requirements, preferred days, etc." />
          </div>
          <div className="form-group full" style={{ marginTop: '.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} /> {loading ? 'Submitting...' : 'Submit Requirement'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
