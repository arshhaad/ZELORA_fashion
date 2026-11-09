import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Plus,
  AlertCircle,
  Boxes,
} from 'lucide-react';

export default function EditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct } = useSeller();

  const product = products.find((p) => p.id === productId);

  const [formData, setFormData] = useState(null);
  const [newColorInput, setNewColorInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'Dresses',
        gender: product.gender || 'Women',
        brand: product.brand || 'ZELORA Atelier',
        regular_price: product.regular_price || '',
        discount_price: product.discount_price || '',
        sku: product.sku || '',
        tags: product.tags || '',
        colors: product.colors || ['Noir Black'],
        images: product.images || [],
        size_stock: {
          XS: product.size_stock?.XS || 0,
          S: product.size_stock?.S || 0,
          M: product.size_stock?.M || 0,
          L: product.size_stock?.L || 0,
          XL: product.size_stock?.XL || 0,
          XXL: product.size_stock?.XXL || 0,
        },
        status: product.status || 'Published',
      });
    }
  }, [product]);

  if (!product || !formData) {
    return (
      <SellerLayout>
        <div className="seller-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle size={36} color="var(--seller-danger)" style={{ margin: '0 auto 12px' }} />
          <h3>Product Not Found</h3>
          <p style={{ color: 'var(--seller-muted)', margin: '0 0 20px' }}>
            The requested garment does not exist in your boutique portfolio.
          </p>
          <Link to="/seller/products" className="btn-seller-primary">
            Return to Garments
          </Link>
        </div>
      </SellerLayout>
    );
  }

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
    if (newColorInput.trim() && !formData.colors.includes(newColorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColorInput.trim()],
      }));
      setNewColorInput('');
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
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newUrls],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const totalStock = Object.values(formData.size_stock).reduce((a, b) => a + b, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Please enter a product name.');
      return;
    }
    if (!formData.regular_price || parseFloat(formData.regular_price) <= 0) {
      setValidationError('Please enter a valid regular retail price.');
      return;
    }
    if (formData.images.length === 0) {
      setValidationError('At least one garment image is required.');
      return;
    }

    setIsSubmitting(true);

    const activeSizes = Object.keys(formData.size_stock).filter(
      (s) => formData.size_stock[s] > 0
    );

    const updatedPayload = {
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
      colors: formData.colors,
      sku: formData.sku.toUpperCase(),
      tags: formData.tags,
      stock_quantity: totalStock,
      status: totalStock === 0 ? 'Out of Stock' : formData.status,
    };

    updateProduct(productId, updatedPayload);
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
          <h1>Edit Garment: {product.name}</h1>
          <p className="seller-page-subtitle">
            Update pricing, lookbook images, specifications, and size-level stock inventory.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-gold"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
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

      <form onSubmit={handleSubmit}>
        <div className="seller-product-form-layout">
          {/* Left Column */}
          <div>
            {/* General Info */}
            <div className="seller-card mb-24">
              <div className="seller-card-title-row">
                <h3>Garment Details</h3>
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Garment Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="seller-input"
                  required
                />
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Garment Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="seller-textarea"
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
                  <label className="seller-form-label">Brand / Atelier *</label>
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

            {/* Images */}
            <div className="seller-card mb-24">
              <div className="seller-card-title-row">
                <h3>Garment Lookbook Images</h3>
                <label className="btn-seller-secondary btn-seller-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={13} /> Add More Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="uploaded-previews-grid">
                {formData.images.map((imgUrl, idx) => (
                  <div key={idx} className="preview-thumb-box">
                    <img src={imgUrl} alt={`Piece ${idx + 1}`} />
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
                        MAIN COVER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes & Stock */}
            <div className="seller-card">
              <div className="seller-card-title-row">
                <div>
                  <h3>Size-wise Stock Matrix</h3>
                  <small style={{ color: 'var(--seller-muted)' }}>
                    Total Units Available: {totalStock}
                  </small>
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Pricing */}
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
                  className="seller-input"
                  required
                />
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Promotional Discount Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
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
                  <option value="Published">Published (Live)</option>
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div className="seller-card mb-24">
              <div className="seller-card-title-row">
                <h3>Color Variants</h3>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  placeholder="e.g. Midnight Navy"
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
                {formData.colors.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'var(--seller-cream)',
                      border: '1px solid var(--seller-border)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {c}
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => handleRemoveColor(c)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SKU & Tags */}
            <div className="seller-card">
              <div className="seller-card-title-row">
                <h3>SKU & Tags</h3>
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="seller-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Product Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="seller-input"
                />
              </div>

              <button
                type="submit"
                className="btn-seller-gold"
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                disabled={isSubmitting}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}

