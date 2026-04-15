import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingState, Text, Button } from '@/components/ui';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { AccountPills } from '@/components/dashboard/AccountPills';
import { MonthlySummary } from '@/components/dashboard/MonthlySummary';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { colors } from '@/lib/theme/colors';

export default function DashboardScreen() {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refresh } = useDashboard();

  // Compute total balance from accounts if not provided by API
  const totalBalance = useMemo(() => {
    if (data?.total_balance) return data.total_balance;
    if (!data?.accounts?.length) return '0.00';
    return data.accounts
      .reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0)
      .toFixed(2);
  }, [data?.total_balance, data?.accounts]);

  const income = data?.monthly_summary?.income ?? '0.00';
  const expense = data?.monthly_summary?.expense ?? '0.00';

  // Show loading spinner only on initial load (no data yet)
  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingState size="large" />
      </View>
    );
  }

  // Show error state when there's no data and an error occurred
  if (!data && !isLoading && error) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="body" color={colors.textSecondary} style={styles.errorText}>
          {t('loadError')}
        </Text>
        <Button onPress={refresh} variant="secondary">
          {tCommon('retry')}
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={colors.terracotta}
          colors={[colors.terracotta]}
        />
      }
    >
      <BalanceCard totalBalance={totalBalance} income={income} expense={expense} />

      {data?.accounts && data.accounts.length > 0 && (
        <AccountPills
          accounts={data.accounts}
          onAccountPress={(_id) => router.push('/(tabs)/accounts')}
        />
      )}

      {data?.monthly_summary && (
        <MonthlySummary summary={data.monthly_summary} />
      )}

      {data?.recent_transactions && (
        <RecentTransactions
          transactions={data.recent_transactions}
          onViewAll={() => router.push('/(tabs)/transactions')}
        />
      )}

      {!data && !isLoading && (
        <View style={styles.emptyContainer} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
  },
});
