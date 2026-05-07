import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import { ZelligeHeader } from '@/components/ui/ZelligeHeader';
import { Button } from '@/components/ui/Button';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';
import i18n from '@/lib/i18n';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.4;

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
] as const;

const FEATURES = [
  { icon: '⚡', titleKey: 'promoFeature1Title', descKey: 'promoFeature1Desc' },
  { icon: '🔔', titleKey: 'promoFeature2Title', descKey: 'promoFeature2Desc' },
  { icon: '✨', titleKey: 'promoFeature3Title', descKey: 'promoFeature3Desc' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [activeLang, setActiveLang] = React.useState<string>(i18n.language ?? 'fr');

  const handleLanguageChange = async (code: string) => {
    setActiveLang(code);
    await i18n.changeLanguage(code);
    await SecureStore.setItemAsync('dirham_language', code);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ZelligeHeader height={HEADER_HEIGHT} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>{t('welcomeSubtitle')}</Text>
        </View>
      </ZelligeHeader>

      <ScrollView
        contentContainerStyle={styles.body}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Language picker */}
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => handleLanguageChange(lang.code)}
              style={[
                styles.langPill,
                activeLang === lang.code && styles.langPillActive,
              ]}
            >
              <Text
                style={[
                  styles.langLabel,
                  activeLang === lang.code && styles.langLabelActive,
                ]}
              >
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Promo section */}
        <View style={styles.promo}>
          <Text style={[styles.promoHeading, activeLang === 'ar' && styles.textRtl]}>{t('promoHeading')}</Text>
          {FEATURES.map((f) => (
            <View key={f.icon} style={[styles.featureRow, activeLang === 'ar' && styles.featureRowRtl]}>
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, activeLang === 'ar' && styles.textRtl]}>{t(f.titleKey)}</Text>
                <Text style={[styles.featureDesc, activeLang === 'ar' && styles.textRtl]}>{t(f.descKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.buttons}>
          <Button
            onPress={() => router.push('/(auth)/register')}
            variant="primary"
            style={styles.button}
          >
            {t('register')}
          </Button>
          <Button
            onPress={() => router.push('/(auth)/login')}
            variant="secondary"
            style={styles.button}
          >
            {t('login')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    justifyContent: 'flex-end',
  },
  headerContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 120,
    height: 120,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 36,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  langPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  langPillActive: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  langLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langLabelActive: {
    color: colors.white,
  },
  promo: {
    gap: spacing.md,
  },
  promoHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureRowRtl: {
    flexDirection: 'row-reverse',
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  buttons: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});
