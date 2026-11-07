import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { authApi } from '../services/api';

const CustomerContext = createContext(null);

const INITIAL_ADDRESSES = [
  {
    id: 1,
    full_name: 'Helena Vance',
    mobile_number: '+91 98765 43210',
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
    full_name: 'Helena Vance (Studio)',
    mobile_number: '+91 98765 43211',
    house_building: 'Atelier Floor 3, Design Quarter',
    street_area: '18 Rue de Couture, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin_code: '560038',
    address_type: 'Work',
    is_default: false,
  },
];

const INITIAL_ORDERS = [
  {
    id: 101,
    order_id: 'ZEL-92841-A',
    created_at: '2026-11-04T10:30:00Z',
    status: 'Shipped',
    status_updated_at: '2026-11-05T14:20:00Z',
    estimated_delivery: 'Nov 08, 2026',
    subtotal: 544,
    discount: 54,
    delivery_charges: 0,
    tax: 24.5,
    total_amount: 514.5,
    payment_method: 'Credit / Debit Card',
    payment_status: 'Paid',
    delivery_method: 'Standard Delivery',
    tracking_number: 'ZEL-IND-9948291',
    shipping_address: {
      full_name: 'Helena Vance',
      mobile_number: '+91 98765 43210',
      house_building: 'Apartment 14B, The Monolith Residences',
      street_area: '42 Crescent Avenue, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pin_code: '400050',
      address_type: 'Home',
    },
    items: [
      {
        id: 1,
        product_id: 'zel-001',
        product_name: 'Structured Double-Breasted Wool Overcoat',
        product_image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80&sat=-100',
        brand: 'ZELORA Atelier',
        size: 'M',
        color: 'Noir Black',
        quantity: 1,
        price: 349,
      },
      {
        id: 2,
        product_id: 'zel-004',
        product_name: 'Pleated High-Rise Wide Trousers',
        product_image: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80&sat=-100',
        brand: 'ZELORA Atelier',
        size: 'S',
        color: 'Charcoal Black',
        quantity: 1,
        price: 195,
      },
    ],
  },
  {
    id: 102,
    order_id: 'ZEL-83192-M',
    created_at: '2026-10-22T16:15:00Z',
    status: 'Delivered',
    status_updated_at: '2026-10-25T11:45:00Z',
    estimated_delivery: 'Delivered on Oct 25, 2026',
    subtotal: 260,
    discount: 26,
    delivery_charges: 0,
    tax: 11.7,
    total_amount: 245.7,
    payment_method: 'UPI',
    payment_status: 'Paid',
    delivery_method: 'Express Delivery',
    tracking_number: 'ZEL-IND-8812304',
    shipping_address: {
      full_name: 'Helena Vance',
      mobile_number: '+91 98765 43210',
      house_building: 'Apartment 14B, The Monolith Residences',
      street_area: '42 Crescent Avenue, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pin_code: '400050',
      address_type: 'Home',
    },
    items: [
      {
        id: 3,
        product_id: 'zel-002',
        product_name: 'Draped Silk Evening Slip Gown',
        product_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80&sat=-100',
        brand: 'ZELORA Noir',
        size: 'S',
        color: 'Midnight Onyx',
        quantity: 1,
        price: 260,
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    category: 'orders',
    title: 'Order Dispatched (ZEL-92841-A)',
    description: 'Your tailored wool garments have departed our central Mumbai atelier via express courier.',
    is_read: false,
    created_at: '2026-11-05T14:20:00Z',
  },
  {
    id: 2,
    category: 'orders',
    title: 'Payment Confirmed',
    description: 'Payment of $514.50 was authorized via 256-bit encrypted checkout gateway.',
    is_read: true,
    created_at: '2026-11-04T10:31:00Z',
  },
  {
    id: 3,
    category: 'promotions',
    title: 'Private Winter Archive Access',
    description: 'Complimentary private runway invitations now unlocked for verified ZELORA customers.',
    is_read: false,
    created_at: '2026-11-03T09:00:00Z',
  },
  {
    id: 4,
    category: 'promotions',
    title: 'New Cashmere Knitwear Drop',
    description: 'Heavy gauge Mongolian cashmere pieces added to the seasonal catalog.',
    is_read: true,
    created_at: '2026-10-30T12:00:00Z',
  },
];

export function CustomerProvider({ children }) {
  const { user } = useAuth();
  const { addToCart, showToast } = useCart();

  // Addresses State
  const [addresses, setAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_addresses');
      return stored ? JSON.parse(stored) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  });

  // Selected Address for Checkout
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const defaultAddr = addresses.find((a) => a.is_default);
    return defaultAddr ? defaultAddr.id : addresses[0]?.id || null;
  });

  // Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_orders');
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_notifications');
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_notif_prefs');
      return stored ? JSON.parse(stored) : { orderUpdates: true, promotions: true };
    } catch {
      return { orderUpdates: true, promotions: true };
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('zelora_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('zelora_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('zelora_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('zelora_notif_prefs', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  // Load from backend API if authenticated
  useEffect(() => {
    if (user) {
      authApi.getAddresses()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setAddresses(res);
            const def = res.find((a) => a.is_default) || res[0];
            setSelectedAddressId(def.id);
          }
        })
        .catch(() => {});

      authApi.getOrders()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setOrders(res);
          }
        })
        .catch(() => {});

      authApi.getNotifications()
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setNotifications(res);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Address Actions
  const addAddress = async (data) => {
    const isFirst = addresses.length === 0;
    const isDef = data.is_default || isFirst;

    try {
      if (user) {
        const created = await authApi.createAddress({ ...data, is_default: isDef });
        setAddresses((prev) => {
          const updated = isDef ? prev.map((a) => ({ ...a, is_default: false })) : [...prev];
          return [created, ...updated];
        });
        setSelectedAddressId(created.id);
        showToast('Delivery address saved successfully.');
        return created;
      }
    } catch (e) {
      console.warn('Backend address create fallback to local', e);
    }

    const newAddr = {
      id: Date.now(),
      ...data,
      is_default: isDef,
      created_at: new Date().toISOString(),
    };

    setAddresses((prev) => {
      const updated = isDef ? prev.map((a) => ({ ...a, is_default: false })) : [...prev];
      return [newAddr, ...updated];
    });
    setSelectedAddressId(newAddr.id);
    showToast('Delivery address saved.');
    return newAddr;
  };

  const updateAddress = async (id, data) => {
    try {
      if (user) {
        await authApi.updateAddress(id, data);
      }
    } catch (e) {
      console.warn('Backend address update fallback to local', e);
    }

    setAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id) {
          return { ...addr, ...data };
        }
        if (data.is_default) {
          return { ...addr, is_default: false };
        }
        return addr;
      })
    );
    showToast('Address updated successfully.');
  };

  const deleteAddress = async (id) => {
    try {
      if (user) {
        await authApi.deleteAddress(id);
      }
    } catch (e) {
      console.warn('Backend address delete fallback', e);
    }

    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.is_default)) {
        filtered[0].is_default = true;
      }
      return filtered;
    });

    if (selectedAddressId === id) {
      const next = addresses.find((a) => a.id !== id);
      setSelectedAddressId(next ? next.id : null);
    }
    showToast('Address removed.', 'info');
  };

  const setDefaultAddress = async (id) => {
    try {
      if (user) {
        await authApi.setDefaultAddress(id);
      }
    } catch (e) {
      console.warn('Backend set default address fallback', e);
    }

    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
    );
    setSelectedAddressId(id);
    showToast('Default delivery address updated.');
  };

  // Orders Actions
  const createOrder = async (orderPayload) => {
    const uniqueOrderId = `ZEL-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 3).toUpperCase()}`;

    const newOrder = {
      id: Date.now(),
      order_id: uniqueOrderId,
      created_at: new Date().toISOString(),
      status: 'Confirmed',
      status_updated_at: new Date().toISOString(),
      estimated_delivery: orderPayload.delivery_method?.includes('Express')
        ? 'Within 48 Hours'
        : '3 - 5 Business Days',
      tracking_number: `TRK-ZEL-${Math.floor(1000000 + Math.random() * 9000000)}`,
      ...orderPayload,
    };

    try {
      if (user) {
        const created = await authApi.createOrder(orderPayload);
        setOrders((prev) => [created, ...prev]);
        addOrderNotification(created.order_id, created.total_amount, created.razorpay_payment_id || orderPayload.razorpay_payment_id);
        return created;
      }
    } catch (e) {
      console.warn('Backend order creation fallback to local', e);
    }

    setOrders((prev) => [newOrder, ...prev]);
    addOrderNotification(newOrder.order_id, newOrder.total_amount, newOrder.razorpay_payment_id);
    return newOrder;
  };

  const addOrderNotification = (orderId, total, paymentId) => {
    const notif = {
      id: Date.now(),
      category: 'orders',
      title: `Order Placed & Confirmed (${orderId})`,
      description: paymentId
        ? `Payment of $${total} authorized via Razorpay (Ref: ${paymentId}).`
        : `Your order for $${total} has been confirmed. You will receive dispatch updates.`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const cancelOrder = async (orderId) => {
    try {
      if (user) {
        await authApi.cancelOrder(orderId);
      }
    } catch (e) {
      console.warn('Backend cancel order fallback', e);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId
          ? { ...o, status: 'Cancelled', status_updated_at: new Date().toISOString() }
          : o
      )
    );

    const notif = {
      id: Date.now(),
      category: 'orders',
      title: `Order Cancelled (${orderId})`,
      description: `Order ${orderId} has been cancelled. Any authorized charges will be reversed.`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Order ${orderId} has been cancelled.`);
  };

  const returnOrder = async (orderId) => {
    try {
      if (user) {
        await authApi.returnOrder(orderId);
      }
    } catch (e) {
      console.warn('Backend return order fallback', e);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === orderId
          ? { ...o, status: 'Returned', status_updated_at: new Date().toISOString() }
          : o
      )
    );

    const notif = {
      id: Date.now(),
      category: 'orders',
      title: `Return Initiated (${orderId})`,
      description: `Return pickup for order ${orderId} has been scheduled with courier.`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Return initiated for Order ${orderId}.`);
  };

  const reorder = (order) => {
    if (!order || !order.items) return;
    let count = 0;
    order.items.forEach((item) => {
      // Reconstruct minimal product object
      const productObj = {
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        images: [item.product_image],
        brand: item.brand || 'ZELORA',
        sizes: [item.size],
      };
      addToCart(productObj, item.size, item.color, item.quantity);
      count += item.quantity;
    });
    showToast(`Added ${count} piece(s) from order ${order.order_id} back to bag.`);
  };

  // Notification Actions
  const markAsRead = async (id) => {
    try {
      if (user) await authApi.markNotificationRead(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    try {
      if (user) await authApi.markNotificationRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast('All notifications marked as read.');
  };

  const deleteNotification = async (id) => {
    try {
      if (user) await authApi.deleteNotification(id);
    } catch {}
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification deleted.', 'info');
  };

  const toggleNotificationPref = (key) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    showToast('Notification preferences updated.');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;

  return (
    <CustomerContext.Provider
      value={{
        // Addresses
        addresses,
        selectedAddress,
        selectedAddressId,
        setSelectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,

        // Orders
        orders,
        createOrder,
        cancelOrder,
        returnOrder,
        reorder,

        // Notifications
        notifications,
        unreadNotificationsCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        notificationPrefs,
        toggleNotificationPref,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

