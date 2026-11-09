import { useState } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Layers,
  ArrowRight,
  Plus,
  ShieldAlert,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function CategoriesPage() {
  const { products } = useSeller();
  const [searchTerm, setSearchTerm] = useState('');

  const platformCategories = [
    {
      id: 'cat-dresses',
      name: 'Dresses',
      gender: 'Women',
      description: 'Evening slip gowns, cocktail dresses, column silhouettes and bespoke gala wear.',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-men',
      name: 'Men',
      gender: 'Men',
      description: 'Double-breasted trench coats, architectural overcoats, and tailored blazers.',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-women',
      name: 'Women',
      gender: 'Women',
      description: 'Pleated wool flannel trousers, structured skirts, and silk separates.',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-shirts',
      name: 'Shirts',
      gender: 'Unisex',
      description: 'Cashmere cocoon knits, poplin tailoring, and silk crepe blouses.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-tshirts',
      name: 'T-Shirts',
      gender: 'Unisex',
      description: 'Heavyweight organic Supima cotton tees and minimal foundational layers.',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-jeans',
      name: 'Jeans',
      gender: 'Unisex',
      description: 'Japanese selvedge raw denim, straight-leg cuts, and luxury rinses.',
      image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-shoes',
      name: 'Shoes',
      gender: 'Unisex',
      description: 'Blake-stitched Italian leather ankle boots, pointed pumps, and minimal loafers.',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
    {
      id: 'cat-accessories',
      name: 'Accessories',
      gender: 'Unisex',
      description: 'Full-grain leather belts, silk twill foulards, and minimal jewelry accents.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80&sat=-100',
    },
  ];

  const filtered = platformCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Platform Apparel Categories</h1>
          <p className="seller-page-subtitle">
            Browse official ZELORA fashion taxonomies and view your atelier's pieces mapped to each division.
          </p>
        </div>

        <Link to="/seller/products/add" className="btn-seller-gold">
          <Plus size={16} />
          <span>Upload New Garment</span>
        </Link>
      </div>

      {/* Admin Notice Banner */}
      <div
        style={{
          background: 'var(--seller-beige-light)',
          border: '1px solid var(--seller-border)',
          borderRadius: 'var(--seller-radius)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <ShieldAlert size={22} color="var(--seller-gold-dark)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', color: 'var(--seller-dark-text)' }}>
          <strong>Centralized Fashion Taxonomy:</strong> Global platform category creation and hierarchy is maintained strictly by ZELORA Editorial Directors to preserve curated marketplace aesthetics. Sellers select categories when publishing garments.
        </div>
      </div>

      {/* Search Bar */}
      <div className="seller-card mb-24" style={{ padding: '14px 20px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--seller-muted)' }} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="seller-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="seller-categories-grid">
        {filtered.map((cat) => {
          const productCount = products.filter((p) => p.category === cat.name).length;

          return (
            <div key={cat.id} className="seller-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '140px', backgroundColor: 'var(--seller-espresso)' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--seller-espresso)',
                    color: 'var(--seller-white)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {productCount} piece{productCount !== 1 ? 's' : ''} in your shop
                </div>
              </div>

              <div style={{ padding: '18px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--seller-espresso)' }}>
                  {cat.name}
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: 'var(--seller-muted)', lineHeight: 1.4 }}>
                  {cat.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--seller-border)', paddingTop: '12px' }}>
                  <Link
                    to={`/seller/products?search=${cat.name}`}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--seller-espresso)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    View Catalog Pieces <ArrowRight size={13} />
                  </Link>

                  <Link
                    to="/seller/products/add"
                    className="btn-seller-secondary btn-seller-sm"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    <Plus size={12} /> Add Here
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SellerLayout>
  );
}

