import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LayoutDashboard, Clock, CheckCircle, XCircle } from 'lucide-react';
import AdminOverview from './sections/AdminOverview';
import PendingTutors from './sections/PendingTutors';
import ApprovedTutors from './sections/ApprovedTutors';
import RejectedTutors from './sections/RejectedTutors';

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
