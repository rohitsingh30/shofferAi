import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

export interface CardItem {
  id: string;
  label: string;
  emoji?: string;
  image?: string;
  subtitle?: string;
  badge?: string;
}

interface CardGridInputProps {
  cards: CardItem[];
  showQuantity?: boolean;
  allowCustom?: boolean;
  multiSelect?: boolean;
  onSubmit: (value: string) => void;
}

export function CardGridInput({
  cards,
  showQuantity = false,
  allowCustom = false,
  multiSelect = true,
  onSubmit,
}: CardGridInputProps) {
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [customText, setCustomText] = useState('');

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiSelect) next.clear();
        next.set(id, 1);
      }
      return next;
    });
  };

  const adjustQty = (id: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Map(prev);
      const cur = next.get(id) ?? 0;
      const val = cur + delta;
      if (val <= 0) {
        next.delete(id);
      } else {
        next.set(id, val);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const items: { id: string; label: string; qty: number }[] = [];
    selected.forEach((qty, id) => {
      const card = cards.find((c) => c.id === id);
      if (card) items.push({ id, label: card.label, qty });
    });
    if (customText.trim()) {
      items.push({ id: 'custom', label: customText.trim(), qty: 1 });
    }
    if (items.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(JSON.stringify(items));
  };

  const hasSelection = selected.size > 0 || customText.trim().length > 0;

  const renderCard = ({ item }: { item: CardItem }) => {
    const isSelected = selected.has(item.id);
    const qty = selected.get(item.id) ?? 0;

    return (
      <Pressable
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggle(item.id)}
      >
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.emoji && <Text style={styles.emoji}>{item.emoji}</Text>}
        <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
        {item.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
        )}
        {showQuantity && isSelected && (
          <View style={styles.qtyRow}>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => adjustQty(item.id, -1)}
              hitSlop={8}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </Pressable>
            <Text style={styles.qtyVal}>{qty}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => adjustQty(item.id, 1)}
              hitSlop={8}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        )}
        {isSelected && !showQuantity && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />

      {allowCustom && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Add custom item..."
            placeholderTextColor={colors.tertiary}
          />
        </View>
      )}

      <Pressable
        style={[styles.submitBtn, !hasSelection && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!hasSelection}
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
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: fontSize['2xs'],
    fontWeight: '700',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.secondary,
    fontSize: fontSize['2xs'],
    textAlign: 'center',
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  qtyVal: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  customRow: {
    marginTop: spacing.xs,
  },
  customInput: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: colors.border,
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
