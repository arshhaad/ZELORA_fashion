import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/products';
import { ArrowUpRight } from 'lucide-react';

export default function ShopByCategory() {
  return (
    <section className="zelora-section category-section">
      <div className="section-header-wrap">
        <div>
          <span className="section-pretitle">CURATED CATALOG</span>
          <h2 className="section-main-title">Shop by Category</h2>
        </div>
        <Link to="/products" className="section-view-all-btn">
          <span>View All Collections</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="category-card"
          >
            <div className="category-image-wrap">
              <img
                src={cat.image}
                alt={cat.name}
                className="category-card-img"
                loading="lazy"
              />
              <div className="category-overlay" />
            </div>

            <div className="category-content">
              <span className="category-count">{cat.itemCount} PIECES</span>
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-desc">{cat.description}</p>
              <span className="category-explore-link">
                Explore Category <ArrowUpRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

