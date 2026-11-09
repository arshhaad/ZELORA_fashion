import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  ArrowLeft,
  CheckCircle,
  Truck,
  Package,
  User,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  XCircle,
  Send,
} from 'lucide-react';

export default function SellerOrderDetailPage() {
  const { orderId } = useParams();
  const { orders, updateOrderStatus, acceptOrder, rejectOrder, addShippingDetails } = useSeller();

  const order = orders.find(
    (o) => o.order_id === orderId || o.id === orderId
  );

  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [courierName, setCourierName] = useState(order?.courier_name || 'Blue Dart Apex');
  const [trackingNumber, setTrackingNumber] = useState(order?.tracking_number || `ZEL-IND-${Math.floor(1000000 + Math.random() * 9000000)}`);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Fabric / material inventory currently out of stock');

  if (!order) {
    return (
      <SellerLayout>
        <div className="seller-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle size={36} color="var(--seller-danger)" style={{ margin: '0 auto 12px' }} />
          <h3>Order Not Found</h3>
          <p style={{ color: 'var(--seller-muted)', margin: '0 0 20px' }}>
            No order with reference {orderId} belongs to your boutique.
          </p>
          <Link to="/seller/orders" className="btn-seller-primary">
            Return to Orders
          </Link>
        </div>
      </SellerLayout>
    );
  }

  // 6-Stage Workflow steps matching platform order flow:
  // PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> OUT FOR DELIVERY -> DELIVERED
  const workflowSteps = [
    { key: 'Pending', label: '1. Pending', desc: 'Placed by client' },
    { key: 'Confirmed', label: '2. Confirmed', desc: 'Confirmed by atelier' },
    { key: 'Processing', label: '3. Processing', desc: 'Garment prep & tailoring' },
    { key: 'Shipped', label: '4. Shipped', desc: 'Dispatched via express' },
    { key: 'Out for Delivery', label: '5. Out for Delivery', desc: 'Out for doorstep arrival' },
    { key: 'Delivered', label: '6. Delivered', desc: 'Client receipt confirmed' },
  ];

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s.key.toLowerCase() === (order.order_status === 'New' ? 'pending' : order.order_status.toLowerCase())
  );

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (courierName && trackingNumber) {
      addShippingDetails(order.order_id, {
        courier_name: courierName,
        tracking_number: trackingNumber,
      });
      setShippingModalOpen(false);
    }
  };

  const handleConfirmReject = () => {
    rejectOrder(order.order_id, rejectReason);
    setRejectModalOpen(false);
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <Link
            to="/seller/orders"
            style={{
              fontSize: '12px',
              color: 'var(--seller-muted)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '6px',
            }}
          >
            <ArrowLeft size={13} /> Back to All Orders
          </Link>
          <h1>Order Ref: {order.order_id}</h1>
          <p className="seller-page-subtitle">
            Placed on {new Date(order.order_date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>

        {/* Action Buttons based on status */}
        <div className="seller-page-actions">
          {(order.order_status === 'Pending' || order.order_status === 'New') && (
            <>
              <button
                type="button"
                className="btn-seller-danger"
                onClick={() => setRejectModalOpen(true)}
              >
                Reject Order
              </button>
              <button
                type="button"
                className="btn-seller-gold"
                onClick={() => acceptOrder(order.order_id)}
              >
                <CheckCircle size={16} /> Accept Order (Confirm)
              </button>
            </>
          )}

          {(order.order_status === 'Confirmed' || order.order_status === 'Accepted') && (
            <button
              type="button"
              className="btn-seller-primary"
              onClick={() => updateOrderStatus(order.order_id, 'Processing')}
            >
              <Package size={16} /> Mark as Processing
            </button>
          )}

          {order.order_status === 'Processing' && (
            <button
              type="button"
              className="btn-seller-gold"
              onClick={() => setShippingModalOpen(true)}
            >
              <Truck size={16} /> Add Shipping & Mark Shipped
            </button>
          )}

          {order.order_status === 'Shipped' && (
            <button
              type="button"
              className="btn-seller-secondary"
              onClick={() => updateOrderStatus(order.order_id, 'Out for Delivery')}
            >
              <Truck size={16} /> Mark Out for Delivery
            </button>
          )}

          {order.order_status === 'Out for Delivery' && (
            <button
              type="button"
              className="btn-seller-primary"
              onClick={() => updateOrderStatus(order.order_id, 'Delivered')}
            >
              <CheckCircle size={16} /> Confirm Delivered
            </button>
          )}
        </div>
      </div>

      {/* 6-STAGE WORKFLOW TIMELINE CARD */}
      <div className="seller-card mb-24" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'var(--seller-espresso)' }}>
          Order Progress: PENDING → CONFIRMED → PROCESSING → SHIPPED → OUT FOR DELIVERY → DELIVERED
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {workflowSteps.map((step, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? 'var(--seller-espresso)'
                      : 'var(--seller-white)',
                    color: isCompleted ? 'var(--seller-gold-light)' : 'var(--seller-muted)',
                    border: `2px solid ${isCompleted ? 'var(--seller-espresso)' : 'var(--seller-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '8px',
                    boxShadow: isCurrent ? '0 0 0 4px var(--seller-gold-glow)' : 'none',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <strong style={{ fontSize: '12.5px', color: isCompleted ? 'var(--seller-espresso)' : 'var(--seller-muted)' }}>
                  {step.label}
                </strong>
                <small style={{ fontSize: '11px', color: 'var(--seller-muted)', marginTop: '2px' }}>
                  {step.desc}
                </small>
              </div>
            );
          })}
        </div>
      </div>

      <div className="seller-order-detail-grid">
        {/* Left Column: Ordered Garments */}
        <div>
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <h3>Ordered Garments ({order.items?.length || 0})</h3>
              <span className="status-pill published">Payment: {order.payment_status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: 'var(--seller-radius)',
                    background: 'var(--seller-cream-subtle)',
                    border: '1px solid var(--seller-border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      style={{
                        width: '64px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: 'var(--seller-radius-sm)',
                        border: '1px solid var(--seller-border)',
                      }}
                    />
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--seller-espresso)' }}>
                        {item.product_name}
                      </h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--seller-muted)' }}>
                        <span>Size: <strong>{item.size}</strong></span>
                        <span>Color: <strong>{item.color}</strong></span>
                        <span>Qty: <strong>{item.quantity}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--seller-muted)', display: 'block' }}>
                      ₹{item.price} each
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--seller-espresso)' }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--seller-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--seller-muted)' }}>Subtotal</span>
                <span>₹{order.total_amount?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--seller-muted)' }}>Marketplace Commission (12%)</span>
                <span>-₹{(order.total_amount * 0.12).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, marginTop: '10px' }}>
                <span style={{ color: 'var(--seller-espresso)' }}>Atelier Net Payout (88%)</span>
                <span style={{ color: 'var(--seller-gold-dark)' }}>
                  ₹{(order.total_amount * 0.88).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping / Tracking Details Card (if shipped) */}
          {(order.tracking_number || order.order_status === 'Shipped' || order.order_status === 'Delivered') && (
            <div className="seller-card">
              <div className="seller-card-title-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="var(--seller-espresso)" />
                  <h3 style={{ margin: 0 }}>Courier Dispatch Information</h3>
                </div>
              </div>

              <div className="seller-form-grid-2">
                <div>
                  <small style={{ color: 'var(--seller-muted)', display: 'block' }}>Specialized Courier Partner</small>
                  <strong style={{ fontSize: '14px', color: 'var(--seller-espresso)' }}>
                    {order.courier_name || 'Blue Dart Apex'}
                  </strong>
                </div>
                <div>
                  <small style={{ color: 'var(--seller-muted)', display: 'block' }}>Waybill / Tracking Reference</small>
                  <strong style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--seller-espresso)' }}>
                    {order.tracking_number || 'TRK-ZEL-8820141'}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer & Delivery Address */}
        <div>
          {/* Customer Profile */}
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--seller-espresso)" />
                <h3 style={{ margin: 0 }}>Client Profile</h3>
              </div>
            </div>

            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: 'var(--seller-espresso)' }}>
              {order.customer_name}
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '12.5px', color: 'var(--seller-muted)' }}>
              {order.customer_email}
            </p>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--seller-muted)' }}>
              {order.customer_phone || order.shipping_address?.mobile_number}
            </p>
          </div>

          {/* Delivery Destination */}
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--seller-espresso)" />
                <h3 style={{ margin: 0 }}>Destination Address</h3>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--seller-dark-text)' }}>
              <strong>{order.shipping_address?.full_name}</strong>
              <br />
              {order.shipping_address?.house_building}, {order.shipping_address?.street_area}
              <br />
              {order.shipping_address?.city}, {order.shipping_address?.state} — {order.shipping_address?.pin_code}
            </p>
          </div>

          {/* Payment Method */}
          <div className="seller-card">
            <div className="seller-card-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--seller-espresso)" />
                <h3 style={{ margin: 0 }}>Payment Method</h3>
              </div>
            </div>

            <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: 'var(--seller-espresso)' }}>
              {order.payment_method || 'Razorpay Gateway'}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--seller-success)', fontWeight: 600 }}>
              ✓ Encrypted Escrow Clearance Completed
            </p>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {shippingModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Dispatch Order ({order.order_id})</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShippingModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit}>
              <div className="seller-modal-body">
                <div className="seller-form-group">
                  <label className="seller-form-label">Express Courier Partner *</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="seller-select"
                  >
                    <option value="Blue Dart Apex">Blue Dart Apex (White Glove Express)</option>
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="DHL Express Global">DHL Express Global</option>
                    <option value="Self Ateliér Delivery">Self Ateliér Concierge Delivery</option>
                  </select>
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Waybill / Tracking Number *</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="seller-input"
                    style={{ fontFamily: 'monospace' }}
                    required
                  />
                </div>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setShippingModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-seller-gold">
                  <Send size={15} /> Confirm Dispatch & Notify Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Decline Order ({order.order_id})</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setRejectModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="seller-modal-body">
              <div className="seller-form-group">
                <label className="seller-form-label">Reason for Cancellation</label>
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
                  Back
                </button>
                <button
                  type="button"
                  className="btn-seller-danger"
                  onClick={handleConfirmReject}
                >
                  Decline & Process Client Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

