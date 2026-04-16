import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Text, AmountText, Badge } from '@/components/ui';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Account } from '@/lib/types';

interface AccountCardProps {
  account: Account;
  onPress: (id: string) => void;
}

function getAccountTypeLabel(type: string, t: (key: string) => string): string {
  switch (type) {
    case 'manual':
      return t('accounts.type.manual');
    case 'synced':
      return t('accounts.type.synced');
    default:
      return type;
  }
}

export function AccountCard({ account, onPress }: AccountCardProps) {
  const { t } = useTranslation();
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const typeLabel = getAccountTypeLabel(account.type, t);

  return (
    <Pressable
      onPress={() => onPress(account.id)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text variant="body" weight="semibold" style={styles.name} numberOfLines={1}>
            {account.name}
          </Text>
          <Badge label={typeLabel} variant="default" />
        </View>
        <AmountText
          amount={account.balance}
          type="neutral"
          currencyDisplay={account.currency === 'MAD' ? currencyDisplay : (account.currency as 'MAD' | 'DH')}
          variant="large"
          style={styles.balance}
        />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    borderRadius: 12,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
  },
  balance: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
  },
});
