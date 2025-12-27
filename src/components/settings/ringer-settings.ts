import { LitElement, html, css, CSSResultGroup, TemplateResult, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-ringer-settings")
export class TsuryPhoneRingerSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _ringerCycleDuration = 30;
  @state() private _ringPattern = "";
  @state() private _customPattern = "";
  @state() private _patternError = "";
  @state() private _loading = false;
  @state() private _isRinging = false;

  // Ring pattern presets from backend
  private readonly _ringPatternPresets = {
    Default: "",
    "Pulse Short": "300,300x2",
    Classic: "500,500,500",
    "Long Gap": "800,400,800",
    Triple: "300,300,300",
    Stagger: "500,250,500",
    Alarm: "200,200x5",
    Slow: "1000",
    Burst: "150,150x3",
  };

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
      padding: 0;
    }

    /* Setting Groups */
    .settings-group {
      background: var(--card-background-color);
      margin-bottom: 12px;
    }

    .group-header {
      padding: 20px 20px 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    /* Slider Items */
    .slider-item {
      display: flex;
      flex-direction: column;
      padding: 16px 20px;
      border-bottom: 1px solid var(--divider-color);
      gap: 12px;
    }

    .slider-item:last-child {
      border-bottom: none;
    }

    .slider-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .slider-label-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .slider-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .slider-icon ha-icon {
      --mdc-icon-size: 22px;
    }

    .slider-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .slider-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .slider-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .slider-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--primary-color);
      min-width: 32px;
      text-align: right;
    }

    /* Calibration Control */
    .calibration-control {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .calibration-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .calibration-button {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .calibration-button:hover:not(:disabled) {
      background: var(--secondary-background-color);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .calibration-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .calibration-input {
      width: 60px;
      height: 40px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      outline: none;
    }

    .calibration-input:focus {
      border-color: var(--primary-color);
    }

    .ring-actions {
      display: flex;
      gap: 8px;
    }

    .action-button {
      padding: 0 16px;
      height: 40px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-ring {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .btn-stop {
      background: var(--error-color);
      color: white;
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--disabled-text-color);
    }

    /* Help Text */
    .help-text {
      display: flex;
      gap: 12px;
      padding: 16px 20px;
      background: var(--secondary-background-color);
      border-left: 3px solid var(--primary-color);
      margin: 16px 20px;
      border-radius: 4px;
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }

    .help-text ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .help-text strong {
      color: var(--primary-text-color);
    }

    /* Ring Pattern Controls */
    .pattern-select {
      width: 100%;
      padding: 12px 16px;
      font-size: 15px;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    .pattern-select:focus {
      border-color: var(--primary-color);
    }

    .pattern-select option {
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .pattern-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }

    .pattern-input-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pattern-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .save-button {
      padding: 12px 16px;
      border-radius: 8px;
      border: none;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;
      height: 44px; /* Match input height approx */
    }

    .save-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pattern-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 15px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      outline: none;
      box-sizing: border-box;
    }

    .pattern-input:focus {
      border-color: var(--primary-color);
    }

    .pattern-input.error {
      border-color: var(--error-color);
    }

    .pattern-error {
      font-size: 12px;
      color: var(--error-color);
      margin-top: 4px;
    }

    .pattern-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .test-button {
      width: 100%;
      padding: 12px 24px;
      margin-top: 12px;
      border-radius: 8px;
      border: none;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .test-button:hover {
      opacity: 0.9;
    }

    .test-button:active {
      opacity: 0.8;
    }

    .test-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .test-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* Loading State */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.3));
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
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadRingerSettings();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has("hass")) {
      this._loadRingerSettings();
    }
  }

  private _loadRingerSettings(): void {
    if (!this.hass) return;

    const ringerCycleDurationEntity = this._findEntity("number.ringer_cycle_duration");
    const ringPatternCustomEntity = this._findEntity("text.ring_pattern_custom");

    if (ringerCycleDurationEntity) {
      const value = parseFloat(this.hass.states[ringerCycleDurationEntity].state);
      if (!isNaN(value)) {
        this._ringerCycleDuration = Math.round(value);
      }
    }

    if (ringPatternCustomEntity) {
      const pattern = this.hass.states[ringPatternCustomEntity].state || "";
      
      // Only update if server state changed
      if (pattern !== this._ringPattern) {
        this._ringPattern = pattern;
        this._customPattern = pattern;
      }
    }
  }

  private _findEntity(entitySuffix: string): string | null {
    // Try to find entity with or without device_id prefix
    const allEntities = Object.keys(this.hass.states);

    // Try exact match first
    if (allEntities.includes(entitySuffix)) {
      return entitySuffix;
    }

    // Try with device_id prefix
    const withPrefix = allEntities.find((entity) =>
      entity.endsWith(entitySuffix.replace("number.", "_"))
    );

    if (withPrefix) {
      return withPrefix;
    }

    // Try partial match
    const partialMatch = allEntities.find((entity) =>
      entity.includes(entitySuffix.replace("number.", ""))
    );

    return partialMatch || null;
  }

  private async _updateCycleDuration(value: number): Promise<void> {
    const entityId = this._findEntity("number.ringer_cycle_duration");

    if (!entityId) {
      console.error("Ringer cycle duration entity not found");
      return;
    }

    // Clamp value
    const clampedValue = Math.max(1, Math.min(100, value));
    
    // Optimistic update
    this._ringerCycleDuration = clampedValue;
    this._loading = true;

    try {
      await this.hass.callService("number", "set_value", {
        entity_id: entityId,
        value: clampedValue,
      });
    } catch (error) {
      console.error("Failed to set ringer cycle duration:", error);
      // Revert on failure (reload from state)
      this._loadRingerSettings();
    } finally {
      this._loading = false;
    }
  }

  private _handleCycleDurationInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      this._updateCycleDuration(value);
    }
  }

  private _incrementDuration(): void {
    this._updateCycleDuration(this._ringerCycleDuration + 1);
  }

  private _decrementDuration(): void {
    this._updateCycleDuration(this._ringerCycleDuration - 1);
  }

  private async _handleCalibrationRing(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID required for calibration ring");
      return;
    }

    this._loading = true;
    this._isRinging = true;

    try {
      await this.hass.callService(
        "tsuryphone",
        "ring_device",
        {
          pattern: "120000", // 2 minutes continuous ring
          force: false,
        },
        {
          entity_id: this.entityId,
        }
      );
    } catch (error) {
      console.error("Failed to start calibration ring:", error);
      this._isRinging = false;
    } finally {
      this._loading = false;
    }
  }

  private async _handleStopRinging(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID required to stop ringing");
      return;
    }

    this._loading = true;

    try {
      await this.hass.callService(
        "tsuryphone",
        "stop_ringing",
        {},
        {
          entity_id: this.entityId,
        }
      );
      this._isRinging = false;
    } catch (error) {
      console.error("Failed to stop ringing:", error);
    } finally {
      this._loading = false;
    }
  }

  private _validateRingPattern(pattern: string): string | null {
    const normalized = pattern.trim();

    // Empty pattern is valid (device default)
    if (!normalized) {
      return null;
    }

    // Max length check
    if (normalized.length > 32) {
      return "Pattern too long (max 32 characters)";
    }

    // Valid characters check
    const validChars = /^[0-9,x]+$/;
    if (!validChars.test(normalized)) {
      return "Pattern can only contain digits, commas, and 'x'";
    }

    // Parse pattern and repeat
    let base = normalized;
    let repeatCount = 1;

    if (normalized.includes("x")) {
      const parts = normalized.split("x");
      if (parts.length !== 2) {
        return "Only one 'x' allowed for repeat count";
      }
      base = parts[0];
      const repeatStr = parts[1];
      if (!repeatStr || !/^\d+$/.test(repeatStr)) {
        return "Repeat count must be a positive number";
      }
      repeatCount = parseInt(repeatStr);
      if (repeatCount <= 0) {
        return "Repeat count must be greater than 0";
      }
    }

    // Validate segments
    const segments = base.split(",");
    if (segments.length === 0 || segments.some((s) => s === "")) {
      return "Empty segments not allowed";
    }

    for (const segment of segments) {
      if (!/^\d+$/.test(segment)) {
        return "Each segment must be a positive number";
      }
      if (parseInt(segment) <= 0) {
        return "Segment durations must be greater than 0";
      }
    }

    // Segment count validation based on repeat
    if (repeatCount > 1) {
      if (segments.length % 2 !== 0) {
        return "Repeated patterns must have even number of segments";
      }
    } else {
      if (segments.length % 2 !== 1) {
        return "Single patterns must have odd number of segments";
      }
    }

    return null;
  }

  private _handlePatternPresetChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const presetName = select.value as keyof typeof this._ringPatternPresets;
    const pattern = this._ringPatternPresets[presetName];

    this._ringPattern = pattern;
    this._customPattern = pattern;
    this._patternError = "";

    // Save pattern
    this._saveRingPattern(pattern);
  }

  private _handleCustomPatternChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const pattern = input.value;

    this._customPattern = pattern;

    // Validate pattern
    const error = this._validateRingPattern(pattern);
    this._patternError = error || "";
  }

  private _handleSavePattern(): void {
    if (this._patternError) return;
    // Don't update local _ringPattern yet, let the state update handle it
    // to avoid race condition in _loadRingerSettings
    this._saveRingPattern(this._customPattern);
  }

  private async _saveRingPattern(pattern: string): Promise<void> {
    const entityId = this._findEntity("text.ring_pattern_custom");

    if (!entityId) {
      console.error("Ring pattern custom entity not found");
      return;
    }

    this._loading = true;

    try {
      await this.hass.callService("text", "set_value", {
        entity_id: entityId,
        value: pattern,
      });
    } catch (error) {
      console.error("Failed to set ring pattern:", error);
    } finally {
      this._loading = false;
    }
  }

  private async _handleTestRing(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID required for test ring");
      return;
    }

    const pattern = this._customPattern || this._ringPattern;

    // Validate before testing
    const error = this._validateRingPattern(pattern);
    if (error) {
      this._patternError = error;
      return;
    }

    this._loading = true;

    try {
      await this.hass.callService(
        "tsuryphone",
        "ring_device",
        {
          pattern: pattern,
          force: false,
        },
        {
          entity_id: this.entityId,
        }
      );
    } catch (error) {
      console.error("Failed to test ring:", error);
    } finally {
      this._loading = false;
    }
  }

  private _getCurrentPresetName(): string {
    const currentPattern = this._ringPattern;

    // Find matching preset
    for (const [name, pattern] of Object.entries(this._ringPatternPresets)) {
      if (pattern === currentPattern) {
        return name;
      }
    }

    return "Default";
  }

  private _handleBack(): void {
    this.dispatchEvent(
      new CustomEvent("navigate-back", {
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    return html`
      <div class="settings-header">
        <button
          class="back-button"
          @click=${this._handleBack}
          aria-label="Back to settings"
        >
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h1 class="header-title">Ringer</h1>
      </div>

      <div class="settings-content">
        <!-- Ring Pattern Settings -->
        <div class="settings-group">
          <div class="group-header">Ring Pattern</div>

          <!-- Pattern Preset Selector -->
          <div class="slider-item">
            <label class="pattern-label" for="pattern-preset">
              Select Preset
            </label>
            <select
              id="pattern-preset"
              class="pattern-select"
              .value=${this._getCurrentPresetName()}
              @change=${this._handlePatternPresetChange}
            >
              ${Object.entries(this._ringPatternPresets).map(
                ([name, pattern]) => html`
                  <option value=${name}>
                    ${name}${pattern
                      ? html` <span style="opacity: 0.6">— ${pattern}</span>`
                      : html` <span style="opacity: 0.6">
                          — device default
                        </span>`}
                  </option>
                `
              )}
            </select>
          </div>

          <!-- Custom Pattern Input -->
          <div class="slider-item">
            <label class="pattern-label" for="pattern-custom">
              Custom Pattern
            </label>
            <div class="pattern-input-container">
              <div class="pattern-input-row">
                <input
                  id="pattern-custom"
                  type="text"
                  class="pattern-input ${this._patternError ? "error" : ""}"
                  .value=${this._customPattern}
                  @input=${this._handleCustomPatternChange}
                  placeholder="e.g., 500,500,500 or 300,300x2"
                  aria-label="Custom ring pattern"
                />
                <button
                  class="save-button"
                  @click=${this._handleSavePattern}
                  ?disabled=${!!this._patternError ||
                  this._customPattern === this._ringPattern}
                >
                  Save
                </button>
              </div>
              ${this._patternError
                ? html`<div class="pattern-error">${this._patternError}</div>`
                : html`
                    <div class="pattern-hint">
                      Format: duration1,duration2,... (in ms). Use 'x' for
                      repeats (e.g., 300,300x2). Even segments for repeats, odd
                      for single.
                    </div>
                  `}
            </div>
          </div>

          <!-- Test Button -->
          <div class="slider-item">
            <button
              class="test-button"
              @click=${this._handleTestRing}
              ?disabled=${!!this._patternError || this._loading}
              aria-label="Test ring pattern"
            >
              <ha-icon icon="mdi:bell-ring"></ha-icon>
              <span>Test Ring Pattern</span>
            </button>
          </div>
        </div>

        <!-- Ringer Calibration -->
        <div class="settings-group">
          <div class="group-header">Calibration</div>

          <div class="slider-item">
            <div class="slider-header">
              <div class="slider-label-container">
                <div class="slider-icon">
                  <ha-icon icon="mdi:sine-wave"></ha-icon>
                </div>
                <div class="slider-info">
                  <div class="slider-title">Ringer Calibration</div>
                  <div class="slider-description">
                    Tune mechanical resonance (ms)
                  </div>
                </div>
              </div>
            </div>
            
            <div class="calibration-control">
              <div class="calibration-input-group">
                <button 
                  class="calibration-button" 
                  @click=${this._decrementDuration}
                  ?disabled=${this._ringerCycleDuration <= 1}
                >-</button>
                <input
                  type="number"
                  class="calibration-input"
                  min="1"
                  max="100"
                  .value=${this._ringerCycleDuration.toString()}
                  @change=${this._handleCycleDurationInput}
                />
                <button 
                  class="calibration-button" 
                  @click=${this._incrementDuration}
                  ?disabled=${this._ringerCycleDuration >= 100}
                >+</button>
              </div>
              
              <div class="ring-actions">
                <button 
                  class="action-button btn-ring"
                  @click=${this._handleCalibrationRing}
                  ?disabled=${this._isRinging}
                >
                  <ha-icon icon="mdi:bell-ring"></ha-icon>
                  Ring
                </button>
                <button 
                  class="action-button btn-stop"
                  @click=${this._handleStopRinging}
                  ?disabled=${!this._isRinging}
                >
                  <ha-icon icon="mdi:bell-off"></ha-icon>
                  Stop
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Audio Help Text -->
        <div class="help-text">
          <ha-icon icon="mdi:information"></ha-icon>
          <div>
            <strong>Ringer Calibration</strong> allows you to find the perfect frequency for your mechanical bell. 
            Adjust the cycle duration while the phone is ringing to find the "sweet spot" where the ring is loudest and most harmonic.
            Changes take effect immediately.
          </div>
        </div>
      </div>

      ${this._loading
        ? html`
            <div class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
          `
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-ringer-settings": TsuryPhoneRingerSettings;
  }
}
