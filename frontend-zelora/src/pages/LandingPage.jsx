import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import '../components/landing/landing.css';

export default function LandingPage() {
  return (
    <div className="zelora-landing">
      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <main>
        <HeroSection />
      </main>

      {/* 3. Features Section */}
      <FeaturesSection />

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

