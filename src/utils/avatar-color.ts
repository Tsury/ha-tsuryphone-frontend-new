/**
 * Generate consistent avatar colors based on contact name
 */

const AVATAR_COLORS_DARK = [
  "#1565c0", // Darker Blue
  "#2e7d32", // Darker Green
  "#c62828", // Darker Red
  "#6a1b9a", // Darker Purple
  "#e65100", // Darker Orange
  "#00838f", // Darker Cyan
  "#ad1457", // Darker Pink
  "#4e342e", // Darker Brown
  "#37474f", // Darker Blue Grey
  "#558b2f", // Darker Light Green
  "#01579b", // Darker Light Blue
  "#bf360c", // Darker Deep Orange
];

const AVATAR_COLORS_LIGHT = [
  "#42a5f5", // Lighter Blue
  "#66bb6a", // Lighter Green
  "#ef5350", // Lighter Red
  "#ab47bc", // Lighter Purple
  "#ffa726", // Lighter Orange
  "#26c6da", // Lighter Cyan
  "#ec407a", // Lighter Pink
  "#8d6e63", // Lighter Brown
  "#78909c", // Lighter Blue Grey
  "#9ccc65", // Lighter Light Green
  "#29b6f6", // Lighter Light Blue
  "#ff7043", // Lighter Deep Orange
];

/**
 * Check if the UI is in dark mode
 */
function isDarkMode(): boolean {
  // Check if the document has a dark theme class or attribute
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    const bodyTheme = document.body.getAttribute('data-theme');
    
    // Check for common dark mode indicators
    if (bodyTheme === 'dark' || html.classList.contains('dark-mode')) {
      return true;
    }
    
    // Check CSS variable for theme
    const themeStyle = getComputedStyle(html);
    const cardBg = themeStyle.getPropertyValue('--card-background-color');
    
    // If background is dark (low lightness), assume dark mode
    if (cardBg) {
      // Simple heuristic: if it starts with # and looks dark
      const rgb = themeStyle.getPropertyValue('--primary-background-color') || cardBg;
      if (rgb.includes('rgb')) {
        const values = rgb.match(/\d+/g);
        if (values && values.length >= 3) {
          const brightness = (parseInt(values[0]) + parseInt(values[1]) + parseInt(values[2])) / 3;
          return brightness < 128;
        }
      }
    }
  }
  
  // Default to dark mode if we can't determine
  return true;
}

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
    return isDarkMode() ? AVATAR_COLORS_DARK[0] : AVATAR_COLORS_LIGHT[0];
  }
  
  const colors = isDarkMode() ? AVATAR_COLORS_DARK : AVATAR_COLORS_LIGHT;
  const index = hashCode(name) % colors.length;
  return colors[index];
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) {
    return "?";
  }

  const words = name.trim().split(/\s+/);

  // Always return just the first letter
  return words[0][0].toUpperCase();
}
