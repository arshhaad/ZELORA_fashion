import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Key,
  LogOut,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, refreshProfile } = useAuth();
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestAuth = async () => {
    setTestingEndpoint(true);
    setTestResult(null);
    try {
      await refreshProfile();
      setTestResult({
        status: 'success',
        message: 'JWT Token verified with /api/auth/me/ successfully.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      setTestResult({
        status: 'error',
        message: err.message || 'Verification failed.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  if (!user) {
    return null;
  }

  const joinDate = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div className="dashboard-container">
      {/* Top Banner */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-badge">ZELORA ACCOUNT</div>
          <h1>
            Welcome back,{' '}
            <span className="name-highlight">
              {user.first_name || user.email.split('@')[0]}
            </span>
            !
          </h1>
          <p className="hero-desc">
            You are securely authenticated to the <strong>ZELORA</strong> platform.
          </p>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="btn-outline-danger"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dash-card profile-card">
          <div className="card-header">
            <h3>Member Profile</h3>
            <span className="badge-pill verified">
              <ShieldCheck size={14} /> {user.is_email_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>

          <div className="profile-identity">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="profile-big-avatar" />
            ) : (
              <div className="profile-big-placeholder">
                {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div className="profile-names">
              <h4>
                {user.first_name || user.last_name
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : 'Member'}
              </h4>
              <p className="profile-email-text">
                <Mail size={14} /> {user.email}
              </p>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Member ID</span>
              <span className="info-val font-mono">#{user.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Authentication Method</span>
              <span className="info-val capitalize">
                {user.auth_provider === 'google' ? (
                  <span className="provider-tag google">
                    <Globe size={13} /> Google Account
                  </span>
                ) : (
                  <span className="provider-tag email">
                    <Lock size={13} /> Email & Password
                  </span>
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Verified</span>
              <span className="info-val">
                {user.is_email_verified ? (
                  <span className="text-success font-semibold">Yes (Active)</span>
                ) : (
                  <span className="text-warning font-semibold">No (Pending)</span>
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-val">
                <Calendar size={13} /> {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="dash-card security-card">
          <div className="card-header">
            <h3>Session & Security</h3>
            <span className="badge-pill status-active">Active JWT</span>
          </div>

          <p className="card-text">
            Your session is secured using JSON Web Tokens (Access + Refresh tokens) with automatic rotation and cryptographic verification.
          </p>

          <div className="security-features-box">
            <div className="sec-feature">
              <CheckCircle size={16} className="text-success" />
              <span>Google Identity & OAuth 2.0 Enabled</span>
            </div>
            <div className="sec-feature">
              <CheckCircle size={16} className="text-success" />
              <span>Email Verification with 6-digit OTP</span>
            </div>
            <div className="sec-feature">
              <CheckCircle size={16} className="text-success" />
              <span>Self-service Forgot Password Recovery</span>
            </div>
            <div className="sec-feature">
              <CheckCircle size={16} className="text-success" />
              <span>Token Blacklisting on Sign Out</span>
            </div>
          </div>

          <div className="card-action-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestAuth}
              disabled={testingEndpoint}
            >
              <RefreshCw size={14} className={testingEndpoint ? 'spin' : ''} />
              <span>Test JWT Auth (/api/auth/me/)</span>
            </button>
          </div>

          {testResult && (
            <div className={`test-feedback ${testResult.status}`}>
              <span>{testResult.message}</span>
              <small className="feedback-time">{testResult.timestamp}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

