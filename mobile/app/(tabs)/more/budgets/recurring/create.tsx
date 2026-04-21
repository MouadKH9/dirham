import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RecurringBudgetForm, type RecurringBudgetFormValues } from '@/components/budgets/RecurringBudgetForm';
import { Button, Text } from '@/components/ui';
import { useBudgetsStore } from '@/lib/stores/budgets';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

function getCurrentMonthStart(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}-01`;
}

export default function CreateRecurringBudgetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const createRecurringBudget = useBudgetsStore((s) => s.createRecurringBudget);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<RecurringBudgetFormValues>({
    name: '',
    categories: [],
    amount: '',
    start_month: getCurrentMonthStart(),
    is_active: true,
  });

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense' || category.type === 'bill' || !category.type),
    [categories],
  );

  useFocusEffect(
    React.useCallback(() => {
      void fetchCategories();
    }, [fetchCategories]),
  );

  React.useEffect(() => {
    if (values.categories.length > 0 || availableCategories.length === 0) return;
    setValues((current) => ({ ...current, categories: [availableCategories[0].id] }));
  }, [availableCategories, values.categories.length]);

  const isValid = values.categories.length > 0
    && parseFloat(values.amount) > 0
    && values.start_month.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createRecurringBudget({
        name: values.name.trim(),
        categories: values.categories,
        amount: values.amount,
        start_month: values.start_month.trim(),
        is_active: values.is_active,
      });
      router.back();
    } catch {
      setError(t('budgets.recurring.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onPress={() => { void handleCreate(); }}
            disabled={!isValid}
            loading={isSubmitting}
            style={styles.submitButton}
          >
            {t('budgets.recurring.add')}
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
