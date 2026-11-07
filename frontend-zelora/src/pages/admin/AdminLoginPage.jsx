import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import '../../components/admin/admin.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAdmin();

  const [email, setEmail] = useState('admin@zelora.luxury');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify Django superuser credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">
        {/* Brand Header */}
        <div className="admin-login-brand">
          <h1 className="admin-login-title">ZELORA</h1>
          <span className="admin-login-badge">
            <Sparkles size={11} style={{ display: 'inline', marginRight: '4px' }} />
            SUPER ADMIN CONSOLE
          </span>
          <p style={{ fontSize: '13px', color: '#9E9EA8', marginTop: '10px' }}>
            Executive Platform Administration & Governance
          </p>
        </div>

        {error && (
          <div className="admin-login-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label className="admin-label">
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Superuser Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zelora.luxury"
              className="admin-input"
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-label">
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="admin-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-admin-gold"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Executive Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Superuser Quick Assist Card */}
        <div style={{
          marginTop: '24px',
          padding: '14px',
          backgroundColor: '#0B0B0E',
          borderRadius: '8px',
          border: '1px solid #23232C'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#C6A664', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Django Superuser Credentials
            </span>
            <button
              type="button"
              onClick={() => handleFillDemo('admin@zelora.luxury', 'Admin@12345')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#C6A664',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Autofill
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#9E9EA8', lineHeight: 1.5 }}>
            <div><strong>Email:</strong> admin@zelora.luxury</div>
            <div><strong>Password:</strong> Admin@12345</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#9E9EA8', textDecoration: 'none' }}>
            ← Return to ZELORA Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

