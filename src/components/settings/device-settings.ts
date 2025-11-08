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
