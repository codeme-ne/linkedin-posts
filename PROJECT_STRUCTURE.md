# 📁 Projekt-Struktur Übersicht

## Root-Verzeichnis Dateien

### 📦 **Package Management** (MÜSSEN im Root bleiben!)
- `package.json` - Projekt-Abhängigkeiten und Scripts
- `package-lock.json` - Gesperrte Versionen der Abhängigkeiten
- `node_modules/` - Installierte Pakete (im .gitignore)

### ⚙️ **Konfigurationsdateien**
- `vite.config.ts` - Vite Build-Tool Konfiguration
- `tsconfig.json` - TypeScript Hauptkonfiguration
- `tsconfig.app.json` - TypeScript App-spezifische Config
- `tsconfig.node.json` - TypeScript Node-spezifische Config
- `tailwind.config.js` - TailwindCSS Styling-Konfiguration
- `postcss.config.js` - PostCSS für CSS-Verarbeitung
- `eslint.config.js` - Code-Linting Regeln
- `components.json` - shadcn/ui Komponenten-Config

### 🌐 **Deployment & Umgebung**
- `vercel.json` - Vercel Hosting Konfiguration
- `.env` - Geheime Umgebungsvariablen (NICHT in Git!)
- `.env.example` - Beispiel für Umgebungsvariablen

### 📄 **Projekt-Dokumentation**
- `README.md` - Projekt-Übersicht und Anleitung
- `CLAUDE.md` - Spezielle Anweisungen für Claude AI
- `PROJECT_STRUCTURE.md` - Diese Datei (Struktur-Erklärung)

### 🚀 **App-Einstiegspunkt**
- `index.html` - HTML-Hauptdatei (lädt React-App)

### 🔧 **Git**
- `.gitignore` - Welche Dateien Git ignorieren soll

---

## 📂 Ordner-Struktur

```
linkedin-posts/
├── 📁 api/              → Vercel Edge Functions (Backend)
├── 📁 src/              → Gesamter Source Code
│   ├── 📁 api/          → API Client-Funktionen  
│   ├── 📁 components/   → React Komponenten
│   │   ├── common/      → Wiederverwendbare Komponenten
│   │   ├── graphics/    → Grafik-Komponenten
│   │   ├── landing/     → Landing Page Komponenten
│   │   └── ui/          → shadcn/ui Basis-Komponenten
│   ├── 📁 design-system/→ Design Tokens & Custom Buttons
│   ├── 📁 pages/        → Seiten-Komponenten (Routes)
│   ├── 📁 hooks/        → Custom React Hooks
│   ├── 📁 config/       → App-Konfiguration
│   └── 📁 lib/          → Utility-Funktionen
├── 📁 public/           → Statische Dateien
├── 📁 supabase/         → Supabase lokale Config
├── 📁 docs/             → Zusätzliche Dokumentation
└── 📁 .serena/          → Serena AI Assistant Config
```

---

## 🎯 Wo finde ich was?

| Was suchst du? | Wo findest du es |
|----------------|------------------|
| React Komponenten | `src/components/` |
| API Verbindungen | `src/api/` |
| Seiten/Routes | `src/pages/` |
| Styles/Design | `src/design-system/` |
| Backend Functions | `api/` |
| Umgebungsvariablen | `.env.example` |
| Build-Einstellungen | `vite.config.ts` |

---

## 💡 Tipps für Anfänger

### VS Code Shortcuts:
- **Ctrl+P** → Schnell Dateien finden
- **Ctrl+Shift+P** → Command Palette
- **Ctrl+B** → Seitenleiste ein/aus
- **Ctrl+`** → Terminal öffnen

### Wichtigste Befehle:
```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build erstellen
npm run lint     # Code-Qualität prüfen
```

### Wo anfangen?
1. **Neue Features**: Beginne in `src/pages/`
2. **UI ändern**: Schaue in `src/components/`
3. **API anpassen**: Gehe zu `src/api/` oder `api/`
4. **Styling**: Check `src/design-system/` oder `tailwind.config.js`