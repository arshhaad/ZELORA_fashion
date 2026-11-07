import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { CreditCard, Search, CheckCircle, ShieldCheck, DollarSign, ExternalLink } from 'lucide-react';

export default function AdminPaymentsPage() {
  const { paymentsList } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const displayPayments = paymentsList.length > 0 ? paymentsList : [
    {
      transaction_id: 'pay_PqL92Jk8X19aZc',
      order_id: 'ZEL-89421',
      customer_email: 'genevieve@laurent.fr',
      amount: 349.00,
      method: 'UPI',
      gateway: 'Razorpay',
      status: 'Paid',
      date: 'Nov 06, 2026 • 14:22'
    },
    {
      transaction_id: 'pay_Qm883Ka90L1bXp',
      order_id: 'ZEL-78103',
      customer_email: 'julian@sterlingholdings.co.uk',
      amount: 480.00,
      method: 'Credit Card',
      gateway: 'Razorpay',
      status: 'Paid',
      date: 'Nov 06, 2026 • 11:05'
    },
    {
      transaction_id: 'pay_Nn402Va81K9aLx',
      order_id: 'ZEL-65294',
      customer_email: 'camilla.hayes@manhattan.com',
      amount: 260.00,
      method: 'UPI',
      gateway: 'Razorpay',
      status: 'Paid',
      date: 'Nov 05, 2026 • 19:40'
    },
    {
      transaction_id: 'TXN-COD-94810',
      order_id: 'ZEL-51902',
      customer_email: 'vikram.m@malhotragroup.in',
      amount: 520.00,
      method: 'Cash on Delivery',
      gateway: 'COD Concierge',
      status: 'Pending Collection',
      date: 'Nov 05, 2026 • 16:15'
    }
  ];

  const filtered = displayPayments.filter(
    (p) =>
      p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      title="Payment Gateway Transactions"
      subtitle="Reconcile incoming payment streams, Razorpay transaction references, and settlement statuses."
    >
      {/* Gateway Status Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#16161D',
          border: '1px solid #23232C',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(48, 164, 108, 0.15)', color: '#30A46C' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9E9EA8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Razorpay Test Key
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F6F6F9', fontFamily: 'monospace', marginTop: '2px' }}>
              rzp_test_TxHy520so82PT1
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#16161D',
          border: '1px solid #23232C',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div className="kpi-icon-wrap">
            <DollarSign size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9E9EA8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Total Captured Volume
            </span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#C6A664', marginTop: '2px' }}>
              $148,250.00
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#16161D',
          border: '1px solid #23232C',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(198, 166, 100, 0.12)' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9E9EA8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Supported Rails
            </span>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F6F6F9', marginTop: '2px' }}>
              UPI, Credit/Debit Cards, NetBanking, COD
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-header-search" style={{ width: '380px' }}>
            <Search size={15} color="#9E9EA8" />
            <input
              type="text"
              placeholder="Search transaction ID, order number, or client email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction Reference</th>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Amount</th>
                <th>Payment Rail</th>
                <th>Gateway</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay, idx) => (
                <tr key={idx}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#C6A664', fontWeight: 600 }}>
                      {pay.transaction_id}
                    </span>
                    <div style={{ fontSize: '11px', color: '#9E9EA8' }}>{pay.date}</div>
                  </td>

                  <td>
                    <strong style={{ color: '#F6F6F9' }}>{pay.order_id}</strong>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{pay.customer_email}</span>
                  </td>

                  <td>
                    <strong style={{ color: '#F6F6F9' }}>${Number(pay.amount).toFixed(2)}</strong>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#F6F6F9' }}>{pay.method}</span>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{pay.gateway}</span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <span className={`status-pill ${pay.status.toLowerCase().includes('paid') ? 'active' : 'pending'}`}>
                      {pay.status}
                    </span>
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

