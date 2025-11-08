import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-dnd-settings")
export class TsuryPhoneDNDSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _dndActive = false;
  @state() private _dndForce = false;
  @state() private _scheduleEnabled = false;
  @state() private _startHour = 22;
  @state() private _startMinute = 0;
  @state() private _endHour = 8;
  @state() private _endMinute = 0;
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
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%);
    }

    .status-banner.inactive {
      background: linear-gradient(135deg, rgba(158, 158, 158, 0.15) 0%, rgba(158, 158, 158, 0.05) 100%);
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
      background: rgba(76, 175, 80, 0.2);
      color: rgb(76, 175, 80);
    }

    .status-banner.inactive .status-icon {
      background: rgba(158, 158, 158, 0.2);
      color: rgb(158, 158, 158);
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

    /* Time Picker Section */
    .time-picker-section {
      padding: 16px 20px;
      background: var(--card-background-color);
      border-top: 1px solid var(--divider-color);
    }

    .time-picker-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
    }

    .time-picker-row + .time-picker-row {
      border-top: 1px solid var(--divider-color);
    }

    .time-picker-label {
      font-size: 15px;
      color: var(--primary-text-color);
      font-weight: 500;
    }

    .time-picker-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .time-input {
      width: 50px;
      height: 40px;
      padding: 0;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      text-align: center;
      transition: border-color 0.2s ease;
    }

    .time-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .time-separator {
      font-size: 18px;
      font-weight: 600;
      color: var(--secondary-text-color);
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

      .time-picker-section {
        padding: 14px 16px;
      }

      .time-input {
        width: 48px;
        height: 38px;
        font-size: 15px;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadCurrentSettings();
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);
    
    // Reload settings when hass updates (real-time state changes)
    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadCurrentSettings();
    }
  }

  private async _loadCurrentSettings(): Promise<void> {
    if (!this.hass || !this.entityId) return;

    try {
      const phoneStateEntity = this.hass.states[this.entityId];
      
      if (!phoneStateEntity) {
        console.warn(`Phone state entity ${this.entityId} not found`);
        return;
      }

      const attrs = phoneStateEntity.attributes as any;

      // Read DND active status from phone state attributes
      if (typeof attrs.dnd_active === "boolean") {
        this._dndActive = attrs.dnd_active;
      }

      // Read DND config from phone state attributes
      if (attrs.dnd_config) {
        const config = attrs.dnd_config;
        
        if (typeof config.force === "boolean") {
          this._dndForce = config.force;
        }
        
        if (typeof config.scheduled === "boolean") {
          this._scheduleEnabled = config.scheduled;
        }
        
        if (typeof config.start_hour === "number") {
          this._startHour = config.start_hour;
        }
        
        if (typeof config.start_minute === "number") {
          this._startMinute = config.start_minute;
        }
        
        if (typeof config.end_hour === "number") {
          this._endHour = config.end_hour;
        }
        
        if (typeof config.end_minute === "number") {
          this._endMinute = config.end_minute;
        }
      }
    } catch (error) {
      console.error("Failed to load DND settings:", error);
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

  private async _handleDndForceToggle(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;

    this._loading = true;
    try {
      await this.hass.callService("tsuryphone", "set_dnd", {
        force: enabled,
      }, {
        entity_id: this.entityId,
      });

      this._dndForce = enabled;
      await this._loadCurrentSettings();
    } catch (error) {
      console.error("Failed to toggle DND force:", error);
      target.checked = !enabled; // Revert on error
    } finally {
      this._loading = false;
    }
  }

  private async _handleScheduleToggle(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;

    this._loading = true;
    try {
      await this.hass.callService("tsuryphone", "set_dnd", {
        scheduled: enabled,
      }, {
        entity_id: this.entityId,
      });

      this._scheduleEnabled = enabled;
      await this._loadCurrentSettings();
    } catch (error) {
      console.error("Failed to toggle DND schedule:", error);
      target.checked = !enabled; // Revert on error
    } finally {
      this._loading = false;
    }
  }

  private async _handleTimeChange(field: "start_hour" | "start_minute" | "end_hour" | "end_minute", value: string): Promise<void> {
    const numValue = parseInt(value) || 0;
    const isHour = field.includes("hour");
    const max = isHour ? 23 : 59;

    if (numValue < 0 || numValue > max) return;

    this._loading = true;
    try {
      const updateData: any = {};
      updateData[field] = numValue;

      await this.hass.callService("tsuryphone", "set_dnd", updateData, {
        entity_id: this.entityId,
      });

      // Update local state
      switch (field) {
        case "start_hour":
          this._startHour = numValue;
          break;
        case "start_minute":
          this._startMinute = numValue;
          break;
        case "end_hour":
          this._endHour = numValue;
          break;
        case "end_minute":
          this._endMinute = numValue;
          break;
      }

      await this._loadCurrentSettings();
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      this._loading = false;
    }
  }

  private _formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
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
        <h1 class="header-title">Do Not Disturb</h1>
      </div>

      <div class="settings-content">
        <!-- Status Banner -->
        <div class="status-banner ${this._dndActive ? "active" : "inactive"}">
          <div class="status-icon">
            <ha-icon
              icon="${this._dndActive
                ? "mdi:moon-waning-crescent"
                : "mdi:bell-ring"}"
            ></ha-icon>
          </div>
          <div class="status-content">
            <div class="status-title">
              ${this._dndActive ? "DND Active" : "DND Inactive"}
            </div>
            <div class="status-description">
              ${this._dndActive
                ? "Incoming calls are being silenced"
                : "Phone will ring normally for all calls"}
            </div>
          </div>
        </div>

        <!-- Force DND -->
        <div class="settings-group">
          <div class="group-header">Quick Actions</div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Force DND</div>
              <div class="setting-description">
                Override schedule and silence all calls immediately
              </div>
            </div>
            <ha-switch
              .checked=${this._dndForce}
              @change=${this._handleDndForceToggle}
              .disabled=${this._loading}
            ></ha-switch>
          </div>
        </div>

        <!-- Schedule Settings -->
        <div class="settings-group">
          <div class="group-header">Schedule</div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">Scheduled DND</div>
              <div class="setting-description">
                Automatically enable DND during specific hours
              </div>
            </div>
            <ha-switch
              .checked=${this._scheduleEnabled}
              @change=${this._handleScheduleToggle}
              .disabled=${this._loading}
            ></ha-switch>
          </div>

          ${this._scheduleEnabled
            ? html`
                <div class="time-picker-section">
                  <div class="time-picker-row">
                    <div class="time-picker-label">Start Time</div>
                    <div class="time-picker-inputs">
                      <input
                        type="number"
                        class="time-input"
                        min="0"
                        max="23"
                        .value=${this._startHour.toString()}
                        @change=${(e: Event) =>
                          this._handleTimeChange(
                            "start_hour",
                            (e.target as HTMLInputElement).value
                          )}
                        ?disabled=${this._loading}
                        aria-label="Start hour"
                      />
                      <span class="time-separator">:</span>
                      <input
                        type="number"
                        class="time-input"
                        min="0"
                        max="59"
                        .value=${this._startMinute.toString().padStart(2, "0")}
                        @change=${(e: Event) =>
                          this._handleTimeChange(
                            "start_minute",
                            (e.target as HTMLInputElement).value
                          )}
                        ?disabled=${this._loading}
                        aria-label="Start minute"
                      />
                    </div>
                  </div>

                  <div class="time-picker-row">
                    <div class="time-picker-label">End Time</div>
                    <div class="time-picker-inputs">
                      <input
                        type="number"
                        class="time-input"
                        min="0"
                        max="23"
                        .value=${this._endHour.toString()}
                        @change=${(e: Event) =>
                          this._handleTimeChange(
                            "end_hour",
                            (e.target as HTMLInputElement).value
                          )}
                        ?disabled=${this._loading}
                        aria-label="End hour"
                      />
                      <span class="time-separator">:</span>
                      <input
                        type="number"
                        class="time-input"
                        min="0"
                        max="59"
                        .value=${this._endMinute.toString().padStart(2, "0")}
                        @change=${(e: Event) =>
                          this._handleTimeChange(
                            "end_minute",
                            (e.target as HTMLInputElement).value
                          )}
                        ?disabled=${this._loading}
                        aria-label="End minute"
                      />
                    </div>
                  </div>
                </div>

                <div class="help-text">
                  <ha-icon icon="mdi:information-outline"></ha-icon>
                  <div>
                    DND will automatically activate at
                    ${this._formatTime(this._startHour, this._startMinute)} and
                    deactivate at
                    ${this._formatTime(this._endHour, this._endMinute)} every
                    day.
                  </div>
                </div>
              `
            : ""}
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
    "tsuryphone-dnd-settings": TsuryPhoneDNDSettings;
  }
}
