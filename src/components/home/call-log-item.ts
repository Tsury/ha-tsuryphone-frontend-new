import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CallHistoryEntry } from "../../utils/call-history-grouping";
import { formatCallTime, formatDuration } from "../../utils/date-formatter";
import { getAvatarColor, getInitials } from "../../utils/avatar-color";
import { normalizePhoneNumberForDisplay } from "../../utils/formatters";

@customElement("tsuryphone-call-log-item")
export class TsuryPhoneCallLogItem extends LitElement {
  @property({ type: Object }) call!: CallHistoryEntry;
  @property({ type: String }) defaultDialCode = "";

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
      background: var(--secondary-background-color);
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
      color: var(--success-color);
    }

    .call-type-icon.outgoing {
      color: var(--info-color);
    }

    .call-type-icon.missed {
      color: var(--error-color);
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
      background: var(--error-color);
      color: var(--text-primary-color, white);
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .count-badge {
      color: var(--secondary-text-color);
      font-size: 13px;
      font-weight: 500;
      flex-shrink: 0;
    }
  `;

  private _getCallTypeIcon() {
    switch (this.call.type) {
      case "incoming":
        return html`
          <div class="call-type-icon incoming" title="Incoming call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 3 L5 17 M5 17 L5 10 M5 17 L12 17" />
            </svg>
          </div>
        `;
      case "outgoing":
        return html`
          <div class="call-type-icon outgoing" title="Outgoing call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 21 L19 7 M19 7 L19 14 M19 7 L12 7" />
            </svg>
          </div>
        `;
      case "missed":
        return html`
          <div class="call-type-icon missed" title="Missed call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 3 L5 17 M5 17 L5 10 M5 17 L12 17" />
              <line x1="3" y1="3" x2="21" y2="21" stroke-width="2.5" />
            </svg>
          </div>
        `;
    }
  }

  private _handleClick() {
    this.dispatchEvent(
      new CustomEvent("call-item-clicked", {
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
    const duration =
      this.call.duration > 0 ? formatDuration(this.call.duration) : null;
    const displayNumber = normalizePhoneNumberForDisplay(
      this.call.phoneNumber,
      this.defaultDialCode
    );

    return html`
      <div class="call-item" @click=${this._handleClick}>
        <div class="avatar" style="background-color: ${avatarColor}">
          ${initials}
        </div>
        <div class="call-info">
          <div class="call-header">
            <span class="contact-name">${this.call.contactName}</span>
            ${this._getCallTypeIcon()}
            ${this.call.count && this.call.count > 1
              ? html`<span class="count-badge">(${this.call.count})</span>`
              : ""}
            ${this.call.isBlocked
              ? html`<span class="blocked-badge">Blocked</span>`
              : ""}
          </div>
          <div class="call-details">
            <span class="phone-number">${displayNumber}</span>
            ${duration ? html`<span>• ${duration}</span>` : ""}
          </div>
        </div>
        <div class="call-time">${timeFormatted}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-call-log-item": TsuryPhoneCallLogItem;
  }
}
