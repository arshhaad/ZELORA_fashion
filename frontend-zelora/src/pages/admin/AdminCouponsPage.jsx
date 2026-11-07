import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Ticket, Plus, CheckCircle, Calendar, DollarSign } from 'lucide-react';

export default function AdminCouponsPage() {
  const { couponsList, addCoupon } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '15',
    min_purchase: '100',
    valid_until: '2026-12-31T23:59:59Z'
  });

  const displayCoupons = couponsList.length > 0 ? couponsList : [
    {
      id: 1,
      code: 'FIRST10',
      description: '10% premier discount on orders exceeding $100',
      discount_type: 'percentage',
      discount_value: 10,
      min_purchase: 100,
      used_count: 142,
      usage_limit: 5000,
      is_active: true
    },
    {
      id: 2,
      code: 'NOIRVIP',
      description: '$50 VIP credit on haute couture orders over $300',
      discount_type: 'fixed',
      discount_value: 50,
      min_purchase: 300,
      used_count: 88,
      usage_limit: 1000,
      is_active: true
    }
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    if (formData.code && formData.discount_value) {
      addCoupon(formData);
      setModalOpen(false);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '15',
        min_purchase: '100',
        valid_until: '2026-12-31T23:59:59Z'
      });
    }
  };

  return (
    <AdminLayout
      title="Coupons & Promotional Incentives"
      subtitle="Publish platform-wide discount codes, minimum basket incentives, and VIP couture privileges."
      actionButton={
        <button
          type="button"
          className="btn-admin-gold"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          <span>Create Coupon</span>
        </button>
      }
    >
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Benefit Description</th>
                <th>Discount Value</th>
                <th>Min Basket</th>
                <th>Redemption Velocity</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: '#C6A664',
                      backgroundColor: 'rgba(198, 166, 100, 0.12)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      letterSpacing: '1px'
                    }}>
                      {coupon.code}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '13px', color: '#F6F6F9' }}>{coupon.description}</span>
                  </td>

                  <td>
                    <strong style={{ color: '#F6F6F9', fontSize: '14px' }}>
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
                    </strong>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#9E9EA8' }}>
                      ${coupon.min_purchase} min
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#30A46C', fontWeight: 600 }}>
                      {coupon.used_count} redemptions
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className="status-pill active">Active</span>
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
              <h3>Create Platform Promotional Coupon</h3>
            </div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                <div className="admin-input-group">
                  <label className="admin-label">Promo Code (Uppercase)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="admin-input"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Benefit Headline</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 25% off all outerwear collections"
                    className="admin-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="admin-input-group">
                    <label className="admin-label">Discount Type</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="admin-select"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Currency ($)</option>
                    </select>
                  </div>

                  <div className="admin-input-group">
                    <label className="admin-label">Discount Value</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Minimum Purchase Amount ($)</label>
                  <input
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    className="admin-input"
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-admin-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin-gold">
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

