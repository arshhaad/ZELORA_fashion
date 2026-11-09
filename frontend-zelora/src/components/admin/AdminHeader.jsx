import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Menu, Search, ExternalLink, Store, LogOut } from 'lucide-react';

export default function AdminHeader({ onToggleSidebar }) {
  const { adminUser, requestLogoutAdmin } = useAdmin();

  return (
    <header className="admin-header">
      {/* Left: Mobile Toggle & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#F6F6F9',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          className="admin-mobile-toggle"
        >
          <Menu size={20} />
        </button>

        <div className="admin-header-search">
          <Search size={15} color="#9E9EA8" />
          <input
            type="text"
            placeholder="Search users, orders, shops, SKU or tickets..."
          />
        </div>
      </div>

      {/* Right: Platform Status, Portals, Admin Profile */}
      <div className="admin-header-actions">
        {/* Live System Indicator */}
        <div className="admin-status-indicator">
          <span className="admin-status-dot" />
          <span>PRODUCTION LIVE</span>
        </div>

        {/* Live Storefront Link */}
        <Link to="/" target="_blank" rel="noreferrer" className="admin-btn-storefront" title="Open Customer Store">
          <span>Customer App</span>
          <ExternalLink size={12} />
        </Link>

        {/* Seller Center Link */}
        <Link to="/seller" target="_blank" rel="noreferrer" className="admin-btn-storefront" title="Open Seller Center">
          <Store size={13} />
          <span>Seller App</span>
        </Link>

        {/* Logout Quick Action */}
        <button
          type="button"
          onClick={requestLogoutAdmin}
          className="btn-admin-danger"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          title="Sign Out"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}

