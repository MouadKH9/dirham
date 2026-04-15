import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, Input, Button } from '@/components/ui';
import { useAccountsStore } from '@/lib/stores/accounts';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

type Currency = 'MAD' | 'USD' | 'EUR';
type AccountType = 'manual' | 'synced';

const CURRENCIES: Currency[] = ['MAD', 'USD', 'EUR'];
const ACCOUNT_TYPES: AccountType[] = ['manual', 'synced'];

export default function CreateAccountScreen() {
  const { t } = useTranslation('accounts');
  const router = useRouter();
  const createAccount = useAccountsStore((s) => s.createAccount);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [initialBalance, setInitialBalance] = useState('0.00');
  const [accountType, setAccountType] = useState<AccountType>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      await createAccount({
        name: name.trim().slice(0, 100),
        type: accountType,
        currency,
        balance: initialBalance || '0.00',
      });
      router.back();
    } catch {
      setError(t('createError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <Input
            label={t('name')}
            value={name}
            onChangeText={setName}
            placeholder={t('namePlaceholder')}
            maxLength={100}
            autoFocus
            returnKeyType="next"
          />

          {/* Currency selector */}
          <View style={styles.fieldGroup}>
            <Text variant="caption" style={styles.fieldLabel}>
              {t('currency')}
            </Text>
            <View style={styles.pills}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.pill, currency === c && styles.pillActive]}
                  onPress={() => setCurrency(c)}
                >
                  <Text
                    variant="body"
                    style={currency === c ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Initial balance */}
          <Input
            label={t('initialBalance')}
            value={initialBalance}
            onChangeText={setInitialBalance}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          {/* Account type selector */}
          <View style={styles.fieldGroup}>
            <Text variant="caption" style={styles.fieldLabel}>
              {t('type.manual') + ' / ' + t('type.synced')}
            </Text>
            <View style={styles.pills}>
              {ACCOUNT_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.pill, accountType === type && styles.pillActive]}
                  onPress={() => setAccountType(type)}
                >
                  <Text
                    variant="body"
                    style={accountType === type ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}
                  >
                    {t(`type.${type}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Error */}
          {error && (
            <Text variant="caption" color={colors.error}>
              {error}
            </Text>
          )}

          {/* Submit */}
          <Button
            onPress={() => { void handleCreate(); }}
            disabled={!isValid}
            loading={isLoading}
            style={styles.submitButton}
          >
            {t('create')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.white,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
