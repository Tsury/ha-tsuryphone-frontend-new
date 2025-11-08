import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-device-settings")
export class TsuryPhoneDeviceSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _loading = false;
  @state() private _showRebootConfirm = false;
  @state() private _showFactoryResetConfirm = false;
  @state() private _maintenanceActive = false;
  @state() private _deviceIp: string | null = null;
  @state() private _sendModeEnabled = false;

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
      margin-bottom: 32px;
    }

    .group-header {
      padding: 8px 20px 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--secondary-text-color);
    }

    /* Action Button */
    .action-button {
      margin: 0 20px 16px;
      padding: 16px 20px;
      border-radius: 12px;
      border: none;
      background: var(--card-background-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: background 0.2s ease;
      width: calc(100% - 40px);
      text-align: left;
    }

    .action-button:hover {
      background: var(--divider-color);
    }

    .action-button:active {
      background: var(--secondary-background-color);
    }

    .action-button.danger:hover {
      background: rgba(244, 67, 54, 0.1);
    }

    .action-button.danger:active {
      background: rgba(244, 67, 54, 0.15);
    }

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .action-button:not(.danger) .action-icon {
      background: rgba(var(--rgb-primary-color), 0.15);
      color: var(--primary-color);
    }

    .action-button.danger .action-icon {
      background: rgba(244, 67, 54, 0.15);
      color: rgb(244, 67, 54);
    }

    .action-icon ha-icon {
      --mdc-icon-size: 24px;
    }

    .action-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .action-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .action-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .action-button.danger .action-description {
      color: rgb(244, 67, 54);
    }

    /* Status Banner */
    .status-banner {
      margin: 0 20px 16px;
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
      background: linear-gradient(135deg, rgba(158, 158, 158, 0.12) 0%, rgba(158, 158, 158, 0.04) 100%);
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
      background: rgba(158, 158, 158, 0.15);
      color: rgb(117, 117, 117);
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

    /* Maintenance Toggle Item */
    .setting-item {
      margin: 0 20px 16px;
      padding: 16px;
      border-radius: 12px;
      background: var(--card-background-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
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

    /* Confirmation Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal {
      background: var(--card-background-color);
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-title ha-icon {
      --mdc-icon-size: 24px;
    }

    .modal-title.danger {
      color: rgb(244, 67, 54);
    }

    .modal-title.danger ha-icon {
      color: rgb(244, 67, 54);
    }

    .modal-content {
      padding: 24px;
    }

    .modal-text {
      font-size: 14px;
      color: var(--secondary-text-color);
      line-height: 1.6;
      margin: 0 0 16px;
    }

    .modal-warning {
      padding: 12px 16px;
      background: rgba(244, 67, 54, 0.1);
      border-left: 4px solid rgb(244, 67, 54);
      border-radius: 4px;
      margin: 0 0 16px;
    }

    .modal-warning-title {
      font-size: 13px;
      font-weight: 600;
      color: rgb(244, 67, 54);
      margin: 0 0 4px;
    }

    .modal-warning-text {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
      margin: 0;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid var(--divider-color);
    }

    .modal-button {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 80px;
    }

    .modal-button.cancel {
      background: transparent;
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }

    .modal-button.cancel:hover {
      background: var(--divider-color);
    }

    .modal-button.confirm {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .modal-button.confirm:hover {
      opacity: 0.9;
    }

    .modal-button.danger {
      background: rgb(244, 67, 54);
      color: white;
    }

    .modal-button.danger:hover {
      background: rgb(229, 57, 53);
    }

    .modal-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

      .action-button {
        margin: 0 16px 14px;
        padding: 14px 16px;
        width: calc(100% - 32px);
      }

      .help-text {
        margin: 0 16px 14px;
        padding: 10px 14px;
      }

      .modal {
        margin: 0 16px;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadMaintenanceStatus();
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);
    
    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadMaintenanceStatus();
    }
  }

  private _findEntity(prefix: string, keywords: string[]): string | null {
    if (!this.hass) return null;

    const allEntityIds = Object.keys(this.hass.states);
    
    const found = allEntityIds.find(
      (id) => id.startsWith(prefix) && keywords.some(kw => id.includes(kw))
    ) || null;
    
    return found;
  }

  private async _loadMaintenanceStatus(): Promise<void> {
    if (!this.hass || !this.entityId) return;

    try {
      const maintenanceSensorId = this._findEntity("binary_sensor.", ["maintenance_mode", "maintenance"]);
      if (maintenanceSensorId) {
        const state = this.hass.states[maintenanceSensorId].state;
        this._maintenanceActive = state === "on";
      }

      const sendModeSwitchId = this._findEntity("switch.", ["send_mode"]);
      if (sendModeSwitchId) {
        const state = this.hass.states[sendModeSwitchId].state;
        this._sendModeEnabled = state === "on";
      }

      const sensorEntity = this.hass.states[this.entityId];
      if (sensorEntity?.attributes) {
        this._deviceIp = 
          sensorEntity.attributes.ip_address ||
          sensorEntity.attributes.device_ip ||
          sensorEntity.attributes.ip ||
          null;
      }
    } catch (error) {
      console.error("Failed to load maintenance status:", error);
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

  private _showRebootDialog(): void {
    this._showRebootConfirm = true;
  }

  private _showFactoryResetDialog(): void {
    this._showFactoryResetConfirm = true;
  }

  private _closeDialogs(): void {
    this._showRebootConfirm = false;
    this._showFactoryResetConfirm = false;
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

  private async _handleSendModeToggle(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;

    const sendModeSwitchId = this._findEntity("switch.", ["send_mode"]);
    if (!sendModeSwitchId) {
      console.error("Send mode switch entity not found");
      target.checked = !enabled;
      return;
    }

    this._loading = true;
    try {
      await this.hass.callService("switch", enabled ? "turn_on" : "turn_off", {}, {
        entity_id: sendModeSwitchId,
      });

      this._sendModeEnabled = enabled;
    } catch (error) {
      console.error("Failed to toggle send mode:", error);
      target.checked = !enabled;
    } finally {
      this._loading = false;
    }
  }

  private async _handleReboot(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID is required");
      return;
    }

    this._loading = true;
    try {
      await this.hass.callService("tsuryphone", "reset_device", {}, {
        entity_id: this.entityId,
      });

      this._closeDialogs();
      
      // Show success message (optional - could add toast notification)
      console.log("Device reboot initiated");
    } catch (error) {
      console.error("Failed to reboot device:", error);
      // Could show error toast here
    } finally {
      this._loading = false;
    }
  }

  private async _handleFactoryReset(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID is required");
      return;
    }

    this._loading = true;
    try {
      await this.hass.callService("tsuryphone", "factory_reset_device", {}, {
        entity_id: this.entityId,
      });

      this._closeDialogs();
      
      // Show success message
      console.log("Factory reset initiated");
    } catch (error) {
      console.error("Failed to factory reset device:", error);
      // Could show error toast here
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
        <h1 class="header-title">Device Management</h1>
      </div>

      <div class="settings-content">
        <!-- Maintenance Mode Section -->
        <div class="settings-group">
          <div class="group-header">Configuration Portal</div>
          
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

        <!-- Help Text for Maintenance Mode -->
        ${this._maintenanceActive ? html`
          <div class="help-text">
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

        <!-- Send Mode Section -->
        <div class="settings-group">
          <div class="group-header">Integration Behavior</div>
          
          <!-- Send Mode Toggle -->
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Send Mode</div>
              <div class="setting-description">
                Require explicit send action for integration dialing
              </div>
            </div>
            <ha-switch
              .checked=${this._sendModeEnabled}
              @change=${this._handleSendModeToggle}
              .disabled=${this._loading}
            ></ha-switch>
          </div>
        </div>

        <!-- Help Text for Send Mode -->
        <div class="help-text">
          <ha-icon icon="mdi:information"></ha-icon>
          <div>
            When <strong>Send Mode</strong> is enabled, digits entered through the integration (card keypad) 
            are queued and require pressing the send button to dial. 
            This does not affect the physical rotary dial, which always dials immediately. 
            Useful for modern phone behavior when using the card interface.
          </div>
        </div>

        <!-- Device Actions -->
        <div class="settings-group">
          <div class="group-header">Device Actions</div>
          
          <button
            class="action-button"
            @click=${this._showRebootDialog}
            ?disabled=${this._loading}
          >
            <div class="action-icon">
              <ha-icon icon="mdi:restart"></ha-icon>
            </div>
            <div class="action-content">
              <div class="action-title">Reboot Device</div>
              <div class="action-description">
                Restart the device without losing settings
              </div>
            </div>
          </button>

          <button
            class="action-button danger"
            @click=${this._showFactoryResetDialog}
            ?disabled=${this._loading}
          >
            <div class="action-icon">
              <ha-icon icon="mdi:delete-forever"></ha-icon>
            </div>
            <div class="action-content">
              <div class="action-title">Factory Reset</div>
              <div class="action-description">
                Erase all settings, contacts, and statistics
              </div>
            </div>
          </button>
        </div>

        <!-- Help Text -->
        <div class="help-text">
          <ha-icon icon="mdi:information"></ha-icon>
          <div>
            <strong>Reboot</strong> restarts the device while preserving all your settings and data. 
            <strong>Factory Reset</strong> permanently erases everything and returns the device to its original state.
          </div>
        </div>
      </div>

      <!-- Reboot Confirmation Modal -->
      ${this._showRebootConfirm ? html`
        <div class="modal-overlay" @click=${this._closeDialogs}>
          <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
            <div class="modal-header">
              <h2 class="modal-title">
                <ha-icon icon="mdi:restart"></ha-icon>
                Reboot Device
              </h2>
            </div>
            <div class="modal-content">
              <p class="modal-text">
                The device will restart and reconnect automatically. 
                This process takes about 30-60 seconds.
              </p>
              <p class="modal-text">
                All settings, contacts, and call history will be preserved.
              </p>
            </div>
            <div class="modal-actions">
              <button
                class="modal-button cancel"
                @click=${this._closeDialogs}
                ?disabled=${this._loading}
              >
                Cancel
              </button>
              <button
                class="modal-button confirm"
                @click=${this._handleReboot}
                ?disabled=${this._loading}
              >
                ${this._loading ? "Rebooting..." : "Reboot"}
              </button>
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Factory Reset Confirmation Modal -->
      ${this._showFactoryResetConfirm ? html`
        <div class="modal-overlay" @click=${this._closeDialogs}>
          <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
            <div class="modal-header">
              <h2 class="modal-title danger">
                <ha-icon icon="mdi:alert"></ha-icon>
                Factory Reset
              </h2>
            </div>
            <div class="modal-content">
              <div class="modal-warning">
                <div class="modal-warning-title">⚠️ This action cannot be undone</div>
                <div class="modal-warning-text">
                  All data will be permanently deleted
                </div>
              </div>
              <p class="modal-text">
                Factory reset will erase:
              </p>
              <p class="modal-text">
                • All contacts and call history<br>
                • WiFi credentials<br>
                • Do Not Disturb schedules<br>
                • Audio settings<br>
                • All statistics and configurations
              </p>
              <p class="modal-text">
                The device will restart and require complete reconfiguration.
              </p>
            </div>
            <div class="modal-actions">
              <button
                class="modal-button cancel"
                @click=${this._closeDialogs}
                ?disabled=${this._loading}
              >
                Cancel
              </button>
              <button
                class="modal-button danger"
                @click=${this._handleFactoryReset}
                ?disabled=${this._loading}
              >
                ${this._loading ? "Resetting..." : "Factory Reset"}
              </button>
            </div>
          </div>
        </div>
      ` : ""}

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
    "tsuryphone-device-settings": TsuryPhoneDeviceSettings;
  }
}
