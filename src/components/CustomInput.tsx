import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../styles/theme';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export default function CustomInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...props
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, colors.primary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
          error && styles.inputError,
          isFocused && styles.inputFocused,
        ]}
      >
        {leftIcon && (
          <Text style={styles.iconLeft}>{leftIcon}</Text>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconRight}
          >
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  labelError: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    ...shadows.small,
  },
  inputFocused: {
    ...shadows.medium,
    shadowColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  iconLeft: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  iconText: {
    fontSize: 20,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
