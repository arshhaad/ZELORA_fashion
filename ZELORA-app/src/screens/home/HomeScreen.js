// ZELORA Mobile Home Editorial Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { productsApi } from '../../api/productsApi';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80';

const CATEGORIES = [
  { id: 'all', label: 'All Pieces' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'dresses', label: 'Dresses & Gowns' },
  { id: 'tops', label: 'Tops & Shirts' },
  { id: 'trousers', label: 'Tailored Trousers' },
  { id: 'knitwear', label: 'Knitwear' },
  { id: 'accessories', label: 'Accessories' },
];

export const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getProducts({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        ordering: '-created_at',
      });
      const list = res.results || res.data || (Array.isArray(res) ? res : []);
      setProducts(list.slice(0, 8));
    } catch (err) {
      console.warn('Failed to fetch home products:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeaturedProducts();
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        {/* Editorial Hero Banner */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: HERO_IMAGE }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSubtitle}>MONOCHROME EDITORIAL 2026</Text>
            <Text style={styles.heroTitle}>HAUTE HORLOGERIE & COUTURE</Text>
            <TouchableOpacity
              style={styles.heroCta}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ShopTab')}
            >
              <Text style={styles.heroCtaText}>DISCOVER THE COLLECTION</Text>
              <Feather name="arrow-right" size={14} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Pills Strip */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* AI Concierge Teaser Card */}
        <TouchableOpacity
          style={styles.aiBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AIChat')}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiIconBubble}>
              <Ionicons name="sparkles" size={18} color={colors.goldBright} />
            </View>
            <View>
              <Text style={styles.aiBannerTitle}>ZELORA Luxury AI Assistant</Text>
              <Text style={styles.aiBannerSubtitle}>Personal styling, sizing & order status concierge</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={colors.gold} />
        </TouchableOpacity>

        {/* New Arrivals Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionSubtitle}>CURATED ATELIER</Text>
            <Text style={styles.sectionTitle}>NEW ARRIVALS</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={colors.gold} />
          </View>
        ) : products.length > 0 ? (
          <View style={styles.grid}>
            {products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onPress={(prod) => navigation.navigate('ProductDetail', { product: prod })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No garments found in this category.</Text>
          </View>
        )}

        <View style={styles.editorialQuote}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>
            Elegance is not about standing out, but about being remembered.
          </Text>
          <Text style={styles.quoteAuthor}>— ZELORA NOIR EDITIONS</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroSubtitle: {
    ...typography.brandSubtitle,
    color: colors.gold,
    marginBottom: 6,
  },
  heroTitle: {
    ...typography.heroTitle,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  heroCtaText: {
    ...typography.buttonText,
    color: colors.textInverse,
    fontSize: 11,
  },
  categoriesSection: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryPillActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldDark,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.goldBright,
    fontWeight: '700',
  },
  aiBanner: {
    margin: 16,
    padding: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  aiBannerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 16,
  },
  sectionSubtitle: {
    ...typography.brandSubtitle,
    color: colors.gold,
    marginBottom: 2,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  viewAllText: {
    ...typography.buttonText,
    fontSize: 11,
    color: colors.gold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyWrap: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  editorialQuote: {
    margin: 20,
    padding: 24,
    backgroundColor: colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  quoteMark: {
    color: colors.gold,
    fontSize: 28,
    lineHeight: 28,
    fontFamily: typography.fontSerif,
  },
  quoteText: {
    fontFamily: typography.fontSerif,
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  quoteAuthor: {
    ...typography.brandSubtitle,
    color: colors.goldMuted,
    fontSize: 9,
  },
});
