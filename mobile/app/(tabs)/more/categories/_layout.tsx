import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/lib/theme/colors';

export default function CategoriesLayout() {
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
      <Stack.Screen
        name="index"
        options={{ title: t('categories.title') }}
      />
      <Stack.Screen
        name="create"
        options={{ title: t('categories.add') }}
      />
    </Stack>
  );
}
