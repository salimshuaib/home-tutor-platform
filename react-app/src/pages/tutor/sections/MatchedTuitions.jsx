import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { matchAndScoreRequests, getMatchColor } from '../../../utils/matching';
import { Lock, UserCog, Target, MapPin, IndianRupee, Clock as ClockIcon, MessageCircle, Send, X } from 'lucide-react';

export default function MatchedTuitions() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || !profile) return;
    if (profile.status !== 'approved') { setLoading(false); return; }
    loadMatches();
  }, [user, profile]);

  async function loadMatches() {
    setLoading(true);
    try {
      const q = query(collection(db, 'requests'), where('status', 'in', ['pending', 'active']), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const requests = [];
      snap.forEach(d => requests.push({ id: d.id, ...d.data() }));
      const leadsQ = query(collection(db, 'leads'), where('tutorId', '==', user.uid));
      const leadsSnap = await getDocs(leadsQ);
      const ids = [];
      leadsSnap.forEach(d => ids.push(d.data().requestId));
      setAppliedIds(ids);
      const scored = matchAndScoreRequests(profile, requests, ids, 15);
      setMatches(scored);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function applyForTuition(reqId, matchScore) {
    if (appliedIds.includes(reqId)) { showToast('Already applied.', 'error'); return; }
    setApplyingId(reqId);
    try {
      await addDoc(collection(db, 'leads'), { tutorId: user.uid, tutorName: profile.fullName || 'Tutor', requestId: reqId, status: 'applied', matchScore: matchScore || 0, appliedAt: serverTimestamp() });
      try { await updateDoc(doc(db, 'requests', reqId), { appliedTutors: arrayUnion(user.uid), status: 'active' }); } catch {}
      setAppliedIds(p => [...p, reqId]);
      setMatches(p => p.filter(m => m.id !== reqId));
      showToast('Application sent! The student will be notified.');
    } catch { showToast('Failed to apply. Try again.', 'error'); }
    setApplyingId(null);
  }

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); }

  if (profile?.status !== 'approved') {
    const gateMsg = profile?.status === 'rejected'
      ? 'Your profile was rejected. Update and reapply to access leads.'
      : "Your profile is under review. You'll be able to browse leads once approved.";
    return (
      <>
        <div className="page-header"><h1 className="page-title">Matched <em>Tuitions</em></h1></div>
        <div className="empty-state"><Lock size={48} style={{ color: 'var(--gold-light)', opacity: .6 }} /><h3>Access Restricted</h3><p>{gateMsg}</p><button className="btn btn-primary" onClick={() => navigate('/tutor/profile')}><UserCog size={16} /> {profile?.status === 'rejected' ? 'Update Profile' : 'View Profile'}</button></div>
      </>
    );
  }

  return (
    <>
      <div className="page-header"><h1 className="page-title">Matched <em>Tuitions</em></h1></div>
      {toast && <div className={`toast ${toast.type}`} style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>{toast.msg}</div>}
      {loading ? (
        <div className="lead-grid">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton-base skeleton-card" />)}</div>
      ) : matches.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📥</div><h3>No matches yet</h3><p>Complete your profile with subjects, classes, and location to receive matching student requirements.</p></div>
      ) : (
        <div className="lead-grid">
          {matches.map(r => {
            const bd = r.matchBreakdown || {};
            return (
              <div className="lead-card" key={r.id}>
                <div className="lead-header">
                  <span className={`lead-badge ${(r.mode || '').includes('Online') ? 'online' : 'home'}`}>{r.mode || 'Home'}</span>
                  {r.board && <span className="lead-board-tag">{r.board}</span>}
                  <span className={`match-score ${getMatchColor(r.matchPercentage)}`}><Target size={12} />{r.matchPercentage}% Match</span>
                </div>
                <div className="lead-title">{r.subject} — {r.className}</div>
                <div className="match-breakdown">
                  {bd.subject > 0 ? <span className="match-chip">✓ Subject</span> : <span className="match-chip missed">Subject</span>}
                  {bd.class > 0 ? <span className="match-chip">✓ Class</span> : <span className="match-chip missed">Class</span>}
                  {bd.location > 0 ? <span className="match-chip">✓ Location</span> : <span className="match-chip missed">Location</span>}
                  {bd.board > 0 && <span className="match-chip">✓ Board</span>}
                  {bd.mode > 0 ? <span className="match-chip">✓ Mode</span> : <span className="match-chip missed">Mode</span>}
                </div>
                <div className="lead-meta">
                  <div className="lead-row"><MapPin size={14} />{r.location || 'N/A'}</div>
                  <div className="lead-row"><IndianRupee size={14} />₹{Number(r.budget || 0).toLocaleString('en-IN')}/mo</div>
                  <div className="lead-row"><ClockIcon size={14} />{r.timing || 'Flexible'}</div>
                  {r.notes && <div className="lead-row"><MessageCircle size={14} />{r.notes}</div>}
                </div>
                <div className="lead-actions">
                  <button className="btn btn-success btn-sm" disabled={applyingId === r.id} onClick={() => applyForTuition(r.id, r.matchScore)}>
                    <Send size={14} /> {applyingId === r.id ? 'Applying...' : 'Apply for this Tuition'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={e => e.target.closest('.lead-card').remove()}><X size={14} /> Ignore</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
