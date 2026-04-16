import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      <View style={styles.actions}>
        {onRetry && (
          <Pressable onPress={onRetry} style={styles.retryButton} hitSlop={8}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        )}
        <Pressable onPress={() => setDismissed(true)} style={styles.dismissButton} hitSlop={8}>
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.terracotta,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  retryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 2,
  },
  dismissText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
