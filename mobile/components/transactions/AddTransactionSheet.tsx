import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useUIStore } from '@/lib/stores/ui';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useAccountsStore } from '@/lib/stores/accounts';
import { useTransactionsStore } from '@/lib/stores/transactions';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { useSettingsStore } from '@/lib/stores/settings';
import {
  QUICK_ADD_PRESETS,
  type QuickAddPresetId,
  resolvePresetCategoryId,
} from '@/lib/constants/quickAddPresets';

type TransactionType = 'expense' | 'income';

function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function AddTransactionSheet() {
  const { t } = useTranslation();

  // Store selectors
  const isOpen = useUIStore((s) => s.isAddTransactionOpen);
  const addTransactionPreset = useUIStore((s) => s.addTransactionPreset);
  const closeAddTransaction = useUIStore((s) => s.closeAddTransaction);
  const clearAddTransactionPreset = useUIStore((s) => s.clearAddTransactionPreset);
  const categories = useCategoriesStore((s) => s.categories);
  const accounts = useAccountsStore((s) => s.accounts);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);
  const createTransaction = useTransactionsStore((s) => s.createTransaction);
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  // Bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['58%', '88%'], []);

  // Form state
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(getTodayString());
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSnap, setCurrentSnap] = useState(0);

  // Sync accountId with first account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Controlled open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setType('expense');
    setAmount('');
    setCategoryId(null);
    setDate(getTodayString());
    setAccountId(accounts.length > 0 ? accounts[0].id : '');
    setNotes('');
    setIsSubmitting(false);
    setCurrentSnap(0);
  }, [accounts]);

  const handleSheetChange = useCallback(
    (index: number) => {
      setCurrentSnap(index);
      if (index === -1) {
        closeAddTransaction();
        clearAddTransactionPreset();
        resetForm();
      }
    },
    [clearAddTransactionPreset, closeAddTransaction, resetForm],
  );

  const handleTypeToggle = useCallback((newType: TransactionType) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setType(newType);
    setCategoryId(null);
  }, []);

  const handleExpandDetails = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const applyPreset = useCallback(
    (presetId: QuickAddPresetId) => {
      const preset = QUICK_ADD_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;

      setType(preset.type);
      if (preset.defaultAmount && !amount) {
        setAmount(preset.defaultAmount);
      }

      const resolvedCategoryId = resolvePresetCategoryId(categories, preset);
      if (resolvedCategoryId) {
        setCategoryId(resolvedCategoryId);
      }
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [amount, categories],
  );

  const handleSubmit = useCallback(async () => {
    if (!amount || !categoryId || parseFloat(amount) <= 0 || !accountId) return;
    setIsSubmitting(true);
    try {
      await createTransaction({
        amount,
        type,
        category: categoryId,
        account: accountId,
        date,
        notes: notes.trim() || undefined,
      });
      await Promise.all([fetchDashboard(), fetchAccounts()]);
      closeAddTransaction();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      // Log for debugging; UI stays open so user can retry
      if (__DEV__) console.warn('AddTransactionSheet submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, categoryId, accountId, createTransaction, type, date, notes, fetchDashboard, fetchAccounts, closeAddTransaction]);

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

  // Filter categories by type — if no type field present, show all
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (!cat.type) return true;
      return cat.type === type || cat.type === 'bill';
    });
  }, [categories, type]);

  const activeColor = type === 'expense' ? colors.terracotta : colors.emerald;
  const canSubmit = parseFloat(amount) > 0 && !!categoryId && !!accountId && !isSubmitting;
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const isExpanded = currentSnap === 1;

  useEffect(() => {
    if (!isOpen || !addTransactionPreset) return;
    applyPreset(addTransactionPreset);
  }, [addTransactionPreset, applyPreset, isOpen]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.sheetTitle}>{t('transactions.add')}</Text>

        {/* Type Toggle */}
        <View style={styles.typeToggleRow}>
          <Pressable
            style={[
              styles.typePill,
              type === 'expense' && { backgroundColor: colors.terracotta },
            ]}
            onPress={() => handleTypeToggle('expense')}
          >
            <Text
              style={[
                styles.typePillText,
                type === 'expense' ? styles.typePillTextActive : styles.typePillTextInactive,
              ]}
            >
              {t('transactions.expense')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.typePill,
              type === 'income' && { backgroundColor: colors.emerald },
            ]}
            onPress={() => handleTypeToggle('income')}
          >
            <Text
              style={[
                styles.typePillText,
                type === 'income' ? styles.typePillTextActive : styles.typePillTextInactive,
              ]}
            >
              {t('transactions.income')}
            </Text>
          </Pressable>
        </View>

        {/* Amount Input */}
        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            autoFocus={false}
            returnKeyType="done"
          />
          <Text style={styles.currencySuffix}>{currencyDisplay}</Text>
        </View>

        {/* Quick-add presets */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickAddRow}
        >
          {QUICK_ADD_PRESETS.map((preset) => {
            const isActive = addTransactionPreset === preset.id
              || resolvePresetCategoryId(categories, preset) === categoryId;
            return (
              <Pressable
                key={preset.id}
                style={[styles.quickAddChip, isActive && styles.quickAddChipActive]}
                onPress={() => applyPreset(preset.id)}
              >
                <Text style={isActive ? { ...styles.quickAddText, ...styles.quickAddTextActive } : styles.quickAddText}>
                  {preset.emoji} {t(preset.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Category Grid */}
        <Text style={styles.sectionLabel}>{t('transactions.category')}</Text>
        <View style={styles.categoryGrid}>
          {filteredCategories.map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryCell,
                  isSelected && { borderColor: activeColor, borderWidth: 2 },
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    isSelected && { backgroundColor: activeColor + '22' },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text
                  style={[styles.categoryName, isSelected && { color: activeColor }]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Expand hint — only show when at first snap */}
        {!isExpanded && (
          <Pressable style={styles.expandHint} onPress={handleExpandDetails}>
            <Text style={styles.expandHintText}>{t('transactions.moreDetails')} ↓</Text>
          </Pressable>
        )}

        {/* Expanded fields */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('transactions.date')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Account selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('transactions.account')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountScroll}>
                {accounts.map((acc) => {
                  const isSelected = accountId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      style={[
                        styles.accountChip,
                        isSelected && { backgroundColor: activeColor, borderColor: activeColor },
                      ]}
                      onPress={() => setAccountId(acc.id)}
                    >
                      <Text
                        style={[
                          styles.accountChipText,
                          isSelected && styles.accountChipTextActive,
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {selectedAccount && (
                <Text style={styles.accountBalance}>{selectedAccount.currency} {selectedAccount.balance}</Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t('transactions.notes')}</Text>
              <TextInput
                style={[styles.fieldInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('transactions.notes')}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            { backgroundColor: canSubmit ? activeColor : colors.border },
          ]}
          onPress={() => { void handleSubmit(); }}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>{t('common.save')}</Text>
          )}
        </Pressable>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  // Type toggle
  typeToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  typePill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  typePillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typePillTextActive: {
    color: colors.white,
  },
  typePillTextInactive: {
    color: colors.textSecondary,
  },

  // Amount
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 120,
    paddingVertical: spacing.sm,
  },
  currencySuffix: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
  quickAddRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingRight: spacing.md,
  },
  quickAddChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickAddChipActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta + '14',
  },
  quickAddText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickAddTextActive: {
    color: colors.terracotta,
  },

  // Category grid
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryCell: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Expand hint
  expandHint: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  expandHintText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Expanded section
  expandedSection: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 48,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: spacing.sm + 2,
  },

  // Account chips
  accountScroll: {
    flexGrow: 0,
  },
  accountChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  accountChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  accountChipTextActive: {
    color: colors.white,
  },
  accountBalance: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Submit
  submitButton: {
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: spacing.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
