/**
 * Formatting Utilities
 * Reusable formatters for phone numbers, dates, durations
 */

/**
 * Format phone number for display
 */
export function formatPhoneNumber(number: string): string {
  if (!number) return "";

  // Remove non-digit characters
  const digits = number.replace(/\D/g, "");

  // Format based on length
  if (digits.length === 10) {
    // US format: (555) 123-4567
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === "1") {
    // US format with country code: +1 (555) 123-4567
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length > 11) {
    // International format: +XX XXX XXX XXXX
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  // Default: return as-is
  return number;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format timestamp to relative time (e.g., "2 min ago", "Yesterday")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const date = new Date(timestamp * 1000);
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  // Format as date
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format time for call log (e.g., "14:30", "Yesterday 09:15")
 */
export function formatCallTime(timestamp: number): string {
  const now = Date.now();
  const date = new Date(timestamp * 1000);
  const diffMs = now - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (diffHours < 24) {
    // Today - show only time
    return timeStr;
  } else if (diffHours < 48) {
    // Yesterday
    return `Yesterday ${timeStr}`;
  } else if (diffHours < 168) {
    // This week - show day name
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    // Older - show date
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}

/**
 * Generate consistent color from string (for avatars)
 */
export function generateColor(input: string): string {
  if (!input) return "hsl(200, 50%, 70%)"; // Default color

  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 50%, 70%)`; // Pastel colors
}

/**
 * Get first letter of name for avatar
 */
export function getAvatarLetter(name: string): string {
  if (!name) return "?";
  return name.trim()[0].toUpperCase();
}
