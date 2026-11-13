import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import OtpCodeInput from '../../components/common/OtpCodeInput';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import '../../components/seller/seller.css';

const SELLER_RESET_SESSION_KEY = 'zelora_seller_reset_session';

export default function SellerForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid business email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email: cleanEmail, role: 'seller' });
      const resolvedEmail = res?.email || cleanEmail;
      setEmail(resolvedEmail);
      setOtpCode('');
      setInfoMsg(`A 6-digit OTP confirmation code has been sent to ${resolvedEmail}.`);
      setStep('otp');
    } catch (err) {
      setErrorMsg(extractError(err, 'Could not send reset OTP. Please check your email address.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.verifyResetOtp({
        email: email.trim(),
        code: otpCode.trim(),
        role: 'seller',
      });
      const verifiedEmail = res?.email || email.trim();
      const payload = {
        email: verifiedEmail,
        code: otpCode.trim(),
        otpVerified: true,
        verifiedAt: Date.now(),
      };
      try {
        sessionStorage.setItem(SELLER_RESET_SESSION_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage failures
      }
      navigate('/seller/reset-password', { state: payload });
    } catch (err) {
      setErrorMsg(extractError(err, 'Invalid or expired OTP code. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email: email.trim(), role: 'seller' });
      setOtpCode('');
      setInfoMsg(`A fresh 6-digit OTP has been sent to ${res?.email || email.trim()}.`);
    } catch (err) {
      setErrorMsg(extractError(err, 'Failed to resend OTP code.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="seller-auth-page">
      <div className="seller-auth-card">
        <div className="seller-auth-brand">
          <h1>ZELORA</h1>
          <span>SELLER PASSWORD RECOVERY</span>
          <p className="seller-auth-tagline">
            {step === 'email'
              ? 'Enter your registered seller email to receive a 6-digit OTP confirmation code.'
              : `Enter the 6-digit OTP dispatched to ${email} to verify your identity.`}
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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div
            style={{
              backgroundColor: 'rgba(182, 154, 112, 0.14)',
              color: 'var(--seller-espresso)',
              border: '1px solid rgba(182, 154, 112, 0.4)',
              padding: '12px 16px',
              borderRadius: 'var(--seller-radius)',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="var(--seller-gold-dark)" style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="seller-form-group">
              <label className="seller-form-label">
                Registered Business Email <span style={{ color: 'var(--seller-danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
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
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="seller@youratelier.com"
                  className="seller-input"
                  style={{ paddingLeft: '40px' }}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-seller-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending 6-Digit OTP...' : 'Send OTP Code'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <ShieldCheck size={34} color="var(--seller-gold)" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 4px', color: 'var(--seller-espresso)' }}>
                OTP Confirmation
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--seller-muted)' }}>
                Paste or type the 6-digit verification PIN sent to <strong>{email}</strong>
              </p>
            </div>

            <OtpCodeInput
              value={otpCode}
              onChange={(code) => {
                setOtpCode(code);
                if (errorMsg) setErrorMsg('');
              }}
              disabled={isSubmitting}
              idPrefix="seller-reset-otp"
            />

            <button
              type="submit"
              className="btn-seller-gold"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirming OTP...' : 'Confirm OTP & Continue'}
              <ArrowRight size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--seller-gold-dark)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCw size={14} className={isSubmitting ? 'spin' : ''} />
                <span>Resend OTP</span>
              </button>
              <span style={{ color: 'var(--seller-border)', fontSize: '12px' }}>•</span>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtpCode('');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--seller-muted)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Edit email
              </button>
            </div>
          </form>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--seller-border)',
            fontSize: '13px',
          }}
        >
          <Link
            to="/seller/login"
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
            <span>Back to Seller Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

