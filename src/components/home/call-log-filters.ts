import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CallFilter } from "../../utils/call-history-grouping";

@customElement("tsuryphone-call-log-filters")
export class TsuryPhoneCallLogFilters extends LitElement {
  @property({ type: String }) activeFilter: CallFilter = "all";

  static styles = css`
    :host {
      display: block;
    }

    .filters {
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .filters::-webkit-scrollbar {
      display: none;
    }

    .filter-chip {
      flex-shrink: 0;
      padding: 8px 16px;
      border-radius: 16px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      user-select: none;
    }

    .filter-chip:hover {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .filter-chip.active {
      background: var(--primary-color);
      color: var(--text-primary-color);
      border-color: var(--primary-color);
    }

    .filter-chip:active {
      transform: scale(0.95);
    }
  `;

  private _handleFilterClick(filter: CallFilter) {
    this.activeFilter = filter;
    this.dispatchEvent(
      new CustomEvent("filter-changed", {
        detail: { filter },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="filters">
        <div
          class="filter-chip ${this.activeFilter === "all" ? "active" : ""}"
          @click=${() => this._handleFilterClick("all")}
          role="button"
          tabindex="0"
          aria-label="Show all calls"
        >
          All
        </div>
        <div
          class="filter-chip ${this.activeFilter === "missed" ? "active" : ""}"
          @click=${() => this._handleFilterClick("missed")}
          role="button"
          tabindex="0"
          aria-label="Show missed calls"
        >
          Missed
        </div>
        <div
          class="filter-chip ${this.activeFilter === "outgoing"
            ? "active"
            : ""}"
          @click=${() => this._handleFilterClick("outgoing")}
          role="button"
          tabindex="0"
          aria-label="Show outgoing calls"
        >
          Outgoing
        </div>
        <div
          class="filter-chip ${this.activeFilter === "incoming"
            ? "active"
            : ""}"
          @click=${() => this._handleFilterClick("incoming")}
          role="button"
          tabindex="0"
          aria-label="Show incoming calls"
        >
          Incoming
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-call-log-filters": TsuryPhoneCallLogFilters;
  }
}
