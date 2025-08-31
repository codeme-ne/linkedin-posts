# 📚 Serena Memory System Guide

## Was sind Memories?
Memories sind persistente Notizen die zwischen Claude-Sessions erhalten bleiben.
Sie werden in `.serena/memories/` gespeichert.

## Deine aktuellen Memories:

| Memory Name | Inhalt | Wann nutzen? |
|------------|---------|--------------|
| `project_overview` | Überblick über dein Projekt | Bei neuen Features |
| `tech_stack` | Alle verwendeten Technologien | Bei Library-Fragen |
| `code_style_conventions` | Coding Standards | Beim Code schreiben |
| `suggested_commands` | Nützliche Befehle | Bei Dev-Tasks |
| `project_structure` | Ordner-Struktur | Bei Navigation |
| `serena_best_practices` | Serena Tipps | Bei Code-Suche |
| `mcp_context7_usage_rules` | Context7 Regeln | Bei Library-Docs |
| `code_cleanup_summary` | Was wurde bereinigt | Bei Refactoring |

## So nutzt du Memories:

### 1. LESEN (Info abrufen)
```bash
# Direkt fragen:
"Was steht in der project_overview Memory?"
"Zeige mir die suggested_commands"
"Welche Code-Conventions haben wir?"

# Claude liest automatisch die relevante Memory
```

### 2. SCHREIBEN (Neue Info speichern)
```bash
# Neue Memory erstellen:
"Speichere als Memory: Deployment läuft über GitHub Actions"
"Merke dir als Memory api_limits: Rate Limit ist 100/min"
"Erstelle Memory bug_list mit den bekannten Bugs"
```

### 3. UPDATEN (Bestehende ändern)
```bash
# Memory aktualisieren:
"Update die tech_stack Memory - wir nutzen jetzt auch Redis"
"Füge zu suggested_commands hinzu: npm run test"
"Erweitere project_overview um das neue Payment Feature"
```

### 4. LÖSCHEN (Aufräumen)
```bash
# Alte Memory entfernen:
"Lösche die Memory old_bugs"
"Die Memory temporary_notes kann weg"
```

## Beste Memory-Kandidaten für dein Projekt:

### 🎯 Solltest du als Memory speichern:

1. **API Keys/IDs (ohne Secrets!):**
   - "Stripe Product ID: prod_xyz"
   - "Supabase Project Ref: abcdefg"
   - "Vercel Project Name: linkedin-posts"

2. **Häufige Bugs/Lösungen:**
   - "Firecrawl API Bug: Use Scrape statt Extract"
   - "TypeScript Error Fix: Add _prefix für unused params"

3. **Deployment Infos:**
   - "Production URL: linkedin-posts.vercel.app"
   - "Staging Branch: develop"

4. **Wichtige Entscheidungen:**
   - "Wir nutzen keine Class Components"
   - "Alle Texte auf Deutsch"
   - "Design System Buttons verwenden"

5. **Performance Tricks:**
   - "Bundle Size Limit: 500KB"
   - "Lazy Load für Graphics Components"

## Memory Best Practices:

### ✅ DO:
- Kurze, prägnante Memory-Namen
- Strukturierte Inhalte (Markdown)
- Regelmäßig alte Memories löschen
- Wichtige Decisions dokumentieren

### ❌ DON'T:
- Keine Secrets/Passwörter
- Keine riesigen Code-Blöcke
- Keine temporären Infos
- Keine duplizierten Infos

## Beispiel: Neue Memory erstellen

```markdown
User: "Speichere als Memory common_errors: 
- useState Import vergessen
- Relative statt absolute Pfade
- .env Variablen ohne VITE_ Prefix"

Claude: *erstellt Memory common_errors*
```

## Beispiel: Memory nutzen

```markdown
User: "Ich bekomme einen TypeScript Fehler"

Claude: *liest automatisch common_errors Memory*
"Prüfe ob du den useState Import hast..."
```

## Memory Lifecycle:

1. **Erstellen** → Bei wichtigen Erkenntnissen
2. **Nutzen** → Claude greift automatisch zu
3. **Updaten** → Wenn sich was ändert
4. **Löschen** → Wenn nicht mehr relevant

## Pro-Tipp: Memory-Kategorien

Nutze Prefixes für Organisation:
- `api_` → API-bezogene Infos
- `bug_` → Bekannte Bugs
- `deploy_` → Deployment Infos
- `decision_` → Architektur-Entscheidungen
- `todo_` → Offene Aufgaben