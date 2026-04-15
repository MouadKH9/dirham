import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, AmountText } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useAccountsStore } from '@/lib/stores/accounts';
import type { Transaction } from '@/lib/types';

interface TransactionRowProps {
  transaction: Transaction;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  // Direct state reads to avoid re-render overhead
  const categories = useCategoriesStore.getState().categories;
  const accounts = useAccountsStore.getState().accounts;

  const category = categories.find((c) => c.id === transaction.category);
  const account = accounts.find((a) => a.id === transaction.account);

  const categoryName = category?.name || category?.name_fr || '—';
  const categoryIcon = category?.icon || '💳';
  const accountName = account?.name || '—';

  return (
    <View style={styles.row}>
      {/* Left: emoji circle */}
      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>{categoryIcon}</Text>
      </View>

      {/* Center: category name + account */}
      <View style={styles.centerContent}>
        <Text variant="body" color={colors.textPrimary} numberOfLines={1}>
          {transaction.notes || categoryName}
        </Text>
        <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
          {accountName}
        </Text>
      </View>

      {/* Right: amount + date */}
      <View style={styles.rightContent}>
        <AmountText
          amount={transaction.amount}
          type={transaction.type}
          currencyDisplay={currencyDisplay}
          showSign
          variant="small"
        />
        <Text variant="caption" color={colors.textSecondary} style={styles.date}>
          {formatDate(transaction.date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: {
    fontSize: 18,
  },
  centerContent: {
    flex: 1,
    minWidth: 0,
  },
  rightContent: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  date: {
    marginTop: 2,
  },
});
