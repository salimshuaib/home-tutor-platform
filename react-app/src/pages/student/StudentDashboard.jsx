import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LayoutDashboard, Search, FileText, List, User } from 'lucide-react';
import Overview from './sections/Overview';
import HireTeacher from './sections/HireTeacher';
import PostRequirement from './sections/PostRequirement';
import MyRequests from './sections/MyRequests';
import StudentProfile from './sections/StudentProfile';

const sidebarLinks = [
  { to: '/student', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/student/hire', label: 'Hire Teacher', icon: <Search size={18} /> },
  { to: '/student/post', label: 'Post Requirement', icon: <FileText size={18} /> },
  { to: '/student/requests', label: 'My Requests', icon: <List size={18} /> },
  { to: '/student/profile', label: 'Profile', icon: <User size={18} /> },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'requests'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setRequests(list);
    });
    return unsub;
  }, [user]);

  return (
    <Routes>
      <Route element={<DashboardLayout sidebarLinks={sidebarLinks} />}>
        <Route index element={<Overview requests={requests} />} />
        <Route path="hire" element={<HireTeacher />} />
        <Route path="post" element={<PostRequirement />} />
        <Route path="requests" element={<MyRequests requests={requests} />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>
    </Routes>
  );
}
