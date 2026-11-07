import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Sparkles, Plus, Globe, Package } from 'lucide-react';

export default function AdminBrandsPage() {
  const { brandsList, addBrand } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', origin: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (formData.name) {
      addBrand(formData);
      setModalOpen(false);
      setFormData({ name: '', origin: '' });
    }
  };

  return (
    <AdminLayout
      title="Fashion Houses & Brands"
      subtitle="Regulate official luxury ateliers, verified designer houses, and independent boutique labels."
      actionButton={
        <button
          type="button"
          className="btn-admin-gold"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          <span>Add Brand</span>
        </button>
      }
    >
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brand / Fashion House</th>
                <th>Heritage & Origin</th>
                <th>Active Collections</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {brandsList.map((brand) => (
                <tr key={brand.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Sparkles size={16} color="#C6A664" />
                      <strong style={{ fontSize: '14px', color: '#F6F6F9' }}>{brand.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9E9EA8' }}>
                      <Globe size={13} />
                      {brand.origin}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#C6A664', fontWeight: 600 }}>
                      {brand.productsCount} products
                    </span>
                  </td>
                  <td>
                    <span className="status-pill active">Verified House</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Register Fashion Brand</h3>
            </div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label className="admin-label">Brand Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Maison de l'Ombre"
                    className="admin-input"
                    required
                  />
                </div>
                <div className="admin-input-group">
                  <label className="admin-label">Origin / Country of Craftsmanship</label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g. Florence, Italy"
                    className="admin-input"
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin-gold">
                  Register Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

