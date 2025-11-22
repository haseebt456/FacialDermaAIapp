import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { colors } from '../styles/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  withKeyboardAvoid?: boolean;
  backgroundColor?: string;
}

export default function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  withKeyboardAvoid = true,
  backgroundColor = colors.backgroundGray,
}: ScreenContainerProps) {
  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? {
        contentContainerStyle: [styles.scrollContent, contentContainerStyle],
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled' as const,
      }
    : {};

  const content = (
    <Container
      style={[styles.container, { backgroundColor }, style]}
      {...containerProps}
    >
      {children}
    </Container>
  );

  if (withKeyboardAvoid) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          {content}
        </KeyboardAvoidingView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {content}
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
