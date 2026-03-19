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

interface SavedAddress {
  label: string;
  address: string;
}

interface AddressInputProps {
  saved?: SavedAddress[];
  onSubmit: (value: string) => void;
}

export function AddressInput({ saved = [], onSubmit }: AddressInputProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(saved.length === 0);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const selectSaved = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIdx(idx);
    setShowNew(false);
  };

  const handleSubmit = () => {
    if (showNew) {
      if (!newAddress.trim()) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSubmit(
        JSON.stringify({
          label: newLabel.trim() || 'New Address',
          address: newAddress.trim(),
        })
      );
    } else if (selectedIdx !== null && saved[selectedIdx]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSubmit(JSON.stringify(saved[selectedIdx]));
    }
  };

  const canSubmit = showNew ? newAddress.trim().length > 0 : selectedIdx !== null;

  return (
    <View style={styles.container}>
      {saved.map((addr, idx) => {
        const isActive = !showNew && selectedIdx === idx;
        return (
          <Pressable
            key={idx}
            style={[styles.addrCard, isActive && styles.addrCardActive]}
            onPress={() => selectSaved(idx)}
          >
            <View style={[styles.radio, isActive && styles.radioActive]}>
              {isActive && <View style={styles.radioDot} />}
            </View>
            <View style={styles.addrInfo}>
              <Text style={styles.addrLabel}>{addr.label}</Text>
              <Text style={styles.addrText} numberOfLines={2}>{addr.address}</Text>
            </View>
          </Pressable>
        );
      })}

      <Pressable
        style={[styles.addNewBtn, showNew && styles.addNewBtnActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowNew(true);
          setSelectedIdx(null);
        }}
      >
        <Text style={styles.addNewIcon}>+</Text>
        <Text style={[styles.addNewText, showNew && styles.addNewTextActive]}>
          Add new address
        </Text>
      </Pressable>

      {showNew && (
        <View style={styles.newForm}>
          <TextInput
            style={styles.input}
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Label (e.g. Home, Office)"
            placeholderTextColor={colors.tertiary}
          />
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={newAddress}
            onChangeText={setNewAddress}
            placeholder="Full address..."
            placeholderTextColor={colors.tertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      <Pressable
        style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitText}>Confirm Address</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    minHeight: 44,
  },
  addrCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addrInfo: {
    flex: 1,
  },
  addrLabel: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  addrText: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.sm,
    minHeight: 44,
  },
  addNewBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  addNewIcon: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  addNewText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  addNewTextActive: {
    color: colors.primary,
  },
  newForm: {
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputMulti: {
    minHeight: 80,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
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
