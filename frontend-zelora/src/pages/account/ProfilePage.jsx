import { useState, useEffect } from 'react';
import AccountLayout from '../../components/account/AccountLayout';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { authApi } from '../../services/api';
import { User, Mail, Phone, Calendar, ShieldCheck, Check, AlertCircle, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    avatar_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
        avatar_url: user.avatar_url || '',
      });
    }
    setError('');
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        avatar_url: formData.avatar_url.trim() || null,
      });

      await refreshProfile();
      setSuccess('Profile details updated successfully.');
      showToast('Profile information saved.');
      setIsEditing(false);
    } catch (err) {
      const msg = err.data?.detail || err.message || 'Failed to update profile information.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout
      activeTab="profile"
      title="Personal Information"
      subtitle="Manage your identity, personal details, and atelier communication preferences."
    >
      <div className="profile-page-card">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <Check size={18} className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Picture & Avatar Row */}
        <div className="profile-avatar-row">
          <div className="profile-avatar-large">
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Profile" className="avatar-img-large" />
            ) : (
              <div className="avatar-placeholder-large">
                {(formData.first_name?.[0] || user?.email?.[0] || 'C').toUpperCase()}
              </div>
            )}
            {isEditing && (
              <label className="avatar-edit-badge" title="Change Avatar URL">
                <Camera size={14} />
              </label>
            )}
          </div>

          <div className="profile-avatar-info">
            <h3>{formData.first_name ? `${formData.first_name} ${formData.last_name}` : 'Customer'}</h3>
            <p className="user-email-static">
              <Mail size={14} /> {user?.email}
            </p>
            <div className="verification-status-pill">
              <ShieldCheck size={13} />
              <span>{user?.is_email_verified ? 'Verified Email Address' : 'Pending Verification'}</span>
            </div>
          </div>

          {!isEditing && (
            <div className="profile-edit-btn-wrap">
              <button
                type="button"
                className="btn-zelora-secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="profile-details-form">
          {isEditing && (
            <div className="form-group mb-16">
              <label>Avatar Photo URL (Optional)</label>
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="zelora-input"
              />
              <small className="field-hint">Paste an image URL to customize your customer portrait.</small>
            </div>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="First Name"
                className={`zelora-input ${!isEditing ? 'read-only' : ''}`}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Last Name"
                className={`zelora-input ${!isEditing ? 'read-only' : ''}`}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="zelora-input read-only-locked"
              />
              <small className="field-hint">
                Email is protected by multi-factor authentication and cannot be changed directly.
              </small>
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+91 98765 43210"
                className={`zelora-input ${!isEditing ? 'read-only' : ''}`}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Gender (Optional)</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={`zelora-select-field ${!isEditing ? 'read-only' : ''}`}
              >
                <option value="">Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth (Optional)</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={!isEditing}
                className={`zelora-input ${!isEditing ? 'read-only' : ''}`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="profile-form-actions">
              <button
                type="button"
                className="btn-zelora-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-hero-primary"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </AccountLayout>
  );
}

