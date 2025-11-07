/**
 * Blocked View Component
 * Displays and manages blocked numbers list
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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

  @state() private _newNumber = "";
  @state() private _newName = "";
  @state() private _isAdding = false;
  @state() private _errorMessage = "";

  private _handleBack(): void {
    this.dispatchEvent(
      new CustomEvent("navigate-back", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this._newNumber = input.value;
    if (this._errorMessage) {
      this._errorMessage = "";
    }
  }

  private _handleNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this._newName = input.value;
    if (this._errorMessage) {
      this._errorMessage = "";
    }
  }

  private _getPhoneStateEntityId(): string {
    const deviceIdPrefix = this.config?.device_id || "";
    return deviceIdPrefix
      ? `sensor.${deviceIdPrefix}_phone_state`
      : "sensor.phone_state";
  }

  private async _handleAddNumber(): Promise<void> {
    const rawNumber = this._newNumber.trim();
    const rawName = this._newName.trim();

    if (!rawNumber) {
      this._errorMessage = "Enter a phone number to block.";
      return;
    }

    if (!rawName) {
      this._errorMessage = "Enter a contact name to label the blocked number.";
      return;
    }

    const phoneStateEntityId = this._getPhoneStateEntityId();
    this._isAdding = true;

    try {
      await this.hass.callService(
        "tsuryphone",
        "blocked_add",
        {
          number: rawNumber,
          name: rawName,
        },
        { entity_id: phoneStateEntityId }
      );

      this._newNumber = "";
      this._newName = "";
      this._errorMessage = "";
    } catch (error: any) {
      const message = error?.message || "Failed to block number.";
      this._errorMessage = message;
    } finally {
      this._isAdding = false;
    }
  }

  private _handleAddKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this._handleAddNumber();
    }
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
        <header class="top-bar">
          <button
            class="back-button"
            @click=${this._handleBack}
            aria-label="Back"
            title="Back"
          >
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <div class="title-group">
            <h1>Blocked numbers</h1>
            <p>You won't receive calls or texts from blocked numbers.</p>
          </div>
        </header>

        <section class="add-section" aria-label="Add blocked number">
          <h2>Add a number</h2>
          <div class="add-row">
            <input
              class="number-input"
              type="tel"
              placeholder="Phone number"
              .value=${this._newNumber}
              @input=${this._handleNumberInput}
              @keydown=${this._handleAddKeydown}
              ?disabled=${this._isAdding}
            />
            <input
              class="name-input"
              type="text"
              placeholder="Contact name"
              .value=${this._newName}
              @input=${this._handleNameInput}
              @keydown=${this._handleAddKeydown}
              ?disabled=${this._isAdding}
            />
            <button
              class="add-button"
              @click=${this._handleAddNumber}
              ?disabled=${this._isAdding}
              aria-label="Block number"
            >
              ${this._isAdding
                ? html`<span class="spinner" role="progressbar"></span>`
                : html`<span>Block</span>`}
            </button>
          </div>
          ${this._errorMessage
            ? html`<div class="error-text">${this._errorMessage}</div>`
            : ""}
        </section>

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
      <div class="blocked-list" role="list">
        ${this.blockedNumbers.map(
          (entry) => html`
            <tsuryphone-blocked-item
              .entry=${entry}
              @remove-blocked=${this._handleRemoveBlocked}
              role="listitem"
            ></tsuryphone-blocked-item>
          `
        )}
      </div>
      <footer class="blocked-count">
        ${this.blockedNumbers.length} blocked
        ${this.blockedNumbers.length === 1 ? "number" : "numbers"}
      </footer>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haThemeVariables,
      css`
        :host {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          background: var(--tsury-card-background-color);
        }

        .blocked-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px 20px 16px;
          box-sizing: border-box;
          gap: 24px;
        }

        .top-bar {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .back-button {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--tsury-primary-text-color);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .back-button:hover {
          background: var(--tsury-hover-background-color);
        }

        .back-button:active {
          transform: scale(0.95);
        }

        .title-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .title-group h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--tsury-primary-text-color);
        }

        .title-group p {
          margin: 0;
          font-size: 14px;
          color: var(--tsury-secondary-text-color);
        }

        .add-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--tsury-surface-color, rgba(0, 0, 0, 0.04));
          padding: 16px;
          border-radius: 16px;
        }

        .add-section h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--tsury-primary-text-color);
        }

        .add-row {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .number-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--tsury-divider-color);
          font-size: 16px;
          color: var(--tsury-primary-text-color);
          background: var(--tsury-card-background-color);
          transition: border-color 0.2s ease;
        }

        .name-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--tsury-divider-color);
          font-size: 16px;
          color: var(--tsury-primary-text-color);
          background: var(--tsury-card-background-color);
          transition: border-color 0.2s ease;
        }

        .number-input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .name-input:focus {
          outline: none;
          border-color: var(--primary-color);
        }

        .add-button {
          min-width: 96px;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          background: var(--primary-color);
          color: var(--text-primary-color, #fff);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease;
          flex: 0 0 auto;
          white-space: nowrap;
        }

        .add-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-text {
          font-size: 13px;
          color: var(--error-color);
        }

        .blocked-list {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 16px;
          background: var(--tsury-card-background-color);
          border: 1px solid var(--tsury-divider-color);
        }

        .blocked-count {
          font-size: 13px;
          color: var(--tsury-secondary-text-color);
          text-align: left;
          padding: 0 4px;
        }

        tsuryphone-empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-top-color: rgba(255, 255, 255, 1);
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .blocked-list::-webkit-scrollbar {
          width: 6px;
        }

        .blocked-list::-webkit-scrollbar-thumb {
          background: var(--tsury-scrollbar-thumb-color);
          border-radius: 3px;
        }

        .blocked-list::-webkit-scrollbar-thumb:hover {
          background: var(--tsury-scrollbar-thumb-hover-color);
        }

        @media (max-width: 480px) {
          .blocked-view {
            padding: 20px 16px 12px;
          }

          .add-row {
            flex-direction: column;
            align-items: stretch;
          }

          .number-input,
          .name-input {
            width: 100%;
          }

          .add-button {
            width: 100%;
          }
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
