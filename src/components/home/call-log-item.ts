import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CallHistoryEntry } from '../../utils/call-history-grouping';
import { formatCallTime, formatDuration } from '../../utils/date-formatter';
import { getAvatarColor, getInitials } from '../../utils/avatar-color';

@customElement('tsuryphone-call-log-item')
export class TsuryPhoneCallLogItem extends LitElement {
  @property({ type: Object }) call!: CallHistoryEntry;

  static styles = css`
    :host {
      display: block;
    }

    .call-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .call-item:hover {
      background: var(--sidebar-background-color, rgba(0, 0, 0, 0.05));
    }

    .call-item:active {
      background: var(--divider-color);
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 16px;
      flex-shrink: 0;
    }

    .call-info {
      flex: 1;
      min-width: 0;
    }

    .call-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .contact-name {
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .call-type-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .call-type-icon svg {
      width: 100%;
      height: 100%;
    }

    .call-type-icon.incoming {
      color: var(--success-color, #4caf50);
    }

    .call-type-icon.outgoing {
      color: var(--info-color, #2196f3);
    }

    .call-type-icon.missed {
      color: var(--error-color, #f44336);
    }

    .call-details {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .phone-number {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .call-time {
      flex-shrink: 0;
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-left: auto;
    }

    .blocked-badge {
      background: var(--error-color, #f44336);
      color: white;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      flex-shrink: 0;
    }
  `;

  private _getCallTypeIcon() {
    switch (this.call.type) {
      case 'incoming':
        return html`
          <div class="call-type-icon incoming" title="Incoming call">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>
            </svg>
          </div>
        `;
      case 'outgoing':
        return html`
          <div class="call-type-icon outgoing" title="Outgoing call">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 15.5c-1.2 0-2.4-.2-3.5-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1zM9 1v2c3.87 0 7 3.13 7 7h2c0-4.97-4.03-9-9-9zm4 4v2c1.66 0 3 1.34 3 3h2c0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
        `;
      case 'missed':
        return html`
          <div class="call-type-icon missed" title="Missed call">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.23 15.26l-2.54-.29c-.61-.07-1.21.14-1.64.57l-1.84 1.84c-2.83-1.44-5.15-3.75-6.59-6.59l1.85-1.85c.43-.43.64-1.03.57-1.64l-.29-2.52c-.12-1.01-.97-1.77-1.99-1.77H5.03c-1.13 0-2.07.94-2 2.07.53 8.54 7.36 15.36 15.89 15.89 1.13.07 2.07-.87 2.07-2v-1.73c.01-1.01-.75-1.86-1.76-1.98z"/>
              <path d="M21.7 2.3L2.3 21.7 3.7 23.1 23.1 3.7z"/>
            </svg>
          </div>
        `;
    }
  }

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent('call-item-clicked', {
        detail: { call: this.call },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const avatarColor = getAvatarColor(this.call.contactName);
    const initials = getInitials(this.call.contactName);
    const timeFormatted = formatCallTime(this.call.timestamp);
    const duration = this.call.duration > 0 ? formatDuration(this.call.duration) : null;

    return html`
      <div class="call-item" @click=${this._handleClick}>
        <div class="avatar" style="background-color: ${avatarColor}">
          ${initials}
        </div>
        <div class="call-info">
          <div class="call-header">
            <span class="contact-name">${this.call.contactName}</span>
            ${this._getCallTypeIcon()}
            ${this.call.isBlocked ? html`<span class="blocked-badge">Blocked</span>` : ''}
          </div>
          <div class="call-details">
            <span class="phone-number">${this.call.phoneNumber}</span>
            ${duration ? html`<span>• ${duration}</span>` : ''}
          </div>
        </div>
        <div class="call-time">${timeFormatted}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-call-log-item': TsuryPhoneCallLogItem;
  }
}
