import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Input, MonthSelector, Text } from '@/components/ui';
import { useBudgetsStore } from '@/lib/stores/budgets';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Category } from '@/lib/types';

function getCurrentMonthStart(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}-01`;
}

export default function CreateBudgetScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const createBudget = useBudgetsStore((s) => s.createBudget);
  const createRecurringBudget = useBudgetsStore((s) => s.createRecurringBudget);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saveAsRecurring, setSaveAsRecurring] = useState(false);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense' || category.type === 'bill' || !category.type),
    [categories],
  );

  const [values, setValues] = useState({
    name: '',
    categories: [] as string[],
    amount: '',
    month: getCurrentMonthStart(),
  });

  useFocusEffect(
    React.useCallback(() => {
      void fetchCategories();
    }, [fetchCategories]),
  );

  React.useEffect(() => {
    if (values.categories.length === 0 && availableCategories.length > 0) {
      setValues((current) => ({ ...current, categories: [availableCategories[0].id] }));
    }
  }, [availableCategories, values.categories.length]);

  const isValid = values.categories.length > 0
    && parseFloat(values.amount) > 0
    && values.month.trim().length > 0;

  const canProceed = step === 1
    ? values.month.trim().length > 0
    : step === 2
      ? values.categories.length > 0
      : parseFloat(values.amount) > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createBudget({
        name: values.name.trim(),
        categories: values.categories,
        amount: values.amount,
        month: values.month.trim(),
      });
      if (saveAsRecurring) {
        await createRecurringBudget({
          name: values.name.trim(),
          categories: values.categories,
          amount: values.amount,
          start_month: values.month.trim(),
          is_active: true,
        });
      }
      router.back();
    } catch {
      setError(t('budgets.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocalizedName = (category: Category): string => {
    const lang = i18n.language.split('-')[0];
    if (lang === 'ar') return category.name_ar || category.name || category.name_fr;
    if (lang === 'en') return category.name_en || category.name || category.name_fr;
    return category.name_fr || category.name;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepHeader}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('budgets.stepLabel', { current: step, total: 3 })}
            </Text>
            <View style={styles.stepDots}>
              {[1, 2, 3].map((value) => (
                <View
                  key={value}
                  style={[
                    styles.stepDot,
                    step >= value ? styles.stepDotActive : undefined,
                  ]}
                />
              ))}
            </View>
          </View>

          {step === 1 ? (
            <View style={styles.stepBlock}>
              <Text variant="h3">{t('budgets.steps.month')}</Text>
              <Input
                label={t('budgets.fields.name')}
                value={values.name}
                onChangeText={(name) => setValues({ ...values, name })}
                placeholder={t('budgets.placeholders.name')}
              />
              <MonthSelector
                label={t('budgets.fields.month')}
                value={values.month}
                onChange={(month) => setValues({ ...values, month })}
              />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.stepBlock}>
              <Text variant="h3">{t('budgets.steps.categories')}</Text>
              <View style={styles.pills}>
                {availableCategories.map((category) => {
                  const selected = values.categories.includes(category.id);
                  return (
                    <Pressable
                      key={category.id}
                      style={[styles.pill, selected && styles.pillActive]}
                      onPress={() => {
                        const nextCategories = selected
                          ? values.categories.filter((id) => id !== category.id)
                          : [...values.categories, category.id];
                        setValues({ ...values, categories: nextCategories });
                      }}
                    >
                      <Text style={selected ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}>
                        {category.icon} {getLocalizedName(category)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.stepBlock}>
              <Text variant="h3">{t('budgets.steps.amountReview')}</Text>
              <Input
                label={t('budgets.fields.amount')}
                value={values.amount}
                onChangeText={(amount) => setValues({ ...values, amount })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              <Text variant="caption" color={colors.textSecondary}>
                {t('budgets.reviewSummary', {
                  amount: values.amount || '0',
                  count: values.categories.length,
                })}
              </Text>
              {values.name.trim().length > 0 ? (
                <Text variant="caption" color={colors.textSecondary}>
                  {values.name.trim()}
                </Text>
              ) : null}
              <Pressable style={styles.recurringToggle} onPress={() => setSaveAsRecurring((current) => !current)}>
                <Text variant="body">{t('budgets.recurring.createFromBudget')}</Text>
                <View style={[styles.recurringPill, saveAsRecurring ? styles.recurringPillActive : undefined]}>
                  <Text style={saveAsRecurring ? styles.recurringPillLabelActive : styles.recurringPillLabel}>
                    {saveAsRecurring ? t('budgets.recurring.statusActive') : t('budgets.recurring.statusInactive')}
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : null}

          {error ? (
            <Text variant="caption" color={colors.error}>
              {error}
            </Text>
          ) : null}

          <View style={styles.actionsRow}>
            {step > 1 ? (
              <Pressable style={styles.backButton} onPress={() => setStep((value) => (value - 1) as 1 | 2 | 3)}>
                <Text>{t('common.back')}</Text>
              </Pressable>
            ) : <View />}
            {step < 3 ? (
              <Button
                onPress={() => setStep((value) => (value + 1) as 1 | 2 | 3)}
                disabled={!canProceed}
                style={styles.submitButton}
              >
                {t('common.confirm')}
              </Button>
            ) : (
              <Button
                onPress={() => { void handleCreate(); }}
                disabled={!isValid}
                loading={isSubmitting}
                style={styles.submitButton}
              >
                {t('budgets.add')}
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepHeader: {
    gap: spacing.xs,
  },
  stepDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepDot: {
    width: 22,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.terracotta,
  },
  stepBlock: {
    gap: spacing.sm,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  submitButton: {
    flex: 1,
  },
  recurringToggle: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recurringPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  recurringPillActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  recurringPillLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  recurringPillLabelActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
