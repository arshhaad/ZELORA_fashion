import { useState } from 'react';
import AccountLayout from '../../components/account/AccountLayout';
import { useCustomer } from '../../context/CustomerContext';
import {
  Plus,
  MapPin,
  Phone,
  Trash2,
  Edit2,
  Check,
  Star,
  X,
  Home,
  Briefcase
} from 'lucide-react';

export default function AddressesPage() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCustomer();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formState, setFormState] = useState({
    full_name: '',
    mobile_number: '',
    house_building: '',
    street_area: '',
    city: '',
    state: '',
    pin_code: '',
    address_type: 'Home',
    is_default: false,
  });

  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormState({
      full_name: '',
      mobile_number: '',
      house_building: '',
      street_area: '',
      city: '',
      state: '',
      pin_code: '',
      address_type: 'Home',
      is_default: addresses.length === 0,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setFormState({
      full_name: addr.full_name || '',
      mobile_number: addr.mobile_number || '',
      house_building: addr.house_building || '',
      street_area: addr.street_area || '',
      city: addr.city || '',
      state: addr.state || '',
      pin_code: addr.pin_code || '',
      address_type: addr.address_type || 'Home',
      is_default: addr.is_default || false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (
      !formState.full_name.trim() ||
      !formState.mobile_number.trim() ||
      !formState.house_building.trim() ||
      !formState.street_area.trim() ||
      !formState.city.trim() ||
      !formState.state.trim() ||
      !formState.pin_code.trim()
    ) {
      setFormError('Please fill in all mandatory address details.');
      return;
    }

    if (editingAddress) {
      await updateAddress(editingAddress.id, formState);
    } else {
      await addAddress(formState);
    }

    setModalOpen(false);
  };

  return (
    <AccountLayout
      activeTab="addresses"
      title="Saved Delivery Addresses"
      subtitle="Manage your residential and studio delivery locations for swift, frictionless checkout."
    >
      <div className="addresses-page-wrap">
        <div className="addresses-top-action-bar">
          <span className="addresses-count">
            {addresses.length} saved location(s)
          </span>
          <button
            type="button"
            className="btn-zelora-primary btn-sm flex-center"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="addresses-cards-grid">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`address-item-card ${addr.is_default ? 'is-default-card' : ''}`}
            >
              <div className="address-card-header">
                <div className="type-badge-row">
                  <span className="addr-type-tag">
                    {addr.address_type === 'Home' && <Home size={12} />}
                    {addr.address_type === 'Work' && <Briefcase size={12} />}
                    <span>{addr.address_type}</span>
                  </span>
                  {addr.is_default && (
                    <span className="default-pill">
                      <Check size={12} /> Default
                    </span>
                  )}
                </div>

                <div className="address-item-actions">
                  <button
                    type="button"
                    className="icon-action-btn"
                    onClick={() => handleOpenEdit(addr)}
                    title="Edit Address"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-action-btn delete"
                    onClick={() => deleteAddress(addr.id)}
                    title="Delete Address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h4 className="addr-recipient-name">{addr.full_name}</h4>
              <p className="addr-phone">
                <Phone size={13} /> {addr.mobile_number}
              </p>

              <p className="addr-full-text">
                {addr.house_building}, {addr.street_area}
                <br />
                {addr.city}, {addr.state} — {addr.pin_code}
              </p>

              {!addr.is_default && (
                <div className="addr-card-footer">
                  <button
                    type="button"
                    className="set-default-btn"
                    onClick={() => setDefaultAddress(addr.id)}
                  >
                    Set as Default Address
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Address Placeholder Card */}
          <button
            type="button"
            className="address-add-placeholder-card"
            onClick={handleOpenAdd}
          >
            <div className="plus-icon-circle">
              <Plus size={24} />
            </div>
            <strong>Add New Delivery Address</strong>
            <span>Save a new destination for faster concierge dispatch</span>
          </button>
        </div>
      </div>

      {/* Address Modal (Add / Edit) */}
      {modalOpen && (
        <div className="size-guide-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="address-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {formError && <div className="alert alert-error mb-16">{formError}</div>}

            <form onSubmit={handleSubmit} className="address-modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formState.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Helena Vance"
                    required
                    className="zelora-input"
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formState.mobile_number}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                    className="zelora-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>House / Flat / Building Name *</label>
                <input
                  type="text"
                  name="house_building"
                  value={formState.house_building}
                  onChange={handleChange}
                  placeholder="Apartment 14B, Monolith Residences"
                  required
                  className="zelora-input"
                />
              </div>

              <div className="form-group">
                <label>Street / Colony / Area *</label>
                <input
                  type="text"
                  name="street_area"
                  value={formState.street_area}
                  onChange={handleChange}
                  placeholder="42 Crescent Avenue, Bandra West"
                  required
                  className="zelora-input"
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formState.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    required
                    className="zelora-input"
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formState.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    required
                    className="zelora-input"
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    name="pin_code"
                    value={formState.pin_code}
                    onChange={handleChange}
                    placeholder="400050"
                    required
                    className="zelora-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address Type</label>
                <div className="address-type-selector">
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`type-select-btn ${formState.address_type === type ? 'active' : ''}`}
                      onClick={() => setFormState((prev) => ({ ...prev, address_type: type }))}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="checkbox-custom-row">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formState.is_default}
                  onChange={handleChange}
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="modal-form-actions">
                <button
                  type="button"
                  className="btn-zelora-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-hero-primary">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}

