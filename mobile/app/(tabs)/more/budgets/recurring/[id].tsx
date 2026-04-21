import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RecurringBudgetForm, type RecurringBudgetFormValues } from '@/components/budgets/RecurringBudgetForm';
import { Button, LoadingState, Text } from '@/components/ui';
import { budgetsApi } from '@/lib/api/budgets';
import { useBudgetsStore } from '@/lib/stores/budgets';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { RecurringBudget } from '@/lib/types';

export default function EditRecurringBudgetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const recurringId = typeof params.id === 'string' ? params.id : '';

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const updateRecurringBudget = useBudgetsStore((s) => s.updateRecurringBudget);

  const [initialRecurring, setInitialRecurring] = useState<RecurringBudget | null>(null);
  const [values, setValues] = useState<RecurringBudgetFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense' || category.type === 'bill' || !category.type),
    [categories],
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!recurringId) return;

      const load = async () => {
        await fetchCategories();
        const recurring = await budgetsApi.getRecurring(recurringId);
        setInitialRecurring(recurring);
        setValues({
          name: recurring.name || '',
          categories: recurring.categories,
          amount: recurring.amount,
          start_month: recurring.start_month,
          is_active: recurring.is_active,
        });
      };

      void load();
    }, [fetchCategories, recurringId]),
  );

  React.useEffect(() => {
    if (!values || values.categories.length > 0 || availableCategories.length === 0) return;
    setValues({ ...values, categories: [availableCategories[0].id] });
  }, [availableCategories, values]);

  const isValid = values
    ? values.categories.length > 0 && parseFloat(values.amount) > 0 && values.start_month.trim().length > 0
    : false;

  const handleSave = async () => {
    if (!recurringId || !values || !isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await updateRecurringBudget(recurringId, {
        name: values.name.trim(),
        categories: values.categories,
        amount: values.amount,
        start_month: values.start_month.trim(),
        is_active: values.is_active,
      });
      setInitialRecurring(updated);
      router.back();
    } catch {
      setError(t('budgets.recurring.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!values || !initialRecurring) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <RecurringBudgetForm values={values} categories={categories} onChange={setValues} />

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
