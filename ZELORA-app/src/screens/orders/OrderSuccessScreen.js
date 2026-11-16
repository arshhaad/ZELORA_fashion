// ZELORA Mobile Order Confirmation Screen
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';

export const OrderSuccessScreen = ({ route, navigation }) => {
  const { order, items = [], total = 0, paymentMethod = 'COD', isDirectBuy = false } =
    route.params || {};

  const orderId = order?.order_id || order?.id || 'ZLR-893021';

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="CONFIRMATION" showBack={false} showCart={false} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Emblem */}
        <View style={styles.emblemWrap}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Feather name="check" size={32} color={colors.goldBright} />
            </View>
          </View>
        </View>

        <Text style={styles.subtitle}>GRACIAS FOR YOUR ACQUISITION</Text>
        <Text style={styles.title}>ORDER CONFIRMED</Text>
        <Text style={styles.description}>
          Your order has been registered in the ZELORA Atelier ledger. Our white-glove logistics team
          is preparing your bespoke package.
        </Text>

        {/* Order Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptHeading}>ATELIER RECEIPT</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>CONFIRMED</Text>
            </View>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Order Reference</Text>
            <Text style={styles.receiptValue}>{orderId}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Purchase Mode</Text>
            <Text style={styles.receiptValue}>
              {isDirectBuy ? 'Direct Acquisition' : 'Atelier Bag Checkout'}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Payment Method</Text>
            <Text style={styles.receiptValue}>{paymentMethod}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Estimated Delivery</Text>
            <Text style={styles.receiptValue}>2 - 4 Business Days</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT PAID / DUE</Text>
            <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>VIEW MY ORDERS & TRACKING</Text>
            <Feather name="arrow-right" size={16} color={colors.textInverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('HomeTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>CONTINUE EXPLORING ATELIER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  emblemWrap: {
    marginTop: 20,
    marginBottom: 20,
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  subtitle: {
    ...typography.brandSubtitle,
    color: colors.gold,
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    ...typography.heroTitle,
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 28,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptHeading: {
    ...typography.brandSubtitle,
    color: colors.gold,
  },
  statusPill: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  receiptValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
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
    fontSize: 11,
  },
  totalValue: {
    ...typography.price,
    color: colors.goldBright,
    fontSize: 18,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    backgroundColor: colors.goldBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    ...typography.buttonText,
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 11,
  },
  secondaryBtn: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    ...typography.buttonText,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
