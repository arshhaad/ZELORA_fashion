// ZELORA Mobile Wishlist Screen
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { useWishlist } from '../../context/WishlistContext';

export const WishlistScreen = ({ navigation }) => {
  const { wishlistItems, count } = useWishlist();

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="SAVED PIECES" />

      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerNotice}>
              <Text style={styles.headerNoticeText}>
                {count} {count === 1 ? 'PIECE' : 'PIECES'} IN YOUR PRIVATE WARDROBE ATELIER
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={(prod) => navigation.navigate('ProductDetail', { product: prod })}
            />
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>YOUR WISHLIST IS EMPTY</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite couture dresses, tailored overcoats, and luxury items by tapping the
            heart icon on any piece.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('ShopTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreBtnText}>EXPLORE ATELIER COLLECTION</Text>
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
  listContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  headerNotice: {
    marginBottom: 14,
  },
  headerNoticeText: {
    ...typography.brandSubtitle,
    color: colors.gold,
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
