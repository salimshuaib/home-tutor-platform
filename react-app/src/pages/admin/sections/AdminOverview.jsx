import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { Clock as ClockIcon, CheckCircle, XCircle, Users, ArrowRight, Mail, BookOpen, MapPin, Briefcase, Calendar, Check, X, FileText, User as UserIcon } from 'lucide-react';
import { safeText } from '../../../utils/safeText';

function useTutors() {
  const [tutors, setTutors] = useState([]);
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'tutor'));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setTutors(list);
    });
    return unsub;
  }, []);
  return tutors;
}

function formatDate(ts) {
  if (!ts) return 'N/A';
  let d;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export { useTutors, formatDate };

export default function AdminOverview() {
  const tutors = useTutors();
  const navigate = useNavigate();
  const pending = tutors.filter(t => (t.status === 'pending' || !t.status) && t.profileSubmitted === true);
  const approved = tutors.filter(t => t.status === 'approved');
  const rejected = tutors.filter(t => t.status === 'rejected');

  return (
    <>
      <div className="page-header"><h1 className="page-title">Admin <em>Overview</em></h1></div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-icon orange"><ClockIcon size={20} /></div><div className="stat-info"><div className="stat-num">{pending.length}</div><div className="stat-label">Pending Review</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={20} /></div><div className="stat-info"><div className="stat-num">{approved.length}</div><div className="stat-label">Approved Tutors</div></div></div>
        <div className="stat-card"><div className="stat-icon red-bg" style={{ background: 'rgba(198,40,40,.08)', color: 'var(--red)' }}><XCircle size={20} /></div><div className="stat-info"><div className="stat-num">{rejected.length}</div><div className="stat-label">Rejected</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Users size={20} /></div><div className="stat-info"><div className="stat-num">{tutors.length}</div><div className="stat-label">Total Tutors</div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Pending Applications</h3><button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/pending')}><ArrowRight size={14} /> View All</button></div>
        {pending.length === 0 ? (
          <div className="empty-state"><CheckCircle size={48} style={{ color: 'var(--gold-light)', opacity: .6 }} /><h3>All clear!</h3><p>No pending tutor applications to review.</p></div>
        ) : (
          <div className="tutor-grid">
            {pending.slice(0, 6).map(t => <TutorCard key={t.id} t={t} />)}
          </div>
        )}
      </div>
    </>
  );
}

export function TutorCard({ t, onAction }) {
  const [acting, setActing] = useState(false);
  const name = t.fullName || 'Unknown';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const subjects = (t.subjects || []).join(', ') || 'Not specified';
  const location = t.area ? `${t.area}, ${t.city || 'Delhi'}` : (t.city || 'Delhi');
  const exp = t.experience ? `${t.experience} yrs exp` : 'N/A';
  const submitted = formatDate(t.submittedAt || t.createdAt);

  async function approve() {
    setActing(true);
    try { await updateDoc(doc(db, 'users', t.id), { status: 'approved', reviewedAt: serverTimestamp(), rejectionReason: null }); } catch {}
    setActing(false);
    if (onAction) onAction();
  }

  return (
    <div className="tutor-card">
      <div className="tutor-card-top">
        <div className="tutor-card-avatar">{t.profileImageUrl ? <img src={t.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : initials}</div>
        <div className="tutor-card-info"><h3>{safeText(name)}</h3><p className="tutor-card-email"><Mail size={13} /> {safeText(t.email || '')}</p></div>
      </div>
      <div className="tutor-card-meta">
        <span className="meta-tag"><BookOpen size={12} /> {safeText(subjects)}</span>
        <span className="meta-tag"><MapPin size={12} /> {safeText(location)}</span>
        <span className="meta-tag"><Briefcase size={12} /> {safeText(exp)}</span>
        <span className="meta-tag"><Calendar size={12} /> Applied: {safeText(submitted)}</span>
      </div>
      <div className="tutor-card-docs">{t.documentUrl ? <a href={t.documentUrl} target="_blank" rel="noopener" className="btn btn-outline btn-sm"><FileText size={14} /> View Document</a> : <span className="no-doc">No document</span>}</div>
      <div className="tutor-card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn-approve btn-sm" onClick={approve} disabled={acting}><Check size={14} /> {acting ? 'Approving...' : 'Approve'}</button>
        <button className="btn btn-reject btn-sm" onClick={() => { if (onAction) onAction('reject', t); }}><X size={14} /> Reject</button>
      </div>
    </div>
  );
}
