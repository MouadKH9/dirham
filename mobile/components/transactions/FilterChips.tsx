import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  label: string;
  activeColor: string;
}

const CHIPS: ChipConfig[] = [
  { key: 'all', label: 'Tout', activeColor: colors.terracotta },
  { key: 'expense', label: 'Dépenses', activeColor: colors.terracotta },
  { key: 'income', label: 'Revenus', activeColor: colors.emerald },
];

export function FilterChips({ activeFilter, onFilterChange, onOpenFilters }: FilterChipsProps) {
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
                {chip.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable style={[styles.chip, styles.filterButton]} onPress={onOpenFilters}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.chipTextInactive}>Filtres</Text>
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
