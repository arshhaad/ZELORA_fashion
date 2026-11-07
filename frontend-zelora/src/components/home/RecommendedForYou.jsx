import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { PRODUCTS } from '../../data/products';
import { ArrowRight } from 'lucide-react';

export default function RecommendedForYou() {
  const recommended = PRODUCTS.filter((p) => p.isRecommended).slice(0, 4);

  return (
    <section className="zelora-section">
      <div className="section-header-wrap">
        <div>
          <span className="section-pretitle">PERSONALIZED EDITORIAL</span>
          <h2 className="section-main-title">Recommended For You</h2>
        </div>
        <Link to="/products" className="section-view-all-btn">
          <span>View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="product-grid-4">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

