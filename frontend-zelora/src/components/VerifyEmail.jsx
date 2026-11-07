import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailCheck, KeyRound, AlertCircle, CheckCircle2, RotateCw, ArrowLeft } from 'lucide-react';

export default function VerifyEmail({ setActiveView }) {
  const navigate = useNavigate();
  const { pendingEmail, setPendingEmail, verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(pendingEmail || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (pendingEmail) setEmail(pendingEmail);
  }, [pendingEmail]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(code.trim(), email.trim());
      navigate('/');
    } catch (err) {
      const msg = err.data?.detail || err.data?.code?.[0] || err.message || 'Verification failed. Please check the code.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      await resendVerification(email.trim());
      setSuccessMsg('A fresh verification code has been dispatched to your email.');
      setTimer(30);
    } catch (err) {
      const msg = err.data?.detail || err.data?.email?.[0] || err.message || 'Could not resend code.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge-icon">
          <MailCheck size={28} className="badge-icon-blue" />
        </div>
        <h2>Verify Your Email</h2>
        <p className="auth-subtitle">
          A 6-digit confirmation code has been dispatched to{' '}
          <strong className="text-highlight">{email || 'your email'}</strong>.
          <br />
          Please copy the OTP code from your email and enter it below.
        </p>
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

      <form onSubmit={handleVerifySubmit} className="auth-form">
        {!pendingEmail && (
          <div className="form-group">
            <label htmlFor="verify-email-input">Email Address</label>
            <input
              id="verify-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@customer.com"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="verify-code-input">6-Digit Verification Code</label>
          <div className="input-wrapper">
            <KeyRound size={18} className="input-icon" />
            <input
              id="verify-code-input"
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

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <span className="spinner-wrap">
              <span className="spinner"></span> Verifying...
            </span>
          ) : (
            'Verify Email & Activate Account'
          )}
        </button>

        <div className="resend-row">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            className="resend-btn"
            onClick={handleResend}
            disabled={timer > 0 || resending}
          >
            {resending ? (
              'Sending...'
            ) : timer > 0 ? (
              `Resend code in ${timer}s`
            ) : (
              <span className="resend-active">
                <RotateCw size={14} /> Resend Code
              </span>
            )}
          </button>
        </div>
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

