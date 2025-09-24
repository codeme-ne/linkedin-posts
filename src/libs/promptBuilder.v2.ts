import type { Platform } from "@/config/platforms";

export interface PostGenerationOptions {
  content: string;
  platform: Platform;
  postGoal?: PostGoal;
  regenerationSeed?: number;
}

export type PostGoal =
  | "thought_leadership"
  | "drive_traffic"
  | "promote_feature"
  | "start_conversation"
  | "share_lessons"
  | "build_awareness";

export interface PostGenerationResponse {
  post_text: string;
  suggested_hashtags?: string[];
  generation_metadata: {
    hook_formula_used: string;
    storytelling_framework_used: string;
    engagement_trigger_used: string;
    post_goal: PostGoal;
  };
}

/**
 * Enhanced prompt builder implementing structured content generation
 * Based on analysis of high-performing LinkedIn content patterns
 */
export function buildStructuredPostPrompt(options: PostGenerationOptions): string {
  const { content, platform, postGoal = "thought_leadership", regenerationSeed } = options;

  const regenerationPrompt = regenerationSeed
    ? `\n\nVariation ${regenerationSeed}: Wähle andere Formeln für mehr Diversität.`
    : "";

  switch (platform) {
    case "linkedin":
      return buildLinkedInPrompt(content, postGoal, regenerationPrompt);
    case "x":
      return buildTwitterPrompt(content, postGoal, regenerationPrompt);
    case "instagram":
      return buildInstagramPrompt(content, postGoal, regenerationPrompt);
    default: {
      const _exhaustive: never = platform;
      throw new Error(`Unknown platform: ${_exhaustive}`);
    }
  }
}

function buildLinkedInPrompt(content: string, postGoal: PostGoal, regenerationPrompt: string): string {
  return `Du bist ein hochspezialisierter LinkedIn Content-Experte für den DACH-Markt.

AUFGABE: Erstelle GENAU EINEN strukturierten LinkedIn-Post aus dem gegebenen Inhalt.

WICHTIG - AUSGABEFORMAT (strikt befolgen):
Gib ein JSON-Objekt zurück mit folgender Struktur:
{
  "post_text": "Der vollständige Post-Text",
  "generation_metadata": {
    "hook_formula_used": "Name der gewählten Hook-Formel",
    "storytelling_framework_used": "Name des Storytelling-Frameworks",
    "engagement_trigger_used": "Name des Engagement-Triggers",
    "post_goal": "${postGoal}"
  }
}

SCHRITT 1: HOOK-FORMEL AUSWÄHLEN
Wähle GENAU EINE Hook-Formel aus dieser Liste:
- "Contrarian Opinion": "Unpopuläre Meinung: [Gegensätzliche Ansicht]"
- "Mistake Story": "Ich machte einen [X]-Fehler, damit du ihn nicht machen musst"
- "Transformation": "Vor [X] Jahren war ich [Situation]. Heute bin ich [Erfolg]"
- "Failure Pattern": "Der #1 Grund warum [übliche Praxis] scheitert"
- "Reality Check": "Die meisten denken [Glaube], aber hier ist was wirklich funktioniert"
- "Bold Statement": "Der eine Satz, der alles ändert"
- "Problem Reveal": "[Problem] ist kein [offensichtliche Ursache]-Problem. Es ist ein [echte Ursache]-Problem"

SCHRITT 2: STORYTELLING-FRAMEWORK AUSWÄHLEN
Wähle GENAU EIN Framework aus dieser Liste:
- "PAS": Problem → Agitate → Solution
- "STAR": Situation → Task → Action → Result
- "Before/After": Ausgangssituation → Transformation → Ergebnis
- "Problem-Solution": Problem definieren → Lösung präsentieren
- "3-Point List": Hauptaussage → 3 unterstützende Punkte → Zusammenfassung
- "Story Arc": Setup → Konflikt → Auflösung → Lektion

SCHRITT 3: ENGAGEMENT-TRIGGER AUSWÄHLEN
Wähle basierend auf post_goal:
- thought_leadership: "Was denkst du darüber?" / "Stimmt ihr zu?"
- drive_traffic: "Mehr Details im Link in den Kommentaren"
- promote_feature: "Wer möchte das ausprobieren?"
- start_conversation: "Teilt eure Erfahrungen!" / "Was ist euer Ansatz?"
- share_lessons: "Welche Lektion habt ihr gelernt?"
- build_awareness: "Kennt ihr das Problem auch?"

CONTENT-REGELN & VERBOTE:
- NIEMALS Corporate Buzzwords: "Synergien", "Paradigmenwechsel", "Leverage", "disruptiv"
- NIEMALS übermäßig werblich oder verkaufsorientiert
- NIEMALS generische Phrasen oder Plattitüden
- IMMER spezifische Beispiele statt Allgemeinplätze
- IMMER authentischer, selbstbewusster aber nicht arroganter Ton

FORMAT-REGELN:
- Sehr kurze Sätze mit Leerzeilen dazwischen
- Du-Form (informell)
- KEINE Hashtags, KEINE Emojis
- Maximum 300 Wörter
- Direkt mit dem Hook beginnen

Post-Ziel: ${postGoal}
${regenerationPrompt}

Inhalt: ${content}`;
}

function buildTwitterPrompt(content: string, postGoal: PostGoal, regenerationPrompt: string): string {
  return `Du bist ein Twitter/X Content-Experte für den deutschsprachigen Raum.

AUFGABE: Erstelle GENAU EINEN strukturierten Tweet aus dem gegebenen Inhalt.

AUSGABEFORMAT (JSON):
{
  "post_text": "Tweet-Text",
  "generation_metadata": {
    "hook_formula_used": "Hook-Name",
    "storytelling_framework_used": "Framework-Name",
    "engagement_trigger_used": "Trigger-Name",
    "post_goal": "${postGoal}"
  }
}

SCHRITT 1: HOOK-FORMEL AUSWÄHLEN
Wähle GENAU EINE Hook-Formel aus dieser Liste:
- "Hot Take": "Unpopuläre Meinung:" / "Kontrovers aber wahr:"
- "Question Hook": "Warum macht [X] das so?" / "Wer kennt das Problem?"
- "Stat Shock": "[Überraschende Statistik]" / "[X]% der Leute wissen nicht:"
- "Personal": "Ich dachte [X], bis [Y] passierte"
- "Contradiction": "Alle sagen [X], aber eigentlich ist es [Y]"
- "Reality Check": "Die harte Wahrheit über [X]:"
- "Time Pressure": "In [Zeit] habe ich gelernt:"
- "Mistake Reveal": "Mein größter [X]-Fehler:"

SCHRITT 2: STORYTELLING-FRAMEWORK AUSWÄHLEN
Wähle GENAU EIN Framework aus dieser Liste:
- "Question-Answer": Provokante Frage → prägnante Antwort
- "List-Insight": Kurzer Hauptpunkt → 2-3 Unterpunkte → Fazit
- "Observation-Conclusion": Beobachtung → Schlussfolgerung
- "Problem-Solution": Kurzes Problem → Kompakte Lösung
- "Before-After": "Früher [X], jetzt [Y]"
- "Thread-Starter": Erstes Statement für längeren Thread

SCHRITT 3: ENGAGEMENT-TRIGGER AUSWÄHLEN
Wähle basierend auf post_goal:
- thought_leadership: "Wie seht ihr das?" / "Bin ich der Einzige?"
- drive_traffic: "Thread dazu:" / "Details im Reply"
- promote_feature: "Wer testet es?" / "Thoughts?"
- start_conversation: "Eure Erfahrungen?" / "Reply mit euren Gedanken"
- share_lessons: "Was habt ihr gelernt?" / "Kennt ihr das?"
- build_awareness: "Wer sieht das auch so?" / "Relatable?"

CONTENT-REGELN & VERBOTE:
- NIEMALS Corporate Buzzwords oder Marketing-Sprech
- NIEMALS zu viele Informationen in einen Tweet pressen
- NIEMALS langweilige "Heute habe ich"-Floskeln
- IMMER direkt zum Punkt
- IMMER meinungsstark oder hilfreich
- IMMER Diskussion fördern

TWITTER-SPEZIFISCHE REGELN:
- Maximum 280 Zeichen (hart einhalten!)
- Direkter, persönlicher Ton ohne Schnörkel
- KEINE Hashtags (außer bei promote_feature max. 1 relevanter)
- KEINE Emojis (außer sparsam bei Instagram-Crosspost)
- Eine zentrale, klare Aussage oder Erkenntnis
- Für Threads: Ersten Tweet so schreiben, dass er allein steht
- Bei Diskussionsthemen: Bewusst polarisieren

ZEICHEN-OPTIMIERUNG:
- Kurze, prägnante Sätze
- Verzichte auf unnötige Füllwörter
- Nutze Abkürzungen wo sinnvoll
- Punkt am Ende oft weglassen für mehr Zeichen

Post-Ziel: ${postGoal}
${regenerationPrompt}

Inhalt: ${content}`;
}

function buildInstagramPrompt(content: string, postGoal: PostGoal, regenerationPrompt: string): string {
  return `Du bist ein Instagram Content-Experte für den DACH-Markt.

AUFGABE: Erstelle GENAU EINE strukturierte Instagram-Caption aus dem gegebenen Inhalt.

AUSGABEFORMAT (JSON):
{
  "post_text": "Caption-Text",
  "suggested_hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "generation_metadata": {
    "hook_formula_used": "Hook-Name",
    "storytelling_framework_used": "Framework-Name",
    "engagement_trigger_used": "Trigger-Name",
    "post_goal": "${postGoal}"
  }
}

SCHRITT 1: HOOK-FORMEL AUSWÄHLEN
Wähle GENAU EINE Hook-Formel aus dieser Liste:
- "Visual Hook": "Das Bild zeigt [X], aber dahinter steckt [Y]"
- "Behind Scenes": "Was ihr nicht seht:" / "Backstage-Moment:"
- "Personal Story": "Heute ist mir [X] passiert" / "Gestern dachte ich noch [X]"
- "Lifestyle": "Mein [Zeitraum] in [Situation]"
- "Transformation": "Früher vs. Heute"
- "Reality Check": "Instagram vs. Realität:"
- "Emotional Hook": "Dieser Moment veränderte alles"
- "Question Hook": "Wer kennt das Gefühl...?"

SCHRITT 2: STORYTELLING-FRAMEWORK AUSWÄHLEN
Wähle GENAU EIN Framework aus dieser Liste:
- "Story-Lesson": Persönliche Geschichte → Lernmoment → Inspiration
- "Visual-Context": Bildbeschreibung → tiefere Bedeutung → Call-to-Action
- "Day-in-Life": Alltag zeigen → Werte vermitteln → Community einladen
- "Behind-the-Scenes": Prozess zeigen → Authentizität → Verbindung schaffen
- "Before-After": Ausgangssituation → Veränderung → Motivation geben
- "Problem-Solution": Herausforderung → Lösung → Inspiration teilen

SCHRITT 3: ENGAGEMENT-TRIGGER AUSWÄHLEN
Wähle basierend auf post_goal:
- thought_leadership: "Was denkst du?" / "Stimmt ihr zu?"
- drive_traffic: "Link in Bio für mehr Details" / "Swipe für mehr Infos"
- promote_feature: "Ausprobiert?" / "Wer ist dabei?"
- start_conversation: "Erzählt in den Kommentaren!" / "Teilt eure Stories!"
- share_lessons: "Was habt ihr gelernt?" / "Eure Erfahrungen?"
- build_awareness: "Kennt ihr das auch?" / "Wer kann sich identifizieren?"

CONTENT-REGELN & VERBOTE:
- NIEMALS Corporate Buzzwords oder Business-Jargon
- NIEMALS übermäßig werblich
- NIEMALS perfekte Instagram-Fake-Realität vorgaukeln
- IMMER authentisch und verletzlich sein
- IMMER persönliche Geschichten über Allgemeinplätze
- IMMER Community-orientiert denken

INSTAGRAM-SPEZIFISCHE REGELN:
- Hook muss in ersten 125 Zeichen funktionieren (Instagram Preview)
- 3-5 Sätze, persönlich und authentisch
- Du-Ansprache (nicht Sie-Form)
- Emojis sparsam verwenden (1-2 pro Absatz maximal)
- Zeilenumbrüche für bessere Lesbarkeit
- 3-5 strategische Hashtags (Mix aus Popular und Nische)
- Maximum 2200 Zeichen (Instagram-Limit)

HASHTAG-STRATEGIE:
- 2 große Hashtags (#motivation #erfolg)
- 2-3 nischige Hashtags (zum Thema passend)
- Keine überstrapazierten Tags (#follow4follow)

Post-Ziel: ${postGoal}
${regenerationPrompt}

Inhalt: ${content}`;
}

/**
 * Parses the structured JSON response from the AI model
 */
export function parseStructuredResponse(response: string): PostGenerationResponse {
  try {
    // Clean response (remove any markdown formatting)
    const cleanResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanResponse);

    // Validate required fields
    if (!parsed.post_text || !parsed.generation_metadata) {
      throw new Error('Missing required fields in response');
    }

    return {
      post_text: parsed.post_text,
      suggested_hashtags: parsed.suggested_hashtags || [],
      generation_metadata: {
        hook_formula_used: parsed.generation_metadata.hook_formula_used || 'Unknown',
        storytelling_framework_used: parsed.generation_metadata.storytelling_framework_used || 'Unknown',
        engagement_trigger_used: parsed.generation_metadata.engagement_trigger_used || 'Unknown',
        post_goal: parsed.generation_metadata.post_goal || 'thought_leadership'
      }
    };
  } catch (error) {
    // Log the failure for monitoring purposes
    console.warn('Failed to parse structured response from AI. Falling back to raw text.', {
      error,
      rawResponse: response,
    });

    // Fallback: treat entire response as post_text if JSON parsing fails
    return {
      post_text: response,
      suggested_hashtags: [],
      generation_metadata: {
        hook_formula_used: 'Fallback',
        storytelling_framework_used: 'Fallback',
        engagement_trigger_used: 'Fallback',
        post_goal: 'thought_leadership'
      }
    };
  }
}