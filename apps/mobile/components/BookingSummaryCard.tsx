import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

interface BookingSummaryCardProps {
  summary: string;
}

interface BookingDetails {
  name?: string;
  location?: string;
  dates?: string;
  roomType?: string;
  guests?: string | number;
  price?: string | number;
}

export function BookingSummaryCard({ summary }: BookingSummaryCardProps) {
  let details: BookingDetails | null = null;
  try {
    details = JSON.parse(summary);
  } catch {
    // Not JSON — render as plain text
  }

  if (!details) {
    return (
      <View style={styles.container}>
        <Text style={styles.plainText}>{summary}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {details.name && (
        <Text style={styles.hotelName}>{details.name}</Text>
      )}
      <View style={styles.details}>
        {details.location && (
          <DetailRow icon="📍" text={details.location} />
        )}
        {details.dates && (
          <DetailRow icon="📅" text={details.dates} />
        )}
        {details.roomType && (
          <DetailRow icon="🏨" text={details.roomType} />
        )}
        {details.guests && (
          <DetailRow icon="👥" text={String(details.guests)} />
        )}
        {details.price && (
          <DetailRow icon="💰" text={`₹${details.price}`} highlight />
        )}
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  text,
  highlight,
}: {
  icon: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, highlight && styles.highlight]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  plainText: {
    color: colors.foreground,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  hotelName: {
    color: colors.foreground,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  details: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  text: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    flex: 1,
  },
  highlight: {
    color: colors.success,
    fontWeight: '700',
    fontSize: fontSize.base,
  },
});
