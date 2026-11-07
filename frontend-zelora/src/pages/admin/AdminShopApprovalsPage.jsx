import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { CheckCircle, XCircle, Store, Mail, Calendar, FileText, Check, AlertCircle } from 'lucide-react';

export default function AdminShopApprovalsPage() {
  const { shops, approveShop, rejectShop } = useAdmin();
  const [rejectModalShop, setRejectModalShop] = useState(null);
  const [rejectReason, setRejectReason] = useState('Business license documentation requires re-upload.');

  const pendingShops = shops.filter((s) => s.status === 'pending');

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (rejectModalShop) {
      rejectShop(rejectModalShop.id, rejectReason);
      setRejectModalShop(null);
    }
  };

  return (
    <AdminLayout
      title="Boutique Shop Approvals"
      subtitle="Review pending merchant applications, verify luxury catalog standards, and authorize boutique onboarding."
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Pending Shop Verification Queue ({pendingShops.length})</h2>
            <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '2px 0 0' }}>
              Vendors awaiting administrator approval before products go live on ZELORA.
            </p>
          </div>
        </div>

        {pendingShops.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <CheckCircle size={40} color="#30A46C" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', color: '#F6F6F9', margin: '0 0 6px 0' }}>All Shop Applications Reviewed</h3>
            <p style={{ fontSize: '13px', color: '#9E9EA8', maxWidth: '400px', margin: '0 auto' }}>
              There are currently no outstanding merchant verification submissions.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingShops.map((shop) => (
              <div
                key={shop.id}
                style={{
                  backgroundColor: '#0B0B0E',
                  border: '1px solid #23232C',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '600px' }}>
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #23232C' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F6F6F9', margin: 0 }}>{shop.name}</h3>
                      <span className="status-pill pending">Pending Review</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '4px 0 6px' }}>
                      {shop.description}
                    </p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#9E9EA8' }}>
                      <span><strong>Category:</strong> {shop.category}</span>
                      <span><strong>Owner:</strong> {shop.owner_name} ({shop.owner_email})</span>
                      <span><strong>Submitted:</strong> {shop.created_at}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-admin-danger"
                    onClick={() => setRejectModalShop(shop)}
                  >
                    <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Reject Application
                  </button>
                  <button
                    type="button"
                    className="btn-admin-gold"
                    onClick={() => approveShop(shop.id)}
                  >
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Approve Boutique
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalShop && (
        <div className="admin-modal-backdrop" onClick={() => setRejectModalShop(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Reject Shop Application — {rejectModalShop.name}</h3>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px', color: '#9E9EA8', marginBottom: '14px' }}>
                  Provide constructive feedback explaining why the boutique application was rejected so the vendor can rectify and resubmit.
                </p>
                <div className="admin-input-group">
                  <label className="admin-label">Rejection Reason</label>
                  <textarea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="admin-textarea"
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setRejectModalShop(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

