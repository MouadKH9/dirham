import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, AmountText } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';
import type { MonthlySummary as MonthlySummaryType } from '@/lib/types';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

function formatMonth(month: string): string {
  // month is "2026-04"
  try {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  } catch {
    return month;
  }
}

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const net = parseFloat(summary.net);
  const netType = net >= 0 ? 'income' : 'expense';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="h3">{formatMonth(summary.month)}</Text>
        <Text variant="caption" color={colors.textSecondary}>
          Ce mois
        </Text>
      </View>
      <View style={styles.columnsRow}>
        <View style={styles.column}>
          <AmountText
            amount={summary.income}
            type="income"
            currencyDisplay={currencyDisplay}
            variant="small"
          />
          <Text variant="caption" color={colors.textSecondary} style={styles.columnLabel}>
            Revenus
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.column}>
          <AmountText
            amount={summary.expense}
            type="expense"
            currencyDisplay={currencyDisplay}
            variant="small"
          />
          <Text variant="caption" color={colors.textSecondary} style={styles.columnLabel}>
            Dépenses
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.column}>
          <AmountText
            amount={Math.abs(net).toFixed(2)}
            type={netType}
            currencyDisplay={currencyDisplay}
            variant="small"
          />
          <Text variant="caption" color={colors.textSecondary} style={styles.columnLabel}>
            Solde net
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    marginTop: spacing.xs,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
});
