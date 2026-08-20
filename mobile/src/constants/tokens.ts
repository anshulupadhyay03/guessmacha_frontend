export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

/** Durations in ms — use with Animated / Reanimated timing configs. */
export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  celebratory: 700,
};

export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modal: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  fab: {
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};

export const zIndex = {
  base: 0,
  card: 10,
  header: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
};

export const tokens = { spacing, radius, motion, elevation, zIndex };

export default tokens;