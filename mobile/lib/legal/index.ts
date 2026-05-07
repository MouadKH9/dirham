import type { LegalDocId, Locale } from './types';
import { privacyContent } from './privacy';
import { termsContent } from './terms';

export const LEGAL_HOSTED_URLS: Record<LegalDocId, string> = {
  privacy: 'https://dirham.app/privacy',
  terms: 'https://dirham.app/terms',
};

export function getLegalContent(doc: LegalDocId, locale: Locale): string {
  const content = doc === 'privacy' ? privacyContent : termsContent;
  return content[locale] ?? content.en;
}

export type { LegalDocId, Locale } from './types';
