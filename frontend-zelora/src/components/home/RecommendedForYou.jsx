import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { useLiveProducts } from '../../data/products';
import { productsApi } from '../../services/api';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function RecommendedForYou() {
  const liveProducts = useLiveProducts();
  const fallbackRecommended = liveProducts.filter((p) => p.isRecommended).slice(0, 4);
  const [recommended, setRecommended] = useState(fallbackRecommended);
  const [isRedisPowered, setIsRedisPowered] = useState(false);

  useEffect(() => {
    let active = true;
    productsApi
      .getRecommendations({ limit: 4 })
      .then((res) => {
        if (!active) return;
        if (res && Array.isArray(res.recommendations) && res.recommendations.length > 0) {
          setRecommended(res.recommendations);
          setIsRedisPowered(true);
        }
      })
      .catch(() => {
        // Fallback gracefully to client live products
      });
    return () => {
      active = false;
    };
  }, []);

  const displayList = recommended.length > 0 ? recommended : fallbackRecommended;

  return (
    <section className="zelora-section">
      <div className="section-header-wrap">
        <div>
          <span className="section-pretitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="#b69a70" />
            {isRedisPowered ? 'CURATED VIA REDIS IN-MEMORY ENGINE' : 'PERSONALIZED EDITORIAL'}
          </span>
          <h2 className="section-main-title">Recommended For You</h2>
        </div>
        <Link to="/products" className="section-view-all-btn">
          <span>View All</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="product-grid-4">
        {displayList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

