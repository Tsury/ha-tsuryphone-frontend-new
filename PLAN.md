# TsuryPhone Frontend - Comprehensive Implementation Plan

## Executive Summary

This document outlines the complete plan for building a modern, Android Pixel 8-style Phone + Contacts frontend for the TsuryPhone Home Assistant integration. The frontend will be a custom card implementation that seamlessly integrates with Home Assistant's theming system and provides a full-featured phone interface.

**Status**: ✅ Requirements gathered and design decisions finalized. Ready to begin implementation.

### Key Updates Based on Requirements:

1. **Optional Contact Codes**: Codes are now optional with frontend validation and backend auto-generation
2. **Block Number Modal**: Full modal with number and name fields (similar to contact creation)
3. **Call Modal Dismissal**: Can be dismissed with persistent call toast showing live call info
4. **Haptic Feedback**: Implemented using browser Vibration API where available
5. **Call History Sync**: Real-time via HA coordinator state updates (WebSocket-based)
6. **Offline Behavior**: Show error overlay when HA unavailable
7. **Single Device**: Focus on single TsuryPhone device for v1
8. **Touch Gestures**: Comprehensive gesture system for mobile-first interaction
   - Swipe left/right to answer/decline calls
   - Swipe left/right to navigate between tabs
   - Long press for context menus
   - Double tap for quick actions
   - Vertical swipe for list scrolling (native)
   - Haptic feedback on all gesture activations

## Project Overview

### Technology Stack

- **Framework**: Lit (Web Components) - HA's standard for custom cards
- **Language**: TypeScript
- **Build Tool**: Rollup/Webpack
- **Styling**: CSS with HA theme variables
- **State Management**: HA WebSocket API + Local State
- **Testing**: Jest + Testing Library

### Key Design Principles

1. **HA Native**: Respect HA's design language and theming
2. **Responsive**: Work on mobile, tablet, and desktop
3. **Performance**: Virtualized lists, efficient re-renders
4. **Accessibility**: ARIA labels, keyboard navigation
5. **Modern**: Use latest HA 2025.10 features

## Architecture

### Component Hierarchy

```
tsuryphone-card (root)
├── tsuryphone-navigation (bottom nav)
├── persistent-call-toast (NEW - shows when call modal dismissed)
├── tsuryphone-home-view
│   ├── call-log-filters
│   ├── frequent-contacts
│   └── call-log-list
│       └── call-log-item (virtualized)
├── tsuryphone-keypad-view
│   ├── dialed-number-display
│   └── keypad-grid
├── tsuryphone-contacts-view
│   ├── contacts-search
│   ├── contacts-menu
│   └── contacts-list
│       └── contact-item (virtualized)
├── tsuryphone-blocked-view
│   └── blocked-list
│       └── blocked-item
├── tsuryphone-contact-modal
│   ├── contact-form (with code field)
│   └── contact-actions
├── tsuryphone-block-number-modal (NEW)
│   └── block-form
└── tsuryphone-call-modal
    ├── incoming-call-slider
    └── in-call-controls
```

### Data Flow

1. **WebSocket Connection**: Subscribe to TsuryPhone coordinator state updates
2. **Service Calls**: Use HA service system for actions (dial, answer, hangup, etc.)
3. **Local Storage**: Cache frequent contacts calculation, UI preferences
4. **Reactive Updates**: Listen to state changes, update UI automatically

## Feature Breakdown

### 1. Bottom Navigation (tsuryphone-navigation)

**Component**: `tsuryphone-navigation.ts`

**Features**:

- Three tabs: Home (Call Log), Keypad, Contacts
- Active state indication
- Smooth transitions
- Disabled when in-call modal is active
- **Touch Gestures**: Swipe left/right to navigate between tabs (added in Phase 8.75)

**HA Integration**:

- Use `mdi:history`, `mdi:dialpad`, `mdi:contacts` icons from HA
- Theme colors for active/inactive states

**State Management**:

```typescript
interface NavigationState {
  activeTab: "home" | "keypad" | "contacts";
  disabled: boolean;
  gesturesEnabled: boolean; // Disable during modals/calls
}
```

---

### 2. Home View - Call Log (tsuryphone-home-view)

**Component**: `tsuryphone-home-view.ts`

**Sub-components**:

- `call-log-filters.ts`
- `frequent-contacts.ts`
- `call-log-list.ts`
- `call-log-item.ts`

#### 2.1 Call Log Filters

**Features**:

- Four filter buttons: All, Missed, Contacts, Blocked
- Active state styling
- Count badges (optional)

**Data Source**:

- Fetch from `SERVICE_GET_CALL_HISTORY` service
- Filter locally based on:
  - `call_type === 'missed'` for Missed
  - Check if number exists in quick_dials for Contacts
  - Check if number exists in blocked_numbers for Blocked

**Implementation**:

```typescript
interface CallLogFilter {
  type: "all" | "missed" | "contacts" | "blocked";
  label: string;
  icon: string;
  predicate: (entry: CallHistoryEntry) => boolean;
}
```

#### 2.2 Frequent Contacts

**Features**:

- Collapsible section
- Display up to 5 avatars with names
- Tap to call
- Auto-refresh every 24 hours

**Algorithm**:

```typescript
// Pseudocode
function calculateFrequentContacts(
  callHistory: CallHistoryEntry[],
  contacts: QuickDialEntry[]
): QuickDialEntry[] {
  // 1. Take last 100 entries
  const recent = callHistory.slice(-100);

  // 2. Filter only entries with contacts
  const withContacts = recent.filter((entry) =>
    contacts.find((c) => c.normalized_number === entry.normalized_number)
  );

  // 3. Count occurrences per contact
  const counts = new Map<string, number>();
  withContacts.forEach((entry) => {
    const contact = contacts.find(
      (c) => c.normalized_number === entry.normalized_number
    );
    if (contact) {
      counts.set(contact.code, (counts.get(contact.code) || 0) + 1);
    }
  });

  // 4. Sort by count descending, take top 5
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code]) => contacts.find((c) => c.code === code)!);
}
```

**Storage**:

- Store in localStorage with timestamp
- Key: `tsuryphone_${deviceId}_frequent_contacts`

#### 2.3 Call Log List

**Features**:

- Virtualized scrolling (use `lit-virtualizer` or custom implementation)
- Grouped by: "Today", "Yesterday", "Older"
- Date/time formatting
- Infinite scroll capability (load more from storage if needed)

**Data Source**:

```typescript
interface CallHistoryEntry {
  call_type: string; // "incoming" | "outgoing" | "blocked" | "missed"
  number: string;
  name?: string;
  normalized_number: string;
  duration_s: number | null;
  ts_device: number;
  received_ts: number;
  is_incoming: boolean;
  is_priority?: boolean;
}
```

**Grouping Logic**:

```typescript
function groupCallHistory(entries: CallHistoryEntry[]): GroupedCallHistory {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));

  return {
    today: entries.filter((e) => new Date(e.received_ts * 1000) >= todayStart),
    yesterday: entries.filter((e) => {
      const date = new Date(e.received_ts * 1000);
      return date >= yesterdayStart && date < todayStart;
    }),
    older: entries.filter(
      (e) => new Date(e.received_ts * 1000) < yesterdayStart
    ),
  };
}
```

**Date Formatting**:

- Under 1 min: "Just now"
- Under 1 hour: "X min ago"
- Under 24 hours: "X hours ago"
- Under 1 week: "Fri 23:50"
- Under 1 year: "Oct 25, 16:23"
- Over 1 year: Don't show

#### 2.4 Call Log Item

**Features**:

- Avatar with first letter or contact icon
- Name/Number display
- Call direction icon (incoming/outgoing/missed/blocked)
- Duration/date display
- Call button (always visible)
- Action buttons for unknown numbers: "Add Contact", "Block"

**Avatar Generation**:

```typescript
function generateAvatarColor(name: string): string {
  // Use consistent hash-based color generation
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate pastel color (high lightness, medium saturation)
  const hue = hash % 360;
  return `hsl(${hue}, 50%, 70%)`;
}

function getAvatarContent(
  entry: CallHistoryEntry,
  contacts: QuickDialEntry[]
): { letter: string; color: string; isContact: boolean } {
  const contact = contacts.find(
    (c) => c.normalized_number === entry.normalized_number
  );

  if (contact && contact.name) {
    return {
      letter: contact.name[0].toUpperCase(),
      color: generateAvatarColor(contact.name),
      isContact: true,
    };
  }

  // Unknown caller
  return {
    letter: "👤", // muted profile emoji
    color: "var(--disabled-text-color)",
    isContact: false,
  };
}
```

**Action Buttons**:

- Only show if number is NOT in quick_dials AND NOT in blocked_numbers
- "Add Contact" → Opens contact modal with pre-filled number
- "Block" → Opens block number modal with pre-filled number

**Touch Gestures** (added in Phase 8.75):

- **Long Press**: Show context menu with options (Call, Add Contact, Block, Copy Number)
- **Double Tap**: Quick dial the number

**Service Calls**:

- Call button → `tsuryphone.dial` service with number

---

### 3. Keypad View (tsuryphone-keypad-view)

**Component**: `tsuryphone-keypad-view.ts`

**Sub-components**:

- `dialed-number-display.ts`
- `keypad-grid.ts`

#### 3.1 Dialed Number Display

**Features**:

- Show currently dialed digits
- Delete button (⌫) on right edge
- Auto-focus when keypad opened
- Clear on successful dial

**State**:

```typescript
interface DialedNumberState {
  digits: string;
}
```

**Behavior**:

- Delete button removes last digit
- Only visible if digits.length > 0

#### 3.2 Keypad Grid

**Features**:

- 3x4 grid layout
- Buttons: 1-9, \*, 0, #
- Haptic feedback (if supported)
- Send mode indicator

**Layout**:

```
1  2  3
4  5  6
7  8  9
*  0  #
```

**Call Button**:

- Only show if `send_mode` sensor is `true`
- Green color with phone icon
- If no digits: Use last call log entry number
- If digits exist: Dial entered number

**Touch Gestures** (added in Phase 8.75):

- **Long Press on 0**: Insert "+" for international dialing
- **Double Tap on Call Button**: Redial last number (if no digits entered)

**Service Integration**:

- Button press → `tsuryphone.dial_digit` service
- Call button → `tsuryphone.dial` service

**Subscribe to**:

- `sensor.tsuryphone_send_mode` entity state
- `sensor.tsuryphone_current_dialing_number` for external changes

---

### 4. Contacts View (tsuryphone-contacts-view)

**Component**: `tsuryphone-contacts-view.ts`

**Sub-components**:

- `contacts-search.ts`
- `contacts-menu.ts`
- `contacts-list.ts`
- `contact-item.ts`

#### 4.1 Contacts Search

**Features**:

- Search bar with placeholder "Search contacts"
- Real-time filtering
- Clear button (X) when text exists
- Search against name and number

**Search Logic**:

```typescript
function filterContacts(
  contacts: QuickDialEntry[],
  query: string
): QuickDialEntry[] {
  const lowerQuery = query.toLowerCase();
  return contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.number.includes(query) ||
      c.display_number.includes(query)
  );
}
```

#### 4.2 Contacts Menu

**Features**:

- Three-dot menu (⋮) next to search
- Opens popup menu
- Options:
  - "Blocked Numbers" → Navigate to blocked view

**Future Extensions**:

- Import/Export
- Settings

#### 4.3 Contacts List

**Features**:

- Virtualized scrolling
- Grouped alphabetically
- Priority section at top
- Sticky group headers

**Grouping**:

```typescript
interface ContactGroup {
  label: string; // "Priority", "A", "B", ..., "א", "ב", ..., "#"
  contacts: QuickDialEntry[];
}

function groupContacts(contacts: QuickDialEntry[]): ContactGroup[] {
  const groups = new Map<string, QuickDialEntry[]>();

  // Separate priority contacts
  const priority = contacts.filter(c =>
    // Check if in priority list (need to cross-reference with priority numbers)
  );

  if (priority.length > 0) {
    groups.set('Priority', priority);
  }

  // Group by first letter
  const nonPriority = contacts.filter(c => !priority.includes(c));
  nonPriority.forEach(contact => {
    const firstChar = contact.name[0].toUpperCase();
    let group: string;

    if (/[A-Z]/.test(firstChar)) {
      group = firstChar;
    } else if (/[\u0590-\u05FF]/.test(firstChar)) { // Hebrew
      group = firstChar;
    } else if (/[0-9]/.test(firstChar)) {
      group = '#';
    } else {
      group = '#';
    }

    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(contact);
  });

  // Sort groups
  const sortedGroups: ContactGroup[] = [];

  // Priority first
  if (groups.has('Priority')) {
    sortedGroups.push({ label: 'Priority', contacts: groups.get('Priority')! });
  }

  // A-Z
  const latinGroups = Array.from(groups.keys())
    .filter(k => /[A-Z]/.test(k))
    .sort();
  latinGroups.forEach(label => {
    sortedGroups.push({ label, contacts: groups.get(label)! });
  });

  // Hebrew/Other
  const otherGroups = Array.from(groups.keys())
    .filter(k => k !== 'Priority' && k !== '#' && !/[A-Z]/.test(k))
    .sort();
  otherGroups.forEach(label => {
    sortedGroups.push({ label, contacts: groups.get(label)! });
  });

  // # last
  if (groups.has('#')) {
    sortedGroups.push({ label: '#', contacts: groups.get('#')! });
  }

  return sortedGroups;
}
```

#### 4.4 Contact Item

**Features**:

- Avatar (first letter with color)
- Name only (minimal)
- Tap to open contact modal in edit mode

**Touch Gestures** (added in Phase 8.75):

- **Tap**: Open contact modal in edit mode
- **Long Press**: Show context menu with quick actions (Call, Edit, Delete)
- **Double Tap**: Quick dial the contact

**Create Contact Button**:

- Always visible at top of list
- Opens contact modal in create mode

---

### 5. Blocked View (tsuryphone-blocked-view)

**Component**: `tsuryphone-blocked-view.ts`

**Features**:

- Full-screen modal overlay
- Back arrow (←) on top-left
- Title: "Blocked Numbers"
- List of blocked numbers
- "Add Blocked Number" button at top

**Sub-components**:

- `blocked-list.ts`
- `blocked-item.ts`
- `block-number-modal.ts` (NEW)

#### 5.1 Blocked Item

**Features**:

- Avatar with first letter
- Two lines: Name, Number
- Remove button (❌) on right edge

**Service Integration**:

- Remove button → `tsuryphone.blocked_remove` service

**Data Source**:

- Subscribe to TsuryPhone state `blocked_numbers` array

#### 5.2 Block Number Modal (NEW)

**Component**: `block-number-modal.ts`

**Trigger**:

- "Block" button from call log item (for unknown numbers)
- "Add Blocked Number" button from blocked view

**Features**:

- Modal overlay
- Title: "Block Number"
- Two fields: Number (required), Name (required)
- Save button
- Cancel/Close button

**Form Fields**:

**Number**:

- Text input
- Required
- Pre-filled when coming from "Block" action in call log
- Validation: Must contain digits

**Name**:

- Text input
- Required
- Placeholder: "Blocked caller" or similar
- Validation: Min 1 character

**Save Logic**:

```typescript
async function blockNumber(number: string, name: string) {
  try {
    await hass.callService("tsuryphone", "blocked_add", {
      number: number,
      name: name,
    });

    showToast("Number blocked successfully", "success");
    closeModal();
    refreshBlockedList();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}
```

---

### 6. Contact Modal (tsuryphone-contact-modal)

**Component**: `tsuryphone-contact-modal.ts`

**Modes**:

1. Create (from "Create Contact" button or "Add Contact" action)
2. Edit (from clicking existing contact)

**Features**:

- Full-screen overlay
- Header with close/back button, title, save button
- Form fields: Name, Number, Priority (star toggle)
- Dirty state tracking
- Validation

#### 6.1 Modal Header

**Create Mode**:

- Left: X button (close)
- Center: "Create Contact"
- Right: "Save" button

**Edit Mode**:

- Left: ← button (back)
- Center: "Edit Contact"
- Right: "Save" button

**Dirty State**:

- If user has made changes and tries to close/back, show confirmation dialog:
  - "Discard changes?"
  - "Cancel" / "Discard"

#### 6.2 Form Fields

**Name**:

- Text input
- Required
- Validation: Min 1 character

**Number**:

- Text input
- Required
- Validation: Must contain digits
- Pre-filled when coming from "Add Contact" action

**Code** (NEW):

- Text input
- Optional
- Placeholder: "Auto-generated if empty"
- Validation:
  - Must be unique if provided
  - Show friendly error if code already exists
  - Can be numeric or alphanumeric string
- Only shown in create/edit modal, not in list view
- In edit mode, shows existing code (read-only or editable based on UX decision)

**Priority**:

- Star toggle button
- Empty star (☆) / Filled star (★)
- Indicates priority caller

#### 6.3 Save Logic

**Create Mode**:

```typescript
async function createContact(
  name: string,
  number: string,
  code: string | undefined, // Optional code
  isPriority: boolean
) {
  // 1. Add to quick dial
  const serviceData: any = {
    number: number,
    name: name,
  };

  // Only include code if provided by user
  if (code && code.trim()) {
    serviceData.code = code.trim();
    // Backend will validate uniqueness and return error if duplicate
  }
  // Otherwise, backend auto-generates next available code

  try {
    await hass.callService("tsuryphone", "quick_dial_add", serviceData);
  } catch (err) {
    // Handle duplicate code error
    if (err.message.includes("code") || err.message.includes("exists")) {
      showToast("This code is already in use. Please choose another.", "error");
      return; // Keep modal open
    }
    throw err; // Re-throw other errors
  }

  // 2. If priority, add to priority list
  if (isPriority) {
    await hass.callService("tsuryphone", "priority_add", {
      number: number,
    });
  }

  // 3. Close modal and refresh
  closeModal();
  refreshContacts();
}
```

**Edit Mode** (Updated to use ID-based removal):

```typescript
async function updateContact(
  oldContact: QuickDialEntry,
  name: string,
  number: string,
  code: string | undefined, // Optional code
  isPriority: boolean
) {
  // 1. Remove old contact by ID (preferred) or code (fallback)
  if (oldContact.id) {
    await hass.callService("tsuryphone", "quick_dial_remove", {
      id: oldContact.id,
    });
  } else {
    await hass.callService("tsuryphone", "quick_dial_remove", {
      code: oldContact.code,
    });
  }

  // 2. Add new contact with optional code
  const serviceData: any = {
    number: number,
    name: name,
  };

  // Only include code if provided by user
  if (code && code.trim()) {
    serviceData.code = code.trim();
  }
  // Backend auto-generates ID and optionally generates code if not provided

  try {
    await hass.callService("tsuryphone", "quick_dial_add", serviceData);
  } catch (err) {
    // If error occurs, try to restore old contact
    if (err.message.includes("code") || err.message.includes("exists")) {
      // Restore old contact
      const restoreData: any = {
        number: oldContact.number,
        name: oldContact.name,
      };
      if (oldContact.code) {
        restoreData.code = oldContact.code;
      }
      await hass.callService("tsuryphone", "quick_dial_add", restoreData);
      showToast("This code is already in use. Please choose another.", "error");
      return;
    }
    throw err;
  }

  // 3. Update priority if changed
  const wasPriority = checkIfPriority(oldContact.number); // Check priority list
  if (isPriority && !wasPriority) {
    await hass.callService("tsuryphone", "priority_add", { number });
  } else if (!isPriority && wasPriority) {
    await hass.callService("tsuryphone", "priority_remove", { number });
  }

  // 4. Close modal and refresh
  closeModal();
  refreshContacts();
}
```

**Error Handling**:

- Show toast notification on error
- Example: "Contact already exists for this number"
- Keep modal open, allow user to correct

**Toast Notifications**:

- Appear from top
- Auto-dismiss after 5 seconds
- Dismissible on click
- Use HA's notification system or custom implementation

---

### 7. In-Call Modal (tsuryphone-call-modal)

**Component**: `tsuryphone-call-modal.ts`

**Trigger**: Automatically shows when call state changes

**Modes**:

1. Incoming Call
2. In Call
3. Call Waiting

**Features**:

- Full-screen overlay
- **Dismissible** with X button (top-right corner)
- When dismissed during active call, show persistent toast/banner with call info
- Toast shows: Contact/Number, Call duration (live updating)
- Clicking toast returns to call modal
- Blocks navigation when in incoming call mode (must answer/decline first)

#### 7.1 Incoming Call Mode

**Display**:

- Top banner (if call on hold): "Contact Name - On Hold"
- Caller name (large text)
- Caller number (smaller text)
- Horizontal swipe slider

**Swipe Slider**:

```
   [Decline] <--- 📞 ---> [Answer]
      (Red)              (Green)
```

**Implementation**:

- Touch/drag interaction
- Threshold-based activation (e.g., 70% of width)
- Visual feedback (button follows finger)
- Haptic feedback on trigger

**Service Calls**:

- Swipe left (Decline) → `tsuryphone.hangup`
- Swipe right (Answer) → `tsuryphone.answer`

**Listen to**:

- `sensor.tsuryphone_phone_state` for app state
- `sensor.tsuryphone_current_active_call_number` for caller info
- `sensor.tsuryphone_current_active_call_name` for caller name
- `binary_sensor.tsuryphone_in_call` for call state

#### 7.2 In Call Mode

**Display**:

- Top banner (if call waiting): "Contact Name (or number) - Waiting"
  - Tappable to switch calls
- Call duration timer (updates every second)
- Contact name or number (large text)
- Button row:
  - Mute (🔇 / 🔊)
  - Speaker (📢 / 📱)
  - Switch (⇄) - only if call waiting exists
- Hang up button (red, phone icon)

**Call Duration**:

- Subscribe to `sensor.tsuryphone_call_duration` (in seconds)
- Format as MM:SS or HH:MM:SS

**Button States**:

- Mute: Toggle based on mic state (if available in future)
- Speaker: Toggle volume mode
  - `tsuryphone.toggle_volume_mode` service
  - Visual state from `sensor.tsuryphone_call_audio_output`

**Switch Call**:

- Only show if `binary_sensor.tsuryphone_call_waiting_available` is true
- Service: `tsuryphone.switch_call_waiting`

**Hang Up**:

- Service: `tsuryphone.hangup`

#### 7.3 Call Waiting Logic

**Scenario 1**: Active call + new incoming call

- Show incoming call mode
- Show "On Hold" banner at top with previous caller
- If answered: Switch to in-call mode, update banner to show waiting call
- If declined: Return to in-call mode with original call

**Scenario 2**: Active call + call on hold

- Show in-call mode
- Show "Waiting" banner at top
- Switch button visible
- If banner tapped or switch pressed: Swap calls

**State Management**:

```typescript
interface CallModalState {
  mode: "incoming" | "in-call" | "none";
  activeCall: {
    number: string;
    name?: string;
    duration: number;
    isIncoming: boolean;
  } | null;
  waitingCall: {
    number: string;
    name?: string;
  } | null;
  volumeMode: "earpiece" | "speaker";
  isMuted: boolean;
}
```

---

## Data Integration

### Home Assistant Entities

#### Sensors to Subscribe To

| Entity ID                                         | Purpose                                     |
| ------------------------------------------------- | ------------------------------------------- |
| `sensor.tsuryphone_phone_state`                   | App state (IDLE, DIALING, RINGING_IN, etc.) |
| `sensor.tsuryphone_current_active_call_number`    | Current caller number                       |
| `sensor.tsuryphone_current_active_call_name`      | Current caller name                         |
| `sensor.tsuryphone_call_duration`                 | Call duration in seconds                    |
| `sensor.tsuryphone_send_mode`                     | Whether send mode is enabled                |
| `sensor.tsuryphone_current_dialing_number`        | Current dialing number                      |
| `sensor.tsuryphone_call_audio_output`             | Volume mode (earpiece/speaker)              |
| `sensor.tsuryphone_current_waiting_call_number`   | Waiting call number                         |
| `sensor.tsuryphone_current_waiting_call_name`     | Waiting call name                           |
| `binary_sensor.tsuryphone_in_call`                | Whether in active call                      |
| `binary_sensor.tsuryphone_call_waiting_available` | Whether call waiting exists                 |

#### Services to Call

| Service                          | Parameters               | Usage                    |
| -------------------------------- | ------------------------ | ------------------------ |
| `tsuryphone.dial`                | `number`                 | Dial a phone number      |
| `tsuryphone.dial_digit`          | `digit` (0-9)            | Add digit to dial buffer |
| `tsuryphone.answer`              | -                        | Answer incoming call     |
| `tsuryphone.hangup`              | -                        | Hang up active call      |
| `tsuryphone.switch_call_waiting` | -                        | Switch between calls     |
| `tsuryphone.toggle_volume_mode`  | -                        | Toggle speaker/earpiece  |
| `tsuryphone.get_call_history`    | `limit` (optional)       | Get call history         |
| `tsuryphone.quick_dial_add`      | `code`, `number`, `name` | Add contact              |
| `tsuryphone.quick_dial_remove`   | `code`                   | Remove contact           |
| `tsuryphone.blocked_add`         | `number`, `name`         | Block number             |
| `tsuryphone.blocked_remove`      | `number`                 | Unblock number           |
| `tsuryphone.priority_add`        | `number`                 | Mark as priority         |
| `tsuryphone.priority_remove`     | `number`                 | Unmark priority          |

### Coordinator State Structure

Access via `hass.states['sensor.tsuryphone_phone_state'].attributes`:

```typescript
interface TsuryPhoneState {
  // Quick Dials (Contacts)
  quick_dials: QuickDialEntry[];

  // Blocked Numbers
  blocked_numbers: BlockedNumberEntry[];

  // Priority Numbers (array of numbers)
  priority_numbers: string[];

  // Call History
  call_history: CallHistoryEntry[];

  // Current call state
  app_state: AppState;
  current_call: CallInfo;
  waiting_call: CallInfo;

  // Dialing
  dialing_context: {
    default_code: string;
    send_mode_enabled: boolean;
  };

  // Volume
  volume_mode: "EARPIECE" | "SPEAKER";
}

interface QuickDialEntry {
  id: string; // Unique identifier (auto-generated by backend)
  code: string; // Optional quick dial code (can be empty)
  number: string;
  name: string;
  normalized_number: string;
  display_number: string;
}

interface BlockedNumberEntry {
  number: string;
  name: string;
  normalized_number: string;
  display_number: string;
}

interface CallHistoryEntry {
  call_type: string; // "incoming" | "outgoing" | "blocked" | "missed"
  number: string;
  name: string;
  normalized_number: string;
  is_incoming: boolean;
  duration_s: number | null;
  duration_ms: number | null;
  ts_device: number;
  received_ts: number;
  call_start_ts: number;
  reason: string | null;
  is_priority: boolean;
}

enum AppState {
  IDLE = "IDLE",
  DIALING = "DIALING",
  CALLING_OUT = "CALLING_OUT",
  RINGING_IN = "RINGING_IN",
  IN_CALL = "IN_CALL",
  INVALID_NUMBER = "INVALID_NUMBER",
}
```

---

## Technical Implementation Details

### 1. Card Registration

**File**: `tsuryphone-card.ts`

```typescript
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";

@customElement("tsuryphone-card")
export class TsuryPhoneCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() config!: TsuryPhoneCardConfig;

  @state() private _activeView: "home" | "keypad" | "contacts" = "home";
  @state() private _showCallModal = false;
  @state() private _showContactModal = false;
  @state() private _showBlockedView = false;

  // Subscriptions
  private _unsubscribers: Array<() => void> = [];

  connectedCallback() {
    super.connectedCallback();
    this._subscribe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribe();
  }

  private _subscribe() {
    // Subscribe to state changes
    this._unsubscribers.push(
      this.hass.connection.subscribeMessage(
        (message) => this._handleStateUpdate(message),
        {
          type: "subscribe_entity",
          entity_id: this._getDeviceEntityId("phone_state"),
        }
      )
    );
  }

  private _unsubscribe() {
    this._unsubscribers.forEach((unsub) => unsub());
    this._unsubscribers = [];
  }

  private _handleStateUpdate(message: any) {
    // Check if in-call modal should show
    const inCall =
      this.hass.states[this._getDeviceEntityId("in_call")]?.state === "on";
    const phoneState =
      this.hass.states[this._getDeviceEntityId("phone_state")]?.state;

    this._showCallModal = inCall || phoneState === "RINGING_IN";

    this.requestUpdate();
  }

  render() {
    return html`
      ${this._showCallModal ? this._renderCallModal() : ""}
      ${this._showContactModal ? this._renderContactModal() : ""}
      ${this._showBlockedView
        ? this._renderBlockedView()
        : this._renderMainViews()}
    `;
  }

  private _renderMainViews() {
    return html`
      <div class="tsuryphone-container">
        ${this._activeView === "home"
          ? html`<tsuryphone-home-view
              .hass=${this.hass}
              .config=${this.config}
            ></tsuryphone-home-view>`
          : ""}
        ${this._activeView === "keypad"
          ? html`<tsuryphone-keypad-view
              .hass=${this.hass}
              .config=${this.config}
            ></tsuryphone-keypad-view>`
          : ""}
        ${this._activeView === "contacts"
          ? html`<tsuryphone-contacts-view
              .hass=${this.hass}
              .config=${this.config}
            ></tsuryphone-contacts-view>`
          : ""}

        <tsuryphone-navigation
          .activeTab=${this._activeView}
          .disabled=${this._showCallModal}
          @tab-change=${(e: CustomEvent) => (this._activeView = e.detail.tab)}
        ></tsuryphone-navigation>
      </div>
    `;
  }

  private _getDeviceEntityId(suffix: string): string {
    const deviceId = this.config.device_id || "tsuryphone";
    return `sensor.${deviceId}_${suffix}`;
  }
}

interface TsuryPhoneCardConfig {
  type: "custom:tsuryphone-card";
  device_id?: string; // Optional: defaults to 'tsuryphone'
  show_frequent_contacts?: boolean; // Optional: defaults to true
  frequent_contacts_refresh_hours?: number; // Optional: defaults to 24
}
```

### 2. Theming Integration

**Use HA CSS Variables**:

```css
/* Primary colors */
var(--primary-color)
var(--primary-text-color)
var(--secondary-text-color)
var(--disabled-text-color)

/* Background colors */
var(--card-background-color)
var(--primary-background-color)
var(--secondary-background-color)

/* State colors */
var(--success-color)  /* Green for call button */
var(--error-color)    /* Red for hang up */
var(--warning-color)  /* Yellow/orange for warnings */

/* Dividers */
var(--divider-color)

/* Shadows */
var(--ha-card-box-shadow)
```

**Dynamic Theme Support**:

```typescript
// Detect theme changes
this.hass.themes.darkMode; // boolean

// Apply theme-specific logic
const isDark = this.hass.themes.darkMode;
const mutedBackground = isDark
  ? "rgba(255, 255, 255, 0.05)"
  : "rgba(0, 0, 0, 0.05)";
```

### 3. List Virtualization

**Option 1**: Use `lit-virtualizer` package

```typescript
import { LitVirtualizer } from "@lit-labs/virtualizer";

@customElement("call-log-list")
export class CallLogList extends LitElement {
  @property() items: CallHistoryEntry[] = [];

  render() {
    return html`
      <lit-virtualizer
        .items=${this.items}
        .renderItem=${(item: CallHistoryEntry) => html`
          <call-log-item .entry=${item}></call-log-item>
        `}
      ></lit-virtualizer>
    `;
  }
}
```

**Option 2**: Custom intersection observer-based virtualization

```typescript
// Render only visible items based on scroll position
private _renderVirtualizedList() {
  const itemHeight = 72; // px
  const visibleCount = Math.ceil(this.offsetHeight / itemHeight) + 2; // buffer
  const startIndex = Math.floor(this._scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, this.items.length);

  const visibleItems = this.items.slice(startIndex, endIndex);
  const topPadding = startIndex * itemHeight;
  const bottomPadding = (this.items.length - endIndex) * itemHeight;

  return html`
    <div style="padding-top: ${topPadding}px; padding-bottom: ${bottomPadding}px;">
      ${visibleItems.map(item => this._renderItem(item))}
    </div>
  `;
}
```

### 4. State Management Pattern

```typescript
// Use reactive properties and events for state management
@customElement("tsuryphone-card")
export class TsuryPhoneCard extends LitElement {
  // Shared state
  @state() private _contactsCache: QuickDialEntry[] = [];
  @state() private _blockedCache: BlockedNumberEntry[] = [];
  @state() private _callHistoryCache: CallHistoryEntry[] = [];
  @state() private _priorityNumbers: Set<string> = new Set();

  // Fetch and cache data
  async firstUpdated() {
    await this._refreshData();

    // Set up polling for call history (every 30 seconds)
    setInterval(() => this._refreshCallHistory(), 30000);
  }

  private async _refreshData() {
    // Get coordinator state
    const state = this.hass.states[this._getDeviceEntityId("phone_state")];
    if (state && state.attributes) {
      this._contactsCache = state.attributes.quick_dials || [];
      this._blockedCache = state.attributes.blocked_numbers || [];
      this._priorityNumbers = new Set(state.attributes.priority_numbers || []);
    }

    // Get call history via service
    await this._refreshCallHistory();
  }

  private async _refreshCallHistory() {
    try {
      const response = await this.hass.callService(
        "tsuryphone",
        "get_call_history",
        { limit: 1000 },
        true // return response
      );

      if (response && response.call_history) {
        this._callHistoryCache = response.call_history;
      }
    } catch (err) {
      console.error("Failed to fetch call history:", err);
    }
  }

  // Provide data to child components
  render() {
    return html`
      <tsuryphone-home-view
        .contacts=${this._contactsCache}
        .blocked=${this._blockedCache}
        .callHistory=${this._callHistoryCache}
        .priorityNumbers=${this._priorityNumbers}
      ></tsuryphone-home-view>
    `;
  }
}
```

### 5. Error Handling & Toast Notifications

```typescript
// Toast notification component
@customElement('tsuryphone-toast')
export class TsuryPhoneToast extends LitElement {
  @property() message = '';
  @property() type: 'info' | 'error' | 'success' = 'info';
  @property() duration = 5000;

  @state() private _visible = false;

  show() {
    this._visible = true;
    setTimeout(() => this.hide(), this.duration);
  }

  hide() {
    this._visible = false;
  }

  render() {
    return html`
      <div class="toast ${this.type} ${this._visible ? 'visible' : ''}">
        ${this.message}
        <button @click=${this.hide}>×</button>
      </div>
    `;
  }

  static styles = css`
    .toast {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%) translateY(-100%);
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: var(--ha-card-box-shadow);
      z-index: 1000;
      opacity: 0;
      transition: all 0.3s ease;
    }

    .toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    .toast.error {
      background: var(--error-color);
      color: white;
    }

    .toast.success {
      background: var(--success-color);
      color: white;
    }
  `;
}

// Usage in parent component
private async _addContact(name: string, number: string) {
  try {
    await this.hass.callService('tsuryphone', 'quick_dial_add', {
      code: this._generateCode(),
      number,
      name
    });

    this._showToast('Contact added successfully', 'success');
    await this._refreshData();
  } catch (err) {
    this._showToast(`Error: ${err.message}`, 'error');
  }
}

private _showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  const toast = this.shadowRoot?.querySelector('tsuryphone-toast');
  if (toast) {
    toast.message = message;
    toast.type = type;
    toast.show();
  }
}
```

### 6. Contact Code Handling

**Note**: Contact codes are now optional. The backend will auto-generate codes if not provided.

**Frontend validation**:

```typescript
// Validate code uniqueness when user enters a custom code
private _validateCode(code: string, excludeContactCode?: string): boolean {
  if (!code || !code.trim()) {
    return true; // Empty is valid (will be auto-generated)
  }

  const trimmedCode = code.trim();
  const existingCodes = this._contactsCache
    .filter(c => c.code !== excludeContactCode) // Exclude current contact in edit mode
    .map(c => c.code);

  return !existingCodes.includes(trimmedCode);
}

// UI feedback for code field
private _getCodeFieldError(code: string, excludeContactCode?: string): string | null {
  if (!code || !code.trim()) {
    return null; // No error for empty
  }

  if (!this._validateCode(code, excludeContactCode)) {
    return 'This code is already in use';
  }

  return null;
}
```

### 7. Haptic Feedback

**Implementation**: Use browser's Vibration API for tactile feedback on mobile devices.

**Utility function**:

```typescript
// utils/haptic.ts
class HapticFeedback {
  private static isSupported = "vibrate" in navigator;

  static light() {
    if (this.isSupported) {
      navigator.vibrate(10); // 10ms light tap
    }
  }

  static medium() {
    if (this.isSupported) {
      navigator.vibrate(20); // 20ms medium tap
    }
  }

  static heavy() {
    if (this.isSupported) {
      navigator.vibrate(30); // 30ms heavy tap
    }
  }

  static success() {
    if (this.isSupported) {
      navigator.vibrate([10, 50, 10]); // Double tap pattern
    }
  }

  static error() {
    if (this.isSupported) {
      navigator.vibrate([20, 100, 20, 100, 20]); // Triple tap pattern
    }
  }
}

export { HapticFeedback };
```

**Usage examples**:

```typescript
// Keypad button press
private _onKeypadPress(digit: number) {
  HapticFeedback.light();
  this._dialDigit(digit);
}

// Incoming call swipe activation
private _onCallAnswered() {
  HapticFeedback.success();
  this._answerCall();
}

private _onCallDeclined() {
  HapticFeedback.medium();
  this._hangupCall();
}

// Important action
private _onBlockNumber() {
  HapticFeedback.medium();
  this._showBlockModal();
}
```

**Where to apply**:

- Keypad digit press (light)
- Bottom navigation tab change (light)
- Incoming call swipe threshold (medium)
- Call answered/declined (success/medium)
- Contact saved (success)
- Number blocked (medium)
- Error toast shown (error)
- Delete/remove actions (medium)

---

## File Structure

```
ha-tsuryphone-frontend-new/
├── package.json
├── tsconfig.json
├── rollup.config.js
├── .gitignore
├── README.md
├── PLAN.md (this file)
├── src/
│   ├── tsuryphone-card.ts (main card)
│   ├── components/
│   │   ├── navigation/
│   │   │   └── tsuryphone-navigation.ts
│   │   ├── home/
│   │   │   ├── tsuryphone-home-view.ts
│   │   │   ├── call-log-filters.ts
│   │   │   ├── frequent-contacts.ts
│   │   │   ├── call-log-list.ts
│   │   │   └── call-log-item.ts
│   │   ├── keypad/
│   │   │   ├── tsuryphone-keypad-view.ts
│   │   │   ├── dialed-number-display.ts
│   │   │   └── keypad-grid.ts
│   │   ├── contacts/
│   │   │   ├── tsuryphone-contacts-view.ts
│   │   │   ├── contacts-search.ts
│   │   │   ├── contacts-menu.ts
│   │   │   ├── contacts-list.ts
│   │   │   └── contact-item.ts
│   │   ├── blocked/
│   │   │   ├── tsuryphone-blocked-view.ts
│   │   │   ├── blocked-list.ts
│   │   │   └── blocked-item.ts
│   │   ├── modals/
│   │   │   ├── tsuryphone-contact-modal.ts
│   │   │   ├── tsuryphone-block-number-modal.ts (NEW)
│   │   │   ├── tsuryphone-call-modal.ts
│   │   │   ├── incoming-call-slider.ts
│   │   │   └── in-call-controls.ts
│   │   └── shared/
│   │       ├── avatar.ts
│   │       ├── toast.ts
│   │       ├── persistent-call-toast.ts (NEW - shown when call modal dismissed)
│   │       └── confirmation-dialog.ts
│   ├── types/
│   │   ├── homeassistant.d.ts
│   │   └── tsuryphone.d.ts
│   ├── utils/
│   │   ├── date-formatter.ts
│   │   ├── avatar-color.ts
│   │   ├── contact-grouping.ts
│   │   ├── call-history-grouping.ts
│   │   ├── haptic.ts (NEW - Vibration API wrapper)
│   │   └── storage.ts
│   └── styles/
│       ├── theme.ts
│       └── common.ts
├── dist/ (build output)
└── .github/
    └── workflows/
        └── build.yml
```

---

## Build Setup

### package.json

```json
{
  "name": "tsuryphone-card",
  "version": "1.0.0",
  "description": "TsuryPhone custom card for Home Assistant",
  "main": "dist/tsuryphone-card.js",
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts"
  },
  "keywords": ["home-assistant", "custom-card", "tsuryphone"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "lit": "^3.1.0",
    "custom-card-helpers": "^1.9.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.40.0",
    "prettier": "^3.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-serve": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

### rollup.config.js

```javascript
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/tsuryphone-card.ts",
  output: {
    file: "dist/tsuryphone-card.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      declaration: false,
    }),
  ],
};
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Development Phases

### Phase 0: Backend Prerequisites ✅ COMPLETED (Nov 1, 2025)

**Initial Setup:**

- [x] Make contact codes optional in backend
- [x] Add ID-based contact identification in firmware
- [x] Update backend service schemas
- [x] Update firmware to support optional codes
- [x] Test backend/firmware integration

**ID Migration (Code → ID) ✅ STABILIZED (Nov 1, 2025):**

- [x] Migrate all entry types from code/number-based to ID-based operations
- [x] Update coordinator selection fields (`selected_quick_dial_id`, `selected_blocked_number_id`, `selected_priority_number_id`)
- [x] Update button entity availability checks to use ID fields
- [x] Update button entity add operations to extract and store IDs
- [x] Update button entity remove operations to use coordinator ID fields
- [x] Update select entity option mapping (label → ID)
- [x] Update select entity selection storage (ID-based)
- [x] Update coordinator config delta handlers (WebSocket event processing)
- [x] Update firmware IntegrationService add responses to include IDs
- [x] Update firmware HAIntegration command handlers to use ID parameters
- [x] **FIX: Update firmware HAWebServer HTTP endpoint validation** (was checking code/number instead of id)
- [x] Rebuild and test firmware with ID-first system
- [x] Verify zero legacy code/number-based operations remain

**Key Changes:**

- All removal operations now require `id` parameter (quick_dial, blocked, priority)
- Firmware HTTP endpoints (`HAWebServer.cpp`) now validate for `id` instead of `code`/`number`
- Config delta WebSocket handlers process removals by ID
- Select entities map display labels to IDs internally
- Button entities check `selected_*_id` fields for availability
- System is 100% ID-first with zero backwards compatibility code

### Phase 1: Foundation (Week 1) ✅ COMPLETED

- [x] Set up project structure ✅
- [x] Configure build system (Rollup/TypeScript) ✅
- [x] Create base card component ✅
- [x] Create types definitions ✅
- [x] Install dependencies and test build ✅
- [x] Implement theming integration ✅
- [x] Set up HA WebSocket connection ✅

**Completed Features:**

- Full HA theme variable integration with dark/light mode support
- Comprehensive styling utilities (theme.ts, common.ts)
- WebSocket state change subscriptions
- Error handling and connection state management
- Cached data management (contacts, blocked, call history, priority)
- Automatic call modal triggering based on phone state

### Phase 2: Navigation & Layout (Week 1-2) ✅ COMPLETED

**Status**: Navigation and layout implementation complete

- [x] Implement bottom navigation component ✅
- [x] Create view routing logic ✅
- [x] Set up responsive layout ✅
- [x] Implement view transitions ✅

**Completed Features:**

- Bottom navigation bar with three tabs (Home, Keypad, Contacts)
- Material Design-inspired tab styling with active indicator
- Smooth tab transitions with ripple effects
- Disabled state support (when call modal is active)
- Responsive design for mobile, tablet, and desktop
- View routing with fade-in animations
- Proper ARIA labels and keyboard navigation support
- Touch-optimized tap targets

**Dependencies**: Phase 1 complete ✅

### Phase 3: Home View (Week 2-3) ✅ COMPLETED

**Status**: All components implemented and integrated

- [x] Call log filters (All/Missed/Outgoing/Incoming)
- [x] Call history fetching & caching
- [x] Call log list with grouping (Today, Yesterday, This Week, etc.)
- [x] Call log item rendering with avatars
- [x] Avatar generation with consistent colors
- [x] Date/time formatting utilities
- [x] Frequent contacts calculation (top 6 most called)
- [x] Frequent contacts display with call counts
- [x] Empty states for no calls
- [x] Utility files: `avatar-color.ts`, `date-formatter.ts`, `call-history-grouping.ts`
- [x] Components: `call-log-filters.ts`, `call-log-item.ts`, `frequent-contacts.ts`, `call-log-list.ts`, `home-view.ts`
- [x] Integration with main card
- [x] Build successful (~867ms)

**Dependencies**: Phase 2 complete ✅

**Milestone**: Home view complete - ready for Phase 3.5 (HACS + First Smoke Test)

### Phase 3.5: HACS Integration & First Smoke Test ✅ COMPLETED (Nov 1, 2025)

**Status**: HACS integration complete, repository live

**Completed:**

- [x] Create `hacs.json` configuration file ✅
- [x] Create `info.md` for HACS listing with feature descriptions ✅
- [x] Create `CHANGELOG.md` with version history ✅
- [x] Create `LICENSE` file (MIT License) ✅
- [x] Set up GitHub Actions workflows: ✅
  - [x] `auto-release-on-push.yml` - Automatic version bumping and releases on push to main
  - [x] `hacs-validation.yml` - HACS configuration validation
  - [x] `ci.yml` - Build and TypeScript validation
- [x] Update `package.json` to version 0.1.0-alpha with repository info ✅
- [x] Add `"type": "module"` to `package.json` (fixes Node warning) ✅
- [x] Update `README.md` with comprehensive installation & usage instructions ✅
- [x] Update dependencies to latest versions (npm install completed) ✅
- [x] Build frontend bundle successfully ✅
- [x] Commit all files to repository ✅
- [x] Push to GitHub (triggered auto-release workflow) ✅
- [x] HACS installation verified ✅

**Outcomes:**
- Repository configured for HACS custom integration
- Auto-release workflow functional
- v0.1.52-alpha currently deployed
- Card loads and functions in Home Assistant

**Dependencies**: Phase 3 complete ✅

### Phase 4: Keypad View (Week 3) ✅ COMPLETED

**Status**: Keypad view fully functional with dialing and service integration

- [x] Keypad grid layout ✅
- [x] Dialed number display ✅
- [x] Digit input handling ✅
- [x] Send mode integration ✅
- [x] Call button logic ✅
- [x] Service call integration ✅

**Completed Features**:
- Full digit entry with keypad grid
- Dialed number display with backspace
- Service calls: `dial_digit`, `dial_number`, `call_number`
- Entity ID targeting pattern established (used in all service calls)

**Dependencies**: Phase 3.5 complete ✅

### Phase 5: Contacts View (Week 4) ✅ COMPLETED

**Status**: Contacts view implemented with basic functionality

- [x] Contacts list rendering ✅
- [x] Contact grouping (Priority, A-Z, Hebrew, #) ✅
- [x] Search functionality ✅
- [x] Create contact button ✅
- [ ] Contact list virtualization (deferred - not needed for typical contact list sizes)
- [ ] Sticky headers (deferred to polish phase)
- [ ] Menu implementation (deferred to polish phase)

**Completed Features**:
- Contact list with grouped display
- Search bar with filtering
- Add contact button (opens contact modal)
- Contact item component with avatar
- Integration with contact modal

**Dependencies**: Phase 4 complete ✅

### Phase 5.5: Second Smoke Test ✅ COMPLETED (Merged into Phase 8.5)

**Status**: Testing performed continuously during development

**Completed:**
- [x] Keypad digit entry and dialing tested ✅
- [x] Contacts list, search, and grouping verified ✅
- [x] All three views work seamlessly ✅
- [x] View switching tested (disabled during active calls) ✅
- [x] Contact list performance validated ✅

**Note**: Informal smoke testing performed throughout development. Comprehensive integration testing deferred to Phase 8.5.

**Dependencies**: Phase 5 complete ✅

### Phase 6: Blocked View (Week 4) ✅ COMPLETED (Nov 2, 2025)

**Status**: Blocked view fully implemented

- [x] Blocked list layout ✅
- [x] Block number modal (number + name fields) ✅
- [x] Block number service integration ✅
- [x] Remove blocked number ✅
- [x] Navigation integration (add 4th tab) ✅

**Completed Features**:
- Blocked numbers list with remove buttons
- Block number modal for adding new blocked numbers
- Empty state when no blocked numbers
- Service calls: `blocked_add`, `blocked_remove`
- 4th navigation tab (Blocked) with block-helper icon
- Integration with backend blocked number services

**Version**: v0.1.53-alpha (to be released)

**Dependencies**: Phase 5.5 complete ✅

### Phase 7: Contact Modal (Week 5) ✅ COMPLETED

**Status**: Contact modal fully functional

- [x] Modal layout and styling ✅
- [x] Create mode ✅
- [x] Edit mode ✅
- [x] Form validation (including optional code field) ✅
- [x] Code uniqueness validation ✅
- [x] Dirty state tracking ✅
- [x] Save logic (add/remove workaround with ID support) ✅
- [x] Priority toggle ✅
- [x] Error handling ✅
- [x] Backend changes: Make code parameter optional ✅

**Completed Features**:
- Create new contacts with name, phone, optional code
- Edit existing contacts
- Mark contacts as priority
- Form validation and dirty state tracking
- Uses backend add/remove workaround for editing (backend limitation)
- Integration with contacts view and home view

**Dependencies**: Phase 6 complete (SKIPPED - not blocking) ✅

### Phase 8: Call Modal (Week 5-6) ✅ COMPLETED (Nov 2, 2025)

**Status**: Core call modal implementation complete with all essential features

- [x] Incoming call layout ✅
- [x] Swipe slider interaction ✅
- [x] In-call layout ✅
- [x] Dismiss button (X) in top-right ✅
- [x] Persistent call toast (when modal dismissed) ✅
  - Shows caller name/number ✅
  - Shows live updating call duration ✅
  - Clickable to return to call modal ✅
  - Auto-hides when call ends ✅
- [x] Call duration timer ✅
- [x] Mute/Speaker toggle ⚠️ (Mute disabled - backend service not implemented; Speaker working)
- [x] Call waiting display ✅
- [x] Switch call logic (swap/merge calls) ✅
- [x] Hang up button ✅

**Version**: v0.1.52-alpha

**Key Implementation Details**:
- Service calls use `entity_id` targeting (matches existing `dial_digit` pattern)
- Backend `_resolve_target_device_contexts()` resolves entity_id to device_id internally
- Toast styling: Single-line horizontal layout, reduced padding (8px 12px), minimal vertical space
- Fixed speaker service name: `toggle_volume_mode` (was incorrectly `call_toggle_speaker_mode`)
- All service calls working: answer_call, hangup, toggle_volume_mode, swap_calls, merge_calls

**Known Limitations**:
- Mute functionality disabled (backend `mute` service doesn't exist yet)
- UI polish deferred to Phase 9 (many minor discrepancies with design doc)

**Bug Fixes (Nov 2, 2025)**:
- Fixed service targeting errors (empty device_id → entity_id approach)
- Fixed toast taking too much vertical space (reduced padding, single-line layout)
- Fixed speaker service name (toggle_volume_mode vs call_toggle_speaker_mode)

**Dependencies**: Phase 7 complete ✅

### Phase 8.5: Full Integration Smoke Test 🧪

**Status**: To be started after Phase 8

- [ ] **SMOKE TEST #3**: Complete call flow testing
  - Test incoming call flow (answer/decline)
  - Test outgoing call from multiple entry points
  - Test call modal dismissal and persistent toast
  - Test contact creation/editing with optional codes
  - Test blocking numbers from call log
  - Test call waiting scenarios
  - Test all modals (contact, block, call)
  - End-to-end user flows

**Why here?**: At this point we have:

- ✅ Complete feature set
- ✅ All modals functional
- ✅ Full call handling
- ✅ Ready for real-world usage testing

**Dependencies**: Phase 8 complete ✅

### Phase 8.75: Touch Gesture System (Week 5.5)

**Objective**: Implement comprehensive touch gesture support for mobile-first interaction

#### Core Gesture Components

**Component**: `src/utils/gesture-handler.ts`

**Gesture Types**:

1. **Horizontal Swipe (Answer/Decline Calls)**
   - Already implemented in call modal slider
   - Swipe right → Answer call
   - Swipe left → Decline call
   - 70% threshold activation
   - Haptic feedback on activation

2. **Vertical Swipe (List Scrolling)**
   - Native scroll behavior (no custom handling needed)
   - Momentum scrolling on iOS
   - Overscroll bounce effect
   - Pull-to-refresh consideration (optional)

3. **Horizontal Swipe (Navigation Between Views)**
   - Swipe left: Navigate to next tab (Home → Keypad → Contacts → Blocked)
   - Swipe right: Navigate to previous tab
   - Visual feedback during swipe (view slides partially)
   - Snap to tab on release
   - Minimum swipe distance: 50px
   - Velocity threshold for quick swipes
   - Disable during modals/active calls

4. **Long Press (Context Actions)**
   - Call log item: Long press → Show context menu (Call, Add Contact, Block, Copy Number)
   - Contact item: Long press → Quick actions (Call, Edit, Delete)
   - Keypad number: Long press 0 → Insert "+"
   - Haptic feedback on activation (medium vibration)
   - Visual feedback (item highlight)
   - Minimum press duration: 500ms

5. **Double Tap (Quick Actions)**
   - Call log item: Double tap → Quick call
   - Contact item: Double tap → Quick call
   - Keypad: Double tap call button → Redial last number
   - Time threshold between taps: 300ms

6. **Pinch/Zoom (Optional - Future)**
   - Not implemented in Phase 8.75
   - Consideration for contact photo viewing

**Implementation Tasks**:

- [ ] Create `gesture-handler.ts` utility
  - [ ] Swipe detection (horizontal/vertical)
  - [ ] Long press detection
  - [ ] Double tap detection
  - [ ] Velocity calculation
  - [ ] Distance calculation
  - [ ] Direction determination

- [ ] Implement view navigation swipe
  - [ ] Add touch event listeners to card container
  - [ ] Detect horizontal swipes
  - [ ] Show visual preview during swipe
  - [ ] Animate tab transitions
  - [ ] Update navigation bar active state
  - [ ] Disable during modals

- [ ] Implement long press context menus
  - [ ] Call log item long press menu
  - [ ] Contact item long press menu
  - [ ] Keypad long press (0 → +)
  - [ ] Context menu component
  - [ ] Positioning logic (above/below item)

- [ ] Implement double tap quick actions
  - [ ] Call log double tap → call
  - [ ] Contact double tap → call
  - [ ] Keypad double tap → redial
  - [ ] Prevent single tap during double tap detection

- [ ] Add haptic feedback
  - [ ] Use existing `navigator.vibrate()` API
  - [ ] Light: 10ms (tap feedback)
  - [ ] Medium: 20ms (long press, selection)
  - [ ] Heavy: 30ms (swipe activation, errors)

- [ ] Edge case handling
  - [ ] Disable gestures during modals
  - [ ] Disable gestures during active calls
  - [ ] Handle simultaneous touches
  - [ ] Prevent accidental activations
  - [ ] Handle interrupted gestures (finger leaves screen)

**Gesture Configuration**:

```typescript
interface GestureConfig {
  // Swipe configuration
  swipe: {
    minDistance: number; // 50px
    maxDuration: number; // 800ms
    velocityThreshold: number; // 0.5 px/ms
    activationThreshold: number; // 70% for slider, 30% for nav
  };

  // Long press configuration
  longPress: {
    duration: number; // 500ms
    maxMovement: number; // 10px (allow slight finger drift)
  };

  // Double tap configuration
  doubleTap: {
    maxDelay: number; // 300ms between taps
    maxDistance: number; // 20px between tap locations
  };

  // Haptic feedback
  haptic: {
    enabled: boolean; // Auto-detect support
    light: number; // 10ms
    medium: number; // 20ms
    heavy: number; // 30ms
  };
}
```

**Touch Event Flow**:

```typescript
class GestureHandler {
  private touchStart: TouchEvent | null = null;
  private touchStartTime: number = 0;
  private lastTap: { time: number; x: number; y: number } | null = null;
  private longPressTimer: number | null = null;

  handleTouchStart(e: TouchEvent) {
    this.touchStart = e;
    this.touchStartTime = Date.now();

    // Check for double tap
    if (this.lastTap) {
      const timeSinceLast = Date.now() - this.lastTap.time;
      const distance = this.getDistance(e, this.lastTap);

      if (timeSinceLast < 300 && distance < 20) {
        this.onDoubleTap(e);
        this.lastTap = null;
        return;
      }
    }

    // Start long press timer
    this.longPressTimer = window.setTimeout(() => {
      if (this.isStillPressed(e)) {
        this.onLongPress(e);
      }
    }, 500);
  }

  handleTouchMove(e: TouchEvent) {
    // Cancel long press if moved too much
    if (this.touchStart && this.getDistance(e, this.touchStart) > 10) {
      this.cancelLongPress();
    }

    // Update swipe preview
    this.updateSwipePreview(e);
  }

  handleTouchEnd(e: TouchEvent) {
    this.cancelLongPress();

    const duration = Date.now() - this.touchStartTime;
    const distance = this.getDistance(e, this.touchStart);
    const velocity = distance / duration;

    // Check for swipe
    if (distance > 50 || velocity > 0.5) {
      const direction = this.getDirection(e, this.touchStart);
      this.onSwipe(direction, distance, velocity);
    } else {
      // Record tap for double tap detection
      this.lastTap = {
        time: Date.now(),
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      this.onTap(e);
    }

    this.touchStart = null;
  }
}
```

**Visual Feedback**:

- **Swipe Navigation**: Show partial view slide (20% opacity of next/prev view)
- **Long Press**: Ripple effect + item highlight
- **Double Tap**: Brief flash/scale animation
- **Context Menu**: Smooth fade-in from item position

**Performance Considerations**:

- Use `touch-action: pan-y` to prevent default horizontal scrolling during nav swipes
- Use `will-change: transform` for animated elements
- Debounce gesture detection (check every 16ms = 60fps)
- Cancel gestures if touch moves outside card bounds

**Accessibility**:

- All gesture actions MUST have button/click alternatives
- Screen reader announcements for gesture activations
- Keyboard shortcuts for power users:
  - Left/Right arrows: Navigate tabs
  - Enter: Activate item
  - Space: Toggle selection
  - Escape: Close modal/menu

**Testing Checklist**:

- [ ] Swipe between tabs works on mobile
- [ ] Swipe direction matches tab order
- [ ] Long press shows context menu
- [ ] Double tap quick-calls work
- [ ] Gestures disabled during modals
- [ ] Gestures disabled during calls
- [ ] Haptic feedback works (if supported)
- [ ] Visual feedback is smooth
- [ ] No accidental activations
- [ ] Works on iOS Safari
- [ ] Works on Chrome Android
- [ ] Keyboard alternatives work

**Dependencies**: Phase 8.5 complete ✅

### Phase 9: Polish & Testing (Week 6-7)

- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile testing

**Dependencies**: Phase 8.75 complete ✅

### Phase 10: Documentation & Release (Week 7)

- [ ] User documentation
- [ ] Installation guide
- [ ] Configuration options
- [ ] Troubleshooting guide
- [ ] Screenshots/demos
- [ ] Create final GitHub release (v1.0.0)
- [ ] Submit to HACS default repository
- [ ] **FINAL SMOKE TEST**: Complete acceptance testing
  - Full regression testing
  - Performance benchmarks
  - Accessibility audit
  - Multi-device testing
  - User acceptance testing

**Dependencies**: Phase 9 complete ✅

---

## Smoke Test Strategy

### Test Milestones

**Smoke Test #1** (After Phase 3):

- **Goal**: Verify core infrastructure and home view
- **Scope**: HACS installation, navigation, call log display
- **Duration**: ~30 minutes
- **Critical**: Foundation must work before building more features

**Smoke Test #2** (After Phase 5):

- **Goal**: Verify all views and core interactions
- **Scope**: All three views, navigation, basic phone functions
- **Duration**: ~1 hour
- **Critical**: Main interface must be solid before adding modals

**Smoke Test #3** (After Phase 8):

- **Goal**: Complete integration testing
- **Scope**: All features, modals, call flows, edge cases
- **Duration**: ~2-3 hours
- **Critical**: Feature-complete testing before polish phase

**Final Test** (After Phase 10):

- **Goal**: Production readiness validation
- **Scope**: Full regression, performance, accessibility
- **Duration**: ~4-6 hours
- **Critical**: Release quality assurance

### HACS Integration Details

**Files to Create for HACS**:

1. **hacs.json** - HACS configuration
2. **info.md** - HACS repository description
3. **.github/workflows/release.yml** - Automated releases
4. **README.md** - Installation and usage (already exists)

**Release Strategy**:

- Alpha releases (0.1.0-alpha.x) for smoke tests
- Beta releases (0.9.0-beta.x) after Phase 8
- Release candidates (1.0.0-rc.x) after Phase 9
- Stable release (1.0.0) after Phase 10

---

## Open Questions & Decisions Needed

### 1. Contact Code Management

**Question**: How should we handle auto-generating codes for new contacts?

**Options**:
a) Sequential (1, 2, 3, ...)
b) Hash-based (hash of name/number)
c) User-defined (let user choose)

**Recommendation**: Sequential for simplicity, but display codes in UI minimally (backend concern)
**Answer**: Actually, make codes optional. There will be a field in the contact create/edit page for the code, but it will be optional. If this requires changes to the firmware (I think it does) and/or backend (I think it does as well as both have validation), then we can make these changes before beginning. The contact code (if supplied) will only be displayed inside of the contact create/edit page, otherwise it's not very interesting for now.

### 2. Priority Contact Identification

**Question**: How do we determine if a contact is priority?

**Current Understanding**:

- Priority is stored separately as a list of numbers
- Need to cross-reference contact numbers with priority list

**Implementation**:

```typescript
function isContactPriority(
  contact: QuickDialEntry,
  priorityNumbers: Set<string>
): boolean {
  return priorityNumbers.has(contact.normalized_number);
}
```

**_Answer_**: that is correct - currently it's held in a completely separate list, and u need to cross reference.

### 3. Frequent Contacts Refresh

**Question**: When should frequent contacts be recalculated?

**Options**:
a) Every 24 hours automatically
b) On app load
c) Manual refresh button
d) Combination of above

**Recommendation**: Auto-refresh every 24 hours + on app load
**Answer**: That is good.

### 4. Call History Limit

**Question**: How many call history entries should we display/load?

**Current Understanding**:

- Backend stores up to 1000 entries (configurable)
- Show last 365 days

**Recommendation**:

- Load last 1000 entries via service call
- Filter to show only last 365 days in UI
- Use virtualization to handle large lists
  **Answer**: Good enough for now

### 5. Unknown Caller Display

**Question**: What should we show for callers not in contacts?

**Options**:
a) Just the number
b) Generic "Unknown Caller" text
c) Muted profile icon with number

**Recommendation**: Option c (muted 👤 with number) - matches Android behavior
**Answer**: That's fine

### 6. Theme Integration Depth

**Question**: How deep should theme integration go?

**Current Plan**:

- Respect light/dark mode
- Use HA color variables
- Use HA spacing/typography

**Additional Considerations**:

- Custom theme primary colors (e.g., purple, orange themes)
- Should call button always be green or use primary color?

**Recommendation**: Call button always green (success color), hang up always red (error color), other elements use primary color
**Answer**: That's fine

### 7. Offline Behavior

**Question**: What should happen if HA connection is lost?

**Options**:
a) Show error state, disable all actions
b) Allow viewing cached data, disable actions
c) Queue actions for when connection returns

**Recommendation**: Option b for Phase 1, option c for future enhancement
**Answer**: For now let's go for easiest - a.

### 8. Call Modal Dismissal

**Question**: Should user be able to dismiss call modal in any scenario?

**Current Plan**: No dismissal until call ends

**Edge Cases**:

- What if call gets stuck (firmware issue)?
- What if user wants to access HA while on call?

**Recommendation**:

- No dismissal by default
- Add hidden "force close" for troubleshooting (long-press back button?)
  **Answer**: We don't have a back button per-se, we are not a smart phone, just an entity card. For now let's add an X button somewhere (top left/right) that dismisses it, but while it's dismissed and we're in the other parts of the "app" show some persistent toast/notification/something that shows the call and its duration running, and clicking it returns us to the call modal

---

## Performance Targets

### Load Time

- Initial card load: < 500ms
- View switch: < 100ms
- Modal open: < 150ms

### Responsiveness

- Button tap to action: < 50ms
- Scroll smoothness: 60 FPS
- Search filter: < 100ms for 1000 contacts

### Memory

- Total card memory: < 10 MB
- Call history cache: < 2 MB
- Contacts cache: < 1 MB

---

## Accessibility Requirements

### ARIA Labels

- All buttons: `aria-label`
- Navigation tabs: `role="tablist"`, `aria-selected`
- Lists: `role="list"`, `role="listitem"`
- Modals: `role="dialog"`, `aria-modal="true"`

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for list navigation

### Screen Reader Support

- Announce view changes
- Announce modal open/close
- Announce toast notifications
- Announce call state changes

---

## Browser Support

### Minimum Versions

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari (iOS): Last 2 versions
- Chrome Mobile (Android): Last 2 versions

### Polyfills Needed

- None (Lit handles most compatibility)

---

## Deployment

### Installation for Users

1. Download `tsuryphone-card.js` from releases
2. Copy to `config/www/community/tsuryphone-card/`
3. Add to Lovelace resources:

```yaml
resources:
  - url: /local/community/tsuryphone-card/tsuryphone-card.js
    type: module
```

4. Add card to dashboard:

```yaml
type: custom:tsuryphone-card
device_id: tsuryphone # optional, defaults to 'tsuryphone'
```

### HACS Support (Future)

Create HACS-compatible repository with:

- `hacs.json`
- `info.md`
- GitHub releases

---

## Future Enhancements

### Phase 2 Features

1. **Call Recording Integration** (if firmware supports)
2. **Voicemail Visual Interface** (if firmware supports)
3. **Call Statistics Dashboard**
4. **Bulk Contact Import/Export UI**
5. **Advanced Search** (by call type, date range, duration)
6. **Contact Photos** (via HA person entity integration)
7. **Speed Dial Customization** (assign codes to contacts)
8. **Themes Selector** (custom card themes)
9. **Localization** (i18n support)
10. **Desktop Optimizations** (multi-column layouts)
11. **Custom Card Features** (quick controls for built-in cards)
    - Embeddable widgets for HA's Entities/Tile cards
    - Quick actions: Answer, Decline, Hang Up, Dial buttons
    - Inline call status display
    - Allows mixing TsuryPhone controls with other entities in standard dashboards
    - Use case: Users who want minimal phone controls without the full custom card interface
    - Components to build:
      - `tsuryphone-answer-feature`: Answer/Decline incoming call buttons
      - `tsuryphone-dial-feature`: Quick dial number input
      - `tsuryphone-status-feature`: Current call status display
      - `tsuryphone-hangup-feature`: End call button
    - **Priority**: Low (after main card is stable and if users request it)

### Integration Enhancements

1. **Home Assistant Person Integration**
   - Link contacts to HA person entities
   - Display person photos as avatars
   - Show person state (home, away, etc.)

2. **Call Automation Hooks**
   - Trigger automations on call events
   - Conditional call routing
   - Custom ringtones per contact

3. **Multi-Device Support**
   - Support multiple TsuryPhone devices
   - Device selector in UI
   - Unified call history across devices

---

## Testing Strategy

### Unit Tests

- Utility functions (date formatting, color generation, grouping)
- Component logic (state management, event handling)

### Integration Tests

- Service calls
- WebSocket subscriptions
- State updates

### E2E Tests

- User flows (make call, add contact, block number)
- Modal interactions
- Navigation

### Manual Testing Checklist

- [ ] Light/Dark theme switching
- [ ] All navigation tabs
- [ ] Call log filtering
- [ ] Contact search
- [ ] Add/Edit/Delete contact
- [ ] Block/Unblock number
- [ ] Make call from various places
- [ ] Incoming call flow
- [ ] Call waiting flow
- [ ] Keypad input
- [ ] Toast notifications
- [ ] Confirmation dialogs
- [ ] Mobile touch interactions
- [ ] Keyboard navigation
- [ ] Screen reader support

---

## Implementation Decisions (Based on Requirements Analysis)

### Confirmed Design Decisions:

1. **Avatar Images**: Letter-based avatars only for v1. No image support needed.

2. **Block Number Modal**: Full modal form with two fields (Number and Name), similar to contact creation but simpler.

3. **Backend Modifications**: Backend is feature-complete. We can modify if needed but current API is sufficient.

4. **Device ID**: Single device support only for v1.

5. **Call History Sync**:
   - **Decision**: Use HA coordinator state updates (automatic via WebSocket)
   - **Analysis**: The coordinator updates `call_history` when processing call events and calls `async_set_updated_data()`, which triggers all entity state updates
   - **Implementation**: Subscribe to `sensor.tsuryphone_phone_state` attribute changes, which includes the full call_history array
   - **Fallback**: If needed, can also call `get_call_history` service on mount/refresh
   - **Result**: No polling needed, real-time updates via HA's standard WebSocket mechanism

6. **Contact Codes**:
   - **Codes are OPTIONAL** (this requires backend changes)
   - **UI**: Show code field in contact create/edit modal
   - **Auto-generation**: When code is not provided, auto-generate next available number (1, 2, 3...)
   - **Validation**: Show friendly error if code already exists
   - **Display**: Codes only shown in edit modal, not in list view
   - **Backend Changes Required**:
     - Make `code` parameter optional in `quick_dial_add` service
     - Add auto-generation logic in backend service handler
     - Update validation to check for duplicate codes
     - May need firmware changes if it validates codes (to be checked)

7. **Priority Contact UI**: Star toggle only in contact modal, not in list view.

8. **Swipe Sensitivity**: 70% threshold (Android-like behavior) - requires swiping 70% of the width to activate.

9. **Haptic Feedback**:
   - **Analysis**: HA doesn't have built-in haptic feedback API for cards
   - **Decision**: Use browser's Vibration API if available (`navigator.vibrate()`)
   - **Implementation**: Add light haptic feedback (10-20ms) for:
     - Keypad button presses
     - Incoming call swipe activation
     - Important button taps
   - **Graceful degradation**: Feature detection, no errors if unavailable

10. **Offline Caching**: Show error overlay when HA connection is lost. Disable all interactions.

11. **Call Modal Dismissal**:
    - **Behavior**: Call modal can be dismissed with X button (top-right)
    - **During Incoming Call**: Must answer or decline before dismissing
    - **During Active Call**: Can dismiss and navigate the card
    - **Persistent Toast**: When dismissed during active call:
      - Shows at top of card (or bottom, TBD based on UX)
      - Displays: Caller name/number + live call duration
      - Clickable to return to call modal
      - Auto-hides when call ends
      - Stays visible across all views/tabs
    - **Purpose**: Allow users to access other HA features while on call

---

## Backend Modifications Status

### ✅ Optional Contact Codes - COMPLETED (Nov 1, 2025)

**Backend Changes (Python)**:

- ✅ Updated `QUICK_DIAL_ADD_SCHEMA` in `services.py` to make `code` optional
- ✅ Updated `QUICK_DIAL_REMOVE_SCHEMA` to accept either `id` or `code` parameter
- ✅ Updated service handlers to handle optional code parameter
- ✅ Added `remove_quick_dial_by_id()` method to API client
- ✅ Updated API client to only include code in request if provided

**Firmware Changes (C++)**:

- ✅ Added `String id` field to `QuickDialEntry` struct (DeviceConfig.h)
- ✅ Implemented UUID generation using `qd_<timestamp>_<random>_<counter>` pattern
- ✅ Updated `addQuickDialEntry()` to:
  - Generate unique ID for each entry
  - Allow empty codes (only validates conflict if code provided)
  - Create entries with new 5-parameter constructor including ID
- ✅ Added ID-based methods: `removeQuickDialById()`, `getQuickDialById()`, `hasQuickDialId()`
- ✅ Updated JSON serialization to include `id` field (all entry types)
- ✅ Updated `IntegrationService::handleAddQuickDial()` to:
  - Only require `number` parameter
  - Return generated `id` in response data
- ✅ Added `IntegrationService::handleRemoveQuickDialById()` method
- ✅ Updated `HAIntegration.cpp` to:
  - Extract code as optional parameter
  - Support ID-based removal only (no code fallback)
  - Include ID in broadcast payloads

**Key Features Implemented**:

- Codes are now truly optional (no auto-generation, user can leave blank)
- Internal IDs used for primary identification
- Frontend can now create contacts without codes
- Removal requires ID (clean break from code-based removal)

---

## Ready to Begin Frontend Development!

All backend prerequisites have been completed. We can now proceed with implementation starting with **Phase 1: Foundation**.

---

## ✅ IMPLEMENTATION PROGRESS (Nov 1, 2025)

### Phase 1: Foundation - COMPLETED ✅

**Status**: All foundation work completed. Card structure, build system, and navigation implemented.

**Completed Tasks**:

- ✅ Project setup with Lit + TypeScript + Rollup
- ✅ Created `tsuryphone-card.ts` root component
- ✅ Implemented `tsuryphone-navigation.ts` bottom navigation (3 tabs)
- ✅ Set up HACS distribution (hacs.json, info.md)
- ✅ Configured GitHub Actions for automatic releases
- ✅ Base styling with HA theme integration

**Version**: v0.1.0-alpha through v0.1.3-alpha

---

### Phase 2: Home View Skeleton - COMPLETED ✅

**Status**: Home view structure implemented with placeholder content.

**Completed Tasks**:

- ✅ Created `home-view.ts` component
- ✅ Implemented view switching in main card
- ✅ Added call-log-filters component (All/Missed/Contacts/Blocked)
- ✅ Added call-log-list with mock data rendering
- ✅ Created call-log-item component with avatar, name, time display
- ✅ Integrated with HA theming system

**Version**: v0.1.4-alpha through v0.1.6-alpha

---

### Phase 3: Contacts View - COMPLETED ✅

**Status**: Contacts view fully implemented (placeholder for now).

**Completed Tasks**:

- ✅ Created contacts-view.ts skeleton
- ✅ Added to navigation routing
- ✅ Basic layout structure

**Version**: v0.1.7-alpha

---

### Phase 4: Keypad View - COMPLETED ✅ (MAJOR MILESTONE!)

**Status**: Fully functional keypad with delete last digit, real backend integration, and state-driven architecture.

**Completed Tasks**:

**Frontend (v0.1.8-alpha through v0.1.21-alpha)**:

- ✅ Created `keypad-view.ts` container component
- ✅ Implemented `keypad-grid.ts` with 0-9, \*, # buttons
- ✅ Implemented `dialed-number-display.ts` with live state
- ✅ Added backspace/delete button to keypad grid
- ✅ **CRITICAL REFACTOR**: Removed ALL local state - now 100% backend-driven
  - No `_dialedNumber` local state
  - Reads from `sensor.{device}_current_dialing_number` entity
  - Service calls without optimistic updates
  - Single source of truth: backend state
- ✅ Implemented `shouldUpdate()` lifecycle for entity state reactivity
- ✅ **ROBUST ENTITY DISCOVERY**: Created `entity-discovery.ts` utility
  - Uses HA WebSocket API (`config/entity_registry/list`)
  - Discovers all device entities automatically
  - No hardcoded entity name patterns
  - Works with ANY entity naming scheme
  - Caches results to avoid repeated calls
- ✅ Service integration:
  - `tsuryphone.dial_digit` - dial each digit
  - `tsuryphone.delete_last_digit` - backspace functionality
  - `tsuryphone.dial` - initiate call
- ✅ Added haptic feedback (light vibration on button press)
- ✅ Styled with Material Design principles
- ✅ Fully responsive layout

**Backend Integration (Python - v1.0.124)**:

- ✅ Added `SERVICE_DELETE_LAST_DIGIT = "delete_last_digit"`
- ✅ Created service handler `async_delete_last_digit()`
- ✅ Added service schema validation
- ✅ Integrated with API client
- ✅ Added to services.yaml

**Button Entity (Python)**:

- ✅ Created "Call - Delete Last Digit" button entity
- ✅ Added button description with icon `mdi:backspace-outline`
- ✅ Implemented availability logic (enabled when digits exist and phone idle)
- ✅ Linked to delete service handler

**Firmware Implementation (C++ - manual_override branch, commit 18ee112)**:

- ✅ Added `handleIntegrationDeleteLastDigitRequest()` in main.cpp
- ✅ Implemented callback registration in `setupTsuryPhoneCallbacks()` (13 parameters)
- ✅ Created `TsuryPhoneIntegrationHandlers.cpp` with delete logic
- ✅ Updated IntegrationManager with callback forwarding
- ✅ Added HTTP endpoint: `POST /api/call/delete_last_digit`
- ✅ Complete implementation across all layers:
  - IntegrationService (generic interface)
  - HAIntegration (HA-specific implementation)
  - HAWebServer (HTTP routing)
  - IntegrationShim (stub updates)
- ✅ Clean architecture maintained throughout

**Build Status**:

- ✅ Frontend: Compiles successfully (TypeScript)
- ✅ Backend: All services registered
- ✅ Firmware: 84.4% flash, 16.8% RAM usage

**Testing Results**:

- ✅ **VERIFIED WORKING**: Can dial digits from card UI
- ✅ Digits appear in real-time on card display
- ✅ Numbers dial on actual phone device
- ✅ Backend state updates propagate to UI immediately
- ✅ Entity discovery works across all naming schemes
- ✅ Delete last digit fully functional

**Architecture Achievement**:

- ✅ **Single source of truth**: Backend state drives everything
- ✅ **No double state**: UI is pure reflection of backend
- ✅ **Future-proof**: Entity discovery eliminates brittle name matching
- ✅ **Reactive**: Real-time updates via HA WebSocket
- ✅ **Robust**: Works with ANY device naming scheme

**Version**: v0.1.21-alpha (current)

---

### What's Next?

**Phase 5: Contacts View Implementation**

- Implement contact list rendering
- Add contact search functionality
- Create contact modal (add/edit)
- Integrate with quick_dial services
- Apply same state-driven architecture

**Phase 6: Call History Integration**

- Connect home view to real call_history data
- Implement grouping by date
- Add call-back functionality
- Integrate frequent contacts calculation

**Phase 7: Call Modal**

- Incoming call UI with swipe gestures
- In-call controls (hangup, speaker, mute)
- Persistent call toast
- Call state management

**Phase 8: Blocked View**

- Blocked numbers list
- Block number modal
- Remove blocked number functionality

**Phase 8.5: Full Integration Smoke Test**

- Complete call flow testing
- Contact CRUD testing
- Call waiting scenarios
- End-to-end user flows

**Phase 8.75: Touch Gesture System**

- Swipe gestures for navigation
- Long press for context menus
- Double tap for quick actions

**Phase 9: Polish & Testing**

- Error handling and edge cases
- Loading states and animations
- Accessibility improvements
- Cross-browser testing
- Performance optimization

---

## Current State Summary (Nov 2, 2025)

**Current Version**: v0.1.40-alpha

✅ **Working Features**:

- Navigation between 3 views (Home, Keypad, Contacts)
- Fully functional keypad with backend integration
- Real-time digit dialing with device synchronization
- Delete last digit functionality
- **Complete Contacts View with CRUD operations**
  - Search/filter contacts
  - Alphabetical grouping
  - Empty state
  - Contact item display with avatars
- **Full-screen Contact Modal**
  - Add new contacts
  - Edit existing contacts
  - Delete contacts with confirmation
  - Priority caller toggle
  - Quick dial code assignment
  - Form validation
- State-driven UI architecture (no local state)
- Device-based entity discovery (future-proof)
- Haptic feedback on interactions
- HA theming integration (dark/light mode)
- HACS distribution with auto-releases
- Card height optimization (761px, no scroll)

🚧 **In Progress**:

- None (Phase 6 complete!)

📋 **Not Started**:

- Call modals and toasts (Phase 7)
- Blocked numbers view (Phase 8)
- Real call history integration (postponed)
- Advanced features (gestures, offline mode, etc.)

**Next Immediate Goal**: Implement Call Modal (Phase 7) with incoming call UI, swipe gestures, and in-call controls.

---

### Phase 5: Contacts View - ✅ COMPLETED (Nov 2, 2025)

**Status**: Contacts view fully functional with all features working!

**Strategy**: Built reusable internal components following DRY principles within TsuryPhone.

**Completed Shared Components**:

- ✅ `utils/haptics.ts` - Centralized haptic feedback (light/medium/heavy)
- ✅ `utils/formatters.ts` - Phone numbers, dates, durations, avatar colors
- ✅ `utils/entity-discovery.ts` - Device-based entity resolution (future-proof)
- ✅ `styles/shared-styles.ts` - Common CSS (avatars, lists, modals, forms, empty states)
- ✅ `components/shared/avatar.ts` - Reusable letter avatars with color generation
- ✅ `components/shared/empty-state.ts` - Empty state messages with actions

**Completed Contact Components**:

- ✅ `contacts-view.ts` - Main container with search, grouping, add button
- ✅ `contact-item.ts` - Individual contact with avatar, name, number, call button, priority star

**Features Implemented**:

- ✅ Display contacts from `phone_state.attributes.quick_dials`
- ✅ Search/filter by name or number
- ✅ Alphabetical grouping by first letter
- ✅ Call button on each contact (with haptic feedback)
- ✅ Priority star indicator for priority_numbers
- ✅ Empty state with "Add Contact" action
- ✅ Tap contact to edit (fires edit-contact event)
- ✅ Reusable components prevent code duplication

**Backend Integration** (v1.0.126):

- ✅ Exposed `quick_dials` in `phone_state` sensor attributes
- ✅ State-driven architecture - backend is single source of truth
- ✅ No service calls needed for display (reactive updates)

**Services Ready for Modal** (Phase 6):

- `tsuryphone.quick_dial_add` (code optional)
- `tsuryphone.quick_dial_remove` (by ID)
- `tsuryphone.dial` (tap to call - working)
- `tsuryphone.priority_add/remove`

**Version Delivered**: v0.1.32-alpha
**Backend Version**: v1.0.130

**Major Refactor Completed** (Nov 2, 2025):

- ✅ Eliminated `normalizedNumber` field from all contact entry structs (firmware/backend/frontend)
- ✅ Simplified data model: `number` field IS the normalized E.164 format
- ✅ Removed duplicate normalization logic across all layers
- ✅ Breaking change: Old firmware/backend incompatible (no backward compatibility)
- ✅ Call records still maintain separate `normalizedNumber` for matching (unchanged)
- **Firmware**: Removed hasNormalized(), effectiveNumber(), matchesNormalized() helpers
- **Backend**: Removed normalized_number from QuickDialEntry, BlockedNumberEntry, PriorityCallerEntry
- **Frontend**: Updated TypeScript types, simplified priority comparison logic

---

### Phase 6: Contact Modal ✅ COMPLETED (Nov 2, 2025)

**Objective**: Implement complete CRUD operations for contacts with in-card full-screen modal.

**Status**: All features implemented, tested, and deployed! ✅

**Version**: v0.1.40-alpha

**Component Created**: `components/modals/contact-modal.ts`

**Design Clarification**: 
- ✅ Modal is a **full-screen view within the card** (not a floating dialog)
- ✅ Fills 100% width and height of the card container
- ✅ Completely hides navigation and content below
- ✅ Slides in from bottom with smooth animation
- ✅ No rounded corners, no shadows, no overlay darkness
- ✅ Position: absolute (contained within card, not viewport-level)
- ✅ z-index: 100 (sits on top of card content)

**Features Implemented**:
- ✅ Full-screen modal UI (fills entire card)
- ✅ Name field (required validation)
- ✅ Phone number field (required + format validation)
- ✅ Code field (optional, with uniqueness validation)
- ✅ Priority toggle (checkbox with star icon)
- ✅ Add mode (triggered by "Add Contact" button)
- ✅ Edit mode (triggered by tapping contact)
- ✅ Save button (calls backend service)
- ✅ Delete button (edit mode only, with confirmation dialog)
- ✅ Cancel button
- ✅ Form validation with error messages
- ✅ Loading states during service calls
- ✅ Haptic feedback on all actions
- ✅ Auto-close on success
- ✅ Error handling and notifications

**Fixes Applied (Nov 2, 2025)**:

**Modal Opening**:
- ✅ Added `reflect: true` to `open` property - fixes modal not opening
- ✅ Fixed "Add Contact" button not dispatching `action` event

**Modal Layout & Design**:
- ✅ Changed from `position: fixed` → `position: absolute` - modal now contained in card
- ✅ Removed rounded corners, shadows, and semi-transparent overlay
- ✅ Changed to fill 100% width/height (no centering, no max-width)
- ✅ Added `box-sizing: border-box` to prevent padding overflow
- ✅ Animation: slide from right → slide from bottom (translateY)

**Card Height Optimization**:
- ✅ Set explicit CSS height (450px → 650px → 750px → **761px**)
- ✅ `getCardSize()` returns 9 (HA grid hint, doesn't control actual CSS)
- ✅ Final height: **761px** eliminates all scrolling in keypad view

**Service Integration**:
- ✅ **Add**: `tsuryphone.quick_dial_add` with `{number, name, code?, priority?}`
- ✅ **Edit**: Delete old + Add new workaround (backend limitation)
  - First: `tsuryphone.quick_dial_remove {id: oldId}`
  - Then: `tsuryphone.quick_dial_add` with new values
- ✅ **Delete**: `tsuryphone.quick_dial_remove {id}` + confirmation
- ✅ **Priority**: 
  - Add: `tsuryphone.priority_add {number}`
  - Remove: `tsuryphone.priority_remove {id}` (finds priority entry ID)

**Event Flow**:
- ✅ Contact item click → fires `edit-contact` event → opens modal in edit mode
- ✅ "Add Contact" button → fires `action` event → opens modal in add mode
- ✅ Save → fires `contact-saved` event → closes modal, data refreshes automatically
- ✅ Delete → fires `contact-deleted` event → closes modal, data refreshes automatically
- ✅ Error → fires `error` event → displays error message for 3 seconds

**Validation**:
- ✅ Name: Required, min 1 character
- ✅ Number: Required, regex validation for phone format
- ✅ Code: Optional, uniqueness check against existing quick_dials
- ✅ Real-time error display as user types

**UI/UX Features**:
- ✅ Full-screen modal (completely replaces view)
- ✅ Slide-up from bottom animation (0.3s ease-out)
- ✅ Close button (X) in top-right
- ✅ Title changes: "Add Contact" vs "Edit Contact"
- ✅ Form fields with labels and inline error messages
- ✅ Delete button in red (edit mode only)
- ✅ Confirmation dialog for delete (inline, with cancel/confirm buttons)
- ✅ Loading spinner during save/delete
- ✅ Disabled state prevents double-submission
- ✅ Haptic feedback: light (close), medium (save/delete start), heavy (errors)

**Edge Cases Handled**:
- ✅ Duplicate code detection (shows error)
- ✅ Invalid phone number format (shows error)
- ✅ Priority caller state sync (auto-detects current priority status)
- ✅ Delete confirmation prevents accidental deletion
- ✅ Loading state prevents concurrent operations
- ✅ Modal state cleanup on close

**Version Delivered**: v0.1.46-alpha
**Backend Version**: v1.0.132 (fixed call history attributes)

**Dependencies**: Phase 5 complete ✅

---

### Phase 6.5: Call History Integration ✅ COMPLETED (Nov 2, 2025)

**Objective**: Connect backend call history data to frontend home view display.

**Status**: Working! Call history now displays in home view ✅

**Version**: Frontend v0.1.46-alpha, Backend v1.0.132

**Issues Fixed**:

**Backend Fixes**:
- ✅ Added `entries` attribute to `sensor.call_history_size` sensor
- ✅ Fixed AttributeError: Used correct `CallHistoryEntry` model attributes
  - Changed from: `entry.result`, `entry.is_priority` (don't exist)
  - Changed to: `entry.call_type`, `entry.is_incoming`, `entry.reason`, `entry.seq`
- ✅ Sensor entity category set to DIAGNOSTIC (disabled by default, needs manual enable)

**Frontend Fixes**:
- ✅ Extract device ID from entity name for multi-sensor lookup
  - Parse `entity: sensor.phone_state` → look for `sensor.call_history_size`
- ✅ Read from correct sensor (`call_history_size` not `phone_state`)
- ✅ Map backend data format to frontend format:
  - `received_ts` (Unix seconds) → `timestamp` (ISO string)
  - `number` → `phoneNumber`
  - `name` → `contactName`
  - `duration_s` → `duration`
  - `call_type` → `type`
  - `seq` → `id`
- ✅ Convert Unix timestamp to JavaScript Date for grouping functions

**Data Flow**:
1. Backend: `sensor.call_history_size` exposes `attributes.entries[]` 
2. Frontend: Card reads from `call_history_size` sensor
3. Frontend: Maps backend format → frontend `CallHistoryEntry` format
4. Frontend: Passes to `home-view` component
5. Frontend: Groups by date (Today, Yesterday, This Week, etc.)

**Backend Entry Format**:
```python
{
  "number": "+972546662771",
  "name": "Amit",
  "call_type": "outgoing",  # incoming/outgoing/missed/blocked
  "is_incoming": False,
  "duration_s": 6,
  "received_ts": 1730556234.567,  # Unix timestamp
  "reason": None,
  "seq": 42
}
```

**Frontend Entry Format**:
```typescript
{
  id: "42",
  contactName: "Amit",
  phoneNumber: "+972546662771",
  timestamp: "2025-11-02T15:30:34.567Z",  // ISO string
  duration: 6,
  type: "outgoing",  // CallType
  isBlocked: false
}
```

**User Action Required**:
- ⚠️ Must manually enable `sensor.call_history_size` (Settings → Devices → TsuryPhone → Enable entity)
- This is because backend sets `entity_category=EntityCategory.DIAGNOSTIC`

**Dependencies**: Phase 6 complete ✅

---

### Phase 6.75: UI/UX Polish Pass - DEFERRED ⏸️

**Note**: Several discrepancies exist between the current implementation and the design document. A comprehensive polish session is required to align all UI elements with the design specifications.

**Items Requiring Polish**:
- Call history item layout and styling
- Contact card design and spacing
- Typography consistency (font sizes, weights)
- Color scheme alignment with design
- Icon sizing and positioning
- Animation timing and easing
- Touch target sizes
- Spacing and padding consistency
- Modal transitions
- Error state designs
- Empty state designs
- Loading state designs

**Decision**: Defer polish pass until after Phase 7 (Call Modal) and Phase 8 (Blocked View) are complete. This allows us to polish all views together in a single comprehensive pass.

**Dependencies**: Phases 6, 6.5, 7, 8 complete

---

### Phase 7: Call Modal - NEXT 🎯

**Objective**: Implement complete CRUD operations for contacts with modal UI.

**Components to Build**:

- [ ] `components/modals/contact-modal.ts` - Main modal container
- [ ] Form UI with fields:
  - [ ] Name field (required)
  - [ ] Phone number field (required, validation)
  - [ ] Code field (optional, auto-generated if empty)
  - [ ] Priority toggle (checkbox/switch)
- [ ] Modes:
  - [ ] Add mode (triggered by "Add Contact" button)
  - [ ] Edit mode (triggered by tapping contact)
- [ ] Actions:
  - [ ] Save button (calls backend service)
  - [ ] Delete button (edit mode only, with confirmation)
  - [ ] Cancel button

**Form Validation**:

- Name: Required, min 1 character
- Number: Required, valid phone format
- Code: Optional, if provided must be unique (check against existing quick_dials)
- Priority: Boolean toggle

**Service Calls**:

- **Add**: `tsuryphone.quick_dial_add` with `{number, name, code?, priority?}`
- **Edit**: Delete old + Add new (backend limitation workaround)
  - First: `tsuryphone.quick_dial_remove` with `{id: oldId}`
  - Then: `tsuryphone.quick_dial_add` with new values
- **Delete**: `tsuryphone.quick_dial_remove` with `{id}`
- **Priority**:
  - Add: `tsuryphone.priority_add` with `{number}`
  - Remove: `tsuryphone.priority_remove` with `{id}` (from priority_callers list)

**State Management**:

- Modal open/close state
- Current mode (add/edit)
- Current contact data (for edit mode)
- Form field values
- Validation errors
- Loading/saving state

**Edge Cases Handled**:
- ✅ Duplicate code detection (shows inline error)
- ✅ Invalid phone number format (shows inline error)
- ✅ Network errors during service calls (shows error event)
- ✅ Concurrent edits (auto-refresh via state subscription)
- ✅ Delete confirmation (inline confirmation dialog)
- ✅ Priority sync (automatically adds/removes from priority list)
- ✅ Edit mode workaround (delete old + add new due to backend limitation)

**Version**: v0.1.40-alpha ✅

**Dependencies**: Phases 6, 6.5 complete ✅

---

### Phase 7: Call Modal ✅ COMPLETED (Nov 2, 2025)

**Objective**: Implement full-screen in-card call modal for incoming and active calls

**Status**: All core features implemented! ✅

**Version**: v0.1.48-alpha

**Component Created**: `components/modals/call-modal.ts`

**Design Confirmation**:
- ✅ **Full-screen in-card modal** (same as contact modal)
- ✅ Position: absolute (not fixed - stays within card)
- ✅ 100% width and height of card container
- ✅ z-index: 100 (on top of content)
- ✅ Slides up from bottom with 0.3s animation
- ✅ Minimize button (−) instead of close (X)

**Features Implemented**:

**Incoming Call UI**:
- ✅ Caller info display (name/number)
- ✅ Priority caller badge (⭐ indicator)
- ✅ Call status text
- ✅ **Swipe Slider** for answer/decline:
  - Swipe right (>120px) to answer (green)
  - Swipe left (<-120px) to decline (red)
  - Visual feedback with handle color change
  - Haptic feedback on swipe completion
  - Touch-based interaction (no click)

**Active Call UI**:
- ✅ Caller info display
- ✅ **Call duration timer** (MM:SS format, live updating)
- ✅ Mute button (🔇/🔊 toggle with visual state)
- ✅ Keypad button (#) for DTMF (toggle state)
- ✅ Speaker button (🔊) with active state
- ✅ Hangup button (📞 red, grid-span full width)
- ✅ Control buttons in 3-column grid layout

**Call Waiting UI**:
- ✅ Waiting call info card (name/number)
- ✅ Priority badge for waiting calls
- ✅ Swap button (switch between calls)
- ✅ Merge button (conference calls)
- ✅ Displayed above active call controls

**State Management**:
- ✅ Auto-updates from HA state sensors:
  - `sensor.phone_state` → determine mode (incoming/active)
  - `binary_sensor.in_call` → active call detection
  - `sensor.current_call` → caller info
  - `sensor.call_duration` → timer value
  - `sensor.call_audio_output` → speaker state
  - `sensor.current_waiting_call` → waiting call info
- ✅ Modal mode: `incoming` | `active` | `waiting`
- ✅ Device ID extraction from config entity name
- ✅ Automatic modal open/close based on phone state

**Service Integration**:
- ✅ Answer: `tsuryphone.answer_call`
- ✅ Decline/Hangup: `tsuryphone.hangup_call`
- ✅ Mute: `tsuryphone.toggle_mute`
- ✅ Speaker: `tsuryphone.toggle_speaker`
- ✅ Swap calls: `tsuryphone.swap_calls`
- ✅ Merge calls: `tsuryphone.merge_calls`

**Interactions**:
- ✅ Swipe gestures for answer/decline
- ✅ Haptic feedback (light/medium/heavy)
- ✅ Loading states during service calls
- ✅ Error handling with event dispatch
- ✅ Minimize button (closes modal but keeps call active)

**Features Deferred**:
- ⏸️ **Persistent Call Toast**: Shows when modal minimized during active call
  - Will display: caller name, duration, tap to reopen
  - Deferred to Phase 7.5 or later
- ⏸️ **DTMF Keypad**: Button implemented but keypad UI deferred
  - Full keypad for sending digits during call
  - Deferred to Phase 7.5 or later

**Edge Cases Handled**:
- ✅ Modal stays closed if user minimizes during active call
- ✅ Modal auto-opens on new incoming call
- ✅ Modal auto-closes when call ends
- ✅ Timer stops when modal unmounts
- ✅ Swipe distance clamped to prevent overflow
- ✅ Service call failures handled gracefully

**Version Delivered**: v0.1.48-alpha
**Backend Version**: v1.0.132 (no changes needed)

**Dependencies**: Phases 6, 6.5 complete ✅

---

### Phase 8: Blocked View - NEXT 🎯
