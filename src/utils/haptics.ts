/**
 * Haptic Feedback Utility
 * Centralized haptic feedback using browser Vibration API
 */

export type HapticIntensity = "light" | "medium" | "heavy";

const HAPTIC_PATTERNS: Record<HapticIntensity, number> = {
  light: 10,
  medium: 20,
  heavy: 30,
};

/**
 * Trigger haptic feedback if supported
 */
export function triggerHaptic(intensity: HapticIntensity = "light"): void {
  if ("vibrate" in navigator) {
    navigator.vibrate(HAPTIC_PATTERNS[intensity]);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return "vibrate" in navigator;
}
