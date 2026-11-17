import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LandingNavbar({ onOpenInstall }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/products' },
    { label: 'Women', path: '/products?gender=women' },
    { label: 'Men', path: '/products?gender=men' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="zelora-navbar">
      <div className="zelora-nav-container">
        {/* Left: ZELORA Logo */}
        <Link to="/" className="zelora-logo">
          ZELORA
        </Link>

        {/* Center: Navigation Links */}
        <nav className="zelora-nav-links">
          {navItems.map((item) => (
            <li key={item.label} className="zelora-nav-item">
              <Link
                to={item.path}
                className={`zelora-nav-link ${item.path === '/'
                  ? location.pathname === '/' ? 'active' : ''
                  : location.pathname + location.search === item.path || (item.path === '/products' && location.pathname === '/products' && !location.search)
                    ? 'active'
                    : ''
                  }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </nav>

        {/* Right: Authentication Action Buttons & Install App */}
        <div className="zelora-nav-actions">
          {onOpenInstall && (
            <button
              type="button"
              className="btn-zelora-install"
              onClick={onOpenInstall}
              title="Install App"
              aria-label="Install App"
            >
              <Download size={14} />
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="nav-auth-buttons">
              <Link to="/home" className="btn-zelora-signup" title="Explore Boutique">
                Explore Shop
              </Link>
              <button
                type="button"
                className="btn-zelora-signin"
                onClick={logout}
                title="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-zelora-signin" title="Customer Sign In">
                Sign In
              </Link>
              <Link to="/register" className="btn-zelora-signup" title="Create Customer Account">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="zelora-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="zelora-mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`mobile-link ${item.path === '/'
                ? location.pathname === '/' ? 'active' : ''
                : location.pathname + location.search === item.path
                  ? 'active'
                  : ''
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {onOpenInstall && (
            <button
              type="button"
              className="btn-zelora-install-mobile"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstall();
              }}
            >
              <Download size={16} />
              <span>Install ZELORA Web App</span>
            </button>
          )}

          <div className="mobile-auth-grid" style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #222' }}>
            {isAuthenticated && user ? (
              <>
                <Link to="/home" className="btn-zelora-signup text-center" onClick={() => setMobileMenuOpen(false)}>
                  Explore Shop
                </Link>
                <button
                  type="button"
                  className="btn-zelora-signin text-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-zelora-signin text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-zelora-signup text-center" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

