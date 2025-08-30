export type ExtractResult = {
  title?: string;
  byline?: string | null;
  excerpt?: string | null;
  content: string; // plain text
  length?: number;
  siteName?: string | null;
};

// Resolve base URL for API when running locally vs deployed
function apiBase() {
  // Use same origin during local dev/preview. In production, replace with your domain if needed.
  return '';
}

export async function extractFromUrl(url: string): Promise<ExtractResult> {
  const res = await fetch(`${apiBase()}/api/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Extraction failed (${res.status}): ${t || res.statusText}`);
  }
  return res.json();
}
