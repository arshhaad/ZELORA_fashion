import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Percent, CheckCircle, ShieldCheck, DollarSign, Store } from 'lucide-react';

export default function AdminCommissionsPage() {
  const { platformSettings, saveSettings, shops } = useAdmin();
  const [rate, setRate] = useState(platformSettings.default_commission_rate || 12.5);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSettings({ default_commission_rate: parseFloat(rate) });
    setSavedMsg('Platform default commission rate updated successfully.');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  return (
    <AdminLayout
      title="Commission Structure & Fee Policies"
      subtitle="Configure platform marketplace fees, vendor commission schedules, and category margins."
    >
      {savedMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(48, 164, 108, 0.15)',
          border: '1px solid #30A46C',
          borderRadius: '6px',
          color: '#30A46C',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="admin-grid-split-rev">
        {/* Left: Global Platform Default Commission */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Default Platform Commission</h3>
          </div>
          <form onSubmit={handleSave}>
            <p style={{ fontSize: '13px', color: '#9E9EA8', lineHeight: 1.5, marginBottom: '18px' }}>
              This fee is automatically deducted from every settled vendor transaction unless a custom agreement applies to the boutique atelier.
            </p>

            <div className="admin-input-group">
              <label className="admin-label">Platform Take Rate (%)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="admin-input"
                  style={{ fontSize: '18px', fontWeight: 700, paddingRight: '40px' }}
                  required
                />
                <Percent size={18} color="#C6A664" style={{ position: 'absolute', right: '14px', top: '12px' }} />
              </div>
            </div>

            <button type="submit" className="btn-admin-gold" style={{ width: '100%', justifyContent: 'center' }}>
              Save Global Commission
            </button>
          </form>
        </div>

        {/* Right: Boutique Atelier Agreements */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Boutique Atelier Rate Agreements</h3>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Boutique Atelier</th>
                  <th>Category</th>
                  <th>Agreement Tier</th>
                  <th style={{ textAlign: 'right' }}>Applied Rate</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Store size={14} color="#C6A664" />
                        <strong style={{ color: '#F6F6F9' }}>{shop.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#9E9EA8' }}>{shop.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#C6A664', fontWeight: 600 }}>
                        {shop.commission_rate === 12.5 ? 'Standard Tier' : 'Bespoke Margin'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '14px', color: '#F6F6F9' }}>{shop.commission_rate}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

