import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LayoutDashboard, Clock, CheckCircle, XCircle } from 'lucide-react';

// Section stubs — we'll build these out in Phase 9
function AdminOverview() { return <div className="section-content"><h2>Admin Dashboard</h2><p>Platform overview.</p></div>; }
function PendingTutors() { return <div className="section-content"><h2>Pending Tutors</h2><p>Review pending applications.</p></div>; }
function ApprovedTutors() { return <div className="section-content"><h2>Approved Tutors</h2><p>View approved tutors.</p></div>; }
function RejectedTutors() { return <div className="section-content"><h2>Rejected Tutors</h2><p>View rejected applications.</p></div>; }

const sidebarLinks = [
  { to: '/admin', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/pending', label: 'Pending', icon: <Clock size={18} /> },
  { to: '/admin/approved', label: 'Approved', icon: <CheckCircle size={18} /> },
  { to: '/admin/rejected', label: 'Rejected', icon: <XCircle size={18} /> },
];

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<DashboardLayout sidebarLinks={sidebarLinks} />}>
        <Route index element={<AdminOverview />} />
        <Route path="pending" element={<PendingTutors />} />
        <Route path="approved" element={<ApprovedTutors />} />
        <Route path="rejected" element={<RejectedTutors />} />
      </Route>
    </Routes>
  );
}
