import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

export default function TopNav({ onMenuClick }) {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = userProfile?.fullName || user?.displayName || 'User';

  return (
    <header className="dashboard-topnav">
      <div className="topnav-left">
        <button className="topnav-menu-btn" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <Link to="/" className="topnav-logo">
          <img src="/assets/logo.png" alt="Logo" className="logo" />
          <div className="nav-logo-text">Delhi <span>Private</span><br />Tutors</div>
        </Link>
      </div>
      <div className="topnav-right">
        <div className="topnav-user">
          <div className="topnav-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="topnav-name">{displayName}</span>
        </div>
        <button className="topnav-logout" onClick={handleLogout} title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
