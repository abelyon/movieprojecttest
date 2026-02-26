/**
 * Netflix-style maturity ratings: ALL, 7+, 10+, 13+, 16+, 18+
 * Maps TMDB certifications (any country) to this scale.
 */
export type NetflixRating = 'ALL' | '7+' | '10+' | '13+' | '16+' | '18+';

const ALL_AUDIENCE_ALIASES = ['g', 'u', 'all', 'nr', 'unrated', '0', '1', '2', '3', '4', '5', '6', 'general', 'universal'];

/**
 * Map raw certification string (e.g. "12", "PG-13", "16", "K-12") to Netflix-style rating.
 */
export function certificationToNetflix(value: string | null | undefined): NetflixRating | null {
  if (value == null || value === '') return null;
  const s = value.trim();
  if (s === '') return null;

  const lower = s.toLowerCase();
  if (ALL_AUDIENCE_ALIASES.includes(lower)) return 'ALL';

  const numbers = s.match(/\d+/g);
  if (!numbers || numbers.length === 0) return 'ALL';

  const age = numbers.reduce((a, b) => Math.max(a, parseInt(b, 10)), 0);

  if (age <= 6) return 'ALL';
  if (age <= 9) return '7+';
  if (age <= 12) return '10+';
  if (age <= 15) return '13+';
  if (age <= 17) return '16+';
  return '18+';
}

/**
 * Format for display: Netflix-style label (ALL, 7+, 10+, 13+, 16+, 18+).
 */
export function certificationDisplay(value: string | null | undefined): string | null {
  return certificationToNetflix(value);
}
