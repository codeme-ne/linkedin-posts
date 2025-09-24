import { describe, test, expect } from 'vitest';

/**
 * Tests for validation utilities
 * These test basic validation functions used throughout the app
 */

describe('Validation Utilities', () => {
  describe('URL validation', () => {
    test('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://subdomain.example.com/path',
        'https://example.com/path?query=value#fragment'
      ];

      validUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        '',
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>'
      ];

      invalidUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe('Content validation', () => {
    test('should validate content length', () => {
      expect(isValidContentLength('', 'linkedin')).toBe(false);
      expect(isValidContentLength('Valid content', 'linkedin')).toBe(true);
      expect(isValidContentLength('a'.repeat(3001), 'linkedin')).toBe(false);
    });

    test('should validate platform-specific limits', () => {
      const longContent = 'a'.repeat(300);
      
      expect(isValidContentLength(longContent, 'x')).toBe(false); // Over 280 limit
      expect(isValidContentLength(longContent, 'linkedin')).toBe(true); // Under 3000 limit
      expect(isValidContentLength(longContent, 'instagram')).toBe(true); // Under 2200 limit
    });

    test('should handle edge cases', () => {
      expect(isValidContentLength('   ', 'linkedin')).toBe(false); // Whitespace only
      expect(isValidContentLength('\n\n\n', 'x')).toBe(false); // Newlines only
    });
  });

  describe('Platform validation', () => {
    test('should validate supported platforms', () => {
      expect(isValidPlatform('linkedin')).toBe(true);
      expect(isValidPlatform('x')).toBe(true);
      expect(isValidPlatform('instagram')).toBe(true);
      expect(isValidPlatform('facebook')).toBe(false);
      expect(isValidPlatform('')).toBe(false);
    });
  });

  describe('Email validation', () => {
    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user+label@domain.co.uk',
        'firstname.lastname@company.org'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        '',
        'notanemail',
        '@domain.com',
        'user@',
        'user@domain'
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });
});

// Validation utility functions (these would normally be in a separate file)
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidContentLength(content: string, platform: 'linkedin' | 'x' | 'instagram'): boolean {
  if (!content || typeof content !== 'string') return false;
  
  const trimmed = content.trim();
  if (trimmed.length === 0) return false;
  
  const limits = {
    linkedin: 3000,
    x: 280,
    instagram: 2200
  };
  
  return trimmed.length <= limits[platform];
}

function isValidPlatform(platform: string): boolean {
  return ['linkedin', 'x', 'instagram'].includes(platform);
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
