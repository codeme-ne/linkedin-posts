# Stripe Integration Setup

## 🎯 Beta Lifetime Deal - 49€

Die App nutzt Stripe für die Zahlungsabwicklung des Beta Lifetime Deals.

## Setup Steps

### 1. Stripe Dashboard Konfiguration

1. **Webhook einrichten:**
   - Gehe zu [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Klicke "Add endpoint"
   - URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events auswählen:
     - `payment_intent.succeeded`
     - `checkout.session.completed` (optional)
   - Kopiere den Webhook Secret (beginnt mit `whsec_`)

2. **Payment Link bereits erstellt:**
   - URL: `https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200`
   - Produkt: "Social Transformer - Beta Lifetime Deal"
   - Preis: 49€ (Einmalzahlung)

### 2. Supabase Migrations ausführen

**WICHTIG: Migrations müssen in der richtigen Reihenfolge ausgeführt werden!**

In Supabase SQL Editor ([SQL Editor Link](https://supabase.com/dashboard/project/_/sql)):

1. **Erst die Basis-Migration für Subscriptions ausführen:**
   ```sql
   -- Führe zuerst diese Migration aus: supabase/migrations/002_add_subscription_fields.sql
   -- Diese erstellt die subscriptions Tabelle
   ```
   Kopiere den Inhalt von `supabase/migrations/002_add_subscription_fields.sql` und führe ihn aus.

2. **Dann die Stripe-spezifischen Felder hinzufügen:**
   ```sql
   -- Führe danach diese Migration aus: supabase/migrations/003_add_stripe_fields.sql
   -- Diese fügt Stripe-Felder zur existierenden Tabelle hinzu
   ```
   Kopiere den Inhalt von `supabase/migrations/003_add_stripe_fields.sql` und führe ihn aus.

**Alternative mit Supabase CLI (falls installiert):**
```bash
# Installation (falls nicht vorhanden)
npm install -g supabase

# Migrations ausführen
supabase db push --db-url "postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres"
```

### 3. Environment Variables (Vercel)

In Vercel Dashboard > Settings > Environment Variables:

```env
# Supabase (falls noch nicht gesetzt)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Claude API (für Edge Function)
CLAUDE_API_KEY=your-claude-api-key
```

### 4. Lokale Entwicklung

`.env` Datei erstellen:

```env
VITE_CLAUDE_API_KEY=your-key
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/9B628qejY6rtfPi8Fl0x200
```

## 🔄 Payment Flow

1. **User klickt "Beta Lifetime Deal - nur 49€"**
   - Wird zu Stripe Payment Link weitergeleitet
   - User ID wird als `client_reference_id` übergeben

2. **Nach erfolgreicher Zahlung:**
   - Stripe sendet Webhook an `/api/stripe-webhook`
   - Webhook erstellt Subscription-Eintrag in Supabase
   - Status wird auf `active` gesetzt (Lifetime)

3. **User Experience:**
   - PaywallGuard erkennt aktive Subscription
   - Alle Features werden freigeschaltet
   - Kein Ablaufdatum (Lifetime Access)

## 🧪 Testing

### Test mit Stripe CLI (lokal):

```bash
# Stripe CLI installieren
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Webhook forwarding für lokale Tests
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Test Event senden
stripe trigger payment_intent.succeeded
```

### Test in Production:

1. Verwende Stripe Test Mode
2. Nutze Test-Kreditkarte: `4242 4242 4242 4242`
3. Prüfe Webhook-Logs in Stripe Dashboard

## 📊 Monitoring

- **Stripe Dashboard:** Zahlungen und Webhook-Events
- **Supabase Dashboard:** `subscriptions` Tabelle
- **Vercel Functions:** Logs für Webhook-Handler

## 🚨 Wichtige Hinweise

- Der Webhook-Handler nutzt Edge Runtime für bessere Performance
- User-Matching erfolgt über `client_reference_id` (User ID) oder Email
- Beta Lifetime Deal hat kein Ablaufdatum (`ends_at = null`)
- Alle zukünftigen Updates sind inklusive