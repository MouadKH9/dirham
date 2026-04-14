export const colors = {
  // Brand
  terracotta: '#C45E3E',
  gold: '#E8C87A',
  sand: '#D4956B',
  emerald: '#2C5F4A',
  darkBrown: '#2D1810',
  cream: '#FBF7F0',

  // Semantic
  income: '#2C5F4A',
  expense: '#C45E3E',

  // Text
  textPrimary: '#2D1810',
  textSecondary: '#8B7355',
  textMuted: '#B8A88A',

  // Surfaces
  background: '#FBF7F0',
  surface: '#FFFFFF',
  border: '#F0E6D8',
  cardBorder: '#F0E6D8',

  // States
  error: '#D32F2F',
  success: '#2C5F4A',

  white: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
