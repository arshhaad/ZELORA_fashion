import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { ShopLogoBadge, UserAvatarBadge } from '../../components/common/BrandBadge';
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Star,
  CheckCircle,
  Percent,
  TrendingUp,
  Package,
  Send,
  Clock,
  MapPin,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function AdminSellerProfilePage() {
  const { id } = useParams();
  const { getSellerDetail, toggleShopStatus, updateShopCommission, sendDirectNotification, directMessages } = useAdmin();

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Messaging Box State
  const [msgForm, setMsgForm] = useState({
    title: '',
    message: '',
    priority: 'Normal',
  });
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  // Commission Edit Modal State
  const [editingCommission, setEditingCommission] = useState(false);
  const [newRate, setNewRate] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchSeller = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getSellerDetail(id);
        if (isMounted) {
          setSeller(data);
          setNewRate(data.shop?.commission_rate || 12.5);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load seller profile details.');
          setLoading(false);
        }
      }
    };

    fetchSeller();
    return () => {
      isMounted = false;
    };
  }, [id, getSellerDetail]);

  const handleToggleStorefront = async () => {
    if (!seller || !seller.shop) return;
    const newIsOpen = !seller.shop.is_open;
    await toggleShopStatus(seller.shop.id);
    setSeller((prev) => ({
      ...prev,
      shop: {
        ...prev.shop,
        is_open: newIsOpen,
      },
    }));
  };

  const handleSaveCommission = (e) => {
    e.preventDefault();
    if (!seller || !newRate) return;
    const rateNum = parseFloat(newRate);
    updateShopCommission(seller.shop?.id || seller.id, rateNum);
    setSeller((prev) => ({
      ...prev,
      shop: {
        ...prev.shop,
        commission_rate: rateNum,
      },
      metrics: {
        ...prev.metrics,
        commission_rate: rateNum,
        net_commission: Math.round(Number(prev.metrics.total_sales) * (rateNum / 100) * 100) / 100,
      },
    }));
    setEditingCommission(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgForm.title.trim() || !msgForm.message.trim() || !seller) return;

    setDispatching(true);
    try {
      const res = await sendDirectNotification({
        recipient_type: 'seller',
        recipient_id: seller.id,
        recipient_email: seller.email,
        recipient_name: `${seller.name} (${seller.shop?.name || 'Atelier'})`,
        title: msgForm.title.trim(),
        message: msgForm.message.trim(),
        priority: msgForm.priority,
      });

      setSeller((prev) => ({
        ...prev,
        notifications: [
          {
            id: res.message.id,
            title: res.message.title,
            message: res.message.message,
            priority: res.message.priority,
            created_at: res.message.sent_at,
          },
          ...(prev.notifications || []),
        ],
      }));

      setDispatchSuccess(`Administrative message dispatched directly to ${seller.shop?.name || seller.name}.`);
      setMsgForm({ title: '', message: '', priority: 'Normal' });
      setTimeout(() => setDispatchSuccess(''), 4500);
    } catch (err) {
      console.error('Failed to dispatch seller message', err);
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Seller & Atelier Executive Dossier"
        subtitle="Loading vendor operational telemetry, storefront status, and boutique financials..."
      >
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9E9EA8' }}>
          <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', letterSpacing: '0.5px' }}>Retrieving boutique atelier records from ZELORA Vault...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !seller) {
    return (
      <AdminLayout
        title="Seller Dossier"
        subtitle="Requested vendor could not be located in database records."
      >
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <AlertTriangle size={36} color="#E5484D" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: '#F6F6F9', marginBottom: '8px' }}>Vendor Record Unavailable</h3>
          <p style={{ color: '#9E9EA8', fontSize: '13px', marginBottom: '20px' }}>
            {error || 'No seller or boutique matching this ID was found.'}
          </p>
          <Link to="/admin/users/sellers" className="btn-admin-gold">
            <ArrowLeft size={14} /> Return to Seller Directory
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const sellerMessages = (seller.notifications || []).filter(
    (n) => n.title || n.message
  );

  return (
    <AdminLayout
      title={`Atelier Dossier — ${seller.shop?.name || seller.name}`}
      subtitle="Vendor operational telemetry, boutique storefront controls, platform commission terms, and direct executive messaging."
    >
      {/* Top Navigation & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/admin/users/sellers" className="btn-admin-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
          <ArrowLeft size={13} /> Back to Seller Directory
        </Link>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="#admin-seller-message-box" className="btn-admin-gold" style={{ fontSize: '12px', padding: '6px 14px' }}>
            <Send size={13} /> Dispatch Message
          </a>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => setEditingCommission(true)}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <Percent size={13} /> Set Commission ({seller.shop?.commission_rate || 12.5}%)
          </button>
          <button
            type="button"
            className={seller.shop?.is_open ? 'btn-admin-danger' : 'btn-admin-success'}
            onClick={handleToggleStorefront}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            {seller.shop?.is_open ? (
              <>
                <PauseCircle size={13} style={{ marginRight: '4px' }} /> Pause Storefront
              </>
            ) : (
              <>
                <PlayCircle size={13} style={{ marginRight: '4px' }} /> Open Storefront
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Merchant Profile Header Card */}
      <div className="admin-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #C6A664 0%, #E5484D 50%, #C6A664 100%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <ShopLogoBadge
                logo={seller.shop?.logo_url}
                name={seller.shop?.name || seller.name}
                size={76}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #C6A664',
                  boxShadow: '0 4px 16px rgba(198, 166, 100, 0.25)',
                }}
              />
              <UserAvatarBadge
                avatar={seller.avatar}
                name={seller.name}
                email={seller.email}
                size={32}
                style={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  border: '2px solid #131318',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#F6F6F9', margin: 0 }}>
                  {seller.shop?.name || seller.name}
                </h2>
                <span className={`status-pill ${seller.shop?.is_open ? 'active' : 'blocked'}`}>
                  {seller.shop?.is_open ? 'Accepting Orders' : 'Storefront Paused'}
                </span>
                <span className="status-pill active" title="Approved Atelier">
                  <ShieldCheck size={11} style={{ marginRight: '3px' }} /> Verified Atelier
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#9E9EA8', flexWrap: 'wrap' }}>
                <span>
                  <Store size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  Proprietor: {seller.name}
                </span>
                <span>
                  <Mail size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  {seller.email}
                </span>
                <span>
                  <Phone size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  {seller.phone}
                </span>
                <span>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                  Onboarded {seller.date_joined}
                </span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9E9EA8' }}>
              Boutique Classification
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
              {seller.shop?.category || 'Haute Couture & Outerwear'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Performance KPI Strip */}
      <div className="admin-metrics-grid">
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Total Boutique Volume</span>
            <div className="kpi-icon-wrap">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#C6A664' }}>
            ₹{Number(seller.metrics?.total_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="kpi-subtext" style={{ color: '#30A46C' }}>
            Gross merchandise value generated
          </span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Platform Commission Rate</span>
            <div className="kpi-icon-wrap">
              <Percent size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {seller.shop?.commission_rate || 12.5}%
          </div>
          <span className="kpi-subtext" style={{ color: '#9E9EA8' }}>
            Net Platform Share: ₹{Number(seller.metrics?.net_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Active Catalog Pieces</span>
            <div className="kpi-icon-wrap">
              <Package size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {seller.metrics?.total_products || 0}
          </div>
          <span className="kpi-subtext" style={{ color: '#30A46C' }}>
            Approved live runway pieces
          </span>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Atelier Quality Rating</span>
            <div className="kpi-icon-wrap">
              <Star size={18} color="#F5A623" />
            </div>
          </div>
          <div className="kpi-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={22} fill="#F5A623" color="#F5A623" />
            {seller.shop?.rating || 4.95}
          </div>
          <span className="kpi-subtext" style={{ color: '#30A46C' }}>
            Superlative luxury customer satisfaction
          </span>
        </div>
      </div>

      {/* Main Grid: Atelier Details Left, Direct Messaging Right */}
      <div className="admin-grid-split">
        {/* Left Side: Boutique Info & Order Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Atelier Details Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Boutique Operational Information</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="admin-label">Atelier Brand Bio & Craftsmanship Statement</span>
                <p style={{ fontSize: '13px', color: '#D1D1DB', lineHeight: 1.6, margin: '4px 0 0' }}>
                  {seller.shop?.description || 'Exclusive luxury fashion atelier.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <span className="admin-label">Fashion Specialization</span>
                  <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>
                    {seller.shop?.category || 'Haute Couture'}
                  </strong>
                </div>
                <div>
                  <span className="admin-label">Business Direct Email</span>
                  <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>
                    {seller.shop?.contact_email || seller.email}
                  </strong>
                </div>
                <div>
                  <span className="admin-label">Business Phone</span>
                  <strong style={{ fontSize: '13px', color: '#F6F6F9' }}>
                    {seller.shop?.contact_number || seller.phone}
                  </strong>
                </div>
                <div>
                  <span className="admin-label">Storefront Agreement</span>
                  <strong style={{ fontSize: '13px', color: '#C6A664' }}>
                    {seller.shop?.commission_rate}% Platform Fee
                  </strong>
                </div>
              </div>

              <div>
                <span className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#C6A664" /> Atelier Physical & Logistics Headquarters
                </span>
                <p style={{ fontSize: '13px', color: '#F6F6F9', margin: '4px 0 0' }}>
                  {seller.shop?.business_address || 'Suite 4B, The Monolith Arcade, Colaba Causeway, Mumbai 400005, India'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#C6A664" /> Recent Boutique Orders & Fulfillment ({seller.recent_orders?.length || 0})
              </h3>
            </div>
            {(!seller.recent_orders || seller.recent_orders.length === 0) ? (
              <p style={{ color: '#9E9EA8', fontSize: '13px', margin: 0 }}>
                No recent orders recorded for this boutique atelier.
              </p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order Reference</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Volume</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.recent_orders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <strong style={{ color: '#F6F6F9', fontSize: '12px' }}>{ord.order_id}</strong>
                        </td>
                        <td style={{ fontSize: '12px' }}>{ord.customer_name}</td>
                        <td style={{ fontSize: '12px', color: '#9E9EA8' }}>{ord.created_at}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Direct Message / Notification Composer & History */}
        <div id="admin-seller-message-box" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Dispatch Message Card */}
          <div className="admin-card" style={{ border: '1px solid #C6A664', backgroundColor: '#131318' }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C6A664' }}>
                  <Send size={16} /> Direct Message & Notification Box
                </h3>
                <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '4px 0 0' }}>
                  Transmit operational directives, catalog curation updates, or payout notifications directly to this seller.
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
                <label className="admin-label">Notification Subject / Heading</label>
                <input
                  type="text"
                  placeholder="e.g. Seasonal Lookbook Editorial Approval / Packaging Notice"
                  value={msgForm.title}
                  onChange={(e) => setMsgForm({ ...msgForm, title: e.target.value })}
                  className="admin-input"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Directive Priority</label>
                <select
                  value={msgForm.priority}
                  onChange={(e) => setMsgForm({ ...msgForm, priority: e.target.value })}
                  className="admin-select"
                >
                  <option value="Normal">Normal Advisory</option>
                  <option value="High">High Priority Notice</option>
                  <option value="Urgent">Urgent Operational Action</option>
                </select>
              </div>

              <div className="admin-input-group">
                <label className="admin-label">Message Content</label>
                <textarea
                  rows="4"
                  placeholder="Compose official administrative message or guidance for this atelier vendor..."
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
                    'Transmitting Directive...'
                  ) : (
                    <>
                      <Send size={14} /> Dispatch Notification to Seller
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
                <Clock size={16} color="#C6A664" /> Dispatched Direct Messages ({sellerMessages.length})
              </h3>
            </div>

            {sellerMessages.length === 0 ? (
              <p style={{ color: '#9E9EA8', fontSize: '13px', margin: 0, textAlign: 'center', padding: '24px 0' }}>
                No direct administrative messages dispatched to this merchant yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sellerMessages.map((msg, idx) => (
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
                      <CheckCircle size={10} /> Dispatched to Seller Console Feed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjust Commission Modal */}
      {editingCommission && (
        <div className="admin-modal-backdrop" onClick={() => setEditingCommission(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Configure Boutique Commission Agreement</h3>
            </div>
            <form onSubmit={handleSaveCommission}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px', color: '#9E9EA8', marginBottom: '16px' }}>
                  Adjust the platform commission percentage charged on completed sales for <strong>{seller.shop?.name || seller.name}</strong>.
                </p>
                <div className="admin-input-group">
                  <label className="admin-label">Commission Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="admin-input"
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setEditingCommission(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-gold">
                  Update Commission Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
