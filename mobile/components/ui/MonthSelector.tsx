import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Text } from './Text';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

interface MonthSelectorProps {
  label: string;
  value: string; // YYYY-MM-01
  onChange: (nextMonthStart: string) => void;
}

function parseMonthStart(value: string): Date {
  const match = /^(\d{4})-(\d{2})-01$/.exec(value);
  if (!match) return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }
  return new Date(year, monthIndex, 1);
}

function formatMonthStart(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}-01`;
}

export function MonthSelector({ label, value, onChange }: MonthSelectorProps) {
  const { t, i18n } = useTranslation();
  const currentMonth = parseMonthStart(value);
  const monthLabel = currentMonth.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });

  const shiftMonth = (delta: number) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    onChange(formatMonthStart(next));
  };

  return (
    <View style={styles.wrapper}>
      <Text variant="caption" style={styles.label}>
        {label}
      </Text>
      <View style={styles.selector}>
        <Pressable
          style={styles.control}
          onPress={() => shiftMonth(-1)}
          accessibilityRole="button"
          accessibilityLabel={t('budgets.monthSelector.previous')}
        >
          <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
        </Pressable>
        <Text variant="body" style={styles.monthText}>
          {monthLabel}
        </Text>
        <Pressable
          style={styles.control}
          onPress={() => shiftMonth(1)}
          accessibilityRole="button"
          accessibilityLabel={t('budgets.monthSelector.next')}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
  },
  control: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
