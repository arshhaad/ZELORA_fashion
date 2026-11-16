// ZELORA Luxury Product Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80&sat=-100';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const imageHeight = isTablet ? 520 : Math.min(width * 1.3, 500);

  const { addToCart, setDirectBuyItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState('M');
  const [addedToast, setAddedToast] = useState(false);
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

  const handleAddToCart = () => {
    addToCart(product, 1, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  /**
   * DIRECT BUY NOW (Request #4):
   * Purchases this single piece directly without adding it to the persistent cart.
   */
  const handleBuyNow = () => {
    setDirectBuyItem({
      product,
      size: selectedSize,
      quantity: 1,
      price,
    });
    navigation.navigate('Checkout', { isDirectBuy: true });
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} showBack title="ATELIER PIECE" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Full Editorial Garment Image */}
        <View style={[styles.imageContainer, { width: '100%', height: imageHeight }]}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />

          <TouchableOpacity
            style={styles.wishlistFloatingBtn}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.goldBright : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Product Details Header */}
        <View style={styles.infoSection}>
          <View style={styles.metaRow}>
            <Text style={styles.brand}>{product.brand_name || product.brand || 'ZELORA ATELIER'}</Text>
            {hasDiscount && (
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>SAVE {discountPercent}%</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{product.name || product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>
            {hasDiscount && (
              <Text style={styles.origPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
            )}
            <Text style={styles.taxNote}>Inclusive of all luxury taxes</Text>
          </View>
        </View>

        {/* Size Selector */}
        <View style={styles.sectionDivider} />
        <View style={styles.sizeSection}>
          <View style={styles.sizeHeader}>
            <Text style={styles.sizeLabel}>SELECT ATELIER SIZE</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AIChat')}>
              <Text style={styles.sizeGuideLink}>Ask AI Sizing</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sizesRow}>
            {SIZES.map((size) => {
              const active = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeBox, active && styles.sizeBoxActive]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[styles.sizeText, active && styles.sizeTextActive]}>{size}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Garment Details & Editorial Description */}
        <View style={styles.sectionDivider} />
        <View style={styles.detailsSection}>
          <Text style={styles.detailsHeading}>ATELIER COMPOSITION</Text>
          <Text style={styles.description}>
            {product.description ||
              'Exquisitely tailored according to ZELORA monochrome standards. Crafted with premium bespoke textile architecture, precise drape, and timeless elegance.'}
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Feather name="check" size={14} color={colors.gold} />
              <Text style={styles.featureText}>100% Certified Authentic Couture</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="truck" size={14} color={colors.gold} />
              <Text style={styles.featureText}>Complimentary Express White-Glove Delivery</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="refresh-cw" size={14} color={colors.gold} />
              <Text style={styles.featureText}>7-Day Bespoke Exchange & Return Guarantee</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Added Toast Notification */}
      {addedToast && (
        <View style={styles.toastWrap}>
          <Feather name="check-circle" size={16} color={colors.goldBright} />
          <Text style={styles.toastText}>Added to your ZELORA Shopping Bag</Text>
        </View>
      )}

      {/* Dual Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.cartButton}
          activeOpacity={0.85}
          onPress={handleAddToCart}
        >
          <Feather name="shopping-bag" size={16} color={colors.textPrimary} />
          <Text style={styles.cartButtonText}>ADD TO BAG</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowButton}
          activeOpacity={0.85}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowButtonText}>BUY NOW</Text>
          <Feather name="arrow-right" size={16} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistFloatingBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoSection: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brand: {
    ...typography.brandSubtitle,
    color: colors.gold,
  },
  discountPill: {
    backgroundColor: colors.goldDark,
    borderColor: colors.gold,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discountPillText: {
    color: colors.goldBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.heroTitle,
    fontSize: 22,
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    ...typography.price,
    fontSize: 22,
    color: colors.textPrimary,
  },
  origPrice: {
    fontSize: 16,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  taxNote: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 6,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  sizeSection: {
    padding: 20,
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeLabel: {
    ...typography.brandSubtitle,
    color: colors.textSecondary,
  },
  sizeGuideLink: {
    color: colors.gold,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  sizesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeBox: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBoxActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldDark,
  },
  sizeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sizeTextActive: {
    color: colors.goldBright,
    fontWeight: '800',
  },
  detailsSection: {
    padding: 20,
  },
  detailsHeading: {
    ...typography.brandSubtitle,
    color: colors.gold,
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: colors.textPrimary,
    fontSize: 12,
  },
  toastWrap: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.gold,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
  },
  toastText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  cartButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    backgroundColor: colors.surfaceElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cartButtonText: {
    ...typography.buttonText,
    color: colors.textPrimary,
    fontSize: 11,
  },
  buyNowButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.goldBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyNowButtonText: {
    ...typography.buttonText,
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
  },
});
