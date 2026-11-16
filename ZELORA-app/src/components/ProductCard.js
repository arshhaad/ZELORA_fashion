// ZELORA Luxury Product Card
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80&sat=-100';

export const ProductCard = ({ product, onPress }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imageError, setImageError] = useState(false);

  const price = parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.original_price) || 0;
  const hasDiscount = originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const imageUrl =
    !imageError && product.image
      ? (product.image.startsWith('http') ? product.image : `http://10.10.20.101:8000${product.image}`)
      : FALLBACK_IMAGE;

  const isFavorite = isInWishlist(product.id);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress && onPress(product)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        {/* Top Badges */}
        <View style={styles.badgeRow}>
          {hasDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.goldBright : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {!product.in_stock && product.in_stock !== undefined && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>UNAVAILABLE</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand_name || product.brand || 'ZELORA ATELIER'}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {product.name || product.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>
          {hasDiscount && (
            <Text style={styles.origPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.35,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newBadgeText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  wishlistBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  content: {
    padding: 10,
  },
  brand: {
    ...typography.brandSubtitle,
    color: colors.gold,
    marginBottom: 3,
  },
  title: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    ...typography.price,
    color: colors.textPrimary,
  },
  origPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
