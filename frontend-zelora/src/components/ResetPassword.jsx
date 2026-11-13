import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpCodeInput from './common/OtpCodeInput';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const CUSTOMER_RESET_SESSION_KEY = 'zelora_customer_reset_session';

export default function ResetPassword({ setActiveView }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingEmail, resetPassword } = useAuth();

  const [verifiedSession] = useState(() => {
    if (location.state?.email && location.state?.code) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem(CUSTOMER_RESET_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState(verifiedSession?.email || pendingEmail || '');
  const [code, setCode] = useState(verifiedSession?.code || '');
  const hasVerifiedOtp = Boolean(verifiedSession?.otpVerified && verifiedSession?.email && verifiedSession?.code);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!verifiedSession?.email && pendingEmail) {
      setEmail(pendingEmail);
    }
  }, [pendingEmail, verifiedSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your account email address.');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Please provide the 6-digit OTP reset code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        code: code.trim(),
        new_password: newPassword,
      });
      try {
        sessionStorage.removeItem(CUSTOMER_RESET_SESSION_KEY);
      } catch {
        // Ignore storage errors
      }
      setSuccess(true);
    } catch (err) {
      const msg =
        err.data?.detail ||
        err.data?.message ||
        err.data?.non_field_errors?.[0] ||
        err.data?.code?.[0] ||
        err.message ||
        'Password reset failed.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge-icon">
            <CheckCircle2 size={36} className="badge-icon-green" />
          </div>
          <h2>Password Reset Complete!</h2>
          <p className="auth-subtitle">
            Your ZELORA account password has been updated securely. You can now log in with your new credentials.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary btn-block"
          onClick={() => {
            setActiveView('login');
            navigate('/login');
          }}
        >
          Proceed to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge-icon">
          <KeyRound size={28} className="badge-icon-purple" />
        </div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {hasVerifiedOtp
            ? <>OTP confirmed for <strong className="text-highlight">{email}</strong>. Create your new password below.</>
            : 'Enter your email, 6-digit OTP code, and choose a new password.'}
        </p>
      </div>

      {hasVerifiedOtp && (
        <div
          className="alert"
          style={{
            backgroundColor: 'rgba(182, 154, 112, 0.14)',
            border: '1px solid rgba(182, 154, 112, 0.45)',
            color: '#292522',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <ShieldCheck size={18} style={{ color: '#8C7046', flexShrink: 0 }} />
          <span>OTP Confirmed ✓</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {!hasVerifiedOtp && (
          <>
            <div className="form-group">
              <label htmlFor="reset-email">Email Address</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@customer.com"
                required
              />
            </div>

            <div className="form-group">
              <label>6-Digit Reset OTP</label>
              <OtpCodeInput
                value={code}
                onChange={setCode}
                disabled={loading}
                idPrefix="customer-fallback-otp"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="reset-new-password">New Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              autoFocus={hasVerifiedOtp}
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
          <label htmlFor="reset-confirm-password">Confirm New Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              <span className="spinner"></span> Updating Password...
            </span>
          ) : (
            <span className="btn-content">
              Reset Password <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <button
          type="button"
          className="text-link flex-center"
          onClick={() => {
            setActiveView('forgot-password');
            navigate('/forgot-password');
          }}
        >
          <ArrowLeft size={16} /> Back to Forgot Password
        </button>
      </div>
    </div>
  );
}
