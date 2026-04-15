import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ZelligeHeader, AmountText, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';

interface BalanceCardProps {
  totalBalance: string;
  income: string;
  expense: string;
}

export function BalanceCard({ totalBalance, income, expense }: BalanceCardProps) {
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  return (
    <ZelligeHeader height={200}>
      <View style={styles.content}>
        <Text variant="caption" color={colors.white} style={styles.label}>
          Solde total
        </Text>
        <AmountText
          amount={totalBalance}
          type="neutral"
          currencyDisplay={currencyDisplay}
          variant="large"
          style={styles.balanceAmount}
        />
        <View style={styles.pillsRow}>
          <View style={[styles.pill, styles.incomePill]}>
            <Text variant="caption" color={colors.white} style={styles.pillText}>
              ↑ Revenus{' '}
              {parseFloat(income).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currencyDisplay}
            </Text>
          </View>
          <View style={[styles.pill, styles.expensePill]}>
            <Text variant="caption" color={colors.white} style={styles.pillText}>
              ↓ Dépenses{' '}
              {parseFloat(expense).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {currencyDisplay}
            </Text>
          </View>
        </View>
      </View>
    </ZelligeHeader>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    opacity: 0.85,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: colors.white,
    marginBottom: spacing.md,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  incomePill: {
    backgroundColor: colors.emerald,
  },
  expensePill: {
    backgroundColor: colors.terracotta,
    opacity: 0.9,
  },
  pillText: {
    fontWeight: '600',
  },
});
