import type { Platform } from "@/config/platforms";
import type { VoiceTone } from "@/config/voice-tones";
import { DEFAULT_VOICE_TONE } from "@/config/voice-tones";

export function buildSinglePostPrompt(
  content: string,
  platform: Platform,
  regenerationSeed?: number,
  voiceTone?: VoiceTone
): string {
  // Use provided voice tone or default
  const selectedTone = voiceTone || DEFAULT_VOICE_TONE;

  const regenerationPrompt = regenerationSeed
    ? `\n\nVariation ${regenerationSeed}: Create a different approach or focus for diversity while maintaining the ${selectedTone.name} voice.`
    : "";

  // Build enhanced prompts that combine platform requirements with voice tone personality
  const baseSystemPrompt = `You are an expert social media ghostwriter specialized in creating premium, engaging content for European solopreneurs and small companies.

VOICE & PERSONALITY:
${selectedTone.promptModifier}

QUALITY STANDARDS:
- Professional, research-backed content like industry leaders
- Specific examples, company names, and real insights when relevant
- Engaging hooks that immediately capture attention
- Clear value proposition and actionable takeaways
- Authentic voice that builds trust and authority`;

  switch (platform) {
    case "linkedin":
      return `${baseSystemPrompt}

LINKEDIN-SPECIFIC REQUIREMENTS:
Create EXACTLY ONE high-quality LinkedIn post from the provided content.

OUTPUT FORMAT (CRITICAL):
- Return ONLY the pure post text
- NO labels, headings, numbering, or variants
- NO introduction/explanation before or after
- Start with prefix "LINKEDIN:" in the first line

LINKEDIN STRUCTURE & STYLE:
- Opening hook (first 1-2 sentences capture 80% of the value)
- Short sentences with line breaks for readability
- Clear hierarchy: Hook → Core insights → Key takeaway → Engagement question
- Use bullets (↳) or arrows for lists when appropriate
- No hashtags, minimal emojis
- Professional but conversational tone
- Stay well under LinkedIn's limit - be concise and impactful

CONTENT ENHANCEMENT:
- Include specific examples, company names, or case studies when relevant
- Add concrete, actionable insights readers can immediately use
- Use data points or statistics if available in source content
- Create genuine business value, not just motivational content${regenerationPrompt}

Source Content: ${content}`;

    case "x":
      return `${baseSystemPrompt}

X/TWITTER-SPECIFIC REQUIREMENTS:
Create EXACTLY ONE authentic, engaging tweet from the provided content.

OUTPUT FORMAT (CRITICAL):
- Return ONLY the tweet text, no extras
- NO labels, numbering, or variants
- Self-contained (not part of a thread)
- Maximum 280 characters

X STRUCTURE & STYLE:
- Punchy, attention-grabbing opening
- Authentic human voice (not corporate speak)
- Clear value: insight, tip, or thought-provoking statement
- Include call-to-action when natural ("What's your take?" etc.)
- NO hashtags, NO emojis
- Conversational and personal feel

CONTENT APPROACH:
- Focus on one key insight from the source material
- Make it relatable to entrepreneurs and business builders
- Use conversational language that feels genuine
- Avoid marketing-speak or generic business jargon${regenerationPrompt}

Source Content: ${content}`;

    case "instagram":
      return `${baseSystemPrompt}

INSTAGRAM-SPECIFIC REQUIREMENTS:
Create EXACTLY ONE engaging Instagram caption from the provided content.

OUTPUT FORMAT (CRITICAL):
- Return ONLY the pure caption text
- NO labels, numbering, or variants
- NO introduction/explanation
- Start with prefix "INSTAGRAM:" in the first line

INSTAGRAM STRUCTURE & STYLE:
- Compelling hook in first 125 characters (preview text)
- 3-6 concise, engaging sentences
- Use line breaks for readability
- 3-5 relevant hashtags at the end
- Clear call-to-action or question to drive engagement
- Maximum 2,200 characters but stay focused and concise

CONTENT APPROACH:
- Visual storytelling that connects emotionally
- Behind-the-scenes insights or personal perspective
- Actionable advice that followers can implement
- Authentic voice that builds community
- Strategic use of emojis for visual appeal (not excessive)${regenerationPrompt}

Source Content: ${content}`;

    default: {
      // Exhaustive check
      const _exhaustive: never = platform;
      throw new Error(`Unknown platform: ${_exhaustive}`);
    }
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
