import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme/colors';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard (à venir)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  text: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
