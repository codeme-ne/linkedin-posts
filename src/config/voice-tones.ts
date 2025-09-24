/**
 * Voice Tone Engine - Premium Writing Styles for Social Content Generation
 * Inspired by EasyGen's sophisticated tone system for high-quality LinkedIn posts
 */

export interface VoiceTone {
  id: string
  name: string
  emoji: string
  description: string
  characteristics: string[]
  promptModifier: string
  color: string
  bgColor: string
}

/**
 * Premium voice tones for professional social media content
 * Each tone produces distinctly different writing styles and personalities
 */
export const VOICE_TONES: VoiceTone[] = [
  {
    id: 'casual-witty',
    name: 'Casual & Witty',
    emoji: '💬',
    description: 'Punchy, first-person riffs with short, staccato sentences, playful sarcasm, and quick take-home lines that feel like a high-engagement LinkedIn scroll.',
    characteristics: [
      'Short, punchy sentences',
      'Playful sarcasm and wit',
      'High-engagement hooks',
      'Conversational first-person tone',
      'Quick take-home insights'
    ],
    promptModifier: `Write in a casual, witty style with:
- Short, punchy sentences that grab attention
- Playful sarcasm and clever observations
- First-person perspective that feels conversational
- Quick take-home lines that stick
- High-engagement hooks that make people want to scroll
- Use line breaks for rhythm and impact
- Include relatable, slightly sarcastic commentary`,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'clear-actionable',
    name: 'Clear & Actionable',
    emoji: '🎯',
    description: 'Straight-shooting, no-fluff prose that turns big ideas into simple steps, packed with memorable analogies and habit-building heuristics.',
    characteristics: [
      'No-fluff, direct communication',
      'Big ideas broken into simple steps',
      'Memorable analogies',
      'Habit-building focus',
      'Actionable takeaways'
    ],
    promptModifier: `Write in a clear, actionable style with:
- Direct, no-fluff language that gets to the point
- Break down complex ideas into simple, numbered steps
- Use memorable analogies to explain concepts
- Focus on habit-building and practical application
- Include specific, actionable takeaways
- Structure content with clear hierarchy (lists, bullets)
- Make every sentence contribute to understanding or action`,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'vulnerable-empathic',
    name: 'Vulnerable & Empathic',
    emoji: '💙',
    description: 'Warm, first-person reflection that blends personal confession with research-backed insights, inviting readers into shared humanity.',
    characteristics: [
      'Warm, personal storytelling',
      'Vulnerable confessions',
      'Research-backed insights',
      'Shared humanity focus',
      'Emotional connection'
    ],
    promptModifier: `Write in a vulnerable, empathic style with:
- Warm, personal first-person reflection
- Share honest confessions and real struggles
- Blend personal experience with research-backed insights
- Create emotional connection through shared humanity
- Use inclusive language that invites readers in
- Show vulnerability while maintaining hope
- Balance personal stories with valuable insights`,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'visionary-optimist',
    name: 'Visionary & Tech-Optimist',
    emoji: '🚀',
    description: 'Future-casting enthusiasm that mixes market maps, sci-fi metaphors, and bold predictions to sell an expansive, hopeful view of what\'s next.',
    characteristics: [
      'Future-focused perspective',
      'Bold predictions',
      'Sci-fi metaphors',
      'Market trend analysis',
      'Expansive, hopeful vision'
    ],
    promptModifier: `Write in a visionary, tech-optimist style with:
- Future-casting enthusiasm and bold predictions
- Use sci-fi metaphors and futuristic language
- Paint expansive, hopeful pictures of what's coming
- Include market trends and industry insights
- Demonstrate deep understanding of technology trajectory
- Express genuine excitement about possibilities
- Balance ambitious vision with credible analysis`,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  {
    id: 'direct-response',
    name: 'Direct-Response Persuasive',
    emoji: '⚡',
    description: 'Benefit-led, reader-focused prose that hits pain → solution → proof → call-to-action in tight, urgent, ad-ready language.',
    characteristics: [
      'Benefit-led messaging',
      'Pain → Solution → Proof flow',
      'Urgent, compelling language',
      'Reader-focused approach',
      'Clear call-to-action'
    ],
    promptModifier: `Write in a direct-response persuasive style with:
- Lead with clear benefits for the reader
- Follow pain → solution → proof → call-to-action structure
- Use urgent, compelling language that creates FOMO
- Focus entirely on what the reader gets/achieves
- Include social proof and specific results
- End with clear, actionable next steps
- Write like a high-converting ad or sales page`,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200'
  }
]

/**
 * Get voice tone by ID
 */
export const getVoiceTone = (id: string): VoiceTone | undefined => {
  return VOICE_TONES.find(tone => tone.id === id)
}

/**
 * Default voice tone for new users
 */
export const DEFAULT_VOICE_TONE = VOICE_TONES[0] // Casual & Witty

/**
 * Voice tone groups for UI organization
 */
export const VOICE_TONE_GROUPS = {
  engaging: ['casual-witty', 'vulnerable-empathic'],
  professional: ['clear-actionable', 'visionary-optimist'],
  persuasive: ['direct-response']
}