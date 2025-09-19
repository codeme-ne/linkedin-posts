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
      return `Du bist ein Social-Media-Experte und Ghostwriter für LinkedIn im DACH-Markt. Erstelle genau einen hochwertigen LinkedIn-Post aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):

Gib ausschließlich den reinen Post-Text zurück (keine Erläuterungen).

Keine Labels, keine Überschriften, keine Nummerierung, keine Varianten.

Keine Einleitung/Erklärung vor oder nach dem Post.

Beginne mit dem Präfix LINKEDIN: (genau so) in der ersten Zeile.

Format- und Stilregeln:

Sehr kurze Sätze mit Leerzeilen dazwischen für Lesbarkeit.

Die ersten zwei Sätze bilden den Hook (~80% der Kernbotschaft).

Keine Hashtags, keine Emojis.

Gesprächiger, klarer, vertrauenswürdiger und autoritativer Ton in Du-Form.

Struktur: starker Hook → Kernidee(n) → klare Erkenntnis/Takeaway → dezente Engagement-Frage.

Bleibe deutlich unter dem LinkedIn-Limit; lieber prägnant als zu lang.

Best Practices:

Richte den Inhalt an ein professionelles LinkedIn-Publikum aus (fachlich fundiert und relevant).

Mini-Fallbeispiel oder persönliche Erfahrung einbauen für Glaubwürdigkeit.

Konkrete, umsetzbare Tipps geben, wo möglich.

Zahlen/Fakten verwenden, wenn vorhanden, um Inhalte zu untermauern.${regenerationPrompt}

Inhalt: ${content}

(Basierend auf dem LinkedIn-Prompt-Template aus dem Repository codeme-ne/linkedin-posts)`;

    case "x":
      return `Du bist ein Twitter-Experte mit authentischer Stimme. Erstelle genau einen natürlichen, menschlichen Tweet aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):

Gib nur den Tweet-Text zurück, ohne Einleitung oder Erklärung.

Keine Labels, keine Nummerierung, keine Varianten im Output.

Der Tweet muss für sich allein verständlich sein (kein Thread).

STILREGELN:

Authentisch und persönlich schreiben (wie ein echter Mensch, nicht wie eine Marke).

Kurz und prägnant formulieren (ideal 70–100 Zeichen, max. 280 Zeichen).

Emotionen und Persönlichkeit einfließen lassen.

Einen Mehrwert bieten – z. B. nützliche Info, überraschende Erkenntnis oder ein kluger Gedanke.

Call-to-Action stellen, wo sinnvoll (z. B. „Was denkt ihr?", „Teilt eure Erfahrung.").

Relevante Trending-Hashtags verwenden, falls passend (sparsam, max. 1–2).

Keine Emojis nutzen, um die Authentizität zu wahren.

VERMEIDEN:

Marketing-Sprache oder werblichen Ton unbedingt vermeiden.

Keine generischen Business-Floskeln verwenden.

Überladene, unnatürliche Formulierungen meiden.

(Zielgruppe: breite Twitter-Community – der Tweet soll auf Anhieb verständlich und interessant für viele sein.)${regenerationPrompt}

Inhalt: ${content}`;

    case "instagram":
      return `Du bist ein erfahrener Social-Media-Content-Creator. Erstelle genau eine ansprechende Instagram-Beschreibung aus folgendem Inhalt.

WICHTIG (Ausgabeformat – strikt befolgen):

Gib ausschließlich den reinen Post-Text zurück (ohne Erklärungen).

Keine Labels, keine Nummerierung, keine Varianten.

Keine Einleitung/Erklärung vor oder nach dem Text.

Beginne mit dem Präfix INSTAGRAM: (genau so) in der ersten Zeile.

Anforderungen:

Starker Hook innerhalb der ersten 125 Zeichen, der Neugier weckt.

Prägnant (3–5 Sätze), locker und ansprechend formuliert.

Direkte Du-Ansprache (nicht „ihr") an den Leser.

3–5 relevante Hashtags am Ende einfügen.

Am Schluss eine Call-to-Action oder Frage stellen, um Interaktion zu fördern.

Nutze bis zu 2.200 Zeichen, aber bleibe möglichst knackig.

Best Practices:

Storytelling nutzen, um Emotionen zu wecken und Mehrwert zu bieten.

Emojis sparsam einsetzen für visuellen Reiz (passende Emojis unterstützen die Aussage).

Text in kurzen Absätzen strukturieren für bessere Lesbarkeit.

Authentisch bleiben und konsistent in der Stimme des Autors schreiben.

Denke an deine Instagram-Community: persönlicher, freundlicher Ton, als würdest du mit Freunden sprechen.${regenerationPrompt}

Inhalt: ${content}

(Basierend auf dem Instagram-Prompt-Template aus dem Repository codeme-ne/linkedin-posts)`;

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
    // For X/Twitter, respect the 280 character limit but preserve the full text
    // Don't truncate to just the first line - that destroys the content!
    return t.slice(0, 280);
  }

  // For LinkedIn and Instagram, preserve the full formatted content
  // The prompts specifically ask for line breaks and formatting
  // Don't truncate at double line breaks - that's intended formatting!

  // Only check if there are multiple numbered variants (e.g., "1. Post one\n\n2. Post two")
  // In that case, take the first variant
  const numberedVariants = t.match(/^\s*\d+\.\s+.+?(?=\n\s*\d+\.\s+|$)/gms);
  if (numberedVariants && numberedVariants.length > 1) {
    // Multiple numbered posts detected, take the first one
    t = numberedVariants[0].replace(/^\s*\d+\.\s*/, '').trim();
  }

  // Return the full content, validatePost will check the length limits
  return t.trim();
}
