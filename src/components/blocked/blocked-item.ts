/**
 * Blocked Number Item Component
 * Displays a single blocked number entry with remove action
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BlockedNumberEntry } from '../../types/tsuryphone.d';
import { haThemeVariables } from '../../styles/theme';

@customElement('tsuryphone-blocked-item')
export class TsuryPhoneBlockedItem extends LitElement {
  @property({ attribute: false }) entry!: BlockedNumberEntry;

  private _handleRemoveClick(): void {
    this.dispatchEvent(
      new CustomEvent('remove-blocked', {
        detail: { id: this.entry.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  render(): TemplateResult {
    const { name, display_number } = this.entry;
    const displayName = name || 'Unknown';

    return html`
      <div class="blocked-item">
        <div class="blocked-icon">
          <ha-icon icon="mdi:block-helper"></ha-icon>
        </div>
        <div class="blocked-info">
          <div class="blocked-name">${displayName}</div>
          <div class="blocked-number">${display_number}</div>
        </div>
        <button
          class="remove-button"
          @click=${this._handleRemoveClick}
          aria-label="Remove blocked number"
          title="Remove blocked number"
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </button>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haThemeVariables,
      css`
        :host {
          display: block;
        }

        .blocked-item {
          display: flex;
          align-items: center;
          gap: var(--tsury-spacing-md);
          padding: var(--tsury-spacing-md) var(--tsury-spacing-lg);
          background: var(--tsury-card-background-color);
          border-bottom: 1px solid var(--tsury-divider-color);
          transition: background-color var(--tsury-transition-duration) var(--tsury-transition-timing);
        }

        .blocked-item:hover {
          background: var(--tsury-hover-background-color);
        }

        .blocked-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--tsury-error-color, #f44336);
          border-radius: 50%;
          color: white;
        }

        .blocked-icon ha-icon {
          --mdc-icon-size: 20px;
        }

        .blocked-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .blocked-name {
          font-size: 16px;
          font-weight: 500;
          color: var(--tsury-primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .blocked-number {
          font-size: 14px;
          color: var(--tsury-secondary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          direction: ltr;
        }

        .remove-button {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--tsury-error-color, #f44336);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--tsury-transition-duration) var(--tsury-transition-timing);
        }

        .remove-button:hover {
          background: rgba(244, 67, 54, 0.1);
        }

        .remove-button:active {
          transform: scale(0.95);
        }

        .remove-button ha-icon {
          --mdc-icon-size: 20px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-blocked-item': TsuryPhoneBlockedItem;
  }
}
