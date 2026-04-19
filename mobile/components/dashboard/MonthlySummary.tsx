import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Text, AmountText } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';
import type { MonthlySummary as MonthlySummaryType } from '@/lib/types';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

// Static month names by language. We avoid `toLocaleDateString` because
// React Native's Hermes runtime ships without full ICU data, so locales
// other than the default often fall back to English.
const MONTH_NAMES: Record<string, readonly string[]> = {
  fr: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  ar: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
};

function formatMonth(month: string, lang: string): string {
  // month is "2026-04"
  try {
    const [year, monthNum] = month.split('-');
    const idx = parseInt(monthNum, 10) - 1;
    const langKey = lang.split('-')[0].toLowerCase();
    const names = MONTH_NAMES[langKey] ?? MONTH_NAMES.fr;
    const name = names[idx] ?? month;
    return `${name} ${year}`;
  } catch {
    return month;
  }
}

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  const { t, i18n } = useTranslation('dashboard');
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const net = parseFloat(summary.net);
  const netType = net >= 0 ? 'income' : 'expense';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="h3">{formatMonth(summary.month, i18n.language)}</Text>
        <Text variant="caption" color={colors.textSecondary}>
          {t('thisMonth')}
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
            {t('monthlyIncome')}
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
            {t('monthlyExpense')}
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
            {t('netBalance')}
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
