import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ResetPassword({ setActiveView }) {
  const { pendingEmail, resetPassword } = useAuth();

  const [email, setEmail] = useState(pendingEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (pendingEmail) setEmail(pendingEmail);
  }, [pendingEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 6) {
      setError('Please provide the 6-digit reset code.');
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
      setSuccess(true);
    } catch (err) {
      const msg = err.data?.detail || err.data?.message || err.data?.code?.[0] || err.message || 'Password reset failed.';
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
          onClick={() => setActiveView('login')}
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
        <h2>Create New Password</h2>
        <p className="auth-subtitle">
          A 6-digit recovery code was dispatched to <strong className="text-highlight">{email || 'your email'}</strong>.
          <br />
          Please copy the OTP code from your email and enter it below to set your new password.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {!pendingEmail && (
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
        )}

        <div className="form-group">
          <label htmlFor="reset-code">6-Digit Reset Code</label>
          <div className="input-wrapper">
            <KeyRound size={18} className="input-icon" />
            <input
              id="reset-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="code-input"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reset-new-password">New Password</label>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
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
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <span className="spinner-wrap">
              <span className="spinner"></span> Updating Password...
            </span>
          ) : (
            <span className="btn-content">
              Update Password <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>

      <div className="auth-footer">
        <button
          type="button"
          className="text-link flex-center"
          onClick={() => setActiveView('login')}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </button>
      </div>
    </div>
  );
}

