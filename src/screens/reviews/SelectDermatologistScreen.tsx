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
      setData(res.data);
    } else {
      Alert.alert('Error', res.error);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestReview = async (derm: Dermatologist) => {
    if (!predictionId) {
      Alert.alert('Missing Prediction', 'Could not determine prediction to review. Please use History to request a review.');
      return;
    }
    setLoading(true);
    const res = await reviewService.createReviewRequest(predictionId, derm.id);
    setLoading(false);
    if (res.success) {
      Alert.alert('Request Sent', 'Your review request has been sent to the selected dermatologist.', [
        { text: 'OK', onPress: () => navigation.navigate('MyReviewRequests') },
      ]);
    } else if (res.status === 409) {
      Alert.alert('Already Requested', 'A review has already been requested for this prediction.');
    } else if (res.status === 404) {
      Alert.alert('Not Found', 'Prediction not found. Please try again from History.');
    } else {
      Alert.alert('Error', res.error || 'Failed to create review request');
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
});
