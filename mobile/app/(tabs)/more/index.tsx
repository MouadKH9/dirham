import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Text, Card } from '@/components/ui';
import { useAuthStore } from '@/lib/stores/auth';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuRow({ icon, label, onPress, danger = false }: MenuRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <View style={styles.menuRowLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons
            name={icon}
            size={20}
            color={danger ? colors.error : colors.terracotta}
          />
        </View>
        <Text variant="body" style={danger ? styles.dangerLabel : styles.menuLabel}>
          {label}
        </Text>
      </View>
      {!danger && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function MoreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <Text variant="h2" style={styles.screenTitle}>
          {t('more.title')}
        </Text>

        {/* User card */}
        <Card style={styles.userCard}>
          <View style={styles.userCardInner}>
            <View style={styles.avatar}>
              <Text variant="h2" style={styles.avatarText}>
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text variant="body" style={styles.userEmail}>
                {user?.email ?? '—'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Gestion section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('more.sectionManagement')}
          </Text>
          <Card style={styles.menuCard}>
            <MenuRow
              icon="grid-outline"
              label={t('categories.title')}
              onPress={() => router.push('/(tabs)/more/categories')}
            />
            <MenuRow
              icon="repeat-outline"
              label={t('bills.title')}
              onPress={() => router.push('/(tabs)/more/bills')}
            />
          </Card>
        </View>

        {/* Préférences section */}
        <View style={styles.section}>
          <Text variant="caption" style={styles.sectionTitle}>
            {t('more.sectionPreferences')}
          </Text>
          <Card style={styles.menuCard}>
            <MenuRow
              icon="settings-outline"
              label={t('settings.title')}
              onPress={() => router.push('/(tabs)/more/settings')}
            />
          </Card>
        </View>

        {/* Logout */}
        <Card style={styles.menuCard}>
          <MenuRow
            icon="log-out-outline"
            label={t('auth.logout')}
            onPress={handleLogout}
            danger
          />
        </Card>

        {/* App version */}
        <Text variant="caption" style={styles.version}>
          Dirham v1.0.0
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
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  screenTitle: {
    marginBottom: spacing.xs,
  },
  userCard: {
    marginBottom: spacing.sm,
  },
  userCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: colors.textPrimary,
    fontWeight: '600',
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
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuRowPressed: {
    backgroundColor: colors.cream,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDanger: {
    backgroundColor: '#FFF0F0',
  },
  menuLabel: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dangerLabel: {
    color: colors.error,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
