import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Input, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { BillFrequency, Category } from '@/lib/types';

export interface BillFormValues {
  name: string;
  amount: string;
  category: string;
  frequency: BillFrequency;
  next_due_date: string;
}

interface BillFormProps {
  values: BillFormValues;
  categories: Category[];
  onChange: (next: BillFormValues) => void;
}

const FREQUENCIES: BillFrequency[] = ['weekly', 'monthly', 'yearly'];

function getLocalizedName(category: Category, lang: string): string {
  const langKey = lang.split('-')[0];
  if (langKey === 'ar') return category.name_ar || category.name || category.name_fr;
  if (langKey === 'en') return category.name_en || category.name || category.name_fr;
  return category.name_fr || category.name;
}

export function BillForm({ values, categories, onChange }: BillFormProps) {
  const { t, i18n } = useTranslation();
  const billCategories = categories.filter((category) => category.type === 'bill' || !category.type);

  return (
    <View style={styles.form}>
      <Input
        label={t('bills.fields.name')}
        value={values.name}
        onChangeText={(name) => onChange({ ...values, name })}
        placeholder={t('bills.placeholders.name')}
      />

      <Input
        label={t('bills.fields.amount')}
        value={values.amount}
        onChangeText={(amount) => onChange({ ...values, amount })}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <View style={styles.fieldGroup}>
        <Text variant="caption" style={styles.fieldLabel}>
          {t('bills.fields.category')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.pills}>
            {billCategories.map((category) => {
              const selected = values.category === category.id;
              return (
                <Pressable
                  key={category.id}
                  style={[styles.pill, selected && styles.pillActive]}
                  onPress={() => onChange({ ...values, category: category.id })}
                >
                  <Text style={selected ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}>
                    {category.icon} {getLocalizedName(category, i18n.language)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.fieldGroup}>
        <Text variant="caption" style={styles.fieldLabel}>
          {t('bills.fields.frequency')}
        </Text>
        <View style={styles.pills}>
          {FREQUENCIES.map((frequency) => {
            const selected = values.frequency === frequency;
            return (
              <Pressable
                key={frequency}
                style={[styles.pill, selected && styles.pillActive]}
                onPress={() => onChange({ ...values, frequency })}
              >
                <Text style={selected ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}>
                  {t(`bills.frequency.${frequency}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Input
        label={t('bills.fields.nextDueDate')}
        value={values.next_due_date}
        onChangeText={(nextDueDate) => onChange({ ...values, next_due_date: nextDueDate })}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.white,
  },
});
