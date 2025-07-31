export const colors = {
  // Primary colors
  primary: {
    DEFAULT: '#8B5CF6', // Lila für Hauptaktionen (Speichern)
    hover: '#7C3AED',
    active: '#6D28D9',
    light: '#A78BFA',
    dark: '#5B21B6',
  },
  
  // LinkedIn brand color
  linkedin: {
    DEFAULT: '#0077B5', // LinkedIn Blau
    hover: '#006097',
    active: '#004C7A',
    light: '#0A9CE6',
    dark: '#005885',
  },
  
  // Secondary colors
  secondary: {
    DEFAULT: '#6B7280', // Grau für sekundäre Aktionen
    hover: '#4B5563',
    active: '#374151',
    light: '#9CA3AF',
    dark: '#1F2937',
  },
  
  // Destructive colors
  destructive: {
    DEFAULT: '#EF4444', // Rot für Lösch-Aktionen
    hover: '#DC2626',
    active: '#B91C1C',
    light: '#F87171',
    dark: '#991B1B',
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  
  // Border colors
  border: {
    DEFAULT: '#E5E7EB',
    light: '#F3F4F6',
    dark: '#D1D5DB',
  },
} as const

export type Colors = typeof colors