import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, AmountText } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import { useSettingsStore } from '@/lib/stores/settings';
import type { Account } from '@/lib/types';

interface AccountPillsProps {
  accounts: Account[];
  onAccountPress: (id: string) => void;
  onViewAll?: () => void;
}

const CARD_WIDTH = 220;
const CARD_HEIGHT = 116;

export function AccountPills({ accounts, onAccountPress, onViewAll }: AccountPillsProps) {
  const { t } = useTranslation('dashboard');
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);

  const isSingle = accounts.length === 1;

  const items = useMemo(() => accounts, [accounts]);

  if (items.length === 0) return null;

  const renderCard = (account: Account, stretch: boolean) => {
    const typeLabel =
      account.type === 'synced'
        ? t('accountTypeSynced')
        : t('accountTypeManual');

    return (
      <TouchableOpacity
        key={account.id}
        style={[styles.card, stretch ? styles.cardStretch : styles.cardFixed]}
        onPress={() => onAccountPress(account.id)}
        activeOpacity={0.85}
      >
        {/* Vertical zellige-inspired accent stripe */}
        <View style={styles.accent} />

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <View style={styles.dot} />
            <Text
              variant="caption"
              color={colors.textSecondary}
              style={styles.typeLabel}
              numberOfLines={1}
            >
              {typeLabel}
            </Text>
            <Text
              variant="caption"
              color={colors.textMuted}
              style={styles.currencyChip}
              numberOfLines={1}
            >
              {account.currency}
            </Text>
          </View>

          <Text variant="h3" numberOfLines={1} style={styles.name}>
            {account.name}
          </Text>

          <AmountText
            amount={account.balance}
            type="neutral"
            currencyDisplay={currencyDisplay}
            variant="medium"
            style={styles.balance}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text variant="h3">{t('myAccounts')}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text variant="caption" color={colors.terracotta} style={styles.viewAll}>
              {t('viewAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isSingle ? (
        <View style={styles.singleRow}>{renderCard(items[0], true)}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + spacing.sm}
          snapToAlignment="start"
        >
          {items.map((acc) => renderCard(acc, false))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  viewAll: {
    fontWeight: '600',
  },

  // Layouts
  singleRow: {
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  // Card
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#2D1810',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardFixed: {
    width: CARD_WIDTH,
  },
  cardStretch: {
    alignSelf: 'stretch',
  },
  accent: {
    width: 4,
    backgroundColor: colors.terracotta,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginRight: spacing.xs,
  },
  typeLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    fontSize: 10,
    flexShrink: 1,
  },
  currencyChip: {
    marginLeft: 'auto',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    fontSize: 10,
  },

  name: {
    marginTop: spacing.xs,
  },
  balance: {
    color: colors.textPrimary,
  },
});
