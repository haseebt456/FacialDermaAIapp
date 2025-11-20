import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { reviewService, Dermatologist } from '../../services/reviewService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, typography, shadows, borderRadius } from '../../styles/theme';

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
      // Backend may return array directly or in a wrapper
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
      Alert.alert('Request Sent Successfully', `Dr. ${derm.username} will review your case soon. You can track the status in "My Review Requests".`, [
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

  const renderItem = ({ item }: { item: Dermatologist }) => (
    <Card style={styles.item}>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.name}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <Button title="Request Review" onPress={() => requestReview(item)} size="small" />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Dermatologist</Text>
        <View style={styles.spacer} />
      </View>

      <Card style={styles.searchCard}>
        <TextInput
          placeholder="Search by name or email"
          placeholderTextColor={colors.textLight}
          style={styles.input}
          value={q}
          onChangeText={setQ}
        />
        <Button title={loading ? 'Searching...' : 'Search'} onPress={search} />
      </Card>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👨‍⚕️</Text>
            <Text style={styles.emptyText}>
              {loading ? 'Loading dermatologists...' : 'No dermatologists found'}
            </Text>
            {!loading && q && (
              <Text style={styles.emptyHint}>Try searching with a different name or email</Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  backButton: { padding: spacing.sm },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  title: { ...typography.h2, color: colors.text },
  spacer: { width: 60 },
  searchCard: { margin: spacing.lg, padding: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
  },
  item: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex1: { flex: 1 },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  email: { ...typography.caption, color: colors.textSecondary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xs },
  emptyHint: { ...typography.bodySmall, color: colors.textLight, textAlign: 'center' },
});
