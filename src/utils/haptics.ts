/**
 * Haptic Feedback Utility
 * Uses Home Assistant Companion app's haptic feedback system
 * https://companion.home-assistant.io/docs/integrations/haptics/
 */

/**
 * Haptic types supported by Home Assistant Companion apps
 * - success: Task or action completed successfully
 * - warning: Task produced a warning
 * - failure: Task or action failed
 * - light: Light physical feedback
 * - medium: Medium physical feedback
 * - heavy: Heavy physical feedback
 * - selection: Selection is actively changing
 */
export type HapticType =
  | "success"
  | "warning"
  | "failure"
  | "light"
  | "medium"
  | "heavy"
  | "selection";

/**
 * Trigger haptic feedback using Home Assistant Companion app
 * Falls back to vibration API if not in HA app
 */
export function triggerHaptic(type: HapticType = "light"): void {
  // Fire haptic event for Home Assistant Companion app
  window.dispatchEvent(
    new CustomEvent("haptic", {
      detail: type,
    })
  );

  // Fallback to vibration API for browsers without HA Companion app
  if ("vibrate" in navigator) {
    const fallbackPatterns: Record<HapticType, number | number[]> = {
      success: 50,
      warning: [30, 10, 30],
      failure: [50, 10, 50, 10, 50],
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 5,
    };

    const pattern = fallbackPatterns[type];
    navigator.vibrate(pattern);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  // Haptics are always supported via HA Companion app events
  // or via vibration API fallback
  return true;
}
