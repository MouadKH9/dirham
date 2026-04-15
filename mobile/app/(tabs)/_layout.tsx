import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/navigation/CustomTabBar';
import { AddTransactionSheet } from '@/components/transactions/AddTransactionSheet';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useAccountsStore } from '@/lib/stores/accounts';

export default function TabsLayout() {
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
        <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
        <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
        <Tabs.Screen name="accounts" options={{ title: 'Comptes' }} />
        <Tabs.Screen name="more" options={{ title: 'Plus' }} />
      </Tabs>
      <AddTransactionSheet />
    </>
  );
}
