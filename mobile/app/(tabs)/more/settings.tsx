import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, Card, Button } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { useSettingsStore } from '@/lib/stores/settings';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

type Language = 'fr' | 'ar' | 'en';
type CurrencyDisplay = 'MAD' | 'DH';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

const CURRENCY_OPTIONS: { value: CurrencyDisplay; labelKey: string }[] = [
  { value: 'MAD', labelKey: 'settings.currencyMAD' },
  { value: 'DH', labelKey: 'settings.currencyDH' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const language = useSettingsStore((s) => s.language);
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setCurrencyDisplay = useSettingsStore((s) => s.setCurrencyDisplay);

  const handleLanguageSelect = (lang: Language) => {
    void setLanguage(lang);
    if (lang === 'ar') {
      Alert.alert(
        t('settings.restartRequired'),
        t('settings.restartMessage'),
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: () => {
            void logout().then(() => {
              router.replace('/(auth)/welcome');
            });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Language section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('settings.language')}
          </Text>
          <Card style={styles.card}>
            <View style={styles.pills}>
              {LANGUAGES.map(({ code, label }) => (
                <Pressable
                  key={code}
                  style={[styles.pill, language === code && styles.pillActive]}
                  onPress={() => handleLanguageSelect(code)}
                >
                  <Text
                    variant="body"
                    style={language === code ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {language === 'ar' && (
              <Text variant="caption" style={styles.note}>
                {t('settings.restartMessage')}
              </Text>
            )}
          </Card>
        </View>

        {/* Currency display section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('settings.currencyDisplay')}
          </Text>
          <Card style={styles.card}>
            <View style={styles.pills}>
              {CURRENCY_OPTIONS.map(({ value, labelKey }) => (
                <Pressable
                  key={value}
                  style={[styles.pill, currencyDisplay === value && styles.pillActive]}
                  onPress={() => { void setCurrencyDisplay(value); }}
                >
                  <Text
                    variant="body"
                    style={currencyDisplay === value ? { ...styles.pillLabel, ...styles.pillLabelActive } : styles.pillLabel}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            Compte
          </Text>
          <Button onPress={handleLogout} variant="danger">
            {t('auth.logout')}
          </Button>
        </View>

        {/* Version */}
        <Text variant="caption" style={styles.version}>
          {t('settings.version')} — Dirham v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  card: {
    gap: spacing.sm,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderColor: colors.terracotta,
    backgroundColor: colors.terracotta,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.white,
  },
  note: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
