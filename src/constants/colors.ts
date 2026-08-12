/**
 * colors.ts
 * Dark-mode-first palette for "Guess It".
 * Access via `colors` (defaults to dark) or `themes.dark` / `themes.light` for theme-aware components.
 */

export const darkColors = {
  bg: {
    base: '#0E1015',
    surface: '#171A21',
    surfaceRaised: '#20242E',
    overlay: 'rgba(0,0,0,0.6)',
  },
  accent: {
    primary: '#6C5CE7',
    primaryMuted: '#4A3FAD',
    secondary: '#00D9C0',
    ranked: '#FF7A59',
  },
  text: {
    primary: '#F5F6FA',
    secondary: '#9AA0B4',
    disabled: '#5B6072',
    inverse: '#0E1015',
  },
  border: {
    subtle: '#262B36',
    strong: '#343B4A',
  },
  state: {
    success: '#3DD68C',
    error: '#FF5C5C',
    warning: '#FFC857',
    info: '#5CA8FF',
  },
  overlay: {
    scrim: 'rgba(14,16,21,0.72)',
  },
} as const;

export const lightColors = {
  bg: {
    base: '#F7F7FB',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.35)',
  },
  accent: {
    primary: '#6C5CE7',
    primaryMuted: '#8377EE',
    secondary: '#00A896',
    ranked: '#FF7A59',
  },
  text: {
    primary: '#14161B',
    secondary: '#5A5F70',
    disabled: '#A6ABB9',
    inverse: '#F7F7FB',
  },
  border: {
    subtle: '#E7E8EE',
    strong: '#D3D5E0',
  },
  state: {
    success: '#1FAE6F',
    error: '#E0453F',
    warning: '#C98A0F',
    info: '#2E7BD6',
  },
  overlay: {
    scrim: 'rgba(20,22,27,0.4)',
  },
} as const;

export type ColorTheme = {
  [Section in keyof typeof darkColors]: {
    [Token in keyof (typeof darkColors)[Section]]: string;
  };
};

export const themes: Record<'dark' | 'light', ColorTheme> = {
  dark: darkColors,
  light: lightColors,
};

// Default export used by most components (Dark Mode is the default per design brief).
export const colors = darkColors;

export default colors;
