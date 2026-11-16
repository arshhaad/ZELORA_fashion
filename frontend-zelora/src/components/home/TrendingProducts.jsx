import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useLiveProducts } from '../../data/products';
import { ArrowRight } from 'lucide-react';

export default function TrendingProducts() {
  const liveProducts = useLiveProducts();
  const trending = liveProducts.filter((p) => p.isTrending).slice(0, 4);

  return (
    <section className="zelora-section">
      <div className="section-header-wrap">
        <div>
          <span className="section-pretitle">COMMUNITY FAVORITES</span>
          <h2 className="section-main-title">Trending Products</h2>
        </div>
        <Link to="/products?sort=popularity" className="section-view-all-btn">
          <span>View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="product-grid-4">
        {trending.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

