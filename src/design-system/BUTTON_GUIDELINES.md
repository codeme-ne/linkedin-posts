# Button Guidelines

## Übersicht

Dieses Dokument beschreibt die Verwendung von Buttons in der LinkedIn Posts Anwendung. Alle Buttons folgen einem konsistenten Design-System für eine einheitliche User Experience.

## Button Varianten

### 1. Primary (Lila)
- **Farbe**: #8B5CF6
- **Verwendung**: Hauptaktionen wie "Speichern", "Erstellen", "Bestätigen"
- **Beispiel**: SaveButton für das Speichern von Beiträgen

### 2. Secondary (Grau)
- **Farbe**: #6B7280
- **Verwendung**: Sekundäre Aktionen wie "Bearbeiten", "Optionen"
- **Beispiel**: EditButton für das Bearbeiten von Beiträgen

### 3. LinkedIn (Blau)
- **Farbe**: #0077B5 (offizielles LinkedIn-Blau)
- **Verwendung**: Ausschließlich für LinkedIn-bezogene Aktionen
- **Beispiel**: LinkedInShareButton für das Teilen auf LinkedIn

### 4. Destructive (Rot)
- **Farbe**: #EF4444
- **Verwendung**: Lösch-Aktionen oder gefährliche Operationen
- **Beispiel**: DeleteButton für das Löschen von Beiträgen

### 5. Ghost
- **Farbe**: Transparent mit grauem Text
- **Verwendung**: Tertiäre Aktionen, "Abbrechen", weniger wichtige Aktionen

### 6. Outline
- **Farbe**: Transparenter Hintergrund mit Rahmen
- **Verwendung**: Alternative zu Ghost für mehr Betonung

## Button Größen

- **Small (sm)**: Für kompakte Bereiche und Icon-Buttons
- **Medium (md)**: Standard-Größe für die meisten Aktionen
- **Large (lg)**: Für primäre CTAs und wichtige Aktionen

## Best Practices

### 1. Konsistente Aktions-Buttons verwenden
```tsx
// ✅ Gut - Verwende vordefinierte Action Buttons
import { SaveButton, EditButton } from '@/design-system/components/ActionButtons'

<SaveButton onClick={handleSave} />
<EditButton onClick={handleEdit} />

// ❌ Vermeiden - Eigene Button-Implementierungen
<button className="bg-purple-600">Speichern</button>
```

### 2. Konsistente Button-Texte
- **Speichern**: Immer "Speichern" (nicht "Save", "Sichern", etc.)
- **Bearbeiten**: Immer "Bearbeiten" (nicht "Edit", "Ändern", etc.)
- **Löschen**: Immer "Löschen" (nicht "Delete", "Entfernen", etc.)
- **Abbrechen**: Immer "Abbrechen" (nicht "Cancel", "Zurück", etc.)

### 3. Icon-Verwendung
- Icons links vom Text positionieren
- Konsistente Icon-Größe verwenden (16px für sm/md, 20px für lg)
- Lucide React Icons verwenden für Konsistenz

### 4. Loading States
```tsx
<SaveButton isLoading={isLoading} />
// Zeigt automatisch einen Spinner und "Loading..." Text
```

### 5. Disabled States
- Buttons deaktivieren während Loading oder wenn Aktion nicht verfügbar
- Opacity wird automatisch auf 50% reduziert

## Beispiele

### Formular mit Aktions-Buttons
```tsx
<div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={handleCancel}>
    Abbrechen
  </Button>
  <SaveButton onClick={handleSave} isLoading={isSaving} />
</div>
```

### Post-Aktionen
```tsx
<div className="flex gap-2">
  <EditButton size="sm" onClick={handleEdit} />
  <SaveButton size="sm" onClick={handleSave} text="" />
  <LinkedInShareButton size="sm" postContent={content} />
  <DeleteButton size="sm" onClick={handleDelete} />
</div>
```

### Primäre CTA
```tsx
<Button 
  variant="primary" 
  size="lg" 
  fullWidth
  onClick={handleCreate}
>
  ✨ LinkedIn-Beiträge erstellen
</Button>
```

## Farb-Referenz

```typescript
// Immer Design Tokens verwenden
import { colors } from '@/design-system/tokens/colors'

// Primary: colors.primary.DEFAULT (#8B5CF6)
// LinkedIn: colors.linkedin.DEFAULT (#0077B5)
// Secondary: colors.secondary.DEFAULT (#6B7280)
// Destructive: colors.destructive.DEFAULT (#EF4444)
```

## Migration bestehender Buttons

Wenn Sie bestehende HTML-Buttons oder inkonsistente Button-Implementierungen finden:

1. Identifizieren Sie die Aktion (Speichern, Bearbeiten, etc.)
2. Wählen Sie die passende vordefinierte Komponente
3. Ersetzen Sie den alten Button mit der Design-System Komponente
4. Testen Sie die Funktionalität

## Wartung

- Neue Button-Varianten nur nach Absprache hinzufügen
- Änderungen an Farben nur in den Design Tokens vornehmen
- Bei neuen Features prüfen, ob existierende Buttons wiederverwendet werden können