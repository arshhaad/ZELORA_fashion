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
  User,
  X,
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
      <div className="seller-card seller-orders-filter-card mb-24">
        <div className="seller-orders-filter-bar">
          {/* Search Bar */}
          <div className="seller-filter-search-box">
            <Search size={16} className="seller-filter-search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, garment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="seller-input seller-orders-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="seller-search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Picker */}
          <div className="seller-orders-date-wrap">
            <div className="seller-date-input-box">
              <Calendar size={15} className="seller-date-icon" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="seller-input seller-orders-date-input"
                aria-label="Filter by order date"
              />
            </div>
            {dateFilter && (
              <button
                type="button"
                className="btn-seller-secondary btn-seller-sm"
                onClick={() => setDateFilter('')}
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs (Horizontally scrollable with styled scrollbar) */}
        <div className="seller-orders-tabs-scroll">
          {statusTabs.map((tab) => {
            const count =
              tab === 'All'
                ? orders.length
                : orders.filter((o) => o.order_status.toLowerCase() === tab.toLowerCase()).length;

            return (
              <button
                key={tab}
                type="button"
                className={`seller-order-tab-btn ${statusFilter === tab ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab)}
              >
                <span>{tab === 'All' ? 'All Orders' : tab}</span>
                <span className="seller-order-tab-count">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table - Desktop & Tablets */}
      <div className="seller-orders-table-wrapper">
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
                  <td colSpan={8} style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <div className="seller-empty-table-state">
                      <ShoppingBag size={38} color="var(--seller-muted)" style={{ margin: '0 auto 12px' }} />
                      <p style={{ margin: '0 0 8px', color: 'var(--seller-espresso)', fontWeight: 700, fontSize: '15px' }}>
                        No orders match your selected criteria.
                      </p>
                      <p style={{ margin: 0, color: 'var(--seller-muted)', fontSize: '13px' }}>
                        Try adjusting your search terms, date filter, or order status tabs.
                      </p>
                      {(searchTerm || statusFilter !== 'All' || dateFilter) && (
                        <button
                          type="button"
                          className="btn-seller-secondary btn-seller-sm"
                          style={{ marginTop: '16px' }}
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All');
                            setDateFilter('');
                          }}
                        >
                          Reset All Filters
                        </button>
                      )}
                    </div>
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
      </div>

      {/* Mobile Responsive Order Cards (<= 768px) */}
      <div className="seller-mobile-order-cards">
        {filteredOrders.length === 0 ? (
          <div className="seller-card seller-mobile-empty-orders">
            <ShoppingBag size={40} color="var(--seller-muted)" style={{ margin: '0 auto 12px' }} />
            <h4>No Orders Found</h4>
            <p>
              {searchTerm || statusFilter !== 'All' || dateFilter
                ? 'No orders match your active search or filter criteria.'
                : 'No customer orders placed yet for your atelier.'}
            </p>
            {(searchTerm || statusFilter !== 'All' || dateFilter) && (
              <button
                type="button"
                className="btn-seller-secondary btn-seller-sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setDateFilter('');
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div key={ord.id} className="seller-card seller-order-mobile-card">
              <div className="seller-order-card-header">
                <div>
                  <span className="seller-order-id-badge">{ord.order_id}</span>
                  <div className="seller-order-date">
                    <Calendar size={12} />
                    <span>
                      {new Date(ord.order_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <span className={`status-pill ${ord.order_status.toLowerCase()}`}>
                  {ord.order_status}
                </span>
              </div>

              <div className="seller-order-customer-row">
                <div className="seller-order-customer-info">
                  <span className="customer-name">{ord.customer_name}</span>
                  <span className="customer-location">
                    {ord.shipping_address?.city || 'Local Delivery'}, {ord.shipping_address?.state || ''}
                  </span>
                </div>
                <div className="seller-order-amount-box">
                  <span className="amount-label">Total Amount</span>
                  <strong className="amount-val">₹{Number(ord.total_amount).toFixed(2)}</strong>
                </div>
              </div>

              {ord.items && ord.items.length > 0 && (
                <div className="seller-order-items-strip">
                  <div className="seller-order-thumbs">
                    {ord.items.slice(0, 3).map((it, idx) => (
                      <img
                        key={idx}
                        src={it.product_image}
                        alt={it.product_name}
                        title={`${it.product_name} (${it.size})`}
                        className="seller-order-thumb-img"
                      />
                    ))}
                  </div>
                  <span className="seller-order-items-count">
                    {ord.items.length} garment{ord.items.length > 1 ? 's' : ''}
                    {ord.items[0]?.product_name ? ` • ${ord.items[0].product_name}` : ''}
                  </span>
                </div>
              )}

              <div className="seller-order-payment-strip">
                <span className="status-pill published" style={{ fontSize: '10px' }}>
                  {ord.payment_status}
                </span>
                <span className="seller-payment-method">
                  {ord.payment_method}
                </span>
              </div>

              <div className="seller-order-card-actions">
                {(ord.order_status === 'Pending' || ord.order_status === 'New') && (
                  <>
                    <button
                      type="button"
                      className="btn-seller-gold btn-seller-sm"
                      onClick={() => acceptOrder(ord.order_id)}
                    >
                      <Check size={13} /> Accept
                    </button>
                    <button
                      type="button"
                      className="btn-seller-danger btn-seller-sm"
                      onClick={() => handleOpenRejectModal(ord)}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                <Link
                  to={`/seller/orders/${ord.order_id}`}
                  className="btn-seller-secondary btn-seller-sm inspect-btn"
                >
                  <Eye size={13} /> View Order
                </Link>
              </div>
            </div>
          ))
        )}
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

