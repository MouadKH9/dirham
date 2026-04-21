import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Badge, Card, EmptyState, LoadingState, Text } from '@/components/ui';
import { useBudgetsStore } from '@/lib/stores/budgets';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { RecurringBudget } from '@/lib/types';

function formatAmount(amount: string, currencyDisplay: string): string {
  const parsed = parseFloat(amount || '0');
  return `${parsed.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyDisplay}`;
}

function formatMonth(month: string): string {
  const d = new Date(month);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function RecurringBudgetsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const recurringBudgets = useBudgetsStore((s) => s.recurringBudgets);
  const isLoading = useBudgetsStore((s) => s.isRecurringLoading);
  const fetchRecurringBudgets = useBudgetsStore((s) => s.fetchRecurringBudgets);

  useFocusEffect(
    useCallback(() => {
      void fetchRecurringBudgets(true);
    }, [fetchRecurringBudgets]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push('/(tabs)/more/budgets/recurring/create')}
          style={styles.headerButton}
          hitSlop={8}
        >
          <Ionicons name="add" size={26} color={colors.terracotta} />
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const renderItem = ({ item }: { item: RecurringBudget }) => (
    <Pressable onPress={() => router.push(`/(tabs)/more/budgets/recurring/${item.id}`)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text variant="h3">
              {item.name?.trim().length ? item.name : t('budgets.recurring.unnamed')}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              {t('budgets.recurring.startsFrom', { month: formatMonth(item.start_month) })}
            </Text>
          </View>
          <View style={styles.meta}>
            <Badge
              label={item.is_active ? t('budgets.recurring.statusActive') : t('budgets.recurring.statusInactive')}
              variant={item.is_active ? 'active' : 'default'}
            />
            <Text variant="caption" color={colors.textSecondary}>
              {formatAmount(item.amount, currencyDisplay)}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  if (isLoading && recurringBudgets.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={recurringBudgets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.content, recurringBudgets.length === 0 ? styles.emptyContent : undefined]}
        ListEmptyComponent={(
          <EmptyState
            icon="🔁"
            title={t('budgets.recurring.emptyTitle')}
            description={t('budgets.recurring.emptyDescription')}
            actionLabel={t('budgets.recurring.add')}
            onAction={() => router.push('/(tabs)/more/budgets/recurring/create')}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyContent: {
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  headerButton: {
    paddingRight: spacing.sm,
  },
});
