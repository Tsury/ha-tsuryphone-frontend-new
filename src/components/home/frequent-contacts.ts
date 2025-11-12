import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getAvatarColor, getInitials } from '../../utils/avatar-color';

interface FrequentContact {
  contactName: string;
  phoneNumber: string;
  callCount: number;
  hasContactName?: boolean;
}

@customElement('tsuryphone-frequent-contacts')
export class TsuryPhoneFrequentContacts extends LitElement {
  @property({ type: Array }) contacts: FrequentContact[] = [];

  static styles = css`
    :host {
      display: block;
    }

    .frequent-contacts {
      padding: 16px;
    }

    .section-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 16px;
    }

    .contact-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .contact-item:hover {
      background: var(--sidebar-background-color, rgba(0, 0, 0, 0.05));
    }

    .contact-item:active {
      transform: scale(0.95);
    }

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-primary-color, white);
      font-weight: 600;
      font-size: 20px;
      position: relative;
    }

    .avatar.generic {
      background: var(--secondary-text-color);
    }

    .avatar ha-icon {
      --mdc-icon-size: 32px;
    }

    .call-count-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .contact-name {
      font-size: 13px;
      color: var(--primary-text-color);
      text-align: center;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: var(--secondary-text-color);
    }

    .empty-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .empty-text {
      font-size: 14px;
    }
  `;

  private _handleContactClick(contact: FrequentContact) {
    this.dispatchEvent(
      new CustomEvent('contact-clicked', {
        detail: { contact },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (this.contacts.length === 0) {
      return html`
        <div class="frequent-contacts">
          <div class="section-header">Frequents</div>
          <div class="empty-state">
            <ha-icon class="empty-icon" icon="mdi:account-multiple-outline"></ha-icon>
            <div class="empty-text">No frequent contacts yet</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="frequent-contacts">
        <div class="section-header">Frequents</div>
        <div class="contacts-grid">
          ${this.contacts.map(
            contact => {
              const isContact = contact.hasContactName;
              return html`
                <div
                  class="contact-item"
                  @click=${() => this._handleContactClick(contact)}
                  role="button"
                  tabindex="0"
                  aria-label="Call ${contact.contactName}"
                >
                  ${isContact
                    ? html`
                        <div class="avatar" style="background-color: ${getAvatarColor(contact.contactName)}">
                          ${getInitials(contact.contactName)}
                          ${contact.callCount > 1
                            ? html`<div class="call-count-badge">${contact.callCount}</div>`
                            : ''}
                        </div>
                      `
                    : html`
                        <div class="avatar generic">
                          <ha-icon icon="mdi:account"></ha-icon>
                          ${contact.callCount > 1
                            ? html`<div class="call-count-badge">${contact.callCount}</div>`
                            : ''}
                        </div>
                      `}
                  <div class="contact-name" title="${contact.contactName}">
                    ${contact.contactName}
                  </div>
                </div>
              `;
            }
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-frequent-contacts': TsuryPhoneFrequentContacts;
  }
}
