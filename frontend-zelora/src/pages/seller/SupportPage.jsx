import { useState } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Paperclip,
  X,
  AlertCircle,
} from 'lucide-react';

export default function SupportPage() {
  const { tickets, createSupportTicket, replySupportTicket, seller } = useSeller();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [replyInput, setReplyInput] = useState('');

  const [newTicketForm, setNewTicketForm] = useState({
    category: 'Logistics & Packaging',
    subject: '',
    problem_description: '',
  });

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newTicketForm.subject && newTicketForm.problem_description) {
      const created = createSupportTicket(newTicketForm);
      setSelectedTicketId(created.id);
      setCreateModalOpen(false);
      setNewTicketForm({
        category: 'Logistics & Packaging',
        subject: '',
        problem_description: '',
      });
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (replyInput.trim() && selectedTicket) {
      replySupportTicket(selectedTicket.id, replyInput.trim());
      setReplyInput('');
    }
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Concierge Support Center</h1>
          <p className="seller-page-subtitle">
            Direct priority assistance with logistics, bespoke catalog listings, payment reconciliation, and promotions.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-gold"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus size={16} />
          <span>New Support Inquiry</span>
        </button>
      </div>

      <div className="seller-support-grid">
        {/* Left Column: Tickets List */}
        <div className="seller-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--seller-border)', background: 'var(--seller-cream)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--seller-espresso)' }}>
              Active Concierge Cases ({tickets.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--seller-border)',
                  cursor: 'pointer',
                  backgroundColor: selectedTicket?.id === t.id ? 'var(--seller-cream-subtle)' : 'var(--seller-white)',
                  borderLeft: selectedTicket?.id === t.id ? '4px solid var(--seller-gold)' : '4px solid transparent',
                  transition: 'var(--seller-transition)',
                }}
                onClick={() => setSelectedTicketId(t.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--seller-muted)' }}>
                    {t.id}
                  </span>
                  <span
                    className={`status-pill ${
                      t.status === 'Open'
                        ? 'open'
                        : t.status === 'Resolved'
                        ? 'resolved'
                        : 'processing'
                    }`}
                    style={{ fontSize: '10px' }}
                  >
                    {t.status}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 4px', fontSize: '13.5px', color: 'var(--seller-espresso)', lineHeight: 1.3 }}>
                  {t.subject}
                </h4>

                <span style={{ fontSize: '11px', color: 'var(--seller-gold-dark)', fontWeight: 600 }}>
                  {t.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Ticket Conversation Thread */}
        {selectedTicket ? (
          <div className="seller-card" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: 0, overflow: 'hidden' }}>
            {/* Ticket Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--seller-border)', background: 'var(--seller-cream)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--seller-muted)' }}>
                  {selectedTicket.id}
                </span>
                <span
                  className={`status-pill ${
                    selectedTicket.status === 'Open'
                      ? 'open'
                      : selectedTicket.status === 'Resolved'
                      ? 'resolved'
                      : 'processing'
                  }`}
                >
                  {selectedTicket.status}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--seller-espresso)' }}>
                {selectedTicket.subject}
              </h3>

              <small style={{ color: 'var(--seller-muted)', fontSize: '12px' }}>
                Category: <strong>{selectedTicket.category}</strong> • Opened on{' '}
                {new Date(selectedTicket.created_at).toLocaleDateString()}
              </small>
            </div>

            {/* Conversation Messages Thread */}
            <div
              style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'var(--seller-cream-subtle)',
              }}
            >
              {selectedTicket.messages?.map((msg, idx) => {
                const isSeller = msg.sender.includes('Seller') || msg.sender.includes(seller.name);

                return (
                  <div
                    key={idx}
                    style={{
                      maxWidth: '78%',
                      alignSelf: isSeller ? 'flex-end' : 'flex-start',
                      backgroundColor: isSeller ? 'var(--seller-espresso)' : 'var(--seller-white)',
                      color: isSeller ? 'var(--seller-white)' : 'var(--seller-dark-text)',
                      padding: '14px 18px',
                      borderRadius: isSeller
                        ? 'var(--seller-radius) var(--seller-radius) 0 var(--seller-radius)'
                        : 'var(--seller-radius) var(--seller-radius) var(--seller-radius) 0',
                      boxShadow: 'var(--seller-shadow-sm)',
                      border: isSeller ? 'none' : '1px solid var(--seller-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '4px',
                        fontSize: '11px',
                        color: isSeller ? 'var(--seller-gold-light)' : 'var(--seller-muted)',
                        fontWeight: 700,
                      }}
                    >
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45 }}>
                      {msg.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer */}
            <form
              onSubmit={handleSendReply}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--seller-border)',
                background: 'var(--seller-white)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Type your reply to ZELORA Concierge..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className="seller-input"
                style={{ flex: 1 }}
              />

              <button type="submit" className="btn-seller-gold" style={{ padding: '11px 18px' }}>
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="seller-card" style={{ textAlign: 'center', padding: '60px' }}>
            <p>Select a support case from the left to view the correspondence.</p>
          </div>
        )}
      </div>

      {/* CREATE SUPPORT TICKET MODAL */}
      {createModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Open Concierge Support Ticket</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setCreateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="seller-modal-body">
                <div className="seller-form-group">
                  <label className="seller-form-label">Issue Category *</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="seller-select"
                  >
                    <option value="Logistics & Packaging">Logistics & Express Packaging</option>
                    <option value="Payment & Settlement">Payment, Escrow & Wire Reconciliation</option>
                    <option value="Product Approval & Catalog">Garment Approval & Catalog Assistance</option>
                    <option value="Marketing & Featured Collections">Homepage Runway & Editorial Inclusion</option>
                    <option value="Platform Technical">Platform Technical or Account Setting</option>
                  </select>
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Inquiry Subject *</label>
                  <input
                    type="text"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    placeholder="Brief summary of inquiry..."
                    className="seller-input"
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Detailed Description *</label>
                  <textarea
                    rows={4}
                    value={newTicketForm.problem_description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, problem_description: e.target.value })}
                    placeholder="Provide relevant details, order references, SKU numbers, or timeline requirements..."
                    className="seller-textarea"
                    required
                  />
                </div>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-seller-gold">
                  Submit Case to Concierge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

