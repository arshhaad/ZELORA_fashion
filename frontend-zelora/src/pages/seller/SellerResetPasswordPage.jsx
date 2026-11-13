import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import OtpCodeInput from '../../components/common/OtpCodeInput';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import '../../components/seller/seller.css';

const SELLER_RESET_SESSION_KEY = 'zelora_seller_reset_session';

export default function SellerResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [initialSession] = useState(() => {
    if (location.state?.email && location.state?.code) {
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem(SELLER_RESET_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState(initialSession?.email || '');
  const [code, setCode] = useState(initialSession?.code || '');
  const hasVerifiedOtp = Boolean(initialSession?.otpVerified && initialSession?.email && initialSession?.code);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const extractError = (err, fallback) => {
    const data = err?.data;
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
    if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
    if (data?.new_password?.[0]) return data.new_password[0];
    if (data?.code?.[0]) return data.code[0];
    return err?.message || fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Email address is required. Please verify your email via Forgot Password.');
      return;
    }
    if (code.trim().length !== 6) {
      setErrorMsg('Please provide your 6-digit OTP verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        new_password: newPassword,
      });
      try {
        sessionStorage.removeItem(SELLER_RESET_SESSION_KEY);
      } catch {
        // Ignore storage errors
      }
      setIsComplete(true);
    } catch (err) {
      setErrorMsg(extractError(err, 'Could not reset password. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="seller-auth-page">
      <div className="seller-auth-card">
        <div className="seller-auth-brand">
          <h1>ZELORA</h1>
          <span>RESET SELLER PASSWORD</span>
          <p className="seller-auth-tagline">
            {isComplete
              ? 'Your seller credentials have been updated securely.'
              : 'Set a strong new password to regain access to your Seller Center.'}
          </p>
        </div>

        {isComplete ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <CheckCircle2 size={44} color="#2e7d32" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ margin: '0 0 8px', color: 'var(--seller-espresso)' }}>
              Password Reset Complete
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--seller-muted)', margin: '0 0 24px', lineHeight: 1.5 }}>
              You can now sign in to your Seller Center account (<strong>{email}</strong>) with your new password.
            </p>
            <button
              type="button"
              className="btn-seller-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              onClick={() => navigate('/seller/login')}
            >
              Proceed to Seller Login
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {hasVerifiedOtp && (
              <div
                style={{
                  backgroundColor: 'rgba(182, 154, 112, 0.14)',
                  border: '1px solid rgba(182, 154, 112, 0.45)',
                  borderRadius: 'var(--seller-radius)',
                  padding: '10px 14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'var(--seller-espresso)',
                }}
              >
                <ShieldCheck size={18} color="var(--seller-gold-dark)" style={{ flexShrink: 0 }} />
                <span>
                  OTP Confirmed for <strong>{email}</strong>
                </span>
              </div>
            )}

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
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!hasVerifiedOtp && (
                <>
                  <div className="seller-form-group">
                    <label className="seller-form-label">Registered Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seller@youratelier.com"
                      className="seller-input"
                      required
                    />
                  </div>
                  <div className="seller-form-group">
                    <label className="seller-form-label">6-Digit OTP Code *</label>
                    <OtpCodeInput
                      value={code}
                      onChange={setCode}
                      disabled={isSubmitting}
                      idPrefix="seller-fallback-otp"
                    />
                  </div>
                </>
              )}

              <div className="seller-form-group">
                <label className="seller-form-label">
                  New Password <span style={{ color: 'var(--seller-danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--seller-muted)',
                    }}
                  />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Minimum 6 characters"
                    className="seller-input"
                    style={{ paddingLeft: '40px', paddingRight: '42px' }}
                    minLength={6}
                    required
                    autoFocus={hasVerifiedOtp}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
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
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">
                  Confirm New Password <span style={{ color: 'var(--seller-danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--seller-muted)',
                    }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Re-enter your new password"
                    className="seller-input"
                    style={{ paddingLeft: '40px', paddingRight: '42px' }}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
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
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-seller-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating Password...' : 'Reset Seller Password'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid var(--seller-border)',
                fontSize: '13px',
              }}
            >
              <Link
                to="/seller/forgot-password"
                style={{
                  color: 'var(--seller-espresso)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={15} />
                <span>Request a new OTP</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

