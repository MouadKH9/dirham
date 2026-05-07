import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

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
  const user = useAuthStore((s) => s.user);
  const setAiInsightsEnabled = useAuthStore((s) => s.setAiInsightsEnabled);
  const language = useSettingsStore((s) => s.language);
  const currencyDisplay = useSettingsStore((s) => s.currencyDisplay);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setCurrencyDisplay = useSettingsStore((s) => s.setCurrencyDisplay);
  const [aiToggling, setAiToggling] = useState(false);

  const handleLanguageSelect = useCallback(async (lang: Language) => {
    await setLanguage(lang);
    if (lang === 'ar') {
      Alert.alert(
        t('settings.restartRequired'),
        t('settings.restartMessage'),
      );
    }
  }, [setLanguage, t]);

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

  const performAiToggle = useCallback(async (next: boolean) => {
    setAiToggling(true);
    try {
      await setAiInsightsEnabled(next);
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setAiToggling(false);
    }
  }, [setAiInsightsEnabled, t]);

  const handleAiToggle = useCallback((next: boolean) => {
    if (next) {
      Alert.alert(
        t('settings.aiInsights'),
        t('settings.aiInsightsDescription'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: () => { void performAiToggle(true); },
          },
        ],
      );
    } else {
      void performAiToggle(false);
    }
  }, [performAiToggle, t]);

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
                  onPress={() => { void handleLanguageSelect(code); }}
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

        {/* AI insights section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('settings.aiInsights')}
          </Text>
          <Card style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Text variant="body" style={styles.toggleTitle}>
                  {t('settings.aiInsights')}
                </Text>
                <Text variant="caption" style={styles.toggleDescription}>
                  {t('settings.aiInsightsDescription')}
                </Text>
              </View>
              <Switch
                value={user?.ai_insights_enabled ?? false}
                onValueChange={handleAiToggle}
                disabled={aiToggling}
                trackColor={{ false: colors.border, true: colors.terracotta }}
                thumbColor={colors.white}
              />
            </View>
            <Pressable
              style={({ pressed }) => [styles.learnMoreRow, pressed && styles.learnMorePressed]}
              onPress={() => router.push('/(tabs)/more/legal?doc=privacy')}
            >
              <Ionicons name="information-circle-outline" size={16} color={colors.terracotta} />
              <Text variant="caption" style={styles.learnMoreText}>
                {t('settings.aiInsightsLearnMore')}
              </Text>
            </Pressable>
          </Card>
        </View>

        {/* Legal section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('settings.sectionLegal')}
          </Text>
          <Card style={styles.linkCard}>
            <Pressable
              style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
              onPress={() => router.push('/(tabs)/more/legal?doc=privacy')}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.terracotta} />
                <Text variant="body" style={styles.linkLabel}>
                  {t('settings.privacyPolicy')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
              onPress={() => router.push('/(tabs)/more/legal?doc=terms')}
            >
              <View style={styles.linkRowLeft}>
                <Ionicons name="document-text-outline" size={18} color={colors.terracotta} />
                <Text variant="body" style={styles.linkLabel}>
                  {t('settings.termsOfService')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </Card>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('more.sectionAccount')}
          </Text>
          <Button onPress={handleLogout} variant="danger">
            {t('auth.logout')}
          </Button>
          <Pressable
            style={({ pressed }) => [styles.deleteRow, pressed && styles.deleteRowPressed]}
            onPress={() => router.push('/(tabs)/more/delete-account')}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text variant="body" style={styles.deleteLabel}>
              {t('deleteAccount.title')}
            </Text>
          </Pressable>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleLabel: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  toggleDescription: {
    color: colors.textSecondary,
    lineHeight: 18,
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingTop: spacing.xs,
  },
  learnMorePressed: {
    opacity: 0.6,
  },
  learnMoreText: {
    color: colors.terracotta,
    fontWeight: '600',
  },
  linkCard: {
    padding: 0,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  linkRowPressed: {
    backgroundColor: colors.cream,
  },
  linkRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkLabel: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  deleteRowPressed: {
    opacity: 0.7,
  },
  deleteLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
