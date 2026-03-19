import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../lib/theme';
import { CardGridInput, type CardItem } from './inputs/CardGridInput';
import { CarouselInput } from './inputs/CarouselInput';
import { ChipBarInput } from './inputs/ChipBarInput';
import { AddressInput } from './inputs/AddressInput';
import { CalendarInput } from './inputs/CalendarInput';
import { StepperInput } from './inputs/StepperInput';
import { SliderInput } from './inputs/SliderInput';
import { RichTextInput } from './inputs/RichTextInput';
import { LayoutInput, type SectionConfig } from './inputs/LayoutInput';

interface InputPromptProps {
  question: string;
  inputType:
    | 'text'
    | 'otp'
    | 'confirmation'
    | 'choice'
    | 'freetext'
    | 'card_grid'
    | 'carousel'
    | 'chip_bar'
    | 'address'
    | 'calendar'
    | 'stepper'
    | 'slider'
    | 'rich_text'
    | 'layout';
  options?: string[];
  // Rich input props
  cards?: CardItem[];
  showQuantity?: boolean;
  allowCustom?: boolean;
  multiSelect?: boolean;
  savedAddresses?: Array<{ label: string; address: string }>;
  calendarMode?: 'single' | 'range';
  shortcuts?: string[];
  counters?: Array<{ label: string; min?: number; max?: number; default?: number }>;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  placeholder?: string;
  formatHint?: string;
  sections?: SectionConfig[];
  onSubmit: (value: string) => void;
}

export function InputPrompt({
  question,
  inputType,
  options,
  cards,
  showQuantity,
  allowCustom,
  multiSelect,
  savedAddresses,
  calendarMode,
  shortcuts,
  counters,
  min,
  max,
  step,
  presets,
  placeholder,
  formatHint,
  sections,
  onSubmit,
}: InputPromptProps) {
  const [value, setValue] = useState('');

  const submit = (val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(val);
  };

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Input needed</Text>
      </View>
      <Text style={styles.question}>{question}</Text>

      {inputType === 'confirmation' && (
        <View style={styles.confirmRow}>
          <TouchableOpacity
            style={styles.btnConfirm}
            onPress={() => submit('yes')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnConfirmText}>Yes, proceed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => submit('cancel')}
            activeOpacity={0.8}
          >
            <Text style={styles.btnCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {inputType === 'choice' && options && (
        <View style={styles.choiceList}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.choiceItem}
              onPress={() => submit(opt)}
              activeOpacity={0.7}
            >
              <View style={styles.choiceNum}>
                <Text style={styles.choiceNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.choiceText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {(inputType === 'text' || inputType === 'freetext') && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={setValue}
            placeholder="Type your answer..."
            placeholderTextColor={colors.tertiary}
            returnKeyType="send"
            onSubmitEditing={() => value.trim() && submit(value.trim())}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !value.trim() && { opacity: 0.3 }]}
            onPress={() => value.trim() && submit(value.trim())}
            disabled={!value.trim()}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      )}

      {inputType === 'otp' && (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, styles.otpInput]}
            value={value}
            onChangeText={(t) => setValue(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="• • • • • •"
            placeholderTextColor={colors.tertiary}
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="send"
            onSubmitEditing={() => value.length >= 4 && submit(value)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, styles.verifyBtn, value.length < 4 && { opacity: 0.3 }]}
            onPress={() => value.length >= 4 && submit(value)}
            disabled={value.length < 4}
          >
            <Text style={styles.sendBtnText}>Verify</Text>
          </TouchableOpacity>
        </View>
      )}

      {inputType === 'card_grid' && cards && (
        <CardGridInput
          cards={cards}
          showQuantity={showQuantity}
          allowCustom={allowCustom}
          multiSelect={multiSelect}
          onSubmit={submit}
        />
      )}

      {inputType === 'carousel' && cards && (
        <CarouselInput
          cards={cards}
          multiSelect={multiSelect}
          allowCustom={allowCustom}
          onSubmit={submit}
        />
      )}

      {inputType === 'chip_bar' && options && (
        <ChipBarInput
          options={options}
          multiSelect={multiSelect}
          onSubmit={submit}
        />
      )}

      {inputType === 'address' && (
        <AddressInput
          saved={savedAddresses}
          onSubmit={submit}
        />
      )}

      {inputType === 'calendar' && (
        <CalendarInput
          mode={calendarMode}
          shortcuts={shortcuts}
          onSubmit={submit}
        />
      )}

      {inputType === 'stepper' && counters && (
        <StepperInput
          counters={counters}
          onSubmit={submit}
        />
      )}

      {inputType === 'slider' && (
        <SliderInput
          min={min}
          max={max}
          step={step}
          presets={presets}
          onSubmit={submit}
        />
      )}

      {inputType === 'rich_text' && (
        <RichTextInput
          placeholder={placeholder}
          formatHint={formatHint}
          onSubmit={submit}
        />
      )}

      {inputType === 'layout' && sections && (
        <LayoutInput
          sections={sections}
          onSubmit={submit}
        />
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
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warningMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
  },
  badgeText: {
    color: colors.warning,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  question: {
    color: colors.foreground,
    fontSize: fontSize.base,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  // Confirmation
  confirmRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnConfirm: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  btnConfirmText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnCancelText: {
    color: colors.secondary,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  // Choice
  choiceList: {
    gap: spacing.sm,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  choiceNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceNumText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  choiceText: {
    color: colors.foreground,
    fontSize: fontSize.base,
    flex: 1,
  },
  // Text input
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: fontSize.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  otpInput: {
    letterSpacing: 6,
    fontSize: fontSize.xl,
    textAlign: 'center',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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
  verifyBtn: {
    width: 'auto' as unknown as number,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
