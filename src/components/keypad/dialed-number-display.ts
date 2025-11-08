/**
 * Dialed Number Display Component
 * Shows the currently dialed number with backspace functionality
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tsuryphone-dialed-number-display')
export class TsuryPhoneDialedNumberDisplay extends LitElement {
  @property({ type: String }) dialedNumber = '';

  @state() private _longPressTimer?: number;
  @state() private _isLongPressing = false;

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
      }

      .display-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 64px;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-bottom: 2px solid var(--divider-color);
        position: relative;
      }

      .number-display {
        flex: 1;
        font-size: 32px;
        font-weight: 300;
        color: var(--primary-text-color);
        letter-spacing: 2px;
        text-align: center;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }

      .number-display.empty {
        color: var(--secondary-text-color);
        font-size: 18px;
        font-weight: 400;
        letter-spacing: normal;
      }

      .backspace-button {
        position: absolute;
        right: 16px;
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .backspace-button:hover {
        background: var(--secondary-background-color);
      }

      .backspace-button:active {
        background: var(--divider-color);
      }

      .backspace-button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .backspace-button:disabled:hover {
        background: transparent;
      }

      .backspace-icon {
        width: 24px;
        height: 24px;
        fill: var(--primary-text-color);
      }

      .placeholder {
        opacity: 0.5;
      }
    `;
  }

  private _handleBackspace(): void {
    if (this._isLongPressing) {
      // Don't fire regular backspace if long press just completed
      return;
    }
    this.dispatchEvent(new CustomEvent('backspace', { bubbles: true, composed: true }));
  }

  private _handleLongPress(): void {
    // Long press on backspace clears all
    this._isLongPressing = true;
    this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }));
  }

  private _handleTouchStart(e: TouchEvent): void {
    e.preventDefault(); // Prevent context menu on mobile
    this._isLongPressing = false;
    this._longPressTimer = window.setTimeout(() => {
      this._handleLongPress();
    }, 500); // 500ms for long press
  }

  private _handleTouchEnd(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = undefined;
    }
    
    // Small delay to prevent backspace from firing after long press
    if (this._isLongPressing) {
      setTimeout(() => {
        this._isLongPressing = false;
      }, 100);
    }
  }

  private _handleTouchCancel(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = undefined;
    }
    this._isLongPressing = false;
  }

  private _formatDialedNumber(number: string): string {
    if (!number) return '';

    // Format the number with spaces for readability
    // Simple formatting: add space every 3 digits (can be enhanced)
    let formatted = '';
    for (let i = 0; i < number.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ' ';
      }
      formatted += number[i];
    }
    return formatted;
  }

  protected render(): TemplateResult {
    const hasNumber = this.dialedNumber.length > 0;
    const formattedNumber = this._formatDialedNumber(this.dialedNumber);

    return html`
      <div class="display-container">
        <div class="number-display ${!hasNumber ? 'empty' : ''}">
          ${hasNumber ? formattedNumber : ''}
        </div>
        <button
          class="backspace-button"
          @click=${this._handleBackspace}
          @touchstart=${this._handleTouchStart}
          @touchend=${this._handleTouchEnd}
          @touchcancel=${this._handleTouchCancel}
          @contextmenu=${(e: Event) => {
            e.preventDefault();
            this._handleLongPress();
          }}
          ?disabled=${!hasNumber}
          aria-label="Backspace"
          title="Click to delete, long-press to clear all"
        >
          <svg class="backspace-icon" viewBox="0 0 24 24">
            <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/>
          </svg>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-dialed-number-display': TsuryPhoneDialedNumberDisplay;
  }
}
