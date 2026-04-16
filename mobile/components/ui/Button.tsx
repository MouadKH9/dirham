import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  onPress: () => void;
  children: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ onPress, children, variant = 'primary', loading = false, disabled = false, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.terracotta} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles]]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 10, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  primary: { backgroundColor: colors.terracotta },
  secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.terracotta },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontSize: 15, fontWeight: '600' },
  primaryLabel: { color: colors.white },
  secondaryLabel: { color: colors.terracotta },
  ghostLabel: { color: colors.terracotta },
  dangerLabel: { color: colors.white },
});
