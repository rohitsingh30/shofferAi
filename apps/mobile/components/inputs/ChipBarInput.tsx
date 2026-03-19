import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface ChipBarInputProps {
  options: string[];
  multiSelect?: boolean;
  onSubmit: (value: string) => void;
}

export function ChipBarInput({
  options,
  multiSelect = false,
  onSubmit,
}: ChipBarInputProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (opt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) {
        next.delete(opt);
      } else {
        if (!multiSelect) next.clear();
        next.add(opt);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(JSON.stringify(Array.from(selected)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.chipWrap}>
        {options.map((opt) => {
          const isActive = selected.has(opt);
          return (
            <Pressable
              key={opt}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => toggle(opt)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.submitBtn, selected.size === 0 && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={selected.size === 0}
      >
        <Text style={styles.submitText}>
          Confirm{selected.size > 0 ? ` (${selected.size})` : ''}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.glow,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
