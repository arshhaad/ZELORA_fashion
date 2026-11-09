import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { HelpCircle, MessageSquare, Send, CheckCircle, Clock, AlertCircle, User, Store } from 'lucide-react';

export default function AdminSupportTicketsPage() {
  const { ticketsList, replyTicket } = useAdmin();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('in_progress');
  const [sending, setSending] = useState(false);

  const displayTickets = ticketsList.length > 0 ? ticketsList : [
    {
      id: 1,
      ticket_number: 'TKT-89421',
      user_name: 'Genevieve Laurent',
      user_email: 'genevieve@laurent.fr',
      user_type: 'customer',
      subject: 'Concierge courier pickup request for sizing exchange',
      category: 'order',
      priority: 'high',
      status: 'open',
      message: 'I would like to exchange my wool trench coat for size 40 (M). Need courier pickup at Mumbai address.',
      created_at: '2026-11-06T12:00:00Z',
      replies: [
        {
          id: 101,
          sender_name: 'Executive Concierge',
          message: 'Our concierge courier has been scheduled for tomorrow between 11 AM - 3 PM. Please ensure garments retain original security tags.',
          is_admin_reply: true,
          created_at: '2026-11-06T13:30:00Z'
        }
      ]
    },
    {
      id: 2,
      ticket_number: 'TKT-65104',
      user_name: 'Sebastian Chen',
      user_email: 'noir@zelora.luxury',
      user_type: 'seller',
      subject: 'Payout batch settlement timeline inquiry',
      category: 'payout',
      priority: 'medium',
      status: 'in_progress',
      message: 'Inquiring about our bi-weekly net payout batch transfer for orders completed last cycle.',
      created_at: '2026-11-05T15:20:00Z',
      replies: []
    }
  ];

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (selectedTicket && replyMessage.trim()) {
      setSending(true);
      await replyTicket(selectedTicket.id, replyMessage.trim(), statusUpdate);
      setSending(false);
      setReplyMessage('');
      setSelectedTicket(null);
    }
  };

  return (
    <AdminLayout
      title="Concierge & Dispute Resolution Desk"
      subtitle="Resolve customer sizing inquiries, investigate merchant support tickets, and maintain luxury service SLAs."
    >
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Requester</th>
                <th>Subject & Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Resolution</th>
              </tr>
            </thead>
            <tbody>
              {displayTickets.map((tkt) => (
                <tr key={tkt.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#C6A664' }}>
                      {tkt.ticket_number}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {tkt.user_type === 'seller' ? <Store size={13} color="#C6A664" /> : <User size={13} />}
                      <strong style={{ color: '#F6F6F9' }}>{tkt.user_name || 'Requester'}</strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9E9EA8' }}>{tkt.user_email}</span>
                  </td>

                  <td>
                    <strong style={{ fontSize: '13px', color: '#F6F6F9', display: 'block' }}>{tkt.subject}</strong>
                    <span style={{ fontSize: '11px', color: '#9E9EA8', textTransform: 'capitalize' }}>
                      Category: {tkt.category}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${tkt.priority === 'high' || tkt.priority === 'urgent' ? 'rejected' : 'pending'}`}>
                      {tkt.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill ${tkt.status}`}>
                      {tkt.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-admin-gold"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => {
                        setSelectedTicket(tkt);
                        setStatusUpdate(tkt.status);
                      }}
                    >
                      <MessageSquare size={13} />
                      Reply Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span style={{ fontSize: '11px', color: '#C6A664', fontWeight: 800 }}>
                  {selectedTicket.ticket_number} • {selectedTicket.category.toUpperCase()}
                </span>
                <h3 style={{ margin: '2px 0 0' }}>{selectedTicket.subject}</h3>
              </div>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Original Message */}
              <div style={{
                backgroundColor: '#0B0B0E',
                border: '1px solid #23232C',
                borderRadius: '8px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', color: '#9E9EA8', marginBottom: '6px' }}>
                  From: <strong>{selectedTicket.user_name}</strong> ({selectedTicket.user_email})
                </div>
                <p style={{ fontSize: '13px', color: '#F6F6F9', margin: 0, lineHeight: 1.5 }}>
                  {selectedTicket.message}
                </p>
              </div>

              {/* Replies Thread */}
              {(selectedTicket.replies || []).map((rep, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: rep.is_admin_reply ? 'rgba(198, 166, 100, 0.08)' : '#0B0B0E',
                    border: `1px solid ${rep.is_admin_reply ? 'rgba(198, 166, 100, 0.25)' : '#23232C'}`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '12px',
                    marginLeft: rep.is_admin_reply ? '24px' : '0'
                  }}
                >
                  <div style={{ fontSize: '11px', color: rep.is_admin_reply ? '#C6A664' : '#9E9EA8', fontWeight: 700, marginBottom: '4px' }}>
                    {rep.sender_name} (Concierge Support)
                  </div>
                  <p style={{ fontSize: '13px', color: '#F6F6F9', margin: 0, lineHeight: 1.5 }}>
                    {rep.message}
                  </p>
                </div>
              ))}

              {/* Reply Form */}
              <form onSubmit={handleSendReply} style={{ marginTop: '20px' }}>
                <div className="admin-input-group">
                  <label className="admin-label">Official Administrator Response</label>
                  <textarea
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type official concierge response..."
                    className="admin-textarea"
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label className="admin-label">Update Ticket Status</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="admin-select"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-admin-secondary"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-admin-gold" disabled={sending}>
                    <Send size={14} />
                    <span>{sending ? 'Sending...' : 'Dispatch Response'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

