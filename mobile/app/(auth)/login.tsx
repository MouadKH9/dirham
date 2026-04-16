import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ZelligeHeader } from '@/components/ui/ZelligeHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/stores/auth';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isSubmitting, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async () => {
    await login(email, password);
    if (!isMountedRef.current) return;
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ZelligeHeader height={180}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Connexion</Text>
        </View>
      </ZelligeHeader>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          containerStyle={styles.inputContainer}
          placeholder="vous@exemple.com"
        />

        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          containerStyle={styles.inputContainer}
          placeholder="••••••••"
        />

        <Button
          onPress={handleLogin}
          loading={isSubmitting}
          style={styles.submitButton}
        >
          Se connecter
        </Button>

        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>
            Pas de compte?{' '}
            <Text style={styles.linkHighlight}>Créer un compte</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  errorBanner: {
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.sm,
    width: '100%',
  },
  linkRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkHighlight: {
    color: colors.terracotta,
    fontWeight: '600',
  },
});
