import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Account, Category, TransactionFilters } from '@/lib/types';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Partial<TransactionFilters>) => void;
  accounts: Account[];
  categories: Category[];
  activeFilters?: { account?: string; category?: string };
}

export function FilterSheet({ isOpen, onClose, onApply, accounts, categories, activeFilters }: FilterSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['55%'], []);

  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  // Sync local state when external filters are cleared or changed
  useEffect(() => {
    setSelectedAccount(activeFilters?.account ?? null);
    setSelectedCategory(activeFilters?.category ?? null);
  }, [activeFilters?.account, activeFilters?.category]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  const handleApply = useCallback(() => {
    const filters: Partial<TransactionFilters> = {};
    if (selectedAccount) filters.account = selectedAccount;
    if (selectedCategory) filters.category = selectedCategory;
    onApply(filters);
    onClose();
  }, [selectedAccount, selectedCategory, onApply, onClose]);

  const handleReset = useCallback(() => {
    setSelectedAccount(null);
    setSelectedCategory(null);
    onApply({});
    onClose();
  }, [onApply, onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Filtres</Text>

        {/* Account filter */}
        <Text style={styles.sectionLabel}>Compte</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Pressable
            style={[styles.chip, selectedAccount === null && styles.chipActive]}
            onPress={() => setSelectedAccount(null)}
          >
            <Text style={[styles.chipText, selectedAccount === null && styles.chipTextActive]}>
              Tous les comptes
            </Text>
          </Pressable>
          {accounts.map((acc) => {
            const isSelected = selectedAccount === acc.id;
            return (
              <Pressable
                key={acc.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedAccount(acc.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {acc.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Category filter */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Catégorie</Text>
        <View style={styles.categoryGrid}>
          <Pressable
            style={[styles.categoryChip, selectedCategory === null && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, selectedCategory === null && styles.chipTextActive]}>
              Toutes
            </Text>
          </Pressable>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.chipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]} numberOfLines={1}>
                  {cat.name || cat.name_fr}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </Pressable>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Appliquer</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  categoryIcon: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
