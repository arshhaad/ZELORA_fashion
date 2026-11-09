import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import { authApi } from '../../services/api';
import GoogleButton from '../../components/GoogleButton';
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
  const { loginSeller, showToast } = useSeller();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Client-side field validation
  const validateFields = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Business email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email format (e.g. atelier@boutique.com).';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await loginSeller({ email: email.trim().toLowerCase(), password });
      navigate('/seller/dashboard');
    } catch (err) {
      const backendErrors = err.data?.errors || {};
      const detail = err.data?.detail || err.message || 'Invalid email or password credentials.';
      setErrorMsg(typeof detail === 'string' ? detail : JSON.stringify(detail));

      const newFieldErrors = {};
      if (backendErrors.email) {
        newFieldErrors.email = Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email;
      }
      if (backendErrors.password) {
        newFieldErrors.password = Array.isArray(backendErrors.password) ? backendErrors.password[0] : backendErrors.password;
      }
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
      }
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('atelier@maisondelombre.luxury');
    setPassword('Couture2026!');
    setFieldErrors({ email: '', password: '' });
    setErrorMsg('');
  };

  const handleGoogleSellerSuccess = async ({ credential, access_token }) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await authApi.googleAuth({ credential, access_token, is_seller: true });
      if (res.tokens?.access) {
        localStorage.setItem('zelora_seller_access_token', res.tokens.access);
      }
      showToast?.('Authenticated successfully via Google Atelier ID');
      navigate('/seller/dashboard');
    } catch (err) {
      const msg = err.data?.detail || err.data?.message || err.message || 'Google seller authentication failed.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSellerError = (err) => {
    console.error('Google seller auth error:', err);
    setErrorMsg(err.message || 'Google sign-in could not connect.');
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
        <div style={{ marginBottom: '8px' }}>
          <GoogleButton
            text="signin_with"
            label="Continue with Google Atelier ID"
            onSuccess={handleGoogleSellerSuccess}
            onError={handleGoogleSellerError}
            disabled={isSubmitting}
          />
        </div>

        <div className="seller-auth-divider">
          <span>Or with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="seller-form-group">
            <label className="seller-form-label">
              Business Email Address <span style={{ color: 'var(--seller-danger)' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="atelier@maisondelombre.luxury"
              className="seller-input"
              style={fieldErrors.email ? { borderColor: 'var(--seller-danger)' } : {}}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div style={{ color: 'var(--seller-danger)', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={13} />
                <span>{fieldErrors.email}</span>
              </div>
            )}
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
                Password <span style={{ color: 'var(--seller-danger)' }}>*</span>
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter your password (min 6 chars)"
                className="seller-input"
                style={fieldErrors.password ? { borderColor: 'var(--seller-danger)' } : {}}
                autoComplete="current-password"
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
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div style={{ color: 'var(--seller-danger)', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={13} />
                <span>{fieldErrors.password}</span>
              </div>
            )}
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

