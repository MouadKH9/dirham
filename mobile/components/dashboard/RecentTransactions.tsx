import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from '@/components/ui';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import type { Transaction } from '@/lib/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text variant="h3">Transactions récentes</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text variant="caption" color={colors.terracotta} style={styles.viewAll}>
            Voir tout
          </Text>
        </TouchableOpacity>
      </View>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body" color={colors.textSecondary}>
            Aucune transaction
          </Text>
        </View>
      ) : (
        <View>
          {recent.map((transaction, index) => (
            <View key={transaction.id}>
              <TransactionRow transaction={transaction} />
              {index < recent.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewAll: {
    fontWeight: '600',
  },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
