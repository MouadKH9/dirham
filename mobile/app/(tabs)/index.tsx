import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '@/components/ui';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { AccountPills } from '@/components/dashboard/AccountPills';
import { MonthlySummary } from '@/components/dashboard/MonthlySummary';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { colors } from '@/lib/theme/colors';

export default function DashboardScreen() {
  const { t } = useTranslation('dashboard');
  const { data, isLoading, refresh } = useDashboard();

  // Show loading spinner only on initial load (no data yet)
  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingState size="large" />
      </View>
    );
  }

  // Compute total balance from accounts if not provided by API
  const totalBalance =
    data?.total_balance ??
    (data?.accounts
      ? data.accounts
          .reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0)
          .toFixed(2)
      : '0.00');

  const income = data?.monthly_summary?.income ?? '0.00';
  const expense = data?.monthly_summary?.expense ?? '0.00';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
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
          onAccountPress={() => router.push('/(tabs)/accounts')}
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
