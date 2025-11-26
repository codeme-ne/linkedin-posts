/**
 * Safe JSON parsing with size limits
 * Prevents memory exhaustion from large payloads
 */

const DEFAULT_MAX_SIZE = 1024 * 1024; // 1MB default

export type SafeJsonResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function parseJsonSafely<T>(
  req: Request,
  maxSizeBytes: number = DEFAULT_MAX_SIZE
): Promise<SafeJsonResult<T>> {
  try {
    // Check Content-Length header first (fast rejection)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
      return { success: false, error: 'Request body too large' };
    }

    // Read body as text with size check
    const text = await req.text();

    if (text.length > maxSizeBytes) {
      return { success: false, error: 'Request body exceeds size limit' };
    }

    if (!text.trim()) {
      return { success: false, error: 'Empty request body' };
    }

    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' };
    }
    return { success: false, error: 'Failed to parse request body' };
  }
}
