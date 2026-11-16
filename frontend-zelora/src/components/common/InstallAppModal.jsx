import React, { useState, useEffect } from 'react';
import { Smartphone, Download, QrCode, X, Check, Copy, Sparkles, ArrowRight } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState('expo'); // 'expo' | 'pwa'

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install ZELORA on iOS Safari: tap the Share button (square with arrow) and select "Add to Home Screen".\nOn Chrome: tap the 3-dot menu and select "Install app".'
      );
    }
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('cd ZELORA-app && npm start');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="zelora-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="zelora-install-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="install-modal-header">
          <div className="install-header-badge">
            <Sparkles size={13} color="#C5A059" />
            <span>ZELORA MOBILE ATELIER</span>
          </div>
          <button
            type="button"
            className="install-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Title */}
        <div className="install-modal-hero">
          <h2 className="install-modal-title">Experience ZELORA on Your Mobile Device</h2>
          <p className="install-modal-desc">
            Bespoke monochrome editorial shopping, instant Buy Now, order tracking, and the ZELORA Luxury AI Assistant in the palm of your hand.
          </p>
        </div>

        {/* Option Tabs */}
        <div className="install-modal-tabs">
          <button
            type="button"
            className={`install-tab-btn ${activeTab === 'expo' ? 'active' : ''}`}
            onClick={() => setActiveTab('expo')}
          >
            <Smartphone size={15} />
            <span>Expo Mobile App (iOS / Android)</span>
          </button>
          <button
            type="button"
            className={`install-tab-btn ${activeTab === 'pwa' ? 'active' : ''}`}
            onClick={() => setActiveTab('pwa')}
          >
            <Download size={15} />
            <span>Web PWA Install</span>
          </button>
        </div>

        {/* Tab 1: Expo Go & Native App */}
        {activeTab === 'expo' && (
          <div className="install-tab-content">
            <div className="install-qr-strip">
              <div className="install-qr-box">
                {/* Visual QR Code Generator for Expo Go */}
                <svg
                  width="130"
                  height="130"
                  viewBox="0 0 130 130"
                  className="install-qr-svg"
                  aria-label="QR Code to launch ZELORA mobile app"
                >
                  <rect width="130" height="130" fill="#ffffff" rx="4" />
                  {/* Top-left position marker */}
                  <rect x="10" y="10" width="30" height="30" fill="#0b0b0b" />
                  <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                  <rect x="20" y="20" width="10" height="10" fill="#0b0b0b" />
                  {/* Top-right position marker */}
                  <rect x="90" y="10" width="30" height="30" fill="#0b0b0b" />
                  <rect x="95" y="15" width="20" height="20" fill="#ffffff" />
                  <rect x="100" y="20" width="10" height="10" fill="#0b0b0b" />
                  {/* Bottom-left position marker */}
                  <rect x="10" y="90" width="30" height="30" fill="#0b0b0b" />
                  <rect x="15" y="95" width="20" height="20" fill="#ffffff" />
                  <rect x="20" y="100" width="10" height="10" fill="#0b0b0b" />
                  {/* Luxury Atelier Decorative QR pattern dots */}
                  <rect x="48" y="14" width="6" height="6" fill="#0b0b0b" />
                  <rect x="58" y="14" width="6" height="6" fill="#0b0b0b" />
                  <rect x="70" y="14" width="6" height="6" fill="#c5a059" />
                  <rect x="48" y="26" width="6" height="6" fill="#c5a059" />
                  <rect x="62" y="26" width="6" height="6" fill="#0b0b0b" />
                  <rect x="74" y="26" width="6" height="6" fill="#0b0b0b" />
                  <rect x="14" y="48" width="6" height="6" fill="#0b0b0b" />
                  <rect x="26" y="48" width="6" height="6" fill="#c5a059" />
                  <rect x="38" y="48" width="6" height="6" fill="#0b0b0b" />
                  <rect x="50" y="48" width="6" height="6" fill="#0b0b0b" />
                  <rect x="62" y="48" width="6" height="6" fill="#c5a059" />
                  <rect x="74" y="48" width="6" height="6" fill="#0b0b0b" />
                  <rect x="86" y="48" width="6" height="6" fill="#0b0b0b" />
                  <rect x="98" y="48" width="6" height="6" fill="#c5a059" />
                  <rect x="110" y="48" width="6" height="6" fill="#0b0b0b" />
                  <rect x="48" y="62" width="6" height="6" fill="#0b0b0b" />
                  <rect x="62" y="62" width="6" height="6" fill="#c5a059" />
                  <rect x="74" y="62" width="6" height="6" fill="#0b0b0b" />
                  <rect x="86" y="62" width="6" height="6" fill="#0b0b0b" />
                  <rect x="48" y="76" width="6" height="6" fill="#c5a059" />
                  <rect x="62" y="76" width="6" height="6" fill="#0b0b0b" />
                  <rect x="74" y="76" width="6" height="6" fill="#0b0b0b" />
                  <rect x="48" y="90" width="6" height="6" fill="#0b0b0b" />
                  <rect x="62" y="90" width="6" height="6" fill="#0b0b0b" />
                  <rect x="74" y="90" width="6" height="6" fill="#c5a059" />
                  <rect x="86" y="90" width="6" height="6" fill="#0b0b0b" />
                  <rect x="98" y="90" width="6" height="6" fill="#0b0b0b" />
                  <rect x="110" y="90" width="6" height="6" fill="#c5a059" />
                  <rect x="48" y="104" width="6" height="6" fill="#c5a059" />
                  <rect x="62" y="104" width="6" height="6" fill="#0b0b0b" />
                  <rect x="74" y="104" width="6" height="6" fill="#0b0b0b" />
                  <rect x="86" y="104" width="6" height="6" fill="#0b0b0b" />
                  <rect x="98" y="104" width="6" height="6" fill="#c5a059" />
                  <rect x="110" y="104" width="6" height="6" fill="#0b0b0b" />
                </svg>
                <span className="install-qr-caption">Scan with Expo Go</span>
              </div>

              <div className="install-steps">
                <div className="install-step-item">
                  <span className="step-num">01</span>
                  <div className="step-text">
                    <strong>Get Expo Go App</strong>
                    <p>Install free Expo Go on your iPhone or Android from the App Store or Play Store.</p>
                  </div>
                </div>

                <div className="install-step-item">
                  <span className="step-num">02</span>
                  <div className="step-text">
                    <strong>Connect to Wi-Fi</strong>
                    <p>Ensure your mobile device is on the same Wi-Fi as your development machine.</p>
                  </div>
                </div>

                <div className="install-step-item">
                  <span className="step-num">03</span>
                  <div className="step-text">
                    <strong>Launch & Enjoy</strong>
                    <p>Open Expo Go and scan the terminal QR code or point your camera.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick CLI command */}
            <div className="install-cli-strip">
              <span className="install-cli-label">Start Dev Server Terminal:</span>
              <div className="install-cli-box">
                <code>cd ZELORA-app && npm start</code>
                <button
                  type="button"
                  className="install-copy-btn"
                  onClick={handleCopyCmd}
                  title="Copy terminal command"
                >
                  {copiedCmd ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PWA Install */}
        {activeTab === 'pwa' && (
          <div className="install-tab-content">
            <div className="pwa-install-card">
              <div className="pwa-icon-wrap">
                <Smartphone size={32} color="#C5A059" />
              </div>
              <div className="pwa-text-wrap">
                <h3>Install ZELORA Web Application</h3>
                <p>
                  Install directly onto your home screen or desktop application shelf with offline caching, fast load times, and standalone high-fashion experience.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-modal-install-now"
              onClick={handlePwaInstall}
            >
              <Download size={16} />
              <span>{isPwaInstalled ? 'Application Installed ✓' : 'Install ZELORA Web App'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="pwa-instruction-hints">
              <p><strong>iOS / Safari:</strong> Tap Share icon <span className="kbd-icon">􀈂</span> &rarr; "Add to Home Screen".</p>
              <p><strong>Android / Chrome:</strong> Tap three dots menu &rarr; "Install app" or "Add to Home screen".</p>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="install-modal-footer">
          <span className="modal-footer-brand">ZELORA NOIR</span>
          <span className="modal-footer-info">Compatible with iOS 15+, Android 10+, and Modern Browsers</span>
        </div>
      </div>
    </div>
  );
}
