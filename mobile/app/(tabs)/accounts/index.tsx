import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Text, AmountText, Button, LoadingState } from '@/components/ui';
import { AccountCard } from '@/components/accounts/AccountCard';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

export default function AccountsScreen() {
  const { t } = useTranslation('accounts');
  const router = useRouter();

  const accounts = useAccountsStore((s) => s.accounts);
  const isLoading = useAccountsStore((s) => s.isLoading);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchAccounts();
    }, [fetchAccounts]),
  );

  const totalBalance = accounts
    .reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0)
    .toFixed(2);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAccounts();
    setIsRefreshing(false);
  }, [fetchAccounts]);

  const handleAccountPress = useCallback(
    (id: string) => {
      router.push(`/(tabs)/accounts/${id}`);
    },
    [router],
  );

  if (isLoading && accounts.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { void handleRefresh(); }}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
          />
        }
      >
        {/* Screen title */}
        <Text variant="h2" style={styles.screenTitle}>
          {t('title')}
        </Text>

        {/* Total balance card */}
        <Card style={styles.totalCard}>
          <Text variant="caption" style={styles.totalLabel}>
            {t('patrimoine')}
          </Text>
          <AmountText
            amount={totalBalance}
            type="neutral"
            currencyDisplay={currencyDisplay}
            variant="large"
          />
        </Card>

        {/* Account cards */}
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onPress={handleAccountPress}
          />
        ))}

        {/* New account button */}
        <Button
          onPress={() => router.push('/(tabs)/accounts/create')}
          variant="secondary"
          style={styles.addButton}
        >
          {`+ ${t('add')}`}
        </Button>
      </ScrollView>
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
  screenTitle: {
    marginBottom: spacing.xs,
  },
  totalCard: {
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  totalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    marginTop: spacing.sm,
  },
});
