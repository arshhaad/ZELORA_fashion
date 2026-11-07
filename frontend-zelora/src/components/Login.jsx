import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from './GoogleButton';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login({ setActiveView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleAuth, setPendingEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.requiresVerification) {
        setPendingEmail(result.email);
        setActiveView('verify-email');
        return;
      }
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.data?.detail || err.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential, access_token }) => {
    setError('');
    setLoading(true);
    try {
      await googleAuth({ credential, access_token });
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.data?.detail || err.data?.message || err.message || 'Google sign-in failed.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    console.error('Google Auth error:', err);
    setError(err.message || 'Could not connect to Google.');
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge">CLIENT CONCIERGE</div>
        <h2>Sign In to ZELORA</h2>
        <p className="auth-subtitle">Welcome back. Access your saved wardrobe, bag, and orders.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} className="alert-icon" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Login with Google */}
      <div className="social-login-section">
        <label className="section-label">Quick Sign-in</label>
        <GoogleButton
          text="signin_with"
          label="Sign in with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>

      <div className="divider-container">
        <span className="divider-line"></span>
        <span className="divider-text">OR CONTINUE WITH EMAIL</span>
        <span className="divider-line"></span>
      </div>

      {/* 2. Email and Password Login */}
      <form onSubmit={handleEmailPasswordSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@customer.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              className="text-link forgot-pw-link"
              onClick={() => setActiveView('forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-wrap">
              <span className="spinner"></span> Signing in...
            </span>
          ) : (
            <span className="btn-content">
              Sign In to Account <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <span>Don't have a ZELORA account?</span>{' '}
        <button
          type="button"
          className="text-link strong"
          onClick={() => setActiveView('register')}
        >
          Sign Up with Google or Email
        </button>
      </div>
    </div>
  );
}

