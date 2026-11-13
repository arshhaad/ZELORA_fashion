import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpCodeInput from './common/OtpCodeInput';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

const CUSTOMER_RESET_SESSION_KEY = 'zelora_customer_reset_session';

export default function ForgotPassword({ setActiveView }) {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, setPendingEmail } = useAuth();

  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const extractError = (err, fallback) => {
    const data = err?.data;
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
    if (data?.email?.[0]) return data.email[0];
    if (data?.code?.[0]) return data.code[0];
    if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
    return err?.message || fallback;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(cleanEmail, 'customer');
      const resolvedEmail = res?.email || cleanEmail;
      setEmail(resolvedEmail);
      setPendingEmail(resolvedEmail);
      setOtpCode('');
      setInfo(`A 6-digit confirmation OTP has been sent to ${resolvedEmail}.`);
      setStep('otp');
    } catch (err) {
      setError(extractError(err, 'Could not send reset code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetOtp({
        email: email.trim(),
        code: otpCode.trim(),
        role: 'customer',
      });
      const verifiedEmail = res?.email || email.trim();
      const payload = {
        email: verifiedEmail,
        code: otpCode.trim(),
        otpVerified: true,
        verifiedAt: Date.now(),
      };
      try {
        sessionStorage.setItem(CUSTOMER_RESET_SESSION_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage failures
      }
      setPendingEmail(verifiedEmail);
      navigate('/reset-password', { state: payload });
    } catch (err) {
      setError(extractError(err, 'Invalid or expired OTP code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim(), 'customer');
      setOtpCode('');
      setInfo(`A new 6-digit OTP has been sent to ${res?.email || email.trim()}.`);
    } catch (err) {
      setError(extractError(err, 'Failed to resend OTP code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-badge-icon">
          {step === 'email' ? (
            <ShieldAlert size={28} className="badge-icon-red" />
          ) : (
            <ShieldCheck size={28} className="badge-icon-purple" />
          )}
        </div>
        <h2>{step === 'email' ? 'Forgot Password?' : 'OTP Confirmation'}</h2>
        <p className="auth-subtitle">
          {step === 'email'
            ? "Enter your registered email address and we'll send you a 6-digit OTP confirmation code."
            : `Enter or paste the 6-digit OTP sent to ${email} to continue resetting your password.`}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {info && (
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
          <CheckCircle2 size={18} style={{ color: '#8C7046', flexShrink: 0 }} />
          <span>{info}</span>
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="auth-form">
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
                <span className="spinner"></span> Sending OTP...
              </span>
            ) : (
              <span className="btn-content">
                Send OTP Code <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmOtp} className="auth-form">
          <OtpCodeInput
            value={otpCode}
            onChange={(val) => {
              setOtpCode(val);
              if (error) setError('');
            }}
            disabled={loading}
            idPrefix="customer-reset-otp"
          />

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-wrap">
                <span className="spinner"></span> Verifying OTP...
              </span>
            ) : (
              <span className="btn-content">
                Confirm OTP & Continue <ArrowRight size={18} />
              </span>
            )}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
            <button
              type="button"
              className="text-link"
              onClick={handleResendOtp}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
            >
              <RotateCw size={14} /> Resend OTP
            </button>
            <span style={{ opacity: 0.4 }}>•</span>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setStep('email');
                setOtpCode('');
                setError('');
                setInfo('');
              }}
              disabled={loading}
              style={{ fontSize: '13px' }}
            >
              Edit email
            </button>
          </div>
        </form>
      )}

      <div className="auth-footer">
        <button
          type="button"
          className="text-link flex-center"
          onClick={() => {
            setActiveView('login');
            navigate('/login');
          }}
        >
          <ArrowLeft size={16} /> Return to Sign In
        </button>
      </div>
    </div>
  );
}
