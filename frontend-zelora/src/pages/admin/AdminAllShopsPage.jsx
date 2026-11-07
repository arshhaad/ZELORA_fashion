import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Search, Store, Star, DollarSign, Package, Check, X, Sliders } from 'lucide-react';

export default function AdminAllShopsPage() {
  const { shops, toggleShopStatus, updateShopCommission } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="All Registered Boutiques & Ateliers"
      subtitle="Complete platform shop roster with live operational controls, revenue stats, and commission terms."
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-header-search" style={{ width: '380px' }}>
            <Search size={15} color="#9E9EA8" />
            <input
              type="text"
              placeholder="Search boutique name, owner, or fashion category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boutique Details</th>
                <th>Proprietor</th>
                <th>Products</th>
                <th>Total Volume</th>
                <th>Commission</th>
                <th>Rating</th>
                <th>Storefront Live</th>
                <th style={{ textAlign: 'right' }}>Store Control</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #23232C' }}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#F6F6F9', display: 'block' }}>{shop.name}</strong>
                        <span style={{ fontSize: '11px', color: '#9E9EA8' }}>{shop.category}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '12px', color: '#F6F6F9' }}>{shop.owner_name}</div>
                    <div style={{ fontSize: '11px', color: '#9E9EA8' }}>{shop.owner_email}</div>
                  </td>

                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Package size={13} color="#C6A664" />
                      {shop.total_products} items
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: '#C6A664' }}>
                      ${Number(shop.total_sales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: '#F6F6F9' }}>{shop.commission_rate}%</span>
                  </td>

                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Star size={12} fill="#F5A623" color="#F5A623" />
                      <strong>{shop.rating}</strong>
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${shop.is_open ? 'active' : 'blocked'}`}>
                      {shop.is_open ? 'Accepting Orders' : 'Store Paused'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className={shop.is_open ? 'btn-admin-danger' : 'btn-admin-success'}
                      onClick={() => toggleShopStatus(shop.id)}
                    >
                      {shop.is_open ? 'Pause Shop' : 'Open Shop'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

