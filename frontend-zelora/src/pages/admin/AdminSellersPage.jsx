import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Search, Store, Percent, Star, CheckCircle, Mail, Phone, ExternalLink, MessageSquare } from 'lucide-react';

export default function AdminSellersPage() {
  const { sellers, shops, updateShopCommission } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShop, setEditingShop] = useState(null);
  const [newCommission, setNewCommission] = useState('');

  const displaySellers = sellers.length > 0 ? sellers : [
    {
      id: 201,
      name: 'Elena Rostova',
      email: 'atelier@zelora.luxury',
      phone: '+33 1 42 68 00 00',
      shop_name: 'ZELORA Atelier Flagship',
      shop_category: 'Haute Couture & Outerwear',
      is_open: true,
      commission_rate: 12.5,
      is_active: true,
      rating: 4.98,
      date_joined: 'Jan 15, 2026'
    },
    {
      id: 202,
      name: 'Sebastian Chen',
      email: 'noir@zelora.luxury',
      phone: '+44 20 7946 0912',
      shop_name: 'Noir Studio Couture',
      shop_category: 'Minimalist Drapes & Silk',
      is_open: true,
      commission_rate: 12.5,
      is_active: true,
      rating: 4.92,
      date_joined: 'Feb 01, 2026'
    },
    {
      id: 203,
      name: 'Matteo Rossi',
      email: 'matteo@linenmilano.com',
      phone: '+39 02 1234 5678',
      shop_name: 'Linen & Silk Milano',
      shop_category: 'Luxury Essentials',
      is_open: true,
      commission_rate: 15.0,
      is_active: true,
      rating: 4.88,
      date_joined: 'Feb 20, 2026'
    }
  ];

  const filtered = displaySellers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shop_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCommissionModal = (seller) => {
    setEditingShop(seller);
    setNewCommission(seller.commission_rate);
  };

  const handleSaveCommission = (e) => {
    e.preventDefault();
    if (editingShop && newCommission) {
      updateShopCommission(editingShop.id, newCommission);
      setEditingShop(null);
    }
  };

  return (
    <AdminLayout
      title="Seller Directory & Oversight"
      subtitle="Supervise approved vendors, monitor store operations, and configure commission agreements."
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-header-search admin-search-responsive">
            <Search size={15} color="#9E9EA8" />
            <input
              type="text"
              placeholder="Search by vendor name, boutique name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vendor & Contact</th>
                <th>Boutique Atelier</th>
                <th>Category</th>
                <th>Commission Rate</th>
                <th>Shop Rating</th>
                <th>Store Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((seller) => (
                <tr key={seller.id}>
                  <td>
                    <Link
                      to={`/admin/users/sellers/${seller.id}`}
                      style={{ textDecoration: 'none' }}
                      title="View Seller Profile Dossier"
                    >
                      <strong style={{ color: '#F6F6F9', display: 'block' }}>{seller.name}</strong>
                      <span style={{ fontSize: '11px', color: '#9E9EA8' }}>
                        <Mail size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {seller.email}
                      </span>
                    </Link>
                  </td>

                  <td>
                    <Link
                      to={`/admin/users/sellers/${seller.id}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#C6A664', textDecoration: 'none' }}
                      title="View Boutique Dossier"
                    >
                      <Store size={14} color="#C6A664" />
                      {seller.shop_name}
                    </Link>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{seller.shop_category}</span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: '#C6A664' }}>
                      {seller.commission_rate}%
                    </span>
                  </td>

                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Star size={13} fill="#F5A623" color="#F5A623" />
                      <strong>{seller.rating}</strong>
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${seller.is_open ? 'active' : 'pending'}`}>
                      {seller.is_open ? 'Shop Open' : 'Paused'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        to={`/admin/users/sellers/${seller.id}`}
                        className="btn-admin-gold"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        title="Open Atelier Dossier & Direct Message Box"
                      >
                        <MessageSquare size={12} />
                        Profile & Msg
                      </Link>
                      <button
                        type="button"
                        className="btn-admin-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleOpenCommissionModal(seller)}
                      >
                        <Percent size={12} />
                        Rate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Commission Modal */}
      {editingShop && (
        <div className="admin-modal-backdrop" onClick={() => setEditingShop(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Update Boutique Commission Agreement</h3>
            </div>
            <form onSubmit={handleSaveCommission}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px', color: '#9E9EA8', marginBottom: '16px' }}>
                  Adjust the platform commission percentage charged on successful sales for <strong>{editingShop.shop_name}</strong>.
                </p>
                <div className="admin-input-group">
                  <label className="admin-label">Commission Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={newCommission}
                    onChange={(e) => setNewCommission(e.target.value)}
                    className="admin-input"
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setEditingShop(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-gold">
                  Save Commission Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

