// ZELORA Editorial Header Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useCart } from '../context/CartContext';

export const Header = ({
  title = 'ZELORA',
  showBack = false,
  onBack,
  navigation,
  showAI = true,
  showCart = true,
}) => {
  const insets = useSafeAreaInsets();
  const { totalCount } = useCart();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onBack || (() => navigation?.goBack())}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation?.navigate('ShopTab')}
          >
            <Feather name="search" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.titleWrap}
        onPress={() => navigation?.navigate('HomeTab')}
        activeOpacity={0.8}
      >
        <Text style={styles.brandTitle}>{title}</Text>
        <Text style={styles.brandSubtitle}>HAUTE HORLOGERIE & COUTURE</Text>
      </TouchableOpacity>

      <View style={styles.rightRow}>
        {showAI && (
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation?.navigate('AIChat')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={16} color={colors.goldBright} />
            <Text style={styles.aiBadgeText}>AI</Text>
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation?.navigate('CartTab')}
          >
            <Feather name="shopping-bag" size={20} color={colors.textPrimary} />
            {totalCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalCount > 99 ? '99+' : totalCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    ...typography.brandEmblem,
    color: colors.textPrimary,
  },
  brandSubtitle: {
    ...typography.brandSubtitle,
    color: colors.gold,
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 2,
  },
  rightRow: {
    width: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldDark,
    borderColor: colors.gold,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 3,
  },
  aiBadgeText: {
    color: colors.goldBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.gold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
  },
});
