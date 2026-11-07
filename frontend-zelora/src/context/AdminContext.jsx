import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  adminApi,
  getAdminAccessToken,
  setAdminAccessToken,
  clearAdminTokens,
  getStoredAdminUser,
  setStoredAdminUser,
} from '../services/api';
import { PRODUCTS, CATEGORIES } from '../data/products';

const AdminContext = createContext(null);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Initial Mock data fallbacks for flawless offline/standalone rendering
const INITIAL_METRICS = {
  total_sales: 148250.00,
  total_users: 184,
  total_customers: 156,
  total_sellers: 28,
  total_shops: 22,
  total_orders: 512,
  pending_shop_approvals: 3,
  pending_payouts: 2,
  open_tickets: 4,
  average_order_value: 289.50,
  platform_net_revenue: 18531.25,
};

const INITIAL_SHOPS = [
  {
    id: 1,
    name: 'ZELORA Atelier Flagship',
    slug: 'zelora-atelier',
    category: 'Haute Couture & Outerwear',
    owner_name: 'Elena Rostova',
    owner_email: 'atelier@zelora.luxury',
    rating: 4.98,
    total_products: 42,
    total_sales: 68400.00,
    commission_rate: 12.5,
    is_open: true,
    status: 'approved',
    created_at: '2026-01-15',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
    description: 'Premier artisanal tailoring atelier crafting bespoke monochrome wool overcoats and tailored suiting.'
  },
  {
    id: 2,
    name: 'Noir Studio Couture',
    slug: 'noir-studio',
    category: 'Minimalist Drapes & Silk',
    owner_name: 'Sebastian Chen',
    owner_email: 'noir@zelora.luxury',
    rating: 4.92,
    total_products: 36,
    total_sales: 42800.00,
    commission_rate: 12.5,
    is_open: true,
    status: 'approved',
    created_at: '2026-02-01',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80',
    description: 'Contemporary monochrome silk gowns, tailored pleat trousers and pure linen outerwear.'
  },
  {
    id: 3,
    name: 'Linen & Silk Milano',
    slug: 'linen-silk-milano',
    category: 'Luxury Essentials',
    owner_name: 'Matteo Rossi',
    owner_email: 'matteo@linenmilano.com',
    rating: 4.88,
    total_products: 28,
    total_sales: 24500.00,
    commission_rate: 15.0,
    is_open: true,
    status: 'approved',
    created_at: '2026-02-20',
    logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80',
    description: 'Italian sourced organic linens, double-faced poplin shirts and architectural knitwear.'
  },
  {
    id: 4,
    name: 'Aurelia Eveningwear',
    slug: 'aurelia-evening',
    category: 'Formal & Gala Gowns',
    owner_name: 'Aurelia Vance',
    owner_email: 'aurelia@vancecouture.com',
    rating: 5.0,
    total_products: 15,
    total_sales: 12550.00,
    commission_rate: 12.5,
    is_open: false,
    status: 'pending',
    created_at: '2026-03-01',
    logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80',
    description: 'Hand-pleated monochrome eveningwear, sculptured corsetry and gala attire.'
  },
  {
    id: 5,
    name: 'Vanguard Leatherworks',
    slug: 'vanguard-leather',
    category: 'Accessories & Leather',
    owner_name: 'David Keller',
    owner_email: 'david@vanguardleather.de',
    rating: 4.85,
    total_products: 19,
    total_sales: 9800.00,
    commission_rate: 12.5,
    is_open: false,
    status: 'pending',
    created_at: '2026-03-03',
    logo: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80',
    description: 'Full-grain vegetable-tanned leather totes, architectural belts and travel bags.'
  }
];

const INITIAL_CUSTOMERS = [
  {
    id: 101,
    name: 'Genevieve Laurent',
    email: 'genevieve@laurent.fr',
    phone: '+33 6 12 34 56 78',
    is_active: true,
    is_email_verified: true,
    orders_count: 8,
    total_spent: 3420.00,
    date_joined: 'Jan 12, 2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 102,
    name: 'Julian Sterling',
    email: 'julian@sterlingholdings.co.uk',
    phone: '+44 7700 900123',
    is_active: true,
    is_email_verified: true,
    orders_count: 6,
    total_spent: 2890.00,
    date_joined: 'Jan 28, 2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 103,
    name: 'Camilla Hayes',
    email: 'camilla.hayes@manhattan.com',
    phone: '+1 212 555 0192',
    is_active: true,
    is_email_verified: true,
    orders_count: 5,
    total_spent: 1950.00,
    date_joined: 'Feb 05, 2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 104,
    name: 'Vikram Malhotra',
    email: 'vikram.m@malhotragroup.in',
    phone: '+91 98200 12345',
    is_active: true,
    is_email_verified: true,
    orders_count: 11,
    total_spent: 5640.00,
    date_joined: 'Feb 14, 2026',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 105,
    name: 'Alexander Stone',
    email: 'astone@stonedesign.ch',
    phone: '+41 79 123 45 67',
    is_active: false,
    is_email_verified: true,
    orders_count: 2,
    total_spent: 420.00,
    date_joined: 'Feb 20, 2026',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
  }
];

const INITIAL_BRANDS = [
  { id: 'b1', name: 'ZELORA Atelier', origin: 'Paris & Milan', productsCount: 54, active: true },
  { id: 'b2', name: 'Noir Studio', origin: 'Stockholm', productsCount: 38, active: true },
  { id: 'b3', name: 'Linen & Silk Milano', origin: 'Milan', productsCount: 32, active: true },
  { id: 'b4', name: 'Aurelia Couture', origin: 'Florence', productsCount: 22, active: true },
  { id: 'b5', name: 'Vanguard Leatherworks', origin: 'Munich', productsCount: 19, active: true }
];

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => getStoredAdminUser());
  const [token, setToken] = useState(() => getAdminAccessToken());
  const [loading, setLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState(INITIAL_METRICS);

  // Management State Collections
  const [shops, setShops] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_admin_shops');
      return stored ? JSON.parse(stored) : INITIAL_SHOPS;
    } catch {
      return INITIAL_SHOPS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zelora_admin_shops', JSON.stringify(shops));
    } catch (e) {
      console.warn('Failed to save admin shops', e);
    }
  }, [shops]);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [sellers, setSellers] = useState([]);
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [categoriesList, setCategoriesList] = useState(CATEGORIES);
  const [brandsList, setBrandsList] = useState(INITIAL_BRANDS);
  const [ordersList, setOrdersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({
    site_name: 'ZELORA Luxury Fashion',
    support_email: 'concierge@zelora.luxury',
    currency: 'USD',
    currency_symbol: '$',
    default_commission_rate: 12.50,
    maintenance_mode: false,
    allow_seller_registration: true,
    auto_approve_products: false,
    razorpay_key_id: 'rzp_test_TxHy520so82PT1',
  });

  const isAuthenticated = Boolean(adminUser && token);

  // Load live data from Django Backend when authenticated
  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      const [
        metricsRes,
        custRes,
        sellersRes,
        adminsRes,
        ordersRes,
        paymentsRes,
        payoutsRes,
        couponsRes,
        bannersRes,
        reviewsRes,
        ticketsRes,
        settingsRes,
      ] = await Promise.allSettled([
        adminApi.getMetrics(),
        adminApi.getCustomers(),
        adminApi.getSellers(),
        adminApi.getAdminUsers(),
        adminApi.getOrders(),
        adminApi.getPayments(),
        adminApi.getPayouts(),
        adminApi.getCoupons(),
        adminApi.getBanners(),
        adminApi.getReviews(),
        adminApi.getTickets(),
        adminApi.getSettings(),
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value.metrics) {
        setDashboardMetrics(metricsRes.value.metrics);
      }
      if (custRes.status === 'fulfilled' && Array.isArray(custRes.value) && custRes.value.length > 0) {
        setCustomers(custRes.value);
      }
      if (sellersRes.status === 'fulfilled' && Array.isArray(sellersRes.value)) {
        setSellers(sellersRes.value);
      }
      if (adminsRes.status === 'fulfilled' && Array.isArray(adminsRes.value)) {
        setAdminUsersList(adminsRes.value);
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setOrdersList(ordersRes.value);
      }
      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
        setPaymentsList(paymentsRes.value);
      }
      if (payoutsRes.status === 'fulfilled' && Array.isArray(payoutsRes.value)) {
        setPayoutsList(payoutsRes.value);
      }
      if (couponsRes.status === 'fulfilled' && Array.isArray(couponsRes.value)) {
        setCouponsList(couponsRes.value);
      }
      if (bannersRes.status === 'fulfilled' && Array.isArray(bannersRes.value)) {
        setBannersList(bannersRes.value);
      }
      if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
        setReviewsList(reviewsRes.value);
      }
      if (ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value)) {
        setTicketsList(ticketsRes.value);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value) {
        setPlatformSettings(settingsRes.value);
      }
    } catch (err) {
      console.warn('Backend admin sync fallback to cached state:', err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  // Admin Login
  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await adminApi.login({ email, password });
      const user = res.user;
      const accessToken = res.tokens.access;

      setAdminAccessToken(accessToken);
      setStoredAdminUser(user);
      setAdminUser(user);
      setToken(accessToken);
      setLoading(false);
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      // Helpful fallback demo login if backend is disconnected
      if (email.toLowerCase().includes('admin') && password === 'Admin@12345') {
        const fallbackUser = {
          id: 1,
          email: 'admin@zelora.luxury',
          name: 'Executive Director',
          role: 'Super Administrator',
          is_superuser: true,
          is_staff: true,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        };
        setAdminAccessToken('demo_jwt_token_admin_zelora');
        setStoredAdminUser(fallbackUser);
        setAdminUser(fallbackUser);
        setToken('demo_jwt_token_admin_zelora');
        return { success: true, user: fallbackUser };
      }
      throw error;
    }
  };

  // Admin Logout
  const logoutAdmin = () => {
    clearAdminTokens();
    setAdminUser(null);
    setToken(null);
  };

  // 1. Customer Actions
  const toggleCustomerBlock = async (userId) => {
    try {
      await adminApi.toggleCustomerBlock(userId);
    } catch (e) {
      console.warn('Local customer block toggle:', e);
    }
    setCustomers((prev) =>
      prev.map((c) => (c.id === userId ? { ...c, is_active: !c.is_active } : c))
    );
  };

  // 2. Shop Actions
  const approveShop = async (shopId) => {
    try {
      await adminApi.shopDecision(shopId, 'approve');
    } catch (e) {
      console.warn('Local shop approve:', e);
    }
    setShops((prev) => {
      const updated = prev.map((s) => (s.id === shopId ? { ...s, status: 'approved', is_open: true } : s));
      try {
        localStorage.setItem('zelora_admin_shops', JSON.stringify(updated));
        const targetShop = prev.find((s) => s.id === shopId);
        if (targetShop) {
          const regSellers = JSON.parse(localStorage.getItem('zelora_registered_sellers') || '[]');
          const updatedSellers = regSellers.map((reg) =>
            reg.email?.toLowerCase() === targetShop.owner_email?.toLowerCase() ||
            reg.shop_name?.toLowerCase() === targetShop.name?.toLowerCase()
              ? { ...reg, approval_status: 'approved' }
              : reg
          );
          localStorage.setItem('zelora_registered_sellers', JSON.stringify(updatedSellers));
        }
      } catch (err) {
        console.warn('Sync error', err);
      }
      return updated;
    });
    setDashboardMetrics((prev) => ({
      ...prev,
      pending_shop_approvals: Math.max(0, prev.pending_shop_approvals - 1)
    }));
  };

  const rejectShop = async (shopId, feedback = '') => {
    try {
      await adminApi.shopDecision(shopId, 'reject', feedback);
    } catch (e) {
      console.warn('Local shop reject:', e);
    }
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, status: 'rejected', is_open: false } : s))
    );
    setDashboardMetrics((prev) => ({
      ...prev,
      pending_shop_approvals: Math.max(0, prev.pending_shop_approvals - 1)
    }));
  };

  const toggleShopStatus = async (shopId) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, is_open: !s.is_open } : s))
    );
  };

  const updateShopCommission = (shopId, newRate) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, commission_rate: parseFloat(newRate) } : s))
    );
  };

  // 3. Product Actions
  const moderateProduct = async (productId, action) => {
    try {
      await adminApi.moderateProduct(productId, action);
    } catch (e) {
      console.warn('Local product moderate:', e);
    }
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, moderation_status: action } : p))
    );
  };

  // 4. Category Actions
  const addCategory = (categoryData) => {
    const newCat = {
      id: categoryData.slug || `cat-${Date.now()}`,
      name: categoryData.name,
      slug: categoryData.slug,
      image: categoryData.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
      itemCount: 0,
      description: categoryData.description || 'Curated luxury fashion piece.'
    };
    setCategoriesList((prev) => [...prev, newCat]);
  };

  const deleteCategory = (catId) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== catId && c.slug !== catId));
  };

  // 5. Brand Actions
  const addBrand = (brandData) => {
    const newBrand = {
      id: `b-${Date.now()}`,
      name: brandData.name,
      origin: brandData.origin || 'International',
      productsCount: 0,
      active: true
    };
    setBrandsList((prev) => [...prev, newBrand]);
  };

  // 6. Payout Actions
  const processPayout = async (payoutId, action) => {
    const ref = `UTR-ZEL-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      await adminApi.processPayout({ id: payoutId, action, transaction_reference: ref });
    } catch (e) {
      console.warn('Local payout process:', e);
    }
    setPayoutsList((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? { ...p, status: action, transaction_reference: ref, processed_at: new Date().toISOString() }
          : p
      )
    );
    setDashboardMetrics((prev) => ({
      ...prev,
      pending_payouts: Math.max(0, prev.pending_payouts - 1)
    }));
  };

  // 7. Coupon Actions
  const addCoupon = async (couponData) => {
    try {
      const created = await adminApi.createCoupon(couponData);
      setCouponsList((prev) => [created, ...prev]);
    } catch {
      const mockCoupon = {
        id: Date.now(),
        ...couponData,
        used_count: 0,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setCouponsList((prev) => [mockCoupon, ...prev]);
    }
  };

  // 8. Banner Actions
  const addBanner = async (bannerData) => {
    try {
      const created = await adminApi.createBanner(bannerData);
      setBannersList((prev) => [...prev, created]);
    } catch {
      const mockBanner = {
        id: Date.now(),
        ...bannerData,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setBannersList((prev) => [...prev, mockBanner]);
    }
  };

  // 9. Notification Broadcast
  const sendBroadcastNotification = async (notifData) => {
    try {
      const res = await adminApi.sendNotification(notifData);
      setNotificationsList((prev) => [res, ...prev]);
    } catch {
      const mockNotif = {
        id: Date.now(),
        ...notifData,
        sent_at: new Date().toISOString(),
        created_by_email: adminUser?.email || 'admin@zelora.luxury'
      };
      setNotificationsList((prev) => [mockNotif, ...prev]);
    }
  };

  // 10. Review Moderation
  const moderateReview = async (reviewId, status) => {
    try {
      await adminApi.moderateReview(reviewId, status);
    } catch (e) {
      console.warn('Local review moderate:', e);
    }
    setReviewsList((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
  };

  // 11. Ticket Reply
  const replyTicket = async (ticketId, message, status = 'in_progress') => {
    try {
      const res = await adminApi.replyTicket(ticketId, message, status);
      setTicketsList((prev) =>
        prev.map((t) => (t.id === ticketId ? res : t))
      );
    } catch {
      setTicketsList((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            const replies = t.replies || [];
            return {
              ...t,
              status,
              replies: [
                ...replies,
                {
                  id: Date.now(),
                  sender_name: adminUser?.name || 'Administrator',
                  message,
                  is_admin_reply: true,
                  created_at: new Date().toISOString()
                }
              ]
            };
          }
          return t;
        })
      );
    }
  };

  // 12. Settings
  const saveSettings = async (newSettings) => {
    try {
      const res = await adminApi.updateSettings(newSettings);
      setPlatformSettings(res);
    } catch {
      setPlatformSettings((prev) => ({ ...prev, ...newSettings }));
    }
  };

  const value = {
    adminUser,
    token,
    loading,
    isAuthenticated,
    loginAdmin,
    logoutAdmin,
    dashboardMetrics,
    loadDashboardData,
    // Collections & Handlers
    shops,
    approveShop,
    rejectShop,
    toggleShopStatus,
    updateShopCommission,
    customers,
    toggleCustomerBlock,
    sellers,
    adminUsersList,
    productsList,
    moderateProduct,
    categoriesList,
    addCategory,
    deleteCategory,
    brandsList,
    addBrand,
    ordersList,
    paymentsList,
    payoutsList,
    processPayout,
    couponsList,
    addCoupon,
    bannersList,
    addBanner,
    notificationsList,
    sendBroadcastNotification,
    reviewsList,
    moderateReview,
    ticketsList,
    replyTicket,
    platformSettings,
    saveSettings,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

