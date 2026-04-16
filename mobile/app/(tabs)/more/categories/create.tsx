import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, Input, Button } from '@/components/ui';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Category, CreateCategoryInput } from '@/lib/types';

type CategoryType = Category['type'];

const EMOJI_OPTIONS = [
  '🍔', '🥗', '🍕', '☕', '🛒', '🚗', '🚌', '🚕',
  '🏠', '💡', '📱', '💊', '🎓', '🏋️', '👔', '✈️',
  '🎬', '🎮', '📚', '💰', '💳', '🏦', '🎁', '🐾',
  '🔧', '💼', '🌿', '⛽',
];

const TYPES: NonNullable<CategoryType>[] = ['expense', 'income', 'bill'];

export default function CreateCategoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const createCategory = useCategoriesStore((s) => s.createCategory);

  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<NonNullable<CategoryType>>('expense');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = nameFr.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      const input: CreateCategoryInput & { type?: NonNullable<CategoryType> } = {
        name_fr: nameFr.trim(),
        name_ar: nameAr.trim() || undefined,
        name_en: nameEn.trim() || undefined,
        icon: selectedEmoji,
        type,
      };
      await createCategory(input);
      router.back();
    } catch {
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Emoji picker */}
          <View style={styles.fieldGroup}>
            <Text variant="caption" style={styles.fieldLabel}>
              {t('categories.icon')}
            </Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[
                    styles.emojiCell,
                    selectedEmoji === emoji && styles.emojiCellActive,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Name FR (required) */}
          <Input
            label={t('categories.nameFr')}
            value={nameFr}
            onChangeText={setNameFr}
            placeholder={t('categories.nameFrPlaceholder')}
            maxLength={100}
            autoFocus
            returnKeyType="next"
          />

          {/* Name AR (optional) */}
          <Input
            label={t('categories.nameAr')}
            value={nameAr}
            onChangeText={setNameAr}
            placeholder=""
            maxLength={100}
            returnKeyType="next"
          />

          {/* Name EN (optional) */}
          <Input
            label={t('categories.nameEn')}
            value={nameEn}
            onChangeText={setNameEn}
            placeholder=""
            maxLength={100}
            returnKeyType="done"
          />

          {/* Type selector */}
          <View style={styles.fieldGroup}>
            <Text variant="caption" style={styles.fieldLabel}>
              {t('transactions.category')}
            </Text>
            <View style={styles.pills}>
              {TYPES.map((typeOption) => (
                <Pressable
                  key={typeOption}
                  style={[styles.pill, type === typeOption && styles.pillActive]}
                  onPress={() => setType(typeOption)}
                >
                  <Text
                    variant="body"
                    style={type === typeOption ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}
                  >
                    {t(`transactions.${typeOption}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Error */}
          {error && (
            <Text variant="caption" color={colors.error}>
              {error}
            </Text>
          )}

          {/* Submit */}
          <Button
            onPress={() => { void handleCreate(); }}
            disabled={!isValid}
            loading={isLoading}
            style={styles.submitButton}
          >
            {t('categories.add')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta + '15',
  },
  emojiText: {
    fontSize: 22,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.white,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
