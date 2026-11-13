import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import Toast from '../components/common/Toast';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  Ruler,
  X,
  Share2
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, showToast } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  // Find product
  const product = PRODUCTS.find((p) => p.id === id || p.slug === id);

  // States
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState([]);

  // Reset and scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setSelectedImage(0);
      setSelectedSize('');
      setSelectedColor(product.colors?.[0]?.name || '');
      setQuantity(1);
      setSizeError(false);
      setReviewsList(product.reviews || []);
      // Add to recently viewed
      addRecentlyViewed(product);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="zelora-page-wrapper">
        <Navbar />
        <div className="product-not-found">
          <h2>Product Not Found</h2>
          <p>The piece you are looking for has been archived or does not exist.</p>
          <Link to="/products" className="btn-hero-primary">
            Back to Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      showToast('Please select a garment size before adding to cart.', 'error');
      return;
    }

    setSizeError(false);
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      showToast('Please select a garment size first.', 'error');
      return;
    }

    setSizeError(false);
    const itemColor = selectedColor || (product.colors && product.colors[0]?.name) || 'Noir Black';
    const itemSize = selectedSize || (product.sizes ? product.sizes[0] : 'Standard');
    const buyNowItem = {
      id: `buy-now-${product.id}-${itemSize}-${itemColor}`,
      product,
      size: itemSize,
      color: itemColor,
      quantity,
    };

    try {
      sessionStorage.setItem('zelora_buy_now_item', JSON.stringify(buyNowItem));
    } catch {
      // Ignore storage errors; router state carries the direct purchase item
    }

    navigate('/checkout', { state: { mode: 'buy-now', item: buyNowItem } });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: `r-${Date.now()}`,
      user: newReviewName.trim(),
      rating: Number(newReviewRating),
      date: 'Just now',
      comment: newReviewComment.trim(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewName('');
    setNewReviewComment('');
    showToast('Thank you. Your customer review has been published.');
  };

  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="product-detail-main">
        {/* Breadcrumb Navigation */}
        <div className="pdp-breadcrumbs">
          <div className="pdp-breadcrumbs-container">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Collections</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`} className="capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="current">{product.name}</span>
          </div>
        </div>

        {/* Top Product Section */}
        <div className="pdp-top-container">
          {/* Gallery Area */}
          <div className="pdp-gallery-area">
            {/* Thumbnails Column */}
            <div className="pdp-thumbnails-list">
              {product.images.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  className={`pdp-thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={imgUrl} alt={`${product.name} angle ${index + 1}`} />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="pdp-main-image-wrap">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="pdp-stage-image"
              />
              <button
                type="button"
                className={`pdp-wishlist-float ${inWishlist ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle Wishlist"
              >
                <Heart size={20} fill={inWishlist ? '#000000' : 'none'} stroke="#000000" />
              </button>
            </div>
          </div>

          {/* Product Info & Actions Area */}
          <div className="pdp-info-area">
            <div className="pdp-meta-top-row">
              <span className="pdp-brand-tag">{product.brand}</span>
              <span className="pdp-meta-divider">•</span>
              <span className="pdp-seller-display">
                Seller: <strong>{product.seller || `${product.brand} Atelier`}</strong>
              </span>
            </div>
            <h1 className="pdp-title">{product.name}</h1>

            {/* Price & Rating Row */}
            <div className="pdp-price-rating-row">
              <div className="pdp-price-box">
                <span className="pdp-current-price">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="pdp-original-price">₹{product.originalPrice}</span>
                    <span className="pdp-discount-badge">SAVE {product.discount}%</span>
                  </>
                )}
              </div>

              <div className="pdp-rating-stars">
                <div className="stars-cluster">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(product.rating) ? '#000000' : 'none'}
                      stroke="#000000"
                    />
                  ))}
                </div>
                <span className="pdp-rating-num">{product.rating}</span>
                <span className="pdp-reviews-count">({reviewsList.length} reviews)</span>
              </div>
            </div>

            <p className="pdp-lead-desc">{product.description}</p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <span className="option-title">COLOR:</span>
                  <span className="option-selected-val">{selectedColor}</span>
                </div>
                <div className="color-swatches-row">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`color-swatch-btn ${selectedColor === c.name ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                    >
                      <span className="color-dot" style={{ backgroundColor: c.hex }} />
                      <span className="color-swatch-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection (Required) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pdp-option-section">
                <div className="pdp-option-header">
                  <span className="option-title">SELECT SIZE:</span>
                  <button
                    type="button"
                    className="size-guide-trigger"
                    onClick={() => setSizeGuideOpen(true)}
                  >
                    <Ruler size={14} />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="size-selector-pills">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`size-pill-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {sizeError && (
                  <div className="size-error-notice">
                    <AlertCircle size={14} />
                    <span>Please select an available size to continue.</span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Stock Info */}
            <div className="pdp-qty-stock-row">
              <div className="pdp-quantity-control">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-number">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() =>
                    setQuantity((q) =>
                      product.stockCount ? Math.min(product.stockCount, q + 1) : q + 1
                    )
                  }
                  disabled={product.stockCount ? quantity >= product.stockCount : false}
                >
                  +
                </button>
              </div>

              <div className="pdp-stock-status">
                {product.inStock ? (
                  <span className="stock-in">
                    <Check size={14} /> In Stock ({product.stockCount} units remaining)
                  </span>
                ) : (
                  <span className="stock-out">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pdp-actions-row">
              <button
                type="button"
                className="btn-pdp-add-cart"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                className="btn-pdp-buy-now"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="pdp-assurances-box">
              <div className="assurance-item">
                <Truck size={18} />
                <div>
                  <strong>Free Express Delivery</strong>
                  <span>Complimentary on orders over ₹500. Tracked courier.</span>
                </div>
              </div>
              <div className="assurance-item">
                <RotateCcw size={18} />
                <div>
                  <strong>30-Day Hassle-Free Returns</strong>
                  <span>Free pick-up and exchange in original packaging.</span>
                </div>
              </div>
              <div className="assurance-item">
                <ShieldCheck size={18} />
                <div>
                  <strong>Authentic Atelier Guarantee</strong>
                  <span>Every garment is authenticated by ZELORA quality inspection.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info Section (Details, Care, Reviews) */}
        <div className="pdp-tabs-container">
          <div className="pdp-tabs-nav">
            <button
              type="button"
              className={`pdp-tab-nav-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description & Specifications
            </button>
            <button
              type="button"
              className={`pdp-tab-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Customer Reviews ({reviewsList.length})
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'description' && (
              <div className="description-tab-inner">
                <h3>Craftsmanship & Details</h3>
                <p>{product.description}</p>

                {/* Seller & Product Specifications */}
                <div className="pdp-specifications-box">
                  <h4 className="pdp-spec-heading">Garment & Seller Specifications</h4>
                  <div className="pdp-spec-grid">
                    <div className="pdp-spec-item">
                      <span className="spec-label">Seller</span>
                      <strong className="spec-value">{product.seller || `${product.brand} Atelier`}</strong>
                    </div>
                    <div className="pdp-spec-item">
                      <span className="spec-label">Fashion Brand</span>
                      <span className="spec-value">{product.brand}</span>
                    </div>
                    <div className="pdp-spec-item">
                      <span className="spec-label">Category</span>
                      <span className="spec-value capitalize">{product.category}</span>
                    </div>
                    <div className="pdp-spec-item">
                      <span className="spec-label">Authenticity</span>
                      <span className="spec-value">100% Certified Original Atelier Piece</span>
                    </div>
                  </div>
                </div>

                <ul className="details-checklist">
                  {product.details?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab-inner">
                <div className="reviews-header-summary">
                  <div className="rating-big-card">
                    <span className="big-rating-number">{product.rating}</span>
                    <div className="stars-cluster">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="#000" stroke="#000" />
                      ))}
                    </div>
                    <span className="based-on-text">Based on {reviewsList.length} verified reviews</span>
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="add-review-form">
                    <h4>Leave an Editorial Review</h4>
                    <div className="form-row-2">
                      <input
                        type="text"
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="Your Name (e.g. Katherine S.)"
                        required
                        className="review-input"
                      />
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="review-select"
                      >
                        <option value={5}>5 Stars - Exceptional</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                      </select>
                    </div>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Comment on fit, fabric texture, drape..."
                      rows={3}
                      required
                      className="review-textarea"
                    />
                    <button type="submit" className="btn-hero-primary btn-sm">
                      Submit Review
                    </button>
                  </form>
                </div>

                {/* Review Cards List */}
                <div className="reviews-cards-list">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="review-card-item">
                      <div className="review-user-header">
                        <strong>{rev.user}</strong>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <div className="stars-cluster">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? '#000' : 'none'}
                            stroke="#000"
                          />
                        ))}
                      </div>
                      <p className="review-comment-body">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <section className="pdp-related-section">
            <div className="section-header-wrap">
              <div>
                <span className="section-pretitle">COMPLETE THE MONOCHROME AESTHETIC</span>
                <h2 className="section-main-title">Related Pieces</h2>
              </div>
              <Link to="/products" className="section-view-all-btn">
                <span>View Collections</span>
              </Link>
            </div>

            <div className="product-grid-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="size-guide-modal-backdrop" onClick={() => setSizeGuideOpen(false)}>
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Garment Size & Measurement Guide</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSizeGuideOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>All ZELORA garments are tailored in European metric standards with structured silhouettes.</p>
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (in)</th>
                    <th>Waist (in)</th>
                    <th>Hips (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>XS</td><td>32 - 34</td><td>24 - 26</td><td>34 - 36</td></tr>
                  <tr><td>S</td><td>34 - 36</td><td>26 - 28</td><td>36 - 38</td></tr>
                  <tr><td>M</td><td>36 - 38</td><td>28 - 30</td><td>38 - 40</td></tr>
                  <tr><td>L</td><td>38 - 40</td><td>30 - 32</td><td>40 - 42</td></tr>
                  <tr><td>XL</td><td>40 - 43</td><td>32 - 35</td><td>42 - 45</td></tr>
                </tbody>
              </table>
              <small className="guide-note">Need bespoke adjustments? Contact our atelier concierge.</small>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

