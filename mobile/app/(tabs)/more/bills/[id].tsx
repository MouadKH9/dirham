import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, LoadingState, Text } from '@/components/ui';
import { BillForm, type BillFormValues } from '@/components/bills/BillForm';
import { billsApi } from '@/lib/api/bills';
import { useBillsStore } from '@/lib/stores/bills';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { RecurringBill } from '@/lib/types';

export default function EditBillScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const billId = typeof params.id === 'string' ? params.id : '';

  const updateBill = useBillsStore((s) => s.updateBill);
  const deleteBill = useBillsStore((s) => s.deleteBill);
  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [initialBill, setInitialBill] = useState<RecurringBill | null>(null);
  const [values, setValues] = useState<BillFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const billCategories = useMemo(
    () => categories.filter((category) => category.type === 'bill' || !category.type),
    [categories],
  );

  React.useEffect(() => {
    if (!values || values.category || billCategories.length === 0) return;
    setValues({ ...values, category: billCategories[0].id });
  }, [billCategories, values]);

  useFocusEffect(
    React.useCallback(() => {
      if (!billId) return;

      const load = async () => {
        await fetchCategories();
        const bill = await billsApi.get(billId);
        setInitialBill(bill);
        setValues({
          name: bill.name,
          amount: bill.amount,
          category: bill.category,
          frequency: bill.frequency,
          next_due_date: bill.next_due_date,
        });
      };

      void load();
    }, [billId, fetchCategories]),
  );

  const isValid = values
    ? values.name.trim().length > 0
      && !!values.category
      && parseFloat(values.amount) > 0
      && values.next_due_date.trim().length > 0
    : false;

  const handleSave = async () => {
    if (!billId || !values || !isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateBill(billId, {
        name: values.name.trim(),
        amount: values.amount,
        category: values.category,
        frequency: values.frequency,
        next_due_date: values.next_due_date.trim(),
        is_active: initialBill?.is_active,
      });
      router.back();
    } catch {
      setError(t('bills.updateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!billId) return;
    Alert.alert(
      t('bills.deleteTitle'),
      t('bills.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setIsDeleting(true);
            void deleteBill(billId)
              .then(() => router.back())
              .catch(() => setError(t('bills.deleteError')))
              .finally(() => setIsDeleting(false));
          },
        },
      ],
    );
  };

  const handleToggleActive = async (active: boolean) => {
    if (!billId || !initialBill) return;
    const previous = initialBill;
    setInitialBill({ ...initialBill, is_active: active });
    try {
      const updated = await updateBill(billId, { is_active: active });
      setInitialBill(updated);
    } catch {
      setInitialBill(previous);
    }
  };

  if (!values || !initialBill) {
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
          <View style={styles.activeRow}>
            <Text variant="body">{t('bills.fields.active')}</Text>
            <Switch
              value={initialBill.is_active}
              onValueChange={(value) => {
                void handleToggleActive(value);
              }}
              trackColor={{ false: colors.border, true: colors.terracotta + '55' }}
              thumbColor={initialBill.is_active ? colors.terracotta : colors.textMuted}
            />
          </View>

          <BillForm values={values} categories={categories} onChange={setValues} />

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

          <Button
            onPress={handleDelete}
            variant="danger"
            loading={isDeleting}
            style={styles.deleteButton}
          >
            {t('common.delete')}
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
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  deleteButton: {
    marginTop: spacing.xs,
  },
});
