import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface CounterConfig {
  label: string;
  min?: number;
  max?: number;
  default?: number;
}

interface StepperInputProps {
  counters: CounterConfig[];
  onSubmit: (value: string) => void;
}

export function StepperInput({ counters, onSubmit }: StepperInputProps) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    counters.forEach((c) => {
      init[c.label] = c.default ?? c.min ?? 0;
    });
    return init;
  });

  const adjust = (label: string, delta: number, min?: number, max?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValues((prev) => {
      const cur = prev[label] ?? 0;
      let next = cur + delta;
      if (min !== undefined && next < min) next = min;
      if (max !== undefined && next > max) next = max;
      return { ...prev, [label]: next };
    });
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(JSON.stringify(values));
  };

  return (
    <View style={styles.container}>
      {counters.map((c) => {
        const val = values[c.label] ?? 0;
        const atMin = c.min !== undefined && val <= c.min;
        const atMax = c.max !== undefined && val >= c.max;

        return (
          <View key={c.label} style={styles.row}>
            <Text style={styles.label}>{c.label}</Text>
            <View style={styles.stepper}>
              <Pressable
                style={[styles.stepBtn, atMin && styles.stepBtnDisabled]}
                onPress={() => adjust(c.label, -1, c.min, c.max)}
                disabled={atMin}
                hitSlop={4}
              >
                <Text style={[styles.stepBtnText, atMin && styles.stepBtnTextDisabled]}>−</Text>
              </Pressable>
              <Text style={styles.value}>{val}</Text>
              <Pressable
                style={[styles.stepBtn, atMax && styles.stepBtnDisabled]}
                onPress={() => adjust(c.label, 1, c.min, c.max)}
                disabled={atMax}
                hitSlop={4}
              >
                <Text style={[styles.stepBtnText, atMax && styles.stepBtnTextDisabled]}>+</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Confirm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
  },
  label: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '500',
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  stepBtnTextDisabled: {
    color: colors.tertiary,
  },
  value: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadows.glow,
  },
  submitText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
