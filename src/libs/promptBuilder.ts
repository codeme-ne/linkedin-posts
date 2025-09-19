import type { Platform } from "@/config/platforms";

export function buildSinglePostPrompt(
  content: string,
  platform: Platform,
  regenerationSeed?: number
): string {
  const regenerationPrompt = regenerationSeed
    ? `\n\nVariation ${regenerationSeed}: Wähle einen anderen Fokus oder Blickwinkel für mehr Diversität.`
    : "";

  switch (platform) {
    case "linkedin":
      return `Du bist ein Social-Media-Experte und Ghostwriter für LinkedIn im DACH-Markt.
Erstelle GENAU EINEN hochwertigen LinkedIn-Post aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib AUSSCHLIESSLICH den reinen Post-Text zurück.
- KEINE Labels, KEINE Überschriften, KEINE Nummerierung, KEINE Varianten.
- KEINE Einleitung/Erklärung vor oder nach dem Post.
- Beginne mit dem Präfix "LINKEDIN:" (genau so) in der ersten Zeile

Format- und Stilregeln:
- Sehr kurze Sätze mit Leerzeilen dazwischen
- Die ersten zwei Sätze sind der Hook (~80% der Aussage)
- Keine Hashtags, keine Emojis
- Gesprächiger, klarer, autoritativer Ton in Du-Form
- Struktur: starker Hook → Kernidee(n) → klare Erkenntnis/Takeaway → dezente Engagement-Frage
- Bleibe deutlich unter dem LinkedIn-Limit; lieber prägnant als lang

Best Practices:
- Mini-Fallbeispiel/Erfahrung für Glaubwürdigkeit
- Konkrete, umsetzbare Hinweise
- Zahlen/Signale nutzen, wenn vorhanden${regenerationPrompt}

Inhalt: ${content}`;

    case "x":
      return `Du bist ein Twitter-Experte mit authentischer Stimme.
Erstelle GENAU EINEN natürlichen, menschlichen Tweet aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib NUR den Tweet-Text zurück, ohne Einleitung oder Erklärung.
- KEINE Labels, KEINE Nummerierung, KEINE Varianten.
- Eigenständig verständlich (kein Thread)

STILREGELN:
- Authentisch und persönlich (wie ein echter Mensch, nicht wie eine Marke)
- Kurz und prägnant (ideal: 70-100 Zeichen, maximal 280)
- Emotionen oder Persönlichkeit zeigen
- Mehrwert bieten: nützliche Info, überraschende Erkenntnis oder kluger Gedanke
- Call-to-Action wo sinnvoll ("Was denkt ihr?", "Teilt eure Erfahrung")
- KEINE Hashtags, KEINE Emojis

VERMEIDEN:
- Marketing-Sprache und Werbeton
- Generische Business-Floskeln
- Überladene, unauthentische Posts${regenerationPrompt}

Inhalt: ${content}`;

    case "instagram":
      return `Du bist ein erfahrener Social-Media-Content-Creator.
Erstelle GENAU EINE ansprechende Instagram-Beschreibung aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib AUSSCHLIESSLICH den reinen Post-Text zurück.
- KEINE Labels, KEINE Nummerierung, KEINE Varianten.
- KEINE Einleitung/Erklärung.
- Beginne mit dem Präfix "INSTAGRAM:" (genau so) in der ersten Zeile

Anforderungen:
- Starker Hook in den ersten 125 Zeichen für Preview
- Prägnant (3-5 Sätze) und ansprechend
- Du-Ansprache (nicht "ihr")
- 3-5 relevante Hashtags am Ende
- Call-to-Action oder Frage am Ende
- Nutze die maximalen 2.200 Zeichen effektiv (aber bleibe prägnant)

Best Practices:
- Storytelling für Emotionen und Mehrwert
- Emojis sparsam für visuellen Reiz
- Kürzere Absätze für bessere Lesbarkeit
- Authentizität und Konsistenz mit der Stimme des Autors${regenerationPrompt}

Inhalt: ${content}`;

    default:
      // Exhaustive check
      const _exhaustive: never = platform;
      throw new Error(`Unknown platform: ${_exhaustive}`);
  }
}

export function validatePost(post: string, platform: Platform): void {
  const limits: Record<Platform, { min: number; max: number }> = {
    linkedin: { min: 50, max: 1000 },
    x: { min: 20, max: 280 },
    instagram: { min: 50, max: 2200 },
  };

  const limit = limits[platform];

  if (post.length < limit.min) {
    throw new Error(`Post zu kurz (min. ${limit.min} Zeichen)`);
  }
  if (post.length > limit.max) {
    throw new Error(`Post zu lang (max. ${limit.max} Zeichen)`);
  }
}

// Normalize model output to exactly one post
export function normalizeSinglePostResponse(text: string, platform: Platform): string {
  let t = text.trim();

  // Remove common labels/prefixes that sometimes slip in
  t = t.replace(/^\s*(LINKEDIN:|INSTAGRAM:|TWEET:|X:)/i, '').trim();

  // Remove leading numbering/labels like "1)", "1.", "- ", "• ", "Tweet 1:" etc.
  t = t
    .replace(/^\s*(Tweet\s*\d+\s*:\s*)/i, '')
    .replace(/^\s*[-*•]\s+/, '')
    .replace(/^\s*\(?\d+\)?\s*[-.)]\s+/, '')
    .replace(/^\s*\(?\d+\/\d+\)?\s+/, '')
    .trim();

  if (platform === 'x') {
    // For X, take only the first non-empty line
    const firstLine = t.split(/\r?\n/).map(l => l.trim()).find(l => l.length > 0) || '';
    return firstLine.slice(0, 280);
  }

  // If multiple variants are separated by blank lines, take the first block
  const blocks = t.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
  if (blocks.length > 1) {
    t = blocks[0];
  }

  // If the block still contains multiple lines that look like separate items, keep as is;
  // the validatePost will ensure limits. Just return trimmed.
  return t.trim();
}
