import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/useAuth';
import { 
  Home, 
  BookOpen, 
  Clock, 
  RotateCcw, 
  AlertCircle, 
  BarChart3, 
  Users, 
  LogOut 
} from 'lucide-react';

function NavItem({ to, Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? 'nav-link active' : 'nav-link'
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );
}

function SectionLabel({ text }) {
  return <div className="nav-section-label">{text}</div>;
}

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const isAdminOrLibrarian = hasRole('Admin') || hasRole('Librarian');
  const isAdmin = hasRole('Admin');

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const primaryRole = user?.roles?.[0] || 'Member';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-row">
  <img
    src={logo}
    alt="UST Angelicum Logo"
    style={{
      width: '48px',
      height: '48px',
      objectFit: 'contain',
      flexShrink: 0
    }}
  />

  <div>
    <div className="logo-title">UST Angelicum</div>
    <div className="logo-subtitle">Library Management System</div>
  </div>
</div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.fullName}</div>
          <div className="user-role">{primaryRole}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <SectionLabel text="MAIN MENU" />
        <NavItem to="/dashboard" Icon={Home} label="Dashboard" />
        <NavItem to="/books" Icon={BookOpen} label="Catalog" />
        <NavItem to="/my-history" Icon={Clock} label="My Borrows" />

        {isAdminOrLibrarian && (
          <>
            <SectionLabel text="MANAGEMENT" />
            <NavItem to="/borrows" Icon={RotateCcw} label="Circulation" />
            <NavItem to="/overdue-books" Icon={AlertCircle} label="Overdue" />
            <NavItem to="/reports" Icon={BarChart3} label="Reports" />
          </>
        )}

        {isAdmin && (
          <>
            <SectionLabel text="ADMINISTRATION" />
            <NavItem to="/users" Icon={Users} label="Patrons" />
          </>
        )}
      </nav>

      <div className="sidebar-logout">
        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ef4444' 
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}