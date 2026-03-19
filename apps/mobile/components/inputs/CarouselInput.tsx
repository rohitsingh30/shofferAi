import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface CarouselCard {
  id: string;
  label: string;
  emoji?: string;
  subtitle?: string;
  badge?: string;
}

interface CarouselInputProps {
  cards: CarouselCard[];
  multiSelect?: boolean;
  allowCustom?: boolean;
  onSubmit: (value: string) => void;
}

export function CarouselInput({
  cards,
  multiSelect = false,
  allowCustom = false,
  onSubmit,
}: CarouselInputProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customText, setCustomText] = useState('');

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiSelect) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const items = cards
      .filter((c) => selected.has(c.id))
      .map((c) => ({ id: c.id, label: c.label }));
    if (customText.trim()) {
      items.push({ id: 'custom', label: customText.trim() });
    }
    if (items.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(JSON.stringify(items));
  };

  const hasSelection = selected.size > 0 || customText.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        snapToInterval={88}
        decelerationRate="fast"
      >
        {cards.map((card) => {
          const isSelected = selected.has(card.id);
          return (
            <Pressable
              key={card.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggle(card.id)}
            >
              {card.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{card.badge}</Text>
                </View>
              )}
              {card.emoji && <Text style={styles.emoji}>{card.emoji}</Text>}
              <Text style={styles.label} numberOfLines={2}>{card.label}</Text>
              {card.subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>{card.subtitle}</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {allowCustom && (
        <TextInput
          style={styles.customInput}
          value={customText}
          onChangeText={setCustomText}
          placeholder="Or type custom..."
          placeholderTextColor={colors.tertiary}
        />
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
  scroll: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    width: 80,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
    ...shadows.glow,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    color: colors.foreground,
    fontSize: fontSize['2xs'],
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.secondary,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 1,
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
