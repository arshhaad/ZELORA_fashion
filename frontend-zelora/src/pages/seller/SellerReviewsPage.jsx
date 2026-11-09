import { useState, useMemo } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Star,
  Search,
  MessageSquare,
  CheckCircle,
  Filter,
  Send,
  X,
  Award,
} from 'lucide-react';

export default function SellerReviewsPage() {
  const { reviews, replyToReview } = useSeller();

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All'); // 'All', '5', '4', '3', '2', '1'
  const [activeReplyReview, setActiveReplyReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesSearch =
        searchTerm === '' ||
        rev.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rev.comment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
        ratingFilter === 'All' || rev.rating.toString() === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  // Average Rating
  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const handleOpenReplyModal = (rev) => {
    setActiveReplyReview(rev);
    setReplyText(rev.reply || '');
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (activeReplyReview && replyText.trim()) {
      replyToReview(activeReplyReview.id, replyText.trim());
      setActiveReplyReview(null);
      setReplyText('');
    }
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Customer Reviews & Brand Reputation</h1>
          <p className="seller-page-subtitle">
            Engage with verified patrons, view feedback on fit & fabric quality, and reply to testimonials.
          </p>
        </div>
      </div>

      {/* RATING SUMMARY BANNER */}
      <div
        className="seller-card mb-24"
        style={{
          background: 'linear-gradient(135deg, var(--seller-espresso) 0%, var(--seller-espresso-dark) 100%)',
          color: 'var(--seller-white)',
          padding: '24px 32px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '48px', fontWeight: 900, margin: 0, color: 'var(--seller-gold-light)', lineHeight: 1 }}>
                {avgRating}
              </h2>
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', margin: '6px 0 2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} color="var(--seller-gold)" fill="var(--seller-gold)" />
                ))}
              </div>
              <small style={{ fontSize: '11px', color: 'rgba(232, 222, 209, 0.6)' }}>
                Overall Atelier Rating
              </small>
            </div>

            <div style={{ borderLeft: '1px solid rgba(232, 222, 209, 0.2)', paddingLeft: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award size={18} color="var(--seller-gold)" />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--seller-gold-light)' }}>
                  ZELORA Premier Atelier Verification
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(232, 222, 209, 0.75)', maxWidth: '420px', lineHeight: 1.4 }}>
                100% of reviews are collected from verified clients who completed purchases through our secure gateway.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13px', color: 'var(--seller-gold-light)', display: 'block' }}>
              Total Verified Reviews:
            </span>
            <strong style={{ fontSize: '24px', color: '#fff' }}>
              {reviews.length}
            </strong>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="seller-card mb-24" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div className="seller-filter-search-box">
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--seller-muted)' }} />
            <input
              type="text"
              placeholder="Search by customer name, garment, or feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="seller-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', '5', '4', '3', '2', '1'].map((r) => (
              <button
                key={r}
                type="button"
                style={{
                  border: '1px solid var(--seller-border)',
                  background: ratingFilter === r ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: ratingFilter === r ? 'var(--seller-white)' : 'var(--seller-dark-text)',
                  padding: '7px 12px',
                  borderRadius: 'var(--seller-radius)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'var(--seller-transition)',
                }}
                onClick={() => setRatingFilter(r)}
              >
                {r === 'All' ? 'All Ratings' : `${r} ★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredReviews.length === 0 ? (
          <div className="seller-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ margin: 0, color: 'var(--seller-muted)' }}>No customer reviews matched your search.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="seller-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={rev.product_image}
                    alt={rev.product_name}
                    style={{
                      width: '48px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: 'var(--seller-radius-sm)',
                      border: '1px solid var(--seller-border)',
                    }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 3px', fontSize: '14.5px', color: 'var(--seller-espresso)' }}>
                      {rev.customer_name}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--seller-gold-dark)', fontWeight: 600 }}>
                      Piece: {rev.product_name}
                    </span>
                    <small style={{ display: 'block', color: 'var(--seller-muted)', fontSize: '11px', marginTop: '2px' }}>
                      Reviewed on {rev.date} • Verified Purchase
                    </small>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        color="var(--seller-gold)"
                        fill={i < rev.rating ? 'var(--seller-gold)' : 'none'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--seller-muted)' }}>
                    Rating: {rev.rating} of 5.0
                  </span>
                </div>
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: 'var(--seller-dark-text)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{rev.comment}"
              </p>

              {/* Atelier Official Reply */}
              {rev.reply ? (
                <div
                  style={{
                    backgroundColor: 'var(--seller-cream)',
                    borderLeft: '3px solid var(--seller-gold)',
                    borderRadius: '0 var(--seller-radius) var(--seller-radius) 0',
                    padding: '12px 16px',
                    marginBottom: '12px',
                  }}
                >
                  <strong style={{ fontSize: '12px', color: 'var(--seller-espresso)', display: 'block', marginBottom: '4px' }}>
                    Official Atelier Response:
                  </strong>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--seller-dark-text)', lineHeight: 1.4 }}>
                    {rev.reply}
                  </p>
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-seller-secondary btn-seller-sm"
                  onClick={() => handleOpenReplyModal(rev)}
                >
                  <MessageSquare size={13} />
                  <span>{rev.reply ? 'Edit Official Reply' : 'Reply to Customer'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {activeReplyReview && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Reply to {activeReplyReview.customer_name}</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setActiveReplyReview(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendReply}>
              <div className="seller-modal-body">
                <div style={{ background: 'var(--seller-cream)', padding: '12px 16px', borderRadius: 'var(--seller-radius)', marginBottom: '16px' }}>
                  <small style={{ color: 'var(--seller-muted)', display: 'block' }}>Client Review:</small>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                    "{activeReplyReview.comment}"
                  </p>
                </div>

                <div className="seller-form-group">
                  <label className="seller-form-label">Your Atelier Reply *</label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a warm, gracious response addressing the client's comments..."
                    className="seller-textarea"
                    required
                  />
                  <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: 'var(--seller-muted)' }}>
                    Your reply will be displayed publicly beneath this review on the product details page.
                  </small>
                </div>
              </div>

              <div className="seller-modal-footer">
                <button
                  type="button"
                  className="btn-seller-secondary"
                  onClick={() => setActiveReplyReview(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-seller-gold">
                  <Send size={15} /> Publish Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

