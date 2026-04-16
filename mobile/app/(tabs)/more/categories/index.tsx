import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

import { Text, Card, LoadingState, EmptyState } from '@/components/ui';
import { useCategoriesStore } from '@/lib/stores/categories';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Category } from '@/lib/types';

function getLocalizedName(category: Category): string {
  const lang = i18n.language;
  if (lang === 'ar' && category.name_ar) return category.name_ar;
  if (lang === 'en' && category.name_en) return category.name_en;
  return category.name_fr || category.name;
}

function typeBadgeLabel(type: Category['type'], t: (key: string) => string): string {
  switch (type) {
    case 'income': return t('transactions.income');
    case 'expense': return t('transactions.expense');
    case 'bill': return t('transactions.bill');
    default: return '—';
  }
}

function typeBadgeColor(type: Category['type']): string {
  switch (type) {
    case 'income': return colors.emerald;
    case 'expense': return colors.terracotta;
    case 'bill': return colors.gold;
    default: return colors.textMuted;
  }
}

interface CategoryRowProps {
  category: Category;
  t: (key: string) => string;
}

function CategoryRow({ category, t }: CategoryRowProps) {
  const label = typeBadgeLabel(category.type, t);
  const badgeColor = typeBadgeColor(category.type);

  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{category.icon}</Text>
      <View style={styles.rowInfo}>
        <Text variant="body" style={styles.rowName}>
          {getLocalizedName(category)}
        </Text>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
        <Text style={styles.typeBadgeText} color={badgeColor}>{label}</Text>
      </View>
    </View>
  );
}

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();

  const categories = useCategoriesStore((s) => s.categories);
  const isLoading = useCategoriesStore((s) => s.isLoading);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  useFocusEffect(
    useCallback(() => {
      void fetchCategories();
    }, [fetchCategories]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push('/(tabs)/more/categories/create')}
          style={styles.headerButton}
          hitSlop={8}
        >
          <Ionicons name="add" size={26} color={colors.terracotta} />
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const systemCategories = categories.filter((c) => c.is_system);
  const customCategories = categories.filter((c) => !c.is_system);

  if (isLoading && categories.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* System categories */}
        {systemCategories.length > 0 && (
          <View style={styles.section}>
            <Text variant="caption" style={styles.sectionTitle}>
              {t('categories.system')}
            </Text>
            <Card style={styles.listCard}>
              {systemCategories.map((cat, idx) => (
                <View key={cat.id}>
                  <CategoryRow category={cat} t={t} />
                  {idx < systemCategories.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Custom categories */}
        {customCategories.length > 0 && (
          <View style={styles.section}>
            <Text variant="caption" style={styles.sectionTitle}>
              {t('categories.custom')}
            </Text>
            <Card style={styles.listCard}>
              {customCategories.map((cat, idx) => (
                <View key={cat.id}>
                  <CategoryRow category={cat} t={t} />
                  {idx < customCategories.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </Card>
          </View>
        )}

        {!isLoading && categories.length === 0 && (
          <EmptyState
            icon="🗂️"
            title={t('categories.emptyTitle')}
            description={t('categories.add')}
            actionLabel={t('categories.create')}
            onAction={() => router.push('/(tabs)/more/categories/create')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  typeBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 32 + spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  headerButton: {
    paddingRight: spacing.sm,
  },
});
