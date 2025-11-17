import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../styles/theme';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message, fullScreen = false }: LoadingProps) {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inline: {
    paddingVertical: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
