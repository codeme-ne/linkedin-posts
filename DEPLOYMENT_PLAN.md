# 🚀 DEPLOYMENT PLAN: Stripe Lifetime & Monthly Subscription Integration

## 📋 ÜBERSICHT
Dieser Plan führt Schritt für Schritt durch die komplette Deployment-Pipeline für die neue Stripe Integration mit Lifetime (99€) und Monthly (29€) Subscriptions.

**WICHTIG**: Führe jeden Schritt genau in der angegebenen Reihenfolge aus. Überspringe keine Schritte!

---

## ✅ SCHRITT 1: LOKALE KONFIGURATION

### 1.1 Environment Variables setzen
**Aktion**: Öffne die `.env` Datei im Projektverzeichnis und füge folgende Zeilen hinzu:

```env
# Stripe Payment Links (NEU)
VITE_STRIPE_PAYMENT_LINK_LIFETIME="https://buy.stripe.com/aFa4gy6Rw7vxdHa5t90x202"
VITE_STRIPE_PAYMENT_LINK_MONTHLY="https://buy.stripe.com/cNi14m0t8bLNauYcVB0x203"

# Legacy Link (behalten für Kompatibilität)
VITE_STRIPE_PAYMENT_LINK="https://buy.stripe.com/aFa4gy6Rw7vxdHa5t90x202"
```

**Verifikation**: 
```bash
grep "STRIPE_PAYMENT_LINK" .env
# Sollte alle drei Links anzeigen
```

### 1.2 Lokaler Test
**Aktion**: Teste ob die App lokal startet:
```bash
npm run dev
```

**Erwartetes Ergebnis**: App startet auf http://localhost:5173 ohne Fehler

---

## ✅ SCHRITT 2: SUPABASE DATENBANK-MIGRATIONEN

### 2.1 Migrations-Dateien prüfen
**Aktion**: Verifiziere, dass diese Dateien existieren:
```bash
ls -la supabase/migrations/
```

**Erwartete Dateien**:
- `001_create_generation_usage_table.sql`
- `002_extend_subscriptions_table.sql`
- `003_create_pending_subscriptions.sql`

### 2.2 Migrationen in Supabase ausführen

**Option A: Via Supabase Dashboard (EMPFOHLEN)**
1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt
3. Navigiere zu "Database" → "Migrations"
4. Klicke "Run a migration"
5. Kopiere den Inhalt von `002_extend_subscriptions_table.sql`
6. Füge ein und klicke "Run"
7. Wiederhole für `003_create_pending_subscriptions.sql`

**Option B: Via SQL Editor**
1. Gehe zu "SQL Editor" in Supabase Dashboard
2. Neuer Query
3. Kopiere Inhalt von `002_extend_subscriptions_table.sql`
4. Execute
5. Wiederhole für `003_create_pending_subscriptions.sql`

**Verifikation**: 
Im Supabase Dashboard → Table Editor:
- ✅ `subscriptions` Tabelle hat neue Spalten (interval, amount, currency, etc.)
- ✅ `pending_subscriptions` Tabelle existiert

### 2.3 RLS Policies prüfen
**Aktion**: Stelle sicher, dass RLS aktiviert ist:
1. Table Editor → `pending_subscriptions`
2. RLS sollte "Enabled" sein
3. Policies sollten vorhanden sein

---

## ✅ SCHRITT 3: STRIPE WEBHOOK KONFIGURATION

### 3.1 Webhook Endpoint in Stripe erstellen

**Aktion**: 
1. Gehe zu https://dashboard.stripe.com/webhooks
2. Klicke "Add endpoint"
3. **Endpoint URL**: `https://linkedin-posts.vercel.app/api/stripe-webhook`
   (Ersetze mit deiner tatsächlichen Vercel-Domain!)
4. **Events auswählen**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Klicke "Add endpoint"

### 3.2 Webhook Secret kopieren
**Aktion**: 
1. Nach dem Erstellen, klicke auf den Webhook
2. Reveal "Signing secret"
3. Kopiere den Wert (beginnt mit `whsec_`)
4. **SPEICHERE DIESEN WERT** - du brauchst ihn für Vercel!

---

## ✅ SCHRITT 4: VERCEL ENVIRONMENT VARIABLES

### 4.1 Alle benötigten Variablen sammeln

**Checklist - Du brauchst**:
- [ ] `SUPABASE_URL` - Von Supabase Dashboard → Settings → API
- [ ] `SUPABASE_ANON_KEY` - Von Supabase Dashboard → Settings → API
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Von Supabase Dashboard → Settings → API (SECRET!)
- [ ] `STRIPE_WEBHOOK_SECRET` - Von Schritt 3.2
- [ ] `VITE_STRIPE_PAYMENT_LINK_LIFETIME` - `https://buy.stripe.com/aFa4gy6Rw7vxdHa5t90x202`
- [ ] `VITE_STRIPE_PAYMENT_LINK_MONTHLY` - `https://buy.stripe.com/cNi14m0t8bLNauYcVB0x203`
- [ ] `VITE_STRIPE_PAYMENT_LINK` - `https://buy.stripe.com/aFa4gy6Rw7vxdHa5t90x202`
- [ ] `FIRECRAWL_API_KEY` - Falls vorhanden

### 4.2 In Vercel setzen

**Aktion**:
1. Gehe zu https://vercel.com/dashboard
2. Wähle dein Projekt
3. Settings → Environment Variables
4. Füge JEDE Variable einzeln hinzu:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxx...` (dein Webhook Secret)
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Klick "Save"
5. Wiederhole für alle anderen Variablen

**WICHTIG**: `SUPABASE_SERVICE_ROLE_KEY` ist GEHEIM! Niemals im Frontend verwenden!

---

## ✅ SCHRITT 5: DEPLOYMENT

### 5.1 Code committen
**Aktion**:
```bash
git add .
git commit -m "feat: Add Lifetime & Monthly subscription plans with Stripe integration"
git push origin main
```

### 5.2 Vercel Deployment prüfen
1. Gehe zu Vercel Dashboard
2. Prüfe ob Deployment läuft
3. Warte auf "Ready" Status
4. Klicke auf Preview URL

**Fehlersuche bei Deployment-Fehler**:
- Check Build Logs in Vercel
- Verifiziere alle Environment Variables
- Stelle sicher, dass alle Dateien committed sind

---

## ✅ SCHRITT 6: PRODUKTION TESTEN

### 6.1 Payment Links testen

**Test 1: Lifetime Deal**
1. Gehe zur Landing Page
2. Klicke "Lifetime Deal sichern" (99€)
3. **Testkarte**: `4242 4242 4242 4242`
4. Beliebiges Ablaufdatum in Zukunft
5. Beliebiger CVC
6. Zahlung abschließen

**Test 2: Monthly Subscription**
1. Gehe zur Landing Page
2. Klicke "Monatsabo starten" (29€)
3. Gleiche Testkarte verwenden
4. Zahlung abschließen

### 6.2 Webhook Verifikation
**Aktion**: Prüfe in Stripe Dashboard → Webhooks → Dein Webhook → "Webhook attempts"
- ✅ Status sollte "Succeeded" sein (200)
- ❌ Bei Fehler: Check Vercel Function Logs

### 6.3 Datenbank prüfen
**In Supabase Dashboard → Table Editor**:

**Nach Zahlung OHNE Registrierung**:
- `pending_subscriptions` sollte neuen Eintrag haben
- Status: "pending"
- Email: Die verwendete Test-Email

**Nach Registrierung mit gleicher Email**:
- `subscriptions` sollte neuen Eintrag haben
- Status: "active"
- `pending_subscriptions` Status: "activated"

---

## 🔥 TROUBLESHOOTING

### Problem: Webhook schlägt fehl (401/500)
**Lösung**:
1. Verifiziere `STRIPE_WEBHOOK_SECRET` in Vercel
2. Prüfe ob Webhook URL korrekt ist
3. Check Vercel Function Logs: Dashboard → Functions → stripe-webhook

### Problem: User zahlt, aber kein Pro-Zugang
**Lösung**:
1. Check `pending_subscriptions` Tabelle
2. Verifiziere dass Email übereinstimmt
3. Manuell aktivieren via Supabase:
```sql
UPDATE subscriptions 
SET status = 'active', 
    interval = 'lifetime',
    amount = 9900
WHERE user_id = 'USER_ID_HERE';
```

### Problem: "Supabase client not configured"
**Lösung**:
1. Prüfe alle SUPABASE_ Environment Variables
2. Redeploy nach Variable-Änderung nötig!

### Problem: Payment Links funktionieren nicht
**Lösung**:
1. Verifiziere Links in .env und Vercel
2. Prüfe ob Stripe Products aktiv sind
3. Test im Stripe Test Mode

---

## 📊 MONITORING EINRICHTEN

### Tägliche Checks (erste Woche):
1. **Stripe Dashboard** → Payments → Prüfe neue Zahlungen
2. **Stripe Webhooks** → Check Success Rate (sollte >95% sein)
3. **Supabase** → Check subscriptions & pending_subscriptions
4. **Vercel** → Functions → Check für Errors

### Alerts einrichten:
1. Stripe → Settings → Notifications → Failed payments aktivieren
2. Vercel → Settings → Notifications → Function errors aktivieren

---

## ✅ FINALER CHECK

**Bestätige dass alles funktioniert**:
- [ ] Landing Page zeigt beide Preise (99€ & 29€)
- [ ] Payment Links öffnen korrekte Stripe Checkouts
- [ ] Test-Zahlungen werden verarbeitet
- [ ] Webhooks haben Status "Succeeded"
- [ ] Neue User bekommen Pro-Zugang nach Zahlung
- [ ] Pending Subscriptions werden bei Registrierung aktiviert
- [ ] PaywallGuard zeigt beide Pläne an

---

## 🎉 FERTIG!

Wenn alle Checks ✅ sind, ist die Integration vollständig deployed und funktionsfähig!

**Nächste Schritte**:
1. Aktiviere Stripe Live Mode (wenn bereit)
2. Update Payment Links auf Live-Versionen
3. Teste mit echter Karte (kleine Transaktion)
4. Monitore erste echte Kunden

---

## 📞 SUPPORT-KONTAKTE

- **Stripe Support**: https://support.stripe.com
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support

---

**Dokument erstellt**: 2025-09-03
**Letzte Aktualisierung**: 2025-09-03