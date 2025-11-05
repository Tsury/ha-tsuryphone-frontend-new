/**
 * Format dates for call history display
 */

/**
 * Format a timestamp for display in call log
 */
export function formatCallTime(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  const diffHours = Math.floor(diff / 3600000);

  // Just now (< 1 minute)
  if (diffMinutes < 1) {
    return "Just now";
  }

  // Minutes ago (< 1 hour)
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  // Hours ago (< 24 hours)
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  // For calls within the same week, show day and time (e.g., "Fri 23:50")
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const callDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.floor((today.getTime() - callDate.getTime()) / 86400000);

  if (diffDays < 7) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[date.getDay()];
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${dayName} ${hours}:${minutes}`;
  }

  // For older calls, show month, day, and time (e.g., "Oct 25, 16:23")
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${monthName} ${day}, ${hours}:${minutes}`;
}

/**
 * Get group label for call history grouping
 */
export function getCallHistoryGroup(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();

  // Reset time to midnight for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const callDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = today.getTime() - callDate.getTime();
  const diffDays = Math.floor(diffTime / 86400000);

  // Cap at 365 days
  if (diffDays > 365) {
    return ""; // Will be filtered out
  }

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  // Everything else is "Older"
  return "Older";
}

/**
 * Format call duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}
