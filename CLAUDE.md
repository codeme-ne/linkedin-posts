# 🔄 Projekt Awareness & Kontext

## 🌐 Production Domains & Deployment
- **Current Production**: https://linkedin-posts-98eptac77-lukaszangerl-gmxats-projects.vercel.app
- **Main Domain**: https://linkedin-posts-one.vercel.app
- **Related Domains**: (deprecated: transformer.social, tranformer.social)

### ⚠️ IMPORTANT: Testing After Deployments
**ALWAYS wait for Vercel deployment to complete before testing production!**
- After `git push`, wait ~45-60 seconds for Vercel to build and deploy
- NEVER test the old deployment - this leads to confusion and wasted effort
- Use `sleep 50` or similar to ensure deployment is complete before navigating to production URL
- Verify changes are live before proceeding with testing

### ⚠️ IMPORTANT: Planning Before Implementation
**ALWAYS plan and clarify before making changes!**
- If unsure about requirements, ASK the user first before implementing
- Understand the complete picture before starting (e.g., "left column = input, right column = output, sidebar = saved posts")
- Don't make assumptions - confirm understanding with the user
- Use EnterPlanMode for non-trivial tasks
- Making changes without understanding leads to wasted effort and multiple fix attempts

- Lies zu Beginn jeder neuen Aufgabe die Dateien:
	- `README.md` (Zweck, Setup, Befehle)
	- `src/config/app.config.ts` und `src/config/env.config.ts` (Feature Flags, Pläne, Umgebungsvariablen)
	- `vercel.json` (CSP, Headers) und `vite.config.ts` (Alias, Dev-Proxy)
	- Relevante Edge Functions unter `api/` (Routen & Verträge)
- Aufgabenverwaltung: Falls kein `TASK.md` existiert (aktuell nicht vorhanden), lege eines an oder nutze GitHub Issues. Notiere neue Aufgaben mit Datum und Kurzbeschreibung.
- Nutze konsistente Benennungen, Ordnerstruktur und Muster wie in diesem Repository (siehe Struktur unten).
- Lokale Entwicklung: Starte Frontend + API zusammen (siehe Befehle). Edge-Funktionen laufen über Vercel Dev.

---

## 🧱 Code-Struktur & Modularität

- Halte Dateien unter 500 Zeilen. Wenn größer: extrahiere Logik in Hooks/Utils oder untergeordnete Komponenten.
- Struktur nach Verantwortlichkeiten/Funktionen:
	- `src/`
		- `api/` – Frontend-Clients für Edge-APIs und Integrationen
			- `claude.ts` – Nutzung der Anthropic API über unsere Proxy-Route (`/api/claude`)
			- `extract.ts` – Standard-Extraktion (POST `/api/extract`)
			- `extract-premium.ts` – Premium-Extraktion-Client (Firecrawl)
			- `linkedin.ts` – LinkedIn Draft/Share-Integration
			- `supabase.ts` – Supabase Client, Auth- und Saved-Posts-CRUD
		- `config/` – zentralisierte App-/Env-Konfiguration
			- `app.config.ts` – Feature-Flags, Stripe-Pläne/Preis-IDs, Limits, URLs
			- `env.config.ts` – getEnvVar()/Validation/Helper, Required/Recommended Vars
			- `platforms.ts` – Plattform-Typen und Labels
		- `components/` – UI-, Landing-, Common- und Design-Komponenten
		- `design-system/` – wiederverwendbare DS-Bausteine
		- `hooks/` – State/Business-Logik als React Hooks
			- `useContentGeneration.ts` – KI-Generierung pro Plattform
			- `useUrlExtraction.ts` – URL-Import (Standard/Premium)
			- `useSubscription.ts` – Premium-Zugriff über `subscriptions.is_active`
			- `useAuth.ts` – Login-State/Magic-Link-Handling
		- `pages/` – Routen (Landing, Generator/App, Settings, etc.)
		- `libs/` & `lib/` – API-Client-Helfer und Utils
	- `api/` – Vercel Edge Functions (Server-seitig)
		- `extract.ts`, `extract-premium.ts` (Firecrawl), `claude/v1/messages.ts`
		- `stripe/` – `create-checkout.ts`, `create-portal.ts`
		- `stripe-webhook-simplified.ts`
- Imports: Verwende den Vite-Alias `@` für `src` (siehe `vite.config.ts`). Bevorzuge klare relative/alias Imports, keine „magischen“ Pfade.
- Umgebungszugriffe: client-seitig ausschließlich `env.config.ts`-Helper nutzen; server-seitig `process.env` mit nicht-VITE-Keys.

---

## 🌍 Umgebungsvariablen

- Client (Vite, Pflicht):
	- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Server (Edge Functions, Pflicht für volle Funktionalität):
	- `CLAUDE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
	- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (bzw. `VITE_SUPABASE_URL` als Fallback)
- Optional/Empfohlen:
	- `VITE_STRIPE_PAYMENT_LINK_LIFETIME`, `VITE_STRIPE_PAYMENT_LINK_MONTHLY`
	- `FIRECRAWL_API_KEY` (Premium-Extraktion)

	- `VITE_BASE_URL`, `VITE_DOMAIN_NAME`, `RESEND_API_KEY`
 	- Vorbereitung Supabase (ab Nov 2025): zusätzlich `SUPABASE_PUBLISHABLE_KEY` (ersetzt anon) und `SUPABASE_SECRET_KEY` (ersetzt service_role). Übergangsphase: beide Formate parallel unterstützen.
- Validierung: `env.init()`/`validateClientEnvironment()` für Client; `validateServerEnvironment()` für Server.
- Sicherheit: Keine Server-Secrets in `VITE_`-Variablen. Claude API-Zugriff erfolgt ausschließlich über unsere sichere Proxy-Route `/api/claude`.

Hinweis: Die CORS-Allowlist wurde von `https://tranformer.social` auf `https://linkedin-posts-one.vercel.app` aktualisiert. Beim Anpassen von CORS/URLs die aktuelle Produktions-Domain verwenden.

---

## 🧪 Tests & Zuverlässigkeit

- Aktuell sind keine Tests eingerichtet. Empfehlung:
	- Richte Vitest + React Testing Library ein.
	- Lege Tests unter `tests/` an, gespiegelt zur App-Struktur (z. B. `tests/hooks/useContentGeneration.test.ts`).
	- Schreibe je Feature mindestens:
		- 1 Happy-Path-Test
		- 1 Edge Case (leere Eingaben, Limits, Timeouts)
		- 1 Failure Case (API-Fehler, 401/403/429)
- Edge Functions:
	- Eingaben strikt validieren (URL-Format, Auth Header, Plan-Status)
	- Timeouts via `AbortController` (siehe `api/extract.ts`, 30s) beibehalten
	- Aussagekräftige Fehlertexte + Statuscodes (400/401/403/429/5xx)
	- CORS nur für erlaubte Origins setzen
- Frontend:
	- Side Effects in Hooks isolieren, Loading/Progress/UI-Feedback testen
	- Kostenlose Nutzungen lokal per `localStorage` zählen (ShipFast-Muster)

---

## ✅ Aufgabenabschluss

- Schließe Aufgaben unmittelbar in `TASK.md` oder als GitHub Issue ab (Status, Datum, kurzer Abschlusskommentar).
- Füge entdeckte Unteraufgaben/ToDos in einen Abschnitt „Während der Arbeit entdeckt“ hinzu.
- Aktualisiere bei Verhaltensänderungen die Config/Docs (`README.md`, `docs/`), inkl. .env-Beispiele.

---

## 📎 Stil & Konventionen

- Sprache: TypeScript + React 19 (Vite 7), TailwindCSS; UI via Radix/shadcn.
- ESLint ist konfiguriert (`eslint.config.js`). Prüfe vor PRs: `npm run lint`.
- Benennung:
	- Komponenten: PascalCase in `components/`
	- Hooks: `useXxx.ts`
	- Dateien: sprechend, nach Verantwortlichkeit
- Kommentare/Docs: JSDoc für Funktionen/Hooks.
	- Beispiel:
		/**
		 * Erzeugt LinkedIn-Posts aus Newsletter-Inhalt.
		 * @param content Eingabetext (Newsletter/Blog)
		 * @returns String-Array mit bis zu 3 Posts
		 */
- Konfiguration zentral über `src/config/` – Feature Flags, Limits und Pläne nie hart im Code duplizieren.
- API-Design: Edge Functions mit `runtime: 'edge'`, JSON-Responses, explizite Statuscodes, CORS-Header nur bei erlaubten Origins.

---

## 📚 Dokumentation & Erklärbarkeit

- Pflege `README.md` bei neuen Features/Dependencies/Setup-Schritten.
- Kommentiere nicht-triviale Logik; füge bei komplexen Stellen „Reason:“ Kommentare hinzu (Warum diese Entscheidung?).
- Ergänze `docs/` (z. B. Supabase-Setup) um Migrations-/RLS-Hinweise, wenn betroffene Tabellen/Policies geändert werden.

---

## 🧠 AI-Verhaltensregeln

- Keine Annahmen ohne Beleg im Code/Repo. Frage nach, wenn Kontext fehlt.
- Keine erfundenen Libraries/APIs. Nur im Projekt oder offiziell dokumentierte Pakete verwenden.
- Pfade/Module vor Nutzung verifizieren (Ordnerstruktur s. o.).
- Bestehenden Code nicht löschen/überschreiben, außer wenn Aufgabe es verlangt und Auswirkungen verstanden/kommuniziert sind.
- Secrets nie client-seitig exponieren. Für Claude immer die Proxy-Route `/api/claude/v1/messages` verwenden.

---

## 🔌 Wichtige Systeme & Endpunkte (Vertrag kurz)

- Anthropic/Claude (Proxy):
	- POST `/api/claude/v1/messages`
	- Headers: `anthropic-version`, `x-api-key` (server-seitig), JSON-Body wie Anthropic `messages` API
	- Zweck: Client ruft lokal die Proxy-Route auf; Key bleibt server-seitig

- Extraktion:
	- POST `/api/extract` – Body `{ url: string }`
		- Antwort: `{ title?, byline?, excerpt?, content: string, length?, siteName? }`
		- 400 bei ungültiger URL, 422 bei inhaltsarmer Seite, 504 bei Timeout
	- POST `/api/extract-premium` – Auth `Bearer <access_token>` erforderlich, Premium-Abo nötig
		- Antwort: `{ title?, content, markdown?, html?, screenshot?, metadata?, usage? }`
		- 401 (nicht eingeloggt), 403 (kein Abo), 429 (Limit), 500/502 bei Fehlern

- Stripe:
	- Webhook: POST `/api/stripe-webhook-simplified`
		- Verifiziert via `STRIPE_WEBHOOK_SECRET`
		- Events: `checkout.session.completed`, `customer.subscription.updated|deleted`, `invoice.paid|payment_failed`
		- Schreibt/aktualisiert `subscriptions` mit `is_active` als SSOT
	- Checkout: POST `/api/stripe/create-checkout`
		- Body: `{ priceId: string, mode: 'payment'|'subscription', successUrl: string, cancelUrl: string }`
		- Optional `Authorization: Bearer` für Zuordnung zu User
		- Antwort: `{ url: string }`
	- Customer Portal: POST `/api/stripe/create-portal` – Auth Pflicht
		- Body: `{ returnUrl: string }`, Antwort `{ url: string }`

- LinkedIn:
	- `src/api/linkedin.ts` – Draft via REST (optional Token) oder Share-Dialog Fallback.

- Datenbank (Supabase):
	- `subscriptions` – Zugriffskontrolle über `is_active`
	- `saved_posts` – gespeicherte Beiträge (RLS via `auth.uid()`)
	- RPC `get_monthly_extraction_usage` für Premium-Limits (falls aktiviert)

---

## ⚙️ Lokale Entwicklung & Befehle

- NPM Scripts (`package.json`):
	- `npm run dev` – Vite (Frontend) auf Port 5173
	- `npm run dev:api` – Vercel Dev (Edge Functions) auf Port 3001
	- `npm run dev:full` – beides parallel (empfohlen)
	- `npm run build` – TypeScript Build + Vite Bundle
	- `npm run preview` – Produktions-Bundle lokal ansehen
	- `npm run lint` – ESLint ausführen
- Dev-Proxy: Alle `/api/*` Requests werden von Vite zu `http://localhost:3001` weitergeleitet (siehe `vite.config.ts`).
- CSP (`vercel.json`): `connect-src` erlaubt `self`, Supabase, Anthropic, Stripe. Für neue externe Client-Aufrufe (selten nötig) CSP anpassen.

---

## 🔐 Sicherheit & Best Practices

- Secrets strikt nur server-seitig (Edge). Keine `VITE_`-Leaks.
- CORS nur für bekannte Origins setzen (Production + Localhost). Domain-Sonderfall beachten: `tranformer.social` ist absichtlich so konfiguriert.
- Eingaben validieren (URLs, Auth Header). Rate-Limits respektieren (z. B. Premium-Extraktion).
- Netzwerk-Calls mit Timeouts (`AbortController`) absichern.
- LinkedIn: Access Token in Entwicklung testen; in Produktion bevorzugt Share-Dialog.

---

## 🚀 2025 Technologie-Updates & Migrationsempfehlungen

Dieser Abschnitt bündelt aktuelle Änderungen (Stand: Sep 2025), die unser Projekt betreffen können. Ziel ist eine sichere, schrittweise Migration ohne Produktionsrisiken.

### 1) TailwindCSS v4 – Breaking Changes und Migrationsplan

Wesentliche Änderungen:
- CSS-first: `tailwind.config.js` optional/entfällt, Design Tokens via `@theme` im CSS.
- Neue Imports: `@import "tailwindcss"` statt `@tailwind base/components/utilities`.
- Vite-Integration: Verwende `@tailwindcss/vite` Plugin (Autoprefixer nicht nötig).
- Aktualisierte Browser-Minimalstände (z. B. Safari ≥ 16.4).

Empfohlene Schritte (Branch: `chore/tw4-migration`):
- Vite-Konfiguration anpassen:

```ts
// vite.config.ts (Tailwind v4)
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [tailwindcss(), react()],
})
```

- CSS-Einstieg umstellen (z. B. `src/index.css`):

```css
@import "tailwindcss";

@theme {
	/* Beispiel: Markenvariablen */
	--font-display: "Inter", system-ui, sans-serif;
	--color-brand-500: oklch(0.7 0.2 140);
}
```

- Entferne V3-spezifische PostCSS/Autoprefixer-Einträge, wenn nicht mehr nötig.
- UI Smoke-Tests durchführen (Landing, Generator, Dialoge). Falls shadcn/Radix Klassen betroffen, gezielt nachziehen.

Hinweis: Rollback-Strategie bereithalten (separater PR, schrittweise Migration von Komponenten).

### 2) Supabase API-Schlüssel (ab Nov 2025)

Supabase führt neue Schlüssel-Namen/Formate ein:
- `sb_publishable_...` (ersetzt `anon`)
- `sb_secret_...` (ersetzt `service_role`)

Migrationsstrategie:
- Env-Dokumentation erweitern (siehe Abschnitt Umgebungsvariablen).
- Code dual-fähig machen (Fallback-Reihenfolge):
	- Client: `VITE_SUPABASE_ANON_KEY` ODER `SUPABASE_PUBLISHABLE_KEY`
	- Server: `SUPABASE_SERVICE_ROLE_KEY` ODER `SUPABASE_SECRET_KEY`
- Zero-Downtime-Rotation testen (Staging): alte+neue Schlüssel parallel, dann Altwerte entsorgen.

Beispiel-Konfiguration (Pseudo):

```ts
// Server (Edge) – Auswahl Secret Key
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
// Client – Auswahl Publishable
const anonOrPublishable = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY
```

### 3) Vercel Functions (Edge Runtime) – Terminologie & Limits

- Bezeichnung: „Vercel Functions“ mit „Edge Runtime“ statt „Edge Functions“.
- Ausführungslimits aktualisiert (z. B. 300s für Streaming), „Fluid Compute“ Modell für Kosteneffizienz.
- Dokumentation/Kommentare in `api/**` entsprechend anpassen (kein Codezwang, nur Terminologie in Docs).

### 4) ESLint v9 (Flat Config) – Pflege

- Wir nutzen bereits Flat Config (`eslint.config.js`).
- Empfehlung: Regelmäßig auf v9.x aktualisieren, `typescript-eslint` in Einklang halten, CI-Lint vor PR erzwingen.

### 5) TypeScript – 5.9 aktuell, 6.0 in Planung

- Beibehalten ≥ 5.9. Geplante Migration auf 6.0 Ende 2025 prüfen (Breaking Changes beachten).
- Empfohlen: striktere Typen in Hooks/APIs, `noUncheckedIndexedAccess` projektweit evaluieren.

### 6) Node.js Mindestversion

- Ab sofort Node.js ≥ 20 für lokale Entwicklung/CI empfehlen (Vite 7, Tailwind v4 Tools).
- README/CLAUDE entsprechend vermerken.

### 7) Domain-Name – Update

- Domain wurde von `tranformer.social` auf `linkedin-posts-one.vercel.app` aktualisiert. CORS-Allowlists und Redirect-URLs wurden entsprechend angepasst.

### ✅ Sofort / Kurzfristig / Laufend

Sofort:
1. Tailwind v4 Migrations-PR vorbereiten (Vite-Plugin, CSS-Import, Smoke-Tests)
2. Supabase Schlüssel-Migrationsplan im `docs/` festhalten

Kurzfristig:
1. Terminologie in Docs auf „Vercel Functions (Edge Runtime)“ aktualisieren
2. Node.js ≥ 20 in README/Eng-Docs fixieren

Laufend:
1. Monatliches Dependency-/Ecosystem-Review (ESLint/TS/Vite/Radix/Stripe-Changelog)
2. Automatisierte Minor/Patch-Updates (Renovate/Dependabot), manuelle Review für Majors

---

## 🧩 Wiederkehrende Muster (ShipFast-inspiriert)

- Zugriffskontrolle über `subscriptions.is_active` als Single Source of Truth.
- Kostenlose Limits client-seitig per `localStorage` (z. B. `freeGenerationsCount`).
- Stripe-Fluss: Preis-IDs in `app.config.ts`, Checkout über Edge-Route, Webhook aktiviert Abo und setzt `is_active`.
- KI-Generierung: Plattform-Loop mit Fortschrittsanzeige, robuste Parsing/Parsing-Fallbacks für Output.

---

## ➕ Erweiterungen – Vorgehen

- Neue Plattform hinzufügen:
	1) `src/config/platforms.ts` erweitern (Typ & Label)
	2) `useContentGeneration.ts` um Fall ergänzen
	3) UI: `PlatformSelector`/Renderlogik anpassen
- Neues Feature-Flag:
	- In `app.config.ts` unter `features` hinzufügen und im Code abfragen
- Neue Edge Function:
	- Datei unter `api/` mit `export const config = { runtime: 'edge' }`
	- CORS wie in vorhandenen Routen implementieren
	- Bei Bedarf `vercel.json`/CSP prüfen
- DB-Änderung:
	- Migration unter `supabase/migrations/` ergänzen, `docs/` updaten

PR-Checkliste:
1) Lint sauber, Build erfolgreich
2) Env-Variablen dokumentiert/validiert
3) Edge-Inputs validiert, aussagekräftige Fehlercodes
4) UI-States (Loading/Fehler) abgedeckt
5) README/TASKs aktualisiert

