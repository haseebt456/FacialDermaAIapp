import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, spacing, shadows } from '../styles/theme';
import Icon from 'react-native-vector-icons/Ionicons';

interface BottomNavProps {
  navigationRef: any;
  userRole: string | null;
}

const NAV_HEIGHT = 80;

export const bottomNavHeight = NAV_HEIGHT;

export default function BottomNav({ navigationRef, userRole }: BottomNavProps) {
  const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

  const getActive = (key: string) => {
    if (!currentRouteName) return false;
    if (key === 'Home') return currentRouteName === 'Home' || currentRouteName === 'DermatologistHome';
    if (key === 'Analysis') return ['History', 'AnalysisDetail'].includes(currentRouteName);
    if (key === 'Scan') return currentRouteName === 'Prediction';
    if (key === 'Experts') return ['SelectDermatologist', 'MyReviewRequests', 'ReviewRequestDetail'].includes(currentRouteName);
    if (key === 'Profile') return ['Profile', 'EditProfile', 'ChangePassword'].includes(currentRouteName);
    return false;
  };

  const handlePress = (route: string) => {
    if (!navigationRef.current) return;
    navigationRef.current.navigate(route);
  };

  if (userRole === 'dermatologist') {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.bar}>
          <NavItem label="Home" iconName="home-outline" active={getActive('Home')} onPress={() => handlePress('DermatologistHome')} />
          <NavItem label="Reviews" iconName="document-text-outline" active={currentRouteName === 'DermatologistReviews'} onPress={() => handlePress('DermatologistReviews')} />
          <NavItem label="Notifications" iconName="notifications-outline" active={currentRouteName === 'Notifications'} onPress={() => handlePress('Notifications')} />
          <NavItem label="Profile" iconName="person-outline" active={getActive('Profile')} onPress={() => handlePress('Profile')} />
        </View>
      </View>
    );
  }

  // Patient navigation: Home, Analysis (History), [Camera], Experts, Profile
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Floating Camera Button */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => handlePress('Prediction')}
          activeOpacity={0.8}
        >
          <Icon name="camera-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.bar}>
        {/* Home */}
        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Home')} activeOpacity={0.7}>
          <Icon name="home-outline" size={24} color={getActive('Home') ? '#22B8DC' : '#6B7280'} />
          <Text style={[styles.navLabel, getActive('Home') && styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        {/* Analysis - goes to History */}
        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('History')} activeOpacity={0.7}>
          <Icon name="pulse-outline" size={24} color={getActive('Analysis') ? '#22B8DC' : '#6B7280'} />
          <Text style={[styles.navLabel, getActive('Analysis') && styles.navLabelActive]}>Analysis</Text>
        </TouchableOpacity>

        {/* Spacer for center button */}
        <View style={styles.centerSpacer} />

        {/* Experts */}
        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('SelectDermatologist')} activeOpacity={0.7}>
          <Icon name="people-outline" size={24} color={getActive('Experts') ? '#22B8DC' : '#6B7280'} />
          <Text style={[styles.navLabel, getActive('Experts') && styles.navLabelActive]}>Experts</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity style={styles.navItem} onPress={() => handlePress('Profile')} activeOpacity={0.7}>
          <Icon name="person-outline" size={24} color={getActive('Profile') ? '#22B8DC' : '#6B7280'} />
          <Text style={[styles.navLabel, getActive('Profile') && styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface NavItemProps {
  label: string;
  iconName: string;
  active: boolean;
  onPress: () => void;
}

function NavItem({ label, iconName, active, onPress }: NavItemProps) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <Icon name={iconName} size={24} color={active ? '#22B8DC' : '#6B7280'} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
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
    paddingHorizontal: spacing.sm,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#22B8DC',
  },
  centerSpacer: {
    width: 70,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22B8DC',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
    shadowColor: '#22B8DC',
    shadowOpacity: 0.3,
    elevation: 8,
    borderWidth: 4,
    borderColor: colors.white,
  },
});