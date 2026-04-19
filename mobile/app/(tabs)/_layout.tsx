import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { AddTransactionSheet } from '@/components/transactions/AddTransactionSheet';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useAccountsStore } from '@/lib/stores/accounts';

export default function TabsLayout() {
  const { t } = useTranslation();
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);

  useEffect(() => {
    void Promise.all([fetchCategories(), fetchAccounts()]);
  }, [fetchCategories, fetchAccounts]);

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: t('dashboard.title') }} />
        <Tabs.Screen name="transactions" options={{ title: t('transactions.title') }} />
        <Tabs.Screen name="accounts" options={{ title: t('accounts.title') }} />
        <Tabs.Screen name="more" options={{ title: t('more.title') }} />
      </Tabs>
      <AddTransactionSheet />
    </>
  );
}
