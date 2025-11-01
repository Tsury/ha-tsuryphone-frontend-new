/**
 * Generate consistent avatar colors based on contact name
 */

const AVATAR_COLORS = [
  '#1976d2', // Blue
  '#388e3c', // Green
  '#d32f2f', // Red
  '#7b1fa2', // Purple
  '#f57c00', // Orange
  '#0097a7', // Cyan
  '#c2185b', // Pink
  '#5d4037', // Brown
  '#455a64', // Blue Grey
  '#689f38', // Light Green
  '#0288d1', // Light Blue
  '#e64a19', // Deep Orange
];

/**
 * Simple hash function for strings
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a consistent color for a given name
 */
export function getAvatarColor(name: string): string {
  if (!name) {
    return AVATAR_COLORS[0];
  }
  const index = hashCode(name) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) {
    return '?';
  }

  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    // Single word: take first 2 chars
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words: take first char of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}
