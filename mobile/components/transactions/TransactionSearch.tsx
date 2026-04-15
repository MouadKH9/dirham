import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors } from '@/lib/theme/colors';
import { spacing } from '@/lib/theme/spacing';

interface TransactionSearchProps {
  onSearch: (query: string) => void;
  value: string;
}

export function TransactionSearch({ onSearch, value }: TransactionSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. clearing filters)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(text);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    if (timerRef.current) clearTimeout(timerRef.current);
    onSearch('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={localValue}
        onChangeText={handleChange}
        placeholder="Rechercher..."
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        clearButtonMode="never"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {localValue.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  searchIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
    minHeight: 36,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
