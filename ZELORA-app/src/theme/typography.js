// ZELORA Luxury Editorial Typography
import { Platform } from 'react-native';

const fontFamilySerif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

const fontFamilySans = Platform.select({
  ios: 'Helvetica Neue',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const typography = {
  fontSerif: fontFamilySerif,
  fontSans: fontFamilySans,

  // Editorial Display Headers
  brandEmblem: {
    fontFamily: fontFamilySerif,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: fontFamilySerif,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 2,
    lineHeight: 36,
  },
  sectionTitle: {
    fontFamily: fontFamilySerif,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  price: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  buttonText: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};
