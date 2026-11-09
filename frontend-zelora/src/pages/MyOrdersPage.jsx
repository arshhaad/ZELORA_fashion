import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import { useCustomer } from '../context/CustomerContext';
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  RotateCcw,
  XCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { orders, cancelOrder, returnOrder, reorder } = useCustomer();

  const [statusFilter, setStatusFilter] = useState('All');
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [returnModalOrder, setReturnModalOrder] = useState(null);

  const filters = [
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

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'All') return true;
    return order.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  const handleConfirmCancel = async () => {
    if (cancelModalOrder) {
      await cancelOrder(cancelModalOrder.order_id);
      setCancelModalOrder(null);
    }
  };

  const handleConfirmReturn = async () => {
    if (returnModalOrder) {
      await returnOrder(returnModalOrder.order_id);
      setReturnModalOrder(null);
    }
  };

  const handleReorder = (order) => {
    reorder(order);
    navigate('/cart');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Shipped':
      case 'Out for Delivery':
        return 'status-shipped';
      case 'Confirmed':
      case 'Processing':
        return 'status-processing';
      case 'Cancelled':
      case 'Returned':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="orders-page-main">
        <div className="orders-page-container">
          {/* Header */}
          <div className="orders-header-row">
            <div>
              <span className="section-pretitle">ATELIER ACQUISITIONS</span>
              <h1 className="orders-page-title">My Orders ({orders.length})</h1>
            </div>
            <Link to="/products" className="continue-shopping-top-link">
              <ArrowLeft size={16} />
              <span>Explore Collections</span>
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <div className="orders-filters-scroller">
            <div className="orders-filter-tabs">
              {filters.map((st) => {
                const count =
                  st === 'All'
                    ? orders.length
                    : orders.filter((o) => o.status.toLowerCase() === st.toLowerCase()).length;
                return (
                  <button
                    key={st}
                    type="button"
                    className={`order-filter-btn ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    <span>{st}</span>
                    <span className="count-pill">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders Cards List */}
          {filteredOrders.length > 0 ? (
            <div className="orders-list-cards">
              {filteredOrders.map((order) => {
                const canCancel = order.status === 'Processing' || order.status === 'Confirmed';
                const canReturn = order.status === 'Delivered';
                const firstItem = order.items?.[0];
                const totalItemCount = order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0;

                return (
                  <div key={order.order_id} className="order-history-card">
                    {/* Top Meta Bar */}
                    <div className="order-card-meta-bar">
                      <div className="meta-left">
                        <div className="meta-block">
                          <span className="meta-label">ORDER ID</span>
                          <strong className="meta-val font-mono">{order.order_id}</strong>
                        </div>
                        <div className="meta-block">
                          <span className="meta-label">DATE PLACED</span>
                          <span className="meta-val">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="meta-block">
                          <span className="meta-label">TOTAL AMOUNT</span>
                          <strong className="meta-val">₹{order.total_amount}</strong>
                        </div>
                      </div>

                      <div className="meta-right">
                        <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="order-card-body">
                      {/* Products Thumbnail Showcase */}
                      <div className="order-products-showcase">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item-chip">
                            <img src={item.product_image} alt={item.product_name} />
                            <div className="order-item-desc">
                              <strong>{item.product_name}</strong>
                              <small>
                                Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Fulfillment & Payment Details */}
                      <div className="order-fulfillment-details">
                        <div className="fulfillment-row">
                          {order.delivery_method?.includes('Pickup') || order.delivery_method?.includes('Visit Shop') ? (
                            <>
                              <Building2 size={15} />
                              <span>
                                <strong>Fulfillment:</strong> Atelier Boutique Pickup (Visit & Collect)
                              </span>
                            </>
                          ) : (
                            <>
                              <Truck size={15} />
                              <span>
                                <strong>Estimated Delivery:</strong> {order.estimated_delivery}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="fulfillment-row">
                          <CreditCard size={15} />
                          <span>
                            <strong>Payment:</strong> {order.payment_method} ({order.payment_status})
                          </span>
                        </div>
                        <div className="fulfillment-row">
                          <Package size={15} />
                          <span>
                            <strong>Total Items:</strong> {totalItemCount} piece(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="order-card-actions-bar">
                      <div className="actions-left">
                        <Link
                          to={`/orders/${order.order_id}`}
                          className="btn-zelora-primary btn-sm flex-center"
                        >
                          <Eye size={14} />
                          <span>View Details & Tracking</span>
                        </Link>

                        <button
                          type="button"
                          className="btn-zelora-secondary btn-sm"
                          onClick={() => handleReorder(order)}
                        >
                          Buy Again
                        </button>
                      </div>

                      <div className="actions-right">
                        {canCancel && (
                          <button
                            type="button"
                            className="btn-danger-outline btn-sm"
                            onClick={() => setCancelModalOrder(order)}
                          >
                            Cancel Order
                          </button>
                        )}

                        {canReturn && (
                          <button
                            type="button"
                            className="btn-outline-dark btn-sm flex-center"
                            onClick={() => setReturnModalOrder(order)}
                          >
                            <RotateCcw size={13} />
                            <span>Return Piece</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-orders-state">
              <Package size={48} strokeWidth={1.2} />
              <h2>No Orders Found</h2>
              <p>
                {statusFilter === 'All'
                  ? 'You have not placed any orders yet. Discover timeless monochrome garments crafted for modern living.'
                  : `You currently have no orders in "${statusFilter}" status.`}
              </p>
              <Link to="/products" className="btn-hero-primary">
                <span>Start Shopping</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      {cancelModalOrder && (
        <div className="size-guide-modal-backdrop" onClick={() => setCancelModalOrder(null)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Order {cancelModalOrder.order_id}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCancelModalOrder(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you wish to cancel this order? Once cancelled, the items will be returned to inventory and any authorized payments will be refunded.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-zelora-secondary"
                onClick={() => setCancelModalOrder(null)}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="btn-danger-solid"
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {returnModalOrder && (
        <div className="size-guide-modal-backdrop" onClick={() => setReturnModalOrder(null)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Return / Exchange Order {returnModalOrder.order_id}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReturnModalOrder(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Under ZELORA’s 30-day concierge policy, courier pickup will be arranged at your registered delivery address. Garments must have original tags attached.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-zelora-secondary"
                onClick={() => setReturnModalOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-hero-primary"
                onClick={handleConfirmReturn}
              >
                Initiate Courier Return
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

