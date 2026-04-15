import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
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

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeLang, setActiveLang] = React.useState<string>(i18n.language ?? 'fr');

  const handleLanguageChange = (code: string) => {
    setActiveLang(code);
    i18n.changeLanguage(code);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ZelligeHeader height={HEADER_HEIGHT} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.arabic}>دِرْهَم</Text>
          <Text style={styles.title}>DIRHAM</Text>
          <Text style={styles.tagline}>Gérez vos finances au Maroc</Text>
        </View>
      </ZelligeHeader>

      <ScrollView
        contentContainerStyle={styles.body}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.buttons}>
          <Button
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            style={styles.button}
          >
            Se connecter
          </Button>
          <Button
            onPress={() => router.push('/(auth)/register')}
            variant="secondary"
            style={styles.button}
          >
            Créer un compte
          </Button>
        </View>

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
  arabic: {
    fontSize: 22,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
    fontWeight: '400',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.85,
    textAlign: 'center',
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
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
});
