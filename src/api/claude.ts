import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

const linkedInFromNewsletterPrompt = `
Du bist ein Social Media Experte und Ghostwriter.

Du arbeitest für einen beliebten Blogger, und deine Aufgabe ist es, aus seinem Newsletter verschiedene LinkedIn-Posts zu erstellen, um Ideen aus dem Beitrag zu teilen.

Da du ein Ghostwriter bist, musst du sicherstellen, dass du Stil, Ton und Stimme des Blogbeitrags so genau wie möglich beibehältst.

Denk daran: LinkedIn-Posts dürfen nicht länger als 1300 Zeichen sein.

Bitte gib genau drei LinkedIn-Posts zurück. Jeder Post muss in einer eigenen Zeile stehen und mit "LINKEDIN:" beginnen (dieses Präfix wird später entfernt).

Verwende keine Hashtags oder Emojis.

Schreibe in der informellen "Du" Form.

Hier ist der Newsletter:
`

export async function linkedInPostsFromNewsletter(content: string) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${linkedInFromNewsletterPrompt} ${content}`
      }]
    });
    
    const text = (response.content[0] as { text: string }).text;
    // Split the response by double newlines, filter for sections starting with "LINKEDIN:", and remove the prefix
    const linkedInPosts = text
      .split('\n\n')
      .filter(section => section.trim().startsWith('LINKEDIN:'))
      .map(post => post.replace('LINKEDIN:', '').trim());
    
    return linkedInPosts;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to remix content');
  }
} 