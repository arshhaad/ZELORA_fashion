import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { PRODUCTS } from '../../data/products';
import { ArrowRight, Clock, Zap } from 'lucide-react';

export default function SpecialOffers() {
  const specialOffers = PRODUCTS.filter((p) => p.isSpecialOffer).slice(0, 4);

  // 18 hours, 45 minutes, 30 seconds countdown timer from mount
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num) => String(num).padStart(2, '0');

  return (
    <section className="zelora-section special-offers-section">
      <div className="special-offers-banner">
        <div className="offers-header-left">
          <div className="flash-badge">
            <Zap size={14} fill="#000000" />
            <span>FLASH ARCHIVE ACCESS</span>
          </div>
          <h2 className="section-main-title">Special Offers</h2>
          <p className="offers-subtitle">
            Exclusive limited-time price adjustments on premier monochrome essentials.
          </p>
        </div>

        {/* Live Countdown Timer */}
        <div className="countdown-timer-box">
          <div className="timer-label">
            <Clock size={16} />
            <span>ENDS IN:</span>
          </div>
          <div className="timer-digits-row">
            <div className="timer-block">
              <span className="digit-value">{formatDigit(timeLeft.hours)}</span>
              <span className="digit-label">HOURS</span>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-block">
              <span className="digit-value">{formatDigit(timeLeft.minutes)}</span>
              <span className="digit-label">MINS</span>
            </div>
            <span className="timer-colon">:</span>
            <div className="timer-block">
              <span className="digit-value">{formatDigit(timeLeft.seconds)}</span>
              <span className="digit-label">SECS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="product-grid-4">
        {specialOffers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="section-footer-cta">
        <Link to="/products?filter=offers" className="btn-secondary-wide">
          <span>Explore All Special Offers</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

