import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle,
  ShoppingBag,
  CreditCard,
  MapPin,
  Send,
  Bell,
  Clock,
  Sparkles,
  ExternalLink,
  Tag,
  AlertTriangle
} from 'lucide-react';

export default function AdminCustomerProfilePage() {
  const { id } = useParams();
  const { getCustomerDetail, toggleCustomerBlock, sendDirectNotification, directMessages } = useAdmin();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Messaging Form State
  const [msgForm, setMsgForm] = useState({
    title: '',
    message: '',
    priority: 'Normal',
    category: 'promotions',
  });
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  // Load customer details
  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomerDetail(id);
        if (isMounted) {
          setCustomer(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load customer profile details.');
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [id, getCustomerDetail]);

  const handleToggleBlock = async () => {
    if (!customer) return;
    await toggleCustomerBlock(customer.id);
    setCustomer((prev) => ({
      ...prev,
      is_active: !prev.is_active,
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgForm.title.trim() || !msgForm.message.trim() || !customer) return;

    setDispatching(true);
    try {
      const res = await sendDirectNotification({
        recipient_type: 'customer',
        recipient_id: customer.id,
        recipient_email: customer.email,
        recipient_name: customer.name,
        title: msgForm.title.trim(),
        message: msgForm.message.trim(),
        priority: msgForm.priority,
        category: msgForm.category,
      });

      // Update customer local notifications list in real-time
      setCustomer((prev) => ({
        ...prev,
        notifications: [
          {
            id: res.message.id,
            title: res.message.title,
            description: res.message.message,
            category: res.message.category,
            priority: res.message.priority,
            created_at: res.message.sent_at,
            is_read: false,
          },
          ...(prev.notifications || []),
        ],
      }));

      setDispatchSuccess(`Notification successfully dispatched to ${customer.name}.`);
      setMsgForm({ title: '', message: '', priority: 'Normal', category: 'promotions' });
      setTimeout(() => setDispatchSuccess(''), 4500);
    } catch (err) {
      console.error('Failed to dispatch notification', err);
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Customer Executive Dossier"
        subtitle="Loading client records, order history, and executive messaging context..."
      >
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9E9EA8' }}>
          <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', letterSpacing: '0.5px' }}>Retrieving client data from ZELORA Vault...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !customer) {
    return (
      <AdminLayout
        title="Customer Dossier"
        subtitle="Requested client could not be located in database records."
      >
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <AlertTriangle size={36} color="#E5484D" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: '#F6F6F9', marginBottom: '8px' }}>Customer Profile Unavailable</h3>
          <p style={{ color: '#9E9EA8', fontSize: '13px', marginBottom: '20px' }}>
            {error || 'No customer matching this ID was found.'}
          </p>
          <Link to="/admin/users/customers" className="btn-admin-gold">
            <ArrowLeft size={14} /> Return to Customer Roster
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Filter messages specifically dispatched to this customer from directMessages state
  const customerMessages = (customer.notifications || []).filter(
    (n) => n.title || n.description
  );

  return (
    <AdminLayout
      title={`Customer Dossier — ${customer.name}`}
      subtitle="Comprehensive client profile, lifetime spending records, registered addresses, and direct concierge messaging."
    >
      {/* Top Navigation & Quick Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/admin/users/customers" className="btn-admin-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
          <ArrowLeft size={13} /> Back to Customer Governance
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="#admin-direct-message-box" className="btn-admin-gold" style={{ fontSize: '12px', padding: '6px 14px' }}>
            <Send size={13} /> Dispatch Message
          </a>
          <button
            type="button"
            className={customer.is_active ? 'btn-admin-danger' : 'btn-admin-success'}
            onClick={handleToggleBlock}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            {customer.is_active ? (
              <>
                <Ban size={13} style={{ marginRight: '4px' }} /> Block Customer
              </>
            ) : (
              <>
                <CheckCircle size={13} style={{ marginRight: '4px' }} /> Unblock Customer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="admin-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #C6A664 0%, #8E743F 50%, #C6A664 100%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img
              src={customer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={customer.name}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #C6A664',
                boxShadow: '0 4px 16px rgba(198, 166, 100, 0.25)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F6F6F9', margin: 0 }}>
                  {customer.name}
                </h2>
                <span className={`status-pill ${customer.is_active ? 'active' : 'blocked'}`}>
                  {customer.is_active ? 'Active Account' : 'Suspended / Blocked'}
                </span>
                {customer.is_email_verified && (
                  <span className="status-pill active" title="Email Verified">
                    <ShieldCheck size={11} style={{ marginRight: '3px' }} /> Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#9E9EA8', flexWrap: 'wrap' }}>
                <span>
                  <Mail size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  {customer.email}
                </span>
                <span>
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  {customer.phone}
                </span>
                <span>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  Joined {customer.date_joined}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9E9EA8' }}>
              Client Classification
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(198, 166, 100, 0.12)',
                color: '#C6A664',
                border: '1px solid rgba(198, 166, 100, 0.3)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <Sparkles size={13} />
              {Number(customer.metrics?.total_spent) > 3000 ? 'ZELORA Noir Private Client' : 'Select Atelier Patron'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Lifetime KPI Strip */}
      <div className="admin-metrics-grid">
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Lifetime Spend</span>
            <div className="kpi-icon-wrap">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#C6A664' }}>
            ₹{Number(customer.metrics?.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="kpi-subtext" style={{ color: '#9E9EA8' }}>
            Across all verified luxury checkouts
          </span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Total Orders Placed</span>
            <div className="kpi-icon-wrap">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {customer.metrics?.orders_count || 0}
          </div>
          <span className="kpi-subtext" style={{ color: '#30A46C' }}>
            {customer.orders?.length || 0} orders recorded in audit log
          </span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Average Order Value</span>
            <div className="kpi-icon-wrap">
              <Tag size={18} />
            </div>
          </div>
          <div className="kpi-value">
            ₹{Number(customer.metrics?.average_order_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="kpi-subtext" style={{ color: '#9E9EA8' }}>
            Normalized platform checkout average
          </span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Authentication Type</span>
            <div className="kpi-icon-wrap">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '20px', textTransform: 'capitalize' }}>
            {customer.auth_provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
          </div>
          <span className="kpi-subtext" style={{ color: '#30A46C' }}>
            {customer.is_email_verified ? 'Verified Identity Verified' : 'Standard Authentication'}
          </span>
        </div>
      </div>

      {/* Main Grid: Details Left, Messaging Box Right */}
      <div className="admin-grid-split">
        {/* Left Side: Profile Details, Addresses & Orders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metadata Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Client Identification & Contact</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <span className="admin-label">Account System ID</span>
                <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>CUST-{customer.id}</strong>
              </div>
              <div>
                <span className="admin-label">Primary Email</span>
                <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>{customer.email}</strong>
              </div>
              <div>
                <span className="admin-label">Mobile Contact</span>
                <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>{customer.phone || '—'}</strong>
              </div>
              <div>
                <span className="admin-label">Gender Preference</span>
                <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>{customer.gender || 'Not Specified'}</strong>
              </div>
              <div>
                <span className="admin-label">Registration Date</span>
                <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>{customer.date_joined}</strong>
              </div>
              <div>
                <span className="admin-label">Account State</span>
                <span className={`status-pill ${customer.is_active ? 'active' : 'blocked'}`}>
                  {customer.is_active ? 'Active' : 'Restricted'}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Addresses Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#C6A664" /> Saved Shipping & Concierge Addresses ({customer.addresses?.length || 0})
              </h3>
            </div>
            {(!customer.addresses || customer.addresses.length === 0) ? (
              <p style={{ color: '#9E9EA8', fontSize: '13px', margin: 0 }}>
                No delivery addresses recorded for this client.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      backgroundColor: '#0B0B0E',
                      border: '1px solid #23232C',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ color: '#F6F6F9', fontSize: '13px' }}>
                        {addr.full_name} • {addr.mobile_number}
                      </strong>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#9E9EA8', background: '#1B1B22', padding: '2px 8px', borderRadius: '4px' }}>
                          {addr.address_type || 'Home'}
                        </span>
                        {addr.is_default && (
                          <span className="status-pill active">Default Delivery</span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9E9EA8', margin: 0, lineHeight: 1.5 }}>
                      {addr.house_building}, {addr.street_area}, {addr.city}, {addr.state} — {addr.pin_code}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders History Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={16} color="#C6A664" /> Client Order History ({customer.orders?.length || 0})
              </h3>
            </div>
            {(!customer.orders || customer.orders.length === 0) ? (
              <p style={{ color: '#9E9EA8', fontSize: '13px', margin: 0 }}>
                No orders placed by this customer yet.
              </p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <strong style={{ color: '#F6F6F9', fontSize: '12px' }}>{ord.order_id}</strong>
                          {ord.tracking_number && (
                            <span style={{ display: 'block', fontSize: '10px', color: '#9E9EA8' }}>
                              Track: {ord.tracking_number}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#9E9EA8' }}>{ord.created_at}</td>
                        <td style={{ fontSize: '12px' }}>{ord.items_count || 1} item(s)</td>
                        <td>
                          <strong style={{ color: '#C6A664' }}>
                            ₹{Number(ord.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                        </td>
                        <td>
                          <span className={`status-pill ${
                            ord.status === 'Delivered' || ord.status === 'Completed'
                              ? 'completed'
                              : ord.status === 'Processing' || ord.status === 'Shipped'
                              ? 'in_progress'
                              : 'pending'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#9E9EA8' }}>{ord.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Direct Message / Notification Composer & History */}
        <div id="admin-direct-message-box" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Dispatch Message Card */}
          <div className="admin-card" style={{ border: '1px solid #C6A664', backgroundColor: '#131318' }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C6A664' }}>
                  <Send size={16} /> Direct Message & Notification Box
                </h3>
                <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '4px 0 0' }}>
                  Transmit real-time concierge alerts, order notices, or exclusive previews directly to {customer.name}.
                </p>
              </div>
            </div>

            {dispatchSuccess && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(48, 164, 108, 0.15)',
                  border: '1px solid #30A46C',
                  borderRadius: '6px',
                  color: '#30A46C',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={15} />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage}>
              <div className="admin-input-group">
                <label className="admin-label">Notification Subject / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bespoke Fitting Invitation / Private Runway Preview"
                  value={msgForm.title}
                  onChange={(e) => setMsgForm({ ...msgForm, title: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label className="admin-label">Priority Level</label>
                  <select
                    value={msgForm.priority}
                    onChange={(e) => setMsgForm({ ...msgForm, priority: e.target.value })}
                    className="admin-select"
                  >
                    <option value="Normal">Normal Concierge</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Notice</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">Message Category</label>
                  <select
                    value={msgForm.category}
                    onChange={(e) => setMsgForm({ ...msgForm, category: e.target.value })}
                    className="admin-select"
                  >
                    <option value="promotions">VIP Privilege & Privé</option>
                    <option value="orders">Order & Courier Dispatch</option>
                    <option value="account">Account & Security</option>
                  </select>
                </div>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Message Body</label>
                <textarea
                  rows="4"
                  placeholder="Compose formal executive correspondence or direct notification for this client..."
                  value={msgForm.message}
                  onChange={(e) => setMsgForm({ ...msgForm, message: e.target.value })}
                  className="admin-textarea"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="btn-admin-gold"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {dispatching ? (
                    'Transmitting Message...'
                  ) : (
                    <>
                      <Send size={14} /> Send Notification to Client
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Dispatched Messages History */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#C6A664" /> Dispatched Notification History ({customerMessages.length})
              </h3>
            </div>

            {customerMessages.length === 0 ? (
              <p style={{ color: '#9E9EA8', fontSize: '13px', margin: 0, textAlign: 'center', padding: '24px 0' }}>
                No direct messages or notifications dispatched to this user yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customerMessages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    style={{
                      backgroundColor: '#0B0B0E',
                      border: '1px solid #23232C',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <strong style={{ color: '#F6F6F9', fontSize: '13px' }}>
                        {msg.title}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {msg.priority && (
                          <span
                            className={`status-pill ${
                              msg.priority.toLowerCase() === 'urgent'
                                ? 'blocked'
                                : msg.priority.toLowerCase() === 'high'
                                ? 'pending'
                                : 'active'
                            }`}
                          >
                            {msg.priority}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#9E9EA8' }}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#D1D1DB', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {msg.description || msg.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '10px', color: '#30A46C' }}>
                      <CheckCircle size={10} /> Dispatched to Client Feed & Bell
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
