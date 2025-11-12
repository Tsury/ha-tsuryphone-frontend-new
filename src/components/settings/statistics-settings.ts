import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-statistics-settings")
export class TsuryPhoneStatisticsSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _blockedCalls = 0;
  @state() private _callHistorySize = 0;
  @state() private _incomingCalls = 0;
  @state() private _outgoingCalls = 0;
  @state() private _totalCalls = 0;
  @state() private _totalTalkTime = 0;
  @state() private _loading = true;

  static styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--card-background-color);
    }

    .settings-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: var(--card-background-color);
      border-bottom: 1px solid var(--divider-color);
      position: sticky;
      top: 0;
      z-index: 10;
      gap: 12px;
    }

    .back-button {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }

    .back-button:hover {
      background: var(--divider-color);
    }

    .back-button:active {
      background: var(--secondary-background-color);
    }

    .back-button ha-icon {
      --mdc-icon-size: 24px;
    }

    .header-title {
      flex: 1;
      font-size: 20px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
    }

    .settings-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    /* Statistics Grid */
    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    @media (max-width: 600px) {
      .statistics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Stat Card */
    .stat-card {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--rgb-primary-color), 0.15);
    }

    .stat-icon ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-color);
    }

    /* Icon color variations */
    .stat-card[data-type="blocked"] .stat-icon {
      background: rgba(255, 82, 82, 0.15);
    }

    .stat-card[data-type="blocked"] .stat-icon ha-icon {
      color: #ff5252;
    }

    .stat-card[data-type="history"] .stat-icon {
      background: rgba(156, 39, 176, 0.15);
    }

    .stat-card[data-type="history"] .stat-icon ha-icon {
      color: #9c27b0;
    }

    .stat-card[data-type="incoming"] .stat-icon {
      background: rgba(33, 150, 243, 0.15);
    }

    .stat-card[data-type="incoming"] .stat-icon ha-icon {
      color: #2196f3;
    }

    .stat-card[data-type="outgoing"] .stat-icon {
      background: rgba(76, 175, 80, 0.15);
    }

    .stat-card[data-type="outgoing"] .stat-icon ha-icon {
      color: #4caf50;
    }

    .stat-card[data-type="total"] .stat-icon {
      background: rgba(255, 152, 0, 0.15);
    }

    .stat-card[data-type="total"] .stat-icon ha-icon {
      color: #ff9800;
    }

    .stat-card[data-type="time"] .stat-icon {
      background: rgba(0, 188, 212, 0.15);
    }

    .stat-card[data-type="time"] .stat-icon ha-icon {
      color: #00bcd4;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--primary-text-color);
      line-height: 1;
      margin: 0;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-align: center;
      line-height: 1.3;
      margin: 0;
    }

    /* Loading State */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--divider-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Info Section */
    .info-section {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 20px;
    }

    .info-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-title ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
    }

    .info-text {
      font-size: 14px;
      color: var(--secondary-text-color);
      line-height: 1.5;
      margin: 0;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadStatistics();
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);
    
    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadStatistics();
    }
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadStatistics();
    }
  }

  private _findEntity(prefix: string, keywords: string[]): string | null {
    if (!this.hass) return null;

    const allEntityIds = Object.keys(this.hass.states);
    
    // Backend entities DON'T have device_id prefix - search by prefix + keywords only
    const found = allEntityIds.find(
      (id) => id.startsWith(prefix) && keywords.some(kw => id.includes(kw))
    ) || null;
    
    return found;
  }

  private _loadStatistics(): void {
    if (!this.hass || !this.entityId) return;

    try {
      // Find diagnostic sensor entities using keyword search
      // Based on backend screenshot: Blocked Calls, Call History Size, Incoming Calls, etc.
      
      // Blocked Calls
      const blockedCallsSensor = this._findEntity("sensor.", ["blocked_calls"]);
      if (blockedCallsSensor) {
        this._blockedCalls = parseInt(this.hass.states[blockedCallsSensor].state) || 0;
      }

      // Call History Size
      const callHistorySensor = this._findEntity("sensor.", ["call_history_size"]);
      if (callHistorySensor) {
        this._callHistorySize = parseInt(this.hass.states[callHistorySensor].state) || 0;
      }

      // Incoming Calls
      const incomingCallsSensor = this._findEntity("sensor.", ["incoming_calls"]);
      if (incomingCallsSensor) {
        this._incomingCalls = parseInt(this.hass.states[incomingCallsSensor].state) || 0;
      }

      // Outgoing Calls
      const outgoingCallsSensor = this._findEntity("sensor.", ["outgoing_calls"]);
      if (outgoingCallsSensor) {
        this._outgoingCalls = parseInt(this.hass.states[outgoingCallsSensor].state) || 0;
      }

      // Total Calls
      const totalCallsSensor = this._findEntity("sensor.", ["total_calls"]);
      if (totalCallsSensor) {
        this._totalCalls = parseInt(this.hass.states[totalCallsSensor].state) || 0;
      }

      // Total Talk Time (in seconds)
      const totalTalkTimeSensor = this._findEntity("sensor.", ["total_talk_time"]);
      if (totalTalkTimeSensor) {
        this._totalTalkTime = parseFloat(this.hass.states[totalTalkTimeSensor].state) || 0;
      }

      this._loading = false;
    } catch (err) {
      console.error("Error loading statistics:", err);
      this._loading = false;
    }
  }

  private _formatTalkTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.floor(seconds)}s`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }

    return `${minutes}m ${secs}s`;
  }

  private _handleBack(): void {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { view: "settings" },
        bubbles: true,
        composed: true,
      })
    );
  }

  render(): TemplateResult {
    return html`
      <div class="settings-header">
        <button class="back-button" @click=${this._handleBack}>
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h2 class="header-title">Statistics</h2>
      </div>

      <div class="settings-content">
        ${this._loading
          ? html`
              <div class="loading-overlay">
                <div class="loading-spinner"></div>
              </div>
            `
          : ""}

        <div class="statistics-grid">
          <!-- Blocked Calls -->
          <div class="stat-card" data-type="blocked">
            <div class="stat-icon">
              <ha-icon icon="mdi:phone-cancel"></ha-icon>
            </div>
            <div class="stat-value">${this._blockedCalls}</div>
            <div class="stat-label">Blocked Calls</div>
          </div>

          <!-- Call History Size -->
          <div class="stat-card" data-type="history">
            <div class="stat-icon">
              <ha-icon icon="mdi:history"></ha-icon>
            </div>
            <div class="stat-value">${this._callHistorySize}</div>
            <div class="stat-label">Call History</div>
          </div>

          <!-- Incoming Calls -->
          <div class="stat-card" data-type="incoming">
            <div class="stat-icon">
              <ha-icon icon="mdi:phone-incoming"></ha-icon>
            </div>
            <div class="stat-value">${this._incomingCalls}</div>
            <div class="stat-label">Incoming</div>
          </div>

          <!-- Outgoing Calls -->
          <div class="stat-card" data-type="outgoing">
            <div class="stat-icon">
              <ha-icon icon="mdi:phone-outgoing"></ha-icon>
            </div>
            <div class="stat-value">${this._outgoingCalls}</div>
            <div class="stat-label">Outgoing</div>
          </div>

          <!-- Total Calls -->
          <div class="stat-card" data-type="total">
            <div class="stat-icon">
              <ha-icon icon="mdi:phone"></ha-icon>
            </div>
            <div class="stat-value">${this._totalCalls}</div>
            <div class="stat-label">Total Calls</div>
          </div>

          <!-- Total Talk Time -->
          <div class="stat-card" data-type="time">
            <div class="stat-icon">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
            </div>
            <div class="stat-value">${this._formatTalkTime(this._totalTalkTime)}</div>
            <div class="stat-label">Talk Time</div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-title">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            About Statistics
          </div>
          <p class="info-text">
            Statistics are collected from your device and show cumulative data
            since the last factory reset. Call history is limited to the most
            recent ${this._callHistorySize} calls.
          </p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-statistics-settings": TsuryPhoneStatisticsSettings;
  }
}
