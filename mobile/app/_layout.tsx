import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/lib/stores/auth';
import { useSettingsStore } from '@/lib/stores/settings';

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
      await useSettingsStore.getState().loadSettings();
      await checkAuth();
    };
    void init();
  }, [checkAuth]);

  // Proactively refresh the access token when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const token = await SecureStore.getItemAsync('dirham_access_token');
        if (!token) return;
        try {
          const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
          const expiresAt = payload.exp * 1000;
          const fiveMinMs = 5 * 60 * 1000;
          if (expiresAt - Date.now() < fiveMinMs) {
            const refreshToken = await SecureStore.getItemAsync('dirham_refresh_token');
            if (refreshToken) {
              await useAuthStore.getState().checkAuth();
            }
          }
        } catch {
          // Malformed token — let the 401 interceptor handle it
        }
      }
    });
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
