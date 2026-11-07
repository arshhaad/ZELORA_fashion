import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import heroEditorialImg from '../../assets/hero-editorial.jpg';

export default function HeroSection() {
  return (
    <section className="zelora-hero">
      <div className="zelora-hero-container">
        {/* Left Side: Editorial Typography & Call To Actions */}
        <div className="zelora-hero-content">
          <span className="hero-tagline">FASHION FOR EVERY YOU</span>
          
          <h1 className="hero-title">
            Style That<br />
            Defines You
          </h1>
          
          <p className="hero-description">
            Discover timeless and trendy outfits at ZELORA. Premium quality, modern designs, for every occasion.
          </p>
          
          <div className="hero-cta-group">
            <Link to="/products" className="btn-hero-primary">
              <span>Shop Now</span>
              <ArrowRight size={18} />
            </Link>
            
            <Link to="/products" className="btn-hero-secondary">
              Explore Collections
            </Link>
          </div>
        </div>

        {/* Right Side: Editorial Fashion Photography */}
        <div className="zelora-hero-visual">
          <div className="hero-image-wrapper">
            <img
              src={heroEditorialImg}
              alt="ZELORA Premium Fashion Editorial Models"
              className="hero-editorial-img"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
