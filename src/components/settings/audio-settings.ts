import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

@customElement("tsuryphone-audio-settings")
export class TsuryPhoneAudioSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _earpieceVolume = 4;
  @state() private _earpieceGain = 4;
  @state() private _speakerVolume = 4;
  @state() private _speakerGain = 4;
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

    /* Slider Control */
    .slider-control {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .slider-min {
      font-size: 12px;
      color: var(--secondary-text-color);
      min-width: 20px;
      text-align: center;
    }

    .slider-max {
      font-size: 12px;
      color: var(--secondary-text-color);
      min-width: 20px;
      text-align: center;
    }

    /* Custom Slider Styling */
    input[type="range"] {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      background: var(--divider-color);
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }

    input[type="range"]::-webkit-slider-thumb:active {
      transform: scale(0.95);
    }

    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    input[type="range"]::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }

    input[type="range"]::-moz-range-thumb:active {
      transform: scale(0.95);
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
    this._loadAudioSettings();
  }

  protected willUpdate(): void {
    this._loadAudioSettings();
  }

  private _loadAudioSettings(): void {
    if (!this.hass) return;

    // Find audio entities without device_id prefix
    const earpieceVolumeEntity = this._findEntity("number.earpiece_volume");
    const earpieceGainEntity = this._findEntity("number.earpiece_gain");
    const speakerVolumeEntity = this._findEntity("number.speaker_volume");
    const speakerGainEntity = this._findEntity("number.speaker_gain");

    if (earpieceVolumeEntity) {
      const value = parseFloat(this.hass.states[earpieceVolumeEntity].state);
      if (!isNaN(value)) {
        this._earpieceVolume = Math.round(value);
      }
    }

    if (earpieceGainEntity) {
      const value = parseFloat(this.hass.states[earpieceGainEntity].state);
      if (!isNaN(value)) {
        this._earpieceGain = Math.round(value);
      }
    }

    if (speakerVolumeEntity) {
      const value = parseFloat(this.hass.states[speakerVolumeEntity].state);
      if (!isNaN(value)) {
        this._speakerVolume = Math.round(value);
      }
    }

    if (speakerGainEntity) {
      const value = parseFloat(this.hass.states[speakerGainEntity].state);
      if (!isNaN(value)) {
        this._speakerGain = Math.round(value);
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

  private async _handleSliderChange(
    entitySuffix: string,
    value: number
  ): Promise<void> {
    const entityId = this._findEntity(entitySuffix);

    if (!entityId) {
      console.error(`Audio entity not found: ${entitySuffix}`);
      return;
    }

    this._loading = true;

    try {
      await this.hass.callService("number", "set_value", {
        entity_id: entityId,
        value: value,
      });
    } catch (error) {
      console.error(`Failed to set ${entitySuffix}:`, error);
    } finally {
      this._loading = false;
    }
  }

  private _handleEarpieceVolumeChange(e: Event): void {
    const value = parseInt((e.target as HTMLInputElement).value);
    this._earpieceVolume = value;
    this._handleSliderChange("number.earpiece_volume", value);
  }

  private _handleEarpieceGainChange(e: Event): void {
    const value = parseInt((e.target as HTMLInputElement).value);
    this._earpieceGain = value;
    this._handleSliderChange("number.earpiece_gain", value);
  }

  private _handleSpeakerVolumeChange(e: Event): void {
    const value = parseInt((e.target as HTMLInputElement).value);
    this._speakerVolume = value;
    this._handleSliderChange("number.speaker_volume", value);
  }

  private _handleSpeakerGainChange(e: Event): void {
    const value = parseInt((e.target as HTMLInputElement).value);
    this._speakerGain = value;
    this._handleSliderChange("number.speaker_gain", value);
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
        <h1 class="header-title">Audio</h1>
      </div>

      <div class="settings-content">
        <!-- Earpiece Settings -->
        <div class="settings-group">
          <div class="group-header">Earpiece</div>

          <!-- Earpiece Volume -->
          <div class="slider-item">
            <div class="slider-header">
              <div class="slider-label-container">
                <div class="slider-icon">
                  <ha-icon icon="mdi:volume-high"></ha-icon>
                </div>
                <div class="slider-info">
                  <div class="slider-title">Volume</div>
                  <div class="slider-description">
                    Adjust earpiece loudness level
                  </div>
                </div>
              </div>
              <div class="slider-value">${this._earpieceVolume}</div>
            </div>
            <div class="slider-control">
              <div class="slider-min">1</div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                .value=${this._earpieceVolume.toString()}
                @input=${this._handleEarpieceVolumeChange}
                aria-label="Earpiece volume"
              />
              <div class="slider-max">7</div>
            </div>
          </div>

          <!-- Earpiece Gain -->
          <div class="slider-item">
            <div class="slider-header">
              <div class="slider-label-container">
                <div class="slider-icon">
                  <ha-icon icon="mdi:amplifier"></ha-icon>
                </div>
                <div class="slider-info">
                  <div class="slider-title">Gain</div>
                  <div class="slider-description">
                    Adjust earpiece amplification
                  </div>
                </div>
              </div>
              <div class="slider-value">${this._earpieceGain}</div>
            </div>
            <div class="slider-control">
              <div class="slider-min">1</div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                .value=${this._earpieceGain.toString()}
                @input=${this._handleEarpieceGainChange}
                aria-label="Earpiece gain"
              />
              <div class="slider-max">7</div>
            </div>
          </div>
        </div>

        <!-- Speaker Settings -->
        <div class="settings-group">
          <div class="group-header">Speaker</div>

          <!-- Speaker Volume -->
          <div class="slider-item">
            <div class="slider-header">
              <div class="slider-label-container">
                <div class="slider-icon">
                  <ha-icon icon="mdi:volume-high"></ha-icon>
                </div>
                <div class="slider-info">
                  <div class="slider-title">Volume</div>
                  <div class="slider-description">
                    Adjust speaker loudness level
                  </div>
                </div>
              </div>
              <div class="slider-value">${this._speakerVolume}</div>
            </div>
            <div class="slider-control">
              <div class="slider-min">1</div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                .value=${this._speakerVolume.toString()}
                @input=${this._handleSpeakerVolumeChange}
                aria-label="Speaker volume"
              />
              <div class="slider-max">7</div>
            </div>
          </div>

          <!-- Speaker Gain -->
          <div class="slider-item">
            <div class="slider-header">
              <div class="slider-label-container">
                <div class="slider-icon">
                  <ha-icon icon="mdi:amplifier"></ha-icon>
                </div>
                <div class="slider-info">
                  <div class="slider-title">Gain</div>
                  <div class="slider-description">
                    Adjust speaker amplification
                  </div>
                </div>
              </div>
              <div class="slider-value">${this._speakerGain}</div>
            </div>
            <div class="slider-control">
              <div class="slider-min">1</div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                .value=${this._speakerGain.toString()}
                @input=${this._handleSpeakerGainChange}
                aria-label="Speaker gain"
              />
              <div class="slider-max">7</div>
            </div>
          </div>
        </div>

        <!-- Audio Help Text -->
        <div class="help-text">
          <ha-icon icon="mdi:information"></ha-icon>
          <div>
            <strong>Volume</strong> controls the overall loudness, while
            <strong>Gain</strong> controls the signal amplification. Adjust
            both settings to find your optimal audio quality.
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
    "tsuryphone-audio-settings": TsuryPhoneAudioSettings;
  }
}
