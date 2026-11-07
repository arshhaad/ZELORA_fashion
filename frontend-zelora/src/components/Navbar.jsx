import { useAuth } from '../context/AuthContext';
import { User, LogOut, ShieldCheck, Mail } from 'lucide-react';

export default function Navbar({ activeView, setActiveView }) {
  const { user, logout } = useAuth();

  return (
    <header className="customer-navbar">
      <div className="navbar-container">
        <div className="brand" onClick={() => setActiveView(user ? 'dashboard' : 'login')}>
          <div className="brand-logo">
            <span className="brand-initial">Z</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">ZELORA</span>
            <span className="brand-tag">LUXURY</span>
          </div>
        </div>

        <nav className="nav-actions">
          {user ? (
            <div className="user-profile-nav">
              <div className="user-info-chip">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.first_name || 'User'} className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    {(user.first_name?.[0] || user.email?.[0] || 'C').toUpperCase()}
                  </div>
                )}
                <div className="user-text-details">
                  <span className="user-display-name">
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email.split('@')[0]}
                  </span>
                  <span className="user-role-badge">
                    {user.is_email_verified ? 'Verified Customer' : 'Unverified'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-logout"
                onClick={logout}
                title="Logout from ZELORA"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-nav-links">
              <button
                type="button"
                className={`nav-link ${activeView === 'login' ? 'active' : ''}`}
                onClick={() => setActiveView('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn-primary-sm ${activeView === 'register' ? 'active' : ''}`}
                onClick={() => setActiveView('register')}
              >
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

