import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Wallet, CheckCircle, XCircle, Clock, Building, DollarSign } from 'lucide-react';

export default function AdminPayoutsPage() {
  const { payoutsList, processPayout } = useAdmin();
  const [filter, setFilter] = useState('all');

  const displayPayouts = payoutsList.length > 0 ? payoutsList : [
    {
      id: 1,
      shop_name: 'ZELORA Atelier Flagship',
      owner_email: 'atelier@zelora.luxury',
      amount: 4250.00,
      payment_method: 'Bank Transfer (IMPS/NEFT)',
      account_details: { bank: 'HDFC Luxury Banking', account_number: '****4921', ifsc: 'HDFC0001042' },
      status: 'pending',
      requested_at: '2026-11-06T10:00:00Z',
      admin_notes: 'Month-end reconciliation.'
    },
    {
      id: 2,
      shop_name: 'Noir Studio Couture',
      owner_email: 'noir@zelora.luxury',
      amount: 2890.00,
      payment_method: 'Bank Transfer',
      account_details: { bank: 'Standard Chartered', account_number: '****8831', ifsc: 'SCBL0036001' },
      status: 'completed',
      transaction_reference: 'UTR-ZEL-928410',
      requested_at: '2026-11-04T12:00:00Z',
      processed_at: '2026-11-05T14:30:00Z'
    }
  ];

  const filtered = displayPayouts.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <AdminLayout
      title="Seller Payouts & Settlement Concierge"
      subtitle="Disburse vendor net earnings, reconcile bank transfers, and verify tax withholding records."
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'completed'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={filter === tab ? 'btn-admin-gold' : 'btn-admin-secondary'}
                onClick={() => setFilter(tab)}
                style={{ textTransform: 'capitalize', padding: '6px 14px' }}
              >
                {tab} Settlements
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boutique & Beneficiary</th>
                <th>Disbursement Amount</th>
                <th>Banking Rails</th>
                <th>Transfer Reference</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Authorization</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payout) => (
                <tr key={payout.id}>
                  <td>
                    <strong style={{ color: '#F6F6F9', display: 'block' }}>{payout.shop_name}</strong>
                    <span style={{ fontSize: '11px', color: '#9E9EA8' }}>{payout.owner_email}</span>
                  </td>

                  <td>
                    <strong style={{ fontSize: '15px', color: '#C6A664' }}>
                      ₹{Number(payout.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </td>

                  <td>
                    <div style={{ fontSize: '12px', color: '#F6F6F9' }}>
                      <Building size={12} style={{ display: 'inline', marginRight: '4px', color: '#C6A664' }} />
                      {payout.account_details?.bank || 'Standard Bank'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9E9EA8' }}>
                      Acc: {payout.account_details?.account_number || '****8942'}
                    </div>
                  </td>

                  <td>
                    {payout.transaction_reference ? (
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#30A46C', fontWeight: 600 }}>
                        {payout.transaction_reference}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9E9EA8' }}>Awaiting Transfer</span>
                    )}
                  </td>

                  <td>
                    <span className={`status-pill ${payout.status}`}>
                      {payout.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {payout.status === 'pending' ? (
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-admin-success"
                          onClick={() => processPayout(payout.id, 'completed')}
                        >
                          <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Approve & Pay
                        </button>
                        <button
                          type="button"
                          className="btn-admin-danger"
                          onClick={() => processPayout(payout.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#30A46C', fontWeight: 600 }}>
                        ✓ Settlement Finalized
                      </span>
                    )}
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

