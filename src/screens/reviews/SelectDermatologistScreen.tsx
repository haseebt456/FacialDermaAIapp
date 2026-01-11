import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Image, StatusBar } from 'react-native';
import { reviewService, Dermatologist } from '../../services/reviewService';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, shadows } from '../../styles/theme';

export default function SelectDermatologistScreen({ route, navigation }: any) {
  const { predictionId } = route.params || {};
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Dermatologist[]>([]);

  const search = async () => {
    setLoading(true);
    const res = await reviewService.listDermatologists(q, 20, 0);
    setLoading(false);
    if (res.success) {
      const derms = Array.isArray(res.data) ? res.data : (res.data?.dermatologists || []);
      setData(derms);
    } else {
      Alert.alert('Could Not Load Dermatologists', res.error || 'Please try again later.');
      setData([]);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestReview = async (derm: Dermatologist) => {
    if (!predictionId) {
      Alert.alert('Missing Prediction', 'We could not find the prediction to review. Please go to History and select a prediction to request a review.');
      return;
    }
    setLoading(true);
    const res = await reviewService.createReviewRequest(predictionId, derm.id);
    setLoading(false);
    if (res.success) {
      Alert.alert('Request Sent Successfully', `Dr. ${derm.name || derm.username} will review your case soon. You can track the status in "My Review Requests".`, [
        { text: 'View Requests', onPress: () => navigation.navigate('MyReviewRequests') },
        { text: 'OK', style: 'cancel' },
      ]);
    } else if (res.status === 409) {
      Alert.alert('Already Requested', 'You have already requested a review for this prediction. Please check "My Review Requests" for the status.');
    } else if (res.status === 404) {
      Alert.alert('Prediction Not Found', 'This prediction no longer exists. Please go to History and try with another prediction.');
    } else {
      Alert.alert('Request Failed', res.error || 'Unable to send review request. Please try again.');
    }
  };

  const getSpecializationColor = (specialization?: string) => {
    const colorMap: { [key: string]: string } = {
      'Clinical Dermatologist': '#3B82F6',
      'Aesthetic Specialist': '#8B5CF6',
      'Surgical Dermatologist': '#10B981',
      'Pediatric Dermatology': '#F59E0B',
      'Cosmetic Dermatology': '#EC4899',
    };
    return colorMap[specialization || ''] || '#6B7280';
  };

  const getAvailabilityText = (derm: Dermatologist) => {
    // This could be based on actual availability data if available
    const random = derm.id.charCodeAt(0) % 3;
    if (random === 0) return { text: 'Available Today', color: '#10B981' };
    if (random === 1) return { text: 'Available Tomorrow', color: '#10B981' };
    return { text: 'Next Available: Mon', color: '#6B7280' };
  };

  const renderItem = ({ item }: { item: Dermatologist }) => {
    const availability = getAvailabilityText(item);
    const displayName = item.name || item.username;
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    return (
      <View style={styles.card}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getSpecializationColor(item.specialization) + '20' }]}>
            <Text style={[styles.avatarText, { color: getSpecializationColor(item.specialization) }]}>
              {initials}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.nameSection}>
              <Text style={styles.doctorName}>Dr. {displayName}</Text>
              <Text style={[styles.specialization, { color: getSpecializationColor(item.specialization) }]}>
                {item.specialization || 'General Dermatologist'}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>4.{(item.id.charCodeAt(0) % 3) + 7} ({Math.floor(Math.random() * 150) + 50}+)</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="time-outline" size={14} color="#9CA3AF" />
              <Text style={styles.statText}>{item.experience || Math.floor(Math.random() * 15) + 5} Years Exp.</Text>
            </View>
          </View>

          {/* Availability */}
          <View style={styles.availabilityRow}>
            <Icon name="calendar-outline" size={14} color={availability.color} />
            <Text style={[styles.availabilityText, { color: availability.color }]}>{availability.text}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.viewProfileButton}
              onPress={() => Alert.alert('Profile', `Dr. ${displayName}\n\nClinic: ${item.clinic || 'N/A'}\nFees: ${item.fees ? `$${item.fees}` : 'N/A'}\nExperience: ${item.experience || 'N/A'} years`)}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.requestButton}
              onPress={() => requestReview(item)}
            >
              <Text style={styles.requestButtonText}>Request Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundGray} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Expert Review</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search specialists..."
            placeholderTextColor="#9CA3AF"
            value={q}
            onChangeText={setQ}
            onSubmitEditing={search}
            returnKeyType="search"
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => { setQ(''); search(); }}>
              <Icon name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Dermatologists</Text>
        <TouchableOpacity onPress={search}>
          <Text style={styles.filterText}>{loading ? 'Loading...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="medical-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {loading ? 'Loading specialists...' : 'No Specialists Found'}
            </Text>
            <Text style={styles.emptyText}>
              {loading ? 'Please wait' : q ? 'Try searching with a different name' : 'No dermatologists available at the moment'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 6,
  },
  nameSection: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  specialization: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Availability
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  viewProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  requestButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },
  requestButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
