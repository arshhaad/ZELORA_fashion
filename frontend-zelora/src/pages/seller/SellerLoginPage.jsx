import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import {
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import '../../components/seller/seller.css';

export default function SellerLoginPage() {
  const navigate = useNavigate();
  const { loginSeller } = useSeller();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both business email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if this seller registered and is awaiting admin approval
      const registeredSellers = JSON.parse(localStorage.getItem('zelora_registered_sellers') || '[]');
      const matched = registeredSellers.find((s) => s.email?.toLowerCase() === email.toLowerCase());

      if (matched) {
        const adminShops = JSON.parse(localStorage.getItem('zelora_admin_shops') || '[]');
        const adminMatched = adminShops.find(
          (sh) =>
            sh.owner_email?.toLowerCase() === email.toLowerCase() ||
            sh.name?.toLowerCase() === matched.shop_name?.toLowerCase()
        );

        if (!adminMatched || adminMatched.status !== 'approved') {
          setErrorMsg(
            'Your boutique application is currently pending Administrator approval. Access will be unlocked once approved by ZELORA Executive Administration.'
          );
          setIsSubmitting(false);
          return;
        }
      }

      await loginSeller({ email, password });
      navigate('/seller/dashboard');
    } catch {
      setErrorMsg('Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('atelier@maisondelombre.luxury');
    setPassword('Couture2026!');
  };

  const handleGoogleSellerLogin = () => {
    loginSeller({
      email: 'eleanor.vance@atelier-google.com',
      password: 'google-oauth-token',
    });
    navigate('/seller/dashboard');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSubmitted(true);
    }
  };

  return (
    <div className="seller-auth-page">
      <div className="seller-auth-card">
        {/* Brand Header */}
        <div className="seller-auth-brand">
          <h1>ZELORA</h1>
          <span>SELLER CENTER LOGIN</span>
          <p className="seller-auth-tagline">
            Manage your boutique atelier, monitor customer sales, and fulfill bespoke fashion orders.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--seller-danger-bg)',
              color: 'var(--seller-danger)',
              border: '1px solid rgba(156, 56, 56, 0.25)',
              padding: '12px 16px',
              borderRadius: 'var(--seller-radius)',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Quick-Fill Pill */}
        <div
          style={{
            background: 'var(--seller-beige-light)',
            border: '1px dashed var(--seller-gold)',
            borderRadius: 'var(--seller-radius)',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ color: 'var(--seller-espresso)' }}>
            <strong>Demo Atelier:</strong> <span>Maison de L'Ombre</span>
          </div>
          <button
            type="button"
            className="btn-status-toggle"
            onClick={handleDemoFill}
            style={{ color: 'var(--seller-espresso)', borderColor: 'var(--seller-gold)' }}
          >
            Fill Demo
          </button>
        </div>

        {/* Google Continue */}
        <button
          type="button"
          className="btn-google-seller"
          onClick={handleGoogleSellerLogin}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="seller-auth-divider">
          <span>Or with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="seller-form-group">
            <label className="seller-form-label">Business Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atelier@maisondelombre.luxury"
              className="seller-input"
              required
            />
          </div>

          {/* Password */}
          <div className="seller-form-group">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '7px',
              }}
            >
              <label className="seller-form-label" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--seller-gold-dark)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotSubmitted(false);
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="seller-input"
                required
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--seller-muted)',
                  cursor: 'pointer',
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontSize: '13px',
              color: 'var(--seller-dark-text)',
            }}
          >
            <input
              type="checkbox"
              id="remember-seller"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--seller-espresso)' }}
            />
            <label htmlFor="remember-seller" style={{ cursor: 'pointer' }}>
              Keep me signed in on this workstation
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-seller-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating Atelier...' : 'Sign In to Seller Center'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer Link */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--seller-border)',
            fontSize: '13px',
            color: 'var(--seller-muted)',
          }}
        >
          New luxury boutique?{' '}
          <Link
            to="/seller/register"
            style={{
              color: 'var(--seller-espresso)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Register as Seller
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="seller-modal-overlay">
          <div className="seller-modal-dialog">
            <div className="seller-modal-header">
              <h3>Reset Seller Password</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setForgotModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="seller-modal-body">
              {!forgotSubmitted ? (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{ fontSize: '13.5px', color: 'var(--seller-muted)', marginTop: 0 }}>
                    Enter the registered business email associated with your atelier. We will send a secure password reset link.
                  </p>
                  <div className="seller-form-group">
                    <label className="seller-form-label">Business Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="atelier@maisondelombre.luxury"
                      className="seller-input"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-seller-secondary"
                      onClick={() => setForgotModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-seller-gold">
                      Send Reset Instructions
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <ShieldCheck size={40} color="var(--seller-gold)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ margin: '0 0 8px', color: 'var(--seller-espresso)' }}>
                    Instructions Dispatched
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--seller-muted)', margin: '0 0 20px' }}>
                    If an atelier account exists for <strong>{forgotEmail}</strong>, password reset steps have been emailed.
                  </p>
                  <button
                    type="button"
                    className="btn-seller-primary"
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

