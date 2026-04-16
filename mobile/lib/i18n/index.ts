import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json';

const namespaces = ['common', 'auth', 'transactions', 'accounts', 'categories', 'settings', 'dashboard', 'more'] as const;

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      common: fr.common,
      auth: fr.auth,
      transactions: fr.transactions,
      accounts: fr.accounts,
      categories: fr.categories,
      settings: fr.settings,
      dashboard: fr.dashboard,
      more: fr.more,
    },
    ar: {
      common: ar.common,
      auth: ar.auth,
      transactions: ar.transactions,
      accounts: ar.accounts,
      categories: ar.categories,
      settings: ar.settings,
      dashboard: ar.dashboard,
      more: ar.more,
    },
    en: {
      common: en.common,
      auth: en.auth,
      transactions: en.transactions,
      accounts: en.accounts,
      categories: en.categories,
      settings: en.settings,
      dashboard: en.dashboard,
      more: en.more,
    },
  },
  lng: 'fr',
  fallbackLng: 'fr',
  ns: namespaces,
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
