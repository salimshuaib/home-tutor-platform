import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { UserX, MessageCircle, Clock as ClockIcon } from 'lucide-react';
import { safeText } from '../../../utils/safeText';
import { formatDate } from './AdminOverview';

export default function RejectedTutors() {
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'tutor'), where('status', '==', 'rejected'));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setTutors(list);
    });
    return unsub;
  }, []);

  return (
    <>
      <div className="page-header"><h1 className="page-title">Rejected <em>Applications</em></h1></div>
      {tutors.length === 0 ? (
        <div className="empty-state"><UserX size={48} style={{ color: 'var(--gold-light)', opacity: .6 }} /><h3>No rejected applications</h3><p>Rejected tutor applications will appear here.</p></div>
      ) : (
        <div className="tutor-list">
          {tutors.map(t => {
            const name = t.fullName || 'Unknown';
            const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
            const subjects = (t.subjects || []).join(', ') || 'Not specified';
            return (
              <div className="tutor-list-item" key={t.id}>
                <div className="tutor-list-avatar">{t.profileImageUrl ? <img src={t.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}</div>
                <div className="tutor-list-info">
                  <h4>{safeText(name)}</h4>
                  <p>{safeText(t.email || '')} &bull; {safeText(subjects)}</p>
                  {t.rejectionReason && (
                    <div className="rejection-reason"><MessageCircle size={14} /> <strong>Reason:</strong> {safeText(t.rejectionReason)}</div>
                  )}
                </div>
                <div className="tutor-list-meta">
                  <span className="review-date"><ClockIcon size={13} /> Reviewed: {formatDate(t.reviewedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
