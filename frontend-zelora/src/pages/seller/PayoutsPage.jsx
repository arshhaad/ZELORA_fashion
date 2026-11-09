import { useState } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Wallet,
  Download,
  Building2,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  X,
  CreditCard,
} from 'lucide-react';

export default function PayoutsPage() {
  const { payouts, requestPayout, totalEarnings } = useSeller();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Computed Payout Metrics
  const totalPaidOut = payouts
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBalance = payouts
    .filter((p) => p.status === 'In Review' || p.status === 'Processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.max(0, totalEarnings - totalPaidOut - pendingBalance);

  // Bank Info (Securely masked)
  const bankAccount = {
    bank_name: 'HDFC Bank Ltd.',
    branch: 'Colaba Causeway Prestige Branch, Mumbai',
    account_number: '•••• •••• •••• 4091',
    account_holder: 'Maison de L\'Ombre Couture LLP',
    ifsc: 'HDFC0000240',
    verification: 'Verified by RBI & ZELORA Corporate Escrow',
  };

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(requestAmount) > 0 && parseFloat(requestAmount) <= availableBalance) {
      requestPayout(requestAmount, { bank_name: selectedBank });
      setRequestModalOpen(false);
      setRequestAmount('');
    } else {
      alert(`Please enter an amount between ₹1 and ₹${availableBalance.toFixed(2)}.`);
    }
  };

  const handleDownloadStatement = () => {
    const headers = ['Payout ID,Date,Amount,Payment Method,Transaction Reference,Status\n'];
    const rows = payouts.map(
      (p) =>
        `"${p.id}","${p.date}",${p.amount},"${p.payment_method}","${p.reference}","${p.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zelora_atelier_payout_statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Earnings & Escrow Disbursements</h1>
          <p className="seller-page-subtitle">
            Track gross fashion sales, bi-weekly marketplace settlements, and verified direct bank transfers.
          </p>
        </div>

        <div className="seller-page-actions">
          <button
            type="button"
            className="btn-seller-secondary"
            onClick={handleDownloadStatement}
          >
            <Download size={15} />
            <span>Download Statement</span>
          </button>
          <button
            type="button"
            className="btn-seller-gold"
            onClick={() => setRequestModalOpen(true)}
            disabled={availableBalance <= 0}
          >
            <Wallet size={15} />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* 4 EARNINGS METRIC CARDS */}
      <div className="seller-stats-grid">
        <div className="seller-stat-card">
          <span className="stat-label">Net Lifetime Earnings</span>
          <h2 className="stat-value" style={{ color: 'var(--seller-espresso)' }}>
            ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <span className="stat-subtext">88% net boutique commission</span>
        </div>

        <div className="seller-stat-card" style={{ borderLeft: '4px solid var(--seller-gold)' }}>
          <span className="stat-label">Available for Withdrawal</span>
          <h2 className="stat-value" style={{ color: 'var(--seller-gold-dark)' }}>
            ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <span className="stat-subtext">Ready for immediate settlement</span>
        </div>

        <div className="seller-stat-card">
          <span className="stat-label">Pending In Escrow</span>
          <h2 className="stat-value" style={{ color: 'var(--seller-warning)' }}>
            ₹{pendingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <span className="stat-subtext">Awaiting clearance or delivery confirmation</span>
        </div>

        <div className="seller-stat-card">
          <span className="stat-label">Total Settled & Paid Out</span>
          <h2 className="stat-value" style={{ color: 'var(--seller-success)' }}>
            ₹{totalPaidOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <span className="stat-subtext">Disbursed via automated bank transfer</span>
        </div>
      </div>

      {/* BANK ACCOUNT & ESCROW SCHEDULE ROW */}
      <div className="seller-payouts-grid">
        {/* Verified Bank Account Card */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Designated Settlement Account</h3>
            </div>
            <span className="status-pill published">Verified</span>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, var(--seller-espresso) 0%, var(--seller-espresso-dark) 100%)',
              color: '#fff',
              padding: '20px',
              borderRadius: 'var(--seller-radius)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--seller-gold-light)' }}>
                CORPORATE ESCROW BENEFICIARY
              </span>
              <ShieldCheck size={18} color="var(--seller-gold)" />
            </div>

            <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>
              {bankAccount.bank_name}
            </p>
            <p style={{ margin: '0 0 14px', fontFamily: 'monospace', fontSize: '16px', letterSpacing: '3px' }}>
              {bankAccount.account_number}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(232,222,209,0.8)' }}>
              <span>Holder: {bankAccount.account_holder}</span>
              <span>IFSC: {bankAccount.ifsc}</span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--seller-muted)', lineHeight: 1.4 }}>
            Bank account changes require dual-factor authorization and 24-hour verification hold for security.
          </p>
        </div>

        {/* Settlement Policy & Terms */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Automated Settlement Cadence</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--seller-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Bi-Weekly Automatic Clearance</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--seller-muted)', fontSize: '12px' }}>
                  Orders delivered and past the 7-day exchange window are automatically bundled every alternate Thursday.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--seller-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Zero Withdrawal Surcharges</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--seller-muted)', fontSize: '12px' }}>
                  ZELORA covers all RTGS/NEFT transaction and banking settlement fees.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--seller-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>On-Demand Atelier Wire Request</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--seller-muted)', fontSize: '12px' }}>
                  Need working capital for fabric purchasing? Request on-demand wire transfers with 24-hour clearance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYOUT HISTORY TABLE */}
      <div className="seller-table-container">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--seller-border)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--seller-espresso)' }}>
            Settlement & Disbursement Ledger
          </h3>
        </div>

        <table className="seller-table">
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Date Cleared</th>
              <th>Amount (₹)</th>
              <th>Disbursement Method</th>
              <th>Banking Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--seller-espresso)' }}>
                    {p.id}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '13px' }}>{p.date}</span>
                </td>
                <td>
                  <strong style={{ fontSize: '14px', color: 'var(--seller-gold-dark)' }}>
                    ₹{p.amount.toFixed(2)}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '13px' }}>{p.payment_method}</span>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--seller-muted)' }}>
                    {p.reference}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      p.status === 'Completed'
                        ? 'published'
                        : p.status === 'In Review'
                        ? 'pending'
                        : 'processing'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REQUEST PAYOUT MODAL */}
      {requestModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Request On-Demand Escrow Disbursement</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setRequestModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit}>
              <div className="seller-modal-body">
                <div style={{ background: 'var(--seller-cream)', padding: '14px', borderRadius: 'var(--seller-radius)', marginBottom: '18px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--seller-muted)', display: 'block' }}>
                    Maximum Available Balance:
                  </span>
                  <strong style={{ fontSize: '20px', color: 'var(--seller-gold-dark)' }}>
                    ₹{availableBalance.toFixed(2)}
                  </strong>
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Withdrawal Amount (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={availableBalance}
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder={`e.g. ${availableBalance.toFixed(2)}`}
                    className="seller-input"
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Beneficiary Account</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="seller-select"
                  >
                    <option value="HDFC Bank">HDFC Bank (•••• 4091) — Preferred</option>
                    <option value="ICICI Bank">ICICI Bank Corporate (•••• 8820)</option>
                  </select>
                </div>

                <small style={{ display: 'block', fontSize: '11.5px', color: 'var(--seller-muted)' }}>
                  Funds are transferred via instant NEFT/RTGS after automated compliance verification.
                </small>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-seller-gold">
                  Confirm Wire Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

