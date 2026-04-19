import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZelligeHeader, AmountText, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';

interface BalanceCardProps {
  totalBalance: string;
  income: string;
  expense: string;
}

const BASE_HEIGHT = 200;
const EXTRA_TOP_BREATHING = spacing.md;

export function BalanceCard({ totalBalance, income, expense }: BalanceCardProps) {
  const { t } = useTranslation('dashboard');
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const insets = useSafeAreaInsets();

  // Grow the header to absorb the status-bar inset so content stays vertically
  // centered below the notch / Dynamic Island, with a little extra breathing
  // room so the "Solde total" label isn't kissing the status bar.
  const topPadding = insets.top + EXTRA_TOP_BREATHING;

  return (
    <ZelligeHeader height={BASE_HEIGHT + topPadding}>
      <View style={[styles.content, { paddingTop: topPadding }]}>
        <Text variant="caption" color={colors.white} style={styles.label}>
          {t('totalBalance')}
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
            <Text variant="caption" color={colors.white} style={styles.pillLabel}>
              {t('incomeArrow')}{' '}
            </Text>
            <AmountText
              amount={income}
              type="neutral"
              currencyDisplay={currencyDisplay}
              variant="small"
              style={styles.pillAmount}
            />
          </View>
          <View style={[styles.pill, styles.expensePill]}>
            <Text variant="caption" color={colors.white} style={styles.pillLabel}>
              {t('expenseArrow')}{' '}
            </Text>
            <AmountText
              amount={expense}
              type="neutral"
              currencyDisplay={currencyDisplay}
              variant="small"
              style={styles.pillAmount}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomePill: {
    backgroundColor: colors.emerald,
  },
  expensePill: {
    backgroundColor: colors.terracotta,
    opacity: 0.9,
  },
  pillLabel: {
    fontWeight: '600',
  },
  pillAmount: {
    color: colors.white,
    fontWeight: '600',
  },
});
