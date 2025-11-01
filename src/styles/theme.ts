import { css } from 'lit';

/**
 * Common HA theme CSS variables for consistent styling
 */
export const haThemeVariables = css`
  /* Primary colors */
  --tsury-primary-color: var(--primary-color);
  --tsury-primary-text-color: var(--primary-text-color);
  --tsury-secondary-text-color: var(--secondary-text-color);
  --tsury-disabled-text-color: var(--disabled-text-color);
  --tsury-text-primary-color: var(--text-primary-color);

  /* Background colors */
  --tsury-card-background-color: var(--card-background-color);
  --tsury-primary-background-color: var(--primary-background-color);
  --tsury-secondary-background-color: var(--secondary-background-color);

  /* State colors */
  --tsury-success-color: var(--success-color, #4caf50);
  --tsury-error-color: var(--error-color, #f44336);
  --tsury-warning-color: var(--warning-color, #ff9800);
  --tsury-info-color: var(--info-color, #2196f3);

  /* Dividers and borders */
  --tsury-divider-color: var(--divider-color);
  --tsury-outline-color: var(--outline-color, var(--divider-color));

  /* Shadows */
  --tsury-card-box-shadow: var(--ha-card-box-shadow);

  /* Interactive states */
  --tsury-state-active-color: var(--state-active-color, var(--primary-color));
  --tsury-state-hover-opacity: 0.08;
  --tsury-state-focus-opacity: 0.12;
  --tsury-state-selected-opacity: 0.12;
  --tsury-state-pressed-opacity: 0.12;

  /* Spacing */
  --tsury-spacing-xs: 4px;
  --tsury-spacing-sm: 8px;
  --tsury-spacing-md: 16px;
  --tsury-spacing-lg: 24px;
  --tsury-spacing-xl: 32px;

  /* Border radius */
  --tsury-border-radius-sm: 4px;
  --tsury-border-radius-md: 8px;
  --tsury-border-radius-lg: 12px;
  --tsury-border-radius-xl: 16px;

  /* Typography */
  --tsury-font-family: var(--paper-font-common-base_-_font-family, 'Roboto', sans-serif);
  --tsury-font-size-sm: 12px;
  --tsury-font-size-md: 14px;
  --tsury-font-size-lg: 16px;
  --tsury-font-size-xl: 20px;
  --tsury-font-size-xxl: 24px;
  --tsury-font-weight-regular: 400;
  --tsury-font-weight-medium: 500;
  --tsury-font-weight-bold: 700;

  /* Transitions */
  --tsury-transition-duration: 200ms;
  --tsury-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
`;

/**
 * Helper function to determine if dark mode is active
 */
export function isDarkMode(hass: any): boolean {
  return hass?.themes?.darkMode ?? false;
}

/**
 * Get a color with opacity adjustment based on theme
 */
export function getColorWithOpacity(color: string, opacity: number): string {
  // If color is already rgba, extract rgb part
  if (color.startsWith('rgba')) {
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
    }
  }
  
  // If color is rgb
  if (color.startsWith('rgb')) {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
    }
  }
  
  // If hex color
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Fallback: return as-is
  return color;
}

/**
 * Get contrast text color based on background
 */
export function getContrastTextColor(backgroundColor: string, isDark: boolean): string {
  // Simple heuristic: use primary text color
  return isDark ? '#ffffff' : '#000000';
}

/**
 * Get surface color with elevation
 */
export function getSurfaceColor(elevation: number, isDark: boolean): string {
  if (!isDark) {
    return 'var(--card-background-color)';
  }
  
  // In dark mode, add white overlay based on elevation
  const opacity = Math.min(0.05 + (elevation * 0.02), 0.16);
  return `rgba(255, 255, 255, ${opacity})`;
}

/**
 * Common button styles respecting HA theme
 */
export const haButtonStyles = css`
  button {
    font-family: var(--tsury-font-family);
    font-size: var(--tsury-font-size-md);
    font-weight: var(--tsury-font-weight-medium);
    border: none;
    border-radius: var(--tsury-border-radius-md);
    padding: var(--tsury-spacing-sm) var(--tsury-spacing-md);
    cursor: pointer;
    transition: all var(--tsury-transition-duration) var(--tsury-transition-timing);
    outline: none;
    position: relative;
    overflow: hidden;
  }

  button:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  button:not(:disabled):hover {
    filter: brightness(1.1);
  }

  button:not(:disabled):active {
    filter: brightness(0.9);
  }

  button.primary {
    background-color: var(--tsury-primary-color);
    color: var(--text-primary-color);
  }

  button.success {
    background-color: var(--tsury-success-color);
    color: white;
  }

  button.error {
    background-color: var(--tsury-error-color);
    color: white;
  }

  button.text {
    background-color: transparent;
    color: var(--tsury-primary-color);
  }

  button.outlined {
    background-color: transparent;
    color: var(--tsury-primary-color);
    border: 1px solid var(--tsury-outline-color);
  }

  /* Ripple effect */
  button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  button:active::before {
    width: 300px;
    height: 300px;
  }
`;

/**
 * Common card styles respecting HA theme
 */
export const haCardStyles = css`
  .card {
    background-color: var(--tsury-card-background-color);
    border-radius: var(--ha-card-border-radius, var(--tsury-border-radius-lg));
    box-shadow: var(--tsury-card-box-shadow);
    padding: var(--tsury-spacing-md);
  }

  .card-header {
    font-size: var(--tsury-font-size-xl);
    font-weight: var(--tsury-font-weight-medium);
    color: var(--tsury-primary-text-color);
    margin-bottom: var(--tsury-spacing-md);
  }

  .card-content {
    color: var(--tsury-primary-text-color);
  }
`;

/**
 * Common list item styles
 */
export const haListStyles = css`
  .list-item {
    display: flex;
    align-items: center;
    padding: var(--tsury-spacing-md);
    min-height: 48px;
    cursor: pointer;
    transition: background-color var(--tsury-transition-duration) var(--tsury-transition-timing);
    border-radius: var(--tsury-border-radius-md);
  }

  .list-item:hover {
    background-color: rgba(var(--rgb-primary-color), var(--tsury-state-hover-opacity));
  }

  .list-item:active {
    background-color: rgba(var(--rgb-primary-color), var(--tsury-state-pressed-opacity));
  }

  .list-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--tsury-spacing-md);
    font-size: var(--tsury-font-size-lg);
    font-weight: var(--tsury-font-weight-medium);
  }

  .list-item-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .list-item-primary {
    font-size: var(--tsury-font-size-md);
    color: var(--tsury-primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-secondary {
    font-size: var(--tsury-font-size-sm);
    color: var(--tsury-secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .divider {
    height: 1px;
    background-color: var(--tsury-divider-color);
    margin: var(--tsury-spacing-sm) 0;
  }
`;
