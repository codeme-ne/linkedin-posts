export const colors = {
  // Primary colors - angepasst an aktuelles Theme (Violett)
  primary: {
    DEFAULT: 'hsl(262 83% 58%)', // Hauptfarbe aus CSS-Variablen
    hover: 'hsl(262 83% 52%)',
    active: 'hsl(262 83% 46%)',
    light: 'hsl(262 83% 68%)',
    dark: 'hsl(262 83% 40%)',
    foreground: 'hsl(210 40% 98%)',
  },
  
  // Accent colors - angepasst an aktuelles Theme (Blau)
  accent: {
    DEFAULT: 'hsl(217 91% 60%)', // Akzentfarbe aus CSS-Variablen
    hover: 'hsl(217 91% 54%)',
    active: 'hsl(217 91% 48%)',
    light: 'hsl(217 91% 70%)',
    dark: 'hsl(217 91% 42%)',
    foreground: 'hsl(210 40% 98%)',
  },
  
  // Claude AI brand color - bestehend aus ContentFlowGraphic
  claude: {
    DEFAULT: '#D97757', // Claude AI Markenfarbe
    hover: '#C56649',
    active: '#B15A3F',
    light: '#E88A6A',
    dark: '#A84A35',
  },
  
  // LinkedIn brand color
  linkedin: {
    DEFAULT: '#0A66C2', // LinkedIn Blau
    hover: '#084E99',
    active: '#063A70',
    light: '#3B82E6',
    dark: '#042847',
  },
  
  // Secondary colors - angepasst an shadcn/ui
  secondary: {
    DEFAULT: 'hsl(210 40% 96%)', // Sekundäre Hintergrundfarbe
    hover: 'hsl(210 40% 92%)',
    active: 'hsl(210 40% 88%)',
    foreground: 'hsl(222.2 84% 4.9%)',
  },
  
  // Muted colors - für weniger wichtige Elemente
  muted: {
    DEFAULT: 'hsl(210 40% 96%)',
    foreground: 'hsl(215.4 16.3% 46.9%)',
  },
  
  // Destructive colors
  destructive: {
    DEFAULT: 'hsl(0 84.2% 60.2%)', // Rot für Lösch-Aktionen
    hover: 'hsl(0 84.2% 54%)',
    active: 'hsl(0 84.2% 48%)',
    light: 'hsl(0 84.2% 70%)',
    dark: 'hsl(0 62.8% 30.6%)',
    foreground: 'hsl(0 0% 98%)',
  },
  
  // Base colors - angepasst an CSS-Variablen
  background: {
    DEFAULT: 'hsl(210 40% 98%)', // Haupthintergrund
    secondary: 'hsl(210 40% 96%)', // Sekundärer Hintergrund
    tertiary: 'hsl(210 40% 94%)', // Tertiärer Hintergrund
  },
  
  foreground: {
    DEFAULT: 'hsl(222.2 84% 4.9%)', // Haupttext
    muted: 'hsl(215.4 16.3% 46.9%)', // Gedämpfter Text
  },
  
  // Border colors
  border: {
    DEFAULT: 'hsl(214.3 31.8% 91.4%)',
    light: 'hsl(214.3 31.8% 95%)',
    dark: 'hsl(214.3 31.8% 85%)',
  },
  
  // Card colors
  card: {
    DEFAULT: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
  },
  
  // Dark mode support
  dark: {
    background: 'hsl(0 0% 3.9%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(0 0% 3.9%)',
    border: 'hsl(0 0% 14.9%)',
    muted: 'hsl(0 0% 14.9%)',
    'muted-foreground': 'hsl(0 0% 63.9%)',
  },
} as const

export type Colors = typeof colors