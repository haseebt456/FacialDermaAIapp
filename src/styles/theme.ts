export const colors = {
  primary: '#2A6EF1',
  primaryDark: '#1E56C4',
  primaryLight: '#E8F1FF',
  
  secondary: '#6C63FF',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  background: '#FFFFFF',
  backgroundGray: '#F5F7FA',
  
  text: '#1A1A1A',
  textSecondary: '#757575',
  textLight: '#9E9E9E',
  
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  white: '#FFFFFF',
  black: '#000000',
  
  // Skin condition colors
  acne: '#FF6B6B',
  melanoma: '#4ECDC4',
  normal: '#95E1D3',
  perioral: '#FFD93D',
  rosacea: '#FCB6D0',
  warts: '#C7B8EA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
