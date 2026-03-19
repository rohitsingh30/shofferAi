// ShofferAI design tokens — premium dark theme
export const colors = {
  // Backgrounds
  background: '#09090b',
  surface: '#111113',
  surfaceRaised: '#18181b',
  surfaceHover: '#1f1f23',

  // Text
  foreground: '#fafafa',
  secondary: '#a1a1aa',
  tertiary: '#71717a',

  // Brand
  primary: '#7c5cfc',
  primaryMuted: '#6d4de6',
  primaryGlow: 'rgba(124, 92, 252, 0.15)',
  primaryBorder: 'rgba(124, 92, 252, 0.3)',

  // Accents
  accent: '#a78bfa',
  accentPink: '#ec4899',
  accentBlue: '#3b82f6',
  accentCyan: '#06b6d4',

  // Semantic
  success: '#22c55e',
  successMuted: 'rgba(34, 197, 94, 0.15)',
  warning: '#f59e0b',
  warningMuted: 'rgba(245, 158, 11, 0.15)',
  destructive: '#ef4444',
  destructiveMuted: 'rgba(239, 68, 68, 0.12)',

  // UI
  border: '#27272a',
  borderLight: '#3f3f46',
  input: '#18181b',
  userBubble: '#27272a',

  // Gradients (as border/bg combos)
  gradientStart: '#7c5cfc',
  gradientEnd: '#ec4899',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const fontSize = {
  '2xs': 10,
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: '#7c5cfc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
