import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Sliders, Save, CheckCircle, ShieldCheck, CreditCard, Mail, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  const { platformSettings, saveSettings } = useAdmin();
  const [formData, setFormData] = useState({
    site_name: 'ZELORA Luxury Fashion',
    support_email: 'concierge@zelora.luxury',
    currency: 'USD',
    currency_symbol: '$',
    default_commission_rate: 12.5,
    maintenance_mode: false,
    allow_seller_registration: true,
    auto_approve_products: false,
    razorpay_key_id: 'rzp_test_TxHy520so82PT1'
  });
  const [savedSuccess, setSavedSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (platformSettings) {
      setFormData({
        site_name: platformSettings.site_name || 'ZELORA Luxury Fashion',
        support_email: platformSettings.support_email || 'concierge@zelora.luxury',
        currency: platformSettings.currency || 'USD',
        currency_symbol: platformSettings.currency_symbol || '$',
        default_commission_rate: platformSettings.default_commission_rate || 12.5,
        maintenance_mode: Boolean(platformSettings.maintenance_mode),
        allow_seller_registration: platformSettings.allow_seller_registration !== false,
        auto_approve_products: Boolean(platformSettings.auto_approve_products),
        razorpay_key_id: platformSettings.razorpay_key_id || 'rzp_test_TxHy520so82PT1'
      });
    }
  }, [platformSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveSettings(formData);
    setSaving(false);
    setSavedSuccess('Platform system settings updated successfully.');
    setTimeout(() => setSavedSuccess(''), 4000);
  };

  return (
    <AdminLayout
      title="Platform Master Configuration"
      subtitle="Configure enterprise store parameters, currency standards, payment gateways, and system flags."
    >
      {savedSuccess && (
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
          <span>{savedSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        {/* 1. General Brand & Identity */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Platform Identity & Concierge</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-input-group">
              <label className="admin-label">Store Brand Name</label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="admin-input"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Official Concierge Support Email</label>
              <input
                type="email"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                className="admin-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-input-group">
              <label className="admin-label">Default Base Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="admin-input"
                required
              />
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency_symbol}
                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="admin-input"
                required
              />
            </div>
          </div>
        </div>

        {/* 2. Razorpay Gateway Keys */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Razorpay Payment Integration</h3>
          </div>

          <div className="admin-input-group">
            <label className="admin-label">Razorpay Key ID</label>
            <input
              type="text"
              value={formData.razorpay_key_id}
              onChange={(e) => setFormData({ ...formData, razorpay_key_id: e.target.value })}
              className="admin-input"
              style={{ fontFamily: 'monospace' }}
              required
            />
            <span style={{ fontSize: '11px', color: '#9E9EA8', marginTop: '4px', display: 'block' }}>
              Used by frontend checkout client to initialize Razorpay Standard Checkout SDK.
            </span>
          </div>
        </div>

        {/* 3. Operational Governance Flags */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Governance & System Flags</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#F6F6F9', display: 'block' }}>New Seller Self-Registration</strong>
                <span style={{ fontSize: '12px', color: '#9E9EA8' }}>Allow prospective fashion boutiques to register via /seller/register</span>
              </div>
              <input
                type="checkbox"
                checked={formData.allow_seller_registration}
                onChange={(e) => setFormData({ ...formData, allow_seller_registration: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#C6A664', cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderTop: '1px solid #23232C', paddingTop: '14px' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#F6F6F9', display: 'block' }}>Platform Maintenance Mode</strong>
                <span style={{ fontSize: '12px', color: '#9E9EA8' }}>Direct public storefront traffic to a private couture staging banner</span>
              </div>
              <input
                type="checkbox"
                checked={formData.maintenance_mode}
                onChange={(e) => setFormData({ ...formData, maintenance_mode: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#E5484D', cursor: 'pointer' }}
              />
            </label>
          </div>
        </div>

        <button type="submit" className="btn-admin-gold" style={{ padding: '12px 24px', fontSize: '14px' }} disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Saving System Changes...' : 'Save Configuration Changes'}</span>
        </button>
      </form>
    </AdminLayout>
  );
}

