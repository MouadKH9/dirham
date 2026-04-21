import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

export function InsightsEntryCard() {
  const { t } = useTranslation('dashboard');

  return (
    <Pressable
      onPress={() => router.push('/insights')}
      style={({ pressed }) => [pressed && styles.cardPressed]}
    >
      <Card style={styles.card}>
          <View style={styles.content}>
            <View style={styles.left}>
              <View style={styles.iconContainer}>
                <Ionicons name="bulb-outline" size={18} color={colors.terracotta} />
              </View>
              <View style={styles.textContainer}>
                <Text variant="h3">{t('insightsCard.title')}</Text>
                <Text variant="body" color={colors.textSecondary}>
                  {t('insightsCard.subtitle')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
