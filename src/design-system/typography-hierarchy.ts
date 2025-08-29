// Einheitliche Typografie-Hierarchie für die Landing Page
// Angepasst an das aktuelle shadcn/ui Design System und CSS-Variablen

export const typographyHierarchy = {
  // Hauptüberschriften (Hero Section) - responsiv und modern
  h1: {
    className: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight",
    description: "Hero headlines - größte Überschriften mit responsiver Skalierung"
  },
  
  // Sektionsüberschriften (HowItWorks, Pricing, etc.)
  h2: {
    className: "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight",
    description: "Section headlines - Hauptsektionen mit konsistenter Hierarchie"
  },
  
  // Subsektionsüberschriften (Feature Cards, etc.)
  h3: {
    className: "text-xl md:text-2xl lg:text-3xl font-semibold leading-snug tracking-tight",
    description: "Subsection headlines - Karten, Features mit verbesserter Lesbarkeit"
  },
  
  // Kleinere Überschriften (Card Titles, etc.)
  h4: {
    className: "text-lg md:text-xl font-semibold leading-snug",
    description: "Small headlines - Listen, Details, Card Titles"
  },
  
  // Sehr kleine Überschriften
  h5: {
    className: "text-base md:text-lg font-semibold leading-snug",
    description: "Micro headlines - kleinste Überschriften"
  },
  
  // Body Text Größen - erweitert und responsiv
  bodyXLarge: {
    className: "text-xl md:text-2xl leading-relaxed",
    description: "Extra large body text - Hero descriptions, wichtige Statements"
  },
  
  bodyLarge: {
    className: "text-lg md:text-xl leading-relaxed",
    description: "Large body text - Sektionsbeschreibungen"
  },
  
  body: {
    className: "text-base md:text-lg leading-normal",
    description: "Standard body text - responsiv für bessere Lesbarkeit"
  },
  
  bodySmall: {
    className: "text-sm md:text-base leading-normal",
    description: "Small body text - Cards, Details, Metainformationen"
  },
  
  bodyXSmall: {
    className: "text-xs md:text-sm leading-normal",
    description: "Extra small body text - Captions, Footnotes"
  },
  
  // Spezielle Text-Typen - erweitert
  badge: {
    className: "text-xs md:text-sm font-medium uppercase tracking-wide",
    description: "Badges und Labels mit verbesserter Readability"
  },
  
  button: {
    className: "text-sm md:text-base font-semibold tracking-wide",
    description: "Button Text - responsiv und konsistent"
  },
  
  buttonLarge: {
    className: "text-base md:text-lg font-semibold tracking-wide",
    description: "Large Button Text - für wichtige CTAs"
  },
  
  caption: {
    className: "text-xs leading-relaxed",
    description: "Captions, Footer text, sehr kleine Zusatzinfos"
  },
  
  code: {
    className: "text-sm font-mono bg-muted px-1 py-0.5 rounded",
    description: "Inline code snippets"
  },
  
  // Farben für verschiedene Text-Hierarchien - angepasst an CSS-Variablen
  colors: {
    primary: "text-foreground", // Haupttext (hsl(222.2 84% 4.9%))
    secondary: "text-muted-foreground", // Beschreibungen (hsl(215.4 16.3% 46.9%))
    accent: "text-primary", // Hervorhebungen (hsl(262 83% 58%))
    muted: "text-muted-foreground/70", // Weniger wichtige Texte
    inverse: "text-primary-foreground", // Text auf farbigen Hintergründen
    success: "text-green-600 dark:text-green-400", // Erfolg
    warning: "text-amber-600 dark:text-amber-400", // Warnung
    danger: "text-destructive", // Fehler/Gefahr
    claude: "text-[#D97757]", // Claude AI Markenfarbe
    linkedin: "text-[#0A66C2]", // LinkedIn Markenfarbe
  },
  
  // Utility-Klassen für verschiedene Anwendungsfälle
  utilities: {
    // Gradient Text
    gradientText: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
    
    // Responsive Text Centering
    textCenter: "text-center",
    textLeft: "text-left md:text-left",
    textCenterMobile: "text-center md:text-left",
    
    // Text Wrapping
    textBalance: "text-wrap balance", // Für bessere Zeilenumbrüche
    textNoWrap: "whitespace-nowrap",
    
    // Interactive States
    textHover: "hover:text-primary transition-colors duration-200",
    textActive: "active:text-primary/80",
  }
} as const

export type TypographyHierarchy = typeof typographyHierarchy
