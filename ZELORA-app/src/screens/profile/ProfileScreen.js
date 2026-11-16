// ZELORA Mobile Customer Profile & Atelier Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { DEV_LAN_IP, API_ROOT } from '../../config';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [customIp, setCustomIp] = useState(DEV_LAN_IP);
  const [showConfig, setShowConfig] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you wish to exit your ZELORA session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const name = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Guest Client';
  const email = user?.email || 'Sign in to access your atelier profile';

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="CLIENT ATELIER" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {isAuthenticated ? 'VERIFIED VALUED CLIENT' : 'GUEST EXPLORER'}
              </Text>
            </View>
          </View>
        </View>

        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.authCta}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.authCtaText}>SIGN IN / CREATE ACCOUNT</Text>
            <Feather name="arrow-right" size={16} color={colors.textInverse} />
          </TouchableOpacity>
        )}

        {/* Atelier Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeading}>CLIENT SERVICES</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="package" size={18} color={colors.gold} />
              <Text style={styles.menuItemText}>My Orders & White-Glove Tracking</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('WishlistTab')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={18} color={colors.gold} />
              <Text style={styles.menuItemText}>Saved Pieces & Private Wishlist</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AIChat')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="sparkles" size={18} color={colors.goldBright} />
              <Text style={styles.menuItemText}>Consult ZELORA Luxury AI Assistant</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Developer Network Configuration */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeading}>DEVELOPMENT & BACKEND SERVER</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowConfig(!showConfig)}
          >
            <View style={styles.menuItemLeft}>
              <Feather name="server" size={18} color={colors.textSecondary} />
              <Text style={styles.menuItemText}>Active Host: {API_ROOT}</Text>
            </View>
            <Feather name={showConfig ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {showConfig && (
            <View style={styles.configBox}>
              <Text style={styles.configHint}>
                If testing via Expo Go on physical device, verify your phone is on the same WiFi as
                the computer. Current host is {DEV_LAN_IP}:8000.
              </Text>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={16} color={colors.error} />
            <Text style={styles.logoutBtnText}>SIGN OUT OF ZELORA</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerBrand}>Z E L O R A</Text>
          <Text style={styles.footerSub}>HAUTE HORLOGERIE & MONOCHROME COUTURE</Text>
          <Text style={styles.footerVer}>Mobile Edition v1.0.0 • Expo SDK 58</Text>
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
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.goldDark,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.goldBright,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: typography.fontSerif,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    color: colors.goldBright,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  authCta: {
    height: 48,
    backgroundColor: colors.goldBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  authCtaText: {
    ...typography.buttonText,
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 11,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    marginBottom: 16,
  },
  menuHeading: {
    ...typography.brandSubtitle,
    color: colors.gold,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  configBox: {
    padding: 16,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  configHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  logoutBtn: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoutBtnText: {
    ...typography.buttonText,
    color: colors.error,
    fontSize: 11,
    fontWeight: '800',
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerBrand: {
    ...typography.brandEmblem,
    color: colors.textMuted,
    fontSize: 16,
    letterSpacing: 6,
  },
  footerSub: {
    ...typography.brandSubtitle,
    color: colors.goldMuted,
    fontSize: 8,
    marginTop: 4,
  },
  footerVer: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 6,
  },
});
