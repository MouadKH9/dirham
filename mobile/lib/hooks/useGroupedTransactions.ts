import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';

export interface TransactionSection {
  title: string;
  date: string;
  dailyTotal: string;
  data: Transaction[];
}

function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getYesterdayString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatSectionTitle(date: string): string {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  if (date === today) return "Aujourd'hui";
  if (date === yesterday) return 'Hier';
  return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function computeDailyTotal(transactions: Transaction[]): string {
  let total = 0;
  for (const t of transactions) {
    const amount = parseFloat(t.amount);
    if (isNaN(amount)) continue;
    if (t.type === 'income') {
      total += amount;
    } else {
      total -= amount;
    }
  }
  return total.toFixed(2);
}

export function useGroupedTransactions(transactions: Transaction[]): TransactionSection[] {
  return useMemo(() => {
    const map = new Map<string, Transaction[]>();

    for (const t of transactions) {
      const existing = map.get(t.date);
      if (existing) {
        existing.push(t);
      } else {
        map.set(t.date, [t]);
      }
    }

    const sections: TransactionSection[] = Array.from(map.entries()).map(([date, data]) => ({
      title: formatSectionTitle(date),
      date,
      dailyTotal: computeDailyTotal(data),
      data,
    }));

    // Sort newest first
    sections.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    return sections;
  }, [transactions]);
}
