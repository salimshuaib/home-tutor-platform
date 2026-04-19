import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

export default function MyRequests({ requests }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [editReq, setEditReq] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const list = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  function openEdit(r) {
    setEditReq(r);
    setEditForm({ className: r.className, subject: r.subject, board: r.board || '', timing: r.timing, budget: r.budget, location: r.location, mode: r.mode, notes: r.notes || '' });
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, 'requests', editReq.id), {
        className: editForm.className, subject: editForm.subject, board: editForm.board,
        timing: editForm.timing, budget: Number(editForm.budget), location: editForm.location,
        mode: editForm.mode, notes: editForm.notes
      });
      setEditReq(null);
    } catch { }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Delete this request?')) {
      try { await deleteDoc(doc(db, 'requests', id)); } catch { }
    }
  }

  const tabs = [{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'active', label: 'Tutors Contacted' }, { key: 'closed', label: 'Closed' }];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My <em>Requests</em></h1>
        <button className="btn btn-primary" onClick={() => navigate('/student/post')}><PlusCircle size={16} /> New Request</button>
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`} onClick={() => setFilter(t.key)}>{t.label}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📥</div><h3>No requests</h3><p>Post a tuition requirement to get started.</p></div>
      ) : (
        <div className="requests-list">
          {list.map(r => (
            <div className="request-item" key={r.id}>
              <div className="req-icon"><BookOpen size={18} /></div>
              <div className="req-details"><h4>{r.subject} — {r.className}</h4><p>{r.mode} • {r.location}</p></div>
              <span className={`req-status status-${r.status}`}>{r.status}</span>
              <div className="req-actions">
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}><Pencil size={14} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editReq && (
        <Modal title="Edit Request" onClose={() => setEditReq(null)}>
          <form className="form-grid" onSubmit={saveEdit}>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-select" value={editForm.className} onChange={e => setEditForm(p => ({ ...p, className: e.target.value }))}>
                {['1st - 5th', '6th - 8th', '9th', '10th', '11th', '12th', 'College', 'Competitive Exams'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={editForm.subject} onChange={e => setEditForm(p => ({ ...p, subject: e.target.value }))}>
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Accountancy', 'Economics', 'All Subjects', 'Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Budget (₹)</label>
              <input className="form-input" type="number" value={editForm.budget} onChange={e => setEditForm(p => ({ ...p, budget: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="form-group full">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
