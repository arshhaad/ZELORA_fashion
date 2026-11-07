import { useState } from 'react';
import AccountLayout from '../../components/account/AccountLayout';
import { useCustomer } from '../../context/CustomerContext';
import {
  Bell,
  Package,
  Tag,
  CheckCircle2,
  Trash2,
  Check,
  Settings,
  Clock,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    notifications,
    unreadNotificationsCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    notificationPrefs,
    toggleNotificationPref,
  } = useCustomer();

  const [activeFilter, setActiveFilter] = useState('all'); // all, orders, promotions
  const [showPreferences, setShowPreferences] = useState(false);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'all') return true;
    return notif.category === activeFilter;
  });

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <AccountLayout
      activeTab="notifications"
      title="Notifications & Alerts"
      subtitle="Stay informed on order fulfillment, delivery milestones, and private archive events."
    >
      <div className="notifications-page-wrap">
        {/* Controls Row */}
        <div className="notif-controls-bar">
          <div className="notif-tabs-pills">
            <button
              type="button"
              className={`notif-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-filter-pill ${activeFilter === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveFilter('orders')}
            >
              Orders ({notifications.filter((n) => n.category === 'orders').length})
            </button>
            <button
              type="button"
              className={`notif-filter-pill ${activeFilter === 'promotions' ? 'active' : ''}`}
              onClick={() => setActiveFilter('promotions')}
            >
              Promotions ({notifications.filter((n) => n.category === 'promotions').length})
            </button>
          </div>

          <div className="notif-actions-group">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                className="btn-mark-all-read"
                onClick={markAllAsRead}
              >
                <Check size={14} />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              type="button"
              className={`btn-notif-pref-toggle ${showPreferences ? 'active' : ''}`}
              onClick={() => setShowPreferences(!showPreferences)}
            >
              <Settings size={15} />
              <span>Preferences</span>
            </button>
          </div>
        </div>

        {/* Notification Preferences Drawer / Card */}
        {showPreferences && (
          <div className="notif-preferences-box">
            <div className="pref-header">
              <h4>Delivery & Marketing Communication Settings</h4>
              <p>Configure which channels dispatch push alerts and notifications to your portal.</p>
            </div>

            <div className="pref-toggles-list">
              <div className="pref-toggle-row">
                <div>
                  <strong>Order Status & Tracking Notifications</strong>
                  <p>Real-time updates regarding order placement, dispatch, transit milestones, and delivery.</p>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.orderUpdates}
                    onChange={() => toggleNotificationPref('orderUpdates')}
                  />
                  <span className="slider-toggle"></span>
                </label>
              </div>

              <div className="pref-toggle-row">
                <div>
                  <strong>Promotional & Private Archive Notifications</strong>
                  <p>Exclusive runway previews, secret archives, discount alerts, and collection drops.</p>
                </div>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.promotions}
                    onChange={() => toggleNotificationPref('promotions')}
                  />
                  <span className="slider-toggle"></span>
                </label>
              </div>
            </div>

            <div className="essential-notice">
              <ShieldAlert size={14} />
              <span>
                Important: Critical security alerts and order transaction confirmations will always be delivered regardless of preferences.
              </span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="notifications-list-container">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item-card ${notif.is_read ? 'is-read' : 'is-unread'}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="notif-icon-col">
                  {notif.category === 'orders' ? (
                    <div className="notif-icon-circle orders">
                      <Package size={18} />
                    </div>
                  ) : (
                    <div className="notif-icon-circle promotions">
                      <Tag size={18} />
                    </div>
                  )}
                </div>

                <div className="notif-body-col">
                  <div className="notif-title-row">
                    <h4 className="notif-title">{notif.title}</h4>
                    <span className="notif-time">
                      <Clock size={12} /> {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="notif-desc">{notif.description}</p>
                </div>

                <div className="notif-actions-col">
                  {!notif.is_read && (
                    <button
                      type="button"
                      className="btn-read-check"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-notif-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Delete notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notif-state">
            <Bell size={44} strokeWidth={1.2} />
            <h3>No Notifications</h3>
            <p>You have caught up with all order updates and atelier announcements.</p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

