import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleButton from './GoogleButton';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register({ setActiveView }) {
  const navigate = useNavigate();
  const { register, googleAuth } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      // Redirect to verification view
      setActiveView('verify-email');
    } catch (err) {
      const msg = err.data?.detail || err.data?.message || err.data?.email?.[0] || err.message || 'Registration failed.';
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
      navigate('/');
    } catch (err) {
      const msg = err.data?.detail || err.data?.message || err.message || 'Google sign-up failed.';
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
        <div className="auth-badge">CLIENT PRIVILEGES</div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join ZELORA for curated collections, bespoke delivery, and VIP concierge.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Sign up with Google */}
      <div className="social-login-section">
        <label className="section-label">Fast Registration</label>
        <GoogleButton
          text="signup_with"
          label="Sign up with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>

      <div className="divider-container">
        <span className="divider-line"></span>
        <span className="divider-text">OR REGISTER WITH EMAIL</span>
        <span className="divider-line"></span>
      </div>

      {/* 2. Email and Password Registration */}
      <form onSubmit={handleRegisterSubmit} className="auth-form">
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="reg-first-name">First Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-last-name">Last Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              id="reg-email"
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
          <label htmlFor="reg-password">Password (min 6 characters)</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
              autoComplete="new-password"
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

        <div className="form-group">
          <label htmlFor="reg-confirm-password">Confirm Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="reg-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-wrap">
              <span className="spinner"></span> Creating Account...
            </span>
          ) : (
            <span className="btn-content">
              Create Account <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <span>Already have an account?</span>{' '}
        <button
          type="button"
          className="text-link strong"
          onClick={() => setActiveView('login')}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

