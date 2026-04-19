import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, Clock, TrendingUp, UserCog, MapPin, IndianRupee, Target } from 'lucide-react';
import { matchAndScoreRequests, getMatchColor } from '../../../utils/matching';

export default function TutorOverview() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [matchCount, setMatchCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [ongoingCount, setOngoingCount] = useState(0);
  const [profilePct, setProfilePct] = useState(0);
  const [recentMatches, setRecentMatches] = useState([]);

  const firstName = (profile?.fullName || user?.displayName || 'Tutor').split(' ')[0];

  useEffect(() => {
    calcProfileCompletion();
    loadLeadsCount();
    if (profile?.status === 'approved') loadMatches();
  }, [profile]);

  function calcProfileCompletion() {
    if (!profile) return;
    const fields = ['fullName', 'email', 'phone', 'tagline', 'bio', 'area', 'experience'];
    const arrays = ['boards', 'subjects', 'classes', 'mode'];
    let filled = 0, total = fields.length + arrays.length;
    fields.forEach(f => { if (profile[f]) filled++; });
    arrays.forEach(f => { if (profile[f]?.length > 0) filled++; });
    setProfilePct(Math.round((filled / total) * 100));
  }

  async function loadLeadsCount() {
    if (!user) return;
    try {
      const q = query(collection(db, 'leads'), where('tutorId', '==', user.uid));
      const snap = await getDocs(q);
      let leads = [];
      snap.forEach(d => leads.push(d.data()));
      setLeadsCount(leads.length);
      setOngoingCount(leads.filter(l => l.status === 'ongoing').length);
    } catch {}
  }

  async function loadMatches() {
    if (!user || !profile) return;
    try {
      const q = query(collection(db, 'requests'), where('status', 'in', ['pending', 'active']), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const requests = [];
      snap.forEach(d => requests.push({ id: d.id, ...d.data() }));
      const leadsQ = query(collection(db, 'leads'), where('tutorId', '==', user.uid));
      const leadsSnap = await getDocs(leadsQ);
      const appliedIds = [];
      leadsSnap.forEach(d => appliedIds.push(d.data().requestId));
      const scored = matchAndScoreRequests(profile, requests, appliedIds, 15);
      setMatchCount(scored.length);
      setRecentMatches(scored.slice(0, 3));
    } catch {}
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome, <em>{firstName}</em></h1>
        <button className="btn btn-primary" onClick={() => navigate('/tutor/profile')}><UserCog size={16} /> Complete Profile</button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-icon orange"><Zap size={20} /></div><div className="stat-info"><div className="stat-num">{matchCount}</div><div className="stat-label">New Matches</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={20} /></div><div className="stat-info"><div className="stat-num">{leadsCount}</div><div className="stat-label">Accepted Leads</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Clock size={20} /></div><div className="stat-info"><div className="stat-num">{ongoingCount}</div><div className="stat-label">Ongoing</div></div></div>
        <div className="stat-card"><div className="stat-icon gold"><TrendingUp size={20} /></div><div className="stat-info"><div className="stat-num">{profilePct}%</div><div className="stat-label">Profile Score</div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Matched Tuitions</h3><button className="btn btn-outline btn-sm" onClick={() => navigate('/tutor/tuitions')}>View All</button></div>
        {recentMatches.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📥</div><h3>No matches yet</h3><p>Complete your profile to start receiving matched tuition leads in your area.</p><button className="btn btn-primary" onClick={() => navigate('/tutor/profile')}><UserCog size={16} /> Complete Profile</button></div>
        ) : (
          <div className="lead-grid">
            {recentMatches.map(r => (
              <div className="lead-card" key={r.id}>
                <div className="lead-header">
                  <span className="lead-badge new">New</span>
                  <span className={`match-score ${getMatchColor(r.matchPercentage)}`}><Target size={12} />{r.matchPercentage}%</span>
                </div>
                <div className="lead-title">{r.subject} — {r.className}</div>
                <div className="lead-meta">
                  <div className="lead-row"><MapPin size={14} />{r.location || 'N/A'}</div>
                  <div className="lead-row"><IndianRupee size={14} />₹{Number(r.budget || 0).toLocaleString('en-IN')}/mo</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
