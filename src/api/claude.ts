import Anthropic from '@anthropic-ai/sdk';
import { buildSinglePostPrompt } from '@/libs/promptBuilder';

// API Key wird jetzt serverseitig in der Edge Function verwendet
const CLAUDE_API_KEY = 'not-needed' // Dummy-Wert, wird von Edge Function überschrieben

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: `${window.location.origin}/api/claude` // Absolute URL - nutzt die aktuelle Domain
});

export async function linkedInPostsFromNewsletter(content: string) {
  try {
   const prompt = buildSinglePostPrompt(content, 'linkedin');
   const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.85,
    messages: [{
      role: 'user',
      content: prompt
    }]
   });
   
   const text = (response.content[0] as { text: string }).text;
   // Parse single LinkedIn post
   const regex = /LINKEDIN:\s*([\s\S]*?)$/;
   const match = text.match(regex);

   if (match && match[1]) {
     const postContent = match[1].trim();
     if (postContent) {
       return [postContent]; // Return array with single post
     }
   }

   // Fallback: if no LINKEDIN: prefix found, take the whole text
   const cleanText = text.replace(/^\s*LINKEDIN:\s*/, '').trim();
   return cleanText ? [cleanText] : [];
  } catch {
    throw new Error('Failed to remix content');
  }
} 

// === Instagram generation ===

// === X (Twitter) generation ===

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
    const prompt = buildSinglePostPrompt(content, 'x');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 280,
      temperature: 0.65,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = (response.content[0] as { text: string }).text.trim();

    // Parse single tweet - take the first non-empty line
    const cleanedTweet = sanitizeTweet(text);

    // Return array with single tweet
    return cleanedTweet ? [cleanedTweet] : [];
  } catch {
    throw new Error('Failed to generate X tweets');
  }
}

export async function instagramPostsFromBlog(content: string) {
  try {
    const prompt = buildSinglePostPrompt(content, 'instagram');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.85,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = (response.content[0] as { text: string }).text;
    
    // Parse single Instagram post from XML tags
    const descriptionsMatch = text.match(/<instagram_descriptions>([\s\S]*?)<\/instagram_descriptions>/i);

    if (descriptionsMatch) {
      const descriptionsText = descriptionsMatch[1].trim();
      // Extract single post starting with INSTAGRAM:
      const postMatch = descriptionsText.match(/INSTAGRAM:\s*([\s\S]*?)$/i);
      if (postMatch && postMatch[1]) {
        const postContent = postMatch[1].trim();
        if (postContent) {
          return [postContent]; // Return array with single post
        }
      }
    }

    // Fallback: try to find INSTAGRAM: prefix in full text
    const fallbackMatch = text.match(/INSTAGRAM:\s*([\s\S]*?)$/i);
    if (fallbackMatch && fallbackMatch[1]) {
      const postContent = fallbackMatch[1].trim();
      if (postContent) {
        return [postContent];
      }
    }

    // Last fallback: if no INSTAGRAM: prefix found, take the whole text
    const cleanText = text.replace(/^\s*INSTAGRAM:\s*/, '').trim();
    return cleanText ? [cleanText] : [];
  } catch {
    throw new Error('Failed to generate Instagram posts');
  }
}
