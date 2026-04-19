import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LayoutDashboard, BookOpen, Users, User, Settings } from 'lucide-react';

// Section stubs — we'll build these out in Phase 8
function TutorOverview() { return <div className="section-content"><h2>Dashboard Overview</h2><p>Welcome to your tutor dashboard.</p></div>; }
function MatchedTuitions() { return <div className="section-content"><h2>Matched Tuitions</h2><p>View matching student requests.</p></div>; }
function MyLeads() { return <div className="section-content"><h2>My Leads</h2><p>View your accepted leads.</p></div>; }
function TutorProfile() { return <div className="section-content"><h2>Profile</h2><p>Complete your tutor profile.</p></div>; }
function TutorSettings() { return <div className="section-content"><h2>Settings</h2><p>Account settings.</p></div>; }

const sidebarLinks = [
  { to: '/tutor', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/tutor/tuitions', label: 'Matched Tuitions', icon: <BookOpen size={18} /> },
  { to: '/tutor/leads', label: 'My Leads', icon: <Users size={18} /> },
  { to: '/tutor/profile', label: 'Profile', icon: <User size={18} /> },
  { to: '/tutor/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function TutorDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout sidebarLinks={sidebarLinks} />}>
        <Route index element={<TutorOverview />} />
        <Route path="tuitions" element={<MatchedTuitions />} />
        <Route path="leads" element={<MyLeads />} />
        <Route path="profile" element={<TutorProfile />} />
        <Route path="settings" element={<TutorSettings />} />
      </Route>
    </Routes>
  );
}
