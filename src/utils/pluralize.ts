/**
 * German pluralization helper
 * @param count - The number to check for pluralization
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word
 * @returns The correct form based on count
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

/**
 * Format count with proper German pluralization
 * @param count - The number to display
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word
 * @returns Formatted string with count and proper form
 */
export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${pluralize(count, singular, plural)}`
}

/**
 * Common German pluralization patterns for the app
 */
export const germanPlurals = {
  post: (count: number) => pluralize(count, 'Beitrag', 'Beiträge'),
  character: (count: number) => pluralize(count, 'Zeichen', 'Zeichen'), // Same in plural
  word: (count: number) => pluralize(count, 'Wort', 'Wörter'),
  result: (count: number) => pluralize(count, 'Ergebnis', 'Ergebnisse'),
  generation: (count: number) => pluralize(count, 'Generierung', 'Generierungen'),
}