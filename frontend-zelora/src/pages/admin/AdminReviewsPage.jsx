import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Star, CheckCircle, Ban, Trash2, Eye } from 'lucide-react';

export default function AdminReviewsPage() {
  const { reviewsList, moderateReview } = useAdmin();
  const [filter, setFilter] = useState('all');

  const displayReviews = reviewsList.length > 0 ? reviewsList : [
    {
      id: 1,
      user_name: 'Genevieve Laurent',
      user_email: 'genevieve@laurent.fr',
      product_name: 'Structured Double-Breasted Wool Overcoat',
      shop_name: 'ZELORA Atelier',
      rating: 5,
      title: 'Impeccable tailoring and supreme wool quality',
      comment: 'The silhouette and heavy gauge drape exceeded all expectations. Exceptional luxury packaging.',
      status: 'approved',
      created_at: '2026-11-06'
    },
    {
      id: 2,
      user_name: 'Camilla Hayes',
      user_email: 'camilla.hayes@manhattan.com',
      product_name: 'Silk Crepe Minimalist Slip Dress',
      shop_name: 'Noir Studio',
      rating: 4,
      title: 'Subtle luster and fluid drape',
      comment: 'True to size, stunning monochrome drape. Arrived carefully wrapped in garment dustbag.',
      status: 'pending',
      created_at: '2026-11-05'
    },
    {
      id: 3,
      user_name: 'Vikram Malhotra',
      user_email: 'vikram.m@malhotragroup.in',
      product_name: 'Pleated Wool Wide-Leg Trousers',
      shop_name: 'Linen & Silk Milano',
      rating: 2,
      title: 'Waist sizing ran smaller than guide',
      comment: 'Material is phenomenal but sizing required exchange through concierge.',
      status: 'flagged',
      created_at: '2026-11-03'
    }
  ];

  const filtered = displayReviews.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <AdminLayout
      title="Customer Review Moderation"
      subtitle="Safeguard luxury brand reputation, moderate client evaluations, and investigate flagged feedback."
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'approved', 'pending', 'flagged'].map((st) => (
              <button
                key={st}
                type="button"
                className={filter === st ? 'btn-admin-gold' : 'btn-admin-secondary'}
                onClick={() => setFilter(st)}
                style={{ textTransform: 'capitalize', padding: '6px 14px' }}
              >
                {st} Reviews
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer & Garment</th>
                <th>Evaluation</th>
                <th>Boutique</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Moderation Decision</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rev) => (
                <tr key={rev.id}>
                  <td>
                    <strong style={{ color: '#F6F6F9', display: 'block' }}>{rev.product_name}</strong>
                    <span style={{ fontSize: '11px', color: '#9E9EA8' }}>
                      By {rev.user_name} ({rev.user_email})
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? '#F5A623' : 'transparent'}
                          color={i < rev.rating ? '#F5A623' : '#71717A'}
                        />
                      ))}
                    </div>
                    <strong style={{ fontSize: '12px', color: '#F6F6F9', display: 'block' }}>{rev.title}</strong>
                    <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '2px 0 0' }}>"{rev.comment}"</p>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#C6A664', fontWeight: 600 }}>{rev.shop_name}</span>
                  </td>

                  <td>
                    <span className={`status-pill ${rev.status}`}>
                      {rev.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {rev.status !== 'approved' && (
                        <button
                          type="button"
                          className="btn-admin-success"
                          onClick={() => moderateReview(rev.id, 'approved')}
                        >
                          <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Publish
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          type="button"
                          className="btn-admin-danger"
                          onClick={() => moderateReview(rev.id, 'rejected')}
                        >
                          <Ban size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Hide
                        </button>
                      )}
                    </div>
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

