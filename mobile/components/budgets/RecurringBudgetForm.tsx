import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Input, MonthSelector, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Category } from '@/lib/types';

export interface RecurringBudgetFormValues {
  name: string;
  categories: string[];
  amount: string;
  start_month: string;
  is_active: boolean;
}

interface RecurringBudgetFormProps {
  values: RecurringBudgetFormValues;
  categories: Category[];
  onChange: (next: RecurringBudgetFormValues) => void;
}

function getLocalizedName(category: Category, lang: string): string {
  const langKey = lang.split('-')[0];
  if (langKey === 'ar') return category.name_ar || category.name || category.name_fr;
  if (langKey === 'en') return category.name_en || category.name || category.name_fr;
  return category.name_fr || category.name;
}

export function RecurringBudgetForm({ values, categories, onChange }: RecurringBudgetFormProps) {
  const { t, i18n } = useTranslation();
  const expenseCategories = categories.filter((category) => category.type === 'expense' || category.type === 'bill' || !category.type);

  return (
    <View style={styles.form}>
      <Input
        label={t('budgets.fields.name')}
        value={values.name}
        onChangeText={(name) => onChange({ ...values, name })}
        placeholder={t('budgets.placeholders.name')}
      />

      <View style={styles.fieldGroup}>
        <Text variant="caption" style={styles.fieldLabel}>
          {t('budgets.fields.category')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.pills}>
            {expenseCategories.map((category) => {
              const selected = values.categories.includes(category.id);
              return (
                <Pressable
                  key={category.id}
                  style={[styles.pill, selected && styles.pillActive]}
                  onPress={() => {
                    const nextCategories = selected
                      ? values.categories.filter((id) => id !== category.id)
                      : [...values.categories, category.id];
                    onChange({ ...values, categories: nextCategories });
                  }}
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

      <Input
        label={t('budgets.fields.amount')}
        value={values.amount}
        onChangeText={(amount) => onChange({ ...values, amount })}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <MonthSelector
        label={t('budgets.fields.startMonth')}
        value={values.start_month}
        onChange={(start_month) => onChange({ ...values, start_month })}
      />

      <Pressable
        style={styles.toggleRow}
        onPress={() => onChange({ ...values, is_active: !values.is_active })}
      >
        <Text variant="body">{t('budgets.recurring.active')}</Text>
        <View style={[styles.togglePill, values.is_active ? styles.togglePillActive : undefined]}>
          <Text style={values.is_active ? styles.toggleLabelActive : styles.toggleLabel}>
            {values.is_active ? t('budgets.recurring.statusActive') : t('budgets.recurring.statusInactive')}
          </Text>
        </View>
      </Pressable>
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  togglePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  togglePillActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  toggleLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
