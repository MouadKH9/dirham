import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, EmptyState, LoadingState, Text } from '@/components/ui';
import { useBillsStore } from '@/lib/stores/bills';
import { useCategoriesStore } from '@/lib/stores/categories';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { RecurringBill } from '@/lib/types';

function formatAmount(amount: string, currencyDisplay: string): string {
  const parsed = parseFloat(amount || '0');
  return `${parsed.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyDisplay}`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString();
}

export default function BillsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const bills = useBillsStore((s) => s.bills);
  const hasMore = useBillsStore((s) => s.hasMore);
  const isLoading = useBillsStore((s) => s.isLoading);
  const isLoadingMore = useBillsStore((s) => s.isLoadingMore);
  const fetchBills = useBillsStore((s) => s.fetchBills);
  const loadMore = useBillsStore((s) => s.loadMore);
  const updateBill = useBillsStore((s) => s.updateBill);
  const deleteBill = useBillsStore((s) => s.deleteBill);

  const categories = useCategoriesStore((s) => s.categories);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([fetchBills(true), fetchCategories()]);
    }, [fetchBills, fetchCategories]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => router.push('/(tabs)/more/bills/create')}
          style={styles.headerButton}
          hitSlop={8}
        >
          <Ionicons name="add" size={26} color={colors.terracotta} />
        </Pressable>
      ),
    });
  }, [navigation, router]);

  const categoryNames = useMemo(() => {
    return new Map(
      categories.map((category) => {
        const lang = i18n.language.split('-')[0];
        const localized = lang === 'ar'
          ? category.name_ar
          : lang === 'en'
            ? category.name_en
            : category.name_fr;
        return [category.id, localized || category.name || category.name_fr];
      }),
    );
  }, [categories, i18n.language]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchBills(true);
    setIsRefreshing(false);
  }, [fetchBills]);

  const handleToggleActive = useCallback(
    async (bill: RecurringBill, value: boolean) => {
      await updateBill(bill.id, { is_active: value });
    },
    [updateBill],
  );

  const handleDelete = useCallback(
    (bill: RecurringBill) => {
      Alert.alert(
        t('bills.deleteTitle'),
        t('bills.deleteMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => {
              void deleteBill(bill.id);
            },
          },
        ],
      );
    },
    [deleteBill, t],
  );

  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    void loadMore();
  }, [hasMore, isLoadingMore, loadMore]);

  const renderBill = useCallback(
    ({ item }: { item: RecurringBill }) => (
      <Card style={styles.billCard}>
        <View style={styles.billHeader}>
          <View style={styles.billInfo}>
            <Text variant="h3">{item.name}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {categoryNames.get(item.category) || t('categories.title')}
            </Text>
          </View>
          <Switch
            value={item.is_active}
            onValueChange={(value) => {
              void handleToggleActive(item, value);
            }}
            trackColor={{ false: colors.border, true: colors.terracotta + '55' }}
            thumbColor={item.is_active ? colors.terracotta : colors.textMuted}
          />
        </View>

        <View style={styles.metaRow}>
          <Text variant="body">{formatAmount(item.amount, currencyDisplay)}</Text>
          <Text variant="caption">{t(`bills.frequency.${item.frequency}`)}</Text>
        </View>
        <Text variant="caption" color={colors.textSecondary}>
          {t('bills.nextDueDate')}: {formatDate(item.next_due_date)}
        </Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={() => router.push(`/(tabs)/more/bills/${item.id}`)}>
            <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
            <Text variant="caption">{t('common.edit')}</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => handleDelete(item)}>
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text variant="caption" color={colors.error}>{t('common.delete')}</Text>
          </Pressable>
        </View>
      </Card>
    ),
    [categoryNames, currencyDisplay, handleDelete, handleToggleActive, router, t],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.terracotta} />
      </View>
    );
  }, [isLoadingMore]);

  if (isLoading && bills.length === 0) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={renderBill}
        contentContainerStyle={[
          styles.content,
          bills.length === 0 ? styles.emptyContent : undefined,
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={(
          <EmptyState
            icon="📅"
            title={t('bills.emptyTitle')}
            description={t('bills.emptyDescription')}
            actionLabel={t('bills.add')}
            onAction={() => router.push('/(tabs)/more/bills/create')}
          />
        )}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => { void handleRefresh(); }}
            tintColor={colors.terracotta}
            colors={[colors.terracotta]}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
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
  emptyContent: {
    flexGrow: 1,
  },
  billCard: {
    gap: spacing.xs,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  headerButton: {
    paddingRight: spacing.sm,
  },
});
