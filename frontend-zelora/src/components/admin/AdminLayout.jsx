import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Toast from '../common/Toast';
import { useAdmin } from '../../context/AdminContext';
import { LogOut } from 'lucide-react';
import './admin.css';

export default function AdminLayout({ children, title, subtitle, actionButton }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser, showLogoutConfirm, cancelLogoutAdmin, confirmLogoutAdmin } = useAdmin();

  return (
    <div className="admin-shell">
      <Toast />

      {/* Mobile Sidebar Backdrop Overlay */}
      <div
        className={`admin-sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Responsive Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Panel Content */}
      <div className="admin-main-wrap">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="admin-page-content">
          {(title || subtitle || actionButton) && (
            <div className="admin-page-header">
              <div className="admin-title-group">
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
              </div>
              {actionButton && <div>{actionButton}</div>}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Executive Admin Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="admin-modal-backdrop"
          onClick={cancelLogoutAdmin}
          style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(5px)' }}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '440px',
              padding: '28px 24px',
              textAlign: 'center',
              backgroundColor: '#131318',
              border: '1px solid #2E2E38',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #E5484D 0%, #C6A664 100%)',
              }}
            />

            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(229, 72, 77, 0.12)',
                border: '1px solid rgba(229, 72, 77, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <LogOut size={24} color="#E5484D" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#F6F6F9', marginBottom: '8px' }}>
              Confirm Sign Out
            </h3>
            <p style={{ fontSize: '13px', color: '#9E9EA8', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to end your administrative session? You will need your security credentials to re-enter executive governance.
            </p>

            {adminUser && (
              <div
                style={{
                  backgroundColor: '#0B0B0E',
                  border: '1px solid #23232C',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}
              >
                <img
                  src={adminUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                  alt={adminUser?.name}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #23232C' }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#F6F6F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {adminUser?.name || 'Administrator'}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#C6A664' }}>
                    {adminUser?.email} • {adminUser?.role || 'Super Admin'}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={cancelLogoutAdmin}
                style={{ justifyContent: 'center', padding: '10px', fontSize: '13px' }}
              >
                Stay Signed In
              </button>
              <button
                type="button"
                className="btn-admin-danger"
                onClick={confirmLogoutAdmin}
                style={{ justifyContent: 'center', padding: '10px', fontSize: '13px', fontWeight: 700 }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

