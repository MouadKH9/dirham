import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { EmptyState, ErrorBanner, LoadingState, Text } from '@/components/ui';
import { InsightCard } from '@/components/insights/InsightCard';
import { useInsights } from '@/lib/hooks/useInsights';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { AIInsight } from '@/lib/types';

export default function InsightsScreen() {
  const { t } = useTranslation('insights');
  const { insights, isLoading, isLoadingMore, hasMore, error, refresh, loadMore, markAsRead } = useInsights();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const handleEndReached = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    void loadMore();
  }, [hasMore, isLoadingMore, loadMore]);

  const handlePressInsight = useCallback((id: string) => {
    void markAsRead(id);
  }, [markAsRead]);

  const renderItem = useCallback(
    ({ item }: { item: AIInsight }) => (
      <InsightCard
        insight={item}
        onPress={() => handlePressInsight(item.id)}
      />
    ),
    [handlePressInsight],
  );

  const renderListFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.terracotta} />
      </View>
    );
  }, [isLoadingMore]);

  const renderListEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="💡"
          title={t('empty.title')}
          description={t('empty.description')}
        />
      </View>
    );
  }, [isLoading, t]);

  if (isLoading && insights.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text variant="h2">{t('title')}</Text>
        </View>
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2">{t('title')}</Text>
      </View>

      {error ? (
        <ErrorBanner
          message={t('error')}
          onRetry={() => {
            void refresh();
          }}
        />
      ) : null}

      <FlatList
        data={insights}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          insights.length === 0 ? styles.listContentEmpty : undefined,
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderListEmpty}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
});
