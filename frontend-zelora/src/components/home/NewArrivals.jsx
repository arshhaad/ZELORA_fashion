import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { PRODUCTS } from '../../data/products';
import { ArrowRight } from 'lucide-react';

export default function NewArrivals() {
  const newProducts = PRODUCTS.filter((p) => p.isNew).slice(0, 4);

  return (
    <section className="zelora-section">
      <div className="section-header-wrap">
        <div>
          <span className="section-pretitle">JUST LANDED</span>
          <h2 className="section-main-title">New Arrivals</h2>
        </div>
        <Link to="/products?sort=newest" className="section-view-all-btn">
          <span>View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="product-grid-4">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

