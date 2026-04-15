import React from 'react';
import { useUIStore } from '@/lib/stores/ui';

export function AddTransactionSheet() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isOpen = useUIStore((s) => s.isAddTransactionOpen);
  // Phase 5 will fill this in with the actual bottom sheet
  return null;
}
