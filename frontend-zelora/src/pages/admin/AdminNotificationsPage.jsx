import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Bell, Send, CheckCircle, Users, Store } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { notificationsList, sendBroadcastNotification } = useAdmin();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all'
  });
  const [sentSuccess, setSentSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayNotifs = notificationsList.length > 0 ? notificationsList : [
    {
      id: 1,
      title: 'Scheduled Platform System Optimization',
      message: 'Scheduled maintenance window for payment gateway API upgrades completed with zero customer downtime.',
      target_audience: 'all',
      sent_at: '2026-11-06T15:30:00Z',
      created_by_email: 'admin@zelora.luxury'
    },
    {
      id: 2,
      title: 'Holiday Shipping Deadlines for Merchants',
      message: 'All priority dispatch orders must be handed over to concierge logistics within 24 hours of confirmation.',
      target_audience: 'sellers',
      sent_at: '2026-11-04T09:00:00Z',
      created_by_email: 'operations@zelora.luxury'
    }
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await sendBroadcastNotification(formData);
    setSentSuccess(`Broadcast sent to ${formData.target_audience === 'all' ? 'All Platform Users' : formData.target_audience}.`);
    setFormData({ title: '', message: '', target_audience: 'all' });
    setSubmitting(false);
    setTimeout(() => setSentSuccess(''), 4000);
  };

  return (
    <AdminLayout
      title="System Broadcasts & Announcements"
      subtitle="Dispatch real-time push announcements and administrative alerts to customers and vendor ateliers."
    >
      {sentSuccess && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(48, 164, 108, 0.15)',
          border: '1px solid #30A46C',
          borderRadius: '6px',
          color: '#30A46C',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{sentSuccess}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Compose Broadcast Form */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Compose Platform Notification</h3>
          </div>
          <form onSubmit={handleSend}>
            <div className="admin-input-group">
              <label className="admin-label">Broadcast Target Audience</label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="admin-select"
              >
                <option value="all">All Platform Users (Customers & Sellers)</option>
                <option value="customers">Customers Only</option>
                <option value="sellers">Boutique Sellers Only</option>
              </select>
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Notification Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. VIP Atelier Seasonal Preview"
                className="admin-input"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Announcement Message</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Provide clear, concise details..."
                className="admin-textarea"
                required
              />
            </div>

            <button type="submit" className="btn-admin-gold" disabled={submitting}>
              <Send size={14} />
              <span>{submitting ? 'Broadcasting...' : 'Broadcast Notification'}</span>
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Broadcast History</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayNotifs.map((n) => (
              <div
                key={n.id}
                style={{
                  backgroundColor: '#0B0B0E',
                  border: '1px solid #23232C',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#F6F6F9' }}>{n.title}</strong>
                  <span className="status-pill active" style={{ fontSize: '10px' }}>
                    Audience: {n.target_audience}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                  {n.message}
                </p>
                <div style={{ fontSize: '11px', color: '#C6A664' }}>
                  Dispatched by {n.created_by_email || 'Super Admin'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

