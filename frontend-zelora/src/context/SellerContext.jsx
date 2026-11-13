import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const SellerContext = createContext();

const LEGACY_DEMO_SHOP_NAMES = ["Maison de L'Ombre", "ZELORA Atelier Flagship"];
const LEGACY_DEMO_EMAILS = ["eleanor@maisondelombre.luxury", "atelier@maisondelombre.luxury"];
const LEGACY_DEMO_SELLER_NAMES = ["Eleanor Vance"];
const LEGACY_DEMO_PRODUCT_IDS = new Set([
  "prod-sel-101", "prod-sel-102", "prod-sel-103",
  "prod-sel-104", "prod-sel-105", "prod-sel-106",
]);
const LEGACY_DEMO_ORDER_IDS = new Set(["ord-801", "ord-802", "ord-803", "ord-804"]);
const LEGACY_DEMO_COUPON_IDS = new Set(["cp-01", "cp-02", "cp-03"]);
const LEGACY_DEMO_REVIEW_IDS = new Set(["rev-01", "rev-02", "rev-03"]);
const LEGACY_DEMO_NOTIF_IDS = new Set(["notif-01", "notif-02", "notif-03", "notif-04", "notif-05"]);
const LEGACY_DEMO_PAYOUT_IDS = new Set(["PAY-2026-009", "PAY-2026-008", "PAY-2026-007"]);
const LEGACY_DEMO_TICKET_IDS = new Set(["TCK-8812", "TCK-7619"]);

const isLegacyDemoSeller = (s) =>
  Boolean(
    s && (
      LEGACY_DEMO_SELLER_NAMES.includes(s.name) ||
      LEGACY_DEMO_EMAILS.includes(s.email) ||
      LEGACY_DEMO_SHOP_NAMES.includes(s.shop_name)
    )
  );

const isLegacyDemoShop = (sh) =>
  Boolean(
    sh && (
      LEGACY_DEMO_SHOP_NAMES.includes(sh.name) ||
      LEGACY_DEMO_EMAILS.includes(sh.contact_email)
    )
  );

const mapShopFromApi = (apiShop) => {
  if (!apiShop) return null;
  return {
    id: apiShop.id,
    name: apiShop.name || '',
    category: apiShop.category || 'Haute Couture & Designer Wear',
    description: apiShop.description || '',
    logo: apiShop.logo_url || null,
    banner: apiShop.banner_url || null,
    contact_email: apiShop.contact_email || '',
    contact_number: apiShop.contact_number || '',
    business_address: apiShop.business_address || '',
    instagram: apiShop.instagram || '',
    website: apiShop.website || '',
    is_open: apiShop.is_open ?? true,
    return_policy: apiShop.return_policy || '',
    delivery_preferences: apiShop.delivery_preferences || '',
    shop_visibility: apiShop.shop_visibility || 'Public (Listed in Marketplace)',
  };
};

export function SellerProvider({ children }) {
  // Persistence Helper
  const loadStored = (key, fallback, demoIdSet = null) => {
    try {
      const item = localStorage.getItem(`zelora_seller_${key}`);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && demoIdSet) {
        return parsed.filter((entry) => entry && !demoIdSet.has(entry.id));
      }
      return parsed;
    } catch {
      return fallback;
    }
  };

  const saveStored = (key, value) => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(`zelora_seller_${key}`);
      } else {
        localStorage.setItem(`zelora_seller_${key}`, JSON.stringify(value));
      }
    } catch (e) {
      console.warn("Storage save error", e);
    }
  };

  // State Declarations
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(() => {
    const hasAuth = localStorage.getItem('zelora_seller_auth') === 'true';
    const hasToken = Boolean(localStorage.getItem('zelora_seller_access_token'));
    const storedUser = loadStored('user', null);
    if (!hasAuth || !hasToken || isLegacyDemoSeller(storedUser)) {
      if (isLegacyDemoSeller(storedUser)) {
        localStorage.removeItem('zelora_seller_auth');
        localStorage.removeItem('zelora_seller_user');
        localStorage.removeItem('zelora_seller_shop');
      }
      return false;
    }
    return true;
  });

  const [seller, setSeller] = useState(() => {
    const isAuth = localStorage.getItem('zelora_seller_auth') === 'true' && Boolean(localStorage.getItem('zelora_seller_access_token'));
    if (!isAuth) return null;
    const s = loadStored('user', null);
    if (!s || isLegacyDemoSeller(s)) return null;
    if (s.avatar && (s.avatar.includes('photo-1534528741775-53994a69daeb') || s.avatar.includes('unsplash'))) {
      s.avatar = null;
    }
    return { ...s, is_seller: true, role: 'Boutique Seller' };
  });

  const [shop, setShop] = useState(() => {
    const isAuth = localStorage.getItem('zelora_seller_auth') === 'true' && Boolean(localStorage.getItem('zelora_seller_access_token'));
    if (!isAuth) return null;
    const sh = loadStored('shop', null);
    if (!sh || isLegacyDemoShop(sh)) return null;
    if (sh.logo && (sh.logo.includes('photo-1534528741775-53994a69daeb') || sh.logo.includes('photo-1544441893-675973e31985') || sh.logo.includes('unsplash'))) {
      sh.logo = null;
    }
    return sh;
  });

  const [products, setProducts] = useState(() => loadStored('products', [], LEGACY_DEMO_PRODUCT_IDS));
  const [orders, setOrders] = useState(() => loadStored('orders', [], LEGACY_DEMO_ORDER_IDS));
  const [coupons, setCoupons] = useState(() => loadStored('coupons', [], LEGACY_DEMO_COUPON_IDS));
  const [reviews, setReviews] = useState(() => loadStored('reviews', [], LEGACY_DEMO_REVIEW_IDS));
  const [notifications, setNotifications] = useState(() => loadStored('notifs', [], LEGACY_DEMO_NOTIF_IDS));
  const [payouts, setPayouts] = useState(() => loadStored('payouts', [], LEGACY_DEMO_PAYOUT_IDS));
  const [tickets, setTickets] = useState(() => loadStored('tickets', [], LEGACY_DEMO_TICKET_IDS));

  // Fetch real shop details from backend whenever authenticated
  useEffect(() => {
    let active = true;
    if (!isSellerAuthenticated || !localStorage.getItem('zelora_seller_access_token')) {
      return;
    }
    authApi
      .getSellerShop()
      .then((apiShop) => {
        if (!active || !apiShop) return;
        setShop((prev) => ({
          ...(prev || {}),
          ...mapShopFromApi(apiShop),
        }));
      })
      .catch((err) => {
        console.warn('Could not refresh seller shop profile from backend:', err?.message);
      });
    return () => {
      active = false;
    };
  }, [isSellerAuthenticated]);

  // Sync to local storage
  useEffect(() => {
    if (seller && isSellerAuthenticated) {
      saveStored('user', seller);
    } else {
      localStorage.removeItem('zelora_seller_user');
    }
  }, [seller, isSellerAuthenticated]);

  useEffect(() => {
    if (shop && isSellerAuthenticated) {
      saveStored('shop', shop);
    } else {
      localStorage.removeItem('zelora_seller_shop');
    }
  }, [shop, isSellerAuthenticated]);

  useEffect(() => saveStored('products', products), [products]);
  useEffect(() => saveStored('orders', orders), [orders]);
  useEffect(() => saveStored('coupons', coupons), [coupons]);
  useEffect(() => saveStored('reviews', reviews), [reviews]);
  useEffect(() => saveStored('notifs', notifications), [notifications]);
  useEffect(() => saveStored('payouts', payouts), [payouts]);
  useEffect(() => saveStored('tickets', tickets), [tickets]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Auth Operations
  const loginSeller = async ({ email, password }) => {
    const res = await authApi.sellerLogin({ email, password });

    if (res.tokens?.access) {
      localStorage.setItem('zelora_seller_access_token', res.tokens.access);
    }
    if (res.tokens?.refresh) {
      localStorage.setItem('zelora_seller_refresh_token', res.tokens.refresh);
    }

    const sellerUser = {
      id: res.user?.id || `sel-${Date.now()}`,
      name: `${res.user?.first_name || ''} ${res.user?.last_name || ''}`.trim() || res.user?.email?.split('@')[0] || 'Seller',
      email: res.user?.email || email,
      phone: res.user?.phone_number || '',
      avatar: res.user?.avatar_url || null,
      shop_name: res.shop?.name || res.user?.shop_name || '',
      shop_category: res.shop?.category || res.user?.shop_category || 'Haute Couture & Designer Wear',
      role: 'Boutique Seller',
      is_seller: true,
    };

    const shopData = mapShopFromApi(res.shop) || {
      name: sellerUser.shop_name,
      category: sellerUser.shop_category,
      description: '',
      logo: null,
      banner: null,
      contact_email: res.user?.email || email,
      contact_number: sellerUser.phone,
      business_address: '',
      instagram: '',
      website: '',
      is_open: true,
      return_policy: '',
      delivery_preferences: '',
      shop_visibility: 'Public (Listed in Marketplace)',
    };

    setSeller(sellerUser);
    setShop(shopData);
    setIsSellerAuthenticated(true);
    localStorage.setItem('zelora_seller_auth', 'true');
    saveStored('user', sellerUser);
    saveStored('shop', shopData);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    showToast(`Welcome back, ${sellerUser.name}!`);
    return { user: sellerUser, shop: shopData };
  };

  const registerSeller = async (formData) => {
    const res = await authApi.sellerRegister(formData);

    if (res.tokens?.access) {
      localStorage.setItem('zelora_seller_access_token', res.tokens.access);
    }
    if (res.tokens?.refresh) {
      localStorage.setItem('zelora_seller_refresh_token', res.tokens.refresh);
    }

    const sellerUser = {
      id: res.user?.id || `sel-${Date.now()}`,
      name: `${res.user?.first_name || ''} ${res.user?.last_name || ''}`.trim() || formData.owner_name,
      email: res.user?.email || formData.email,
      phone: res.user?.phone_number || formData.mobile_number,
      avatar: res.user?.avatar_url || null,
      shop_name: res.shop?.name || formData.shop_name,
      shop_category: res.shop?.category || formData.shop_category,
      role: 'Boutique Seller',
      is_seller: true,
    };

    const shopData = mapShopFromApi(res.shop) || {
      name: formData.shop_name,
      category: formData.shop_category,
      description: '',
      logo: null,
      banner: null,
      contact_email: formData.email,
      contact_number: formData.mobile_number,
      business_address: '',
      instagram: '',
      website: '',
      is_open: true,
      return_policy: '',
      delivery_preferences: '',
      shop_visibility: 'Public (Listed in Marketplace)',
    };

    setSeller(sellerUser);
    setShop(shopData);
    setIsSellerAuthenticated(true);
    localStorage.setItem('zelora_seller_auth', 'true');
    saveStored('user', sellerUser);
    saveStored('shop', shopData);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
    showToast("Seller registration complete! Welcome to ZELORA.");
    return { user: sellerUser, shop: shopData };
  };

  // Seller Logout & Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const requestLogoutSeller = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogoutSeller = () => {
    setShowLogoutConfirm(false);
  };

  const logoutSeller = () => {
    setIsSellerAuthenticated(false);
    localStorage.removeItem('zelora_seller_auth');
    localStorage.removeItem('zelora_seller_access_token');
    localStorage.removeItem('zelora_seller_refresh_token');
    localStorage.removeItem('zelora_seller_user');
    localStorage.removeItem('zelora_seller_shop');
    setSeller(null);
    setShop(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('zelora_logout'));
    }
    setShowLogoutConfirm(false);
    showToast("Signed out from Seller Center.");
  };

  const confirmLogoutSeller = () => {
    logoutSeller();
  };

  // Helper to persist supported shop fields to backend
  const syncShopToBackend = async (fields) => {
    if (!localStorage.getItem('zelora_seller_access_token')) return;
    const payload = {};
    const directFields = ['name', 'category', 'description', 'contact_email', 'contact_number', 'business_address', 'is_open'];
    directFields.forEach((key) => {
      if (fields[key] !== undefined) payload[key] = fields[key];
    });
    if (typeof fields.logo === 'string' && /^https?:\/\//i.test(fields.logo)) {
      payload.logo_url = fields.logo;
    } else if (fields.logo === '') {
      payload.logo_url = null;
    }
    if (typeof fields.banner === 'string' && /^https?:\/\//i.test(fields.banner)) {
      payload.banner_url = fields.banner;
    } else if (fields.banner === '') {
      payload.banner_url = null;
    }
    if (Object.keys(payload).length === 0) return;
    try {
      await authApi.updateSellerShop(payload);
    } catch (err) {
      console.warn('Could not sync shop update to backend:', err?.message);
    }
  };

  // Shop Profile & Settings Operations
  const updateShopProfile = (updatedFields) => {
    setShop((prev) => ({ ...(prev || {}), ...updatedFields }));
    if (updatedFields.name) {
      setSeller((prev) => (prev ? { ...prev, shop_name: updatedFields.name } : prev));
    }
    syncShopToBackend(updatedFields);
    showToast("Shop profile updated successfully.");
  };

  const updateShopSettings = (settingsFields) => {
    setShop((prev) => ({ ...(prev || {}), ...settingsFields }));
    syncShopToBackend(settingsFields);
    showToast("Shop settings saved.");
  };

  const toggleShopAvailability = () => {
    setShop((prev) => {
      const next = !(prev?.is_open ?? true);
      syncShopToBackend({ is_open: next });
      showToast(next ? "Shop is now Open for customer orders." : "Shop is now Temporarily Closed.");
      return { ...(prev || {}), is_open: next };
    });
  };

  // Product Operations
  const addProduct = (productData) => {
    const newProd = {
      id: `prod-sel-${Date.now()}`,
      created_at: new Date().toISOString(),
      sales_count: 0,
      status: productData.status || "Published",
      brand: shop?.name || "ZELORA Seller",
      ...productData,
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Product "${newProd.name}" added successfully.`);
    return newProd;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    showToast("Product updated successfully.");
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product removed from shop catalog.");
  };

  const toggleProductStatus = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "Published" ? "Draft" : "Published";
          showToast(`Product status set to ${nextStatus}.`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  // Inventory Management
  const updateInventoryStock = (productId, sizeKey, newQty) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedSizeStock = {
            ...(p.size_stock || {}),
            [sizeKey]: Math.max(0, parseInt(newQty, 10) || 0),
          };
          const totalStock = Object.values(updatedSizeStock).reduce((acc, curr) => acc + curr, 0);
          const newStatus = totalStock === 0 ? "Out of Stock" : (p.status === "Out of Stock" ? "Published" : p.status);
          return {
            ...p,
            size_stock: updatedSizeStock,
            stock_quantity: totalStock,
            status: newStatus,
          };
        }
        return p;
      })
    );
    showToast("Stock level updated.");
  };

  // Order Operations
  const updateOrderStatus = (orderId, newStatus, extraData = {}) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId || o.id === orderId
          ? { ...o, order_status: newStatus, ...extraData }
          : o
      )
    );
    showToast(`Order status updated to "${newStatus}".`);
  };

  const acceptOrder = (orderId) => {
    updateOrderStatus(orderId, "Confirmed");
  };

  const rejectOrder = (orderId, reason) => {
    updateOrderStatus(orderId, "Rejected", { reject_reason: reason });
  };

  const addShippingDetails = (orderId, { tracking_number, courier_name }) => {
    updateOrderStatus(orderId, "Shipped", { tracking_number, courier_name });
  };

  // Coupon Operations
  const addCoupon = (couponData) => {
    const newCoupon = {
      id: `cp-${Date.now()}`,
      usage_count: 0,
      is_active: true,
      ...couponData,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Promo coupon ${newCoupon.code} created.`);
    return newCoupon;
  };

  const updateCoupon = (id, updatedFields) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    showToast("Coupon updated.");
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast("Coupon removed.");
  };

  const toggleCouponStatus = (id) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.is_active;
          showToast(`Coupon ${c.code} is now ${nextState ? 'Active' : 'Inactive'}.`);
          return { ...c, is_active: nextState };
        }
        return c;
      })
    );
  };

  // Reviews
  const replyToReview = (reviewId, replyText) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r))
    );
    showToast("Reply published to customer review.");
  };

  // Notifications
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast("All notifications marked as read.");
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Payouts
  const requestPayout = (amount, bankInfo) => {
    const newPayout = {
      id: `PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      payment_method: `Direct Wire (${bankInfo?.bank_name || 'Bank Transfer'})`,
      reference: `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: "In Review",
    };
    setPayouts((prev) => [newPayout, ...prev]);
    showToast(`Payout request for ₹${amount} submitted for processing.`);
  };

  // Support
  const createSupportTicket = (ticketData) => {
    const senderName = seller?.name || 'Seller';
    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      status: "Open",
      ...ticketData,
      messages: [
        {
          sender: `${senderName} (Seller)`,
          text: ticketData.problem_description,
          time: "Just now",
        },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
    showToast("Support ticket opened. ZELORA concierge will respond promptly.");
    return newTicket;
  };

  const replySupportTicket = (ticketId, replyText) => {
    const senderName = seller?.name || 'Seller';
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              {
                sender: `${senderName} (Seller)`,
                text: replyText,
                time: "Just now",
              },
            ],
          };
        }
        return t;
      })
    );
    showToast("Message sent to support.");
  };

  // Computed Financial Metrics
  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.order_status === "New" || o.order_status === "Processing" || o.order_status === "Accepted").length;
  const lowStockProductsCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const totalProductsCount = products.length;
  const totalEarnings = totalSales * 0.88; // 88% seller payout after 12% platform fee
  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <SellerContext.Provider
      value={{
        seller,
        shop,
        isSellerAuthenticated,
        toastMessage,
        showToast,
        // Auth
        loginSeller,
        registerSeller,
        logoutSeller,
        showLogoutConfirm,
        requestLogoutSeller,
        cancelLogoutSeller,
        confirmLogoutSeller,
        // Shop
        updateShopProfile,
        updateShopSettings,
        toggleShopAvailability,
        // Products
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        updateInventoryStock,
        // Orders
        orders,
        updateOrderStatus,
        acceptOrder,
        rejectOrder,
        addShippingDetails,
        // Coupons
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        // Reviews
        reviews,
        replyToReview,
        // Notifications
        notifications,
        unreadNotifsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        // Payouts
        payouts,
        requestPayout,
        // Support
        tickets,
        createSupportTicket,
        replySupportTicket,
        // Metrics
        totalSales,
        totalOrdersCount,
        pendingOrdersCount,
        lowStockProductsCount,
        outOfStockCount,
        totalProductsCount,
        totalEarnings,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
}
