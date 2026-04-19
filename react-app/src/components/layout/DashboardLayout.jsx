import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';

export default function DashboardLayout({ sidebarLinks }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <TopNav onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <div className="dashboard-body">
        <Sidebar
          links={sidebarLinks}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
