# CLAUDE.md

Diese Datei gibt Claude Code (claude.ai/code) Anweisungen, Kontext und Best Practices für die Arbeit an diesem Repository. Dein Ziel ist es, den Code zu verstehen, Fehler zu beheben und neue Features gemäß den hier definierten Mustern zu implementieren.

## 🚨 WICHTIGE ANWEISUNGEN & WARNUNGEN (BITTE ZUERST LESEN) 🚨

Der Code befindet sich in einer Umstellungsphase. Es gibt veraltete und neue Muster nebeneinander. Halte dich strikt an die folgenden Regeln:

**Stripe Webhook**: Es gibt zwei Webhook-Dateien. Verwende und erweitere ausschließlich `api/stripe-webhook-simplified.ts`. Die Datei `api/stripe-webhook.ts` und die dazugehörige Logik mit der `pending_subscriptions`-Tabelle sind veraltet. Das Ziel ist ein einfacher "Direct Processing"-Flow.

**Veraltete UI-Komponenten (Ignorieren)**:
- **Buttons**: Das Verzeichnis `src/design-system/components/Button/` ist veraltet. Nutze IMMER die Button-Komponente aus `src/components/ui/button.tsx`.
- **Toasts**: Die Dateien `src/components/ui/toast.tsx` und `toaster.tsx` sind veraltet. Verwende für alle Benachrichtigungen `import { toast } from 'sonner'`.

**Payment-Logik im Frontend**:
- **NEU & KORREKT**: Die Komponente `src/components/common/ButtonCheckout.tsx` erstellt dynamische Bezahl-Sessions. Sie wird in `PaywallGuard.tsx` verwendet. Dies ist das zu verwendende Muster.
- **ALT & VERALTET**: Die `PaywallModal.tsx` nutzt feste Stripe Payment Links aus der Konfiguration. Diese Komponente soll durch den PaywallGuard ersetzt werden. Erstelle keine neuen Logiken, die auf festen Payment Links basieren.

**Claude API-Aufrufe**:
- Alle KI-Anfragen müssen über den Backend-Proxy `api/claude/v1/messages.ts` laufen.
- Die Datei `src/api/claude.ts` im Frontend dient nur dazu, diesen Proxy-Endpunkt aufzurufen. Sie darf niemals direkt die Anthropic-API ansprechen. Die Initialisierung mit `dangerouslyAllowBrowser: true` ist nur ein Relikt und für die Konfiguration des baseURL notwendig.

## 🚀 Projektübersicht (Project Overview)

Social Transformer ist eine SaaS-Anwendung, die lange Texte (Newsletter, Blog-Artikel) in optimierte Social-Media-Posts umwandelt. Die Architektur orientiert sich am robusten "ShipFast"-Pattern.

**Tech Stack**: React 18, TypeScript, Vite, Supabase (Auth, DB), Vercel Edge Functions, Stripe (Payments), TailwindCSS, shadcn/ui, Anthropic Claude 3.5 Sonnet.

## ⚙️ Wichtige Befehle (Key Commands)

### Entwicklungsserver (Development Servers)
- `npm run dev`: **EMPFOHLEN** - Startet Vite-Dev-Server (Port 5173) mit API-Proxy. Funktioniert ohne Vercel für UI-Entwicklung.
- `npm run dev:full`: Startet Frontend (5173) + Vercel API Server (3001) parallel. **Beste Lösung für Full-Stack-Entwicklung**.
- `npm run dev:frontend`: Nur Frontend ohne API-Funktionalität.
- `npm run dev:api`: Nur Vercel serverless functions auf Port 3001.

### Build & Quality
- `npm run build`: Erstellt den Produktions-Build.
- `npm run lint`: Führt ESLint zur Code-Überprüfung aus.

**⚠️ Wichtiger Hinweis**: Die ursprüngliche `vercel dev` Konfiguration hat MIME-Type-Probleme mit Vite 6. Verwende stattdessen die neuen Scripts für eine stabile Entwicklungsumgebung.

## 🏛️ Architektur (Intended State)

**Frontend (`/src`)**:
- `src/pages/`: Hauptseiten der App (Generator.tsx, Settings.tsx).
- `src/hooks/`: Geschäftslogik (useContentGeneration.ts, useSubscription.ts).
- `src/api/`: Client-seitige API-Wrapper.
- `src/config/`: Zentrale Konfiguration für Stripe-Pläne, Features, etc.

**Backend (`/api`)**: Serverlose Vercel Edge Functions.
- `api/claude/v1/messages.ts`: Sicherer Proxy zur Claude API.
- `api/stripe-webhook-simplified.ts`: Einziger Webhook zur Verarbeitung von Stripe-Events.
- `api/stripe/create-checkout.ts`: Erstellt dynamische Stripe Checkout Sessions.

**Datenbank (`/supabase/migrations`)**:
- `subscriptions`: Speichert den Abo-Status. Die Spalte `is_active` ist entscheidend.
- `generation_usage`: Zählt die Nutzung für kostenlose Accounts.
- `saved_posts`: Gespeicherte Beiträge der Nutzer.

## ✨ Wichtigste Abläufe (Core Workflows)

### 1. Content-Generierung
1. UI (Generator.tsx) sammelt Input-Text und Zielplattformen.
2. Hook (useContentGeneration.ts) prüft die Nutzungslimits (useUsageTracking.ts).
3. Client API (src/api/claude.ts) formuliert den Prompt und ruft den Backend-Proxy auf.
4. Backend Proxy (api/claude/v1/messages.ts) leitet die Anfrage sicher an die Anthropic API weiter.
5. Die Antwort wird im UI dargestellt.

### 2. Bezahlung & Abonnements (Ziel-Flow)
1. UI (ButtonCheckout.tsx) ruft das Backend auf, um eine Checkout-Session zu erstellen.
2. Backend (api/stripe/create-checkout.ts) erstellt eine Stripe Session und leitet den Nutzer weiter.
3. Nach erfolgreicher Zahlung sendet Stripe ein `checkout.session.completed`-Event.
4. Backend Webhook (api/stripe-webhook-simplified.ts) empfängt das Event, verifiziert die Signatur und schreibt den Kauf direkt in die `subscriptions`-Tabelle in Supabase (`status: 'active'`, `is_active: true`).
5. Hook (useSubscription.ts) liest den `is_active`-Status aus und gibt dem Nutzer im Frontend sofort Zugriff auf Premium-Features.

## 🤖 Claude AI Prompts

**Speicherort**: `src/api/claude.ts`.
**Fokus**: Die Prompts sind detailliert und enthalten strikte Formatierungsregeln (z.B. `LINKEDIN:`-Präfix). Halte dich bei Änderungen an diese Struktur. Optimiere sie für Qualität und Konsistenz, aber bewahre die Kernanforderungen.

## 💡 Entwicklungs-Tipps & Best Practices

- **Fokus auf "ShipFast"-Pattern**: Bevorzuge einfache, direkte Logik. Der `is_active`-Status in der `subscriptions`-Tabelle ist die "Single Source of Truth" für den Premium-Zugang.
- **Umgang mit veraltetem Code**: Wenn du auf veralteten Code stößt (siehe Warnungen oben), verwende ihn nicht. Ersetze ihn stattdessen durch die neue, empfohlene Implementierung.
- **Fehlerbehebung**: `api-client.ts` bietet ein zentrales Error-Handling mit sonner-Toasts. Nutze dies. Für Backend-Fehler, prüfe die Ausgabe des `vercel dev`-Terminals.
- **Konfiguration**: Änderungen an Preisen, Feature-Namen oder Limits sollten zentral in `src/config/app.config.ts` vorgenommen werden.

## 🔧 Bereiche für Refactoring & Fehlerbehebung

Dies sind Aufgaben, bei denen du proaktiv helfen kannst:

1. **Migration zu ButtonCheckout abschließen**: Ersetze alle Vorkommen von PaywallModal und festen Stripe Payment Links durch den PaywallGuard und ButtonCheckout.

2. **Auth-Flow aufräumen**: Entferne die reconcile-subscription-Logik aus dem SignUp.tsx-Flow, da der vereinfachte Webhook dies überflüssig macht.

3. **Sicherheits-Hardening**: Implementiere die Vorschläge aus `docs/security/security-report.md`, insbesondere:
   - **CORS-Policy**: Ersetze den `*` Wildcard in den API-Routen durch eine Herkunfts-Whitelist.
   - **Security Headers**: Füge empfohlene Security-Header in `vercel.json` hinzu.

4. **Veralteten Code entfernen**: Lösche die Verzeichnisse und Dateien, die explizit als "DEPRECATED" markiert sind, um die Codebasis zu bereinigen.