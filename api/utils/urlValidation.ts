/**
 * SSRF Protection - URL validation utility
 * Prevents Server-Side Request Forgery attacks by blocking:
 * - Private IP ranges (RFC 1918)
 * - Localhost variants
 * - Cloud metadata endpoints
 * - Link-local addresses
 */

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata',
  '169.254.169.254', // AWS/cloud metadata
];

const PRIVATE_IP_PATTERNS = [
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^169\.254\./,                     // Link-local
  /^fc00:/i,                         // IPv6 private
  /^fe80:/i,                         // IPv6 link-local
];

export function isUrlSafe(urlString: string): { safe: boolean; error?: string } {
  try {
    const url = new URL(urlString);

    // Protocol validation
    if (!/^https?:$/.test(url.protocol)) {
      return { safe: false, error: 'Only HTTP and HTTPS protocols allowed' };
    }

    const hostname = url.hostname.toLowerCase();

    // Block known dangerous hosts
    if (BLOCKED_HOSTS.includes(hostname)) {
      return { safe: false, error: 'This hostname is not allowed' };
    }

    // Block private IP ranges
    if (PRIVATE_IP_PATTERNS.some(pattern => pattern.test(hostname))) {
      return { safe: false, error: 'Private IP addresses not allowed' };
    }

    return { safe: true };
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }
}
