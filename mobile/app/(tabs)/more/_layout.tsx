import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/lib/theme/colors';

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: true }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
    </Stack>
  );
}
