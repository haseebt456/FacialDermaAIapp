import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { colors, spacing, typography, shadows } from '../styles/theme';

interface BottomNavProps {
  navigationRef: any;
}

const NAV_HEIGHT = 72;

export const bottomNavHeight = NAV_HEIGHT;

export default function BottomNav({ navigationRef }: BottomNavProps) {
  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

  const getActive = (key: string) => {
    if (!currentRouteName) return false;
    if (key === 'Home') return ['Home', 'History'].includes(currentRouteName);
    if (key === 'Prediction') return ['Prediction', 'AnalysisDetail'].includes(currentRouteName);
    if (key === 'Reviews') return ['MyReviewRequests', 'ReviewRequestDetail', 'SelectDermatologist'].includes(currentRouteName);
    if (key === 'Profile') return ['Profile'].includes(currentRouteName);
    return false;
  };

  const handlePress = (route: string) => {
    if (!navigationRef.current) return;
    navigationRef.current.navigate(route);
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <NavItem
          label="Home"
          icon="🏠"
          active={getActive('Home')}
          onPress={() => handlePress('Home')}
        />
        <NavItem
          label="Analyze"
          icon="🔬"
          active={getActive('Prediction')}
          onPress={() => handlePress('Prediction')}
        />
        <NavItem
          label="Reviews"
          icon="📝"
          active={getActive('Reviews')}
          onPress={() => handlePress('MyReviewRequests')}
        />
        <NavItem
          label="Profile"
          icon="👤"
          active={getActive('Profile')}
          onPress={() => handlePress('Profile')}
        />
      </View>
    </View>
  );
}

interface NavItemProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

function NavItem({ label, icon, active, onPress }: NavItemProps) {
  const animValue = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: active ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [active, animValue]);

  const scale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const backgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.backgroundGray, colors.primaryLight],
  });

  const borderWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.iconCircle,
          {
            backgroundColor,
            borderWidth,
            borderColor: colors.primary,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          active && styles.labelActive,
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.small,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary,
  },
});
