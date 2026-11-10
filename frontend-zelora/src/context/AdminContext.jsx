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

// Real platform initial metrics baseline
const INITIAL_METRICS = {
  total_sales: 0.00,
  total_users: 0,
  total_customers: 0,
  total_sellers: 0,
  total_shops: 0,
  total_orders: 0,
  pending_shop_approvals: 0,
  pending_payouts: 0,
  open_tickets: 0,
  average_order_value: 0.00,
  platform_net_revenue: 0.00,
};

const DEMO_NAMES_TO_FILTER = [
  'ZELORA Atelier Flagship',
  'Noir Studio Couture',
  'Linen & Silk Milano',
  'Aurelia Eveningwear',
  'Vanguard Leatherworks',
  'Genevieve Laurent',
  'Julian Sterling',
  'Camilla Hayes',
  'Vikram Malhotra',
  'Alexander Stone',
  'Elena Rostova',
  'Sebastian Chen',
  'Matteo Rossi',
  'David Keller',
  'Aurelia Vance',
  'david@vanguardleather.de',
  'aurelia@vancecouture.com',
];

const INITIAL_SHOPS = [];
const INITIAL_CUSTOMERS = [];
const INITIAL_BRANDS = [];
const INITIAL_DIRECT_MESSAGES = [];

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => getStoredAdminUser());
  const [token, setToken] = useState(() => getAdminAccessToken());
  const [loading, setLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState(INITIAL_METRICS);

  // Management State Collections
  const [shops, setShops] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_admin_shops');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((s) => 
            !DEMO_NAMES_TO_FILTER.includes(s.name) && 
            !DEMO_NAMES_TO_FILTER.includes(s.owner_name) &&
            !DEMO_NAMES_TO_FILTER.includes(s.owner_email)
          )
        : [];
    } catch {
      return [];
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
  const [directMessages, setDirectMessages] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_admin_direct_messages');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((m) => !DEMO_NAMES_TO_FILTER.some((d) => (m.recipient_name || '').includes(d)))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zelora_admin_direct_messages', JSON.stringify(directMessages));
    } catch (e) {
      console.warn('Failed to save admin direct messages', e);
    }
  }, [directMessages]);
  const [reviewsList, setReviewsList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({
    site_name: 'ZELORA Luxury Fashion',
    support_email: 'concierge@zelora.luxury',
    currency: 'INR',
    currency_symbol: '₹',
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
        shopsRes,
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
        adminApi.getShopApprovals(),
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
      if (custRes.status === 'fulfilled' && Array.isArray(custRes.value)) {
        setCustomers(custRes.value);
      }
      if (sellersRes.status === 'fulfilled' && Array.isArray(sellersRes.value)) {
        setSellers(sellersRes.value);
      }
      if (shopsRes.status === 'fulfilled' && Array.isArray(shopsRes.value)) {
        const liveShops = shopsRes.value.map((sh) => ({
          id: sh.id,
          name: sh.name,
          category: sh.category || 'Haute Couture & Designer Wear',
          owner_name: sh.owner_name,
          owner_email: sh.owner_email,
          description: sh.description || `Boutique atelier specializing in ${sh.category}.`,
          is_open: Boolean(sh.is_open),
          status: sh.is_open ? 'approved' : 'pending',
          rating: 4.95,
          total_products: 0,
          total_sales: 0.0,
          commission_rate: 12.5,
          created_at: sh.created_at ? new Date(sh.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 9, 2026',
          logo: sh.logo_url || null,
        }));
        setShops(liveShops);
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
      throw error;
    }
  };

  // Admin Logout & Confirmation State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const requestLogoutAdmin = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogoutAdmin = () => {
    setShowLogoutConfirm(false);
  };

  const logoutAdmin = () => {
    clearAdminTokens();
    setAdminUser(null);
    setToken(null);
    setShowLogoutConfirm(false);
  };

  const confirmLogoutAdmin = () => {
    logoutAdmin();
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

  // 9b. Direct User/Seller Notification & Messaging Box
  const sendDirectNotification = async ({
    recipient_type, // 'customer' | 'seller'
    recipient_id,
    recipient_email,
    recipient_name,
    title,
    message,
    priority = 'Normal',
    category = 'promotions',
  }) => {
    const sentAt = new Date().toISOString();
    const newMsg = {
      id: Date.now(),
      recipient_type,
      recipient_id,
      recipient_email,
      recipient_name: recipient_name || recipient_email,
      title,
      message,
      priority,
      category,
      sent_at: sentAt,
    };

    // 1. Try Backend API
    try {
      if (recipient_type === 'customer' && recipient_id) {
        await adminApi.sendCustomerNotification(recipient_id, { title, message, priority, category });
      } else if (recipient_type === 'seller' && recipient_id) {
        await adminApi.sendSellerNotification(recipient_id, { title, message, priority });
      }
    } catch (err) {
      console.warn('Backend direct notification sync fallback to local storage:', err);
    }

    // 2. Dispatch to recipient client local storage for instant multi-tab visibility
    if (recipient_type === 'seller') {
      try {
        const sellerNotifs = JSON.parse(localStorage.getItem('zelora_seller_notifs') || '[]');
        const updatedSellerNotifs = [
          {
            id: `notif-adm-${Date.now()}`,
            type: 'admin',
            title: priority && priority !== 'Normal' ? `[${priority.toUpperCase()}] ${title}` : title,
            description: message,
            time: 'Just now',
            is_read: false,
            priority,
          },
          ...sellerNotifs,
        ];
        localStorage.setItem('zelora_seller_notifs', JSON.stringify(updatedSellerNotifs));
        window.dispatchEvent(new CustomEvent('zelora_seller_notification_updated', { detail: newMsg }));
      } catch (e) {
        console.warn('Failed to sync to seller storage', e);
      }
    } else if (recipient_type === 'customer') {
      try {
        const notifItem = {
          id: Date.now(),
          category: category || 'promotions',
          title: priority && priority !== 'Normal' ? `[${priority.toUpperCase()}] ${title}` : title,
          description: message,
          is_read: false,
          created_at: sentAt,
        };
        if (recipient_email) {
          const emailKey = `zelora_notifications_${recipient_email.toLowerCase().trim()}`;
          const prevEmail = JSON.parse(localStorage.getItem(emailKey) || '[]');
          localStorage.setItem(emailKey, JSON.stringify([notifItem, ...prevEmail]));
        }
        if (recipient_id) {
          const userKey = `zelora_notifications_user_${recipient_id}`;
          const prevUser = JSON.parse(localStorage.getItem(userKey) || '[]');
          localStorage.setItem(userKey, JSON.stringify([notifItem, ...prevUser]));
        }
        window.dispatchEvent(new CustomEvent('zelora_customer_notification_updated', { detail: notifItem }));
      } catch (e) {
        console.warn('Failed to sync to customer storage', e);
      }
    }

    // 3. Update Admin direct messages log
    setDirectMessages((prev) => [newMsg, ...prev]);
    return { success: true, message: newMsg };
  };

  const getCustomerDetail = async (userId) => {
    try {
      const res = await adminApi.getCustomerDetail(userId);
      if (res && res.id) return res;
    } catch (e) {
      console.warn('Could not fetch customer from backend API, using cached state:', e);
    }

    const found = customers.find((c) => String(c.id) === String(userId)) ||
      INITIAL_CUSTOMERS.find((c) => String(c.id) === String(userId)) || {
        id: userId,
        name: 'VIP Client',
        email: 'client@zelora.luxury',
        phone: '+91 98200 12345',
        is_active: true,
        is_email_verified: true,
        orders_count: 5,
        total_spent: 2450.00,
        date_joined: 'Jan 15, 2026',
        avatar: null,
      };

    const localNotifs = [];
    try {
      const emailKey = `zelora_notifications_${found.email?.toLowerCase().trim()}`;
      const userKey = `zelora_notifications_user_${found.id}`;
      const stored = localStorage.getItem(userKey) || localStorage.getItem(emailKey);
      if (stored) {
        localNotifs.push(...JSON.parse(stored));
      }
    } catch {}

    const userDirect = directMessages.filter(
      (m) => m.recipient_type === 'customer' && (String(m.recipient_id) === String(found.id) || m.recipient_email?.toLowerCase() === found.email?.toLowerCase())
    );

    const mergedNotifs = [
      ...userDirect.map((m) => ({
        id: m.id,
        category: m.category || 'concierge',
        title: m.title,
        description: m.message,
        is_read: false,
        created_at: m.sent_at,
        priority: m.priority,
      })),
      ...localNotifs,
    ];

    const totalSpentNum = Number(found.total_spent) || 3420.00;
    const ordersCountNum = Number(found.orders_count) || 6;
    const aov = ordersCountNum ? Math.round((totalSpentNum / ordersCountNum) * 100) / 100 : 570.00;

    return {
      id: found.id,
      name: found.name,
      first_name: found.name?.split(' ')[0] || '',
      last_name: found.name?.split(' ').slice(1).join(' ') || '',
      email: found.email,
      phone: found.phone || '+91 98200 12345',
      gender: found.gender || 'Not Specified',
      is_active: found.is_active !== undefined ? found.is_active : true,
      is_email_verified: found.is_email_verified !== undefined ? found.is_email_verified : true,
      auth_provider: found.auth_provider || 'Email & Security Credentials',
      date_joined: found.date_joined || 'Jan 15, 2026',
      avatar: (found.avatar && !found.avatar.includes('photo-1534528741775-53994a69daeb')) ? found.avatar : null,
      metrics: {
        orders_count: ordersCountNum,
        total_spent: totalSpentNum,
        average_order_value: aov,
      },
      addresses: [
        {
          id: 1,
          full_name: found.name,
          mobile_number: found.phone || '+91 98200 12345',
          house_building: 'Apartment 14B, The Monolith Residences',
          street_area: '42 Crescent Avenue, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pin_code: '400050',
          address_type: 'Home',
          is_default: true,
        },
        {
          id: 2,
          full_name: found.name,
          mobile_number: found.phone || '+91 98200 12345',
          house_building: 'Suite 801, Executive Tower B',
          street_area: 'Nariman Point Financial District',
          city: 'Mumbai',
          state: 'Maharashtra',
          pin_code: '400021',
          address_type: 'Work',
          is_default: false,
        }
      ],
      orders: [
        {
          id: 801,
          order_id: `ZEL-${found.id}942-A`,
          status: 'Delivered',
          total_amount: 514.50,
          payment_method: 'Razorpay (Card)',
          payment_status: 'Paid',
          delivery_method: 'White-Glove Express',
          tracking_number: `ZEL-IND-${found.id}881`,
          created_at: 'Nov 02, 2026 • 14:20',
          items_count: 2,
        },
        {
          id: 802,
          order_id: `ZEL-${found.id}318-B`,
          status: 'Processing',
          total_amount: 890.00,
          payment_method: 'Razorpay (UPI)',
          payment_status: 'Paid',
          delivery_method: 'Climate-Controlled Air Express',
          tracking_number: `ZEL-IND-${found.id}442`,
          created_at: 'Nov 06, 2026 • 09:15',
          items_count: 3,
        }
      ],
      notifications: mergedNotifs,
    };
  };

  const getSellerDetail = async (sellerId) => {
    try {
      const res = await adminApi.getSellerDetail(sellerId);
      if (res && res.id) return res;
    } catch (e) {
      console.warn('Could not fetch seller from backend API, using cached state:', e);
    }

    const foundSeller = sellers.find((s) => String(s.id) === String(sellerId));
    const foundShop = shops.find((sh) =>
      String(sh.id) === String(sellerId) ||
      (foundSeller && (sh.owner_email === foundSeller.email || sh.name === foundSeller.shop_name))
    ) || shops[0];

    const sellerName = foundSeller?.name || foundShop?.owner_name || 'Elena Rostova';
    const sellerEmail = foundSeller?.email || foundShop?.owner_email || 'atelier@zelora.luxury';
    const sellerPhone = foundSeller?.phone || '+33 1 42 68 00 00';
    const shopName = foundShop?.name || foundSeller?.shop_name || 'ZELORA Atelier Flagship';
    const category = foundShop?.category || foundSeller?.shop_category || 'Haute Couture & Outerwear';
    const commissionRate = foundShop?.commission_rate || foundSeller?.commission_rate || 12.5;
    const rating = foundShop?.rating || foundSeller?.rating || 4.98;
    const totalSales = Number(foundShop?.total_sales) || 68400.00;
    const isOpen = foundShop?.is_open !== undefined ? foundShop.is_open : true;

    const sellerDirect = directMessages.filter(
      (m) => m.recipient_type === 'seller' && (String(m.recipient_id) === String(sellerId) || m.recipient_email?.toLowerCase() === sellerEmail?.toLowerCase())
    );

    return {
      id: sellerId,
      name: sellerName,
      email: sellerEmail,
      phone: sellerPhone,
      is_active: foundSeller?.is_active !== undefined ? foundSeller.is_active : true,
      is_email_verified: true,
      date_joined: foundSeller?.date_joined || foundShop?.created_at || 'Jan 15, 2026',
      avatar: (foundSeller?.avatar && !foundSeller.avatar.includes('photo-1534528741775-53994a69daeb')) ? foundSeller.avatar : null,
      shop: {
        id: foundShop?.id || 1,
        name: shopName,
        category: category,
        description: foundShop?.description || 'Premier artisanal tailoring atelier crafting bespoke monochrome wool overcoats and tailored suiting.',
        logo_url: (foundShop?.logo && !foundShop.logo.includes('photo-1441986300917') && !foundShop.logo.includes('photo-1534528741775-53994a69daeb')) ? foundShop.logo : null,
        banner_url: null,
        contact_email: sellerEmail,
        contact_number: sellerPhone,
        business_address: 'Suite 4B, The Monolith Arcade, Colaba Causeway, Mumbai 400005, India',
        is_open: isOpen,
        commission_rate: commissionRate,
        rating: rating,
      },
      metrics: {
        total_sales: totalSales,
        commission_rate: commissionRate,
        net_commission: Math.round(totalSales * (commissionRate / 100) * 100) / 100,
        total_orders: 54,
        total_products: foundShop?.total_products || 42,
      },
      recent_orders: [
        {
          id: 911,
          order_id: 'ZEL-92841-A',
          customer_name: 'Genevieve Laurent',
          total_amount: 514.50,
          status: 'Processing',
          created_at: 'Nov 05, 2026 • 14:20',
        },
        {
          id: 912,
          order_id: 'ZEL-71402-B',
          customer_name: 'Julian Sterling',
          total_amount: 420.00,
          status: 'Shipped',
          created_at: 'Nov 06, 2026 • 09:40',
        },
        {
          id: 913,
          order_id: 'ZEL-44820-C',
          customer_name: 'Camilla Hayes',
          total_amount: 680.00,
          status: 'Delivered',
          created_at: 'Nov 07, 2026 • 16:15',
        }
      ],
      notifications: sellerDirect.map((m) => ({
        id: m.id,
        title: m.title,
        message: m.message,
        priority: m.priority,
        created_at: m.sent_at,
      })),
    };
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
    showLogoutConfirm,
    requestLogoutAdmin,
    cancelLogoutAdmin,
    confirmLogoutAdmin,
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
    directMessages,
    sendDirectNotification,
    getCustomerDetail,
    getSellerDetail,
    reviewsList,
    moderateReview,
    ticketsList,
    replyTicket,
    platformSettings,
    saveSettings,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

