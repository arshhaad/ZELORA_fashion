import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import { authApi } from '../../services/api';
import GoogleButton from '../../components/GoogleButton';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
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

  const handleGoogleSellerSuccess = async ({ credential, access_token }) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await authApi.googleAuth({ credential, access_token, is_seller: true });
      if (res.tokens?.access) {
        localStorage.setItem('zelora_seller_access_token', res.tokens.access);
      }
      showToast?.('Authenticated successfully with Google');
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

        {/* Google Continue */}
        <div style={{ marginBottom: '8px' }}>
          <GoogleButton
            text="signin_with"
            label="Continue with Google"
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
              placeholder="seller@youratelier.com"
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
              <Link
                to="/seller/forgot-password"
                style={{
                  color: 'var(--seller-gold-dark)',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Forgot Password?
              </Link>
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
    </div>
  );
}

