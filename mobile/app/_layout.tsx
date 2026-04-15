import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/lib/stores/auth';
import { colors } from '@/lib/theme/colors';
import i18n from '@/lib/i18n';

export default function RootLayout() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    const init = async () => {
      const savedLang = await SecureStore.getItemAsync('dirham_language');
      if (savedLang) await i18n.changeLanguage(savedLang);
      await checkAuth();
    };
    void init();
  }, [checkAuth]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator size="large" color={colors.terracotta} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
