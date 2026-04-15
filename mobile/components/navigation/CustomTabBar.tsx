import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useUIStore } from '@/lib/stores/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

const TAB_BAR_HEIGHT = 60;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  label: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}

const TAB_CONFIGS: TabConfig[] = [
  { name: 'index', label: 'Accueil', icon: 'home-outline', activeIcon: 'home' },
  { name: 'transactions/index', label: 'Transactions', icon: 'list-outline', activeIcon: 'list' },
  { name: 'accounts/index', label: 'Comptes', icon: 'wallet-outline', activeIcon: 'wallet' },
  { name: 'more/index', label: 'Plus', icon: 'ellipsis-horizontal-outline', activeIcon: 'ellipsis-horizontal' },
];

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const openAddTransaction = useUIStore((s) => s.openAddTransaction);

  const totalHeight = TAB_BAR_HEIGHT + insets.bottom;

  // Split tabs: 2 on left, 2 on right (center FAB in between)
  const leftTabs = TAB_CONFIGS.slice(0, 2);
  const rightTabs = TAB_CONFIGS.slice(2, 4);

  const handleTabPress = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;
    const isFocused = state.index === state.routes.indexOf(route);
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleFabPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openAddTransaction();
  };

  const renderTab = (tab: TabConfig) => {
    const route = state.routes.find((r) => r.name === tab.name);
    const isFocused = route ? state.index === state.routes.indexOf(route) : false;
    const iconColor = isFocused ? colors.terracotta : colors.textMuted;

    return (
      <Pressable
        key={tab.name}
        onPress={() => handleTabPress(tab.name)}
        style={styles.tab}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={tab.label}
      >
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.icon}
          size={24}
          color={iconColor}
        />
        <Text style={[styles.tabLabel, { color: iconColor }]}>{tab.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { height: totalHeight, paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        <View style={styles.tabGroup}>
          {leftTabs.map(renderTab)}
        </View>

        {/* FAB spacer */}
        <View style={styles.fabSpacer} />

        <View style={styles.tabGroup}>
          {rightTabs.map(renderTab)}
        </View>
      </View>

      {/* Center FAB */}
      <Pressable
        onPress={handleFabPress}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Ajouter une transaction"
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'relative',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabGroup: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fabSpacer: {
    width: 70,
  },
  fab: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.darkBrown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
