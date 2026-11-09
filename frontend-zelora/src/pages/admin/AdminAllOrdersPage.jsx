import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Search, ShoppingBag, Eye, DollarSign, Calendar, MapPin, Truck } from 'lucide-react';

export default function AdminAllOrdersPage() {
  const { ordersList } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const displayOrders = ordersList.length > 0 ? ordersList : [
    {
      id: 'ZEL-89421',
      customer_name: 'Genevieve Laurent',
      customer_email: 'genevieve@laurent.fr',
      amount: 349.00,
      order_status: 'Delivered',
      payment_status: 'Paid',
      payment_method: 'UPI (Razorpay)',
      created_at: 'Nov 06, 2026 • 14:22',
      items: [
        { id: 1, name: 'Structured Double-Breasted Wool Overcoat', brand: 'ZELORA Atelier', size: 'M', color: 'Noir Black', quantity: 1, price: 349.00 }
      ]
    },
    {
      id: 'ZEL-78103',
      customer_name: 'Julian Sterling',
      customer_email: 'julian@sterlingholdings.co.uk',
      amount: 480.00,
      order_status: 'Shipped',
      payment_status: 'Paid',
      payment_method: 'Credit Card (Razorpay)',
      created_at: 'Nov 06, 2026 • 11:05',
      items: [
        { id: 2, name: 'Pleated Wool Wide-Leg Trousers', brand: 'Noir Studio', size: '32', color: 'Charcoal', quantity: 2, price: 240.00 }
      ]
    },
    {
      id: 'ZEL-65294',
      customer_name: 'Camilla Hayes',
      customer_email: 'camilla.hayes@manhattan.com',
      amount: 260.00,
      order_status: 'Confirmed',
      payment_status: 'Paid',
      payment_method: 'UPI',
      created_at: 'Nov 05, 2026 • 19:40',
      items: [
        { id: 3, name: 'Silk Poplin Relaxed Tailored Shirt', brand: 'Linen & Silk Milano', size: 'S', color: 'Ivory White', quantity: 1, price: 260.00 }
      ]
    },
    {
      id: 'ZEL-51902',
      customer_name: 'Vikram Malhotra',
      customer_email: 'vikram.m@malhotragroup.in',
      amount: 520.00,
      order_status: 'Processing',
      payment_status: 'Paid',
      payment_method: 'Credit Card',
      created_at: 'Nov 05, 2026 • 16:15',
      items: [
        { id: 4, name: 'Brushed Cashmere Rollneck Sweater', brand: 'ZELORA Atelier', size: 'L', color: 'Oatmeal', quantity: 1, price: 520.00 }
      ]
    }
  ];

  const filtered = displayOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && o.order_status?.toLowerCase().replace(/\s+/g, '_') === statusFilter;
  });

  return (
    <AdminLayout
      title="Global Orders Operations"
      subtitle="Track customer order fulfillment, examine merchant shipments, and monitor order lifecycle states."
    >
      <div className="admin-card">
        {/* Search & Status Filters */}
        <div className="admin-card-header">
          <div className="admin-header-search" style={{ width: '380px' }}>
            <Search size={15} color="#9E9EA8" />
            <input
              type="text"
              placeholder="Search order ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                className={statusFilter === st ? 'btn-admin-gold' : 'btn-admin-secondary'}
                onClick={() => setStatusFilter(st)}
                style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '12px' }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Client</th>
                <th>Purchased Items</th>
                <th>Order Value</th>
                <th>Payment Mode</th>
                <th>Fulfillment Status</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong style={{ color: '#C6A664', fontSize: '13px' }}>{order.id}</strong>
                    <div style={{ fontSize: '11px', color: '#9E9EA8' }}>{order.created_at}</div>
                  </td>

                  <td>
                    <strong style={{ color: '#F6F6F9', display: 'block' }}>{order.customer_name || 'Customer'}</strong>
                    <span style={{ fontSize: '11px', color: '#9E9EA8' }}>{order.customer_email}</span>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#F6F6F9' }}>
                      {order.items?.length || 1} garment(s)
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: '#F6F6F9' }}>₹{Number(order.amount).toFixed(2)}</strong>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{order.payment_method}</span>
                  </td>

                  <td>
                    <span className={`status-pill ${order.order_status?.toLowerCase().replace(/\s+/g, '_')}`}>
                      {order.order_status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-admin-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={12} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Order Inspection — {selectedOrder.id}</h3>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <span className="admin-label">Customer Details</span>
                  <strong style={{ color: '#F6F6F9', display: 'block' }}>{selectedOrder.customer_name}</strong>
                  <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{selectedOrder.customer_email}</span>
                </div>
                <div>
                  <span className="admin-label">Payment Information</span>
                  <div style={{ fontSize: '12px', color: '#F6F6F9' }}>Method: {selectedOrder.payment_method}</div>
                  <div style={{ fontSize: '12px', color: '#30A46C', fontWeight: 600 }}>Status: {selectedOrder.payment_status}</div>
                </div>
              </div>

              <span className="admin-label">Ordered Clothing Garments</span>
              <div style={{ border: '1px solid #23232C', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: idx < (selectedOrder.items.length - 1) ? '1px solid #23232C' : 'none'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: '#F6F6F9', display: 'block' }}>{item.name}</strong>
                      <span style={{ fontSize: '11px', color: '#9E9EA8' }}>
                        {item.brand} • Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </span>
                    </div>
                    <strong style={{ color: '#C6A664' }}>${Number(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#F6F6F9' }}>Final Payable Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#C6A664' }}>
                  ${Number(selectedOrder.amount).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

