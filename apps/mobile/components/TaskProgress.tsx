import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

export interface StepInfo {
  id: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused_for_input';
}

export function TaskProgress({ steps }: { steps: StepInfo[] }) {
  if (steps.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pulse} />
        <Text style={styles.headerText}>Working on it</Text>
      </View>
      {steps.map((step, i) => (
        <View key={step.id} style={styles.stepRow}>
          <View style={styles.timeline}>
            <StatusIcon status={step.status} />
            {i < steps.length - 1 && <View style={styles.line} />}
          </View>
          <Text
            style={[
              styles.stepText,
              step.status === 'completed' && styles.stepTextDone,
              step.status === 'failed' && styles.stepTextFailed,
            ]}
            numberOfLines={2}
          >
            {step.action}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StatusIcon({ status }: { status: StepInfo['status'] }) {
  switch (status) {
    case 'running':
      return (
        <View style={styles.iconWrap}>
          <ActivityIndicator size={14} color={colors.primary} />
        </View>
      );
    case 'completed':
      return (
        <View style={[styles.dot, { backgroundColor: colors.success }]}>
          <Text style={styles.dotIcon}>✓</Text>
        </View>
      );
    case 'failed':
      return (
        <View style={[styles.dot, { backgroundColor: colors.destructive }]}>
          <Text style={styles.dotIcon}>✕</Text>
        </View>
      );
    case 'paused_for_input':
      return (
        <View style={[styles.dot, { backgroundColor: colors.warning }]} />
      );
    default:
      return (
        <View style={[styles.dot, { backgroundColor: colors.border }]} />
      );
  }
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  pulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  headerText: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 32,
  },
  timeline: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.sm,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 3,
  },
  iconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotIcon: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: colors.foreground,
    fontSize: fontSize.sm,
    lineHeight: 18,
    paddingTop: 1,
  },
  stepTextDone: {
    color: colors.secondary,
  },
  stepTextFailed: {
    color: colors.destructive,
  },
});
