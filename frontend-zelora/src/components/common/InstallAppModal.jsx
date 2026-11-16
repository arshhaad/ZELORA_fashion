import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, QrCode, Check, Copy, Sparkles, ExternalLink } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('mobile'); // 'mobile' | 'pwa'

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Manual fallback alert / instruction
      alert(
        'To install ZELORA on your device:\n\n' +
        '• On Chrome/Edge: Click the Install icon in the browser address bar.\n' +
        '• On iOS Safari: Tap Share (square with arrow) and select "Add to Home Screen".\n' +
        '• On Android Chrome: Tap Menu (3 dots) and select "Add to Home screen" / "Install app".'
      );
    }
  };

  const expoCommand = 'cd ZELORA-app && npx expo start';

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(expoCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="zelora-install-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="zelora-install-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="install-modal-header">
          <div className="install-modal-brand-badge">
            <Smartphone size={16} />
            <span>ZELORA MOBILE & APP EXPERIENCE</span>
          </div>
          <button
            type="button"
            className="install-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Title */}
        <div className="install-modal-body">
          <h2 className="install-modal-title">
            Experience ZELORA on Your Mobile Device
          </h2>
          <p className="install-modal-desc">
            Enjoy seamless monochrome couture browsing, real-time order tracking, and our
            bespoke AI Assistant on iOS & Android.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="install-tab-switch">
            <button
              type="button"
              className={`install-tab-btn ${activeTab === 'mobile' ? 'active' : ''}`}
              onClick={() => setActiveTab('mobile')}
            >
              <Smartphone size={14} />
              <span>React Native / Expo App</span>
            </button>
            <button
              type="button"
              className={`install-tab-btn ${activeTab === 'pwa' ? 'active' : ''}`}
              onClick={() => setActiveTab('pwa')}
            >
              <Download size={14} />
              <span>Web App (PWA)</span>
            </button>
          </div>

          {activeTab === 'mobile' ? (
            <div className="install-tab-content">
              <div className="install-feature-pill-strip">
                <div className="install-feature-pill">
                  <Sparkles size={13} className="text-gold" />
                  <span>AI Concierge</span>
                </div>
                <div className="install-feature-pill">
                  <Check size={13} className="text-gold" />
                  <span>Direct Buy Now</span>
                </div>
                <div className="install-feature-pill">
                  <Check size={13} className="text-gold" />
                  <span>Push Tracking</span>
                </div>
              </div>

              <div className="install-qr-panel">
                <div className="install-qr-frame">
                  {/* Clean SVG QR Code Representation */}
                  <svg
                    viewBox="0 0 100 100"
                    width="120"
                    height="120"
                    className="qr-code-svg"
                    aria-label="Expo Go QR Code"
                  >
                    <rect width="100" height="100" fill="#ffffff" rx="4" />
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="24" height="24" fill="#0b0b0b" />
                    <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
                    <rect x="18" y="18" width="8" height="8" fill="#0b0b0b" />
                    {/* Corner 2 */}
                    <rect x="66" y="10" width="24" height="24" fill="#0b0b0b" />
                    <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
                    <rect x="74" y="18" width="8" height="8" fill="#0b0b0b" />
                    {/* Corner 3 */}
                    <rect x="10" y="66" width="24" height="24" fill="#0b0b0b" />
                    <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
                    <rect x="18" y="74" width="8" height="8" fill="#0b0b0b" />
                    {/* Data matrix pattern elements */}
                    <rect x="42" y="12" width="6" height="6" fill="#c5a059" />
                    <rect x="52" y="12" width="6" height="6" fill="#0b0b0b" />
                    <rect x="42" y="24" width="6" height="6" fill="#0b0b0b" />
                    <rect x="52" y="24" width="6" height="6" fill="#c5a059" />
                    <rect x="12" y="44" width="6" height="6" fill="#0b0b0b" />
                    <rect x="24" y="44" width="6" height="6" fill="#0b0b0b" />
                    <rect x="36" y="40" width="8" height="8" fill="#0b0b0b" />
                    <rect x="48" y="40" width="8" height="8" fill="#c5a059" />
                    <rect x="60" y="40" width="8" height="8" fill="#0b0b0b" />
                    <rect x="72" y="44" width="6" height="6" fill="#0b0b0b" />
                    <rect x="84" y="44" width="6" height="6" fill="#c5a059" />
                    <rect x="40" y="66" width="6" height="6" fill="#0b0b0b" />
                    <rect x="52" y="66" width="6" height="6" fill="#0b0b0b" />
                    <rect x="64" y="66" width="6" height="6" fill="#c5a059" />
                    <rect x="76" y="66" width="6" height="6" fill="#0b0b0b" />
                    <rect x="44" y="78" width="8" height="8" fill="#0b0b0b" />
                    <rect x="60" y="78" width="8" height="8" fill="#c5a059" />
                    <rect x="76" y="78" width="8" height="8" fill="#0b0b0b" />
                  </svg>
                  <span className="qr-badge">EXPO GO COMPATIBLE</span>
                </div>

                <div className="install-steps">
                  <div className="install-step-item">
                    <span className="step-num">1</span>
                    <p>
                      Install <strong>Expo Go</strong> on your Android or iPhone from the store.
                    </p>
                  </div>
                  <div className="install-step-item">
                    <span className="step-num">2</span>
                    <p>
                      In the terminal, run the command below:
                    </p>
                  </div>
                  <div className="install-code-box">
                    <code>{expoCommand}</code>
                    <button
                      type="button"
                      className="copy-code-btn"
                      onClick={handleCopyCommand}
                      title="Copy command"
                    >
                      {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="install-step-item">
                    <span className="step-num">3</span>
                    <p>
                      Scan the terminal QR code to experience the app live on your phone!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="install-tab-content">
              <div className="pwa-install-banner">
                <div className="pwa-icon-wrap">
                  <Download size={26} />
                </div>
                <div>
                  <h4 className="pwa-banner-title">Install ZELORA Web Application</h4>
                  <p className="pwa-banner-sub">
                    Add ZELORA directly to your home screen or desktop application dock for
                    faster access and offline cache.
                  </p>
                </div>
              </div>

              <div className="pwa-device-instructions">
                <div className="pwa-device-card">
                  <h5>iOS (iPhone / iPad)</h5>
                  <p>1. Open ZELORA in Safari</p>
                  <p>2. Tap the <strong>Share</strong> button (square with arrow)</p>
                  <p>3. Select <strong>Add to Home Screen</strong></p>
                </div>
                <div className="pwa-device-card">
                  <h5>Android & Desktop</h5>
                  <p>1. Open in Chrome or Edge</p>
                  <p>2. Click <strong>Install</strong> or Menu (⋮)</p>
                  <p>3. Tap <strong>Install app</strong> / <strong>Add to Home Screen</strong></p>
                </div>
              </div>

              <button
                type="button"
                className="btn-pwa-trigger"
                onClick={handleInstallPWA}
              >
                <Download size={16} />
                <span>{isInstalled ? 'App Installed ✓' : 'Install ZELORA Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="install-modal-footer">
          <span>ZELORA Haute Horlogerie & Monochrome Couture</span>
          <button type="button" className="btn-modal-dismiss" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
