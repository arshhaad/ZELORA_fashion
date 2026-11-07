import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ForgotPassword({ setActiveView }) {
  const { forgotPassword, setPendingEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setPendingEmail(email.trim());
      setActiveView('reset-password');
    } catch (err) {
      const msg = err.data?.detail || err.data?.email?.[0] || err.message || 'Could not send reset code.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge-icon">
          <ShieldAlert size={28} className="badge-icon-red" />
        </div>
        <h2>Forgot Password?</h2>
        <p className="auth-subtitle">
          Don't worry. Enter your registered email address and we'll send you a 6-digit recovery code.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="forgot-email">Account Email</label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@customer.com"
              required
              autoFocus
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
              <span className="spinner"></span> Sending code...
            </span>
          ) : (
            <span className="btn-content">
              Send Reset Code <ArrowRight size={18} />
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
          <ArrowLeft size={16} /> Return to Sign In
        </button>
      </div>
    </div>
  );
}

