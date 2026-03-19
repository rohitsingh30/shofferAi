import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';
import { CardGridInput, type CardItem } from './CardGridInput';
import { CarouselInput } from './CarouselInput';
import { ChipBarInput } from './ChipBarInput';
import { AddressInput } from './AddressInput';
import { CalendarInput } from './CalendarInput';
import { StepperInput } from './StepperInput';
import { SliderInput } from './SliderInput';
import { RichTextInput } from './RichTextInput';

export interface SectionConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  collapsed?: boolean;
  // Card grid / Carousel
  cards?: CardItem[];
  show_quantity?: boolean;
  allow_custom?: boolean;
  multi_select?: boolean;
  // Chip bar
  options?: string[];
  // Address
  saved?: Array<{ label: string; address: string }>;
  // Calendar
  mode?: 'single' | 'range';
  shortcuts?: string[];
  // Stepper
  counters?: Array<{ label: string; min?: number; max?: number; default?: number }>;
  // Slider
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  // Text
  placeholder?: string;
  format_hint?: string;
}

interface LayoutInputProps {
  sections: SectionConfig[];
  onSubmit: (value: string) => void;
}

export function LayoutInput({ sections, onSubmit }: LayoutInputProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    sections.forEach((s) => {
      if (s.collapsed) init[s.name] = true;
    });
    return init;
  });

  const setSectionValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCollapse = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = () => {
    // Check required sections
    const missing = sections
      .filter((s) => s.required && !values[s.name])
      .map((s) => s.label);

    if (missing.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Parse JSON values where possible
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(values)) {
      try {
        result[key] = JSON.parse(val);
      } catch {
        result[key] = val;
      }
    }
    onSubmit(JSON.stringify(result));
  };

  const renderSection = (section: SectionConfig) => {
    const isCollapsed = collapsed[section.name];
    const hasValue = !!values[section.name];

    return (
      <View key={section.name} style={styles.section}>
        <Pressable
          style={styles.sectionHeader}
          onPress={() => toggleCollapse(section.name)}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            {section.required && <Text style={styles.required}>*</Text>}
            {hasValue && <Text style={styles.checkIcon}>✓</Text>}
          </View>
          <Text style={styles.collapseIcon}>{isCollapsed ? '▸' : '▾'}</Text>
        </Pressable>

        {!isCollapsed && (
          <View style={styles.sectionBody}>
            {renderWidget(section)}
          </View>
        )}
      </View>
    );
  };

  const renderWidget = (section: SectionConfig) => {
    const onWidgetSubmit = (val: string) => setSectionValue(section.name, val);

    switch (section.type) {
      case 'card_grid':
        return (
          <CardGridInput
            cards={section.cards ?? []}
            showQuantity={section.show_quantity}
            allowCustom={section.allow_custom}
            multiSelect={section.multi_select}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'carousel':
        return (
          <CarouselInput
            cards={section.cards ?? []}
            multiSelect={section.multi_select}
            allowCustom={section.allow_custom}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'chip_bar':
        return (
          <ChipBarInput
            options={section.options ?? []}
            multiSelect={section.multi_select}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'address':
        return (
          <AddressInput
            saved={section.saved}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'calendar':
        return (
          <CalendarInput
            mode={section.mode}
            shortcuts={section.shortcuts}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'stepper':
        return (
          <StepperInput
            counters={section.counters ?? []}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'slider':
        return (
          <SliderInput
            min={section.min}
            max={section.max}
            step={section.step}
            presets={section.presets}
            onSubmit={onWidgetSubmit}
          />
        );

      case 'text':
      case 'freetext':
        return (
          <RichTextInput
            placeholder={section.placeholder}
            formatHint={section.format_hint}
            onSubmit={onWidgetSubmit}
          />
        );

      default:
        return (
          <Text style={styles.unknownText}>
            Unknown widget type: {section.type}
          </Text>
        );
    }
  };

  const requiredMissing = sections.some((s) => s.required && !values[s.name]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {sections.map(renderSection)}

      <Pressable
        style={[styles.submitBtn, requiredMissing && styles.submitWarn]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>
          {requiredMissing ? 'Complete required sections' : 'Submit All'}
        </Text>
      </Pressable>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    minHeight: 48,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  sectionLabel: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  required: {
    color: colors.destructive,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  checkIcon: {
    color: colors.success,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  collapseIcon: {
    color: colors.tertiary,
    fontSize: fontSize.base,
  },
  sectionBody: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  unknownText: {
    color: colors.tertiary,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.glow,
  },
  submitWarn: {
    backgroundColor: colors.primaryMuted,
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },
});
