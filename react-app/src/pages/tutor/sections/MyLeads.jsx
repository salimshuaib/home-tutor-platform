import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { getCachedData, setCachedData } from '../../../utils/cache';
import { BookOpen } from 'lucide-react';

export default function MyLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadLeads(); }, [user]);

  async function loadLeads() {
    const cached = getCachedData('tutor_leads_' + user.uid);
    if (cached) { setLeads(cached); setLoading(false); }

    try {
      let snap;
      try {
        const q = query(collection(db, 'leads'), where('tutorId', '==', user.uid), orderBy('appliedAt', 'desc'));
        snap = await getDocs(q);
      } catch {
        const q2 = query(collection(db, 'leads'), where('tutorId', '==', user.uid));
        snap = await getDocs(q2);
      }
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setLeads(list);
      setCachedData('tutor_leads_' + user.uid, list, 120000);
    } catch {}
    setLoading(false);
  }

  const list = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const tabs = [{ key: 'all', label: 'All' }, { key: 'contacted', label: 'Contacted' }, { key: 'ongoing', label: 'Ongoing' }, { key: 'closed', label: 'Closed' }];

  return (
    <>
      <div className="page-header"><h1 className="page-title">My <em>Leads</em></h1></div>
      <div className="tab-bar">
        {tabs.map(t => <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>{t.label}</button>)}
      </div>

      {loading ? (
        <div>{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton-base skeleton-req-card" />)}</div>
      ) : list.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📥</div><h3>No leads {filter !== 'all' ? 'with this status' : 'yet'}</h3><p>Apply for matched tuitions to build your pipeline.</p></div>
      ) : (
        <div className="leads-list">
          {list.map(l => {
            const sc = l.status === 'applied' || l.status === 'contacted' ? 'status-contacted' : l.status === 'ongoing' ? 'status-ongoing' : 'status-closed';
            const sl = l.status === 'applied' ? 'Applied' : l.status === 'contacted' ? 'Contacted' : l.status === 'ongoing' ? 'Ongoing' : 'Closed';
            const timestamp = l.appliedAt || l.acceptedAt;
            const dateStr = timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleDateString('en-IN') : '';
            const scoreStr = l.matchScore ? ` • ${Math.round((l.matchScore / 120) * 100)}% match` : '';
            return (
              <div className="lead-item" key={l.id}>
                <div className="lead-item-icon"><BookOpen size={18} /></div>
                <div className="lead-item-info">
                  <h4>Lead #{l.requestId?.substring(0, 6)}{scoreStr}</h4>
                  <p>Applied {dateStr}</p>
                </div>
                <span className={`lead-status ${sc}`}>{sl}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
