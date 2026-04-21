import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/lib/theme/colors';

export default function BudgetsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ title: t('budgets.title') }} />
      <Stack.Screen name="create" options={{ title: t('budgets.createTitle') }} />
      <Stack.Screen name="[id]" options={{ title: t('budgets.editTitle') }} />
      <Stack.Screen name="recurring/index" options={{ title: t('budgets.recurring.title') }} />
      <Stack.Screen name="recurring/create" options={{ title: t('budgets.recurring.createTitle') }} />
      <Stack.Screen name="recurring/[id]" options={{ title: t('budgets.recurring.editTitle') }} />
    </Stack>
  );
}
