import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

type FilterType = 'all' | 'expense' | 'income';

interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onOpenFilters: () => void;
}

interface ChipConfig {
  key: FilterType;
  labelKey: string;
  activeColor: string;
}

const CHIPS: ChipConfig[] = [
  { key: 'all', labelKey: 'all', activeColor: colors.terracotta },
  { key: 'expense', labelKey: 'expenses', activeColor: colors.terracotta },
  { key: 'income', labelKey: 'revenues', activeColor: colors.emerald },
];

export function FilterChips({ activeFilter, onFilterChange, onOpenFilters }: FilterChipsProps) {
  const { t } = useTranslation('transactions');

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CHIPS.map((chip) => {
          const isActive = activeFilter === chip.key;
          return (
            <Pressable
              key={chip.key}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: chip.activeColor, borderColor: chip.activeColor }
                  : styles.chipInactive,
              ]}
              onPress={() => onFilterChange(chip.key)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                {t(chip.labelKey)}
              </Text>
            </Pressable>
          );
        })}

        <Pressable style={[styles.chip, styles.filterButton]} onPress={onOpenFilters}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.chipTextInactive}>{t('filters')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  chipInactive: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
  chipTextInactive: {
    color: colors.textSecondary,
  },
  filterButton: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginLeft: spacing.xs,
  },
  filterIcon: {
    fontSize: 12,
  },
});
