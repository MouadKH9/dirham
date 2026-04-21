import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Badge, Card, Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { AIInsight, InsightSeverity, InsightType } from '@/lib/types';

interface InsightCardProps {
  insight: AIInsight;
  onPress?: () => void;
}

const typeIconMap: Record<InsightType, keyof typeof Ionicons.glyphMap> = {
  breakdown: 'pie-chart-outline',
  anomaly: 'warning-outline',
  awareness: 'bulb-outline',
};

const severityColorMap: Record<InsightSeverity, string> = {
  info: colors.border,
  warning: '#D97706',
  critical: colors.terracotta,
};

function formatPeriod(startDate: string, endDate: string, locale: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function InsightCard({ insight, onPress }: InsightCardProps) {
  const { t, i18n } = useTranslation('insights');
  const iconName = typeIconMap[insight.type];
  const accentColor = severityColorMap[insight.severity];

  const periodLabel = useMemo(
    () => formatPeriod(insight.period_start, insight.period_end, i18n.language),
    [insight.period_start, insight.period_end, i18n.language],
  );

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={{ ...styles.card, borderLeftColor: accentColor }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name={iconName} size={16} color={colors.textSecondary} />
            <Badge label={t(`types.${insight.type}`)} />
          </View>

          {!insight.is_read ? <View style={styles.unreadDot} /> : null}
        </View>

        <Text variant="h3" style={styles.title}>
          {insight.title}
        </Text>

        <Text variant="body" color={colors.textSecondary} style={styles.body}>
          {insight.body}
        </Text>

        <View style={styles.footer}>
          <Text variant="caption">{periodLabel}</Text>
          <Text variant="caption" style={styles.severity}>
            {t(`severity.${insight.severity}`)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.9,
  },
  card: {
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.terracotta,
  },
  title: {
    marginBottom: spacing.xs,
  },
  body: {
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severity: {
    textTransform: 'capitalize',
  },
});
