import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LayoutDashboard, Search, FileText, List, User } from 'lucide-react';

// Section stubs — we'll build these out in Phase 7
function Overview() { return <div className="section-content"><h2>Dashboard Overview</h2><p>Welcome to your student dashboard.</p></div>; }
function HireTeacher() { return <div className="section-content"><h2>Hire a Teacher</h2><p>Browse available tutors.</p></div>; }
function PostRequirement() { return <div className="section-content"><h2>Post Requirement</h2><p>Post a new tuition requirement.</p></div>; }
function MyRequests() { return <div className="section-content"><h2>My Requests</h2><p>View your tuition requests.</p></div>; }
function StudentProfile() { return <div className="section-content"><h2>Profile</h2><p>Manage your profile.</p></div>; }

const sidebarLinks = [
  { to: '/student', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/student/hire', label: 'Hire Teacher', icon: <Search size={18} /> },
  { to: '/student/post', label: 'Post Requirement', icon: <FileText size={18} /> },
  { to: '/student/requests', label: 'My Requests', icon: <List size={18} /> },
  { to: '/student/profile', label: 'Profile', icon: <User size={18} /> },
];

export default function StudentDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout sidebarLinks={sidebarLinks} />}>
        <Route index element={<Overview />} />
        <Route path="hire" element={<HireTeacher />} />
        <Route path="post" element={<PostRequirement />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>
    </Routes>
  );
}
