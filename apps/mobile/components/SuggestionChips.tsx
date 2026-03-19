import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

const suggestions = [
  {
    icon: 'bed-outline' as const,
    text: 'Book a hotel in Goa this weekend',
    color: '#3b82f6',
  },
  {
    icon: 'cart-outline' as const,
    text: 'Order groceries from Blinkit',
    color: '#22c55e',
  },
  {
    icon: 'restaurant-outline' as const,
    text: 'Order dinner from Zomato',
    color: '#f59e0b',
  },
  {
    icon: 'airplane-outline' as const,
    text: 'Book a flight to Delhi next Friday',
    color: '#06b6d4',
  },
];

export function SuggestionCards({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {suggestions.map((s, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(s.text);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name={s.icon} size={18} color={s.color} />
          <Text style={styles.cardText} numberOfLines={2}>
            {s.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    minHeight: 72,
  },
  cardText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
});
