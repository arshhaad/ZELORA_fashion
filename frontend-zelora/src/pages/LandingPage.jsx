import { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import InstallAppModal from '../components/common/InstallAppModal';
import '../components/landing/landing.css';

export default function LandingPage() {
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Directly trigger native PWA install prompt if supported by browser, else open modal
  const handleOpenInstall = async () => {
    const promptEvent = window.deferredInstallPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice && choice.outcome === 'accepted') {
          window.deferredInstallPrompt = null;
          return;
        }
      } catch (err) {
        console.warn('Direct PWA prompt error:', err);
      }
    }
    setShowInstallModal(true);
  };

  return (
    <div className="zelora-landing">
      {/* 1. Navbar with small Install App button */}
      <LandingNavbar onOpenInstall={handleOpenInstall} />

      {/* 2. Hero Section */}
      <main>
        <HeroSection />
      </main>

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 4. Install App Modal (Strictly on Landing Page) */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Minimal Bottom Bar */}
      <footer className="zelora-footer-minimal">
        <div className="zelora-footer-container">
          <span className="footer-brand">ZELORA</span>
          <p>© {new Date().getFullYear()} ZELORA Fashion. All rights reserved.</p>
          <div className="footer-nav">
            <Link to="/products">Collections</Link>
            <Link to="/about">About</Link>
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

