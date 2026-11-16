// ZELORA Mobile Runtime Configuration
import { Platform } from 'react-native';

/**
 * Configure your development backend host:
 * - If running on Android Emulator: use '10.0.2.2'
 * - If running on iOS Simulator: use 'localhost'
 * - If running on Physical Phone via Expo Go: use your computer's LAN IP (e.g. '10.10.20.101')
 */
export const DEV_LAN_IP = '10.10.20.101'; // Machine's current LAN IP

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Fallback to LAN IP so it works seamlessly on both physical devices and emulators
    return `http://${DEV_LAN_IP}:8000`;
  }
  if (Platform.OS === 'ios') {
    return `http://${DEV_LAN_IP}:8000`;
  }
  return 'http://localhost:8000';
};

export const API_ROOT = getBaseUrl();
export const API_BASE = `${API_ROOT}/api`;

export const APP_CONFIG = {
  appName: 'ZELORA Haute Horlogerie & Couture',
  currencySymbol: '₹',
  defaultPageSize: 20,
};
