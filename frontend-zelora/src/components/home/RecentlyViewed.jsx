import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { PRODUCTS } from '../../data/products';
import { ArrowRight, History } from 'lucide-react';

export default function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();

  // If user hasn't visited any product yet, show a curated fallback selection
  const displayItems =
    recentlyViewed && recentlyViewed.length > 0
      ? recentlyViewed.slice(0, 4)
      : PRODUCTS.slice(2, 6);

  const isRealHistory = recentlyViewed && recentlyViewed.length > 0;

  return (
    <section className="zelora-section recently-viewed-section">
      <div className="section-header-wrap">
        <div>
          <span className="section-pretitle">
            <History size={13} style={{ display: 'inline', marginRight: '4px' }} />
            {isRealHistory ? 'BASED ON YOUR BROWSING' : 'RECENT RUNWAY HIGHLIGHTS'}
          </span>
          <h2 className="section-main-title">Recently Viewed</h2>
        </div>
        <Link to="/products" className="section-view-all-btn">
          <span>View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="product-grid-4">
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

