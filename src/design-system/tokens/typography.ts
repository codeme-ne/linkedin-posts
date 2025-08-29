export const typography = {
  // Font families - angepasst an aktuelles System
  fontFamily: {
    sans: [
      'Inter', 
      'ui-sans-serif', 
      'system-ui', 
      '-apple-system', 
      'BlinkMacSystemFont',
      '"Segoe UI"', 
      'Roboto', 
      '"Helvetica Neue"',
      'Arial', 
      'sans-serif'
    ],
    mono: [
      'JetBrains Mono', 
      '"Fira Code"',
      'Consolas',
      '"Courier New"',
      'ui-monospace', 
      'monospace'
    ],
  },
  
  // Font sizes - erweitert für bessere Hierarchie
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  // Font weights - erweitert
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights - angepasst an moderne Standards
  lineHeight: {
    none: '1',
    tight: '1.25',      // Für Headlines
    snug: '1.375',      // Für Subheadlines
    normal: '1.5',      // Standard für Body Text
    relaxed: '1.625',   // Für längere Texte
    loose: '2',         // Für sehr lockere Texte
    3: '0.75rem',       // 12px
    4: '1rem',          // 16px
    5: '1.25rem',       // 20px
    6: '1.5rem',        // 24px
    7: '1.75rem',       // 28px
    8: '2rem',          // 32px
    9: '2.25rem',       // 36px
    10: '2.5rem',       // 40px
  },
  
  // Letter spacing - erweitert
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  // Text decoration
  textDecoration: {
    none: 'none',
    underline: 'underline',
    'line-through': 'line-through',
  },
  
  // Text transform
  textTransform: {
    none: 'none',
    capitalize: 'capitalize',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
  },
} as const

export type Typography = typeof typography