import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, AmountText } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';
import type { Account } from '@/lib/types';

interface AccountPillsProps {
  accounts: Account[];
  onAccountPress: (id: string) => void;
}

export function AccountPills({ accounts, onAccountPress }: AccountPillsProps) {
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  if (accounts.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {accounts.map((account) => (
        <TouchableOpacity
          key={account.id}
          style={styles.pill}
          onPress={() => onAccountPress(account.id)}
          activeOpacity={0.7}
        >
          <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {account.name}
          </Text>
          <AmountText
            amount={account.balance}
            type="neutral"
            currencyDisplay={currencyDisplay}
            variant="small"
            style={styles.pillAmount}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
    alignItems: 'flex-start',
  },
  pillAmount: {
    marginTop: 2,
    color: colors.textPrimary,
  },
});
