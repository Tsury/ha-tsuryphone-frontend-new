import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  CallHistoryEntry,
  CallFilter,
  filterCallHistory,
  groupCallHistory,
  getFrequentContacts,
} from "../../utils/call-history-grouping";
import "./call-log-filters";
import "./frequent-contacts";
import "./call-log-list";

@customElement("tsuryphone-home-view")
export class TsuryPhoneHomeView extends LitElement {
  @property({ type: Array }) callHistory: CallHistoryEntry[] = [];
  @property({ type: Boolean }) loading = false;
  @property({ type: String }) defaultDialCode = "";

  @state() private _activeFilter: CallFilter = "all";

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--card-background-color);
    }

    .home-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .divider {
      height: 1px;
      background: var(--divider-color);
      margin: 0 16px;
    }

    /* Mobile optimizations */
    @media (max-width: 599px) {
      .home-view {
        font-size: 14px;
      }
    }

    /* Tablet */
    @media (min-width: 600px) and (max-width: 1023px) {
      .home-view {
        max-width: 600px;
        margin: 0 auto;
      }
    }

    /* Desktop */
    @media (min-width: 1024px) {
      .home-view {
        max-width: 800px;
        margin: 0 auto;
      }
    }
  `;

  private _handleFilterChanged(e: CustomEvent) {
    this._activeFilter = e.detail.filter;
  }

  private _handleContactClicked(e: CustomEvent) {
    // Bubble up the event for parent to handle (e.g., open call modal)
    this.dispatchEvent(
      new CustomEvent("dial-contact", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleCallItemClicked(e: CustomEvent) {
    // Bubble up the event for parent to handle (e.g., open call details)
    this.dispatchEvent(
      new CustomEvent("call-details", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    // Filter and group call history
    const filteredCalls = filterCallHistory(
      this.callHistory,
      this._activeFilter
    );
    const groupedCalls = groupCallHistory(filteredCalls);

    // Get frequent contacts (only from all calls, not filtered)
    const frequentContacts = getFrequentContacts(this.callHistory, 6);

    // Show frequent contacts only if we have calls and filter is 'all'
    const showFrequentContacts =
      this._activeFilter === "all" && frequentContacts.length > 0;

    return html`
      <div class="home-view">
        <tsuryphone-call-log-filters
          .activeFilter=${this._activeFilter}
          @filter-changed=${this._handleFilterChanged}
        ></tsuryphone-call-log-filters>

        <div class="scrollable-content">
          ${showFrequentContacts
            ? html`
                <tsuryphone-frequent-contacts
                  .contacts=${frequentContacts}
                  @contact-clicked=${this._handleContactClicked}
                ></tsuryphone-frequent-contacts>
                <div class="divider"></div>
              `
            : ""}

          <tsuryphone-call-log-list
            .groupedCalls=${groupedCalls}
            .hasAnyCalls=${this.callHistory.length > 0}
            .defaultDialCode=${this.defaultDialCode}
            .loading=${this.loading}
            @call-item-clicked=${this._handleCallItemClicked}
          ></tsuryphone-call-log-list>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-home-view": TsuryPhoneHomeView;
  }
}
