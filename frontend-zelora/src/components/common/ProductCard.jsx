import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    if (product.sizes && product.sizes.length > 1) {
      setShowSizePicker(true);
    } else {
      addToCart(product, selectedSize || 'Standard');
    }
  };

  const handleSelectSizeAndAdd = (e, size) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${product.id}` } } });
      return;
    }
    setSelectedSize(size);
    addToCart(product, size);
    setShowSizePicker(false);
  };

  return (
    <div
      className="zelora-product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizePicker(false);
      }}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="product-image-container">
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />

        {/* Badges */}
        <div className="product-card-badges">
          {product.isNew && <span className="card-badge badge-new">NEW</span>}
          {product.discount > 0 && (
            <span className="card-badge badge-sale">-{product.discount}%</span>
          )}
          {product.isTrending && !product.isNew && (
            <span className="card-badge badge-trend">TRENDING</span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          className={`card-wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart size={18} fill={inWishlist ? '#000000' : 'none'} stroke="#000000" />
        </button>

        {/* Quick Add Overlay */}
        <div className="card-quick-actions" onClick={(e) => e.stopPropagation()}>
          {showSizePicker ? (
            <div className="card-size-selector">
              <span className="size-prompt">Select Size:</span>
              <div className="size-chip-list">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-mini-chip ${selectedSize === s ? 'selected' : ''}`}
                    onClick={(e) => handleSelectSizeAndAdd(e, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-card-add"
              onClick={handleQuickAdd}
            >
              <ShoppingBag size={15} />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Meta */}
      <div className="product-card-meta">
        <div className="product-brand-rating">
          <span className="product-card-brand">{product.brand}</span>
          <div className="product-card-stars">
            <Star size={13} fill="#000000" stroke="#000000" />
            <span>{product.rating}</span>
            <span className="review-count">({product.reviewCount})</span>
          </div>
        </div>

        <h3 className="product-card-title">
          <Link
            to={`/products/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="product-title-link"
          >
            {product.name}
          </Link>
        </h3>

        <div className="product-card-price-row">
          <span className="product-current-price">₹{product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-original-price">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}

