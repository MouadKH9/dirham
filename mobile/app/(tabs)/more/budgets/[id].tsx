import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, LoadingState, Text } from '@/components/ui';
import { BudgetForm, type BudgetFormValues } from '@/components/budgets/BudgetForm';
import { budgetsApi } from '@/lib/api/budgets';
import { useBudgetsStore } from '@/lib/stores/budgets';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Budget } from '@/lib/types';

export default function EditBudgetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const budgetId = typeof params.id === 'string' ? params.id : '';

  const updateBudget = useBudgetsStore((s) => s.updateBudget);
  const createRecurringBudget = useBudgetsStore((s) => s.createRecurringBudget);
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [initialBudget, setInitialBudget] = useState<Budget | null>(null);
  const [values, setValues] = useState<BudgetFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense' || category.type === 'bill' || !category.type),
    [categories],
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!budgetId) return;

      const load = async () => {
        await fetchCategories();
        const budget = await budgetsApi.get(budgetId);
        setInitialBudget(budget);
        setValues({
          name: budget.name || '',
          categories: budget.categories,
          amount: budget.amount,
          month: budget.month,
        });
      };

      void load();
    }, [budgetId, fetchCategories]),
  );

  React.useEffect(() => {
    if (!values || values.categories.length > 0 || availableCategories.length === 0) return;
    setValues({ ...values, categories: [availableCategories[0].id] });
  }, [availableCategories, values]);

  const isValid = values
    ? values.categories.length > 0 && parseFloat(values.amount) > 0 && values.month.trim().length > 0
    : false;

  const handleSave = async () => {
    if (!budgetId || !values || !isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateBudget(budgetId, {
        name: values.name.trim(),
        categories: values.categories,
        amount: values.amount,
        month: values.month.trim(),
      });
      setInitialBudget(updated);
      router.back();
    } catch {
      setError(t('budgets.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRecurringFromBudget = async () => {
    if (!values || !isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const recurring = await createRecurringBudget({
        name: values.name.trim(),
        categories: values.categories,
        amount: values.amount,
        start_month: values.month.trim(),
        is_active: true,
      });
      router.push(`/(tabs)/more/budgets/recurring/${recurring.id}`);
    } catch {
      setError(t('budgets.recurring.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!values || !initialBudget) {
    return <LoadingState />;
  }

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
          <BudgetForm values={values} categories={categories} onChange={setValues} />

          {error ? (
            <Text variant="caption" color={colors.error}>
              {error}
            </Text>
          ) : null}

          <Button
            onPress={() => { void handleSave(); }}
            disabled={!isValid}
            loading={isSubmitting}
            style={styles.submitButton}
          >
            {t('common.save')}
          </Button>

          {initialBudget.source_recurring_budget ? (
            <Button
              variant="secondary"
              onPress={() => router.push(`/(tabs)/more/budgets/recurring/${initialBudget.source_recurring_budget}`)}
            >
              {t('budgets.recurring.manageTemplate')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onPress={() => { void handleCreateRecurringFromBudget(); }}
              disabled={!isValid}
            >
              {t('budgets.recurring.createFromBudget')}
            </Button>
          )}
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
  submitButton: {
    marginTop: spacing.sm,
  },
});
