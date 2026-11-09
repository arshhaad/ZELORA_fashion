import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const SellerContext = createContext();

// Sample Luxury Fashion Seller Data
const INITIAL_SHOP = {
  name: "Maison de L'Ombre",
  logo: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80",
  banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
  description: "Bespoke Parisian tailoring, fine Italian silks, and timeless silhouettes. Handcrafted in our South Mumbai atelier.",
  category: "Haute Couture & Designer Wear",
  contact_email: "atelier@maisondelombre.luxury",
  contact_number: "+91 98201 54321",
  business_address: "Suite 4B, The Monolith Arcade, Colaba Causeway, Mumbai 400005, India",
  instagram: "@maisondelombre",
  website: "https://maisondelombre.luxury",
  is_open: true,
  return_policy: "14-Day Complimentary Luxury Exchange & Return on unworn pieces with tags intact. Bespoke pieces are non-refundable.",
  delivery_preferences: "White-glove climate-controlled express courier with signature required on delivery.",
  shop_visibility: "Public (Listed in Marketplace)",
};

const INITIAL_SELLER = {
  id: "sel-001",
  name: "Eleanor Vance",
  email: "eleanor@maisondelombre.luxury",
  phone: "+91 98201 54321",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  shop_name: "Maison de L'Ombre",
  shop_category: "Haute Couture & Designer Wear",
  role: "Verified Premier Atelier",
};

const INITIAL_PRODUCTS = [
  {
    id: "prod-sel-101",
    name: "Draped Silk Evening Slip Gown",
    description: "Bias-cut pure Mulberry silk slip gown with cowl neckline, French seams, and an understated fluid drape.",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80&sat=-100",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80&sat=-100",
    ],
    category: "Dresses",
    gender: "Women",
    brand: "Maison de L'Ombre",
    regular_price: 320,
    discount_price: 260,
    sizes: ["XS", "S", "M", "L"],
    size_stock: { XS: 4, S: 8, M: 6, L: 2 },
    colors: ["Noir Black", "Champagne Gold", "Slate Gray"],
    sku: "MLO-DRS-001",
    tags: "silk, eveningwear, slip, luxury, gala",
    stock_quantity: 20,
    status: "Published",
    sales_count: 34,
    created_at: "2026-10-15T10:00:00Z",
  },
  {
    id: "prod-sel-102",
    name: "Architectural Double-Breasted Wool Trench",
    description: "Heavyweight bonded Melton wool coat featuring peak lapels, horn buttons, and a clean minimalist drape.",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80&sat=-100",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80&sat=-100",
    ],
    category: "Men",
    gender: "Men",
    brand: "Maison de L'Ombre",
    regular_price: 490,
    discount_price: 420,
    sizes: ["S", "M", "L", "XL"],
    size_stock: { S: 3, M: 7, L: 5, XL: 2 },
    colors: ["Charcoal", "Pitch Black", "Camel"],
    sku: "MLO-COT-002",
    tags: "wool, trench, coat, winter, bespoke",
    stock_quantity: 17,
    status: "Published",
    sales_count: 22,
    created_at: "2026-10-18T14:30:00Z",
  },
  {
    id: "prod-sel-103",
    name: "High-Waist Pleated Wool Flannel Trousers",
    description: "Extended waistband with side adjusters, deep double reverse pleats, and generous straight leg silhouette.",
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80&sat=-100",
    ],
    category: "Women",
    gender: "Women",
    brand: "Maison de L'Ombre",
    regular_price: 210,
    discount_price: 185,
    sizes: ["XS", "S", "M", "L"],
    size_stock: { XS: 1, S: 2, M: 0, L: 1 },
    colors: ["Onyx Black", "Chalk Stripe", "Ecru"],
    sku: "MLO-TRS-003",
    tags: "trousers, tailoring, wool, pleated",
    stock_quantity: 4,
    status: "Published",
    sales_count: 48,
    created_at: "2026-10-22T09:15:00Z",
  },
  {
    id: "prod-sel-104",
    name: "Cashmere Mock-Neck Cocoon Knit",
    description: "Grade-A Mongolian 7-gauge cashmere knitwear with raglan sleeves and ribbed turn-up cuffs.",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80&sat=-100",
    ],
    category: "Shirts",
    gender: "Unisex",
    brand: "Maison de L'Ombre",
    regular_price: 280,
    discount_price: 240,
    sizes: ["S", "M", "L"],
    size_stock: { S: 5, M: 9, L: 4 },
    colors: ["Ivory", "Espresso", "Graphite"],
    sku: "MLO-KNT-004",
    tags: "cashmere, knit, winter, unisex",
    stock_quantity: 18,
    status: "Published",
    sales_count: 19,
    created_at: "2026-10-28T16:00:00Z",
  },
  {
    id: "prod-sel-105",
    name: "Square-Toe Italian Calfskin Ankle Boots",
    description: "Full-grain calfskin leather boots with angled Cuban heel, hand-burnished finish, and Blake-stitched leather sole.",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80&sat=-100",
    ],
    category: "Shoes",
    gender: "Women",
    brand: "Maison de L'Ombre",
    regular_price: 360,
    discount_price: 310,
    sizes: ["S", "M", "L"],
    size_stock: { S: 0, M: 0, L: 0 },
    colors: ["Noir Gloss", "Mahogany"],
    sku: "MLO-SHO-005",
    tags: "shoes, boots, leather, calfskin",
    stock_quantity: 0,
    status: "Out of Stock",
    sales_count: 15,
    created_at: "2026-10-29T11:20:00Z",
  },
  {
    id: "prod-sel-106",
    name: "Sculptural Satin Cutout Cocktail Dress",
    description: "Heavy Duchess satin mini dress with subtle structural boning and asymmetrical back cutout detail.",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80&sat=-100",
    ],
    category: "Dresses",
    gender: "Women",
    brand: "Maison de L'Ombre",
    regular_price: 340,
    discount_price: 295,
    sizes: ["XS", "S", "M"],
    size_stock: { XS: 3, S: 5, M: 2 },
    colors: ["Pure Obsidian"],
    sku: "MLO-DRS-006",
    tags: "satin, cocktail, dress, party",
    stock_quantity: 10,
    status: "Draft",
    sales_count: 0,
    created_at: "2026-11-01T15:00:00Z",
  },
];

const INITIAL_ORDERS = [
  {
    id: "ord-801",
    order_id: "ZEL-92841-A",
    customer_name: "Helena Vance",
    customer_email: "helena.v@example.com",
    customer_phone: "+91 98765 43210",
    order_date: "2026-11-05T14:20:00Z",
    total_amount: 514.50,
    payment_status: "Paid",
    payment_method: "Razorpay (Credit Card)",
    order_status: "Processing",
    shipping_address: {
      full_name: "Helena Vance",
      mobile_number: "+91 98765 43210",
      house_building: "Apartment 14B, The Monolith Residences",
      street_area: "42 Crescent Avenue, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pin_code: "400050",
    },
    tracking_number: "ZEL-IND-8812304",
    courier_name: "Blue Dart Apex",
    items: [
      {
        product_id: "prod-sel-101",
        product_name: "Draped Silk Evening Slip Gown",
        product_image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80&sat=-100",
        size: "S",
        color: "Noir Black",
        quantity: 1,
        price: 260,
      },
      {
        product_id: "prod-sel-104",
        product_name: "Cashmere Mock-Neck Cocoon Knit",
        product_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80&sat=-100",
        size: "M",
        color: "Ivory",
        quantity: 1,
        price: 240,
      },
    ],
  },
  {
    id: "ord-802",
    order_id: "ZEL-71402-B",
    customer_name: "Julian Thorne",
    customer_email: "j.thorne@example.com",
    customer_phone: "+91 98112 34567",
    order_date: "2026-11-06T09:40:00Z",
    total_amount: 420.00,
    payment_status: "Paid",
    payment_method: "Razorpay (UPI)",
    order_status: "New",
    shipping_address: {
      full_name: "Julian Thorne",
      mobile_number: "+91 98112 34567",
      house_building: "Villa 8, Garden Estate",
      street_area: "MG Road, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pin_code: "560038",
    },
    tracking_number: "",
    courier_name: "",
    items: [
      {
        product_id: "prod-sel-102",
        product_name: "Architectural Double-Breasted Wool Trench",
        product_image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80&sat=-100",
        size: "L",
        color: "Charcoal",
        quantity: 1,
        price: 420,
      },
    ],
  },
  {
    id: "ord-803",
    order_id: "ZEL-65190-C",
    customer_name: "Aria Montgomery",
    customer_email: "aria.m@example.com",
    customer_phone: "+91 99200 11223",
    order_date: "2026-11-03T11:15:00Z",
    total_amount: 185.00,
    payment_status: "Paid",
    payment_method: "Razorpay (Net Banking)",
    order_status: "Delivered",
    shipping_address: {
      full_name: "Aria Montgomery",
      mobile_number: "+91 99200 11223",
      house_building: "Flat 502, Sky High Towers",
      street_area: "Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pin_code: "500033",
    },
    tracking_number: "ZEL-IND-7731920",
    courier_name: "Delhivery Surface Express",
    items: [
      {
        product_id: "prod-sel-103",
        product_name: "High-Waist Pleated Wool Flannel Trousers",
        product_image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80&sat=-100",
        size: "M",
        color: "Onyx Black",
        quantity: 1,
        price: 185,
      },
    ],
  },
  {
    id: "ord-804",
    order_id: "ZEL-51829-D",
    customer_name: "David Chen",
    customer_email: "david.chen@example.com",
    customer_phone: "+91 97711 88990",
    order_date: "2026-11-01T17:05:00Z",
    total_amount: 310.00,
    payment_status: "Paid",
    payment_method: "Razorpay (Card)",
    order_status: "Shipped",
    shipping_address: {
      full_name: "David Chen",
      mobile_number: "+91 97711 88990",
      house_building: "Penthouse C, The Palms",
      street_area: "Golf Course Road",
      city: "Gurugram",
      state: "Haryana",
      pin_code: "122002",
    },
    tracking_number: "ZEL-IND-9920145",
    courier_name: "Blue Dart Apex",
    items: [
      {
        product_id: "prod-sel-105",
        product_name: "Square-Toe Italian Calfskin Ankle Boots",
        product_image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80&sat=-100",
        size: "M",
        color: "Noir Gloss",
        quantity: 1,
        price: 310,
      },
    ],
  },
];

const INITIAL_COUPONS = [
  {
    id: "cp-01",
    code: "ATELIER15",
    discount_type: "Percentage",
    discount_value: 15,
    min_order: 200,
    max_discount: 60,
    start_date: "2026-11-01",
    expiry_date: "2026-12-31",
    usage_limit: 100,
    usage_count: 42,
    is_active: true,
  },
  {
    id: "cp-02",
    code: "NOIRWINTER",
    discount_type: "Fixed Amount",
    discount_value: 50,
    min_order: 350,
    max_discount: 50,
    start_date: "2026-11-05",
    expiry_date: "2026-11-30",
    usage_limit: 50,
    usage_count: 18,
    is_active: true,
  },
  {
    id: "cp-03",
    code: "VIPCOUTURE",
    discount_type: "Percentage",
    discount_value: 20,
    min_order: 500,
    max_discount: 150,
    start_date: "2026-10-01",
    expiry_date: "2026-10-31",
    usage_limit: 25,
    usage_count: 25,
    is_active: false,
  },
];

const INITIAL_REVIEWS = [
  {
    id: "rev-01",
    product_id: "prod-sel-101",
    product_name: "Draped Silk Evening Slip Gown",
    product_image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80&sat=-100",
    customer_name: "Sophia Sterling",
    rating: 5,
    date: "2026-11-04",
    comment: "The drape and weight of this silk gown is comparable to Parisian couture houses. Wore it to a black-tie gala and received endless compliments.",
    reply: "Dear Sophia, thank you tremendously for this gracious review. Crafting fluid silhouettes with pure Mulberry silk is our passion.",
  },
  {
    id: "rev-02",
    product_id: "prod-sel-102",
    product_name: "Architectural Double-Breasted Wool Trench",
    product_image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80&sat=-100",
    customer_name: "Marcus Vance",
    rating: 5,
    date: "2026-11-02",
    comment: "Superb structured shoulders and deep Charcoal hue. The melton wool keeps freezing wind away while feeling effortlessly sleek.",
    reply: "",
  },
  {
    id: "rev-03",
    product_id: "prod-sel-103",
    product_name: "High-Waist Pleated Wool Flannel Trousers",
    product_image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80&sat=-100",
    customer_name: "Clara Dubois",
    rating: 4,
    date: "2026-10-30",
    comment: "Tailoring is exquisite. The waist adjusters are very helpful. Note that the leg opening is quite wide, but drapes cleanly over boots.",
    reply: "Thank you Clara! The wide silhouette is intentional for that dramatic runway sweep. Glad you appreciate the waist adjusters.",
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-01",
    type: "order",
    title: "New Luxury Order Received",
    description: "Order ZEL-71402-B for $420.00 from Julian Thorne requires acceptance.",
    time: "2 hours ago",
    is_read: false,
  },
  {
    id: "notif-02",
    type: "stock",
    title: "Low Inventory Alert",
    description: "High-Waist Pleated Wool Flannel Trousers has only 4 pieces remaining across all sizes.",
    time: "5 hours ago",
    is_read: false,
  },
  {
    id: "notif-03",
    type: "payout",
    title: "Disbursement Scheduled",
    description: "Your bi-weekly payout of $1,840.50 has been cleared and initiated via NEFT.",
    time: "1 day ago",
    is_read: true,
  },
  {
    id: "notif-04",
    type: "review",
    title: "5-Star Review Received",
    description: "Sophia Sterling left a 5-star review on Draped Silk Evening Slip Gown.",
    time: "2 days ago",
    is_read: true,
  },
  {
    id: "notif-05",
    type: "platform",
    title: "Winter Runway Promotion Active",
    description: "ZELORA Winter Editorial showcase is now live on customer homepage.",
    time: "3 days ago",
    is_read: true,
  },
];

const INITIAL_PAYOUTS = [
  {
    id: "PAY-2026-009",
    amount: 1840.50,
    date: "2026-11-05",
    payment_method: "Direct Bank Wire (HDFC)",
    reference: "CMS-NEFT-9912048",
    status: "Completed",
  },
  {
    id: "PAY-2026-008",
    amount: 2450.00,
    date: "2026-10-22",
    payment_method: "Direct Bank Wire (HDFC)",
    reference: "CMS-NEFT-8819201",
    status: "Completed",
  },
  {
    id: "PAY-2026-007",
    amount: 1320.00,
    date: "2026-10-08",
    payment_method: "Direct Bank Wire (HDFC)",
    reference: "CMS-NEFT-7729012",
    status: "Completed",
  },
];

const INITIAL_TICKETS = [
  {
    id: "TCK-8812",
    subject: "Inquiry regarding seasonal curated banner placement",
    category: "Marketing & Featured Collections",
    status: "Open",
    created_at: "2026-11-04T15:20:00Z",
    messages: [
      {
        sender: "Eleanor Vance (Seller)",
        text: "Hello ZELORA Editorial Team, we are releasing our Winter Silk Capsule next week and would like to be considered for the homepage New Arrivals banner.",
        time: "Nov 4, 3:20 PM",
      },
      {
        sender: "Concierge Admin",
        text: "Bonjour Eleanor. Your boutique aesthetic fits our Winter Runway theme exceptionally well. We have submitted your lookbook to the styling lead.",
        time: "Nov 5, 10:15 AM",
      },
    ],
  },
  {
    id: "TCK-7619",
    subject: "Express courier packaging material resupply",
    category: "Logistics & Fulfillment",
    status: "Resolved",
    created_at: "2026-10-25T11:00:00Z",
    messages: [
      {
        sender: "Eleanor Vance (Seller)",
        text: "We require 50 additional ZELORA Noir luxury garment bags and ribbon boxes for high-value evening wear shipments.",
        time: "Oct 25, 11:00 AM",
      },
      {
        sender: "Logistics Support",
        text: "Dispatched package #PKG-8820 containing 50 garment bags. Delivered on Oct 27.",
        time: "Oct 27, 2:30 PM",
      },
    ],
  },
];

export function SellerProvider({ children }) {
  // Persistence Helper
  const loadStored = (key, fallback) => {
    try {
      const item = localStorage.getItem(`zelora_seller_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveStored = (key, value) => {
    try {
      localStorage.setItem(`zelora_seller_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  };

  // State Declarations
  const [seller, setSeller] = useState(() => loadStored('user', INITIAL_SELLER));
  const [shop, setShop] = useState(() => loadStored('shop', INITIAL_SHOP));
  const [products, setProducts] = useState(() => loadStored('products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => loadStored('orders', INITIAL_ORDERS));
  const [coupons, setCoupons] = useState(() => loadStored('coupons', INITIAL_COUPONS));
  const [reviews, setReviews] = useState(() => loadStored('reviews', INITIAL_REVIEWS));
  const [notifications, setNotifications] = useState(() => loadStored('notifs', INITIAL_NOTIFICATIONS));
  const [payouts, setPayouts] = useState(() => loadStored('payouts', INITIAL_PAYOUTS));
  const [tickets, setTickets] = useState(() => loadStored('tickets', INITIAL_TICKETS));
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(() => {
    return localStorage.getItem('zelora_seller_auth') === 'true';
  });

  // Sync to local storage
  useEffect(() => saveStored('user', seller), [seller]);
  useEffect(() => saveStored('shop', shop), [shop]);
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
      name: `${res.user?.first_name || ''} ${res.user?.last_name || ''}`.trim() || res.user?.email?.split('@')[0] || 'Eleanor Vance',
      email: res.user?.email || email,
      phone: res.user?.phone_number || '+91 98201 54321',
      avatar: res.user?.avatar_url || INITIAL_SELLER.avatar,
      shop_name: res.shop?.name || res.user?.shop_name || "Maison de L'Ombre",
      shop_category: res.shop?.category || res.user?.shop_category || "Haute Couture & Designer Wear",
      role: "Verified Atelier",
    };

    const shopData = {
      ...INITIAL_SHOP,
      name: res.shop?.name || sellerUser.shop_name,
      category: res.shop?.category || sellerUser.shop_category,
      contact_email: res.shop?.contact_email || res.user?.email || email,
      contact_number: res.shop?.contact_number || sellerUser.phone,
      business_address: res.shop?.business_address || INITIAL_SHOP.business_address,
      description: res.shop?.description || INITIAL_SHOP.description,
      is_open: res.shop?.is_open ?? true,
    };

    setSeller(sellerUser);
    setShop(shopData);
    setIsSellerAuthenticated(true);
    localStorage.setItem('zelora_seller_auth', 'true');
    saveStored('user', sellerUser);
    saveStored('shop', shopData);
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
      avatar: res.user?.avatar_url || INITIAL_SELLER.avatar,
      shop_name: res.shop?.name || formData.shop_name,
      shop_category: res.shop?.category || formData.shop_category,
      role: "Verified Boutique",
    };

    const shopData = {
      ...INITIAL_SHOP,
      name: res.shop?.name || formData.shop_name,
      category: res.shop?.category || formData.shop_category,
      contact_email: res.shop?.contact_email || formData.email,
      contact_number: res.shop?.contact_number || formData.mobile_number,
    };

    setSeller(sellerUser);
    setShop(shopData);
    setIsSellerAuthenticated(true);
    localStorage.setItem('zelora_seller_auth', 'true');
    saveStored('user', sellerUser);
    saveStored('shop', shopData);
    showToast("Seller registration complete! Welcome to ZELORA Atelier.");
    return { user: sellerUser, shop: shopData };
  };

  const logoutSeller = () => {
    setIsSellerAuthenticated(false);
    localStorage.removeItem('zelora_seller_auth');
    localStorage.removeItem('zelora_seller_access_token');
    localStorage.removeItem('zelora_seller_refresh_token');
    showToast("Signed out from Seller Center.");
  };

  // Shop Profile & Settings Operations
  const updateShopProfile = (updatedFields) => {
    setShop((prev) => ({ ...prev, ...updatedFields }));
    if (updatedFields.name) {
      setSeller((prev) => ({ ...prev, shop_name: updatedFields.name }));
    }
    showToast("Shop profile updated successfully.");
  };

  const updateShopSettings = (settingsFields) => {
    setShop((prev) => ({ ...prev, ...settingsFields }));
    showToast("Shop settings saved.");
  };

  const toggleShopAvailability = () => {
    setShop((prev) => {
      const next = !prev.is_open;
      showToast(next ? "Shop is now Open for customer orders." : "Shop is now Temporarily Closed.");
      return { ...prev, is_open: next };
    });
  };

  // Product Operations
  const addProduct = (productData) => {
    const newProd = {
      id: `prod-sel-${Date.now()}`,
      created_at: new Date().toISOString(),
      sales_count: 0,
      status: productData.status || "Published",
      brand: shop.name || "ZELORA Seller",
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
      payment_method: `Direct Wire (${bankInfo?.bank_name || 'HDFC'})`,
      reference: `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: "In Review",
    };
    setPayouts((prev) => [newPayout, ...prev]);
    showToast(`Payout request for $${amount} submitted for processing.`);
  };

  // Support
  const createSupportTicket = (ticketData) => {
    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      status: "Open",
      ...ticketData,
      messages: [
        {
          sender: `${seller.name} (Seller)`,
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
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              {
                sender: `${seller.name} (Seller)`,
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

