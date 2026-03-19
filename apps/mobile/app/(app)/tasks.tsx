import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTasks } from '../../lib/api';
import { colors, spacing, fontSize, borderRadius } from '../../lib/theme';

interface Task {
  id: string;
  description: string;
  status: string;
  workflowType: string;
  createdAt: string;
  completedAt?: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: colors.success, label: 'Done' },
  running: { color: colors.primary, label: 'Running' },
  failed: { color: colors.destructive, label: 'Failed' },
  pending: { color: colors.tertiary, label: 'Queued' },
  paused_for_input: { color: colors.warning, label: 'Waiting' },
};

const typeConfig: Record<string, { icon: string; label: string }> = {
  hotel_booking: { icon: '🏨', label: 'Hotel' },
  grocery_order: { icon: '🛒', label: 'Grocery' },
  food_delivery: { icon: '🍔', label: 'Food' },
  bill_payment: { icon: '💳', label: 'Payment' },
  generic: { icon: '✨', label: 'Task' },
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const type = typeConfig[item.workflowType] || typeConfig.generic;
          const status = statusConfig[item.status] || statusConfig.pending;
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{type.icon}</Text>
                </View>
              </View>
              <View style={styles.cardCenter}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardType}>{type.label}</Text>
                  <Text style={styles.cardDot}>·</Text>
                  <Text style={styles.cardDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: status.color + '18' },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: status.color }]}
                />
                <Text style={[styles.statusLabel, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptySubtext}>
              Your completed tasks will appear here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.foreground,
    fontSize: fontSize['3xl'],
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  cardLeft: {},
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconText: {
    fontSize: 18,
  },
  cardCenter: {
    flex: 1,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 3,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardType: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  cardDot: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
  },
  cardDate: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusLabel: {
    fontSize: fontSize['2xs'],
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.border,
    marginLeft: 58,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.lg,
    opacity: 0.4,
  },
  emptyTitle: {
    color: colors.secondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.tertiary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
