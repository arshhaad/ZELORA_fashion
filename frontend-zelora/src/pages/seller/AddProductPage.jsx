import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save,
  Layers,
  Tag,
  DollarSign,
  Boxes,
} from 'lucide-react';

export default function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct, shop } = useSeller();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Dresses',
    gender: 'Women',
    brand: shop.name || 'Maison de L\'Ombre',
    regular_price: '',
    discount_price: '',
    sku: `MLO-${Math.floor(100 + Math.random() * 900)}`,
    tags: '',
    colors: ['Noir Black'],
    newColorInput: '',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80&sat=-100',
    ],
    size_stock: {
      XS: 2,
      S: 5,
      M: 5,
      L: 2,
      XL: 0,
      XXL: 0,
    },
    status: 'Published',
  });

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeStockChange = (size, value) => {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setFormData((prev) => ({
      ...prev,
      size_stock: {
        ...prev.size_stock,
        [size]: qty,
      },
    }));
  };

  const handleAddColor = () => {
    if (formData.newColorInput.trim() && !formData.colors.includes(formData.newColorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, prev.newColorInput.trim()],
        newColorInput: '',
      }));
    }
  };

  const handleRemoveColor = (color) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImageUrls = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageUrls],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  // Compute total stock from size matrix
  const totalStock = Object.values(formData.size_stock).reduce((a, b) => a + b, 0);

  const handleSave = (statusToSet) => {
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Please enter a product name.');
      return;
    }
    if (!formData.regular_price || parseFloat(formData.regular_price) <= 0) {
      setValidationError('Please specify a valid regular retail price.');
      return;
    }
    if (formData.images.length === 0) {
      setValidationError('Please upload at least one garment image.');
      return;
    }

    setIsSubmitting(true);

    const activeSizes = Object.keys(formData.size_stock).filter(
      (s) => formData.size_stock[s] > 0
    );

    const productPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      images: formData.images,
      category: formData.category,
      gender: formData.gender,
      brand: formData.brand,
      regular_price: parseFloat(formData.regular_price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      sizes: activeSizes.length > 0 ? activeSizes : ['Standard'],
      size_stock: formData.size_stock,
      colors: formData.colors.length > 0 ? formData.colors : ['Monochrome'],
      sku: formData.sku.toUpperCase(),
      tags: formData.tags,
      stock_quantity: totalStock,
      status: statusToSet || formData.status,
    };

    addProduct(productPayload);
    setIsSubmitting(false);
    navigate('/seller/products');
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <Link
            to="/seller/products"
            style={{
              fontSize: '12px',
              color: 'var(--seller-muted)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '6px',
            }}
          >
            <ArrowLeft size={13} /> Back to Products
          </Link>
          <h1>Add New Fashion Garment</h1>
          <p className="seller-page-subtitle">
            Create and publish a ready-to-wear or couture piece into your boutique catalog.
          </p>
        </div>

        <div className="seller-page-actions">
          <button
            type="button"
            className="btn-seller-secondary"
            onClick={() => handleSave('Draft')}
            disabled={isSubmitting}
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="btn-seller-gold"
            onClick={() => handleSave('Published')}
            disabled={isSubmitting}
          >
            <Save size={16} />
            <span>Publish Garment</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div
          style={{
            backgroundColor: 'var(--seller-danger-bg)',
            color: 'var(--seller-danger)',
            padding: '12px 16px',
            borderRadius: 'var(--seller-radius)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      <div className="seller-product-form-layout">
        {/* Left Column: General Info, Images, Sizes & Inventory */}
        <div>
          {/* 1. General Garment Info */}
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <h3>Garment Information</h3>
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Asymmetrical Draped Silk Gown"
                className="seller-input"
                required
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Garment Description & Craftsmanship</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="seller-textarea"
                placeholder="Detail fabric composition, lining, fit silhouette, tailoring techniques, and care instructions..."
              />
            </div>

            <div className="seller-form-grid-3">
              <div className="seller-form-group">
                <label className="seller-form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="seller-select"
                >
                  <option value="Dresses">Dresses</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Shirts">Shirts</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Target Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="seller-select"
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Brand / Label *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="seller-input"
                />
              </div>
            </div>
          </div>

          {/* 2. Multi-Image Upload */}
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <h3>Lookbook Imagery (Multi-Angle)</h3>
              <small style={{ color: 'var(--seller-muted)' }}>
                {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
              </small>
            </div>

            <label className="seller-dropzone" style={{ display: 'block' }}>
              <Upload size={32} className="dropzone-icon" />
              <p className="dropzone-title">Drop high-res editorial photography or click to upload</p>
              <p className="dropzone-hint">PNG, JPG, WEBP recommended (Min 1200x1600px)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>

            {formData.images.length > 0 && (
              <div className="uploaded-previews-grid">
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="preview-thumb-box">
                    <img src={imgUrl} alt={`Upload ${idx + 1}`} />
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                    {idx === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(48,37,31,0.85)',
                          color: '#fff',
                          fontSize: '9px',
                          textAlign: 'center',
                          padding: '2px',
                          fontWeight: 700,
                        }}
                      >
                        COVER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Sizes & Size-wise Inventory Matrix */}
          <div className="seller-card">
            <div className="seller-card-title-row">
              <div>
                <h3>Size-wise Stock Matrix</h3>
                <small style={{ color: 'var(--seller-muted)' }}>
                  Set available inventory per size. Total stock is calculated dynamically.
                </small>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--seller-muted)', display: 'block' }}>
                  Total Units:
                </span>
                <strong style={{ fontSize: '18px', color: 'var(--seller-espresso)' }}>
                  {totalStock}
                </strong>
              </div>
            </div>

            <div className="size-stock-matrix">
              {availableSizes.map((size) => (
                <div
                  key={size}
                  className={`size-stock-card ${formData.size_stock[size] > 0 ? 'active' : ''}`}
                >
                  <div className="size-pill-label">Size {size}</div>
                  <input
                    type="number"
                    min="0"
                    value={formData.size_stock[size]}
                    onChange={(e) => handleSizeStockChange(size, e.target.value)}
                    className="seller-input"
                    style={{ textAlign: 'center', padding: '6px' }}
                  />
                  <small style={{ display: 'block', marginTop: '4px', fontSize: '10px', color: 'var(--seller-muted)' }}>
                    Units available
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Colors, SKU, Tags */}
        <div>
          {/* Pricing Card */}
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <h3>Pricing (₹ INR)</h3>
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Regular Retail Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="regular_price"
                value={formData.regular_price}
                onChange={handleChange}
                placeholder="e.g. 3200.00"
                className="seller-input"
                required
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Promotional / Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                placeholder="e.g. 2600.00 (optional)"
                className="seller-input"
              />
              <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--seller-muted)' }}>
                Leave empty if selling at regular price.
              </small>
            </div>

            {formData.regular_price && (
              <div
                style={{
                  background: 'var(--seller-beige-light)',
                  padding: '12px',
                  borderRadius: 'var(--seller-radius)',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Est. Atelier Payout (88%):</span>
                  <strong>
                    ₹{((formData.discount_price || formData.regular_price) * 0.88).toFixed(2)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--seller-muted)' }}>
                  <span>Platform Fee (12%):</span>
                  <span>
                    ₹{((formData.discount_price || formData.regular_price) * 0.12).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Color Variants */}
          <div className="seller-card mb-24">
            <div className="seller-card-title-row">
              <h3>Color Variants</h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                value={formData.newColorInput}
                onChange={(e) => setFormData({ ...formData, newColorInput: e.target.value })}
                placeholder="e.g. Champagne Gold"
                className="seller-input"
              />
              <button
                type="button"
                className="btn-seller-secondary"
                onClick={handleAddColor}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {formData.colors.map((clr, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--seller-cream)',
                    border: '1px solid var(--seller-border)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--seller-espresso)',
                  }}
                >
                  {clr}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--seller-muted)' }}
                    onClick={() => handleRemoveColor(clr)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SKU & Identification */}
          <div className="seller-card">
            <div className="seller-card-title-row">
              <h3>Inventory SKU & Tags</h3>
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Product SKU Code *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="seller-input"
                style={{ fontFamily: 'monospace' }}
                required
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Search Tags (Comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="silk, gown, evening, cocktail"
                className="seller-input"
              />
            </div>

            <div className="seller-form-group">
              <label className="seller-form-label">Publishing Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="seller-select"
              >
                <option value="Published">Published (Live in Catalog)</option>
                <option value="Draft">Draft (Private in Atelier)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

