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
      return `Du bist ein Social-Media-Experte für LinkedIn im DACH-Markt.
Erstelle GENAU EINEN hochwertigen LinkedIn-Post aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib AUSSCHLIESSLICH den reinen Post-Text zurück.
- KEINE Labels, KEINE Überschriften, KEINE Nummerierung, KEINE Varianten.
- KEINE Einleitung/Erklärung vor oder nach dem Post.

Format- und Stilregeln:
- Beginne direkt mit dem Post-Text (kein Präfix)
- Sehr kurze Sätze mit Leerzeilen dazwischen  
- Die ersten zwei Sätze sind der Hook (~80% der Aussage)
- Keine Hashtags, keine Emojis
- Gesprächiger, klarer Ton in Du-Form
- Struktur: Hook → Kernidee → Takeaway → Engagement-Frage
- Maximum 300 Wörter${regenerationPrompt}

Inhalt: ${content}`;

    case "x":
      return `Erstelle GENAU EINEN prägnanten X/Twitter-Post aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib NUR EINE einzige Zeile mit dem Post-Text zurück.
- KEINE Labels, KEINE Nummerierung, KEINE Varianten, KEINE zusätzlichen Zeilen.
- KEINE Einleitung/Erklärung.

Regeln:
- Maximal 280 Zeichen
- Kein Hashtag, keine Emojis  
- Direkter, persönlicher Ton
- Eine zentrale Aussage oder Erkenntnis
- Call-to-Action oder Denkanstoß${regenerationPrompt}

Inhalt: ${content}`;

    case "instagram":
      return `Erstelle GENAU EINE ansprechende Instagram-Beschreibung aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib AUSSCHLIESSLICH den reinen Post-Text zurück.
- KEINE Labels, KEINE Nummerierung, KEINE Varianten.
- KEINE Einleitung/Erklärung.

Anforderungen:
- Hook in den ersten 125 Zeichen für Preview
- 3-5 Sätze, persönlich und authentisch
- Du-Ansprache
- 3-5 relevante Hashtags am Ende  
- Call-to-Action oder Frage
- Maximum 500 Zeichen${regenerationPrompt}

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
