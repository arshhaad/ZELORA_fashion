import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Search, CheckCircle, XCircle, Star, Filter, Eye } from 'lucide-react';

export default function AdminAllProductsPage() {
  const { productsList, moderateProduct } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const currentStatus = p.moderation_status || 'approved';
    if (statusFilter === 'approved') return matchesSearch && currentStatus === 'approved';
    if (statusFilter === 'pending') return matchesSearch && currentStatus === 'pending';
    if (statusFilter === 'rejected') return matchesSearch && currentStatus === 'rejected';
    return matchesSearch;
  });

  return (
    <AdminLayout
      title="Global Product Catalog & Moderation"
      subtitle="Inspect, approve, and curate clothing garments across all vendor collections."
    >
      <div className="admin-card">
        {/* Filter bar */}
        <div className="admin-card-header">
          <div className="admin-header-search" style={{ width: '380px' }}>
            <Search size={15} color="#9E9EA8" />
            <input
              type="text"
              placeholder="Search garments by name, atelier brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'approved', 'pending', 'rejected'].map((filter) => (
              <button
                key={filter}
                type="button"
                className={statusFilter === filter ? 'btn-admin-gold' : 'btn-admin-secondary'}
                onClick={() => setStatusFilter(filter)}
                style={{ textTransform: 'capitalize', padding: '6px 14px' }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Garment</th>
                <th>Brand / Atelier</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Stock</th>
                <th>Moderation</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const currentStatus = prod.moderation_status || 'approved';
                return (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.images?.[0] || prod.image}
                          alt={prod.name}
                          style={{ width: '44px', height: '54px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #23232C' }}
                        />
                        <div>
                          <strong style={{ fontSize: '13px', color: '#F6F6F9', display: 'block' }}>{prod.name}</strong>
                          <span style={{ fontSize: '11px', color: '#9E9EA8' }}>SKU: {prod.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#C6A664' }}>{prod.brand}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{prod.category}</span>
                    </td>

                    <td>
                      <strong style={{ color: '#F6F6F9' }}>${prod.price}</strong>
                      {prod.originalPrice && (
                        <span style={{ fontSize: '11px', color: '#9E9EA8', textDecoration: 'line-through', marginLeft: '6px' }}>
                          ${prod.originalPrice}
                        </span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', color: (prod.stock || 24) < 10 ? '#E5484D' : '#30A46C', fontWeight: 600 }}>
                        {prod.stock || 24} units
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill ${currentStatus}`}>
                        {currentStatus}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {currentStatus !== 'approved' && (
                          <button
                            type="button"
                            className="btn-admin-success"
                            onClick={() => moderateProduct(prod.id, 'approve')}
                            title="Approve garment"
                          >
                            <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Approve
                          </button>
                        )}
                        {currentStatus !== 'rejected' && (
                          <button
                            type="button"
                            className="btn-admin-danger"
                            onClick={() => moderateProduct(prod.id, 'reject')}
                            title="Reject garment"
                          >
                            <XCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

