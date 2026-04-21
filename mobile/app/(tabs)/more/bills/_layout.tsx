import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/lib/theme/colors';

export default function BillsLayout() {
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
      <Stack.Screen name="index" options={{ title: t('bills.title') }} />
      <Stack.Screen name="create" options={{ title: t('bills.createTitle') }} />
      <Stack.Screen name="[id]" options={{ title: t('bills.editTitle') }} />
    </Stack>
  );
}
