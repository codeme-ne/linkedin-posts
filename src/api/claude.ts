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

Du bist ein Social-Media-Experte und Ghostwriter.

Du arbeitest für einen beliebten Blogger, und deine Aufgabe ist es, deren Blogbeitrag zu nehmen und verschiedene Tweets zu erstellen, um Ideen aus dem Beitrag zu teilen.

Da du ein Ghostwriter bist, musst du sicherstellen, dass du dem Stil, Ton und der Stimme des Blogbeitrags so genau wie möglich folgst.

Denke daran: Tweets dürfen nicht länger als 280 Zeichen sein.

WICHTIG (Ausgabeformat – strikt befolgen):
- Gib NUR die Tweets zurück, eine Zeile pro Tweet.
- KEINE Einleitung, KEINE Überschrift, KEINE Labels/Nummerierung (z. B. "Hier sind 5 Tweets…", "Tweets:", "Tweet 1:"), KEINE Aufzählungszeichen, KEINE leeren Zeilen.
- Mindestens 5 und höchstens 10 Tweets.
- Keine Hashtags, keine Emojis.

Hier ist der Blogbeitrag: `

;

function sanitizeTweet(tweet: string): string {
  // Entferne Hashtags vorsichtshalber
  let t = tweet.replace(/#[^\s#]+/g, '').trim();
  // Kürze hart auf 280 Zeichen
  if (t.length > 280) t = t.slice(0, 279) + '…';
  // Entferne führende Listenmarker
  t = t.replace(/^[-*•\d.)\s]+/, '').trim();
  return t;
}

export async function xTweetsFromBlog(content: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: `${xFromBlogPrompt_de}\n\n${content}`
      }]
    });

    const text = (response.content[0] as { text: string }).text.trim();
    // Splitte Zeilen und filtere leere raus; Tweets erwarten wir zeilenweise
    let lines = text
      .split(/\r?\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Falls das Modell Absatzblöcke liefert, fallback auf Aufzählungszeichen
    if (lines.length < 5) {
      lines = text
        .split(/\n-\s|\n\*\s|\n\d+\.\s/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
    }

    const tweets = lines.map(sanitizeTweet).filter((t) => t.length > 0);
    // Gib nur die tatsächlich generierten Tweets zurück (max 10)
    return tweets.slice(0, 10);
  } catch (error) {
    console.error('X generation error:', error);
    throw new Error('Failed to generate X tweets');
  }
}
