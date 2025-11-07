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
  const { name, display_number, number } = this.entry;
  const displayNumber = display_number || number || 'Unknown';

    return html`
      <div class="blocked-item">
        <div class="blocked-info">
          <div class="blocked-number">${displayNumber}</div>
          ${name
            ? html`<div class="blocked-name">${name}</div>`
            : html`<div class="blocked-name muted">Unknown contact name</div>`}
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
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--tsury-divider-color);
          background: transparent;
          transition: background 0.2s ease;
        }

        .blocked-item:hover {
          background: var(--tsury-hover-background-color);
        }

        .blocked-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .blocked-number {
          font-size: 16px;
          color: var(--tsury-primary-text-color);
          font-weight: 500;
        }

        .blocked-name {
          font-size: 14px;
          color: var(--tsury-secondary-text-color);
        }

        .blocked-name.muted {
          opacity: 0.6;
        }

        .remove-button {
          width: 36px;
          height: 36px;
          border-radius: 18px;
          border: none;
          background: transparent;
          color: var(--tsury-secondary-text-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .remove-button:hover {
          background: var(--tsury-hover-background-color);
          color: var(--tsury-primary-text-color);
        }

        .remove-button:active {
          transform: scale(0.94);
        }

        .remove-button ha-icon {
          --mdc-icon-size: 18px;
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
