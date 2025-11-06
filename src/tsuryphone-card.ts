/**
 * TsuryPhone Card - Main Component
 * A modern phone and contacts interface for Home Assistant
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "./types/homeassistant";
import {
  TsuryPhoneCardConfig,
  QuickDialEntry,
  BlockedNumberEntry,
  CallHistoryEntry,
} from "./types/tsuryphone";
import {
  haThemeVariables,
  haButtonStyles,
  haCardStyles,
  isDarkMode,
} from "./styles/theme";
import { commonStyles } from "./styles/common";
import "./components/navigation/tsuryphone-navigation";
import "./components/home/home-view";
import "./components/keypad/keypad-view";
import "./components/contacts/contacts-view";
import "./components/blocked/blocked-view";
import "./components/modals/contact-modal";
import "./components/modals/call-modal";
import "./components/modals/block-number-modal";
import type {
  NavigationTab,
  TabChangeEvent,
} from "./components/navigation/tsuryphone-navigation";
import type {
  CallHistoryEntry as CallHistoryEntryType,
  CallType,
} from "./utils/call-history-grouping";
import type {
  CallModalMode,
  CallInfo,
  WaitingCallInfo,
} from "./components/modals/call-modal";

// Declare the card for Home Assistant
declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-card": TsuryPhoneCard;
  }
}

// Register with custom elements registry
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "tsuryphone-card",
  name: "TsuryPhone Card",
  description: "A modern phone and contacts interface",
});

@customElement("tsuryphone-card")
export class TsuryPhoneCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TsuryPhoneCardConfig;

  @state() private _activeView: NavigationTab = "home";
  @state() private _showCallModal = false;
  @state() private _showContactModal = false;
  @state() private _showBlockModal = false;
  @state() private _isDarkMode = false;

  // Cached data from coordinator
  @state() private _contactsCache: QuickDialEntry[] = [];
  @state() private _blockedCache: BlockedNumberEntry[] = [];
  @state() private _callHistoryCache: CallHistoryEntry[] = [];
  @state() private _priorityNumbers: Set<string> = new Set();
  @state() private _defaultDialCode = "";

  // Connection state
  @state() private _isConnected = true;
  @state() private _errorMessage = "";

  // Contact Modal state
  @state() private _contactModalOpen = false;
  @state() private _contactModalMode: "add" | "edit" = "add";
  @state() private _contactModalData?: QuickDialEntry;

  // Call Modal state
  @state() private _callModalOpen = false;
  @state() private _callModalMode: CallModalMode = "incoming";
  @state() private _currentCallInfo?: CallInfo;
  @state() private _waitingCallInfo?: WaitingCallInfo;
  @state() private _callWaitingAvailable = false;
  @state() private _showCallToast = false;
  private _callModalMinimized = false;

  // Subscriptions
  private _unsubscribers: Array<() => void> = [];

  /**
   * Set the configuration for this card
   */
  setConfig(config: TsuryPhoneCardConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  /**
   * Get the card size (used by HA for layout)
   */
  getCardSize(): number {
    return 9; // Roughly 9 grid rows (~450px) - fits keypad without scroll
  }

  /**
   * Lifecycle: Connected to DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    this._subscribe();
  }

  /**
   * Lifecycle: Disconnected from DOM
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribe();
  }

  /**
   * Lifecycle: Property updated
   */
  protected updated(changedProps: Map<string, any>): void {
    super.updated(changedProps);

    if (changedProps.has("hass")) {
      this._handleHassUpdate();
    }
  }

  /**
   * Subscribe to Home Assistant state changes
   */
  private _subscribe(): void {
    if (!this.hass || !this.hass.connection) {
      console.warn("TsuryPhone: Cannot subscribe - no HA connection");
      return;
    }

    try {
      // Subscribe to entity state changes using subscribeEvents
      // We listen for state_changed events for our entities
      const deviceId = this.config?.device_id || "tsuryphone";

      const unsubPromise = this.hass.connection.subscribeEvents(
        (event: any) => {
          // Check if the event is for one of our entities
          const entityId = event.data?.entity_id;
          if (
            (entityId && entityId.startsWith(`sensor.${deviceId}_`)) ||
            entityId?.startsWith(`binary_sensor.${deviceId}_`)
          ) {
            this._handleStateUpdate();
          }
        },
        "state_changed"
      );

      if (unsubPromise && typeof unsubPromise.then === "function") {
        unsubPromise
          .then((unsub: () => void) => {
            this._unsubscribers.push(unsub);
          })
          .catch((err: any) => {
            console.error(
              "TsuryPhone: Failed to subscribe to state changes:",
              err
            );
          });
      }
    } catch (err) {
      console.error("TsuryPhone: Error in subscribe:", err);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  private _unsubscribe(): void {
    this._unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (err) {
        console.error("TsuryPhone: Error unsubscribing:", err);
      }
    });
    this._unsubscribers = [];
  }

  /**
   * Handle Home Assistant updates
   */
  private _handleHassUpdate(): void {
    if (!this.hass) {
      this._isConnected = false;
      this._errorMessage = "Connection to Home Assistant lost";
      return;
    }

    this._isConnected = true;
    this._errorMessage = "";
    this._isDarkMode = isDarkMode(this.hass);

    // Update cached data from coordinator state
    // Support both direct entity config and device_id pattern
    let deviceId = this.config?.device_id || "tsuryphone";
    let phoneStateEntityId: string;

    if (this.config?.entity) {
      // Use entity directly if provided
      phoneStateEntityId = this.config.entity.startsWith("sensor.")
        ? this.config.entity
        : `sensor.${this.config.entity}`;

      // Extract device ID from entity name (e.g., "sensor.phone_state" -> "phone")
      // by removing "sensor." prefix and "_phone_state" suffix
      const entityName = phoneStateEntityId.replace("sensor.", "");
      if (entityName.endsWith("_phone_state")) {
        deviceId = entityName.replace("_phone_state", "");
      } else if (entityName === "phone_state") {
        // Handle case where entity is just "phone_state" without prefix
        deviceId = "";
      }
    } else {
      // Fall back to device_id pattern
      phoneStateEntityId = `sensor.${deviceId}_phone_state`;
    }

    const phoneStateEntity = this.hass.states[phoneStateEntityId];

    if (!phoneStateEntity) {
      this._errorMessage = `Entity ${phoneStateEntityId} not found`;
      return;
    }

    if (phoneStateEntity.attributes) {
      const attrs = phoneStateEntity.attributes as any;

      // Update contacts
      if (attrs.quick_dials && Array.isArray(attrs.quick_dials)) {
        this._contactsCache = attrs.quick_dials;
      }

      // Update blocked numbers
      if (attrs.blocked_numbers && Array.isArray(attrs.blocked_numbers)) {
        this._blockedCache = attrs.blocked_numbers;
      }

      // Update priority numbers
      if (attrs.priority_numbers && Array.isArray(attrs.priority_numbers)) {
        this._priorityNumbers = new Set(attrs.priority_numbers);
      }

      // Update default dial code
      if (attrs.dialing_context && attrs.dialing_context.default_code) {
        this._defaultDialCode = attrs.dialing_context.default_code;
      }
    }

    // Update call history from call_history_size sensor
    // Build entity ID based on extracted device prefix
    const callHistoryEntityId = deviceId
      ? `sensor.${deviceId}_call_history_size`
      : `sensor.call_history_size`;

    const callHistoryEntity = this.hass.states[callHistoryEntityId];

    if (callHistoryEntity?.attributes) {
      const historyAttrs = callHistoryEntity.attributes as any;

      if (historyAttrs.entries && Array.isArray(historyAttrs.entries)) {
        this._callHistoryCache = historyAttrs.entries;
      }
    }

    // Update call modal state
    this._updateCallModalState();
  }

  /**
   * Handle state updates from subscriptions
   */
  private _handleStateUpdate(): void {
    // Re-read all cached data from phone state entity
    this._updateCachedData();
    // Update call modal state
    this._updateCallModalState();
    // Trigger re-render
    this.requestUpdate();
  }

  /**
   * Update cached data from phone state sensor attributes
   */
  private _updateCachedData(): void {
    if (!this.hass) return;

    let deviceId = this.config?.device_id || "tsuryphone";
    let phoneStateEntityId: string;

    if (this.config?.entity) {
      phoneStateEntityId = this.config.entity.startsWith("sensor.")
        ? this.config.entity
        : `sensor.${this.config.entity}`;

      const entityName = phoneStateEntityId.replace("sensor.", "");
      if (entityName.endsWith("_phone_state")) {
        deviceId = entityName.replace("_phone_state", "");
      } else if (entityName === "phone_state") {
        deviceId = "";
      }
    } else {
      phoneStateEntityId = `sensor.${deviceId}_phone_state`;
    }

    const phoneStateEntity = this.hass.states[phoneStateEntityId];
    if (!phoneStateEntity?.attributes) return;

    const attrs = phoneStateEntity.attributes as any;

    // Update contacts
    if (attrs.quick_dials && Array.isArray(attrs.quick_dials)) {
      this._contactsCache = attrs.quick_dials;
    }

    // Update blocked numbers
    if (attrs.blocked_numbers && Array.isArray(attrs.blocked_numbers)) {
      this._blockedCache = attrs.blocked_numbers;
    }

    // Update priority numbers
    if (attrs.priority_numbers && Array.isArray(attrs.priority_numbers)) {
      this._priorityNumbers = new Set(attrs.priority_numbers);
    }

    // Update call history
    const callHistoryEntityId = deviceId
      ? `sensor.${deviceId}_call_history_size`
      : `sensor.call_history_size`;
    const callHistoryEntity = this.hass.states[callHistoryEntityId];

    if (callHistoryEntity?.attributes) {
      const historyAttrs = callHistoryEntity.attributes as any;
      if (historyAttrs.entries && Array.isArray(historyAttrs.entries)) {
        this._callHistoryCache = historyAttrs.entries;
      }
    }
  }

  /**
   * Update call modal visibility and data based on phone state
   */
  private _updateCallModalState(): void {
    if (!this.hass) return;

    const deviceId = this.config?.device_id || "";
    const phoneStateEntityId = deviceId
      ? `sensor.${deviceId}_phone_state`
      : `sensor.phone_state`;
    const inCallEntityId = deviceId
      ? `binary_sensor.${deviceId}_in_call`
      : `binary_sensor.in_call`;

    const phoneState = this.hass.states[phoneStateEntityId]?.state;
    const inCall = this.hass.states[inCallEntityId]?.state === "on";

    console.log(
      "[TsuryPhone] _updateCallModalState:",
      "phoneState=", phoneState,
      "inCall=", inCall,
      "_callModalOpen=", this._callModalOpen
    );

    // Determine call modal mode
    if (phoneState === "RINGING_IN") {
      this._callModalMode = "incoming";
      this._callModalOpen = true;
      this._callModalMinimized = false; // Reset on new incoming call

      // Get incoming call info
      const currentCallEntity =
        this.hass.states[
          deviceId ? `sensor.${deviceId}_current_call` : `sensor.current_call`
        ];
      if (currentCallEntity?.attributes) {
        const attrs = currentCallEntity.attributes as any;
        this._currentCallInfo = {
          number: attrs.number || "Unknown",
          name: attrs.name,
          isPriority: attrs.is_priority || false,
          isIncoming: true,
        };
      }
    } else if (phoneState === "DIALING" || phoneState === "RINGING_OUT") {
      // Show modal when dialing out
      console.log("[TsuryPhone] Detected DIALING/RINGING_OUT state, opening call modal");
      this._callModalMode = "active";
      if (!this._callModalMinimized) {
        this._callModalOpen = true;
      }

      // Get dialing call info
      const currentCallEntity =
        this.hass.states[
          deviceId ? `sensor.${deviceId}_current_call` : `sensor.current_call`
        ];
      if (currentCallEntity?.attributes) {
        const attrs = currentCallEntity.attributes as any;
        this._currentCallInfo = {
          number: attrs.number || "Unknown",
          name: attrs.name,
          isPriority: attrs.is_priority || false,
          isIncoming: false,
          duration: 0, // No duration yet while dialing
        };
      }
    } else if (inCall) {
      this._callModalMode = "active";
      // Keep modal open if it was already open, or if not manually minimized
      if (
        !this._callModalOpen &&
        !this._callModalMinimized &&
        phoneState !== "IDLE"
      ) {
        this._callModalOpen = true;
      }

      // Get active call info
      const currentCallEntity =
        this.hass.states[
          deviceId ? `sensor.${deviceId}_current_call` : `sensor.current_call`
        ];
      const durationEntity =
        this.hass.states[
          deviceId ? `sensor.${deviceId}_call_duration` : `sensor.call_duration`
        ];
      const audioOutputEntity =
        this.hass.states[
          deviceId
            ? `sensor.${deviceId}_call_audio_output`
            : `sensor.call_audio_output`
        ];

      if (currentCallEntity?.attributes) {
        const attrs = currentCallEntity.attributes as any;
        this._currentCallInfo = {
          number: attrs.number || "Unknown",
          name: attrs.name,
          isPriority: attrs.is_priority || false,
          isIncoming: attrs.direction === "incoming",
          duration: durationEntity ? parseInt(durationEntity.state) : 0,
          audioOutput: (audioOutputEntity?.state as any) || "earpiece",
        };
      }

      // Check for waiting call
      const waitingCallEntity =
        this.hass.states[
          deviceId
            ? `sensor.${deviceId}_current_waiting_call`
            : `sensor.current_waiting_call`
        ];
      if (
        waitingCallEntity &&
        waitingCallEntity.state !== "None" &&
        waitingCallEntity.state !== "unavailable"
      ) {
        const waitingAttrs = waitingCallEntity.attributes as any;
        this._waitingCallInfo = {
          number: waitingAttrs.number || "Unknown",
          name: waitingAttrs.name,
          isPriority: waitingAttrs.is_priority || false,
        };
      } else {
        this._waitingCallInfo = undefined;
      }

      // Check if call waiting is available
      const callWaitingAvailableEntity =
        this.hass.states[
          deviceId
            ? `binary_sensor.${deviceId}_call_waiting_available`
            : `binary_sensor.call_waiting_available`
        ];
      this._callWaitingAvailable = callWaitingAvailableEntity?.state === "on";
    } else {
      // No call - close modal and clear data
      this._callModalOpen = false;
      this._callModalMinimized = false; // Reset when call ends
      this._showCallToast = false; // Hide toast when call ends
      this._currentCallInfo = undefined;
      this._waitingCallInfo = undefined;
      this._callWaitingAvailable = false;
    }
  }

  /**
   * Refresh data from services
   */
  private async _refreshData(): Promise<void> {
    if (!this.hass) return;

    try {
      // Call service to get latest call history
      const response = (await this.hass.callService(
        "tsuryphone",
        "get_call_history",
        { limit: 1000 },
        true
      )) as any;

      if (response && response.call_history) {
        this._callHistoryCache = response.call_history;
      }
    } catch (err) {
      console.error("TsuryPhone: Failed to refresh call history:", err);
    }
  }

  /**
   * Get entity ID for a device sensor
   */
  private _getDeviceEntityId(suffix: string): string {
    const deviceId = this.config?.device_id || "tsuryphone";
    return `sensor.${deviceId}_${suffix}`;
  }

  /**
   * Handle navigation tab change
   */
  private _handleTabChange(e: CustomEvent<TabChangeEvent>): void {
    this._activeView = e.detail.tab;
  }

  /**
   * Handle contact modal close
   */
  private _handleContactModalClose(): void {
    this._contactModalOpen = false;
    this._showContactModal = false;
    this._contactModalData = undefined;
  }

  /**
   * Handle contact saved
   */
  private _handleContactSaved(e: CustomEvent): void {
    console.log("Contact saved:", e.detail);
    this._handleContactModalClose();
    // Data will update automatically via state subscription
  }

  /**
   * Handle contact deleted
   */
  private _handleContactDeleted(e: CustomEvent): void {
    console.log("Contact deleted:", e.detail);
    this._handleContactModalClose();
    // Data will update automatically via state subscription
  }

  /**
   * Handle contact modal error
   */
  private _handleContactModalError(e: CustomEvent): void {
    console.error("Contact modal error:", e.detail);
    this._errorMessage = e.detail.message;
    // Show error for 3 seconds
    setTimeout(() => {
      this._errorMessage = "";
    }, 3000);
  }

  /**
   * Handle call modal close (minimize to toast)
   */
  private _handleCallModalClose(): void {
    // Don't fully close during active call, just minimize
    if (this._callModalMode === "active" && this._currentCallInfo) {
      this._callModalOpen = false;
      this._callModalMinimized = true; // Track manual minimize
      this._showCallToast = true; // Show persistent toast
    } else {
      this._callModalOpen = false;
      this._callModalMinimized = true;
    }
  }

  /**
   * Handle call answered
   */
  private _handleCallAnswered(e: CustomEvent): void {
    console.log("Call answered");
    // Modal will update to active mode via state subscription
  }

  /**
   * Handle call declined
   */
  private _handleCallDeclined(e: CustomEvent): void {
    console.log("Call declined");
    this._callModalOpen = false;
  }

  /**
   * Handle call ended
   */
  private _handleCallEnded(e: CustomEvent): void {
    console.log("Call ended");
    this._callModalOpen = false;
    this._showCallToast = false;
  }

  /**
   * Handle call modal error
   */
  private _handleCallModalError(e: CustomEvent): void {
    console.error("Call modal error:", e.detail);
    this._errorMessage = e.detail.message;
    // Show error for 3 seconds
    setTimeout(() => {
      this._errorMessage = "";
    }, 3000);
  }

  /**
   * Handle click on call toast to reopen modal
   */
  private _handleCallToastClick(): void {
    this._callModalOpen = true;
    this._showCallToast = false;
    this._callModalMinimized = false;
  }

  /**
   * Handle edit contact (from contact item click)
   */
  private _handleEditContact(e: CustomEvent): void {
    const contact = e.detail.contact as QuickDialEntry;
    this._contactModalMode = "edit";
    this._contactModalData = contact;
    this._contactModalOpen = true;
    this._showContactModal = true;
  }

  /**
   * Handle add contact (from empty state action button)
   */
  private _handleAddContact(): void {
    this._contactModalMode = "add";
    this._contactModalData = undefined;
    this._contactModalOpen = true;
    this._showContactModal = true;
  }

  /**
   * Handle open block modal
   */
  private _handleOpenBlockModal(): void {
    this._showBlockModal = true;
  }

  /**
   * Handle close block modal
   */
  private _handleCloseBlockModal(): void {
    this._showBlockModal = false;
  }

  /**
   * Render the card
   */
  render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html`<div class="tsuryphone-error">Loading...</div>`;
    }

    // Show error overlay if not connected
    if (!this._isConnected || this._errorMessage) {
      return html`
        <ha-card>
          <div class="tsuryphone-container">
            <div class="error-overlay">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <div class="error-title">Connection Error</div>
              <div class="error-message">
                ${this._errorMessage || "Unable to connect to Home Assistant"}
              </div>
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div
          class="tsuryphone-container ${this._isDarkMode
            ? "dark-mode"
            : "light-mode"}"
        >
          ${this._callModalOpen ? this._renderCallModal() : ""}
          ${this._contactModalOpen ? this._renderContactModal() : ""}
          ${this._showBlockModal ? this._renderBlockModal() : ""}
          ${this._showCallToast ? this._renderCallToast() : ""}
          ${this._renderMainViews()}
        </div>
      </ha-card>
    `;
  }

  /**
   * Render main views (home, keypad, contacts, blocked)
   */
  private _renderMainViews(): TemplateResult {
    return html`
      <div class="views-container">
        <div class="view-content">
          ${this._activeView === "home" ? this._renderHomeView() : ""}
          ${this._activeView === "keypad" ? this._renderKeypadView() : ""}
          ${this._activeView === "contacts" ? this._renderContactsView() : ""}
          ${this._activeView === "blocked" ? this._renderBlockedView() : ""}
        </div>

        <tsuryphone-navigation
          .activeTab=${this._activeView}
          .disabled=${this._showCallModal}
          @tab-change=${this._handleTabChange}
        ></tsuryphone-navigation>
      </div>
    `;
  }

  /**
   * Render home view
   */
  private _renderHomeView(): TemplateResult {
    // Convert call history to the format expected by home-view
    const callHistory: CallHistoryEntryType[] = this._callHistoryCache.map(
      (call: any, index: number) => {
        // Map call_type to our CallType enum
        // Backend sends: 'incoming_answered', 'outgoing_answered', 'incoming_missed', 'blocked', etc.
        let callType: CallType;
        
        if (call.call_type === "blocked") {
          callType = "missed";
        } else if (call.call_type.startsWith("incoming_missed") || call.call_type.startsWith("outgoing_missed")) {
          callType = "missed";
        } else if (call.call_type.startsWith("incoming")) {
          callType = "incoming";
        } else if (call.call_type.startsWith("outgoing")) {
          callType = "outgoing";
        } else {
          // Default to missed for unknown types
          callType = "missed";
        }

        const entry = {
          id: call.seq || `${call.received_ts}-${call.number}`,
          contactName: call.name || call.number,
          phoneNumber: call.number,
          timestamp: new Date(call.received_ts * 1000).toISOString(), // Convert Unix timestamp to ISO string
          duration: call.duration_s || 0,
          type: callType,
          isBlocked: call.call_type === "blocked",
        };

        // Log first few calls to debug
        if (index < 3) {
          console.log(`[TsuryPhone] Call ${index}:`, {
            raw_call_type: call.call_type,
            duration_s: call.duration_s,
            mapped_type: entry.type,
            isBlocked: entry.isBlocked,
            name: entry.contactName
          });
        }

        return entry;
      }
    );

    console.log(`[TsuryPhone] Total calls in history: ${callHistory.length}`);

    return html`
      <div class="view home-view fade-in">
        <tsuryphone-home-view
          .callHistory=${callHistory}
          .defaultDialCode=${this._defaultDialCode}
          .loading=${false}
          @dial-contact=${this._handleDialContact}
          @call-details=${this._handleCallDetails}
        ></tsuryphone-home-view>
      </div>
    `;
  }

  /**
   * Handle dial contact event from home view
   */
  private _handleDialContact(e: CustomEvent): void {
    const { contact } = e.detail;
    console.log("Dial contact:", contact);
    // TODO: Open call modal or initiate call in Phase 6
  }

  /**
   * Handle call details event from home view
   */
  private async _handleCallDetails(e: CustomEvent): Promise<void> {
    const { call } = e.detail;
    
    // Initiate a call to the number from call history
    if (call && call.phoneNumber) {
      try {
        await this.hass.callService(
          "tsuryphone",
          "dial",
          {
            number: call.phoneNumber,
          },
          {
            entity_id: this._getPhoneStateEntityId(),
          }
        );
      } catch (error) {
        console.error("Failed to dial number from call history:", error);
      }
    }
  }

  /**
   * Get phone state entity ID
   */
  private _getPhoneStateEntityId(): string {
    const deviceId = this.config?.device_id || "tsuryphone";

    if (this.config?.entity) {
      return this.config.entity.startsWith("sensor.")
        ? this.config.entity
        : `sensor.${this.config.entity}`;
    }

    return `sensor.${deviceId}_phone_state`;
  }

  /**
   * Render keypad view
   */
  private _renderKeypadView(): TemplateResult {
    return html`
      <div class="view keypad-view fade-in">
        <tsuryphone-keypad-view
          .hass=${this.hass}
          .config=${this.config}
        ></tsuryphone-keypad-view>
      </div>
    `;
  }

  /**
   * Render contacts view
   */
  private _renderContactsView(): TemplateResult {
    return html`
      <div
        class="view contacts-view fade-in"
        @edit-contact=${this._handleEditContact}
        @action=${this._handleAddContact}
      >
        <tsuryphone-contacts-view
          .hass=${this.hass}
          .config=${this.config}
        ></tsuryphone-contacts-view>
      </div>
    `;
  }

  /**
   * Render call modal
   */
  private _renderCallModal(): TemplateResult {
    const deviceIdPrefix = this.config?.device_id || "";
    const phoneStateEntityId = deviceIdPrefix
      ? `sensor.${deviceIdPrefix}_phone_state`
      : `sensor.phone_state`;

    return html`
      <tsuryphone-call-modal
        .hass=${this.hass}
        .entityId=${phoneStateEntityId}
        .open=${this._callModalOpen}
        .mode=${this._callModalMode}
        .callInfo=${this._currentCallInfo}
        .waitingCall=${this._waitingCallInfo}
        .callWaitingAvailable=${this._callWaitingAvailable}
        @close=${this._handleCallModalClose}
        @call-answered=${this._handleCallAnswered}
        @call-declined=${this._handleCallDeclined}
        @call-ended=${this._handleCallEnded}
        @error=${this._handleCallModalError}
      ></tsuryphone-call-modal>
    `;
  }

  /**
   * Render call toast (minimized call indicator)
   */
  private _renderCallToast(): TemplateResult {
    if (!this._currentCallInfo) return html``;

    const displayName =
      this._currentCallInfo.name || this._currentCallInfo.number;
    const duration = this._currentCallInfo.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationText = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return html`
      <div class="call-toast" @click=${this._handleCallToastClick}>
        <div class="call-toast-content">
          <ha-icon class="call-toast-icon" icon="mdi:phone"></ha-icon>
          <div class="call-toast-name">${displayName}</div>
          <div class="call-toast-duration">${durationText}</div>
        </div>
        <div class="call-toast-action">Tap to return</div>
      </div>
    `;
  }

  /**
   * Render contact modal
   */
  private _renderContactModal(): TemplateResult {
    return html`
      <tsuryphone-contact-modal
        .hass=${this.hass}
        .open=${this._contactModalOpen}
        .mode=${this._contactModalMode}
        .contact=${this._contactModalData}
        @close=${this._handleContactModalClose}
        @contact-saved=${this._handleContactSaved}
        @contact-deleted=${this._handleContactDeleted}
        @error=${this._handleContactModalError}
      ></tsuryphone-contact-modal>
    `;
  }

  /**
   * Render block number modal
   */
  private _renderBlockModal(): TemplateResult {
    return html`
      <tsuryphone-block-number-modal
        .hass=${this.hass}
        .config=${this.config}
        .open=${this._showBlockModal}
        @close-modal=${this._handleCloseBlockModal}
      ></tsuryphone-block-number-modal>
    `;
  }

  /**
   * Render blocked view (placeholder)
   */
  private _renderBlockedView(): TemplateResult {
    return html`
      <div
        class="view blocked-view fade-in"
        @open-block-modal=${this._handleOpenBlockModal}
      >
        <tsuryphone-blocked-view
          .hass=${this.hass}
          .config=${this.config}
          .blockedNumbers=${this._blockedCache}
        ></tsuryphone-blocked-view>
      </div>
    `;
  }

  /**
   * Styles for the card
   */
  static get styles(): CSSResultGroup {
    return [
      haThemeVariables,
      haButtonStyles,
      haCardStyles,
      commonStyles,
      css`
        :host {
          display: block;
        }

        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .tsuryphone-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 900px;
          background: var(--tsury-card-background-color);
          color: var(--tsury-primary-text-color);
          font-family: var(--tsury-font-family);
          position: relative;
          overflow: hidden;
        }

        .tsuryphone-error {
          padding: var(--tsury-spacing-md);
          text-align: center;
          color: var(--tsury-error-color);
        }

        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--tsury-card-background-color);
          z-index: 100;
          padding: var(--tsury-spacing-xl);
        }

        .error-overlay ha-icon {
          --mdc-icon-size: 64px;
          color: var(--tsury-error-color);
          margin-bottom: var(--tsury-spacing-md);
        }

        .error-title {
          font-size: var(--tsury-font-size-xl);
          font-weight: var(--tsury-font-weight-medium);
          color: var(--tsury-primary-text-color);
          margin-bottom: var(--tsury-spacing-sm);
        }

        .error-message {
          font-size: var(--tsury-font-size-md);
          color: var(--tsury-secondary-text-color);
          text-align: center;
        }

        .views-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        .view-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .view {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          background: var(--tsury-primary-background-color);
        }

        .view-header {
          padding: var(--tsury-spacing-md) var(--tsury-spacing-md)
            var(--tsury-spacing-sm);
          background: var(--tsury-card-background-color);
          border-bottom: 1px solid var(--tsury-divider-color);
        }

        .view-header h2 {
          margin: 0;
          font-size: var(--tsury-font-size-xl);
          font-weight: var(--tsury-font-weight-medium);
          color: var(--tsury-primary-text-color);
        }

        .view-body {
          flex: 1;
          padding: var(--tsury-spacing-md);
        }

        .placeholder-text {
          color: var(--tsury-secondary-text-color);
          text-align: center;
          margin: var(--tsury-spacing-md) 0;
        }

        .view-placeholder,
        .modal-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--tsury-spacing-lg);
          background: var(--tsury-primary-background-color);
          color: var(--tsury-secondary-text-color);
          font-size: var(--tsury-font-size-lg);
        }

        .navigation-placeholder {
          display: flex;
          justify-content: space-around;
          padding: var(--tsury-spacing-md);
          background: var(--tsury-card-background-color);
          border-top: 1px solid var(--tsury-divider-color);
          gap: var(--tsury-spacing-sm);
        }

        .navigation-placeholder button {
          flex: 1;
          padding: var(--tsury-spacing-sm) var(--tsury-spacing-md);
          background: var(--tsury-primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: var(--tsury-border-radius-md);
          cursor: pointer;
          font-size: var(--tsury-font-size-md);
          font-weight: var(--tsury-font-weight-medium);
          transition: all var(--tsury-transition-duration)
            var(--tsury-transition-timing);
        }

        .navigation-placeholder button:hover {
          filter: brightness(1.1);
        }

        .navigation-placeholder button:active {
          filter: brightness(0.9);
        }

        /* Call Toast (minimized call indicator) */
        .call-toast {
          position: absolute;
          top: 8px;
          left: 12px;
          right: 12px;
          z-index: 50;
          background: var(--primary-color);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .call-toast:hover {
          transform: scale(1.02);
        }

        .call-toast:active {
          transform: scale(0.98);
        }

        .call-toast-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .call-toast-icon {
          --mdc-icon-size: 18px;
          color: var(--tsury-primary-text-color);
        }

        .call-toast-name {
          font-weight: 500;
          font-size: 14px;
          line-height: 1;
        }

        .call-toast-duration {
          font-size: 12px;
          opacity: 0.9;
          line-height: 1;
        }

        .call-toast-action {
          font-size: 11px;
          opacity: 0.85;
          line-height: 1;
          white-space: nowrap;
        }

        /* Dark mode adjustments */
        .tsuryphone-container.dark-mode {
          /* Dark mode specific overrides if needed */
        }

        .tsuryphone-container.light-mode {
          /* Light mode specific overrides if needed */
        }
      `,
    ];
  }
}
