import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { reviewService, ReviewRequest } from '../../services/reviewService';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { colors, spacing, typography, shadows } from '../../styles/theme';

export default function ReviewRequestDetailScreen({ route, navigation }: any) {
  const { id } = route.params || {};
  const [item, setItem] = useState<ReviewRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await reviewService.getReviewRequest(id);
    setLoading(false);
    if (res.success) {
      setItem(res.data || null);
    } else {
      Alert.alert('Error', res.error);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loading fullScreen message="Loading review request..." />;
  if (!item) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review Request</Text>
        <View style={styles.spacer} />
      </View>

      <Card style={{ margin: spacing.lg }}>
        <Text style={styles.label}>Status</Text>
        <Text style={[styles.value, { color: item.status === 'pending' ? colors.warning : colors.success }]}>
          {item.status}
        </Text>

        {item.comment ? (
          <>
            <Text style={styles.label}>Dermatologist Comment</Text>
            <Text style={styles.value}>{item.comment}</Text>
          </>
        ) : (
          <Text style={styles.pendingNote}>Awaiting dermatologist review...</Text>
        )}
      </Card>
    </ScrollView>
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
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
  value: { ...typography.body, color: colors.text, marginTop: spacing.xs },
  pendingNote: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.lg },
});
