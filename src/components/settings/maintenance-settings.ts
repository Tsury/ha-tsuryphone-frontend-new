import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-maintenance-settings")
export class TsuryPhoneMaintenanceSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _maintenanceActive = false;
  @state() private _loading = false;
  @state() private _deviceIp: string | null = null;

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

    /* Status Banner */
    .status-banner {
      margin: 0 20px 24px;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: background 0.3s ease;
    }

    .status-banner.active {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%);
    }

    .status-banner.inactive {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%);
    }

    .status-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .status-banner.active .status-icon {
      background: rgba(255, 152, 0, 0.2);
      color: rgb(255, 152, 0);
    }

    .status-banner.inactive .status-icon {
      background: rgba(76, 175, 80, 0.2);
      color: rgb(76, 175, 80);
    }

    .status-icon ha-icon {
      --mdc-icon-size: 24px;
    }

    .status-content {
      flex: 1;
    }

    .status-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin-bottom: 2px;
    }

    .status-description {
      font-size: 12px;
      color: var(--secondary-text-color);
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

    /* Setting Item */
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--card-background-color);
      gap: 16px;
      min-height: 60px;
    }

    .setting-item + .setting-item {
      border-top: 1px solid var(--divider-color);
    }

    .setting-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .setting-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .setting-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    /* Help Text */
    .help-text {
      margin: 0 20px 16px;
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

    .help-text.warning {
      background: rgba(255, 152, 0, 0.1);
    }

    .help-text.warning ha-icon {
      color: rgb(255, 152, 0);
    }

    /* Web Portal Link */
    .portal-link {
      margin: 0 20px 16px;
      padding: 16px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border-radius: 12px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-weight: 500;
      transition: opacity 0.2s ease;
    }

    .portal-link:hover {
      opacity: 0.9;
    }

    .portal-link:active {
      opacity: 0.8;
    }

    .portal-link-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .portal-link-title {
      font-size: 16px;
      font-weight: 600;
    }

    .portal-link-url {
      font-size: 13px;
      opacity: 0.9;
      font-family: monospace;
    }

    .portal-link ha-icon {
      --mdc-icon-size: 24px;
      flex-shrink: 0;
    }

    /* Loading State */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    @media (max-width: 480px) {
      .settings-header {
        padding: 12px 16px;
      }

      .status-banner {
        margin: 0 16px 20px;
        padding: 14px;
      }

      .setting-item {
        padding: 14px 16px;
      }

      .help-text {
        margin: 0 16px 14px;
        padding: 10px 14px;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadCurrentSettings();
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);
    
    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadCurrentSettings();
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

  private async _loadCurrentSettings(): Promise<void> {
    if (!this.hass || !this.entityId) return;

    try {
      // Find Maintenance Mode binary sensor
      const maintenanceSensorId = this._findEntity("binary_sensor.", ["maintenance_mode", "maintenance"]);
      if (maintenanceSensorId) {
        const state = this.hass.states[maintenanceSensorId].state;
        this._maintenanceActive = state === "on";
      }

      // Try to get device IP from sensor entity (if available)
      const sensorEntity = this.hass.states[this.entityId];
      if (sensorEntity?.attributes) {
        // Look for IP in various possible attribute names
        this._deviceIp = 
          sensorEntity.attributes.ip_address ||
          sensorEntity.attributes.device_ip ||
          sensorEntity.attributes.ip ||
          null;
      }
    } catch (error) {
      console.error("Failed to load maintenance settings:", error);
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

  private async _handleMaintenanceToggle(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;

    const maintenanceSwitchId = this._findEntity("switch.", ["maintenance_mode", "maintenance"]);
    if (!maintenanceSwitchId) {
      console.error("Maintenance mode switch entity not found");
      target.checked = !enabled;
      return;
    }

    this._loading = true;
    try {
      await this.hass.callService("switch", enabled ? "turn_on" : "turn_off", {}, {
        entity_id: maintenanceSwitchId,
      });

      this._maintenanceActive = enabled;
    } catch (error) {
      console.error("Failed to toggle maintenance mode:", error);
      target.checked = !enabled;
    } finally {
      this._loading = false;
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="settings-header">
        <button
          class="back-button"
          @click=${this._handleBack}
          aria-label="Back"
        >
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h1 class="header-title">Maintenance Mode</h1>
      </div>

      <div class="settings-content">
        <!-- Status Banner -->
        <div class="status-banner ${this._maintenanceActive ? "active" : "inactive"}">
          <div class="status-icon">
            <ha-icon icon="${this._maintenanceActive ? "mdi:cog" : "mdi:check-circle"}"></ha-icon>
          </div>
          <div class="status-content">
            <div class="status-title">
              ${this._maintenanceActive ? "Web Portal Active" : "Portal Inactive"}
            </div>
            <div class="status-description">
              ${this._maintenanceActive 
                ? "Configuration portal is accessible" 
                : "Enable to access WiFi and OTA settings"}
            </div>
          </div>
        </div>

        <!-- Web Portal Link (only shown when active) -->
        ${this._maintenanceActive && this._deviceIp ? html`
          <a
            class="portal-link"
            href="http://${this._deviceIp}/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="portal-link-content">
              <div class="portal-link-title">Open Web Portal</div>
              <div class="portal-link-url">http://${this._deviceIp}/</div>
            </div>
            <ha-icon icon="mdi:open-in-new"></ha-icon>
          </a>
        ` : ""}

        <!-- Maintenance Mode Toggle -->
        <div class="settings-group">
          <div class="group-header">Configuration Portal</div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Enable Web Portal</div>
              <div class="setting-description">
                Start configuration portal for WiFi and OTA updates
              </div>
            </div>
            <ha-switch
              .checked=${this._maintenanceActive}
              @change=${this._handleMaintenanceToggle}
              .disabled=${this._loading}
            ></ha-switch>
          </div>
        </div>

        <!-- Help Text -->
        ${this._maintenanceActive ? html`
          <div class="help-text warning">
            <ha-icon icon="mdi:clock-alert"></ha-icon>
            <div>
              <strong>Portal Timeout:</strong> The configuration portal will automatically close after 5 minutes of inactivity. 
              Use the portal to change WiFi credentials or perform OTA firmware updates. 
              Normal phone functionality is disabled while the portal is active.
            </div>
          </div>
        ` : html`
          <div class="help-text">
            <ha-icon icon="mdi:information"></ha-icon>
            <div>
              Enable the web portal to access device configuration at <strong>http://DEVICE_IP/</strong>. 
              You can change WiFi settings and upload firmware updates. 
              The portal automatically times out after 5 minutes for security.
            </div>
          </div>
        `}
      </div>

      ${this._loading ? html`
        <div class="loading-overlay">
          <ha-circular-progress active></ha-circular-progress>
        </div>
      ` : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-maintenance-settings": TsuryPhoneMaintenanceSettings;
  }
}
