import type { Category } from '@/lib/types';

export type QuickAddPresetId = 'cafe' | 'taxi' | 'groceries' | 'transport';
export type QuickAddTransactionType = 'expense' | 'income';

export interface QuickAddPreset {
  id: QuickAddPresetId;
  labelKey: string;
  emoji: string;
  type: QuickAddTransactionType;
  defaultAmount?: string;
  keywords: {
    fr: string[];
    ar: string[];
    en: string[];
  };
}

export const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  {
    id: 'cafe',
    labelKey: 'transactions.quickAdd.cafe',
    emoji: '☕',
    type: 'expense',
    defaultAmount: '15',
    keywords: {
      fr: ['cafe', 'caf'],
      ar: ['مقهى', 'قهوة'],
      en: ['cafe', 'coffee'],
    },
  },
  {
    id: 'taxi',
    labelKey: 'transactions.quickAdd.taxi',
    emoji: '🚕',
    type: 'expense',
    defaultAmount: '20',
    keywords: {
      fr: ['taxi'],
      ar: ['طاكسي', 'تاكسي'],
      en: ['taxi'],
    },
  },
  {
    id: 'groceries',
    labelKey: 'transactions.quickAdd.groceries',
    emoji: '🛒',
    type: 'expense',
    defaultAmount: '100',
    keywords: {
      fr: ['alimentation', 'courses', 'supermarche', 'épicerie', 'epicerie'],
      ar: ['بقالة', 'مواد غذائية', 'طعام'],
      en: ['groceries', 'food'],
    },
  },
  {
    id: 'transport',
    labelKey: 'transactions.quickAdd.transport',
    emoji: '🚌',
    type: 'expense',
    defaultAmount: '10',
    keywords: {
      fr: ['transport', 'bus', 'tram'],
      ar: ['نقل', 'حافلة', 'ترام'],
      en: ['transport', 'bus', 'tram'],
    },
  },
];

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function resolvePresetCategoryId(categories: Category[], preset: QuickAddPreset): string | null {
  const checks = [
    ...preset.keywords.fr,
    ...preset.keywords.ar,
    ...preset.keywords.en,
  ].map(normalize);

  const candidates = categories.filter((category) => category.type === 'expense' || category.type === 'bill' || !category.type);

  for (const category of candidates) {
    const fields = [category.name, category.name_fr, category.name_ar, category.name_en]
      .filter(Boolean)
      .map((value) => normalize(value));

    if (fields.some((value) => checks.some((keyword) => value.includes(keyword)))) {
      return category.id;
    }
  }

  return null;
}
