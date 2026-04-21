import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AmountText, Card, Text } from '@/components/ui';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { BudgetProgress } from '@/lib/types';

interface BudgetProgressSectionProps {
  budgets: BudgetProgress[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function BudgetProgressSection({ budgets }: BudgetProgressSectionProps) {
  const { t, i18n } = useTranslation('dashboard');
  const categories = useCategoriesStore((s) => s.categories);
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const localizedCategoryNames = useMemo(() => {
    const lang = i18n.language.split('-')[0];
    return new Map(
      categories.map((category) => {
        const localized = lang === 'ar'
          ? category.name_ar
          : lang === 'en'
            ? category.name_en
            : category.name_fr;
        return [category.id, localized || category.name || category.name_fr];
      }),
    );
  }, [categories, i18n.language]);

  if (!budgets.length) {
    return (
      <Card style={styles.card}>
        <Text variant="h3">{t('budgetProgress.title')}</Text>
        <Text variant="caption" color={colors.textSecondary} style={styles.emptyText}>
          {t('budgetProgress.empty')}
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text variant="h3">{t('budgetProgress.title')}</Text>

      <View style={styles.list}>
        {budgets.map((budget) => {
          const limit = parseFloat(budget.limit || '0');
          const spent = parseFloat(budget.spent || '0');
          const remaining = parseFloat(budget.remaining || '0');
          const rawProgress = limit > 0 ? spent / limit : 0;
          const progress = clamp(rawProgress, 0, 1);
          const isOverBudget = remaining < 0;

          return (
            <View key={budget.category_id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text variant="body" style={styles.categoryName}>
                  {budget.category_ids && budget.category_ids.length > 0
                    ? budget.category_ids.map((id) => localizedCategoryNames.get(id) || '').filter(Boolean).join(', ')
                    : localizedCategoryNames.get(budget.category_id) || budget.category_name}
                </Text>
                <Text variant="caption" color={isOverBudget ? colors.error : colors.textSecondary}>
                  {isOverBudget ? t('budgetProgress.overBudget') : t('budgetProgress.remaining')}
                </Text>
              </View>

              <View style={styles.amountsRow}>
                <AmountText amount={budget.spent} type="expense" currencyDisplay={currencyDisplay} variant="small" />
                <Text variant="caption" color={colors.textSecondary}>/</Text>
                <AmountText amount={budget.limit} currencyDisplay={currencyDisplay} variant="small" />
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={{
                    ...styles.progressFill,
                    width: `${progress * 100}%`,
                    backgroundColor: isOverBudget ? colors.error : colors.terracotta,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  list: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  item: {
    gap: spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontWeight: '600',
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
