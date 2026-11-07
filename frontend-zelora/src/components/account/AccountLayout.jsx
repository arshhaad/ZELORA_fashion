import { Link, NavLink, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import Toast from '../common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';
import {
  User,
  MapPin,
  Bell,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function AccountLayout({ children, activeTab = 'profile', title, subtitle }) {
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useCustomer();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { id: 'profile', path: '/account/profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'addresses', path: '/account/addresses', label: 'My Addresses', icon: <MapPin size={18} /> },
    {
      id: 'notifications',
      path: '/account/notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    { id: 'orders', path: '/orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'wishlist', path: '/wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
  ];

  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="account-page-main">
        <div className="account-container">
          {/* Top Breadcrumb */}
          <div className="account-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/account/profile">My Account</Link>
            {title && (
              <>
                <span>/</span>
                <span className="current">{title}</span>
              </>
            )}
          </div>

          <div className="account-grid-layout">
            {/* Sidebar Navigation */}
            <aside className="account-sidebar">
              {/* User Snapshot Card */}
              <div className="account-user-card">
                <div className="account-user-avatar">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="user-avatar-img" />
                  ) : (
                    <span>{(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}</span>
                  )}
                </div>
                <div className="account-user-meta">
                  <h3 className="account-user-name">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Member'}
                  </h3>
                  <span className="account-user-email">{user?.email}</span>
                  <div className="account-user-badge">
                    <ShieldCheck size={13} />
                    <span>{user?.is_email_verified ? 'Verified Member' : 'Unverified'}</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation Links */}
              <nav className="account-nav-list">
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `account-nav-btn ${isActive || activeTab === item.id ? 'active' : ''}`
                    }
                  >
                    <div className="nav-btn-left">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="nav-btn-right">
                      {item.badge && <span className="nav-badge-counter">{item.badge}</span>}
                      <ChevronRight size={15} className="chevron" />
                    </div>
                  </NavLink>
                ))}

                <button
                  type="button"
                  className="account-nav-btn logout-nav-btn"
                  onClick={handleLogout}
                >
                  <div className="nav-btn-left">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <section className="account-content-pane">
              {(title || subtitle) && (
                <div className="account-pane-header">
                  {title && <h1 className="account-pane-title">{title}</h1>}
                  {subtitle && <p className="account-pane-subtitle">{subtitle}</p>}
                </div>
              )}
              {children}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

