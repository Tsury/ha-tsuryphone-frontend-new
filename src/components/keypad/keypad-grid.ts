/**
 * Keypad Grid Component
 * 3x4 grid of number buttons with *, 0, # on bottom row
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

interface KeypadButton {
  digit: string;
  letters?: string;
  longPressDigit?: string;
}

@customElement('tsuryphone-keypad-grid')
export class TsuryPhoneKeypadGrid extends LitElement {
  private _longPressTimer: number | null = null;
  private _longPressTriggered = false;
  
  @state() private _pressedButton: string | null = null;

  private readonly _buttons: KeypadButton[] = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+', longPressDigit: '+' },
    { digit: '#', letters: '' },
  ];

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }

      .keypad-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        max-width: 320px;
        margin: 0 auto;
        padding: 16px;
      }

      .keypad-button {
        aspect-ratio: 1;
        border: none;
        background: var(--card-background-color);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 300;
        color: var(--primary-text-color);
        transition: background 0.15s, transform 0.1s;
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        position: relative;
        min-height: 72px;
      }

      .keypad-button:hover {
        background: var(--secondary-background-color);
      }

      .keypad-button.pressed {
        transform: scale(0.95);
        background: var(--divider-color);
      }

      .keypad-button.long-press-active {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .digit {
        font-size: 32px;
        font-weight: 400;
        line-height: 1;
      }

      .letters {
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 1px;
        margin-top: 4px;
        opacity: 0.6;
        text-transform: uppercase;
        height: 14px;
        line-height: 14px;
      }

      .letters-placeholder {
        height: 14px;
        margin-top: 4px;
      }

      .long-press-hint {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 12px;
        opacity: 0.5;
      }

      @media (max-width: 400px) {
        .keypad-grid {
          gap: 8px;
          padding: 12px;
        }

        .keypad-button {
          min-height: 64px;
        }

        .digit {
          font-size: 28px;
        }
      }
    `;
  }

  private _handlePointerDown(button: KeypadButton): void {
    this._longPressTriggered = false;
    this._pressedButton = button.digit;

    // Start long press timer if button supports it
    if (button.longPressDigit) {
      this._longPressTimer = window.setTimeout(() => {
        this._longPressTriggered = true;
        this._emitDigit(button.longPressDigit!);
        this._triggerHaptic('medium');
      }, 500);
    }
  }

  private _handlePointerUp(button: KeypadButton): void {
    // Clear pressed state
    this._pressedButton = null;
    
    // Clear long press timer
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }

    // If long press was triggered, don't emit the regular digit
    if (this._longPressTriggered) {
      this._longPressTriggered = false;
      return;
    }

    // Emit the regular digit
    this._emitDigit(button.digit);
    this._triggerHaptic('light');
  }

  private _handlePointerCancel(): void {
    // Clear pressed state
    this._pressedButton = null;
    
    // Clear long press timer if pointer is cancelled (e.g., scrolling)
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
    this._longPressTriggered = false;
  }

  private _emitDigit(digit: string): void {
    this.dispatchEvent(
      new CustomEvent('digit-press', {
        detail: { digit },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _triggerHaptic(type: 'light' | 'medium'): void {
    if (!navigator.vibrate) return;

    const durations = {
      light: 10,
      medium: 20,
    };

    navigator.vibrate(durations[type]);
  }

  protected render(): TemplateResult {
    return html`
      <div class="keypad-grid">
        ${this._buttons.map(
          (button) => html`
            <button
              class="keypad-button ${this._pressedButton === button.digit ? 'pressed' : ''}"
              @pointerdown=${() => this._handlePointerDown(button)}
              @pointerup=${() => this._handlePointerUp(button)}
              @pointercancel=${() => this._handlePointerCancel()}
              aria-label="${button.digit}${button.letters ? ` ${button.letters}` : ''}"
              title="${button.longPressDigit ? `Long press for ${button.longPressDigit}` : ''}"
            >
              <span class="digit">${button.digit}</span>
              ${button.letters
                ? html`<span class="letters">${button.letters}</span>`
                : html`<span class="letters-placeholder"></span>`}
              ${button.longPressDigit && button.longPressDigit !== button.letters
                ? html`<span class="long-press-hint">${button.longPressDigit}</span>`
                : ''}
            </button>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-keypad-grid': TsuryPhoneKeypadGrid;
  }
}
