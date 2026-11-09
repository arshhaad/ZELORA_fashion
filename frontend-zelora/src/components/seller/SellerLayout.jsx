import { useState } from 'react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import { useSeller } from '../../context/SellerContext';
import { ShopLogoBadge } from '../common/BrandBadge';
import { Sparkles, CheckCircle, X, LogOut } from 'lucide-react';
import './seller.css';

export default function SellerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toastMessage, seller, shop, showLogoutConfirm, cancelLogoutSeller, confirmLogoutSeller } = useSeller();

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

      {/* Luxury Seller Sign Out Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="seller-modal-overlay"
          onClick={cancelLogoutSeller}
          style={{
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(5px)',
            padding: '20px',
            position: 'fixed',
            inset: 0,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#111115',
              border: '1px solid #292932',
              borderRadius: '12px',
              padding: '28px 24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
              textAlign: 'center',
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
                background: 'linear-gradient(90deg, #C6A664 0%, #DFBE7C 100%)',
              }}
            />

            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(198, 166, 100, 0.12)',
                border: '1px solid rgba(198, 166, 100, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <LogOut size={24} color="#C6A664" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#F6F6F9', marginBottom: '8px' }}>
              Confirm Sign Out
            </h3>
            <p style={{ fontSize: '13px', color: '#9E9EA8', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to log out of the Seller Center? Any unsaved edits will remain pending until your next session.
            </p>

            {(seller || shop) && (
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
                <ShopLogoBadge
                  logo={shop?.logo}
                  name={shop?.name || seller?.name || 'Boutique Atelier'}
                  size={34}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: '12px', color: '#F6F6F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {shop?.name || seller?.name || 'Boutique Atelier'}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#C6A664' }}>
                    {seller?.email || 'Seller Account'}
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={cancelLogoutSeller}
                style={{
                  backgroundColor: '#1E1E26',
                  color: '#F6F6F9',
                  border: '1px solid #2E2E38',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={confirmLogoutSeller}
                style={{
                  backgroundColor: '#E5484D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
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

