import { useState } from 'react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { Sparkles, CheckCircle, X } from 'lucide-react';
import './seller.css';

export default function SellerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toastMessage } = useSeller();

  return (
    <div className="seller-app-root">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="seller-modal-overlay"
          style={{ zIndex: 95 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Collapsible Sidebar */}
      <SellerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="seller-main-wrapper">
        <SellerHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Global Seller Toast Message */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '84px',
              right: '32px',
              zIndex: 1100,
              backgroundColor: 'var(--seller-espresso)',
              color: 'var(--seller-white)',
              border: '1px solid var(--seller-gold)',
              boxShadow: 'var(--seller-shadow-lg)',
              padding: '14px 20px',
              borderRadius: 'var(--seller-radius)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: 600,
              maxWidth: '420px',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <CheckCircle size={18} color="var(--seller-gold)" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className="seller-content-body">{children}</main>
      </div>
    </div>
  );
}

