import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="zelora-main-footer" id="about">
      <div className="footer-top-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-brand-logo">
            ZELORA
          </Link>
          <p className="footer-tagline">
            Modern, monochrome editorial luxury fashion designed for longevity, architectural form, and effortless presence.
          </p>
          <div className="footer-social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-pill">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="social-pill">Pinterest</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-pill">Twitter</a>
          </div>
        </div>

        {/* Collections Links */}
        <div className="footer-col">
          <h4 className="footer-heading">COLLECTIONS</h4>
          <ul className="footer-link-list">
            <li><Link to="/products?category=outerwear">Outerwear & Coats</Link></li>
            <li><Link to="/products?category=dresses">Dresses & Gowns</Link></li>
            <li><Link to="/products?category=tops">Tops & Shirts</Link></li>
            <li><Link to="/products?category=trousers">Tailored Trousers</Link></li>
            <li><Link to="/products?category=knitwear">Cashmere & Knitwear</Link></li>
            <li><Link to="/products?category=accessories">Leather Accessories</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-col">
          <h4 className="footer-heading">CUSTOMER SERVICE</h4>
          <ul className="footer-link-list">
            <li><Link to="/about">About ZELORA</Link></li>
            <li><Link to="/cart">Shopping Bag</Link></li>
            <li><Link to="/wishlist">My Wishlist</Link></li>
            <li><a href="#shipping" onClick={(e) => e.preventDefault()}>Shipping & Logistics</a></li>
            <li><a href="#returns" onClick={(e) => e.preventDefault()}>30-Day Returns</a></li>
            <li><a href="#size-guide" onClick={(e) => e.preventDefault()}>Garment Size Guide</a></li>
            <li><a href="#concierge" onClick={(e) => e.preventDefault()}>Concierge Assistance</a></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-heading">JOIN THE MONOCHROME CIRCLE</h4>
          <p className="newsletter-desc">
            Subscribe for exclusive runway previews, private archive sales, and bespoke fashion editorial.
          </p>

          {subscribed ? (
            <div className="newsletter-success">
              <Check size={18} />
              <span>You have joined the private list. Welcome to ZELORA.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          <div className="store-locations-note">
            <span>Flagship Studios: Paris • Milan • New York • Tokyo • London</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <p className="copyright-text">
          © {new Date().getFullYear()} ZELORA Atelier Inc. All rights reserved. Strictly Black & White Aesthetic.
        </p>
        <div className="footer-legal-links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <a href="#cookies" onClick={(e) => e.preventDefault()}>Cookie Preferences</a>
          <a href="#accessibility" onClick={(e) => e.preventDefault()}>Accessibility</a>
        </div>
      </div>
    </footer>
  );
}

