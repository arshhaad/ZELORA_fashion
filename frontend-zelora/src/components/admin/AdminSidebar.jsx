import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { UserAvatarBadge } from '../common/BrandBadge';
import {
  LayoutDashboard,
  Users,
  Store,
  ShieldCheck,
  CheckCircle,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Percent,
  Wallet,
  Ticket,
  Image,
  Bell,
  Star,
  BarChart3,
  HelpCircle,
  Sliders,
  LogOut,
  X
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const { adminUser, requestLogoutAdmin, dashboardMetrics } = useAdmin();
  const location = useLocation();

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      group: 'USER MANAGEMENT',
      items: [
        { label: 'Customers', path: '/admin/users/customers', icon: Users },
        { label: 'Sellers', path: '/admin/users/sellers', icon: Store },
        { label: 'Admin Roles & Team', path: '/admin/users/admins', icon: ShieldCheck },
      ],
    },
    {
      group: 'SHOP MANAGEMENT',
      items: [
        {
          label: 'Shop Approvals',
          path: '/admin/shops/approvals',
          icon: CheckCircle,
          badge: dashboardMetrics.pending_shop_approvals > 0 ? dashboardMetrics.pending_shop_approvals : null,
          badgeDanger: true,
        },
        { label: 'All Registered Shops', path: '/admin/shops', icon: Store },
      ],
    },
    {
      group: 'PRODUCT MANAGEMENT',
      items: [
        { label: 'All Products & Mod', path: '/admin/products', icon: Package },
        { label: 'Categories', path: '/admin/categories', icon: Layers },
        { label: 'Fashion Brands', path: '/admin/brands', icon: Sparkles },
      ],
    },
    {
      group: 'ORDERS & PAYMENTS',
      items: [
        { label: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Payment Gateway', path: '/admin/payments', icon: CreditCard },
        { label: 'Commission Rules', path: '/admin/commissions', icon: Percent },
        {
          label: 'Payout Management',
          path: '/admin/payouts',
          icon: Wallet,
          badge: dashboardMetrics.pending_payouts > 0 ? dashboardMetrics.pending_payouts : null,
        },
      ],
    },
    {
      group: 'MARKETING & CONTENT',
      items: [
        { label: 'Coupons & Promos', path: '/admin/coupons', icon: Ticket },
        { label: 'Homepage Banners', path: '/admin/banners', icon: Image },
        { label: 'System Notifications', path: '/admin/notifications', icon: Bell },
      ],
    },
    {
      group: 'SUPPORT & REPORTS',
      items: [
        { label: 'Customer Reviews', path: '/admin/reviews', icon: Star },
        { label: 'Analytical Reports', path: '/admin/reports', icon: BarChart3 },
        {
          label: 'Support Tickets',
          path: '/admin/support',
          icon: HelpCircle,
          badge: dashboardMetrics.open_tickets > 0 ? dashboardMetrics.open_tickets : null,
        },
        { label: 'Platform Settings', path: '/admin/settings', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <Link to="/admin" className="admin-brand-link" onClick={onClose}>
          <span className="admin-brand-title">ZELORA</span>
          <span className="admin-brand-pill">ADMIN</span>
        </Link>
        {onClose && (
          <button
            type="button"
            className="admin-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="admin-nav-scroll">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="admin-nav-group">
            <div className="admin-nav-group-label">{group.group}</div>
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path || location.pathname === '/admin/dashboard'
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={iIdx}
                  to={item.path}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <div className="admin-nav-item-left">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`admin-nav-badge ${item.badgeDanger ? 'danger' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Admin User Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <UserAvatarBadge
            avatar={adminUser?.avatar}
            name={adminUser?.name || 'Zelora SuperAdmin'}
            email={adminUser?.email}
            role={adminUser?.role || 'Super Admin'}
            size={34}
          />
          <div>
            <p className="admin-user-name">{adminUser?.name || 'Administrator'}</p>
            <p className="admin-user-role">{adminUser?.role || 'Super Admin'}</p>
          </div>
        </div>
        <button
          type="button"
          className="btn-admin-logout-icon"
          onClick={requestLogoutAdmin}
          title="Sign Out from Admin Panel"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

