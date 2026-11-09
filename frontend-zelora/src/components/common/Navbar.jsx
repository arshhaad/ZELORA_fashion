import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, LogOut, Menu, X, Bell, MapPin, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { unreadNotificationsCount } = useCustomer();
  const { user, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus on route change or click outside
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="zelora-navbar">
      {/* Top Notification Announcement */}
      <div className="zelora-top-strip">
        <div className="top-strip-inner">
          <span className="top-strip-announcement">
            COMPLIMENTARY SHIPPING OVER ₹500 &nbsp;•&nbsp; 30-DAY CONCIERGE RETURNS &nbsp;•&nbsp; ETHICAL COUTURE
          </span>
        </div>
      </div>

      <div className="zelora-nav-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="zelora-logo" aria-label="ZELORA Home">
          ZELORA
        </Link>

        {/* Center: Main Navigation (Home, Men, Women, New Arrivals, Collections) */}
        <nav className="zelora-nav-links">
          <li className="zelora-nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `zelora-nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li className="zelora-nav-item">
            <NavLink
              to="/products?gender=men"
              className={`zelora-nav-link ${location.search.includes('gender=men') ? 'active' : ''}`}
            >
              Men
            </NavLink>
          </li>
          <li className="zelora-nav-item">
            <NavLink
              to="/products?gender=women"
              className={`zelora-nav-link ${location.search.includes('gender=women') ? 'active' : ''}`}
            >
              Women
            </NavLink>
          </li>
          <li className="zelora-nav-item">
            <NavLink
              to="/products?filter=new"
              className={`zelora-nav-link ${location.search.includes('filter=new') ? 'active' : ''}`}
            >
              New Arrivals
            </NavLink>
          </li>
          <li className="zelora-nav-item">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `zelora-nav-link ${isActive && location.pathname === '/products' && !location.search ? 'active' : ''}`
              }
              end
            >
              Collections
            </NavLink>
          </li>
          <li className="zelora-nav-item">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `zelora-nav-link ${isActive && location.pathname === '/about' ? 'active' : ''}`
              }
            >
              About
            </NavLink>
          </li>
        </nav>

        {/* Right: Actions (Search, Wishlist, Cart, Profile) */}
        <div className="zelora-nav-actions">
          {/* Search Trigger */}
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search products"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Link */}
          <Link to="/wishlist" className="nav-icon-btn nav-badge-wrap" aria-label="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className="nav-icon-btn nav-badge-wrap" aria-label="Shopping Bag">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          {/* User Auth & Profile Dropdown */}
          {user ? (
            <div className="nav-user-menu" ref={dropdownRef}>
              <button
                type="button"
                className="nav-user-chip"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="User Account Menu"
              >
                <div className="nav-avatar">
                  {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <span className="nav-user-name">
                  {user.first_name || user.email.split('@')[0]}
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="nav-user-notif-dot" />
                )}
              </button>

              {userDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-user-header">
                    <strong>
                      {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'My Account'}
                    </strong>
                    <small>{user.email}</small>
                  </div>

                  <Link to="/account/profile" className="dropdown-item">
                    <User size={15} />
                    <span>My Profile</span>
                  </Link>

                  <Link to="/orders" className="dropdown-item">
                    <Package size={15} />
                    <span>My Orders</span>
                  </Link>

                  <Link to="/account/addresses" className="dropdown-item">
                    <MapPin size={15} />
                    <span>My Addresses</span>
                  </Link>

                  <Link to="/account/notifications" className="dropdown-item flex-between">
                    <div className="flex-align-center gap-6">
                      <Bell size={15} />
                      <span>Notifications</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="badge-pill-micro">{unreadNotificationsCount}</span>
                    )}
                  </Link>

                  <hr className="dropdown-divider" />

                  <button type="button" className="dropdown-item text-danger" onClick={logout}>
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-zelora-signin">
                Sign In
              </Link>
              <Link to="/register" className="btn-zelora-signup">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="zelora-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {searchOpen && (
        <div className="navbar-search-bar">
          <form onSubmit={handleSearchSubmit} className="search-form-container">
            <Search size={18} className="search-input-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wool coats, silk dresses, tailoring, sunglasses..."
              className="navbar-search-input"
            />
            <button type="submit" className="search-submit-btn">
              Search
            </button>
            <button
              type="button"
              className="search-close-btn"
              onClick={() => setSearchOpen(false)}
            >
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="zelora-mobile-drawer">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ZELORA collections..."
              className="mobile-search-input"
            />
            <button type="submit" className="mobile-search-btn">
              <Search size={16} />
            </button>
          </form>

          <nav className="mobile-nav-links">
            <Link to="/" className="mobile-nav-item">
              Home
            </Link>
            <Link to="/products?gender=men" className="mobile-nav-item">
              Men
            </Link>
            <Link to="/products?gender=women" className="mobile-nav-item">
              Women
            </Link>
            <Link to="/products?filter=new" className="mobile-nav-item">
              New Arrivals
            </Link>
            <Link to="/products" className="mobile-nav-item">
              Collections
            </Link>
            <Link to="/about" className="mobile-nav-item">
              About
            </Link>
            <Link to="/wishlist" className="mobile-nav-item flex-between">
              <span>Wishlist</span>
              <span className="mobile-count-pill">{wishlistCount}</span>
            </Link>
            <Link to="/cart" className="mobile-nav-item flex-between">
              <span>Shopping Bag</span>
              <span className="mobile-count-pill">{cartCount}</span>
            </Link>
          </nav>

          <div className="mobile-auth-section">
            {user ? (
              <div className="mobile-user-actions">
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', color: '#666' }}>
                  MY ACCOUNT
                </div>
                <Link to="/account/profile" className="mobile-sub-item">
                  <User size={15} /> My Profile
                </Link>
                <Link to="/orders" className="mobile-sub-item">
                  <Package size={15} /> My Orders
                </Link>
                <Link to="/account/addresses" className="mobile-sub-item">
                  <MapPin size={15} /> My Addresses
                </Link>
                <Link to="/account/notifications" className="mobile-sub-item flex-between">
                  <span><Bell size={15} /> Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="badge-pill-micro">{unreadNotificationsCount}</span>
                  )}
                </Link>
                <button type="button" className="btn-zelora-secondary btn-block mt-12" onClick={logout}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-grid">
                <Link to="/login" className="btn-zelora-signin text-center">
                  Sign In
                </Link>
                <Link to="/register" className="btn-zelora-signup text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
