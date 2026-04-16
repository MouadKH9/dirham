import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, ErrorBanner } from '@/components/ui';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { AccountPills } from '@/components/dashboard/AccountPills';
import { MonthlySummary } from '@/components/dashboard/MonthlySummary';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

// ─── Skeleton pulse animation ────────────────────────────────────────────────

function usePulse() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
}

function DashboardSkeleton() {
  const opacity = usePulse();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View style={[skeletonStyles.container, { opacity, paddingTop: insets.top + spacing.md }]}>
      {/* BalanceCard placeholder */}
      <View style={skeletonStyles.balanceCard} />

      {/* AccountPills placeholders */}
      <View style={skeletonStyles.pillsRow}>
        <View style={skeletonStyles.pill} />
        <View style={skeletonStyles.pill} />
        <View style={[skeletonStyles.pill, skeletonStyles.pillShort]} />
      </View>

      {/* MonthlySummary placeholder */}
      <View style={skeletonStyles.summaryCard} />

      {/* RecentTransactions placeholder */}
      <View style={skeletonStyles.transactionsCard} />
    </Animated.View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  balanceCard: {
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    height: 36,
    width: 100,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  pillShort: {
    width: 70,
  },
  summaryCard: {
    height: 100,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  transactionsCard: {
    height: 180,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

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

  // Show skeleton only on initial load (no data yet)
  if (isLoading && !data) {
    return <DashboardSkeleton />;
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
    <View style={styles.wrapper}>
      {/* Banner for non-fatal network errors while data is already cached */}
      {error && data && (
        <ErrorBanner
          message={t('loadError')}
          onRetry={refresh}
        />
      )}

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
});
