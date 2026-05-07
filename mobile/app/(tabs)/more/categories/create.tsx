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
import { isAxiosError } from 'axios';

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
  const [name, setName] = useState('');
  const [type, setType] = useState<NonNullable<CategoryType>>('expense');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0;

  const handleCreate = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      const trimmed = name.trim();
      const input: CreateCategoryInput & { type?: NonNullable<CategoryType> } = {
        name_fr: trimmed,
        name_ar: trimmed,
        name_en: trimmed,
        icon: selectedEmoji,
        type,
      };
      await createCategory(input);
      router.back();
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string | string[]>;
        const firstField = Object.values(data)[0];
        const message = Array.isArray(firstField) ? firstField[0] : firstField;
        setError(typeof message === 'string' ? message : t('common.error'));
      } else {
        setError(t('common.error'));
      }
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

          <Input
            label={t('categories.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('categories.namePlaceholder')}
            maxLength={100}
            autoFocus
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
