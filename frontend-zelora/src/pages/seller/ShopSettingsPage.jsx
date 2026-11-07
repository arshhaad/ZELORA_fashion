import { useState } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Sliders,
  CheckCircle,
  AlertTriangle,
  Clock,
  Truck,
  RotateCcw,
  Eye,
  Lock,
  Save,
  ShieldAlert,
} from 'lucide-react';

export default function ShopSettingsPage() {
  const { shop, updateShopSettings, toggleShopAvailability } = useSeller();

  const [settings, setSettings] = useState({
    is_open: shop.is_open ?? true,
    dispatch_sla: 'Within 24 Hours',
    packaging_type: 'ZELORA Signature Noir Gift Box & Ribbon',
    delivery_preferences: shop.delivery_preferences || 'White-glove climate-controlled express courier dispatch within 24 hours.',
    return_policy: shop.return_policy || '14-Day Complimentary Luxury Exchange & Return on Unworn Pieces with Tag Intact.',
    shop_visibility: shop.shop_visibility || 'Public (Listed in Marketplace)',
    notify_email_orders: true,
    notify_sms_dispatch: true,
    auto_accept_orders: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateShopSettings(settings);
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Operations & Policies</h1>
          <p className="seller-page-subtitle">
            Configure delivery timelines, boutique availability, customer returns, and fulfillment preferences.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-gold"
          onClick={handleSubmit}
        >
          <Save size={16} />
          <span>Save Preferences</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Shop Availability & Order Acceptance */}
        <div className="seller-card mb-24">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Shop Availability Status</h3>
            </div>

            <span className={`status-pill ${settings.is_open ? 'published' : 'out-of-stock'}`}>
              {settings.is_open ? 'Open for Orders' : 'Temporarily Closed'}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--seller-muted)', margin: '0 0 16px' }}>
            When toggled to Closed, your boutique garments remain visible in lookbooks but checkout is disabled until you reopen.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'var(--seller-cream-subtle)',
              borderRadius: 'var(--seller-radius)',
              border: '1px solid var(--seller-border-light)',
            }}
          >
            <div>
              <strong style={{ fontSize: '13.5px', color: 'var(--seller-espresso)', display: 'block' }}>
                Accept Customer Purchases
              </strong>
              <small style={{ color: 'var(--seller-muted)', fontSize: '12px' }}>
                Allow orders to be placed immediately by verified customers.
              </small>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
              <input
                type="checkbox"
                name="is_open"
                checked={settings.is_open}
                onChange={(e) => {
                  handleChange(e);
                  toggleShopAvailability();
                }}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.is_open ? 'var(--seller-gold)' : '#ccc',
                  borderRadius: '34px',
                  transition: '0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '',
                    height: '20px',
                    width: '20px',
                    left: settings.is_open ? '25px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}
                />
              </span>
            </label>
          </div>
        </div>

        {/* 2. Delivery & Logistics Preferences */}
        <div className="seller-card mb-24">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Delivery & Logistics Preferences</h3>
            </div>
          </div>

          <div className="seller-form-grid-2">
            <div className="seller-form-group">
              <label className="seller-form-label">Dispatch Fulfillment SLA *</label>
              <select
                name="dispatch_sla"
                value={settings.dispatch_sla}
                onChange={handleChange}
                className="seller-select"
              >
                <option value="Same Day (Cutoff 2 PM)">Same Day (Cutoff 2 PM)</option>
                <option value="Within 24 Hours">Within 24 Hours (Recommended)</option>
                <option value="Within 48 Hours">Within 48 Hours</option>
                <option value="Custom Made-to-Order (5 - 7 Days)">Custom Made-to-Order (5 - 7 Days)</option>
              </select>
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Packaging Standard</label>
              <select
                name="packaging_type"
                value={settings.packaging_type}
                onChange={handleChange}
                className="seller-select"
              >
                <option value="ZELORA Signature Noir Gift Box & Ribbon">ZELORA Signature Noir Gift Box & Ribbon</option>
                <option value="Recycled Minimal Kraft Apparel Box">Recycled Minimal Kraft Apparel Box</option>
                <option value="Atelier Bespoke Custom Branded Packaging">Atelier Bespoke Custom Branded Packaging</option>
              </select>
            </div>
          </div>

          <div className="seller-form-group">
            <label className="seller-form-label">Delivery Note Displayed on Product Details</label>
            <input
              type="text"
              name="delivery_preferences"
              value={settings.delivery_preferences}
              onChange={handleChange}
              className="seller-input"
            />
          </div>
        </div>

        {/* 3. Return & Exchange Policy */}
        <div className="seller-card mb-24">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Luxury Return & Exchange Policy</h3>
            </div>
          </div>

          <div className="seller-form-group">
            <label className="seller-form-label">Atelier Return Policy Terms</label>
            <textarea
              name="return_policy"
              value={settings.return_policy}
              onChange={handleChange}
              rows={3}
              className="seller-textarea"
            />
            <small style={{ display: 'block', marginTop: '6px', fontSize: '11.5px', color: 'var(--seller-muted)' }}>
              Note: ZELORA requires minimum 7-day exchange window for luxury footwear and non-custom garments.
            </small>
          </div>
        </div>

        {/* 4. Shop Visibility & Marketplace Exposure */}
        <div className="seller-card mb-24">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Marketplace Visibility</h3>
            </div>
          </div>

          <div className="seller-form-group">
            <label className="seller-form-label">Visibility Status</label>
            <select
              name="shop_visibility"
              value={settings.shop_visibility}
              onChange={handleChange}
              className="seller-select"
            >
              <option value="Public (Listed in Marketplace)">Public (Listed in Marketplace & Search)</option>
              <option value="Private VIP Capsule (Direct Link Only)">Private VIP Capsule (Direct Link Only)</option>
              <option value="Catalog Only (Browse without checkout)">Catalog Only (Browse without checkout)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="notify_email_orders"
                checked={settings.notify_email_orders}
                onChange={handleChange}
                style={{ accentColor: 'var(--seller-espresso)' }}
              />
              <span>Send instant email alerts upon customer order placement</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="notify_sms_dispatch"
                checked={settings.notify_sms_dispatch}
                onChange={handleChange}
                style={{ accentColor: 'var(--seller-espresso)' }}
              />
              <span>Send SMS / WhatsApp reminders for pending dispatches</span>
            </label>
          </div>
        </div>

        {/* 5. Account Security Shortcut */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Atelier Security & Credentials</h3>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--seller-muted)', margin: '0 0 16px' }}>
            To update password, banking account references, or multi-factor authentication, please contact concierge or verify credentials.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn-seller-secondary"
              onClick={() => alert('Password reset verification dispatched to atelier registered email.')}
            >
              Request Password Change
            </button>
            <button
              type="submit"
              className="btn-seller-gold"
            >
              Save All Settings
            </button>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}

