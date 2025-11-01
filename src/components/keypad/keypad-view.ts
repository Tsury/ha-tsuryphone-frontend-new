/**
 * Keypad View Component
 * Main container for the dialing keypad
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from '../../types/homeassistant';
import { TsuryPhoneCardConfig } from '../../types/tsuryphone';
import './dialed-number-display';
import './keypad-grid';

@customElement('tsuryphone-keypad-view')
export class TsuryPhoneKeypadView extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TsuryPhoneCardConfig;

  @state() private _dialedNumber = '';

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--card-background-color);
        padding: 16px;
        box-sizing: border-box;
      }

      .keypad-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        max-width: 400px;
        margin: 0 auto;
        width: 100%;
      }

      .display-section {
        flex: 0 0 auto;
        margin-bottom: 24px;
      }

      .keypad-section {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .call-button-section {
        flex: 0 0 auto;
        margin-top: 24px;
        padding: 0 16px;
      }

      .call-button {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--success-color, #4caf50);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition: transform 0.1s, box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
      }

      .call-button:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
      }

      .call-button:active {
        transform: scale(0.95);
      }

      .call-button:disabled {
        background: var(--disabled-color, #9e9e9e);
        cursor: not-allowed;
        box-shadow: none;
      }

      .call-button:disabled:hover {
        transform: none;
      }

      .call-icon {
        width: 32px;
        height: 32px;
        fill: white;
      }
    `;
  }

  private _handleDigitPress(digit: string): void {
    this._dialedNumber += digit;
    this._triggerHaptic('light');
  }

  private async _handleBackspace(): Promise<void> {
    if (this._dialedNumber.length === 0) return;

    try {
      await this.hass.callService('tsuryphone', 'delete_last_digit', {});
      
      // Optimistic update
      this._dialedNumber = this._dialedNumber.slice(0, -1);
      this._triggerHaptic('light');
    } catch (err) {
      console.error('Failed to delete last digit:', err);
      this._triggerHaptic('heavy');
    }
  }

  private _handleClear(): void {
    this._dialedNumber = '';
    this._triggerHaptic('light');
  }

  private async _handleCall(): Promise<void> {
    if (!this._canCall()) return;

    const numberToDial = this._dialedNumber || this._getLastCalledNumber();
    if (!numberToDial) return;

    this._triggerHaptic('medium');

    try {
      // Call the dial service
      // Note: The service is device-targeted, HA will route it to the correct device
      await this.hass.callService('tsuryphone', 'dial', {
        number: numberToDial,
      });

      // Clear the dialed number after successful dial
      this._dialedNumber = '';
    } catch (error) {
      console.error('Failed to dial number:', error);
      this._triggerHaptic('heavy');
    }
  }

  private _canCall(): boolean {
    // Can call if we have a dialed number OR we have call history to redial
    return this._dialedNumber.length > 0 || !!this._getLastCalledNumber();
  }

  private _getLastCalledNumber(): string | null {
    // Get the phone state entity
    const deviceId = this.config?.device_id || 'tsuryphone';
    let phoneStateEntityId: string;
    
    if (this.config?.entity) {
      phoneStateEntityId = this.config.entity.startsWith('sensor.') 
        ? this.config.entity 
        : `sensor.${this.config.entity}`;
    } else {
      phoneStateEntityId = `sensor.${deviceId}_phone_state`;
    }

    const phoneState = this.hass?.states[phoneStateEntityId];
    const callHistory = phoneState?.attributes?.call_log || [];

    if (callHistory.length === 0) return null;

    // Get the most recent call
    const lastCall = callHistory[0];
    return lastCall.number || null;
  }

  private _triggerHaptic(type: 'light' | 'medium' | 'heavy'): void {
    if (!navigator.vibrate) return;

    const durations = {
      light: 10,
      medium: 20,
      heavy: 30,
    };

    navigator.vibrate(durations[type]);
  }

  protected render(): TemplateResult {
    return html`
      <div class="keypad-container">
        <div class="display-section">
          <tsuryphone-dialed-number-display
            .dialedNumber=${this._dialedNumber}
            @backspace=${this._handleBackspace}
            @clear=${this._handleClear}
          ></tsuryphone-dialed-number-display>
        </div>

        <div class="keypad-section">
          <tsuryphone-keypad-grid
            @digit-press=${(e: CustomEvent) => this._handleDigitPress(e.detail.digit)}
          ></tsuryphone-keypad-grid>
        </div>

        <div class="call-button-section">
          <button
            class="call-button"
            @click=${this._handleCall}
            ?disabled=${!this._canCall()}
            aria-label="Call"
          >
            <svg class="call-icon" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-keypad-view': TsuryPhoneKeypadView;
  }
}
