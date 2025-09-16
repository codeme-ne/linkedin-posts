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
Erstelle EINEN hochwertigen LinkedIn-Post aus folgendem Inhalt.

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
      return `Erstelle EINEN prägnanten X/Twitter-Post aus folgendem Inhalt.

Regeln:
- Maximal 280 Zeichen
- Kein Hashtag, keine Emojis  
- Direkter, persönlicher Ton
- Eine zentrale Aussage oder Erkenntnis
- Call-to-Action oder Denkanstoß${regenerationPrompt}

Inhalt: ${content}`;

    case "instagram":
      return `Erstelle EINE ansprechende Instagram-Beschreibung aus folgendem Inhalt.

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
