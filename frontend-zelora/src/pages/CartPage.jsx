import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Trash2,
  Heart,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    subtotal,
    discountTotal,
    discountedSubtotal,
    deliveryCharge,
    totalAmount,
    showToast,
  } = useCart();

  const { toggleWishlist, isInWishlist } = useWishlist();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'ZELORA10' || code === 'MONOCHROME') {
      const discountVal = Math.round(discountedSubtotal * 0.1);
      setAppliedPromo({ code, discount: discountVal, percent: 10 });
      showToast('Promo code applied: 10% additional discount.');
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try "ZELORA10" for 10% off.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    showToast('Promo code removed.', 'info');
  };

  const finalTotal = appliedPromo ? Math.max(0, totalAmount - appliedPromo.discount) : totalAmount;

  const handleMoveToWishlist = (item) => {
    if (!isInWishlist(item.product.id)) {
      toggleWishlist(item.product);
    }
    removeFromCart(item.id);
    showToast(`Moved "${item.product.name}" to your wishlist.`);
  };

  const handleProceedCheckout = () => {
    navigate('/checkout');
  };

  const handleCompleteOrder = () => {
    setCheckoutModalOpen(false);
    clearCart();
    showToast('Your order has been placed successfully! Confirmation email sent.');
    navigate('/');
  };

  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="cart-page-main">
        <div className="cart-page-container">
          {/* Header */}
          <div className="cart-header-row">
            <div>
              <span className="section-pretitle">YOUR ATELIER SELECTIONS</span>
              <h1 className="cart-page-title">Shopping Bag ({cartCount})</h1>
            </div>
            <Link to="/products" className="continue-shopping-top-link">
              <ArrowLeft size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {cartItems.length > 0 ? (
            <div className="cart-layout-grid">
              {/* Left Column: Cart Items List */}
              <div className="cart-items-column">
                <div className="cart-items-header-bar">
                  <span>PRODUCT</span>
                  <span className="text-right">TOTAL</span>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const itemTotal = item.product.price * item.quantity;
                    return (
                      <div key={item.id} className="cart-item-row">
                        {/* Thumbnail */}
                        <Link to={`/products/${item.product.id}`} className="cart-item-img-link">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="cart-item-thumb"
                          />
                        </Link>

                        {/* Details */}
                        <div className="cart-item-details">
                          <div className="cart-item-title-row">
                            <span className="cart-item-brand">{item.product.brand}</span>
                            <h3 className="cart-item-name">
                              <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                            </h3>
                          </div>

                          {/* Attributes (Size & Color) */}
                          <div className="cart-item-attributes">
                            <span className="attr-pill">
                              Size: <strong>{item.size}</strong>
                            </span>
                            <span className="attr-pill">
                              Color: <strong>{item.color}</strong>
                            </span>
                            <span className="attr-pill unit-price">
                              Unit: <strong>${item.product.price}</strong>
                            </span>
                          </div>

                          {/* Quantity & Actions Controls */}
                          <div className="cart-item-controls-row">
                            <div className="cart-qty-stepper">
                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="cart-qty-value">{item.quantity}</span>
                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              className="cart-action-btn"
                              onClick={() => handleMoveToWishlist(item)}
                            >
                              <Heart size={14} />
                              <span>Move to Wishlist</span>
                            </button>

                            <button
                              type="button"
                              className="cart-action-btn delete-btn"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={14} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="cart-item-price-col">
                          <span className="cart-item-total-price">${itemTotal}</span>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <span className="cart-item-strike-price">
                              ${item.product.originalPrice * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-bottom-actions">
                  <button
                    type="button"
                    className="btn-clear-cart"
                    onClick={clearCart}
                  >
                    Clear Shopping Bag
                  </button>
                  <Link to="/products" className="btn-continue-shopping">
                    <ArrowLeft size={16} />
                    <span>Discover More Collections</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="cart-summary-column">
                <div className="order-summary-card">
                  <h3 className="summary-card-title">Order Summary</h3>

                  {/* Pricing Breakdown */}
                  <div className="summary-breakdown-list">
                    <div className="summary-line">
                      <span>Subtotal ({cartCount} items)</span>
                      <span>${subtotal}</span>
                    </div>

                    {discountTotal > 0 && (
                      <div className="summary-line text-discount">
                        <span>Catalogue Discount</span>
                        <span>-${discountTotal}</span>
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="summary-line text-discount">
                        <span>Promo ({appliedPromo.code} -{appliedPromo.percent}%)</span>
                        <div className="promo-applied-tag">
                          <span>-${appliedPromo.discount}</span>
                          <X size={12} onClick={handleRemovePromo} className="remove-promo-icon" />
                        </div>
                      </div>
                    )}

                    <div className="summary-line">
                      <span>Estimated Courier Delivery</span>
                      <span>
                        {deliveryCharge === 0 ? (
                          <span className="free-shipping-tag">FREE</span>
                        ) : (
                          `$${deliveryCharge}`
                        )}
                      </span>
                    </div>

                    {discountedSubtotal < 150 && (
                      <div className="shipping-progress-box">
                        <small>
                          Add <strong>${150 - discountedSubtotal}</strong> more for complimentary delivery.
                        </small>
                      </div>
                    )}

                    <hr className="summary-divider" />

                    <div className="summary-total-line">
                      <span className="total-label">Total Amount</span>
                      <span className="total-value">${finalTotal}</span>
                    </div>
                  </div>

                  {/* Promo Code Form */}
                  <form onSubmit={handleApplyPromo} className="promo-form">
                    <label htmlFor="promo-input">PROMOTION / ATELIER VOUCHER</label>
                    <div className="promo-input-row">
                      <input
                        id="promo-input"
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Code: ZELORA10"
                        className="promo-input"
                      />
                      <button type="submit" className="btn-apply-promo">
                        Apply
                      </button>
                    </div>
                    {promoError && <span className="promo-error-msg">{promoError}</span>}
                  </form>

                  {/* Checkout CTA */}
                  <button
                    type="button"
                    className="btn-checkout-primary"
                    onClick={handleProceedCheckout}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="checkout-trust-indicators">
                    <div className="trust-row">
                      <ShieldCheck size={16} />
                      <span>Encrypted 256-Bit SSL Checkout</span>
                    </div>
                    <div className="trust-row">
                      <Truck size={16} />
                      <span>Dispatched in eco-friendly matte black box</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Cart View */
            <div className="empty-cart-state">
              <div className="empty-cart-icon-box">
                <ShoppingBag size={48} strokeWidth={1.2} />
              </div>
              <h2>Your Shopping Bag is Empty</h2>
              <p>
                Your personal wardrobe awaits. Discover timeless monochrome garments crafted for modern living.
              </p>
              <Link to="/products" className="btn-hero-primary">
                <span>Explore All Collections</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Mock Modal */}
      {checkoutModalOpen && (
        <div className="size-guide-modal-backdrop" onClick={() => setCheckoutModalOpen(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Secure Checkout Confirmation</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCheckoutModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="order-review-summary">
                <p>
                  You are ordering <strong>{cartCount} piece(s)</strong> with standard concierge delivery.
                </p>
                <div className="order-final-box">
                  <span>Grand Total:</span>
                  <strong>${finalTotal}</strong>
                </div>
                <div className="checkout-form-mock">
                  <div className="form-group">
                    <label>Shipping Address</label>
                    <input
                      type="text"
                      defaultValue="42 Rue de Monolith, 75001 Paris"
                      className="zelora-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <input
                      type="text"
                      defaultValue="Apple Pay / Visa •••• 4242"
                      disabled
                      className="zelora-input disabled"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-zelora-secondary"
                onClick={() => setCheckoutModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-hero-primary"
                onClick={handleCompleteOrder}
              >
                Place Order (${finalTotal})
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

