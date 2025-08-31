# 🚀 Serena MCP Performance-Optimierung

## 1. Cache regelmäßig leeren (wenn > 100MB)
```bash
# Cache-Größe prüfen
du -sh .serena/cache/

# Bei Bedarf leeren
rm -rf .serena/cache/*
```

## 2. Gitignore optimieren
```gitignore
# Serena Cache immer ignorieren
.serena/cache/
.serena/memories/  # Optional, wenn du Memories nicht committen willst
```

## 3. Project.yml optimal konfigurieren

### ✅ RICHTIG - Dateien ignorieren die Serena nicht analysieren soll:
```yaml
ignored_paths:
  - "node_modules"
  - "dist"
  - "build"
  - "*.min.js"
  - "*.map"
  - "package-lock.json"
  - "coverage"
  - ".next"
```

### ⚡ Language Server Performance:
```yaml
# Bei TypeScript Projekten
language: typescript

# WICHTIG: Nur aktivieren wenn wirklich benötigt
excluded_tools: []  # Keine Tools ausschließen für beste Performance
```

## 4. Befehle für bessere Performance

### Statt "analysiere das ganze Projekt":
❌ "Zeig mir alle Komponenten"
✅ "Zeig mir die Generator Komponente"

### Statt breite Suchen:
❌ "Wo wird useState verwendet?" (sucht in 100+ Dateien)
✅ "Wo wird useState in src/pages/ verwendet?" (sucht in 4 Dateien)

### Relative Pfade nutzen:
❌ find_symbol("Button") - sucht überall
✅ find_symbol("Button", relative_path="src/components") - gezielt

## 5. Memory-System clever nutzen

### Häufig genutzte Infos speichern:
```
- API Struktur
- Komponenten-Hierarchie  
- Wichtige Patterns
```

### Memories regelmäßig aufräumen:
```bash
# Alte Memories löschen
ls .serena/memories/
# Ungenutzte löschen
```

## 6. Language Server Neustart

Wenn Serena langsam wird:
```
serena.restart_language_server()
```

## 7. Spezifische Suchmuster

### Performance-Killer vermeiden:
❌ search_for_pattern(".*")  # Sucht ALLES
❌ find_symbol("*", depth=10)  # Zu tief
❌ list_dir(".", recursive=true)  # Ganzes Projekt

### Optimierte Suchen:
✅ search_for_pattern("specific_function_name")
✅ find_symbol("Component", depth=1)
✅ list_dir("src/components", recursive=false)

## 8. Batch-Operations nutzen

### Mehrere Symbole auf einmal:
```python
# Statt 5 einzelne Aufrufe
symbols = ["Button", "Card", "Modal"]
for s in symbols:
    find_symbol(s)  # ❌ Langsam

# Besser: Ein Aufruf mit Pattern
find_symbol("Button|Card|Modal")  # ✅ Schneller
```

## 9. .serena/project.yml initial_prompt

Der initial_prompt sollte:
- Kurz und präzise sein (< 30 Zeilen)
- Nur essenzielle Infos enthalten
- Keine Code-Beispiele (die holt Serena dynamisch)

## 10. Wann NICHT Serena nutzen

Für diese Dateien ist normales `Read` schneller:
- package.json
- .env.example
- tsconfig.json
- Kleine Config-Dateien (< 50 Zeilen)
- Markdown-Dateien

## Performance-Metriken

Typische Antwortzeiten (optimal konfiguriert):
- list_dir: < 100ms
- find_symbol: < 200ms
- get_symbols_overview: < 300ms
- search_for_pattern: < 500ms (abhängig vom Scope)

## Troubleshooting

### Serena ist langsam?
1. Cache leeren: `rm -rf .serena/cache/*`
2. Language Server neu starten
3. Prüfe ob node_modules ignoriert wird
4. Reduziere Suchbereich mit relative_path

### Serena findet Symbole nicht?
1. Language Server neu starten
2. Prüfe ob Datei-Endung unterstützt wird (.ts, .tsx)
3. Cache neu aufbauen lassen

### Memory-Fehler?
1. Zu viele Memories? Alte löschen
2. Memories zu groß? Aufteilen in kleinere