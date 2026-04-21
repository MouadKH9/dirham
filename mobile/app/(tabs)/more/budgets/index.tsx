import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, EmptyState, LoadingState, Text } from '@/components/ui';
import { useBudgetsStore } from '@/lib/stores/budgets';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Budget } from '@/lib/types';

function formatAmount(amount: string, currencyDisplay: string): string {
  const parsed = parseFloat(amount || '0');
  return `${parsed.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyDisplay}`;
}

function formatMonth(month: string): string {
  const d = new Date(month);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function BudgetsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const budgets = useBudgetsStore((s) => s.budgets);
  const hasMore = useBudgetsStore((s) => s.hasMore);
  const isLoading = useBudgetsStore((s) => s.isLoading);
  const isLoadingMore = useBudgetsStore((s) => s.isLoadingMore);
  const fetchBudgets = useBudgetsStore((s) => s.fetchBudgets);
  const loadMore = useBudgetsStore((s) => s.loadMore);

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([fetchBudgets(true), fetchCategories()]);
    }, [fetchBudgets, fetchCategories]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push('/(tabs)/more/budgets/create')}
          style={styles.headerButton}
          hitSlop={8}
        >
          <Ionicons name="add" size={26} color={colors.terracotta} />
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const categoryNames = useMemo(() => {
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchBudgets(true);
    setIsRefreshing(false);
  }, [fetchBudgets]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    void loadMore();
  }, [hasMore, isLoadingMore, loadMore]);

  const renderBudget = useCallback(
    ({ item }: { item: Budget }) => (
      <Pressable onPress={() => router.push(`/(tabs)/more/budgets/${item.id}`)}>
        <Card style={styles.budgetCard}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text variant="h3">
                {item.name?.trim().length
                  ? item.name.trim()
                  : item.categories.length > 0
                    ? item.categories.map((id) => categoryNames.get(id) || t('budgets.unknownCategory')).join(', ')
                    : t('budgets.unknownCategory')}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>{formatMonth(item.month)}</Text>
            </View>
            <View style={styles.amountWrap}>
              <Text variant="body">{formatAmount(item.amount, currencyDisplay)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </View>
        </Card>
      </Pressable>
    ),
    [categoryNames, currencyDisplay, router, t],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.terracotta} />
      </View>
    );
  }, [isLoadingMore]);

  const renderHeader = useCallback(() => (
    <Pressable onPress={() => router.push('/(tabs)/more/budgets/recurring')}>
      <Card style={styles.recurringEntryCard}>
        <View style={styles.recurringEntryRow}>
          <View>
            <Text variant="h3">{t('budgets.recurring.title')}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {t('budgets.recurring.entryDescription')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </Card>
    </Pressable>
  ), [router, t]);

  if (isLoading && budgets.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={renderBudget}
        contentContainerStyle={[
          styles.content,
          budgets.length === 0 ? styles.emptyContent : undefined,
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={(
          <EmptyState
            icon="🎯"
            title={t('budgets.emptyTitle')}
            description={t('budgets.emptyDescription')}
            actionLabel={t('budgets.add')}
            onAction={() => router.push('/(tabs)/more/budgets/create')}
          />
        )}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { void handleRefresh(); }}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
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
  budgetCard: {
    marginBottom: spacing.sm,
  },
  recurringEntryCard: {
    marginBottom: spacing.sm,
  },
  recurringEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  headerButton: {
    paddingRight: spacing.sm,
  },
});
