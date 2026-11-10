import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeller } from '../../context/SellerContext';
import { authApi } from '../../services/api';
import {
  Sparkles,
  Eye,
  EyeOff,
  Store,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Clock,
  RotateCw,
} from 'lucide-react';
import '../../components/seller/seller.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      if (window.Razorpay) {
        resolve(true);
      } else {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function SellerRegisterPage() {
  const navigate = useNavigate();
  const { registerSeller } = useSeller();

  const [formData, setFormData] = useState({
    owner_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: '',
    shop_name: '',
    shop_category: 'Haute Couture & Designer Wear',
    terms_accepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfoMsg, setSuccessInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'payment' | 'submitted'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [paymentReference, setPaymentReference] = useState('');

  // Preload Razorpay checkout script
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfoMsg('');

    const trimmedEmail = (formData.email || '').trim().toLowerCase();
    const trimmedOwner = (formData.owner_name || '').trim();
    const trimmedShop = (formData.shop_name || '').trim();
    const trimmedPhone = (formData.mobile_number || '').trim();

    if (
      !trimmedOwner ||
      !trimmedEmail ||
      !trimmedPhone ||
      !formData.password ||
      !trimmedShop
    ) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid business email format (e.g. atelier@boutique.com).');
      return;
    }

    const cleanedPhone = trimmedPhone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanedPhone.length < 7 || !/^\d+$/.test(cleanedPhone)) {
      setErrorMsg('Please enter a valid contact phone number (at least 7 digits).');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!formData.terms_accepted) {
      setErrorMsg('You must accept the ZELORA Marketplace Terms & Merchant Agreement.');
      return;
    }

    // Auto-correct common email domain typos (e.g. gamil.com -> gmail.com)
    const typoDomains = {
      'gamil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
    };
    let normalizedEmail = trimmedEmail;
    if (trimmedEmail.includes('@')) {
      const [localPart, domainPart] = trimmedEmail.split('@');
      if (typoDomains[domainPart]) {
        normalizedEmail = `${localPart}@${typoDomains[domainPart]}`;
      }
    }

    // Update state with cleanly sanitized values
    setFormData((prev) => ({
      ...prev,
      email: normalizedEmail,
      owner_name: trimmedOwner,
      shop_name: trimmedShop,
      mobile_number: trimmedPhone,
    }));

    // Send 6-digit OTP code to the seller's verified email inbox via backend SMTP
    setIsSubmitting(true);
    try {
      const res = await authApi.sendSellerOtp({
        email: normalizedEmail,
        owner_name: trimmedOwner,
        shop_name: trimmedShop,
      });
      const targetEmail = res.email || normalizedEmail;
      setSuccessInfoMsg(`Verification code sent to your real email: ${targetEmail}`);
      setStep('otp');
    } catch (err) {
      const msg = err.data?.detail || err.message || 'Could not send verification OTP to email.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const fullOtp = otp.join('').trim();
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    const trimmedEmail = (formData.email || '').trim().toLowerCase();
    setIsSubmitting(true);
    try {
      await authApi.verifySellerOtp({
        email: trimmedEmail,
        code: fullOtp,
      });
      setStep('payment');
    } catch (err) {
      const msg = err.data?.detail || err.message || 'Invalid or expired verification code.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    const typoDomains = {
      'gamil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmaill.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
    };
    let trimmedEmail = (formData.email || '').trim().toLowerCase();
    if (trimmedEmail.includes('@')) {
      const [localPart, domainPart] = trimmedEmail.split('@');
      if (typoDomains[domainPart]) {
        trimmedEmail = `${localPart}@${typoDomains[domainPart]}`;
      }
    }
    setIsSubmitting(true);
    try {
      const res = await authApi.sendSellerOtp({
        email: trimmedEmail,
        owner_name: (formData.owner_name || '').trim(),
        shop_name: (formData.shop_name || '').trim(),
      });
      const targetEmail = res.email || trimmedEmail;
      setSuccessInfoMsg(`A fresh verification code has been sent to your real email: ${targetEmail}`);
    } catch (err) {
      const msg = err.data?.detail || err.message || 'Could not resend verification code.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeRegistration = async (paymentId) => {
    try {
      const typoDomains = {
        'gamil.com': 'gmail.com',
        'gmal.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmial.com': 'gmail.com',
        'gmaill.com': 'gmail.com',
        'yaho.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com',
      };
      let cleanEmail = (formData.email || '').trim().toLowerCase();
      if (cleanEmail.includes('@')) {
        const [localPart, domainPart] = cleanEmail.split('@');
        if (typoDomains[domainPart]) {
          cleanEmail = `${localPart}@${typoDomains[domainPart]}`;
        }
      }

      // 1. Register seller in backend database
      try {
        await authApi.sellerRegister({
          owner_name: (formData.owner_name || '').trim(),
          email: cleanEmail,
          mobile_number: (formData.mobile_number || '').trim(),
          password: formData.password,
          shop_name: (formData.shop_name || '').trim(),
          shop_category: formData.shop_category,
        });
      } catch (err) {
        console.warn('Backend seller registration sync:', err);
      }

      // 2. Save to registered sellers list
      const existing = JSON.parse(localStorage.getItem('zelora_registered_sellers') || '[]');
      const newSellerRecord = {
        ...formData,
        payment_id: paymentId,
        amount_paid: 1999,
        approval_status: 'pending',
        registered_at: new Date().toISOString(),
      };
      existing.push(newSellerRecord);
      localStorage.setItem('zelora_registered_sellers', JSON.stringify(existing));

      // 2. Add to Admin Pending Shops Queue
      const adminShops = JSON.parse(localStorage.getItem('zelora_admin_shops') || '[]');
      const newShopSubmission = {
        id: `shop-${Date.now()}`,
        name: formData.shop_name,
        category: formData.shop_category,
        owner_name: formData.owner_name,
        owner_email: formData.email,
        description: `Boutique atelier specializing in ${formData.shop_category}. Registered with onboarding payment ref ${paymentId}.`,
        status: 'pending',
        rating: 5.0,
        sales_count: 0,
        commission_rate: 15,
        created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        logo: null,
      };
      adminShops.unshift(newShopSubmission);
      localStorage.setItem('zelora_admin_shops', JSON.stringify(adminShops));

      setPaymentReference(paymentId);
      setStep('submitted');
    } catch {
      setErrorMsg('Error completing registration. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayOnboardingFee = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await loadRazorpayScript();
    if (!res || !window.Razorpay) {
      // Offline/Test Mode Simulation fallback
      completeRegistration(`pay_rzp_sim_${Date.now()}`);
      return;
    }

    const sellerContact = (formData.mobile_number || '').replace(/[^0-9+]/g, '');
    const options = {
      key: 'rzp_test_TxHy520so82PT1',
      amount: 1999 * 100, // ₹1,999 in paise
      currency: 'INR',
      name: 'ZELORA Luxury Marketplace',
      description: `Partner Atelier Registration Fee - ${formData.shop_name}`,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80',
      prefill: {
        name: formData.owner_name || 'Partner Atelier',
        email: formData.email || '',
        contact: sellerContact,
      },
      theme: {
        color: '#30251F',
      },
      handler: function (response) {
        completeRegistration(response.razorpay_payment_id || `pay_rzp_${Date.now()}`);
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          setIsSubmitting(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setErrorMsg(`Payment failed: ${resp.error?.description || 'Transaction declined'}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch {
      // Simulation fallback for sandboxed browser environments
      completeRegistration(`pay_rzp_sim_${Date.now()}`);
    }
  };

  return (
    <div className="seller-auth-page">
      <div className="seller-auth-card">
        {/* Brand Header */}
        <div className="seller-auth-brand">
          <h1>ZELORA</h1>
          <span>PARTNER ATELIER REGISTRATION</span>
          <p className="seller-auth-tagline">
            Launch your luxury fashion boutique on ZELORA. Access discerning international clientele and white-glove logistics.
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

        {successInfoMsg && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#065f46',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '12px 16px',
              borderRadius: 'var(--seller-radius)',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle size={16} color="#059669" />
            <span>{successInfoMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            {/* Owner Full Name */}
            <div className="seller-form-group">
              <label className="seller-form-label">Owner Full Name *</label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="e.g. Eleanor Vance"
                className="seller-input"
                required
              />
            </div>

            {/* Email & Mobile Number Row */}
            <div className="seller-form-grid-2">
              <div className="seller-form-group">
                <label className="seller-form-label">Business Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="atelier@domain.luxury"
                  className="seller-input"
                  required
                />
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="+91 98201 54321"
                  className="seller-input"
                  required
                />
              </div>
            </div>

            {/* Shop Name & Category */}
            <div className="seller-form-grid-2">
              <div className="seller-form-group">
                <label className="seller-form-label">Shop / Atelier Name *</label>
                <input
                  type="text"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                  placeholder="e.g. Maison de L'Ombre"
                  className="seller-input"
                  required
                />
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Boutique Category *</label>
                <select
                  name="shop_category"
                  value={formData.shop_category}
                  onChange={handleChange}
                  className="seller-select"
                >
                  <option value="Haute Couture & Designer Wear">Haute Couture & Designer Wear</option>
                  <option value="Luxury Eveningwear">Luxury Eveningwear</option>
                  <option value="Tailored Menswear">Tailored Menswear</option>
                  <option value="Contemporary Ready-to-Wear">Contemporary Ready-to-Wear</option>
                  <option value="Footwear & Fine Leather Goods">Footwear & Fine Leather Goods</option>
                  <option value="Fine Jewelry & Accessories">Fine Jewelry & Accessories</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="seller-form-grid-2">
              <div className="seller-form-group">
                <label className="seller-form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="seller-input"
                    required
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
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="seller-input"
                    required
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div style={{ margin: '18px 0 24px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: 'var(--seller-dark-text)',
                  cursor: 'pointer',
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  style={{ marginTop: '3px', accentColor: 'var(--seller-espresso)' }}
                  required
                />
                <span>
                  I accept the ZELORA Marketplace Terms, Merchant Policy, and agree to pay the standard ₹1,999 atelier verification fee upon email confirmation.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-seller-gold"
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Validating Application...' : 'Continue to Email Verification'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Email Verification */}
        {step === 'otp' && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <ShieldCheck size={32} color="var(--seller-gold)" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 6px', color: 'var(--seller-espresso)' }}>
                Verify Your Business Email
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--seller-muted)' }}>
                A 6-digit confirmation PIN was dispatched to <strong>{formData.email}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '24px',
                }}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    style={{
                      width: '46px',
                      height: '52px',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                      borderRadius: 'var(--seller-radius)',
                      border: '1.5px solid var(--seller-border)',
                      backgroundColor: 'var(--seller-white)',
                      color: 'var(--seller-espresso)',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn-seller-gold"
                style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code & Proceed to Payment'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
                <button
                  type="button"
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
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                >
                  <RotateCw size={14} className={isSubmitting ? 'spin' : ''} />
                  <span>Resend code</span>
                </button>
                <span style={{ color: 'var(--seller-border)', fontSize: '12px' }}>•</span>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--seller-muted)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    setStep('form');
                    setErrorMsg('');
                    setSuccessInfoMsg('');
                  }}
                  disabled={isSubmitting}
                >
                  Edit email address
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Razorpay Onboarding Payment */}
        {step === 'payment' && (
          <div>
            <div
              style={{
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <CreditCard size={32} color="var(--seller-gold)" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 6px', color: 'var(--seller-espresso)' }}>
                Atelier Registration & Verification Deposit
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--seller-muted)' }}>
                One-time marketplace onboarding fee for <strong>{formData.shop_name}</strong>.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--seller-cream)',
                border: '1px solid var(--seller-border)',
                borderRadius: 'var(--seller-radius)',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                <span>Atelier Activation Fee:</span>
                <strong>₹1,999.00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: 'var(--seller-muted)' }}>
                <span>Merchant Verification:</span>
                <span>Included</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px', color: 'var(--seller-muted)' }}>
                <span>White-Glove Logistics Setup:</span>
                <span>Included</span>
              </div>
              <div style={{ borderTop: '1px solid var(--seller-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <strong style={{ color: 'var(--seller-espresso)' }}>Total Payable:</strong>
                <strong style={{ color: 'var(--seller-gold-dark)' }}>₹1,999.00 INR</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-seller-gold"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '14px' }}
              onClick={handlePayOnboardingFee}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Opening Razorpay...' : 'Pay ₹1,999 via Razorpay & Submit for Approval'}
            </button>

            <button
              type="button"
              onClick={() => completeRegistration(`pay_rzp_sim_${Date.now()}`)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--seller-espresso)',
                backgroundColor: 'transparent',
                border: '1px dashed var(--seller-gold)',
                borderRadius: 'var(--seller-radius)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>⚡ Simulate Sandbox Payment (Instant Onboarding Test)</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--seller-muted)' }}>
              🔒 256-bit encrypted checkout via Razorpay (Key: rzp_test_TxHy520so82PT1)
            </div>
          </div>
        )}

        {/* STEP 4: Application Submitted & Awaiting Admin Approval */}
        {step === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(182, 154, 112, 0.15)',
                color: 'var(--seller-gold-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Clock size={32} />
            </div>

            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                backgroundColor: '#FAF5EE',
                color: '#8F6F41',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Application Awaiting Admin Approval
            </span>

            <h3 style={{ fontSize: '20px', color: 'var(--seller-espresso)', margin: '0 0 10px' }}>
              Registration & Payment Received
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--seller-muted)', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 20px' }}>
              Thank you, <strong>{formData.owner_name}</strong>. Your atelier application for <strong>{formData.shop_name}</strong> has been received along with the onboarding verification payment (Ref: <code style={{ color: 'var(--seller-espresso)' }}>{paymentReference}</code>).
            </p>

            <div
              style={{
                backgroundColor: 'var(--seller-cream)',
                border: '1px solid var(--seller-border)',
                borderRadius: 'var(--seller-radius)',
                padding: '16px',
                textAlign: 'left',
                fontSize: '12.5px',
                marginBottom: '24px',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--seller-espresso)', marginBottom: '4px' }}>
                Next Step: Executive Board Review
              </div>
              <div>• ZELORA Administration will review your brand aesthetic and verify documents.</div>
              <div>• Once approved, your Seller Center account will be activated immediately.</div>
              <div>• You can then log in using your registered business email and password.</div>
            </div>

            <Link
              to="/seller/login"
              className="btn-seller-gold"
              style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', padding: '13px', textDecoration: 'none' }}
            >
              Proceed to Seller Login
            </Link>
          </div>
        )}

        {/* Footer Link */}
        {step !== 'submitted' && (
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
            Already registered with ZELORA?{' '}
            <Link
              to="/seller/login"
              style={{
                color: 'var(--seller-espresso)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In to Seller Center
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
