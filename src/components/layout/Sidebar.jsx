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
  LogOut,
  ShoppingCart, 
  Heart
} from 'lucide-react';

function NavItem({ to, Icon, label, count }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? 'nav-link active' : 'nav-link'
      }
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={20} />
        <span>{label}</span>
      </div>
      
      {/* Live Item Count Badge Counter */}
      {count !== undefined && count > 0 && (
        <span style={{
          backgroundColor: label === 'Favorites' ? '#ef4444' : '#1976d2',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '2px 8px',
          fontSize: '11px',
          fontWeight: '700',
          minWidth: '20px',
          textAlign: 'center',
          lineHeight: '1'
        }}>
          {count}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ text }) {
  return <div className="nav-section-label">{text}</div>;
}

export default function Sidebar() {
  const { user, logout, hasRole, cart, favorites } = useAuth();
  const navigate = useNavigate();

  const isAdminOrLibrarian = hasRole('Admin') || hasRole('Librarian');
  const isAdmin = hasRole('Admin');
  const isLibrarian = hasRole('Librarian');

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Fallback role label lookup based directly on your hasRole evaluation flags
  let primaryRole = 'Member';
  if (isAdmin) {
    primaryRole = 'Admin';
  } else if (isLibrarian) {
    primaryRole = 'Librarian';
  } else if (user?.roles?.[0]) {
    primaryRole = user.roles[0];
  } else if (user?.role) {
    primaryRole = user.role;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            {/* Added inline style to match your system's primary blue theme color */}
            <div className="logo-title" style={{ color: '#003F7F', fontWeight: '700' }}>
              UST Angelicum
            </div>
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
        
        {/* App Features with Live Counters */}
        <NavItem to="/cart" Icon={ShoppingCart} label="My Cart" count={cart?.length} />
        <NavItem to="/favorites" Icon={Heart} label="Favorites" count={favorites?.length} />
        
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
            color: '#ef4444',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
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