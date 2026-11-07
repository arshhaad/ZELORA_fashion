import { useState } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Ticket,
  Plus,
  Power,
  Trash2,
  Edit2,
  Calendar,
  Percent,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function CouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useSeller();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'Percentage',
    discount_value: 15,
    min_order: 200,
    max_discount: 50,
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    usage_limit: 100,
  });

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: `PROMO${Math.floor(10 + Math.random() * 90)}`,
      discount_type: 'Percentage',
      discount_value: 15,
      min_order: 150,
      max_discount: 40,
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      usage_limit: 50,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order: coupon.min_order,
      max_discount: coupon.max_discount,
      start_date: coupon.start_date,
      expiry_date: coupon.expiry_date,
      usage_limit: coupon.usage_limit,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCoupon) {
      updateCoupon(editingCoupon.id, formData);
    } else {
      addCoupon(formData);
    }
    setModalOpen(false);
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Promotional Coupons</h1>
          <p className="seller-page-subtitle">
            Create bespoke promotional codes, VIP archive invitations, and seasonal discount vouchers.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-gold"
          onClick={handleOpenCreate}
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="seller-table-container">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Benefit</th>
              <th>Min. Order Threshold</th>
              <th>Maximum Cap</th>
              <th>Validity Period</th>
              <th>Usage Ratio</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ margin: 0, color: 'var(--seller-muted)' }}>
                    No promotional coupons exist yet. Create your first voucher code.
                  </p>
                </td>
              </tr>
            ) : (
              coupons.map((cp) => (
                <tr key={cp.id}>
                  <td>
                    <strong style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--seller-espresso)', background: 'var(--seller-cream)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--seller-border)' }}>
                      {cp.code}
                    </strong>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--seller-espresso)' }}>
                      {cp.discount_type === 'Percentage'
                        ? `${cp.discount_value}% OFF`
                        : `$${cp.discount_value} OFF`}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '13px' }}>${cp.min_order}</span>
                  </td>

                  <td>
                    <span style={{ fontSize: '13px' }}>${cp.max_discount}</span>
                  </td>

                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--seller-muted)' }}>
                      <span>{cp.start_date}</span> → <span>{cp.expiry_date}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {cp.usage_count || 0} / {cp.usage_limit}
                    </span>
                    <div style={{ width: '80px', height: '4px', background: 'var(--seller-border)', borderRadius: '2px', marginTop: '4px' }}>
                      <div
                        style={{
                          width: `${Math.min(100, ((cp.usage_count || 0) / cp.usage_limit) * 100)}%`,
                          height: '100%',
                          background: 'var(--seller-gold)',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </td>

                  <td>
                    <span className={`status-pill ${cp.is_active ? 'published' : 'inactive'}`}>
                      {cp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-seller-secondary btn-seller-sm"
                        onClick={() => toggleCouponStatus(cp.id)}
                        title={cp.is_active ? 'Deactivate Coupon' : 'Activate Coupon'}
                      >
                        <Power size={13} color={cp.is_active ? 'var(--seller-success)' : 'var(--seller-muted)'} />
                      </button>

                      <button
                        type="button"
                        className="btn-seller-secondary btn-seller-sm"
                        onClick={() => handleOpenEdit(cp)}
                        title="Edit Coupon"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-seller-danger btn-seller-sm"
                        onClick={() => {
                          if (window.confirm(`Delete coupon "${cp.code}"?`)) deleteCoupon(cp.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Coupon Modal */}
      {modalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>{editingCoupon ? 'Edit Promotional Coupon' : 'Create New Voucher Code'}</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="seller-modal-body">
                <div className="seller-form-group">
                  <label className="seller-form-label">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MAISON20"
                    className="seller-input"
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="seller-form-grid-2">
                  <div className="seller-form-group">
                    <label className="seller-form-label">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="seller-select"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div className="seller-form-group">
                    <label className="seller-form-label">
                      {formData.discount_type === 'Percentage' ? 'Discount Percentage (%) *' : 'Discount Amount ($) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                      className="seller-input"
                      required
                    />
                  </div>
                </div>

                <div className="seller-form-grid-2">
                  <div className="seller-form-group">
                    <label className="seller-form-label">Minimum Order Spend ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_order}
                      onChange={(e) => setFormData({ ...formData, min_order: parseFloat(e.target.value) || 0 })}
                      className="seller-input"
                    />
                  </div>

                  <div className="seller-form-group">
                    <label className="seller-form-label">Maximum Discount Cap ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: parseFloat(e.target.value) || 0 })}
                      className="seller-input"
                    />
                  </div>
                </div>

                <div className="seller-form-grid-2">
                  <div className="seller-form-group">
                    <label className="seller-form-label">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="seller-input"
                    />
                  </div>

                  <div className="seller-form-group">
                    <label className="seller-form-label">Expiration Date</label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="seller-input"
                    />
                  </div>
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Total Usage Limit (# of Redemptions)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: parseInt(e.target.value, 10) || 1 })}
                    className="seller-input"
                  />
                </div>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-seller-gold">
                  {editingCoupon ? 'Update Coupon' : 'Create & Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

