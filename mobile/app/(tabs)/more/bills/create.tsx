import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Text } from '@/components/ui';
import { BillForm, type BillFormValues } from '@/components/bills/BillForm';
import { useBillsStore } from '@/lib/stores/bills';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreateBillScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const createBill = useBillsStore((s) => s.createBill);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const billCategories = useMemo(
    () => categories.filter((category) => category.type === 'bill' || !category.type),
    [categories],
  );

  const [values, setValues] = useState<BillFormValues>({
    name: '',
    amount: '',
    category: '',
    frequency: 'monthly',
    next_due_date: getTodayString(),
  });

  useFocusEffect(
    React.useCallback(() => {
      void fetchCategories();
    }, [fetchCategories]),
  );

  React.useEffect(() => {
    if (!values.category && billCategories.length > 0) {
      setValues((current) => ({ ...current, category: billCategories[0].id }));
    }
  }, [billCategories, values.category]);

  const isValid = values.name.trim().length > 0
    && !!values.category
    && parseFloat(values.amount) > 0
    && values.next_due_date.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createBill({
        name: values.name.trim(),
        amount: values.amount,
        category: values.category,
        frequency: values.frequency,
        next_due_date: values.next_due_date.trim(),
      });
      router.back();
    } catch {
      setError(t('bills.createError'));
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BillForm values={values} categories={categories} onChange={setValues} />

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
            {t('bills.add')}
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
