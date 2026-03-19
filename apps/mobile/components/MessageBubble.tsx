import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../lib/theme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <LinearGradient
          colors={['#7c5cfc', '#a78bfa']}
          style={styles.avatar}
        >
          <Ionicons name="flash" size={13} color="#fff" />
        </LinearGradient>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>
          {message.content}
          {message.streaming && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.xs,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.xs,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  text: {
    color: colors.foreground,
    fontSize: fontSize.base,
    lineHeight: 22,
  },
  userText: { color: '#fff' },
  cursor: { color: colors.accent, fontWeight: '300' },
});
