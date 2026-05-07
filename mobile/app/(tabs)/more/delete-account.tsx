import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Text, Card, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

const CONFIRM_KEYWORD = 'DELETE';

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const error = useAuthStore((s) => s.error);
  const user = useAuthStore((s) => s.user);

  const [confirmText, setConfirmText] = useState('');

  const isConfirmValid = confirmText.trim().toUpperCase() === CONFIRM_KEYWORD;

  const handleDelete = () => {
    Alert.alert(
      t('deleteAccount.alertTitle'),
      t('deleteAccount.alertMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('deleteAccount.confirmButton'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteAccount();
                router.replace('/(auth)/welcome');
              } catch {
                // error surfaced via store.error
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={32} color={colors.error} />
          </View>
        </View>

        <Text variant="h2" style={styles.title}>
          {t('deleteAccount.title')}
        </Text>

        <Text variant="body" style={styles.description}>
          {t('deleteAccount.description')}
        </Text>

        <Card style={styles.warningCard}>
          <Text variant="caption" style={styles.warningTitle}>
            {t('deleteAccount.whatHappens')}
          </Text>
          <View style={styles.bulletList}>
            <BulletItem text={t('deleteAccount.bullet1')} />
            <BulletItem text={t('deleteAccount.bullet2')} />
            <BulletItem text={t('deleteAccount.bullet3')} />
            <BulletItem text={t('deleteAccount.bullet4')} />
          </View>
        </Card>

        {user?.email ? (
          <View style={styles.emailRow}>
            <Text variant="caption" style={styles.emailLabel}>
              {t('deleteAccount.accountLabel')}
            </Text>
            <Text variant="body" style={styles.emailValue}>
              {user.email}
            </Text>
          </View>
        ) : null}

        <Input
          label={t('deleteAccount.confirmLabel', { keyword: CONFIRM_KEYWORD })}
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={CONFIRM_KEYWORD}
          containerStyle={styles.confirmInput}
        />

        {error ? (
          <Text variant="caption" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            onPress={handleDelete}
            variant="danger"
            disabled={!isConfirmValid || isSubmitting}
            loading={isSubmitting}
          >
            {t('deleteAccount.confirmButton')}
          </Button>
          <Button
            onPress={() => router.back()}
            variant="ghost"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text variant="body" style={styles.bulletDot}>
        •
      </Text>
      <Text variant="body" style={styles.bulletText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    color: colors.textPrimary,
  },
  description: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
  },
  warningCard: {
    gap: spacing.sm,
    borderColor: colors.error,
    borderWidth: 1,
    backgroundColor: '#FFF8F8',
  },
  warningTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.error,
    fontWeight: '700',
  },
  bulletList: {
    gap: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletDot: {
    color: colors.error,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  emailRow: {
    gap: spacing.xs,
  },
  emailLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emailValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  confirmInput: {
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
