import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

type Variant = 'default' | 'active' | 'income' | 'expense';

interface BadgeProps {
  label: string;
  variant?: Variant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 20, paddingVertical: spacing.xs - 1, paddingHorizontal: spacing.sm + 2, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start' },
  default: { backgroundColor: colors.surface },
  active: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  income: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  expense: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  activeLabel: { color: colors.white },
  incomeLabel: { color: colors.white },
  expenseLabel: { color: colors.white },
  defaultLabel: { color: colors.textSecondary },
});
