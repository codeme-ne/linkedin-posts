export const spacing = {
  // Base spacing scale - erweitert für bessere Flexibilität
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
  
  // Component-specific spacing - angepasst an shadcn/ui
  button: {
    paddingX: {
      sm: '0.75rem',   // 12px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
    },
    paddingY: {
      sm: '0.375rem',  // 6px
      md: '0.5rem',    // 8px
      lg: '0.625rem',  // 10px
      xl: '0.75rem',   // 12px
    },
    gap: '0.5rem',     // 8px - space between icon and text
  },
  
  // Card spacing
  card: {
    padding: {
      sm: '1rem',      // 16px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
      xl: '3rem',      // 48px
    },
    gap: '1rem',       // 16px - space between card elements
  },
  
  // Section spacing für Landing Page
  section: {
    paddingY: {
      sm: '3rem',      // 48px
      md: '5rem',      // 80px
      lg: '6rem',      // 96px
      xl: '8rem',      // 128px
    },
    gap: '2rem',       // 32px - space between sections
  },
  
  // Border radius - angepasst an CSS-Variable --radius
  borderRadius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',    // ca. 8px
    DEFAULT: 'calc(var(--radius) - 2px)', // ca. 10px  
    md: 'var(--radius)',                 // 12px (0.75rem)
    lg: 'calc(var(--radius) + 2px)',    // ca. 14px
    xl: 'calc(var(--radius) + 4px)',    // ca. 16px
    '2xl': 'calc(var(--radius) + 8px)', // ca. 20px
    '3xl': 'calc(var(--radius) + 12px)', // ca. 24px
    full: '9999px',
  },
} as const

export type Spacing = typeof spacing