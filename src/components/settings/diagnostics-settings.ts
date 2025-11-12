import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-diagnostics-settings")
export class TsuryPhoneDiagnosticsSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _freeMemory = 0;
  @state() private _uptime = 0;
  @state() private _wifiSignal = 0;
  @state() private _loading = false;

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
      padding: 16px 0;
    }

    /* Settings Groups */
    .settings-group {
      margin-bottom: 24px;
    }

    .group-header {
      padding: 8px 20px 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--secondary-text-color);
    }

    /* Action Buttons */
    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin: 0 20px 24px;
    }

    .action-button {
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .action-button:hover:not(:disabled) {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-button ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-color);
    }

    .action-button-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      text-align: center;
    }

    /* Info Cards Grid */
    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin: 0 20px;
    }

    @media (max-width: 600px) {
      .info-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Info Card */
    .info-card {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .info-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-icon ha-icon {
      --mdc-icon-size: 28px;
    }

    /* Icon color variations */
    .info-card[data-type="memory"] .info-icon {
      background: rgba(var(--rgb-info-color, 33, 150, 243), 0.15);
    }

    .info-card[data-type="memory"] .info-icon ha-icon {
      color: var(--info-color);
    }

    .info-card[data-type="uptime"] .info-icon {
      background: rgba(156, 39, 176, 0.15);
    }

    .info-card[data-type="uptime"] .info-icon ha-icon {
      color: #9c27b0;
    }

    .info-card[data-type="wifi"] .info-icon {
      background: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
    }

    .info-card[data-type="wifi"] .info-icon ha-icon {
      color: var(--success-color);
    }

    /* WiFi signal color coding */
    .info-card[data-signal="excellent"] .info-icon {
      background: rgba(var(--rgb-success-color, 76, 175, 80), 0.15);
    }

    .info-card[data-signal="excellent"] .info-icon ha-icon {
      color: var(--success-color);
    }

    .info-card[data-signal="good"] .info-icon {
      background: rgba(255, 193, 7, 0.15);
    }

    .info-card[data-signal="good"] .info-icon ha-icon {
      color: #ffc107;
    }

    .info-card[data-signal="fair"] .info-icon {
      background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);
    }

    .info-card[data-signal="fair"] .info-icon ha-icon {
      color: var(--warning-color);
    }

    .info-card[data-signal="poor"] .info-icon {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.15);
    }

    .info-card[data-signal="poor"] .info-icon ha-icon {
      color: var(--error-color);
    }

    .info-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary-text-color);
      line-height: 1;
      margin: 0;
      text-align: center;
    }

    .info-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-align: center;
      line-height: 1.3;
      margin: 0;
    }

    /* Help Text */
    .help-text {
      margin: 0 20px;
      padding: 12px 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .help-text ha-icon {
      --mdc-icon-size: 20px;
      margin-top: 2px;
      flex-shrink: 0;
      color: var(--primary-color);
    }

    /* Loading State */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.3));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    @media (max-width: 480px) {
      .settings-header {
        padding: 12px 16px;
      }

      .action-buttons,
      .info-cards,
      .help-text {
        margin: 0 16px 24px;
      }

      .action-button {
        padding: 14px;
      }

      .info-card {
        padding: 16px 12px;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadDiagnostics();
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);

    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadDiagnostics();
    }
  }

  private _findEntity(prefix: string, keywords: string[]): string | null {
    if (!this.hass) return null;

    const allEntityIds = Object.keys(this.hass.states);

    const found =
      allEntityIds.find(
        (id) => id.startsWith(prefix) && keywords.some((kw) => id.includes(kw))
      ) || null;

    return found;
  }

  private async _loadDiagnostics(): Promise<void> {
    if (!this.hass || !this.entityId) return;

    try {
      // Find diagnostic sensors
      const freeMemoryEntity = this._findEntity("sensor.", ["free_memory"]);
      const uptimeEntity = this._findEntity("sensor.", ["uptime"]);
      const wifiSignalEntity = this._findEntity("sensor.", ["wifi_signal_strength"]);

      if (freeMemoryEntity) {
        const state = this.hass.states[freeMemoryEntity];
        this._freeMemory = parseFloat(state.state) || 0;
      }

      if (uptimeEntity) {
        const state = this.hass.states[uptimeEntity];
        this._uptime = parseFloat(state.state) || 0;
      }

      if (wifiSignalEntity) {
        const state = this.hass.states[wifiSignalEntity];
        this._wifiSignal = parseFloat(state.state) || 0;
      }
    } catch (error) {
      console.error("Failed to load diagnostics:", error);
    }
  }

  private _handleBack(): void {
    this.dispatchEvent(
      new CustomEvent("navigate-back", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _handleRefreshData(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID is required");
      return;
    }

    this._loading = true;
    try {
      await this.hass.callService("tsuryphone", "refetch_all", {}, {
        entity_id: this.entityId,
      });

      // Reload diagnostics after refresh
      setTimeout(() => {
        this._loadDiagnostics();
      }, 1000);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      alert(`Failed to refresh data: ${error}`);
    } finally {
      this._loading = false;
    }
  }

  private async _handleSnapshot(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID is required");
      return;
    }

    this._loading = true;
    try {
      await this.hass.callService("tsuryphone", "get_tsuryphone_config", {}, {
        entity_id: this.entityId,
      });

      // Show success feedback
      console.log("Configuration snapshot retrieved successfully");
    } catch (error) {
      console.error("Failed to get snapshot:", error);
      alert(`Failed to get snapshot: ${error}`);
    } finally {
      this._loading = false;
    }
  }

  private _formatMemory(bytes: number): string {
    if (bytes === 0) return "0 B";

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    }

    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  private _formatUptime(seconds: number): string {
    if (seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
  }

  private _getWifiSignalQuality(dBm: number): string {
    if (dBm >= -50) return "excellent";
    if (dBm >= -70) return "good";
    if (dBm >= -80) return "fair";
    return "poor";
  }

  private _getWifiSignalLabel(dBm: number): string {
    const quality = this._getWifiSignalQuality(dBm);
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  }

  protected render(): TemplateResult {
    const wifiQuality = this._getWifiSignalQuality(this._wifiSignal);

    return html`
      <div class="settings-header">
        <button
          class="back-button"
          @click=${this._handleBack}
          aria-label="Back"
        >
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h1 class="header-title">Diagnostics</h1>
      </div>

      <div class="settings-content">
        <!-- Help Text -->
        <div class="help-text">
          <ha-icon icon="mdi:information"></ha-icon>
          <div>
            Device health and system information. Use refresh to reload data
            from device storage, or snapshot to capture current state.
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="settings-group">
          <div class="group-header">Actions</div>
          <div class="action-buttons">
            <button
              class="action-button"
              @click=${this._handleRefreshData}
              ?disabled=${this._loading}
              title="Reload configuration and statistics from device storage"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
              <span class="action-button-label">Refresh Data</span>
            </button>

            <button
              class="action-button"
              @click=${this._handleSnapshot}
              ?disabled=${this._loading}
              title="Retrieve current in-memory device state"
            >
              <ha-icon icon="mdi:camera"></ha-icon>
              <span class="action-button-label">Get Snapshot</span>
            </button>
          </div>
        </div>

        <!-- Diagnostic Cards -->
        <div class="settings-group">
          <div class="group-header">Device Information</div>
          <div class="info-cards">
            <!-- Free Memory -->
            <div class="info-card" data-type="memory">
              <div class="info-icon">
                <ha-icon icon="mdi:memory"></ha-icon>
              </div>
              <div class="info-value">${this._formatMemory(this._freeMemory)}</div>
              <div class="info-label">Free Memory</div>
            </div>

            <!-- Uptime -->
            <div class="info-card" data-type="uptime">
              <div class="info-icon">
                <ha-icon icon="mdi:clock-outline"></ha-icon>
              </div>
              <div class="info-value">${this._formatUptime(this._uptime)}</div>
              <div class="info-label">Uptime</div>
            </div>

            <!-- WiFi Signal -->
            <div class="info-card" data-type="wifi" data-signal="${wifiQuality}">
              <div class="info-icon">
                <ha-icon icon="mdi:wifi"></ha-icon>
              </div>
              <div class="info-value">${this._wifiSignal} dBm</div>
              <div class="info-label">
                WiFi Signal<br />(${this._getWifiSignalLabel(this._wifiSignal)})
              </div>
            </div>
          </div>
        </div>
      </div>

      ${this._loading
        ? html`
            <div class="loading-overlay">
              <ha-circular-progress active></ha-circular-progress>
            </div>
          `
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-diagnostics-settings": TsuryPhoneDiagnosticsSettings;
  }
}
