import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function Card({ children, style, variant = 'elevated' }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  default: {
    backgroundColor: colors.white,
  },
  elevated: {
    backgroundColor: colors.white,
    ...shadows.medium,
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
