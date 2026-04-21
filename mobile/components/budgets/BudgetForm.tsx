import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Input, MonthSelector, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Category } from '@/lib/types';

export interface BudgetFormValues {
  name: string;
  categories: string[];
  amount: string;
  month: string;
}

interface BudgetFormProps {
  values: BudgetFormValues;
  categories: Category[];
  onChange: (next: BudgetFormValues) => void;
}

function getLocalizedName(category: Category, lang: string): string {
  const langKey = lang.split('-')[0];
  if (langKey === 'ar') return category.name_ar || category.name || category.name_fr;
  if (langKey === 'en') return category.name_en || category.name || category.name_fr;
  return category.name_fr || category.name;
}

export function BudgetForm({ values, categories, onChange }: BudgetFormProps) {
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
        label={t('budgets.fields.month')}
        value={values.month}
        onChange={(month) => onChange({ ...values, month })}
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
