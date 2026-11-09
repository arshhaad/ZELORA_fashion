import { useState } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ShoppingBag,
  AlertTriangle,
  Wallet,
  Star,
  Sparkles,
} from 'lucide-react';

export default function SellerNotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useSeller();

  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'order', 'stock', 'payout', 'review'

  const filtered = notifications.filter((notif) => {
    if (filterType === 'unread') return !notif.is_read;
    if (filterType === 'all') return true;
    return notif.type === filterType;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} color="var(--seller-espresso)" />;
      case 'stock':
        return <AlertTriangle size={18} color="var(--seller-warning)" />;
      case 'payout':
        return <Wallet size={18} color="var(--seller-gold-dark)" />;
      case 'review':
        return <Star size={18} color="var(--seller-gold)" fill="var(--seller-gold)" />;
      default:
        return <Sparkles size={18} color="var(--seller-espresso)" />;
    }
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Notification Center</h1>
          <p className="seller-page-subtitle">
            Stay updated with real-time orders, payout clearances, inventory alerts, and platform announcements.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-secondary"
          onClick={markAllNotificationsAsRead}
        >
          <CheckCheck size={16} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* FILTER BUTTONS ROW */}
      <div className="seller-card mb-24" style={{ padding: '14px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'unread', label: 'Unread Only' },
            { id: 'order', label: 'Orders' },
            { id: 'stock', label: 'Inventory' },
            { id: 'payout', label: 'Payouts' },
            { id: 'review', label: 'Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              style={{
                border: '1px solid var(--seller-border)',
                background: filterType === tab.id ? 'var(--seller-espresso)' : 'var(--seller-white)',
                color: filterType === tab.id ? 'var(--seller-white)' : 'var(--seller-dark-text)',
                padding: '6px 14px',
                borderRadius: 'var(--seller-radius)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--seller-transition)',
              }}
              onClick={() => setFilterType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="seller-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ margin: 0, color: 'var(--seller-muted)' }}>
              No notifications to display in this category.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className="seller-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '16px 20px',
                backgroundColor: n.is_read ? 'var(--seller-white)' : 'var(--seller-cream-subtle)',
                borderLeft: n.is_read ? '1px solid var(--seller-border)' : '4px solid var(--seller-gold)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--seller-radius)',
                    backgroundColor: 'var(--seller-beige-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIconForType(n.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--seller-espresso)' }}>
                      {n.title}
                    </strong>
                    {!n.is_read && (
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--seller-gold)',
                        }}
                      />
                    )}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--seller-dark-text)', lineHeight: 1.4 }}>
                    {n.description}
                  </p>
                  <small style={{ color: 'var(--seller-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    {n.time}
                  </small>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {!n.is_read && (
                  <button
                    type="button"
                    className="btn-seller-secondary btn-seller-sm"
                    onClick={() => markNotificationAsRead(n.id)}
                    title="Mark as Read"
                  >
                    <Check size={13} />
                  </button>
                )}
                <button
                  type="button"
                  className="btn-seller-secondary btn-seller-sm"
                  onClick={() => deleteNotification(n.id)}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </SellerLayout>
  );
}

