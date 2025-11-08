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
    console.log("[DND] ===== connectedCallback =====");
    console.log("[DND] entityId:", this.entityId);
    console.log("[DND] hass exists:", !!this.hass);
    this._loadCurrentSettings();
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);
    
    const changedKeys = Array.from(changedProps.keys());
    console.log("[DND] willUpdate - changed props:", changedKeys);
    
    if (changedProps.has("hass") && this.hass && this.entityId) {
      console.log("[DND] hass prop changed, reloading settings");
      this._loadCurrentSettings();
    }
  }

  private _getDeviceId(): string | null {
    if (!this.entityId) {
      console.error("[DND] _getDeviceId - entityId is null");
      return null;
    }
    const deviceId = this.entityId.replace("sensor.", "").replace("_phone_state", "");
    console.log(`[DND] _getDeviceId - extracted: "${deviceId}" from "${this.entityId}"`);
    return deviceId;
  }

  private _findEntity(prefix: string, keywords: string[]): string | null {
    if (!this.hass) {
      console.error("[DND] _findEntity - hass is null");
      return null;
    }

    const allEntityIds = Object.keys(this.hass.states);
    console.log(`[DND] _findEntity - searching for prefix="${prefix}", keywords=[${keywords.join(", ")}]`);
    console.log(`[DND] _findEntity - total entities: ${allEntityIds.length}`);
    
    // Debug: show entities matching prefix
    const prefixMatch = allEntityIds.filter(id => id.startsWith(prefix));
    console.log(`[DND] _findEntity - entities with prefix "${prefix}":`, prefixMatch.slice(0, 10));
    
    // Backend entities DON'T have device_id prefix - search by prefix + keywords only
    const found = allEntityIds.find(
      (id) => id.startsWith(prefix) && keywords.some(kw => id.includes(kw))
    ) || null;
    
    if (found) {
      console.log(`[DND] _findEntity - ✓ FOUND: "${found}"`);
    } else {
      console.error(`[DND] _findEntity - ✗ NOT FOUND with prefix="${prefix}", keywords=[${keywords.join(", ")}]`);
    }
    
    return found;
  }

  private async _loadCurrentSettings(): Promise<void> {
    console.log("[DND] ===== _loadCurrentSettings START =====");
    console.log("[DND] hass:", !!this.hass);
    console.log("[DND] entityId:", this.entityId);
    
    if (!this.hass || !this.entityId) {
      console.error("[DND] Cannot load - missing hass or entityId");
      return;
    }

    try {
      // Find DND active binary sensor
      console.log("[DND] --- Searching for DND binary sensor ---");
      const dndSensorId = this._findEntity("binary_sensor.", ["do_not_disturb", "_dnd"]);
      if (dndSensorId) {
        const state = this.hass.states[dndSensorId].state;
        this._dndActive = state === "on";
        console.log(`[DND] Set _dndActive = ${this._dndActive} (from state: "${state}")`);
      } else {
        console.error("[DND] DND binary sensor NOT FOUND!");
      }

      // Find Force DND switch
      console.log("[DND] --- Searching for Force DND switch ---");
      const forceDndId = this._findEntity("switch.", ["force_dnd", "force_do_not_disturb"]);
      if (forceDndId) {
        const state = this.hass.states[forceDndId].state;
        this._dndForce = state === "on";
        console.log(`[DND] Set _dndForce = ${this._dndForce} (from state: "${state}")`);
      } else {
        console.error("[DND] Force DND switch NOT FOUND!");
      }

      // Find DND Schedule Enabled switch
      console.log("[DND] --- Searching for DND Schedule switch ---");
      const scheduleEnabledId = this._findEntity("switch.", ["dnd_schedule_enabled"]);
      if (scheduleEnabledId) {
        const state = this.hass.states[scheduleEnabledId].state;
        this._scheduleEnabled = state === "on";
        console.log(`[DND] Set _scheduleEnabled = ${this._scheduleEnabled} (from state: "${state}")`);
      } else {
        console.error("[DND] DND Schedule switch NOT FOUND!");
      }

      // Load time settings from text entities
      console.log("[DND] --- Searching for time text entities ---");
      const startHourId = this._findEntity("text.", ["dnd_start_hour"]);
      const startMinuteId = this._findEntity("text.", ["dnd_start_minute"]);
      const endHourId = this._findEntity("text.", ["dnd_end_hour"]);
      const endMinuteId = this._findEntity("text.", ["dnd_end_minute"]);

      if (startHourId) {
        const state = this.hass.states[startHourId].state;
        this._startHour = parseInt(state) || 22;
        console.log(`[DND] Set _startHour = ${this._startHour} (from state: "${state}")`);
      } else {
        console.error("[DND] Start hour text entity NOT FOUND!");
      }
      
      if (startMinuteId) {
        const state = this.hass.states[startMinuteId].state;
        this._startMinute = parseInt(state) || 0;
        console.log(`[DND] Set _startMinute = ${this._startMinute} (from state: "${state}")`);
      } else {
        console.error("[DND] Start minute text entity NOT FOUND!");
      }
      
      if (endHourId) {
        const state = this.hass.states[endHourId].state;
        this._endHour = parseInt(state) || 8;
        console.log(`[DND] Set _endHour = ${this._endHour} (from state: "${state}")`);
      } else {
        console.error("[DND] End hour text entity NOT FOUND!");
      }
      
      if (endMinuteId) {
        const state = this.hass.states[endMinuteId].state;
        this._endMinute = parseInt(state) || 0;
        console.log(`[DND] Set _endMinute = ${this._endMinute} (from state: "${state}")`);
      } else {
        console.error("[DND] End minute text entity NOT FOUND!");
      }
      
      console.log("[DND] ===== _loadCurrentSettings FINAL STATE =====");
      console.log(`[DND]   _dndActive: ${this._dndActive}`);
      console.log(`[DND]   _dndForce: ${this._dndForce}`);
      console.log(`[DND]   _scheduleEnabled: ${this._scheduleEnabled}`);
      console.log(`[DND]   Time: ${this._startHour}:${this._startMinute.toString().padStart(2, "0")} - ${this._endHour}:${this._endMinute.toString().padStart(2, "0")}`);
    } catch (error) {
      console.error("[DND] EXCEPTION in _loadCurrentSettings:", error);
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
    console.log(`[DND] ===== _handleDndForceToggle enabled=${enabled} =====`);

    const forceDndId = this._findEntity("switch.", ["force_dnd", "force_do_not_disturb"]);
    if (!forceDndId) {
      console.error("[DND] Force DND toggle ABORTED - entity not found");
      target.checked = !enabled;
      return;
    }

    this._loading = true;
    try {
      console.log(`[DND] Calling switch.${enabled ? "turn_on" : "turn_off"} on "${forceDndId}"`);
      await this.hass.callService("switch", enabled ? "turn_on" : "turn_off", {}, {
        entity_id: forceDndId,
      });

      this._dndForce = enabled;
      console.log(`[DND] ✓ Successfully toggled force DND to ${enabled}`);
    } catch (error) {
      console.error("[DND] ✗ FAILED to toggle force DND:", error);
      target.checked = !enabled;
    } finally {
      this._loading = false;
    }
  }

  private async _handleScheduleToggle(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const enabled = target.checked;
    console.log(`[DND] ===== _handleScheduleToggle enabled=${enabled} =====`);

    const scheduleEnabledId = this._findEntity("switch.", ["dnd_schedule_enabled"]);
    if (!scheduleEnabledId) {
      console.error("[DND] Schedule toggle ABORTED - entity not found");
      target.checked = !enabled;
      return;
    }

    this._loading = true;
    try {
      console.log(`[DND] Calling switch.${enabled ? "turn_on" : "turn_off"} on "${scheduleEnabledId}"`);
      await this.hass.callService("switch", enabled ? "turn_on" : "turn_off", {}, {
        entity_id: scheduleEnabledId,
      });

      this._scheduleEnabled = enabled;
      console.log(`[DND] ✓ Successfully toggled schedule to ${enabled}`);
    } catch (error) {
      console.error("[DND] ✗ FAILED to toggle schedule:", error);
      target.checked = !enabled;
    } finally {
      this._loading = false;
    }
  }

  private async _handleTimeChange(field: "start_hour" | "start_minute" | "end_hour" | "end_minute", value: string): Promise<void> {
    const numValue = parseInt(value) || 0;
    const isHour = field.includes("hour");
    const max = isHour ? 23 : 59;

    console.log(`[DND] ===== _handleTimeChange field=${field}, value="${value}", num=${numValue} =====`);

    if (numValue < 0 || numValue > max) {
      console.error(`[DND] Time change ABORTED - invalid value ${numValue} (max: ${max})`);
      return;
    }

    const textEntityId = this._findEntity("text.", [`dnd_${field}`]);
    if (!textEntityId) {
      console.error(`[DND] Time change ABORTED - text entity for ${field} not found`);
      return;
    }

    this._loading = true;
    try {
      console.log(`[DND] Calling text.set_value on "${textEntityId}" with value="${numValue}"`);
      await this.hass.callService("text", "set_value", {
        value: numValue.toString(),
      }, {
        entity_id: textEntityId,
      });

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
      console.log(`[DND] ✓ Successfully updated ${field} to ${numValue}`);
    } catch (error) {
      console.error(`[DND] ✗ FAILED to update ${field}:`, error);
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
