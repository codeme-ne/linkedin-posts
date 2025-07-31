// LinkedIn API Integration für Draft Posts

interface LinkedInPostRequest {
  author: string;
  commentary: string;
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
  distribution: {
    feedDistribution: 'MAIN_FEED' | 'NONE';
    targetEntities?: string[];
    thirdPartyDistributionChannels?: string[];
  };
  lifecycleState: 'PUBLISHED' | 'DRAFT';
  isReshareDisabledByAuthor: boolean;
}

interface LinkedInApiConfig {
  accessToken: string;
  authorUrn: string; // e.g., "urn:li:person:YOUR_ID" or "urn:li:organization:YOUR_ORG_ID"
}

export class LinkedInAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'LinkedInAPIError';
  }
}

export async function createLinkedInDraftPost(
  content: string, 
  config: LinkedInApiConfig
): Promise<{ postId: string; draftUrl: string }> {
  
  if (!config.accessToken) {
    throw new LinkedInAPIError('LinkedIn Access Token ist erforderlich');
  }
  
  if (!config.authorUrn) {
    throw new LinkedInAPIError('LinkedIn Author URN ist erforderlich');
  }

  const requestBody: LinkedInPostRequest = {
    author: config.authorUrn,
    commentary: content,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: 'DRAFT',
    isReshareDisabledByAuthor: false
  };

  try {
    const response = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'LinkedIn-Version': '202507',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new LinkedInAPIError(
        `LinkedIn API Error: ${response.status} - ${errorText}`,
        response.status
      );
    }

    // Extract Post ID from response headers
    const postId = response.headers.get('x-restli-id');
    
    if (!postId) {
      throw new LinkedInAPIError('Keine Post ID in der Antwort erhalten');
    }

    // Generate LinkedIn Draft URL
    const draftUrl = `https://www.linkedin.com/feed/update/${postId}`;

    return {
      postId,
      draftUrl
    };

  } catch (error) {
    if (error instanceof LinkedInAPIError) {
      throw error;
    }
    
    throw new LinkedInAPIError(
      `Fehler beim Erstellen des LinkedIn Draft Posts: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Alternative: LinkedIn Share Dialog für bessere UX ohne API-Keys
export function createLinkedInShareUrl(content: string): string {
  // Moderne LinkedIn Share Dialog URL
  const shareUrl = new URL('https://www.linkedin.com/sharing/share-offsite/');
  
  // LinkedIn akzeptiert noch immer den 'text' Parameter im Share Dialog
  shareUrl.searchParams.set('text', content);
  
  return shareUrl.toString();
}

// Hilfsfunktion um LinkedIn Profile/Organization URN zu erstellen
export function createLinkedInUrn(type: 'person' | 'organization', id: string): string {
  return `urn:li:${type}:${id}`;
}