import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import { useCustomer } from '../context/CustomerContext';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  RotateCcw,
  CheckCircle2,
  FileText,
  MessageSquare,
  ArrowLeft,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, cancelOrder, returnOrder, reorder } = useCustomer();

  const [order, setOrder] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const found = orders.find((o) => o.order_id === orderId);
    setOrder(found || null);
  }, [orderId, orders]);

  if (!order) {
    return (
      <div className="zelora-page-wrapper">
        <Navbar />
        <div className="product-not-found">
          <h2>Order Not Found</h2>
          <p>We could not locate an order matching ID "{orderId}".</p>
          <Link to="/orders" className="btn-hero-primary">
            View All Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const trackingSteps = [
    { title: 'Pending', desc: 'Order placed & awaiting atelier confirmation' },
    { title: 'Confirmed', desc: 'Order confirmed & payment verified' },
    { title: 'Processing', desc: 'Garments inspected & packaged at atelier' },
    { title: 'Shipped', desc: 'Dispatched with priority courier logistics' },
    { title: 'Out for Delivery', desc: 'Courier out for doorstep arrival' },
    { title: 'Delivered', desc: 'Successfully handed over to recipient' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      case 'Cancelled':
      case 'Returned':
        return -1;
      default:
        return 1;
    }
  };

  const activeStepIdx = getStepIndex(order.status);
  const canCancel = order.status === 'Processing' || order.status === 'Confirmed';
  const canReturn = order.status === 'Delivered';

  const handleDownloadInvoice = () => {
    window.print();
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportModalOpen(false);
      setSupportSubmitted(false);
      setSupportMsg('');
    }, 2000);
  };

  return (
    <div className="zelora-page-wrapper print-area">
      <Toast />
      <Navbar />

      <main className="order-detail-page-main">
        <div className="order-detail-container">
          {/* Breadcrumbs & Back Link */}
          <div className="order-detail-header-bar">
            <Link to="/orders" className="back-link-chip">
              <ArrowLeft size={16} />
              <span>Back to Orders</span>
            </Link>

            <div className="invoice-action-btns">
              <button
                type="button"
                className="btn-zelora-secondary btn-sm flex-center"
                onClick={handleDownloadInvoice}
              >
                <Printer size={15} />
                <span>Download / Print Invoice</span>
              </button>
              <button
                type="button"
                className="btn-zelora-secondary btn-sm flex-center"
                onClick={() => setSupportModalOpen(true)}
              >
                <MessageSquare size={15} />
                <span>Contact Concierge</span>
              </button>
            </div>
          </div>

          {/* Order Header Summary Banner */}
          <div className="order-summary-banner">
            <div className="summary-banner-left">
              <span className="section-pretitle">ATELIER DISPATCH REFERENCE</span>
              <h1 className="order-banner-id">{order.order_id}</h1>
              <p className="order-date-text">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="summary-banner-right">
              <div className="status-badge-wrap">
                <span className="status-badge-label">CURRENT STATUS</span>
                <span className={`order-status-badge large`}>{order.status}</span>
              </div>
            </div>
          </div>

          {/* VISUAL ORDER TRACKING TIMELINE */}
          {order.status !== 'Cancelled' && order.status !== 'Returned' ? (
            <div className="order-tracking-section">
              <div className="tracking-header-row">
                <div className="tracking-title-info">
                  <h3>Fulfillment & Delivery Progress</h3>
                  <p>
                    Estimated Doorstep Arrival: <strong>{order.estimated_delivery}</strong>
                  </p>
                </div>
                {order.tracking_number && (
                  <div className="tracking-number-badge">
                    <span>TRACKING NUMBER:</span>
                    <strong>{order.tracking_number}</strong>
                  </div>
                )}
              </div>

              {/* Timeline Track */}
              <div className="timeline-track-wrap">
                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx < activeStepIdx;
                  const isCurrent = idx === activeStepIdx;
                  return (
                    <div
                      key={step.title}
                      className={`timeline-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="timeline-node-circle">
                        {isCompleted ? (
                          <CheckCircle2 size={16} />
                        ) : isCurrent ? (
                          <span className="current-pulsing-dot" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <div className="timeline-step-text">
                        <strong className="timeline-step-title">{step.title}</strong>
                        <small className="timeline-step-desc">{step.desc}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="order-terminated-banner">
              <AlertCircle size={20} />
              <div>
                <strong>Order is {order.status}</strong>
                <p>This order was marked as {order.status.toLowerCase()} on {new Date(order.status_updated_at || order.created_at).toLocaleDateString()}.</p>
              </div>
            </div>
          )}

          {/* Grid Layout: Items List & Details Sidebar */}
          <div className="order-details-grid">
            {/* Left: Ordered Items Breakdown */}
            <div className="order-items-col">
              <div className="card-box">
                <h3 className="card-box-title">
                  Ordered Garments ({order.items?.length || 0})
                </h3>

                <div className="order-items-detailed-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-detailed-row">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="item-detailed-img"
                      />

                      <div className="item-detailed-info">
                        <span className="item-brand">{item.brand || 'ZELORA'}</span>
                        <h4 className="item-name">{item.product_name}</h4>
                        <div className="item-attributes-pills">
                          <span className="pill">Size: {item.size}</span>
                          <span className="pill">Color: {item.color}</span>
                          <span className="pill">Quantity: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="item-detailed-price">
                        <span className="unit-price">${item.price} each</span>
                        <strong className="total-item-price">${item.price * item.quantity}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons for this order */}
                <div className="order-actions-bottom-row">
                  <button
                    type="button"
                    className="btn-zelora-secondary btn-sm"
                    onClick={() => {
                      reorder(order);
                      navigate('/cart');
                    }}
                  >
                    Buy Again
                  </button>

                  {canCancel && (
                    <button
                      type="button"
                      className="btn-danger-outline btn-sm"
                      onClick={() => cancelOrder(order.order_id)}
                    >
                      Cancel Order
                    </button>
                  )}

                  {canReturn && (
                    <button
                      type="button"
                      className="btn-outline-dark btn-sm flex-center"
                      onClick={() => returnOrder(order.order_id)}
                    >
                      <RotateCcw size={14} />
                      <span>Initiate Return / Exchange</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Address & Payment Summary Sidebar */}
            <div className="order-meta-col">
              {/* Delivery Address */}
              <div className="card-box mb-24">
                <div className="box-title-row">
                  <MapPin size={16} />
                  <h4>Delivery Address</h4>
                </div>
                <div className="address-meta-body">
                  <strong>{order.shipping_address?.full_name}</strong>
                  <p>
                    {order.shipping_address?.house_building}, {order.shipping_address?.street_area}
                    <br />
                    {order.shipping_address?.city}, {order.shipping_address?.state} — {order.shipping_address?.pin_code}
                  </p>
                  <small>Phone: {order.shipping_address?.mobile_number}</small>
                </div>
              </div>

              {/* Payment & Charges Breakdown */}
              <div className="card-box mb-24">
                <div className="box-title-row">
                  <CreditCard size={16} />
                  <h4>Payment Information</h4>
                </div>
                <div className="payment-meta-body">
                  <div className="meta-line">
                    <span>Payment Method:</span>
                    <strong>{order.payment_method}</strong>
                  </div>
                  <div className="meta-line">
                    <span>Payment Status:</span>
                    <strong className="text-success">{order.payment_status}</strong>
                  </div>
                  <div className="meta-line">
                    <span>Delivery Method:</span>
                    <span>{order.delivery_method}</span>
                  </div>
                </div>

                <hr className="summary-divider" />

                {/* Financials Breakdown */}
                <div className="financials-breakdown">
                  <div className="summary-line">
                    <span>Items Subtotal</span>
                    <span>${order.subtotal}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="summary-line text-discount">
                      <span>Discount</span>
                      <span>-${order.discount}</span>
                    </div>
                  )}
                  <div className="summary-line">
                    <span>Delivery Charges</span>
                    <span>{order.delivery_charges === 0 ? 'FREE' : `$${order.delivery_charges}`}</span>
                  </div>
                  <div className="summary-line">
                    <span>Tax (5% VAT)</span>
                    <span>${Number(order.tax).toFixed(2)}</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-total-line">
                    <span className="total-label">Grand Total</span>
                    <span className="total-value">${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contact Concierge Modal */}
      {supportModalOpen && (
        <div className="size-guide-modal-backdrop" onClick={() => setSupportModalOpen(false)}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Concierge Support for {order.order_id}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSupportModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {supportSubmitted ? (
              <div className="support-success-box">
                <CheckCircle2 size={36} className="text-success" />
                <h4>Message Received</h4>
                <p>Our client advisor will review your query and reply within 2 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="support-form">
                <p className="form-sub-desc">
                  Have a question regarding sizing, shipping delays, or tailoring adjustments for this order? Send a direct dispatch note to our atelier team.
                </p>
                <div className="form-group mb-16">
                  <label>Message to Client Concierge</label>
                  <textarea
                    rows={4}
                    value={supportMsg}
                    onChange={(e) => setSupportMsg(e.target.value)}
                    placeholder="Describe your inquiry..."
                    required
                    className="zelora-input"
                  />
                </div>
                <div className="modal-form-actions">
                  <button
                    type="button"
                    className="btn-zelora-secondary"
                    onClick={() => setSupportModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-hero-primary">
                    Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

