import { useState, useEffect } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Store,
  Upload,
  Trash2,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Image,
} from 'lucide-react';

export default function ShopProfilePage() {
  const { shop, updateShopProfile } = useSeller();

  const [formData, setFormData] = useState({
    name: shop?.name || '',
    logo: shop?.logo || '',
    banner: shop?.banner || '',
    description: shop?.description || '',
    category: shop?.category || 'Haute Couture & Designer Wear',
    contact_email: shop?.contact_email || '',
    contact_number: shop?.contact_number || '',
    business_address: shop?.business_address || '',
    instagram: shop?.instagram || '',
    website: shop?.website || '',
  });

  useEffect(() => {
    if (!shop) return;
    setFormData({
      name: shop.name || '',
      logo: shop.logo || '',
      banner: shop.banner || '',
      description: shop.description || '',
      category: shop.category || 'Haute Couture & Designer Wear',
      contact_email: shop.contact_email || '',
      contact_number: shop.contact_number || '',
      business_address: shop.business_address || '',
      instagram: shop.instagram || '',
      website: shop.website || '',
    });
  }, [shop]);

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logo: previewUrl }));
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, banner: previewUrl }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateShopProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Profile & Brand Identity</h1>
          <p className="seller-page-subtitle">
            Curate how your luxury fashion house appears to international shoppers across the ZELORA marketplace.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-gold"
          onClick={handleSubmit}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Banner Preview & Upload Area */}
        <div className="seller-card mb-24" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="seller-shop-banner-wrap">
            {formData.banner ? (
              <img
                src={formData.banner}
                alt="Shop Banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--seller-muted)' }}>
                <span>No boutique banner uploaded</span>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <label
                style={{
                  background: 'rgba(48, 37, 31, 0.85)',
                  color: '#fff',
                  padding: '7px 14px',
                  borderRadius: 'var(--seller-radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Upload size={14} />
                <span>Replace Banner</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {formData.banner && (
                <button
                  type="button"
                  style={{
                    background: 'rgba(156, 56, 56, 0.85)',
                    color: '#fff',
                    border: 'none',
                    padding: '7px 12px',
                    borderRadius: 'var(--seller-radius-sm)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => setFormData((prev) => ({ ...prev, banner: '' }))}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Atelier Logo Floating Badge */}
            <div className="seller-shop-logo-floating">
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--seller-white)',
                  border: '3px solid var(--seller-white)',
                  boxShadow: 'var(--seller-shadow)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Atelier Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--seller-beige)' }}>
                    <Store size={32} color="var(--seller-espresso)" />
                  </div>
                )}
              </div>

              <label
                style={{
                  marginBottom: '10px',
                  background: 'var(--seller-white)',
                  border: '1px solid var(--seller-border)',
                  color: 'var(--seller-espresso)',
                  padding: '5px 12px',
                  borderRadius: 'var(--seller-radius-sm)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: 'var(--seller-shadow-sm)',
                }}
              >
                <Upload size={12} />
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className="seller-shop-meta-strip">
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: 'var(--seller-espresso)' }}>
              {formData.name || 'Your Atelier Name'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--seller-gold-dark)', fontWeight: 600 }}>
              {formData.category}
            </p>
          </div>
        </div>

        {/* Form Fields Card */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <h3>Boutique Information</h3>
          </div>

          <div className="seller-form-grid-2">
            <div className="seller-form-group">
              <label className="seller-form-label">Shop / Atelier Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="seller-input"
                required
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Primary Fashion Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="seller-select"
              >
                <option value="Haute Couture & Designer Wear">Haute Couture & Designer Wear</option>
                <option value="Luxury Eveningwear">Luxury Eveningwear</option>
                <option value="Tailored Menswear">Tailored Menswear</option>
                <option value="Contemporary Ready-to-Wear">Contemporary Ready-to-Wear</option>
                <option value="Footwear & Fine Leather Goods">Footwear & Fine Leather Goods</option>
                <option value="Fine Jewelry & Accessories">Fine Jewelry & Accessories</option>
              </select>
            </div>
          </div>

          <div className="seller-form-group">
            <label className="seller-form-label">Atelier Brand Story & Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="seller-textarea"
              placeholder="Tell customers about your craftsmanship, fabrics, design heritage and atelier location..."
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--seller-border)', margin: '24px 0' }} />

          {/* Contact Details */}
          <div className="seller-card-title-row">
            <h3>Concierge & Customer Contact</h3>
          </div>

          <div className="seller-form-grid-2">
            <div className="seller-form-group">
              <label className="seller-form-label">Contact Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="seller-input"
                />
              </div>
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Contact Telephone / WhatsApp</label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="seller-input"
              />
            </div>
          </div>

          <div className="seller-form-group">
            <label className="seller-form-label">Physical Atelier / Dispatch Address</label>
            <input
              type="text"
              name="business_address"
              value={formData.business_address}
              onChange={handleChange}
              className="seller-input"
              placeholder="Building, street, district, city, PIN code"
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--seller-border)', margin: '24px 0' }} />

          {/* Social Links */}
          <div className="seller-card-title-row">
            <h3>Digital Channels & Social Media</h3>
          </div>

          <div className="seller-form-grid-2">
            <div className="seller-form-group">
              <label className="seller-form-label">Instagram Handle</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@youratelier"
                className="seller-input"
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Official Atelier Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://youratelier.com"
                className="seller-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn-seller-gold">
              <Save size={16} />
              <span>Save & Publish Profile</span>
            </button>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}
