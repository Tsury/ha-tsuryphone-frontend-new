/**
 * Blocked View Component
 * Displays and manages blocked numbers list
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";
import {
  TsuryPhoneCardConfig,
  BlockedNumberEntry,
} from "../../types/tsuryphone.d";
import { haThemeVariables } from "../../styles/theme";
import "../shared/empty-state";
import "./blocked-item";

@customElement("tsuryphone-blocked-view")
export class TsuryPhoneBlockedView extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TsuryPhoneCardConfig;
  @property({ attribute: false }) blockedNumbers: BlockedNumberEntry[] = [];

  private _handleAddBlocked(): void {
    this.dispatchEvent(
      new CustomEvent("open-block-modal", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _handleRemoveBlocked(e: CustomEvent): Promise<void> {
    const { id } = e.detail;
    const deviceIdPrefix = this.config?.device_id || "";
    const phoneStateEntityId = deviceIdPrefix
      ? `sensor.${deviceIdPrefix}_phone_state`
      : `sensor.phone_state`;

    try {
      await this.hass.callService(
        "tsuryphone",
        "blocked_remove",
        { id },
        { entity_id: phoneStateEntityId }
      );
    } catch (err) {
      console.error("Failed to remove blocked number:", err);
      // TODO: Show error toast
    }
  }

  render(): TemplateResult {
    return html`
      <div class="blocked-view">
        <div class="blocked-header">
          <h2 class="blocked-title">Blocked Numbers</h2>
          <button class="add-button" @click=${this._handleAddBlocked}>
            <ha-icon icon="mdi:plus"></ha-icon>
            <span>Block Number</span>
          </button>
        </div>

        ${this.blockedNumbers.length === 0
          ? this._renderEmptyState()
          : this._renderBlockedList()}
      </div>
    `;
  }

  private _renderEmptyState(): TemplateResult {
    return html`
      <tsuryphone-empty-state
        icon="mdi:block-helper"
        title="No Blocked Numbers"
        message="Block unwanted callers to prevent them from reaching you."
      ></tsuryphone-empty-state>
    `;
  }

  private _renderBlockedList(): TemplateResult {
    return html`
      <div class="blocked-list">
        ${this.blockedNumbers.map(
          (entry) => html`
            <tsuryphone-blocked-item
              .entry=${entry}
              @remove-blocked=${this._handleRemoveBlocked}
            ></tsuryphone-blocked-item>
          `
        )}
      </div>
      <div class="blocked-count">
        ${this.blockedNumbers.length} blocked
        ${this.blockedNumbers.length === 1 ? "number" : "numbers"}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haThemeVariables,
      css`
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--tsury-card-background-color);
        }

        .blocked-view {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .blocked-header {
          padding: var(--tsury-spacing-lg);
          border-bottom: 1px solid var(--tsury-divider-color);
          display: flex;
          flex-direction: column;
          gap: var(--tsury-spacing-md);
        }

        .blocked-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--tsury-primary-text-color);
        }

        .add-button {
          width: 100%;
          padding: var(--tsury-spacing-md);
          border-radius: 8px;
          border: none;
          background: var(--tsury-error-color, #f44336);
          color: white;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--tsury-spacing-sm);
          transition: all var(--tsury-transition-duration)
            var(--tsury-transition-timing);
        }

        .add-button:hover {
          background: var(--tsury-error-dark-color, #d32f2f);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
        }

        .add-button:active {
          transform: translateY(0);
        }

        .add-button ha-icon {
          --mdc-icon-size: 20px;
        }

        .blocked-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .blocked-count {
          padding: var(--tsury-spacing-md) var(--tsury-spacing-lg);
          text-align: center;
          font-size: 14px;
          color: var(--tsury-secondary-text-color);
          border-top: 1px solid var(--tsury-divider-color);
          background: var(--tsury-card-background-color);
        }

        tsuryphone-empty-state {
          flex: 1;
          display: flex;
        }

        /* Scrollbar styling */
        .blocked-list::-webkit-scrollbar {
          width: 6px;
        }

        .blocked-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .blocked-list::-webkit-scrollbar-thumb {
          background: var(--tsury-scrollbar-thumb-color);
          border-radius: 3px;
        }

        .blocked-list::-webkit-scrollbar-thumb:hover {
          background: var(--tsury-scrollbar-thumb-hover-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-blocked-view": TsuryPhoneBlockedView;
  }
}
