import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  ShoppingBag,
  Search,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Filter,
  Check,
} from 'lucide-react';

export default function SellerOrdersPage() {
  const { orders, acceptOrder, rejectOrder } = useSeller();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Reject order modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderToReject, setSelectedOrderToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Fabric / material inventory currently out of stock');

  const statusTabs = [
    'All',
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned',
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchTerm === '' ||
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((it) => it.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter !== 'All') {
        const ordStat = order.order_status.toLowerCase();
        const filtStat = statusFilter.toLowerCase();
        matchesStatus =
          ordStat === filtStat ||
          (filtStat === 'pending' && ordStat === 'new') ||
          (filtStat === 'confirmed' && ordStat === 'accepted');
      }

      let matchesDate = true;
      if (dateFilter) {
        matchesDate = order.order_date.startsWith(dateFilter);
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const handleOpenRejectModal = (order) => {
    setSelectedOrderToReject(order);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedOrderToReject) {
      rejectOrder(selectedOrderToReject.order_id, rejectReason);
      setRejectModalOpen(false);
      setSelectedOrderToReject(null);
    }
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Customer Orders</h1>
          <p className="seller-page-subtitle">
            Manage incoming haute couture and ready-to-wear orders, fulfillment workflows, and shipments.
          </p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH CARD */}
      <div className="seller-card mb-24" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '16px',
          }}
        >
          {/* Search Bar */}
          <div className="seller-filter-search-box">
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--seller-muted)' }} />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, garment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="seller-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--seller-muted)" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="seller-input"
              style={{ width: 'auto' }}
            />
            {dateFilter && (
              <button
                type="button"
                className="btn-seller-secondary btn-seller-sm"
                onClick={() => setDateFilter('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {statusTabs.map((tab) => {
            const count =
              tab === 'All'
                ? orders.length
                : orders.filter((o) => o.order_status.toLowerCase() === tab.toLowerCase()).length;

            return (
              <button
                key={tab}
                type="button"
                style={{
                  border: '1px solid var(--seller-border)',
                  background: statusFilter === tab ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: statusFilter === tab ? 'var(--seller-white)' : 'var(--seller-dark-text)',
                  padding: '7px 14px',
                  borderRadius: 'var(--seller-radius)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'var(--seller-transition)',
                }}
                onClick={() => setStatusFilter(tab)}
              >
                <span>{tab === 'All' ? 'All Orders' : tab}</span>
                <span
                  style={{
                    fontSize: '10.5px',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    background: statusFilter === tab ? 'rgba(255,255,255,0.2)' : 'var(--seller-beige-light)',
                    color: statusFilter === tab ? '#fff' : 'var(--seller-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="seller-table-container">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Garments</th>
              <th>Amount (₹)</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ margin: 0, color: 'var(--seller-muted)', fontSize: '14px' }}>
                    No orders match your selected criteria.
                  </p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--seller-espresso)' }}>
                      {ord.order_id}
                    </strong>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--seller-dark-text)' }}>
                      {ord.customer_name}
                    </span>
                    <small style={{ display: 'block', color: 'var(--seller-muted)', fontSize: '11px' }}>
                      {ord.shipping_address?.city}, {ord.shipping_address?.state}
                    </small>
                  </td>

                  <td>
                    <span style={{ fontSize: '12.5px', color: 'var(--seller-dark-text)' }}>
                      {new Date(ord.order_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ord.items.slice(0, 2).map((it, idx) => (
                        <img
                          key={idx}
                          src={it.product_image}
                          alt={it.product_name}
                          title={`${it.product_name} (${it.size})`}
                          style={{
                            width: '32px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '3px',
                            border: '1px solid var(--seller-border)',
                          }}
                        />
                      ))}
                      <span style={{ fontSize: '12px', color: 'var(--seller-muted)' }}>
                        {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong style={{ fontSize: '14px', color: 'var(--seller-espresso)' }}>
                      ₹{ord.total_amount.toFixed(2)}
                    </strong>
                  </td>

                  <td>
                    <span className="status-pill published" style={{ fontSize: '10.5px' }}>
                      {ord.payment_status}
                    </span>
                    <small style={{ display: 'block', fontSize: '10px', color: 'var(--seller-muted)' }}>
                      {ord.payment_method?.split(' ')[0]}
                    </small>
                  </td>

                  <td>
                    <span className={`status-pill ${ord.order_status.toLowerCase()}`}>
                      {ord.order_status}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {(ord.order_status === 'Pending' || ord.order_status === 'New') && (
                        <>
                          <button
                            type="button"
                            className="btn-seller-gold btn-seller-sm"
                            onClick={() => acceptOrder(ord.order_id)}
                            title="Accept Order"
                          >
                            <Check size={13} /> Accept
                          </button>
                          <button
                            type="button"
                            className="btn-seller-danger btn-seller-sm"
                            onClick={() => handleOpenRejectModal(ord)}
                            title="Reject Order"
                          >
                            <XCircle size={13} />
                          </button>
                        </>
                      )}

                      <Link
                        to={`/seller/orders/${ord.order_id}`}
                        className="btn-seller-secondary btn-seller-sm"
                      >
                        <Eye size={13} /> Inspect
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Order Modal */}
      {rejectModalOpen && selectedOrderToReject && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Reject Order ({selectedOrderToReject.order_id})</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setRejectModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="seller-modal-body">
              <p style={{ fontSize: '13px', color: 'var(--seller-muted)', marginTop: 0 }}>
                Please specify the reason for declining order {selectedOrderToReject.order_id}. The client will be refunded immediately.
              </p>

              <div className="seller-form-group">
                <label className="seller-form-label">Decline Reason</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="seller-select"
                >
                  <option value="Fabric / material inventory currently out of stock">
                    Fabric / material inventory currently out of stock
                  </option>
                  <option value="Custom size requirement cannot be tailored within timeframe">
                    Custom size requirement cannot be tailored within timeframe
                  </option>
                  <option value="Courier destination unreachable by specialized logistics">
                    Courier destination unreachable by specialized logistics
                  </option>
                  <option value="Duplicate or fraudulent order flag">
                    Duplicate or fraudulent order flag
                  </option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-seller-danger"
                  onClick={handleConfirmReject}
                >
                  Confirm Rejection & Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

