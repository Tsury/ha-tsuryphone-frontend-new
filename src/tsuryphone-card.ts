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
  CallHistoryEntry 
} from "./types/tsuryphone";
import { haThemeVariables, haButtonStyles, haCardStyles, isDarkMode } from "./styles/theme";
import { commonStyles } from "./styles/common";
import './components/navigation/tsuryphone-navigation';
import './components/home/home-view';
import './components/keypad/keypad-view';
import './components/contacts/contacts-view';
import './components/modals/contact-modal';
import type { NavigationTab, TabChangeEvent } from './components/navigation/tsuryphone-navigation';
import type { CallHistoryEntry as CallHistoryEntryType } from './utils/call-history-grouping';

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
  @state() private _showBlockedView = false;
  @state() private _isDarkMode = false;
  
  // Cached data from coordinator
  @state() private _contactsCache: QuickDialEntry[] = [];
  @state() private _blockedCache: BlockedNumberEntry[] = [];
  @state() private _callHistoryCache: CallHistoryEntry[] = [];
  @state() private _priorityNumbers: Set<string> = new Set();
  
  // Connection state
  @state() private _isConnected = true;
  @state() private _errorMessage = "";

  // Modal state
  @state() private _contactModalOpen = false;
  @state() private _contactModalMode: "add" | "edit" = "add";
  @state() private _contactModalData?: QuickDialEntry;

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
    
    if (changedProps.has('hass')) {
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
      const deviceId = this.config?.device_id || 'tsuryphone';
      
      const unsubPromise = this.hass.connection.subscribeEvents(
        (event: any) => {
          // Check if the event is for one of our entities
          const entityId = event.data?.entity_id;
          if (entityId && entityId.startsWith(`sensor.${deviceId}_`) || 
              entityId?.startsWith(`binary_sensor.${deviceId}_`)) {
            this._handleStateUpdate();
          }
        },
        'state_changed'
      );
      
      if (unsubPromise && typeof unsubPromise.then === 'function') {
        unsubPromise.then((unsub: () => void) => {
          this._unsubscribers.push(unsub);
        }).catch((err: any) => {
          console.error('TsuryPhone: Failed to subscribe to state changes:', err);
        });
      }
    } catch (err) {
      console.error('TsuryPhone: Error in subscribe:', err);
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
        console.error('TsuryPhone: Error unsubscribing:', err);
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
    const deviceId = this.config?.device_id || 'tsuryphone';
    let phoneStateEntityId: string;
    
    if (this.config?.entity) {
      // Use entity directly if provided
      phoneStateEntityId = this.config.entity.startsWith('sensor.') 
        ? this.config.entity 
        : `sensor.${this.config.entity}`;
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
    }

    // Update call history from call_history_size sensor
    const callHistoryEntityId = `sensor.${deviceId}_call_history_size`;
    const callHistoryEntity = this.hass.states[callHistoryEntityId];
    
    if (callHistoryEntity?.attributes) {
      const historyAttrs = callHistoryEntity.attributes as any;
      console.log('[TsuryPhone] Call history sensor attributes:', historyAttrs);
      
      if (historyAttrs.entries && Array.isArray(historyAttrs.entries)) {
        console.log('[TsuryPhone] Found call history entries:', historyAttrs.entries.length);
        this._callHistoryCache = historyAttrs.entries;
      } else {
        console.log('[TsuryPhone] No entries found in call history sensor');
      }
    } else {
      console.log('[TsuryPhone] Call history sensor not found or has no attributes');
    }
    
    // Update call modal state
    this._updateCallModalState();
  }

  /**
   * Handle state updates from subscriptions
   */
  private _handleStateUpdate(): void {
    // Trigger re-render by updating hass-dependent state
    this._updateCallModalState();
    this.requestUpdate();
  }

  /**
   * Update call modal visibility based on phone state
   */
  private _updateCallModalState(): void {
    if (!this.hass) return;
    
    const deviceId = this.config?.device_id || 'tsuryphone';
    const phoneState = this.hass.states[`sensor.${deviceId}_phone_state`]?.state;
    const inCall = this.hass.states[`binary_sensor.${deviceId}_in_call`]?.state === 'on';
    
    // Show call modal if ringing or in call
    this._showCallModal = phoneState === 'RINGING_IN' || inCall;
  }

  /**
   * Refresh data from services
   */
  private async _refreshData(): Promise<void> {
    if (!this.hass) return;

    try {
      // Call service to get latest call history
      const response = await this.hass.callService(
        'tsuryphone',
        'get_call_history',
        { limit: 1000 },
        true
      ) as any;

      if (response && response.call_history) {
        this._callHistoryCache = response.call_history;
      }
    } catch (err) {
      console.error('TsuryPhone: Failed to refresh call history:', err);
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
        <div class="tsuryphone-container ${this._isDarkMode ? 'dark-mode' : 'light-mode'}">
          ${this._showCallModal ? this._renderCallModal() : ""}
          ${this._showContactModal ? this._renderContactModal() : ""}
          ${this._showBlockedView
            ? this._renderBlockedView()
            : this._renderMainViews()}
        </div>
      </ha-card>
    `;
  }

  /**
   * Render main views (home, keypad, contacts)
   */
  private _renderMainViews(): TemplateResult {
    return html`
      <div class="views-container">
        <div class="view-content">
          ${this._activeView === "home" ? this._renderHomeView() : ""}
          ${this._activeView === "keypad" ? this._renderKeypadView() : ""}
          ${this._activeView === "contacts" ? this._renderContactsView() : ""}
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
    const callHistory: CallHistoryEntryType[] = this._callHistoryCache.map((call: any) => ({
      id: call.id || `${call.timestamp}-${call.phone_number}`,
      contactName: call.contact_name || call.phone_number,
      phoneNumber: call.phone_number,
      timestamp: call.timestamp,
      duration: call.duration || 0,
      type: call.type || 'incoming',
      isBlocked: call.is_blocked || false,
    }));

    return html`
      <div class="view home-view fade-in">
        <tsuryphone-home-view
          .callHistory=${callHistory}
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
    console.log('Dial contact:', contact);
    // TODO: Open call modal or initiate call in Phase 6
  }

  /**
   * Handle call details event from home view
   */
  private _handleCallDetails(e: CustomEvent): void {
    const { call } = e.detail;
    console.log('Show call details:', call);
    // TODO: Open call details modal in Phase 8
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
   * Render call modal (placeholder)
   */
  private _renderCallModal(): TemplateResult {
    return html`<div class="modal-placeholder">Call Modal</div>`;
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
   * Render blocked view (placeholder)
   */
  private _renderBlockedView(): TemplateResult {
    return html`<div class="modal-placeholder">Blocked Numbers View</div>`;
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
          height: 761px;
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
          padding: var(--tsury-spacing-md) var(--tsury-spacing-md) var(--tsury-spacing-sm);
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
          transition: all var(--tsury-transition-duration) var(--tsury-transition-timing);
        }

        .navigation-placeholder button:hover {
          filter: brightness(1.1);
        }

        .navigation-placeholder button:active {
          filter: brightness(0.9);
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
