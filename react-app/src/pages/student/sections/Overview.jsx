import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Users, PlusCircle, BookOpen } from 'lucide-react';

export default function Overview({ requests }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const firstName = (profile?.fullName || user?.displayName || 'Student').split(' ')[0];

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const active = requests.filter(r => r.status === 'active').length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome back, <em>{firstName}</em></h1>
        <button className="btn btn-primary" onClick={() => navigate('/student/post')}>
          <PlusCircle size={16} /> Post Requirement
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div className="stat-icon orange"><FileText size={20} /></div><div className="stat-info"><div className="stat-num">{total}</div><div className="stat-label">Total Requests</div></div></div>
        <div className="stat-card"><div className="stat-icon gold"><Clock size={20} /></div><div className="stat-info"><div className="stat-num">{pending}</div><div className="stat-label">Pending</div></div></div>
        <div className="stat-card"><div className="stat-icon green"><CheckCircle size={20} /></div><div className="stat-info"><div className="stat-num">{active}</div><div className="stat-label">Tutors Contacted</div></div></div>
        <div className="stat-card"><div className="stat-icon blue"><Users size={20} /></div><div className="stat-info"><div className="stat-num">50+</div><div className="stat-label">Available Tutors</div></div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Requests</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/requests')}>View All</button>
        </div>
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📥</div>
            <h3>No requests yet</h3>
            <p>Post your first tuition requirement to get matched with expert tutors.</p>
            <button className="btn btn-primary" onClick={() => navigate('/student/post')}><PlusCircle size={16} /> Post Requirement</button>
          </div>
        ) : (
          <div className="requests-list">
            {requests.slice(0, 5).map(r => (
              <div className="request-item" key={r.id}>
                <div className="req-icon"><BookOpen size={18} /></div>
                <div className="req-details">
                  <h4>{r.subject} — {r.className}</h4>
                  <p>{r.mode} • {r.location}</p>
                </div>
                <span className={`req-status status-${r.status}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
