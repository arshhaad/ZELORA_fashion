import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Image, Plus, CheckCircle, ExternalLink } from 'lucide-react';

export default function AdminBannersPage() {
  const { bannersList, addBanner } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta_text: 'Discover Collection',
    cta_link: '/products',
    image_url: '',
    position: 'hero'
  });

  const displayBanners = bannersList.length > 0 ? bannersList : [
    {
      id: 1,
      title: 'Winter 2026 Haute Couture Collection',
      subtitle: 'Structured wool tailoring, brushed cashmere coats & pure silk evening slip dresses.',
      cta_text: 'Explore Collection',
      cta_link: '/products',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80&sat=-100',
      position: 'hero',
      is_active: true
    },
    {
      id: 2,
      title: 'Monochrome Leather & Handcrafted Accessories',
      subtitle: 'Bespoke Italian leather boots, sculptured bags and minimalist eyewear.',
      cta_text: 'Shop Accessories',
      cta_link: '/products?category=accessories',
      image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=80&sat=-100',
      position: 'promo_top',
      is_active: true
    }
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (formData.title && formData.image_url) {
      addBanner(formData);
      setModalOpen(false);
      setFormData({
        title: '',
        subtitle: '',
        cta_text: 'Discover Collection',
        cta_link: '/products',
        image_url: '',
        position: 'hero'
      });
    }
  };

  return (
    <AdminLayout
      title="Editorial Banners & Hero Showcase"
      subtitle="Curate high-impact visual banners, promotional hero slides, and customer call-to-actions."
      actionButton={
        <button
          type="button"
          className="btn-admin-gold"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          <span>Add Editorial Banner</span>
        </button>
      }
    >
      <div className="admin-grid-auto-cards">
        {displayBanners.map((banner) => (
          <div
            key={banner.id}
            style={{
              backgroundColor: '#16161D',
              border: '1px solid #23232C',
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            <div style={{ height: '180px', position: 'relative' }}>
              <img
                src={banner.image_url}
                alt={banner.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11,11,14,0.95) 0%, transparent 80%)'
              }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <span className="status-pill active">Position: {banner.position}</span>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F6F6F9', margin: '0 0 6px 0' }}>
                {banner.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#9E9EA8', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {banner.subtitle}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #23232C',
                paddingTop: '14px',
                fontSize: '12px'
              }}>
                <span style={{ color: '#C6A664', fontWeight: 600 }}>
                  CTA: "{banner.cta_text}" → {banner.cta_link}
                </span>
                <span className="status-pill active">Live</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create Editorial Banner</h3>
            </div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label className="admin-label">Headline Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Spring Atelier Release"
                    className="admin-input"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Editorial Subtitle</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Short narrative describing the curation..."
                    className="admin-textarea"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Hero Photography Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="admin-input"
                    required
                  />
                </div>

                <div className="admin-grid-2">
                  <div className="admin-input-group">
                    <label className="admin-label">Button CTA Text</label>
                    <input
                      type="text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-label">Destination Link</label>
                    <input
                      type="text"
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin-gold">
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

