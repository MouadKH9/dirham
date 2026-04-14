import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme/colors';
import { fontSizes, fontWeights, lineHeights } from '@/lib/theme/typography';

type Variant = 'h1' | 'h2' | 'h3' | 'bodyLarge' | 'body' | 'caption';

interface TextProps {
  variant?: Variant;
  color?: string;
  weight?: keyof typeof fontWeights;
  style?: TextStyle;
  children: React.ReactNode;
  numberOfLines?: number;
}

export function Text({ variant = 'body', color, weight, style, children, numberOfLines }: TextProps) {
  return (
    <RNText
      style={[styles[variant], color ? { color } : undefined, weight ? { fontWeight: fontWeights[weight] } : undefined, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: fontSizes.h1, fontWeight: fontWeights.extrabold, lineHeight: lineHeights.h1, color: colors.textPrimary },
  h2: { fontSize: fontSizes.h2, fontWeight: fontWeights.bold, lineHeight: lineHeights.h2, color: colors.textPrimary },
  h3: { fontSize: fontSizes.h3, fontWeight: fontWeights.semibold, lineHeight: lineHeights.h3, color: colors.textPrimary },
  bodyLarge: { fontSize: fontSizes.bodyLarge, fontWeight: fontWeights.regular, lineHeight: lineHeights.bodyLarge, color: colors.textPrimary },
  body: { fontSize: fontSizes.body, fontWeight: fontWeights.regular, lineHeight: lineHeights.body, color: colors.textPrimary },
  caption: { fontSize: fontSizes.caption, fontWeight: fontWeights.regular, lineHeight: lineHeights.caption, color: colors.textSecondary },
});
