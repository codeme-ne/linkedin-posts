import Anthropic from '@anthropic-ai/sdk';

// API Key wird jetzt serverseitig in der Edge Function verwendet
const CLAUDE_API_KEY = 'not-needed' // Dummy-Wert, wird von Edge Function überschrieben

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: 'https://linkedin-posts-ashen.vercel.app/api/claude' // Produktions-URL für Edge Function
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
const newsletterFromTopicPrompt = `
Du bist ein erfahrener Newsletter-Experte und Content-Creator im deutschen Markt.
Deine Aufgabe: Erstelle einen professionellen, ansprechenden Newsletter basierend auf dem gegebenen Thema.

Erzeuge einen Newsletter mit drei Komponenten:
1. SUBJECT: Eine packende Betreffzeile (30-50 Zeichen)
2. PREVIEW: Ein kurzer Vorschautext (80-120 Zeichen) 
3. CONTENT: Der vollständige Newsletter-Inhalt

Format-Anforderungen:
- Beginne mit "SUBJECT:" gefolgt von der Betreffzeile
- Dann "PREVIEW:" gefolgt vom Vorschautext
- Dann "CONTENT:" gefolgt vom Newsletter-Inhalt
- Verwende einen klaren, professionellen Ton
- Strukturiere den Content mit Überschriften, Absätzen und Listen
- Füge eine klare Call-to-Action am Ende hinzu

Newsletter-Länge basierend auf Parameter:
- Kurz: 300-500 Wörter
- Mittel: 500-800 Wörter  
- Lang: 800-1200 Wörter

Voice Tone anpassen basierend auf Parameter:
- Professional: Formal, sachlich, fachkundig
- Casual: Locker, freundlich, nahbar
- Informative: Faktenorientiert, lehrreich, detailliert
- Persuasive: Überzeugend, motivierend, handlungsorientiert
- Friendly: Warm, einladend, persönlich
- Authoritative: Selbstsicher, kompetent, führend

Thema und Parameter:
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

export async function newsletterFromTopic(
  topic: string, 
  voiceTone: string = 'professional', 
  length: string = 'medium'
): Promise<{ subject: string; preview: string; content: string }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `${newsletterFromTopicPrompt}
Thema: ${topic}
Voice Tone: ${voiceTone}
Länge: ${length}`
      }]
    });
    
    const text = (response.content[0] as { text: string }).text;
    
    // Parse the response to extract subject, preview, and content
    const subjectMatch = text.match(/SUBJECT:\s*(.+?)(?=\n|$)/i);
    const previewMatch = text.match(/PREVIEW:\s*(.+?)(?=\n|$)/i);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+?)$/i);
    
    if (!subjectMatch || !previewMatch || !contentMatch) {
      throw new Error('Unvollständige Newsletter-Generierung');
    }
    
    return {
      subject: subjectMatch[1].trim(),
      preview: previewMatch[1].trim(),
      content: contentMatch[1].trim()
    };
  } catch (error) {
    console.error('Newsletter generation error:', error);
    throw new Error('Newsletter konnte nicht erstellt werden');
  }
}

// === Instagram generation ===
const instagramFromBlogPrompt_de = `
Du bist ein erfahrener Social-Media-Content-Creator mit der Aufgabe, deutsche Blogpost- oder Newsletter-Inhalte in ansprechende Instagram-Beschreibungen umzuwandeln. Dein Ziel ist es, drei unterschiedliche Instagram-Beschreibungen zu erstellen, die den Kern des ursprünglichen Inhalts erfassen und dabei die Instagram-Best-Practices berücksichtigen.

Hier ist der deutsche Blogpost oder Newsletter, den du analysieren sollst:

<blogpost>
{{BLOGPOST}}
</blogpost>

Bitte folge diesen Schritten, um drei Instagram-Beschreibungen basierend auf dem obigen Inhalt zu erstellen. Lege deinen Denkprozess in <analyse_und_planung> Tags dar:

1. Analysiere den Blogpost:
   - Identifiziere den Schreibstil, Ton und einzigartige Ausdrücke des Autors
   - Liste charakteristische Phrasen oder Redewendungen auf
   - Notiere die Hauptthemen oder -themen
   - Schreibe wichtige Zitate auf, die die Hauptpunkte repräsentieren

2. Extrahiere drei unterschiedliche Kernelemente oder Hauptpunkte aus dem Blogpost. Diese werden die Grundlage für deine Instagram-Beschreibungen bilden.

3. Für jedes Kernelement:
   - Wähle ein passendes Zitat aus
   - Erstelle eine Liste von 10-15 relevanten Hashtags, wobei die Hälfte allgemeine, weitreichende Begriffe zum Themenbereich sein sollten und die andere Hälfte sehr spezifische und nischenbasierte Hashtags
   - Wähle 3-5 der besten Hashtags aus und begründe deine Auswahl
   - Berücksichtige die Zielgruppe (18-30 jährige deutsche Instagram-Nutzer) und erkläre, wie dieses Kernelement sie ansprechen kann

4. Plane für jedes Kernelement eine Instagram-Beschreibung, die:
   - Den Stil und Ausdruck des Autors beibehält
   - Prägnant (3-5 Sätze) und ansprechend ist
   - Die ausgewählten 3-5 relevanten Hashtags aus deiner Liste enthält
   - Mit einem Call-to-Action oder einer Frage endet
   - Die Zielgruppe anspricht (verwende "du" statt "ihr")

5. Berücksichtige diese Instagram-Best-Practices für jede Beschreibung:
   - Nutze die maximalen 2.200 Zeichen effektiv
   - Erstelle einen starken Hook in den ersten 125 Zeichen, um Aufmerksamkeit zu erregen
   - Verwende Storytelling, um Emotionen zu wecken und Mehrwert zu bieten
   - Füge einen klaren Call-to-Action (CTA) hinzu
   - Verwende Emojis sparsam für visuellen Reiz
   - Teile den Text in kürzere Absätze für bessere Lesbarkeit
   - Bewahre Authentizität und Konsistenz mit der Markenstimme
   - Stelle sicher, dass jeder Post ohne Kontext von den anderen eigenständig funktioniert

6. Erstelle deine drei Instagram-Beschreibungen unter Berücksichtigung aller oben genannten Punkte.

7. Überprüfe und verfeinere jede Beschreibung:
   - Zähle die Zeichen, um sicherzustellen, dass sie unter 2.200 bleiben
   - Stelle sicher, dass sie alle Anforderungen und Best Practices erfüllt
   - Prüfe, ob der Stil und Ton des ursprünglichen Autors beibehalten wurde

Nach Abschluss deiner Analyse und Planung erstelle bitte drei Instagram-Beschreibungen basierend auf dem Blogpost-Inhalt. Formatiere deine Ausgabe wie folgt:

<instagram_descriptions>
INSTAGRAM: [Erste Instagram-Beschreibung]

INSTAGRAM: [Zweite Instagram-Beschreibung]

INSTAGRAM: [Dritte Instagram-Beschreibung]
</instagram_descriptions>

Beachte:
- Schreibe auf Deutsch
- Jede Beschreibung sollte sich auf ein anderes Kernelement aus dem ursprünglichen Inhalt konzentrieren
- Behalte durchgehend die Stimme und den Stil des Autors bei
- Halte dich an die oben genannten Instagram-Best-Practices
- Sprich die Zielgruppe mit "du" an, nicht mit "ihr"
- Füge keine erklärenden Texte nach der dritten Instagram-Beschreibung hinzu

Deine Beschreibungen sollten einzigartig, ansprechend und für Instagram optimiert sein, während sie der Botschaft und dem Ton des ursprünglichen Inhalts treu bleiben.
`;

// === X (Twitter) generation ===
const xFromBlogPrompt_de = `
Sie sind ein erfahrener Content-Marketer mit der Aufgabe, ansprechende Tweets aus einem Blogbeitrag zu erstellen. Ihr Ziel ist es, 5 unterschiedliche Tweets zu verfassen, die das Wesen des Blogbeitrags erfassen und dabei den einzigartigen Schreibstil des Autors beibehalten. Diese Tweets sollen auf Deutsch sein, unabhängig von der Sprache des ursprünglichen Blogbeitrags.

Hier ist der Blogbeitrag, den Sie analysieren sollen:

<blogpost>
{{BLOGPOST}}
</blogpost>

Bevor Sie die Tweets erstellen, analysieren Sie bitte den Blogbeitrag gründlich. Wrap your analysis in <blogpost_analysis> tags:

<blogpost_analysis>
1. Identifizieren Sie 5-7 Hauptpunkte oder interessante Fakten aus dem Blogbeitrag. Für jeden Punkt:
   a. Zitieren Sie die relevante Passage aus dem Blogbeitrag.
   b. Falls der Blogbeitrag nicht auf Deutsch ist, geben Sie eine kurze deutsche Übersetzung des Zitats.
   c. Beschreiben Sie, wie dieser Punkt in einen Tweet umgewandelt werden könnte.

2. Beschreiben Sie den Schreibstil und Ton des Autors. Notieren Sie spezifische Phrasen oder Satzstrukturen, die charakteristisch für den Autor sind.

3. Für jeden Hauptpunkt, entwickeln Sie eine Tweet-Idee:
   a. Formulieren Sie den Tweet auf Deutsch.
   b. Zählen Sie die Zeichen laut, indem Sie jedes Wort mit einer Nummer versehen (z.B. 1.Dieses 2.ist 3.ein 4.Beispieltweet).
   c. Notieren Sie, wie der Stil und Ton des Tweets dem des Autors entspricht.
   d. Wenn die Zeichenzahl 280 überschreitet, überarbeiten und zählen Sie erneut, bis der Tweet passt.

4. Identifizieren Sie potenzielle "Scrollstopper"-Elemente für jeden Tweet, die die Leser zum Innehalten und Interagieren bringen könnten.

5. Basierend auf dem Inhalt, beschreiben Sie die Zielgruppe und wie die Tweets für deutschsprachige Leser ansprechend gestaltet werden können.

6. Wählen Sie die 5 besten Tweet-Ideen aus, die verschiedene Aspekte des Blogbeitrags abdecken und innerhalb des Zeichenlimits liegen.
</blogpost_analysis>

Erstellen Sie nun 5 Tweets basierend auf Ihrer Analyse. Jeder Tweet sollte einen anderen Hauptpunkt oder eine wichtige Idee aus dem Inhalt hervorheben. Befolgen Sie diese Richtlinien:

1. Schreiben Sie alle Tweets auf Deutsch, unabhängig von der Originalsprache des Blogbeitrags.
2. Stellen Sie sicher, dass jeder Tweet in sich geschlossen ist und ohne Kontext aus den anderen Tweets verstanden werden kann.
3. Behalten Sie durchgehend den Schreibstil und Ton des Autors bei.
4. Konzentrieren Sie sich auf interessante, überraschende oder zum Nachdenken anregende Fakten oder Ideen aus dem Blogbeitrag. Diese sollten als "Scrollstopper" fungieren - Inhalte, die Leser zum Innehalten und Interagieren bringen.
5. Halten Sie jeden Tweet innerhalb des Twitter-Limits von 280 Zeichen.
6. Verwenden Sie keine Emojis in den Tweets.
7. Vermeiden Sie die Verwendung von Hashtags, es sei denn, sie werden speziell im Blogbeitrag erwähnt.
8. Verwenden Sie keine Twitter-spezifischen Funktionen wie @mentions oder URLs, es sei denn, sie sind entscheidend für den Inhalt des Blogbeitrags.
9. Wenn es relevante Statistiken oder Zitate im Blogbeitrag gibt, erwägen Sie, diese gegebenenfalls einzubauen.
10. Formulieren Sie die Tweets nicht als Empfehlungen oder Anweisungen (z.B. vermeiden Sie Phrasen wie "Machen Sie dies..." oder "Sie sollten...").
11. Konzentrieren Sie sich auf konkrete, wertvolle Informationen. Vermeiden Sie allgemeine Aussagen oder Verallgemeinerungen.

Präsentieren Sie Ihre Tweets in folgendem Format:

<tweets>
<tweet1>
[Tweet-Inhalt für den ersten Hauptpunkt auf Deutsch]
</tweet1>

<tweet2>
[Tweet-Inhalt für den zweiten Hauptpunkt auf Deutsch]
</tweet2>

<tweet3>
[Tweet-Inhalt für den dritten Hauptpunkt auf Deutsch]
</tweet3>

<tweet4>
[Tweet-Inhalt für den vierten Hauptpunkt auf Deutsch]
</tweet4>

<tweet5>
[Tweet-Inhalt für den fünften Hauptpunkt auf Deutsch]
</tweet5>
</tweets>

Denken Sie daran, dass jeder Tweet ein "Scrollstopper" sein sollte, der plausibel vom ursprünglichen Autor zur Förderung seines Blogbeitrags geschrieben worden sein könnte, gegebenenfalls ins Deutsche übersetzt. Ziel ist es, die Aufmerksamkeit des Lesers zu fesseln und ihn dazu zu ermutigen, sich mit dem vollständigen Blogbeitrag auseinanderzusetzen.`;

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
    // Replace {{BLOGPOST}} placeholder with actual content
    const promptWithContent = xFromBlogPrompt_de.replace('{{BLOGPOST}}', content);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: promptWithContent
      }]
    });

    const text = (response.content[0] as { text: string }).text.trim();

    // Parse tweets from XML tags
    const tweets: string[] = [];
    
    // Extract tweets from <tweet1> through <tweet5> tags
    for (let i = 1; i <= 5; i++) {
      const regex = new RegExp(`<tweet${i}>\\s*([\\s\\S]*?)\\s*</tweet${i}>`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        const tweetContent = match[1].trim();
        // Remove placeholder text if present
        if (!tweetContent.startsWith('[') && tweetContent.length > 0) {
          tweets.push(tweetContent);
        }
      }
    }

    // Fallback: if no XML tags found, try line-based parsing
    if (tweets.length === 0) {
      let lines = text
        .split(/\r?\n+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      // Filter out meta lines and analysis content
      lines = lines.filter((l) => 
        !l.startsWith('<') && 
        !l.includes('tweet1>') && 
        !l.includes('tweet2>') &&
        !l.includes('tweet3>') &&
        !l.includes('tweet4>') &&
        !l.includes('tweet5>') &&
        !l.includes('blogpost_analysis>') &&
        !l.includes('tweets>')
      );
      
      lines.forEach(line => {
        if (line.length > 10 && line.length <= 280) {
          tweets.push(line);
        }
      });
    }

    // Clean and deduplicate tweets
    const seen = new Set<string>();
    const finalTweets = tweets
      .map(sanitizeTweet)
      .filter((t) => t.length > 0)
      .filter((t) => {
        const key = t.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    
    // Return up to 5 tweets
    return finalTweets.slice(0, 5);
  } catch (error) {
    console.error('X generation error:', error);
    throw new Error('Failed to generate X tweets');
  }
}

export async function instagramPostsFromBlog(content: string) {
  try {
    // Replace {{BLOGPOST}} placeholder with actual content
    const promptWithContent = instagramFromBlogPrompt_de.replace('{{BLOGPOST}}', content);
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: promptWithContent
      }]
    });

    const text = (response.content[0] as { text: string }).text;
    
    // Parse Instagram posts from XML tags
    const posts: string[] = [];
    
    // First try to extract from instagram_descriptions tags
    const descriptionsMatch = text.match(/<instagram_descriptions>([\s\S]*?)<\/instagram_descriptions>/i);
    if (descriptionsMatch) {
      const descriptionsText = descriptionsMatch[1];
      // Extract posts starting with INSTAGRAM:
      const regex = /(?:^|\n)\s*INSTAGRAM:\s*([\s\S]*?)(?=\n\s*INSTAGRAM:|$)/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(descriptionsText)) !== null) {
        const body = match[1].trim();
        if (body) posts.push(body);
      }
    }
    
    // Fallback to line-based parsing if needed
    if (posts.length === 0) {
      const parsed = text.split('\n')
        .filter(line => line.trim().startsWith('INSTAGRAM:'))
        .map(line => line.replace(/^\s*INSTAGRAM:\s*/, '').trim())
        .filter(line => line.length > 0);
      posts.push(...parsed);
    }

    // Clean and return up to 3 posts
    const finalPosts = posts
      .filter(post => post.length > 0)
      .slice(0, 3);

    return finalPosts;
  } catch (error) {
    console.error('Instagram generation error:', error);
    throw new Error('Failed to generate Instagram posts');
  }
}
