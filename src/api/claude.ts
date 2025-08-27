import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

const linkedInFromNewsletterPrompt = `
Du bist ein Social-Media-Experte und Ghostwriter für LinkedIn im DACH-Markt.
Du arbeitest für einen beliebten Blogger. Deine Aufgabe: Den folgenden Blogbeitrag/Newsletter in LinkedIn-Posts umwandeln und dabei Stil, Ton und Stimme des Originals so genau wie möglich treffen.

Erzeuge GENAU DREI LinkedIn-Posts.

Harte Format- und Stilregeln (zwingend):
- Jeder Post beginnt mit dem Präfix "LINKEDIN:" (genau so) in der ersten Zeile.
- Trenne die drei Posts mit genau einer Leerzeile.
- Sehr kurze Sätze. Nach jedem Satz eine LEERE Zeile setzen (also eine Zeile auslassen).
- Die ersten ZWEI Sätze sind der Hook und transportieren ~80% der Aussage/Wert des Posts.
- Keine Hashtags. Keine Emojis.
- Ton: gesprächig, klar, autoritativ; professionell-persönlich; Du-Form.
- Struktur: starker Hook → Kernidee(n) in kurzen Sätzen → klare Erkenntnis/Takeaway → dezente Abschlussfrage (Engagement), ebenfalls kurz.
- Bleibe deutlich unter dem LinkedIn-Limit; lieber prägnant als lang.

Best Practices (sichtbar im Text, wenn sinnvoll):
- Mini-Fallbeispiel/Erfahrung für Glaubwürdigkeit.
- Konkrete, umsetzbare Hinweise.
- Zahlen/Signale nutzen, wenn vorhanden.

Blog/Newsletter-Inhalt:
`;

export async function linkedInPostsFromNewsletter(content: string) {
  try {
   const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.7,
    messages: [{
      role: 'user',
      content: `${linkedInFromNewsletterPrompt} ${content}`
    }]
   });
   
   const text = (response.content[0] as { text: string }).text;
   // Robustly parse multi-line blocks starting with LINKEDIN:
   const regex = /(?:^|\n)\s*LINKEDIN:\s*([\s\S]*?)(?=\n\s*LINKEDIN:|$)/g;
   const posts: string[] = [];
   let match: RegExpExecArray | null;
   while ((match = regex.exec(text)) !== null) {
     const body = match[1].trim();
     if (body) posts.push(body);
   }
   // Fallback to line-based parsing if needed
   const parsed = posts.length > 0
     ? posts
     : text.split('\n')
         .filter(line => line.trim().startsWith('LINKEDIN:'))
         .map(line => line.replace(/^\s*LINKEDIN:\s*/, '').trim());

   return parsed.slice(0, 3);
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to remix content');
  }
} 

// === X (Twitter) generation ===
const xFromBlogPrompt_de = `
Du bist ein Twitter-Experte mit authentischer Stimme.

Deine Aufgabe: Wandle den folgenden Blogbeitrag in natürliche, menschliche Tweets um, die klingen wie echte Gedanken - nicht wie Marketing oder Werbung.

Sprache: AUSSCHLIESSLICH Deutsch (DACH). Antworte nur auf Deutsch.

WICHTIGE STILREGELN:
- Authentisch und persönlich schreiben (wie ein echter Mensch, nicht wie eine Marke)
- Kurz und prägnant formulieren (ideal: 70-100 Zeichen)
- Gespräche starten mit Fragen oder Meinungen, die zum Antworten einladen
- Emotionen oder Persönlichkeit zeigen (Überraschung, Begeisterung, Neugierde)
- Mehrwert bieten: nützliche Information, überraschende Erkenntnis oder kluger Gedanke
- Klare Call-to-Actions verwenden, wo sinnvoll ("Was denkt ihr?", "Teilt eure Erfahrung")
- KEINE Hashtags verwenden (0 Hashtags)
- KEINE Emojis verwenden (0 Emojis)

VERMEIDEN:
- Marketing-Sprache und Werbeton ("Entdecke jetzt", "Die besten Tipps")
- Generische Business-Floskeln und Buzzwords
- Komplizierte oder zu lange Sätze
- Hashtags und Emojis (absolut keine)
- Überladene, unauthentische Posts

Format:
- Jeder Tweet ist eigenständig verständlich (keine Threads)
- Maximal 280 Zeichen pro Tweet
- 3-5 Tweets insgesamt
- Gib NUR die Tweets zurück, eine Zeile pro Tweet

Hier ist der Blogbeitrag:
`;

function sanitizeTweet(tweet: string): string {
  let t = tweet.trim();

  // Entferne Hashtags vorsichtshalber
  t = t.replace(/#[^\s#]+/g, '').trim();

  // Entferne gängige Plattform-/Meta-Labels im Text
  t = t
    .replace(/\bX\s*\(Twitter\)\s*·\s*Post\s*#?\d+\b/gi, '')
    .replace(/\bPost\s*#?\d+\b/gi, '')
    .replace(/\bTweet\s*#?\d+\b/gi, '')
    .trim();

  // Entferne führende Labels/Nummerierung (Tweet 1:, Punkt 2:, 1) 1. - * • (1) etc.)
  t = t
    .replace(/^\s*(Tweet|Tweets|Punkt)\s*\d+\s*:\s*/i, '')
  .replace(/^\s*[-*•]\s+/, '')
    .replace(/^\s*\(?\d+\)?\s*[-.)]\s+/, '')
    .replace(/^\s*\(?\d+\/\d+\)?\s+/, '')
    .trim();

  // Entferne Thread-Hinweise (am Anfang oder Ende)
  t = t
    .replace(/\s*\(?\d+\/\d+\)?\s*$/g, '') // z. B. "1/5" am Ende
    .replace(/^\s*(Teil\s*\d+(?:\/\d+)?)\s*[:-]?\s*/i, '')
    .replace(/\b(Thread|Fortsetzung|weiter(\s*geht's)?|Teil\s*\d+)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Entferne Emojis (grobe Unicode-Emoji-Range und gängige Symbole)
  // Hinweis: bewusst konservativ, um deutsche Umlaute/Sonderzeichen nicht zu treffen
  t = t
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u2702-\u27B0]/g, '')
    .trim();

  // Kürze hart auf 280 Zeichen
  if (t.length > 280) t = t.slice(0, 279) + '…';

  return t;
}

export async function xTweetsFromBlog(content: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
  temperature: 0.7,
      messages: [{
        role: 'user',
        content: `${xFromBlogPrompt_de}\n\n${content}`
      }]
    });

    const text = (response.content[0] as { text: string }).text.trim();

  // Primär: zeilenweise Tweets
    let lines = text
      .split(/\r?\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Fallback: falls nur ein Block kam, versuche Aufzählungen zu splitten
    if (lines.length === 1 && /(^|\n)\s*(?:-|\*|\d+\.)\s/.test(text)) {
      lines = text
        .split(/\n\s*(?:-\s|\*\s|\d+\.\s)/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    }

    // Filtere Meta-Zeilen wie "X (Twitter) · Post #1"
    const metaPattern = /^(?:x\s*\(twitter\)|tweet|post)\b|\bpost\s*#?\d+\b|\bx\s*\(twitter\)\s*·/i;
    lines = lines.filter((l) => !metaPattern.test(l));

    // Säubere und dedupliziere Tweets
    const seen = new Set<string>();
    const tweets = lines
      .map(sanitizeTweet)
      // Verweise auf andere Tweets/Listen entfernen
      .filter((t) => !/(?:diese\s+(?:drei|beiden|anderen)|dieser\s+thread|siehe\s+oben|post\s*#\d+|tweet\s*#\d+|teil\s*\d+|weiter\s+geht'?s|these\s+three|as\s+above)/i.test(t))
      // Fremdsprachige Antworten (offensichtlich Englisch) grob rausfiltern
      .filter((t) => {
        // einfache Heuristik: enthält typische deutsche Stoppwörter
        const deWords = /( der | die | das | und | mit | für | nicht | du | deine | deinem | deinen | ein | eine | im | vom | zum | zur )/i;
        return deWords.test(` ${t} `);
      })
      .filter((t) => t.length > 0)
      .filter((t) => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    // Maximal 5 Tweets zurückgeben (0–5 erlaubt)
    return tweets.slice(0, 5);
  } catch (error) {
    console.error('X generation error:', error);
    throw new Error('Failed to generate X tweets');
  }
}
