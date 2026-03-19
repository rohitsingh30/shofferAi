import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

interface CartItem {
  name: string;
  quantity: number;
  price?: number;
}

interface CartSummaryProps {
  store: string;
  items: CartItem[];
  total?: number;
}

export function CartSummary({ store, items, total }: CartSummaryProps) {
  const [expanded, setExpanded] = useState(true);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.storeIcon}>🛒</Text>
          <Text style={styles.storeName}>{store} Cart</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{items.length}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.itemList}>
          {items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.price != null && (
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              )}
            </View>
          ))}
          {total != null && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>₹{total}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  storeIcon: {
    fontSize: 16,
  },
  storeName: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: colors.success,
    fontSize: fontSize['2xs'],
    fontWeight: '700',
  },
  chevron: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
  },
  itemList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemQty: {
    color: colors.tertiary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    width: 28,
  },
  itemName: {
    flex: 1,
    color: colors.foreground,
    fontSize: fontSize.sm,
  },
  itemPrice: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  totalPrice: {
    color: colors.success,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
