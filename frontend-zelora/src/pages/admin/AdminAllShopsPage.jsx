import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Search, Store, Star, DollarSign, Package, Check, X, Sliders, MessageSquare } from 'lucide-react';

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
          <div className="admin-header-search admin-search-responsive">
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
                    <Link
                      to={`/admin/users/sellers/${shop.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
                      title="View Boutique Dossier & Direct Message Box"
                    >
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #23232C' }}
                      />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#F6F6F9', display: 'block' }}>{shop.name}</strong>
                        <span style={{ fontSize: '11px', color: '#9E9EA8' }}>{shop.category}</span>
                      </div>
                    </Link>
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
                      ₹{Number(shop.total_sales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        to={`/admin/users/sellers/${shop.id}`}
                        className="btn-admin-gold"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        title="Open Boutique Dossier & Direct Message Box"
                      >
                        <MessageSquare size={12} />
                        Dossier & Msg
                      </Link>
                      <button
                        type="button"
                        className={shop.is_open ? 'btn-admin-danger' : 'btn-admin-success'}
                        onClick={() => toggleShopStatus(shop.id)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        {shop.is_open ? 'Pause' : 'Open'}
                      </button>
                    </div>
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

