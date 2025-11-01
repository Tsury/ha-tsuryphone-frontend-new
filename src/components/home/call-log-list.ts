import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GroupedCallHistory } from '../../utils/call-history-grouping';
import './call-log-item';

@customElement('tsuryphone-call-log-list')
export class TsuryPhoneCallLogList extends LitElement {
  @property({ type: Array }) groupedCalls: GroupedCallHistory[] = [];
  @property({ type: Boolean }) loading = false;

  static styles = css`
    :host {
      display: block;
    }

    .call-log-list {
      flex: 1;
      overflow-y: auto;
    }

    .group {
      margin-bottom: 16px;
    }

    .group-header {
      position: sticky;
      top: 0;
      background: var(--card-background-color);
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--divider-color);
      z-index: 1;
    }

    .divider {
      height: 1px;
      background: var(--divider-color);
      margin: 0 16px;
    }

    .divider:last-child {
      display: none;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }

    .empty-text {
      font-size: 14px;
      max-width: 300px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      color: var(--secondary-text-color);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--divider-color);
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

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div class="spinner"></div>
        </div>
      `;
    }

    if (this.groupedCalls.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">📞</div>
          <div class="empty-title">No calls yet</div>
          <div class="empty-text">
            Your call history will appear here once you start making or receiving calls.
          </div>
        </div>
      `;
    }

    return html`
      <div class="call-log-list">
        ${this.groupedCalls.map(
          group => html`
            <div class="group">
              <div class="group-header">${group.groupLabel}</div>
              ${group.calls.map(
                (call, index) => html`
                  <tsuryphone-call-log-item .call=${call}></tsuryphone-call-log-item>
                  ${index < group.calls.length - 1 ? html`<div class="divider"></div>` : ''}
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-call-log-list': TsuryPhoneCallLogList;
  }
}
