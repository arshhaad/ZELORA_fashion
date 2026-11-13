import { useState, useEffect } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Wallet,
  Download,
  Building2,
  CheckCircle,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';

const LEGACY_DEMO_HOLDERS = ["Maison de L'Ombre Couture LLP", "HDFC Bank Ltd."];

export default function PayoutsPage() {
  const { payouts, requestPayout, totalEarnings, seller, shop, showToast } = useSeller();

  const bankStorageKey = `zelora_seller_bank_${seller?.id || 'default'}`;

  const [bankAccount, setBankAccount] = useState(() => {
    try {
      const saved = localStorage.getItem(bankStorageKey);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && LEGACY_DEMO_HOLDERS.includes(parsed.account_holder)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(bankStorageKey);
      setBankAccount(saved ? JSON.parse(saved) : null);
    } catch {
      setBankAccount(null);
    }
  }, [bankStorageKey]);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc: '',
  });

  // Computed Payout Metrics
  const totalPaidOut = payouts
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBalance = payouts
    .filter((p) => p.status === 'In Review' || p.status === 'Processing')
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = Math.max(0, totalEarnings - totalPaidOut - pendingBalance);

  const handleOpenBankModal = () => {
    setBankForm({
      bank_name: bankAccount?.bank_name || '',
      account_holder: bankAccount?.account_holder || shop?.name || seller?.name || '',
      account_number: bankAccount?.raw_account_number || '',
      ifsc: bankAccount?.ifsc || '',
    });
    setBankModalOpen(true);
  };

  const handleBankSave = (e) => {
    e.preventDefault();
    const digits = bankForm.account_number.replace(/\s+/g, '');
    const masked = digits.length >= 4
      ? `•••• •••• •••• ${digits.slice(-4)}`
      : digits;
    const nextBank = {
      bank_name: bankForm.bank_name.trim(),
      account_holder: bankForm.account_holder.trim(),
      account_number: masked,
      raw_account_number: digits,
      ifsc: bankForm.ifsc.trim().toUpperCase(),
    };
    setBankAccount(nextBank);
    try {
      localStorage.setItem(bankStorageKey, JSON.stringify(nextBank));
    } catch {
      // Ignore storage errors
    }
    setBankModalOpen(false);
    showToast('Settlement bank account saved.');
  };

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    if (!bankAccount) {
      alert('Please configure your settlement bank account first.');
      return;
    }
    if (parseFloat(requestAmount) > 0 && parseFloat(requestAmount) <= availableBalance) {
      requestPayout(requestAmount, { bank_name: bankAccount.bank_name });
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
            disabled={payouts.length === 0}
          >
            <Download size={15} />
            <span>Download Statement</span>
          </button>
          <button
            type="button"
            className="btn-seller-gold"
            onClick={() => setRequestModalOpen(true)}
            disabled={availableBalance <= 0 || !bankAccount}
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
          <span className="stat-subtext">88% net boutique share</span>
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
          <span className="stat-subtext">Disbursed via bank transfer</span>
        </div>
      </div>

      {/* BANK ACCOUNT & ESCROW SCHEDULE ROW */}
      <div className="seller-payouts-grid">
        {/* Settlement Bank Account Card */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="var(--seller-espresso)" />
              <h3 style={{ margin: 0 }}>Designated Settlement Account</h3>
            </div>
            {bankAccount ? (
              <button type="button" className="btn-seller-secondary btn-seller-sm" onClick={handleOpenBankModal}>
                Edit Bank Details
              </button>
            ) : (
              <span className="status-pill pending">Not Configured</span>
            )}
          </div>

          {bankAccount ? (
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
                  SETTLEMENT BENEFICIARY
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
          ) : (
            <div
              style={{
                padding: '24px',
                borderRadius: 'var(--seller-radius)',
                background: 'var(--seller-cream-subtle)',
                border: '1px dashed var(--seller-border)',
                textAlign: 'center',
                marginBottom: '16px',
              }}
            >
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--seller-muted)' }}>
                No settlement bank account linked yet. Add your bank details to request payouts.
              </p>
              <button type="button" className="btn-seller-gold" onClick={handleOpenBankModal}>
                Add Bank Account
              </button>
            </div>
          )}

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--seller-muted)', lineHeight: 1.4 }}>
            Bank account changes require verification before payouts are initiated.
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
                  Orders delivered and past the 7-day exchange window are automatically settled every alternate Thursday.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--seller-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Zero Withdrawal Surcharges</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--seller-muted)', fontSize: '12px' }}>
                  ZELORA covers standard RTGS/NEFT banking settlement fees.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--seller-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>On-Demand Payout Request</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--seller-muted)', fontSize: '12px' }}>
                  Request on-demand wire transfers for cleared earnings with 24-hour review.
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
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--seller-muted)' }}>
                  No payout disbursements recorded yet.
                </td>
              </tr>
            ) : (
              payouts.map((p) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* BANK DETAILS MODAL */}
      {bankModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Configure Settlement Bank Account</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setBankModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBankSave}>
              <div className="seller-modal-body">
                <div className="seller-form-group">
                  <label className="seller-form-label">Bank Name *</label>
                  <input
                    type="text"
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="seller-input"
                    required
                  />
                </div>
                <div className="seller-form-group">
                  <label className="seller-form-label">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bankForm.account_holder}
                    onChange={(e) => setBankForm({ ...bankForm, account_holder: e.target.value })}
                    placeholder="Business or owner full name"
                    className="seller-input"
                    required
                  />
                </div>
                <div className="seller-form-group">
                  <label className="seller-form-label">Account Number *</label>
                  <input
                    type="text"
                    value={bankForm.account_number}
                    onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                    placeholder="Enter bank account number"
                    className="seller-input"
                    required
                  />
                </div>
                <div className="seller-form-group">
                  <label className="seller-form-label">IFSC Code *</label>
                  <input
                    type="text"
                    value={bankForm.ifsc}
                    onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    className="seller-input"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setBankModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-seller-gold">
                  Save Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST PAYOUT MODAL */}
      {requestModalOpen && bankAccount && (
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
                  <input
                    type="text"
                    value={`${bankAccount.bank_name} (${bankAccount.account_number})`}
                    disabled
                    className="seller-input"
                  />
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
