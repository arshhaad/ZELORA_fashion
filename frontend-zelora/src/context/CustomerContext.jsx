import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { authApi } from '../services/api';

const CustomerContext = createContext(null);

export const getCustomerStorageKey = (prefix, user) => {
  if (user?.id) return `zelora_${prefix}_user_${user.id}`;
  if (user?.email) return `zelora_${prefix}_${user.email.toLowerCase().trim()}`;
  return null;
};

export function CustomerProvider({ children }) {
  const { user } = useAuth();
  const { addToCart, showToast } = useCart();

  const prevUserRef = useRef(user);

  // Addresses State
  const [addresses, setAddresses] = useState(() => {
    try {
      localStorage.removeItem('zelora_addresses'); // purge legacy
      const key = getCustomerStorageKey('addresses', user);
      if (!key) return [];
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
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
      localStorage.removeItem('zelora_orders'); // purge legacy
      const key = getCustomerStorageKey('orders', user);
      if (!key) return [];
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    try {
      localStorage.removeItem('zelora_notifications'); // purge legacy
      const key = getCustomerStorageKey('notifications', user);
      if (!key) return [];
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    try {
      const key = getCustomerStorageKey('notif_prefs', user);
      if (!key) return { orderUpdates: true, promotions: true };
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { orderUpdates: true, promotions: true };
    } catch {
      return { orderUpdates: true, promotions: true };
    }
  });

  // Listen for global logout events for instant state wipe
  useEffect(() => {
    const handleLogout = () => {
      setAddresses([]);
      setOrders([]);
      setNotifications([]);
      setSelectedAddressId(null);
      try {
        localStorage.removeItem('zelora_addresses');
        localStorage.removeItem('zelora_orders');
        localStorage.removeItem('zelora_notifications');
      } catch (e) {
        console.warn('Error clearing customer data on logout', e);
      }
    };
    window.addEventListener('zelora_logout', handleLogout);
    return () => window.removeEventListener('zelora_logout', handleLogout);
  }, []);

  // When user changes (login, logout, new registration)
  useEffect(() => {
    prevUserRef.current = user;

    // Always purge legacy un-scoped keys
    localStorage.removeItem('zelora_addresses');
    localStorage.removeItem('zelora_orders');
    localStorage.removeItem('zelora_notifications');

    if (!user) {
      // Logged out: immediately clear everything
      setAddresses([]);
      setOrders([]);
      setNotifications([]);
      setSelectedAddressId(null);
    } else {
      // User is logged in: load user-scoped cached data first
      const addrKey = getCustomerStorageKey('addresses', user);
      const ordersKey = getCustomerStorageKey('orders', user);
      const notifKey = getCustomerStorageKey('notifications', user);
      const prefsKey = getCustomerStorageKey('notif_prefs', user);

      try {
        if (addrKey) {
          const cachedAddr = localStorage.getItem(addrKey);
          if (cachedAddr) {
            const parsed = JSON.parse(cachedAddr);
            setAddresses(parsed);
            const def = parsed.find((a) => a.is_default) || parsed[0];
            setSelectedAddressId(def ? def.id : null);
          } else {
            setAddresses([]);
            setSelectedAddressId(null);
          }
        }
        if (ordersKey) {
          const cachedOrders = localStorage.getItem(ordersKey);
          setOrders(cachedOrders ? JSON.parse(cachedOrders) : []);
        } else {
          setOrders([]);
        }
        if (notifKey) {
          const cachedNotifs = localStorage.getItem(notifKey);
          setNotifications(cachedNotifs ? JSON.parse(cachedNotifs) : []);
        } else {
          setNotifications([]);
        }
        if (prefsKey) {
          const cachedPrefs = localStorage.getItem(prefsKey);
          if (cachedPrefs) setNotificationPrefs(JSON.parse(cachedPrefs));
        }
      } catch (e) {
        console.warn('Could not read user customer storage', e);
      }

      // Fetch fresh, authentic data from backend for this authenticated user
      authApi.getAddresses()
        .then((res) => {
          if (Array.isArray(res)) {
            setAddresses(res);
            const def = res.find((a) => a.is_default) || res[0];
            setSelectedAddressId(def ? def.id : null);
            if (addrKey) localStorage.setItem(addrKey, JSON.stringify(res));
          }
        })
        .catch(() => {});

      authApi.getOrders()
        .then((res) => {
          if (Array.isArray(res)) {
            setOrders(res);
            if (ordersKey) localStorage.setItem(ordersKey, JSON.stringify(res));
          }
        })
        .catch(() => {});

      authApi.getNotifications()
        .then((res) => {
          if (Array.isArray(res)) {
            setNotifications(res);
            if (notifKey) localStorage.setItem(notifKey, JSON.stringify(res));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Persist to user-scoped storage when states change
  useEffect(() => {
    if (!user) return;
    const addrKey = getCustomerStorageKey('addresses', user);
    if (addrKey) {
      try {
        localStorage.setItem(addrKey, JSON.stringify(addresses));
      } catch (e) {}
    }
  }, [addresses, user]);

  useEffect(() => {
    if (!user) return;
    const ordersKey = getCustomerStorageKey('orders', user);
    if (ordersKey) {
      try {
        localStorage.setItem(ordersKey, JSON.stringify(orders));
      } catch (e) {}
    }
  }, [orders, user]);

  useEffect(() => {
    if (!user) return;
    const notifKey = getCustomerStorageKey('notifications', user);
    if (notifKey) {
      try {
        localStorage.setItem(notifKey, JSON.stringify(notifications));
      } catch (e) {}
    }
  }, [notifications, user]);

  useEffect(() => {
    if (!user) return;
    const prefsKey = getCustomerStorageKey('notif_prefs', user);
    if (prefsKey) {
      try {
        localStorage.setItem(prefsKey, JSON.stringify(notificationPrefs));
      } catch (e) {}
    }
  }, [notificationPrefs, user]);

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
