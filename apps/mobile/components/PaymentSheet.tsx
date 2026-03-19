import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { BookingSummaryCard } from './BookingSummaryCard';
import { createPaymentOrder } from '../lib/api';
import { colors, spacing, fontSize, borderRadius, shadows } from '../lib/theme';

const TIP_OPTIONS = [0, 100, 200, 500];

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://shofferai-27188185100.asia-south1.run.app';

interface PaymentSheetProps {
  taskId: string;
  bookingSummary: string;
  amountCents: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentSheet({
  taskId,
  bookingSummary,
  amountCents,
  onClose,
  onSuccess,
}: PaymentSheetProps) {
  const [tipCents, setTipCents] = useState(10000); // Rs 100 default
  const [customTip, setCustomTip] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = amountCents + tipCents;

  const handleTipSelect = (cents: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTipCents(cents);
    setShowCustom(false);
  };

  const handleCustomTip = (text: string) => {
    setCustomTip(text);
    const val = parseInt(text, 10);
    if (!isNaN(val) && val >= 0) {
      setTipCents(val * 100);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await createPaymentOrder(
        taskId,
        amountCents,
        tipCents,
        bookingSummary
      );

      // Open Razorpay checkout in browser
      const checkoutUrl = `${API_BASE}/checkout?orderId=${order.orderId}&key=${order.key}&amount=${order.amount}&currency=${order.currency}&taskId=${taskId}`;
      await WebBrowser.openBrowserAsync(checkoutUrl);

      // After browser closes, assume success (verification happens on redirect)
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Complete Payment</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Booking summary */}
      <BookingSummaryCard summary={bookingSummary} />

      {/* Cost breakdown */}
      <View style={styles.costs}>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Booking cost</Text>
          <Text style={styles.costValue}>₹{(amountCents / 100).toLocaleString()}</Text>
        </View>

        {/* Tip selection */}
        <Text style={styles.tipLabel}>Add a tip</Text>
        <View style={styles.tipRow}>
          {TIP_OPTIONS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.tipBtn,
                tipCents === val * 100 && !showCustom && styles.tipBtnActive,
              ]}
              onPress={() => handleTipSelect(val * 100)}
            >
              <Text
                style={[
                  styles.tipBtnText,
                  tipCents === val * 100 && !showCustom && styles.tipBtnTextActive,
                ]}
              >
                {val === 0 ? 'None' : `₹${val}`}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.tipBtn, showCustom && styles.tipBtnActive]}
            onPress={() => setShowCustom(true)}
          >
            <Text style={[styles.tipBtnText, showCustom && styles.tipBtnTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {showCustom && (
          <View style={styles.customTipRow}>
            <Text style={styles.rupeePrefix}>₹</Text>
            <TextInput
              style={styles.customTipInput}
              value={customTip}
              onChangeText={handleCustomTip}
              placeholder="0"
              placeholderTextColor={colors.tertiary}
              keyboardType="number-pad"
              autoFocus
            />
          </View>
        )}

        {/* Total */}
        <View style={[styles.costRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{(totalCents / 100).toLocaleString()}</Text>
        </View>
      </View>

      {/* Error */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Pay button */}
      <TouchableOpacity
        style={[styles.payBtn, loading && { opacity: 0.6 }]}
        onPress={handlePay}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>
            Pay ₹{(totalCents / 100).toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Trust badge */}
      <Text style={styles.trust}>🔒 Secured by Razorpay</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.xl,
    gap: spacing.lg,
    borderTopWidth: 0.5,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.foreground,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  closeBtn: {
    color: colors.tertiary,
    fontSize: fontSize.xl,
    padding: spacing.sm,
  },
  costs: {
    gap: spacing.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    color: colors.secondary,
    fontSize: fontSize.base,
  },
  costValue: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  tipLabel: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  tipBtnText: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tipBtnTextActive: {
    color: colors.primary,
  },
  customTipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing.md,
  },
  rupeePrefix: {
    color: colors.secondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  customTipInput: {
    flex: 1,
    color: colors.foreground,
    fontSize: fontSize.lg,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  totalRow: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  totalLabel: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  error: {
    color: colors.destructive,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.glow,
  },
  payBtnText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  trust: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
