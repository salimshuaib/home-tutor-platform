import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { CheckCircle, X } from 'lucide-react';
import { TutorCard } from './AdminOverview';
import Modal from '../../../components/ui/Modal';

export default function PendingTutors() {
  const [tutors, setTutors] = useState([]);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'tutor'));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(d => { const data = d.data(); if ((data.status === 'pending' || !data.status) && data.profileSubmitted) list.push({ id: d.id, ...data }); });
      setTutors(list);
    });
    return unsub;
  }, []);

  function handleAction(action, t) {
    if (action === 'reject') { setRejectTarget(t); setReason(''); }
  }

  async function confirmReject() {
    if (!reason.trim()) return;
    setRejecting(true);
    try { await updateDoc(doc(db, 'users', rejectTarget.id), { status: 'rejected', rejectionReason: reason, reviewedAt: serverTimestamp() }); setRejectTarget(null); } catch {}
    setRejecting(false);
  }

  return (
    <>
      <div className="page-header"><h1 className="page-title">Pending <em>Applications</em></h1></div>
      {tutors.length === 0 ? (
        <div className="empty-state"><CheckCircle size={48} style={{ color: 'var(--gold-light)', opacity: .6 }} /><h3>All clear!</h3><p>No pending tutor applications to review.</p></div>
      ) : (
        <div className="tutor-grid">
          {tutors.map(t => <TutorCard key={t.id} t={t} onAction={(a, data) => handleAction(a, data || t)} />)}
        </div>
      )}
      {rejectTarget && (
        <Modal title="Reject Application" onClose={() => setRejectTarget(null)}>
          <p style={{ fontSize: '.9rem', color: 'var(--text-mid)', marginBottom: '1rem' }}>You are rejecting <strong>{rejectTarget.fullName}</strong>. Please provide a reason:</p>
          <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Incomplete documentation, unverified credentials..." style={{ width: '100%', minHeight: 100 }} />
          <div style={{ display: 'flex', gap: '.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRejectTarget(null)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1, background: 'var(--red)', color: 'white' }} onClick={confirmReject} disabled={rejecting}><X size={16} /> {rejecting ? 'Rejecting...' : 'Confirm Reject'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
