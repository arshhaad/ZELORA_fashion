import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Trash2, Layers, CheckCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { categoriesList, addCategory, deleteCategory } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: ''
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (formData.name && formData.slug) {
      addCategory(formData);
      setModalOpen(false);
      setFormData({ name: '', slug: '', description: '', image: '' });
    }
  };

  return (
    <AdminLayout
      title="Fashion Categories & Taxonomy"
      subtitle="Organize garment taxonomy, storefront navigation structures, and catalog filters."
      actionButton={
        <button
          type="button"
          className="btn-admin-gold"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      }
    >
      <div className="admin-grid-auto-cards">
        {categoriesList.map((cat) => (
          <div
            key={cat.id || cat.slug}
            style={{
              backgroundColor: '#16161D',
              border: '1px solid #23232C',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={cat.image}
                alt={cat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(11, 11, 14, 0.9) 0%, transparent 80%)'
              }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '16px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#C6A664', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  /{cat.slug}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F6F6F9', margin: '2px 0 0' }}>{cat.name}</h3>
              </div>
            </div>

            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '0 0 14px', lineHeight: 1.5 }}>
                {cat.description || 'Curated luxury garment department.'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #23232C', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#C6A664', fontWeight: 600 }}>
                  {cat.itemCount || 24} Catalog Pieces
                </span>
                <button
                  type="button"
                  className="btn-admin-danger"
                  style={{ padding: '4px 8px' }}
                  onClick={() => deleteCategory(cat.id || cat.slug)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create Fashion Category</h3>
            </div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label className="admin-label">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormData({ ...formData, name, slug });
                    }}
                    placeholder="e.g. Leather Goods"
                    className="admin-input"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="leather-goods"
                    className="admin-input"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Curated Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="admin-input"
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief department overview..."
                    className="admin-textarea"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-gold">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

