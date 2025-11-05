/**
 * Group and filter call history entries
 */

import { getCallHistoryGroup } from "./date-formatter";

export type CallType = "incoming" | "outgoing" | "missed";
export type CallFilter = "all" | "missed" | "outgoing" | "incoming";

export interface CallHistoryEntry {
  id: string;
  contactName: string;
  phoneNumber: string;
  timestamp: string;
  duration: number;
  type: CallType;
  isBlocked?: boolean;
}

export interface GroupedCallHistory {
  groupLabel: string;
  calls: CallHistoryEntry[];
}

/**
 * Filter call history by type
 */
export function filterCallHistory(
  calls: CallHistoryEntry[],
  filter: CallFilter
): CallHistoryEntry[] {
  if (filter === "all") {
    return calls;
  }
  return calls.filter((call) => call.type === filter);
}

/**
 * Group call history by date ranges
 */
export function groupCallHistory(
  calls: CallHistoryEntry[]
): GroupedCallHistory[] {
  // Create a map of groups
  const groups = new Map<string, CallHistoryEntry[]>();

  // Sort calls by timestamp (newest first)
  const sortedCalls = [...calls].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Group calls
  sortedCalls.forEach((call) => {
    const groupLabel = getCallHistoryGroup(call.timestamp);
    if (!groups.has(groupLabel)) {
      groups.set(groupLabel, []);
    }
    groups.get(groupLabel)!.push(call);
  });

  // Convert to array and maintain order
  const groupOrder = ["Today", "Yesterday", "This Week", "This Month"];
  const result: GroupedCallHistory[] = [];

  // Add known groups in order
  groupOrder.forEach((label) => {
    if (groups.has(label)) {
      result.push({
        groupLabel: label,
        calls: groups.get(label)!,
      });
      groups.delete(label);
    }
  });

  // Add remaining groups (month/year groups) in chronological order
  const remainingGroups = Array.from(groups.entries())
    .map(([groupLabel, calls]) => ({
      groupLabel,
      calls,
      // Use first call's timestamp for sorting
      timestamp: new Date(calls[0].timestamp).getTime(),
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  remainingGroups.forEach((group) => {
    result.push({
      groupLabel: group.groupLabel,
      calls: group.calls,
    });
  });

  return result;
}

/**
 * Get frequent contacts from call history (top N most called)
 */
export function getFrequentContacts(
  calls: CallHistoryEntry[],
  limit: number = 6
): { contactName: string; phoneNumber: string; callCount: number }[] {
  // Count calls per contact
  const contactCounts = new Map<
    string,
    { name: string; phone: string; count: number }
  >();

  calls.forEach((call) => {
    const key = call.phoneNumber;
    if (contactCounts.has(key)) {
      contactCounts.get(key)!.count++;
    } else {
      contactCounts.set(key, {
        name: call.contactName,
        phone: call.phoneNumber,
        count: 1,
      });
    }
  });

  // Sort by count and take top N
  return Array.from(contactCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((contact) => ({
      contactName: contact.name,
      phoneNumber: contact.phone,
      callCount: contact.count,
    }));
}
