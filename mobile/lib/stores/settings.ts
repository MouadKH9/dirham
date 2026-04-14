import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import i18n from '@/lib/i18n';
import { setApiLanguage } from '@/lib/api/client';

type Language = 'fr' | 'ar' | 'en';
type CurrencyDisplay = 'MAD' | 'DH';

interface SettingsState {
  language: Language;
  currencyDisplay: CurrencyDisplay;

  setLanguage: (lang: Language) => Promise<void>;
  setCurrencyDisplay: (display: CurrencyDisplay) => void;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = 'dirham_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'fr',
  currencyDisplay: 'MAD',

  loadSettings: async () => {
    try {
      const saved = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved) as Partial<SettingsState>;
        if (settings.language) {
          set({ language: settings.language });
          i18n.changeLanguage(settings.language);
          setApiLanguage(settings.language);
        }
        if (settings.currencyDisplay) set({ currencyDisplay: settings.currencyDisplay });
      }
    } catch {
      // Use defaults on error
    }
  },

  setLanguage: async (lang) => {
    set({ language: lang });
    await i18n.changeLanguage(lang);
    setApiLanguage(lang);
    const { currencyDisplay } = get();
    await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify({ language: lang, currencyDisplay }));
  },

  setCurrencyDisplay: (display) => {
    set({ currencyDisplay: display });
    const { language } = get();
    SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify({ language, currencyDisplay: display }));
  },
}));
