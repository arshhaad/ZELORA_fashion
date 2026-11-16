// ZELORA Mobile Shopping Bag Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { useCart } from '../../context/CartContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80&sat=-100';

export const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, shipping, tax, total, totalCount } =
    useCart();

  const handleProceedCheckout = () => {
    navigation.navigate('Checkout', { isDirectBuy: false });
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="SHOPPING BAG" showCart={false} />

      {cartItems.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerNotice}>
            <Text style={styles.headerNoticeText}>
              {totalCount} {totalCount === 1 ? 'PIECE' : 'PIECES'} IN YOUR ATELIER BAG
            </Text>
          </View>

          {/* Cart Items List */}
          <View style={styles.itemsList}>
            {cartItems.map((item) => {
              const product = item.product;
              const img =
                product.image && product.image.startsWith('http')
                  ? product.image
                  : product.image
                  ? `http://10.10.20.101:8000${product.image}`
                  : FALLBACK_IMAGE;

              return (
                <View key={item.id} style={styles.cartCard}>
                  <Image source={{ uri: img }} style={styles.cardImg} resizeMode="cover" />

                  <View style={styles.cardDetails}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardBrand}>{product.brand_name || 'ZELORA ATELIER'}</Text>
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Feather name="trash-2" size={15} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {product.name || product.title}
                    </Text>

                    <View style={styles.specRow}>
                      <Text style={styles.specText}>Size: {item.size}</Text>
                      <Text style={styles.specDivider}>•</Text>
                      <Text style={styles.pricePerPiece}>₹{item.price.toLocaleString('en-IN')}</Text>
                    </View>

                    <View style={styles.cardBottomRow}>
                      <View style={styles.qtyControl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Feather name="minus" size={13} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Feather name="plus" size={13} color={colors.textPrimary} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemTotalPrice}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Complimentary Shipping Banner */}
          <View style={styles.shippingNotice}>
            <Feather name="shield" size={16} color={colors.gold} />
            <Text style={styles.shippingNoticeText}>
              {subtotal >= 1500
                ? 'Complimentary white-glove shipping applied.'
                : `Add ₹${(1500 - subtotal).toLocaleString('en-IN')} more for complimentary delivery.`}
            </Text>
          </View>

          {/* Order Summary Breakdown */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>ORDER SUMMARY</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated GST (5%)</Text>
              <Text style={styles.summaryValue}>Included (₹{tax.toLocaleString('en-IN')})</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Checkout CTA */}
          <TouchableOpacity
            style={styles.checkoutBtn}
            activeOpacity={0.85}
            onPress={handleProceedCheckout}
          >
            <Text style={styles.checkoutBtnText}>PROCEED TO ATELIER CHECKOUT</Text>
            <Feather name="arrow-right" size={16} color={colors.textInverse} />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>YOUR SHOPPING BAG IS EMPTY</Text>
          <Text style={styles.emptySubtitle}>
            Indulge in our bespoke collection of monochrome coats, silk gowns, and tailored pieces.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ShopTab')}
          >
            <Text style={styles.exploreBtnText}>EXPLORE THE COLLECTION</Text>
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
  scrollContent: {
    padding: 16,
  },
  headerNotice: {
    marginBottom: 14,
  },
  headerNoticeText: {
    ...typography.brandSubtitle,
    color: colors.gold,
  },
  itemsList: {
    gap: 14,
    marginBottom: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 12,
  },
  cardImg: {
    width: 90,
    height: 120,
    backgroundColor: colors.surfaceElevated,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    ...typography.brandSubtitle,
    color: colors.gold,
    fontSize: 9,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    fontSize: 13,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  specDivider: {
    color: colors.textMuted,
  },
  pricePerPiece: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  itemTotalPrice: {
    ...typography.price,
    color: colors.textPrimary,
    fontSize: 15,
  },
  shippingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderHighlight,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  shippingNoticeText: {
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  summaryHeading: {
    ...typography.brandSubtitle,
    color: colors.gold,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: {
    ...typography.brandSubtitle,
    color: colors.textPrimary,
    fontSize: 14,
  },
  totalValue: {
    ...typography.price,
    color: colors.goldBright,
    fontSize: 20,
  },
  checkoutBtn: {
    height: 50,
    backgroundColor: colors.goldBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    ...typography.buttonText,
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 12,
  },
  emptyContainer: {
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
  exploreBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  exploreBtnText: {
    ...typography.buttonText,
    color: colors.goldBright,
    fontSize: 11,
  },
});
