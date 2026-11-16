// ZELORA Mobile Orders History & Tracking Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { ordersApi } from '../../api/ordersApi';
import { useAuth } from '../../context/AuthContext';

export const OrdersScreen = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!isAuthenticated) {
        setOrders([]);
        return;
      }
      const res = await ordersApi.getOrders();
      const list = res.results || res.data || (Array.isArray(res) ? res : []);
      setOrders(list);
    } catch (err) {
      console.warn('Orders fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status = '') => {
    const s = status.toUpperCase();
    if (s.includes('DELIVER') || s.includes('CONFIRM')) return colors.success;
    if (s.includes('CANCEL')) return colors.error;
    if (s.includes('SHIP')) return colors.info;
    return colors.goldBright;
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="MY ATELIER ORDERS" showBack />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.loaderText}>Retrieving Atelier Ledgers...</Text>
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id || item.order_id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.gold}
            />
          }
          renderItem={({ item }) => {
            const statusColor = getStatusColor(item.status);
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent Order';

            return (
              <View style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderId}>
                      ORDER #{item.order_id || item.id || 'ZLR-90214'}
                    </Text>
                    <Text style={styles.orderDate}>{dateStr}</Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {(item.status || 'PROCESSING').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {item.items && item.items.length > 0 && (
                  <View style={styles.itemsPreview}>
                    {item.items.map((prod, idx) => (
                      <Text key={idx} style={styles.itemName} numberOfLines={1}>
                        • {prod.quantity || 1}x {prod.name || prod.product_name || 'Bespoke Piece'}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                  <Text style={styles.totalValue}>
                    ₹{(parseFloat(item.total_amount) || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyWrap}>
          <Feather name="package" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>NO ORDERS RECORDED</Text>
          <Text style={styles.emptySubtitle}>
            {isAuthenticated
              ? 'You have not placed any orders yet. Discover timeless monochrome garments now.'
              : 'Please sign in to view your order history and live parcel tracking.'}
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => (isAuthenticated ? navigation.navigate('ShopTab') : navigation.navigate('Login'))}
          >
            <Text style={styles.ctaBtnText}>
              {isAuthenticated ? 'EXPLORE CATALOGUE' : 'SIGN IN TO YOUR ACCOUNT'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    ...typography.brandSubtitle,
    color: colors.textPrimary,
    fontSize: 12,
  },
  orderDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.surfaceElevated,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemsPreview: {
    marginBottom: 12,
    gap: 4,
  },
  itemName: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    ...typography.brandSubtitle,
    color: colors.gold,
    fontSize: 10,
  },
  totalValue: {
    ...typography.price,
    color: colors.goldBright,
    fontSize: 16,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  ctaBtnText: {
    ...typography.buttonText,
    color: colors.goldBright,
    fontSize: 11,
  },
});
