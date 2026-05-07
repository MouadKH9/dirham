import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { useSettingsStore } from '@/lib/stores/settings';
import {
  LEGAL_HOSTED_URLS,
  getLegalContent,
  type LegalDocId,
} from '@/lib/legal';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

export default function LegalScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ doc?: string }>();
  const language = useSettingsStore((s) => s.language);

  const doc: LegalDocId = params.doc === 'terms' ? 'terms' : 'privacy';
  const content = useMemo(() => getLegalContent(doc, language), [doc, language]);
  const headerTitle =
    doc === 'terms' ? t('settings.termsOfService') : t('settings.privacyPolicy');

  const openOnline = () => {
    void Linking.openURL(LEGAL_HOSTED_URLS[doc]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: headerTitle }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h2" style={styles.title}>
          {headerTitle}
        </Text>

        <Text variant="body" style={styles.body}>
          {content}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
          onPress={openOnline}
        >
          <Ionicons name="open-outline" size={16} color={colors.terracotta} />
          <Text variant="caption" style={styles.linkText}>
            {t('settings.viewOnline')}
          </Text>
        </Pressable>

        <View style={styles.spacer} />
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
  title: {
    color: colors.textPrimary,
  },
  body: {
    color: colors.textPrimary,
    lineHeight: 22,
    fontSize: 14,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  linkRowPressed: {
    opacity: 0.6,
  },
  linkText: {
    color: colors.terracotta,
    fontWeight: '600',
  },
  spacer: {
    height: spacing.xl,
  },
});
