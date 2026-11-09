import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { UserAvatarBadge } from '../../components/common/BrandBadge';
import { Search, Ban, CheckCircle, ShieldCheck, Mail, Phone, ShoppingBag, DollarSign, MessageSquare, ExternalLink } from 'lucide-react';

export default function AdminCustomersPage() {
  const { customers, toggleCustomerBlock } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

    if (statusFilter === 'active') return matchesSearch && c.is_active;
    if (statusFilter === 'blocked') return matchesSearch && !c.is_active;
    return matchesSearch;
  });

  return (
    <AdminLayout
      title="Customer Governance"
      subtitle="View, monitor, audit, and regulate customer accounts across the ZELORA platform."
    >
      <div className="admin-card">
        {/* Filter & Search Bar */}
        <div className="admin-card-header">
          <div className="admin-search-responsive">
            <div className="admin-header-search" style={{ width: '100%' }}>
              <Search size={15} color="#9E9EA8" />
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'active', 'blocked'].map((filter) => (
              <button
                key={filter}
                type="button"
                className={statusFilter === filter ? 'btn-admin-gold' : 'btn-admin-secondary'}
                onClick={() => setStatusFilter(filter)}
                style={{ textTransform: 'capitalize', padding: '6px 14px' }}
              >
                {filter} Customers
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Profile</th>
                <th>Contact</th>
                <th>Order History</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9E9EA8' }}>
                    No customer accounts match your current search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <Link
                        to={`/admin/users/customers/${cust.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
                      >
                        <UserAvatarBadge
                          avatar={cust.avatar}
                          name={cust.name}
                          email={cust.email}
                          size={36}
                        />
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#F6F6F9' }}>{cust.name}</strong>
                          <span style={{ fontSize: '11px', color: '#9E9EA8' }}>ID: CUST-{cust.id}</span>
                        </div>
                      </Link>
                    </td>

                    <td>
                      <div style={{ fontSize: '12px', color: '#F6F6F9' }}>
                        <Mail size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                        {cust.email}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9E9EA8', marginTop: '2px' }}>
                        <Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />
                        {cust.phone}
                      </div>
                    </td>

                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                        <ShoppingBag size={13} color="#C6A664" />
                        <strong>{cust.orders_count} orders</strong>
                      </span>
                    </td>

                    <td>
                      <strong style={{ color: '#C6A664' }}>
                        ₹{Number(cust.total_spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </td>

                    <td>
                      <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{cust.date_joined}</span>
                    </td>

                    <td>
                      <span className={`status-pill ${cust.is_active ? 'active' : 'blocked'}`}>
                        {cust.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Link
                          to={`/admin/users/customers/${cust.id}`}
                          className="btn-admin-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          title="Open full profile and message box"
                        >
                          <MessageSquare size={12} />
                          Profile & Msg
                        </Link>
                        <button
                          type="button"
                          className={cust.is_active ? 'btn-admin-danger' : 'btn-admin-success'}
                          onClick={() => toggleCustomerBlock(cust.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {cust.is_active ? (
                            <>
                              <Ban size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              Block
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              Unblock
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

