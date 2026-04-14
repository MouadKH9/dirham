import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg';
import { colors } from '@/lib/theme/colors';

interface ZelligeHeaderProps {
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function ZelligeHeader({ height = 200, style, children }: ZelligeHeaderProps) {
  return (
    <View style={[styles.container, { height }, style]}>
      {/* Gradient background */}
      <View style={[StyleSheet.absoluteFillObject, styles.gradient]} />
      {/* Zellige pattern overlay */}
      <Svg
        style={StyleSheet.absoluteFillObject}
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <Pattern id="zellige" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <Path d="M16 0 L32 16 L16 32 L0 16 Z" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.15" />
            <Path d="M16 8 L24 16 L16 24 L8 16 Z" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
          </Pattern>
        </Defs>
        <Rect width="400" height="200" fill="url(#zellige)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.terracotta,
  },
  gradient: {
    // Simulated gradient from terracotta to sand using a diagonal overlay
    backgroundColor: colors.sand,
    opacity: 0.35,
  },
});
