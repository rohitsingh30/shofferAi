import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface SliderInputProps {
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  onSubmit: (value: string) => void;
}

export function SliderInput({
  min = 0,
  max = 100,
  step = 1,
  presets = [],
  onSubmit,
}: SliderInputProps) {
  const [value, setValue] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');

  const selectPreset = (preset: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue(preset);
    setCustomText(String(preset));
  };

  const handleCustomChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setCustomText(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      // Snap to step
      const snapped = Math.round(num / step) * step;
      const clamped = Math.min(max, Math.max(min, snapped));
      setValue(clamped);
    } else {
      setValue(null);
    }
  };

  const handleSubmit = () => {
    if (value === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(String(value));
  };

  return (
    <View style={styles.container}>
      {/* Range indicator */}
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>Min: {min}</Text>
        <Text style={styles.rangeText}>Max: {max}</Text>
      </View>

      {/* Presets */}
      {presets.length > 0 && (
        <View style={styles.presets}>
          {presets.map((p) => {
            const isActive = value === p;
            return (
              <Pressable
                key={p}
                style={[styles.preset, isActive && styles.presetActive]}
                onPress={() => selectPreset(p)}
              >
                <Text style={[styles.presetText, isActive && styles.presetTextActive]}>
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Custom value input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={customText}
          onChangeText={handleCustomChange}
          placeholder={`Enter value (${min}–${max})`}
          placeholderTextColor={colors.tertiary}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        {value !== null && (
          <View style={styles.valueBadge}>
            <Text style={styles.valueBadgeText}>{value}</Text>
          </View>
        )}
      </View>

      {step !== 1 && (
        <Text style={styles.stepHint}>Step: {step}</Text>
      )}

      <Pressable
        style={[styles.submitBtn, value === null && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={value === null}
      >
        <Text style={styles.submitText}>Confirm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  preset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  presetText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  presetTextActive: {
    color: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: colors.border,
    fontVariant: ['tabular-nums'],
  },
  valueBadge: {
    backgroundColor: colors.primaryGlow,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  valueBadgeText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stepHint: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
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
