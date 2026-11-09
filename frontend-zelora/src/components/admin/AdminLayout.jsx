import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import Toast from '../common/Toast';
import './admin.css';

export default function AdminLayout({ children, title, subtitle, actionButton }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}

