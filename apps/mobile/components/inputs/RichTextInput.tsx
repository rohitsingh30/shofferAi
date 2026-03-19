import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface RichTextInputProps {
  placeholder?: string;
  formatHint?: string;
  onSubmit: (value: string) => void;
}

export function RichTextInput({
  placeholder = 'Type your answer...',
  formatHint,
  onSubmit,
}: RichTextInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus after mount
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (!value.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(value.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={colors.tertiary}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          multiline
          blurOnSubmit
        />
        <Pressable
          style={[styles.sendBtn, !value.trim() && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={!value.trim()}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </Pressable>
      </View>
      {formatHint && (
        <Text style={styles.hint}>{formatHint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
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
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  sendBtnDisabled: {
    opacity: 0.3,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  hint: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    paddingHorizontal: spacing.xs,
  },
});
