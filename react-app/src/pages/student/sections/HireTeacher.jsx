import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { getCachedData, setCachedData } from '../../../utils/cache';
import { debounce } from '../../../utils/debounce';
import { Briefcase, MapPin, IndianRupee, Eye, MessageCircle } from 'lucide-react';
import { safeText } from '../../../utils/safeText';

export default function HireTeacher() {
  const [tutors, setTutors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', classRange: '', budget: '', location: '' });

  useEffect(() => { loadTutors(); }, []);

  async function loadTutors() {
    const cached = getCachedData('tutors_list');
    if (cached) { setTutors(cached); setFiltered(cached); setLoading(false); return; }

    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'tutor'), where('status', '==', 'approved'));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.fullName || 'Tutor',
          initials: (data.fullName || 'T').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
          subjects: (data.subjects || []).join(', ') || 'Not specified',
          exp: data.experience ? data.experience + ' years' : 'N/A',
          location: data.preferredLocation || data.area || data.location || 'Delhi',
          fee: data.fee ? '₹' + Number(data.fee).toLocaleString('en-IN') + '/mo' : 'N/A',
          feeNum: Number(data.fee) || 0
        });
      });
      setCachedData('tutors_list', list, 5 * 60 * 1000);
      setTutors(list);
      setFiltered(list);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => {
    const { subject, location, budget } = filters;
    let list = tutors;
    if (subject) list = list.filter(t => t.subjects.toLowerCase().includes(subject.toLowerCase()));
    if (location) list = list.filter(t => t.location.toLowerCase().includes(location.toLowerCase()));
    if (budget) {
      if (budget.includes('Under')) list = list.filter(t => t.feeNum > 0 && t.feeNum < 5000);
      else if (budget.includes('5,000 - ₹10,000')) list = list.filter(t => t.feeNum >= 5000 && t.feeNum <= 10000);
      else if (budget.includes('10,000 - ₹20,000')) list = list.filter(t => t.feeNum >= 10000 && t.feeNum <= 20000);
      else if (budget.includes('20,000+')) list = list.filter(t => t.feeNum >= 20000);
    }
    setFiltered(list);
  }, [filters, tutors]);

  return (
    <>
      <div className="page-header"><h1 className="page-title">Hire a <em>Teacher</em></h1></div>
      <div className="filters-bar">
        <select className="filter-select" value={filters.subject} onChange={e => setFilters(p => ({ ...p, subject: e.target.value }))}>
          <option value="">All Subjects</option>
          {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Accountancy', 'Economics'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.budget} onChange={e => setFilters(p => ({ ...p, budget: e.target.value }))}>
          <option value="">Any Budget</option>
          <option>Under ₹5,000/mo</option><option>₹5,000 - ₹10,000</option><option>₹10,000 - ₹20,000</option><option>₹20,000+</option>
        </select>
        <select className="filter-select" value={filters.location} onChange={e => setFilters(p => ({ ...p, location: e.target.value }))}>
          <option value="">All Locations</option>
          {['South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Noida', 'Gurgaon'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="tutor-grid">{Array(6).fill(0).map((_, i) => <div key={i} className="skeleton-base skeleton-card" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👥</div><h3>No tutors found</h3><p>Try adjusting your filters.</p></div>
      ) : (
        <div className="tutor-grid">
          {filtered.map(t => (
            <div className="tutor-card" key={t.id}>
              <div className="tutor-top">
                <div className="tutor-avatar">{t.initials}</div>
                <div className="tutor-info"><h3>{safeText(t.name)}</h3><div className="tutor-subjects">{safeText(t.subjects)}</div></div>
              </div>
              <div className="tutor-meta">
                <span className="tutor-tag"><Briefcase size={12} />{t.exp}</span>
                <span className="tutor-tag"><MapPin size={12} />{t.location}</span>
                <span className="tutor-tag"><IndianRupee size={12} />{t.fee}</span>
              </div>
              <div className="tutor-actions">
                <button className="btn btn-primary btn-sm"><Eye size={14} /> View Profile</button>
                <button className="btn btn-outline btn-sm"><MessageCircle size={14} /> Contact</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
