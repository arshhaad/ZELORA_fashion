import { Link, useLocation } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import { UserAvatarBadge } from '../common/BrandBadge';
import {
  LayoutDashboard,
  Store,
  Sliders,
  PlusCircle,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Ticket,
  BarChart3,
  Star,
  Bell,
  Wallet,
  HelpCircle,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';

export default function SellerSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const {
    shop,
    seller,
    requestLogoutSeller,
    pendingOrdersCount,
    lowStockProductsCount,
    unreadNotifsCount,
    toggleShopAvailability,
  } = useSeller();

  const isActive = (path) => {
    if (path === '/seller/dashboard') {
      return location.pathname === '/seller/dashboard' || location.pathname === '/seller';
    }
    return location.pathname.startsWith(path);
  };

  const navGroups = [
    {
      title: null,
      items: [
        {
          label: 'Dashboard',
          path: '/seller/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Shop Management',
      items: [
        {
          label: 'Shop Profile',
          path: '/seller/shop/profile',
          icon: Store,
        },
        {
          label: 'Shop Settings',
          path: '/seller/shop/settings',
          icon: Sliders,
        },
      ],
    },
    {
      title: 'Product Management',
      items: [
        {
          label: 'Add Product',
          path: '/seller/products/add',
          icon: PlusCircle,
        },
        {
          label: 'My Products',
          path: '/seller/products',
          icon: Package,
        },
        {
          label: 'Categories',
          path: '/seller/categories',
          icon: Layers,
        },
        {
          label: 'Inventory',
          path: '/seller/inventory',
          icon: Boxes,
          badge: lowStockProductsCount > 0 ? `${lowStockProductsCount} low` : null,
          badgeAlert: lowStockProductsCount > 0,
        },
      ],
    },
    {
      title: 'Order Management',
      items: [
        {
          label: 'Orders',
          path: '/seller/orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
        },
      ],
    },
    {
      title: 'Marketing & Sales',
      items: [
        {
          label: 'Coupons',
          path: '/seller/coupons',
          icon: Ticket,
        },
        {
          label: 'Sales Reports',
          path: '/seller/reports',
          icon: BarChart3,
        },
        {
          label: 'Reviews',
          path: '/seller/reviews',
          icon: Star,
        },
      ],
    },
    {
      title: 'Account & Support',
      items: [
        {
          label: 'Notifications',
          path: '/seller/notifications',
          icon: Bell,
          badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
        },
        {
          label: 'Payouts',
          path: '/seller/payouts',
          icon: Wallet,
        },
        {
          label: 'Support',
          path: '/seller/support',
          icon: HelpCircle,
        },
      ],
    },
  ];

  return (
    <>
      <aside className={`seller-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand & Atelier Header */}
        <div className="seller-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/seller/dashboard" className="seller-brand-link" onClick={() => onClose && onClose()}>
              <h2 className="seller-brand-title">ZELORA</h2>
              <div className="seller-brand-subtitle">
                <Sparkles size={11} />
                <span>SELLER CENTER</span>
              </div>
            </Link>
            <button
              type="button"
              className="seller-sidebar-close-btn"
              onClick={onClose}
              aria-label="Close Navigation Drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Live Shop Availability Switch */}
          <div className="seller-shop-status-box">
            <div className="shop-status-label">
              <span className={(shop?.is_open ?? true) ? 'status-dot-active' : 'status-dot-closed'} />
              <span>{(shop?.is_open ?? true) ? 'Shop: Open' : 'Shop: Closed'}</span>
            </div>
            <button
              type="button"
              className="btn-status-toggle"
              onClick={toggleShopAvailability}
              title="Toggle shop order acceptance"
            >
              {(shop?.is_open ?? true) ? 'Close' : 'Open'}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <ul className="seller-nav-list">
          {navGroups.map((group, gIdx) => (
            <li key={gIdx} className="seller-nav-group">
              {group.title && (
                <div className="seller-nav-group-title">{group.title}</div>
              )}
              {group.items.map((item, iIdx) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);

                return (
                  <div key={iIdx} className="seller-nav-item">
                    <Link
                      to={item.path}
                      className={`seller-nav-link ${active ? 'active' : ''}`}
                      onClick={() => onClose && onClose()}
                    >
                      <div className="seller-nav-link-content">
                        <IconComponent size={17} className="seller-nav-link-icon" />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`seller-nav-badge ${
                            item.badgeAlert ? 'badge-alert' : ''
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </li>
          ))}

          {/* Quick link to view customer store */}
          <li className="seller-nav-group" style={{ marginTop: '16px' }}>
            <div className="seller-nav-group-title">Marketplace</div>
            <div className="seller-nav-item">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="seller-nav-link"
                style={{ opacity: 0.75 }}
              >
                <div className="seller-nav-link-content">
                  <ExternalLink size={16} className="seller-nav-link-icon" />
                  <span>View Customer Store</span>
                </div>
              </Link>
            </div>
          </li>
        </ul>

        {/* Sidebar Footer User Info & Logout */}
        <div className="seller-sidebar-footer">
          <div className="seller-profile-card">
            <div className="seller-profile-info">
              <UserAvatarBadge
                avatar={seller?.avatar}
                name={seller?.name}
                email={seller?.email}
                size={38}
              />
              <div className="seller-owner-meta">
                <p className="seller-owner-name">{seller?.name || 'Seller'}</p>
                <p className="seller-shop-handle">{shop?.name || 'Boutique Atelier'}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-sidebar-logout"
              onClick={requestLogoutSeller}
              title="Sign Out from Seller Center"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

