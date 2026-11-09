import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import { UserAvatarBadge } from '../common/BrandBadge';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Store,
  Sliders,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function SellerHeader({ onToggleSidebar }) {
  const navigate = useNavigate();
  const {
    shop,
    seller,
    unreadNotifsCount,
    requestLogoutSeller,
  } = useSeller();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/seller/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="seller-header">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="seller-header-left">
        <button
          type="button"
          className="seller-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Drawer"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="seller-header-search">
          <Search size={16} className="seller-search-icon" />
          <input
            type="text"
            className="seller-search-input"
            placeholder="Search products, orders, SKU, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: Shop Status, Quick Add, Notifications & Profile Menu */}
      <div className="seller-header-right">
        {/* Shop Live Status Pill */}
        <div className={`shop-status-badge ${shop.is_open ? 'open' : 'closed'}`}>
          <span className="dot" />
          <span>{shop.is_open ? 'Shop Open' : 'Shop Closed'}</span>
        </div>

        {/* Quick Add Product Button */}
        <Link to="/seller/products/add" className="btn-header-add-product">
          <Plus size={16} />
          <span>Add Product</span>
        </Link>

        {/* Notifications Icon with Badge */}
        <Link
          to="/seller/notifications"
          className="header-action-btn"
          title="Seller Notifications"
        >
          <Bell size={18} />
          {unreadNotifsCount > 0 && (
            <span className="header-notif-pill">{unreadNotifsCount}</span>
          )}
        </Link>

        {/* Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="seller-avatar-btn"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <UserAvatarBadge
              avatar={seller.avatar}
              name={seller.name}
              email={seller.email}
              size={38}
              style={{
                border: '2px solid var(--seller-gold)',
              }}
            />
          </button>

          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: '230px',
                backgroundColor: 'var(--seller-white)',
                border: '1px solid var(--seller-border)',
                borderRadius: 'var(--seller-radius)',
                boxShadow: 'var(--seller-shadow-lg)',
                padding: '12px 0',
                zIndex: 200,
              }}
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div
                style={{
                  padding: '6px 16px 10px',
                  borderBottom: '1px solid var(--seller-border)',
                  marginBottom: '6px',
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: 'var(--seller-espresso)',
                  }}
                >
                  {seller.name}
                </strong>
                <small
                  style={{
                    fontSize: '11px',
                    color: 'var(--seller-gold-dark)',
                    fontWeight: 600,
                  }}
                >
                  {shop.name}
                </small>
              </div>

              <Link
                to="/seller/shop/profile"
                className="seller-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  color: 'var(--seller-dark-text)',
                  textDecoration: 'none',
                }}
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Store size={15} color="var(--seller-gold)" />
                <span>Shop Profile</span>
              </Link>

              <Link
                to="/seller/shop/settings"
                className="seller-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  color: 'var(--seller-dark-text)',
                  textDecoration: 'none',
                }}
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Sliders size={15} color="var(--seller-gold)" />
                <span>Shop Settings</span>
              </Link>

              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="seller-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  color: 'var(--seller-dark-text)',
                  textDecoration: 'none',
                }}
                onClick={() => setProfileDropdownOpen(false)}
              >
                <ExternalLink size={15} color="var(--seller-gold)" />
                <span>View Live Store</span>
              </Link>

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--seller-border)',
                  margin: '6px 0',
                }}
              />

              <button
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  color: 'var(--seller-danger)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  requestLogoutSeller();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

