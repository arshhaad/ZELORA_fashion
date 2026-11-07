import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import { ArrowRight, Sparkles, Feather, ShieldCheck, HeartHandshake, Compass, Gem } from 'lucide-react';
import heroEditorialImg from '../assets/hero-editorial.jpg';

export default function AboutPage() {
  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="zelora-about-main">
        {/* Editorial Hero Banner */}
        <section className="about-hero-section">
          <div className="about-hero-container">
            <span className="about-pretitle">THE ARCHITECTURE OF REFINEMENT</span>
            <h1 className="about-main-title">
              Crafted for Longevity.<br />Designed for Presence.
            </h1>
            <p className="about-lead-text">
              ZELORA is an elevated fashion marketplace bridging discerning connoisseurs with hand-selected independent ateliers, master tailors, and luxury fashion houses across the globe.
            </p>
          </div>
        </section>

        {/* Brand Narrative Section with Editorial Image */}
        <section className="about-narrative-section">
          <div className="about-narrative-container">
            <div className="about-image-column">
              <div className="about-image-frame">
                <img
                  src={heroEditorialImg}
                  alt="ZELORA Atelier Haute Couture Editorial"
                  className="about-editorial-img"
                />
                <div className="about-image-badge">
                  <span className="badge-year">EST. 2024</span>
                  <span className="badge-location">PARIS • MILAN • TOKYO</span>
                </div>
              </div>
            </div>

            <div className="about-text-column">
              <span className="section-label">OUR PHILOSOPHY</span>
              <h2 className="narrative-heading">
                Monochrome elegance born from intentional restraint.
              </h2>
              <div className="narrative-body">
                <p>
                  At ZELORA, we believe true luxury does not shout. It reveals itself in the quiet rustle of heavyweight mulberry silk, the sculptured lines of double-faced virgin wool, and the architectural balance of a timeless silhouette.
                </p>
                <p>
                  In an era dominated by fleeting trends and disposable garments, ZELORA stands as an antidote. We champion slow, intentional design created by independent boutique designers who pour generational mastery into every stitch.
                </p>
                <p>
                  Every collection curated on our platform undergoes rigorous inspection for textile pedigree, ethical atelier working conditions, and structural craftsmanship.
                </p>
              </div>

              <div className="about-stats-row">
                <div className="about-stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-caption">Ethically Sourced Natural Fibers</span>
                </div>
                <div className="about-stat-item">
                  <span className="stat-number">48+</span>
                  <span className="stat-caption">Verified Artisan Boutiques</span>
                </div>
                <div className="about-stat-item">
                  <span className="stat-number">30</span>
                  <span className="stat-caption">Day Concierge Return Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Four Core Values Grid */}
        <section className="about-pillars-section">
          <div className="about-pillars-container">
            <div className="pillars-header">
              <span className="section-label">THE FOUNDATION</span>
              <h2 className="pillars-main-title">The Four Pillars of ZELORA</h2>
              <p className="pillars-subtitle">
                Guiding principles that define our marketplace standard, vendor selection, and customer experience.
              </p>
            </div>

            <div className="about-pillars-grid">
              <div className="about-pillar-card">
                <div className="pillar-icon-wrap">
                  <Feather size={26} />
                </div>
                <h3>Artisanal Pedigree</h3>
                <p>
                  We partner exclusively with verified independent ateliers and designers who prioritize handcrafted precision, bespoke cutting patterns, and heritage techniques.
                </p>
              </div>

              <div className="about-pillar-card">
                <div className="pillar-icon-wrap">
                  <Compass size={26} />
                </div>
                <h3>Sustainable Craft</h3>
                <p>
                  From GOTS-certified organic cotton to circular, compostable unboxing packaging, we minimize environmental footprint without sacrificing luxury tactile quality.
                </p>
              </div>

              <div className="about-pillar-card">
                <div className="pillar-icon-wrap">
                  <Gem size={26} />
                </div>
                <h3>Curated Exclusivity</h3>
                <p>
                  Every garment is released in limited atelier quantities. We celebrate individuality and distinction over mass-produced uniformity.
                </p>
              </div>

              <div className="about-pillar-card">
                <div className="pillar-icon-wrap">
                  <ShieldCheck size={26} />
                </div>
                <h3>Concierge Care</h3>
                <p>
                  Complete buyer assurance with encrypted transactions, guaranteed delivery tracking, responsive sizing consultations, and 30-day effortless returns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Vendor Marketplace Callout */}
        <section className="about-marketplace-cta">
          <div className="about-marketplace-card">
            <div className="marketplace-cta-content">
              <span className="cta-kicker">JOIN OUR DESIGNER COLLECTIVE</span>
              <h2>Are You an Independent Fashion Atelier?</h2>
              <p>
                Showcase your creations to a global community of luxury fashion enthusiasts. Enjoy transparent commission rates, automated payouts, and comprehensive boutique management tools.
              </p>
              <div className="marketplace-cta-buttons">
                <Link to="/seller/register" className="btn-cta-primary">
                  <span>Register Your Atelier</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/products" className="btn-cta-secondary">
                  Explore Current Collections
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

