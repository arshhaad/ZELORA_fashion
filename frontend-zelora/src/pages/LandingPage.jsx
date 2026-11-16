import { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import InstallAppModal from '../components/common/InstallAppModal';
import '../components/landing/landing.css';

export default function LandingPage() {
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  return (
    <div className="zelora-landing">
      {/* 1. Navbar */}
      <LandingNavbar onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      {/* 2. Hero Section */}
      <main>
        <HeroSection onOpenInstallModal={() => setIsInstallModalOpen(true)} />
      </main>

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 4. Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Minimal Bottom Bar */}
      <footer className="zelora-footer-minimal">
        <div className="zelora-footer-container">
          <span className="footer-brand">ZELORA</span>
          <p>© {new Date().getFullYear()} ZELORA Fashion. All rights reserved.</p>
          <div className="footer-nav">
            <Link to="/products">Collections</Link>
            <Link to="/about">About</Link>
            <button
              type="button"
              className="footer-install-link"
              onClick={() => setIsInstallModalOpen(true)}
              style={{ background: 'none', border: 'none', color: '#c5a059', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
              Install App
            </button>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Sign Up</Link>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

