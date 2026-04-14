import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors } from '@/lib/theme/colors';

type TransactionType = 'income' | 'expense' | 'bill' | 'neutral';

interface AmountTextProps {
  amount: string; // decimal string from API e.g. "1250.00"
  type?: TransactionType;
  currencyDisplay?: 'MAD' | 'DH';
  showSign?: boolean;
  style?: TextStyle;
  variant?: 'small' | 'medium' | 'large';
}

export function AmountText({
  amount,
  type = 'neutral',
  currencyDisplay = 'MAD',
  showSign = false,
  style,
  variant = 'medium',
}: AmountTextProps) {
  const formatted = formatAmount(amount);
  const sign = showSign && type === 'income' ? '+' : showSign && (type === 'expense' || type === 'bill') ? '-' : '';
  const color = type === 'income' ? colors.income : type === 'expense' || type === 'bill' ? colors.expense : colors.textPrimary;

  return (
    <Text style={[styles.base, styles[variant], { color }, style]}>
      {sign}{formatted} {currencyDisplay}
    </Text>
  );
}

function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  // Use locale formatting with 2 decimal places
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const styles = StyleSheet.create({
  base: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  small: { fontSize: 13 },
  medium: { fontSize: 16 },
  large: { fontSize: 28 },
});
