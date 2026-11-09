import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Eye,
  ArrowRight,
  ArrowLeft,
  Check,
  Star
} from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, moveToCart, wishlistCount } = useWishlist();
  const { showToast } = useCart();

  const handleAddToCartFromWishlist = (product) => {
    const defaultSize = product.sizes ? product.sizes[0] : 'Standard';
    moveToCart(product, defaultSize);
  };

  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="wishlist-page-main">
        <div className="wishlist-page-container">
          {/* Header */}
          <div className="wishlist-header-row">
            <div>
              <span className="section-pretitle">SAVED EDITORIAL PIECES</span>
              <h1 className="wishlist-page-title">My Wishlist ({wishlistCount})</h1>
            </div>
            <Link to="/products" className="continue-shopping-top-link">
              <ArrowLeft size={16} />
              <span>Explore Collections</span>
            </Link>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="wishlist-grid">
              {wishlistItems.map((product) => (
                <div key={product.id} className="wishlist-card">
                  {/* Image Container */}
                  <div className="wishlist-image-wrap">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="wishlist-product-img"
                      />
                    </Link>

                    {/* Remove Cross Button */}
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Stock Status Pill */}
                    <div className="wishlist-stock-badge">
                      {product.inStock ? (
                        <span className="stock-in-pill">
                          <Check size={11} /> In Stock
                        </span>
                      ) : (
                        <span className="stock-out-pill">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Content Meta */}
                  <div className="wishlist-content">
                    <span className="wishlist-brand">{product.brand}</span>
                    <h3 className="wishlist-title">
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>

                    <div className="wishlist-rating">
                      <Star size={13} fill="#000" stroke="#000" />
                      <span>{product.rating}</span>
                      <small>({product.reviewCount})</small>
                    </div>

                    <div className="wishlist-price-row">
                      <span className="current-price">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="original-price">₹{product.originalPrice}</span>
                          <span className="discount-tag">-{product.discount}%</span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="wishlist-actions-row">
                      <button
                        type="button"
                        className="btn-wishlist-cart"
                        onClick={() => handleAddToCartFromWishlist(product)}
                      >
                        <ShoppingBag size={15} />
                        <span>Add to Cart</span>
                      </button>

                      <Link
                        to={`/products/${product.id}`}
                        className="btn-wishlist-view"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-wishlist-state">
              <div className="empty-wishlist-icon-box">
                <Heart size={48} strokeWidth={1.2} />
              </div>
              <h2>Your Wishlist is Empty</h2>
              <p>
                Save items you covet while browsing. Review, curate, or add them directly to your shopping cart anytime.
              </p>
              <Link to="/products" className="btn-hero-primary">
                <span>Start Curating</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

