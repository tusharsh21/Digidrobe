import { TextStyle } from 'react-native';

export const Colors = {
  primary: '#000000', // Black for buttons and FAB
  secondary: '#EBE6FF', // Lavender for chips
  accent: '#6200EE', // Pure purple for text on chips
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  muted: '#666666',
  error: '#FF3B30',
  border: '#E0E0E0',
  onPrimary: '#FFFFFF',
  onSecondary: '#6200EE',
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  header: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subheader: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.muted,
  },
  chip: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
};
