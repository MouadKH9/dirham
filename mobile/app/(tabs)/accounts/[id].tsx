import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, AmountText, Button } from '@/components/ui';
import { ZelligeHeader } from '@/components/ui/ZelligeHeader';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useSettingsStore } from '@/lib/stores/settings';
import { useGroupedTransactions } from '@/lib/hooks/useGroupedTransactions';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { TransactionSection } from '@/lib/hooks/useGroupedTransactions';
import type { Transaction } from '@/lib/types';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('accounts');
  const router = useRouter();

  const account = useAccountsStore((s) => s.accounts.find((a) => a.id === id));
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const transactions = useTransactionsStore((s) => s.transactions);
  const isLoading = useTransactionsStore((s) => s.isLoading);
  const isLoadingMore = useTransactionsStore((s) => s.isLoadingMore);
  const hasMore = useTransactionsStore((s) => s.hasMore);
  const fetchTransactions = useTransactionsStore((s) => s.fetchTransactions);
  const loadMore = useTransactionsStore((s) => s.loadMore);
  const setFilters = useTransactionsStore((s) => s.setFilters);
  const clearFilters = useTransactionsStore((s) => s.clearFilters);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setFilters({ account: id });
      void fetchTransactions(true);
      return () => {
        clearFilters();
      };
    }, [id, setFilters, fetchTransactions, clearFilters]),
  );

  const sections = useGroupedTransactions(transactions);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTransactions(true);
    setIsRefreshing(false);
  }, [fetchTransactions]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && !isLoadingMore) {
      void loadMore();
    }
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

  if (!account) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text variant="h3" style={styles.notFoundTitle}>
            {t('notFound')}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.notFoundDesc}>
            {t('notFoundDesc')}
          </Text>
          <Button onPress={() => router.back()} variant="secondary" style={styles.backButton}>
            {t('goBack')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.rowWrapper}>
      <TransactionRow transaction={item} />
    </View>
  );

  const renderSectionHeader = ({ section }: { section: TransactionSection }) => (
    <View style={styles.sectionHeader}>
      <Text variant="caption" style={styles.sectionTitle}>
        {section.title}
      </Text>
      <AmountText
        amount={section.dailyTotal}
        type={parseFloat(section.dailyTotal) >= 0 ? 'income' : 'expense'}
        currencyDisplay={currencyDisplay}
        showSign
        variant="small"
      />
    </View>
  );

  const ListEmptyComponent = isLoading ? null : (
    <View style={styles.empty}>
      <Text variant="body" color={colors.textSecondary}>
        {t('noTransactions')}
      </Text>
    </View>
  );

  const ListFooterComponent = isLoadingMore ? (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={colors.terracotta} />
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ZelligeHeader height={180}>
        <View style={styles.headerContent}>
          <Text variant="h2" style={styles.headerName} numberOfLines={1}>
            {account.name}
          </Text>
          <AmountText
            amount={account.balance}
            type="neutral"
            currencyDisplay={account.currency === 'MAD' ? currencyDisplay : (account.currency as 'MAD' | 'DH')}
            variant="large"
            style={styles.headerBalance}
          />
          <Text variant="caption" style={styles.headerCurrency}>
            {account.currency}
          </Text>
        </View>
      </ZelligeHeader>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { void handleRefresh(); }}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  notFoundTitle: {
    textAlign: 'center',
  },
  notFoundDesc: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.sm,
    minWidth: 200,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  headerName: {
    color: colors.white,
  },
  headerBalance: {
    color: colors.white,
  },
  headerCurrency: {
    color: colors.white,
    opacity: 0.8,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rowWrapper: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
