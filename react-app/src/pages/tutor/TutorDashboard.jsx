import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LayoutDashboard, Zap, Handshake, UserCog, Settings } from 'lucide-react';
import TutorOverview from './sections/TutorOverview';
import MatchedTuitions from './sections/MatchedTuitions';
import MyLeads from './sections/MyLeads';
import TutorProfile from './sections/TutorProfile';
import TutorSettings from './sections/TutorSettings';

const sidebarLinks = [
  { to: '/tutor', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/tutor/tuitions', label: 'Matched Tuitions', icon: <Zap size={18} /> },
  { to: '/tutor/leads', label: 'My Leads', icon: <Handshake size={18} /> },
  { to: '/tutor/profile', label: 'My Profile', icon: <UserCog size={18} /> },
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
