import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, LoadingState, EmptyState } from '@/components/ui';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { TransactionSearch } from '@/components/transactions/TransactionSearch';
import { FilterChips } from '@/components/transactions/FilterChips';
import { FilterSheet } from '@/components/transactions/FilterSheet';
import { useGroupedTransactions, type TransactionSection } from '@/lib/hooks/useGroupedTransactions';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Transaction, TransactionFilters } from '@/lib/types';

type FilterType = 'all' | 'expense' | 'income';

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  section: TransactionSection;
}

function SectionHeader({ section }: SectionHeaderProps) {
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const total = parseFloat(section.dailyTotal);
  const isPositive = total >= 0;
  const formattedTotal = Math.abs(total).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={sectionHeaderStyles.container}>
      <RNText style={sectionHeaderStyles.title}>{section.title}</RNText>
      <RNText
        style={[
          sectionHeaderStyles.total,
          { color: isPositive ? colors.income : colors.expense },
        ]}
      >
        {isPositive ? '+' : '-'}{formattedTotal} {currencyDisplay}
      </RNText>
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  total: {
    fontSize: 13,
    fontWeight: '700',
  },
});

// ─── Swipeable Row ────────────────────────────────────────────────────────────

interface SwipeableRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

function SwipeableRow({ transaction, onDelete }: SwipeableRowProps) {
  const { t } = useTranslation();

  const handleDelete = () => {
    Alert.alert(
      t('transactions.deleteConfirmTitle'),
      t('transactions.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onDelete(transaction.id),
        },
      ],
    );
  };

  const renderRightActions = useCallback(() => (
    <Pressable style={swipeStyles.deleteAction} onPress={handleDelete}>
      <Text style={swipeStyles.deleteText}>{t('common.delete')}</Text>
    </Pressable>
  ), [handleDelete, t]);

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={80}
      overshootRight={false}
    >
      <View style={swipeStyles.rowContainer}>
        <TransactionRow transaction={transaction} />
      </View>
    </Swipeable>
  );
}

const swipeStyles = StyleSheet.create({
  rowContainer: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TransactionsScreen() {
  const { t } = useTranslation();

  // Store
  const transactions = useTransactionsStore((s) => s.transactions);
  const isLoading = useTransactionsStore((s) => s.isLoading);
  const isLoadingMore = useTransactionsStore((s) => s.isLoadingMore);
  const hasMore = useTransactionsStore((s) => s.hasMore);
  const filters = useTransactionsStore((s) => s.filters);
  const fetchTransactions = useTransactionsStore((s) => s.fetchTransactions);
  const loadMore = useTransactionsStore((s) => s.loadMore);
  const setFilters = useTransactionsStore((s) => s.setFilters);
  const clearFilters = useTransactionsStore((s) => s.clearFilters);
  const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);
  const accounts = useAccountsStore((s) => s.accounts);
  const categories = useCategoriesStore((s) => s.categories);

  // Local state
  const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive the active type chip from the store so external filter changes
  // (e.g. tapping an account on the dashboard) stay in sync with the UI.
  const activeFilter: FilterType =
    filters.type === 'expense' ? 'expense' : filters.type === 'income' ? 'income' : 'all';

  // Track whether filters are active (beyond the chip filter)
  const hasActiveFilters =
    activeFilter !== 'all' ||
    !!filters.account ||
    !!filters.category ||
    !!filters.search;

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      void fetchTransactions(true);
    }, [fetchTransactions]),
  );

  // Grouped sections
  const sections = useGroupedTransactions(transactions);

  // Handlers
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setFilters({ search: query || undefined });
      void fetchTransactions(true);
    },
    [setFilters, fetchTransactions],
  );

  const handleFilterChange = useCallback(
    (filter: FilterType) => {
      if (filter === 'all') {
        setFilters({ type: undefined });
      } else if (filter === 'expense') {
        setFilters({ type: 'expense' });
      } else {
        setFilters({ type: 'income' });
      }
      void fetchTransactions(true);
    },
    [setFilters, fetchTransactions],
  );

  const handleApplyFilters = useCallback(
    (newFilters: Partial<TransactionFilters>) => {
      setFilters(newFilters);
      void fetchTransactions(true);
    },
    [setFilters, fetchTransactions],
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    clearFilters();
    void fetchTransactions(true);
  }, [clearFilters, fetchTransactions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTransactions(true);
    setIsRefreshing(false);
  }, [fetchTransactions]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      void loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
    },
    [deleteTransaction],
  );

  // Render helpers
  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <SwipeableRow transaction={item} onDelete={(id) => { void handleDelete(id); }} />
    ),
    [handleDelete],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TransactionSection }) => <SectionHeader section={section} />,
    [],
  );

  const renderListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.terracotta} />
      </View>
    );
  }, [isLoadingMore]);

  const renderListEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="💳"
        title={hasActiveFilters ? t('transactions.noResults') : t('transactions.noTransactions')}
        description={
          hasActiveFilters
            ? t('transactions.noTransactionsWithFilters')
            : undefined
        }
        actionLabel={hasActiveFilters ? t('transactions.clearFilters') : undefined}
        onAction={hasActiveFilters ? handleClearFilters : undefined}
      />
    );
  }, [isLoading, hasActiveFilters, t, handleClearFilters]);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search */}
      <TransactionSearch onSearch={handleSearch} value={searchQuery} />

      {/* Filter chips */}
      <FilterChips
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
      />

      {/* List */}
      {isLoading && transactions.length === 0 ? (
        <LoadingState />
      ) : (
        <SectionList<Transaction, TransactionSection>
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => { void handleRefresh(); }}
              tintColor={colors.terracotta}
              colors={[colors.terracotta]}
            />
          }
          stickySectionHeadersEnabled
          contentContainerStyle={sections.length === 0 ? styles.emptyContent : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter sheet */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        onApply={handleApplyFilters}
        accounts={accounts}
        categories={categories}
        activeFilters={{ account: filters.account, category: filters.category }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContent: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
