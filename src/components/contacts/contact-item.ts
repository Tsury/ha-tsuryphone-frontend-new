/**
 * Contact Item Component
 * Individual contact list item
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";
import { TsuryPhoneCardConfig, QuickDialEntry } from "../../types/tsuryphone";
import { formatPhoneNumber } from "../../utils/formatters";
import { triggerHaptic } from "../../utils/haptics";
import {
  listItemStyles,
  buttonStyles,
} from "../../styles/shared-styles";
import "../shared/avatar";

@customElement("tsuryphone-contact-item")
export class TsuryPhoneContactItem extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TsuryPhoneCardConfig;
  @property({ attribute: false }) contact!: QuickDialEntry;

  static get styles(): CSSResultGroup {
    return [
      listItemStyles,
      buttonStyles,
      css`
        :host {
          display: block;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .contact-details {
          flex: 1;
          min-width: 0;
        }

        .contact-name {
          font-size: 16px;
          font-weight: 500;
          color: var(--primary-text-color, #000);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .contact-number {
          font-size: 14px;
          color: var(--secondary-text-color, #666);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .contact-actions {
          display: flex;
          gap: 8px;
        }

        .call-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--primary-color, #03a9f4);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .call-button:hover {
          background: var(--dark-primary-color, #0288d1);
          transform: scale(1.05);
        }

        .call-button:active {
          transform: scale(0.95);
        }

        .priority-star {
          color: var(--warning-color, #ffa726);
        }
      `,
    ];
  }

  private _getPhoneStateEntityId(): string {
    const deviceId = this.config?.device_id || "tsuryphone";

    if (this.config?.entity) {
      return this.config.entity.startsWith("sensor.")
        ? this.config.entity
        : `sensor.${this.config.entity}`;
    }

    return `sensor.${deviceId}_phone_state`;
  }

  private async _handleCall(): Promise<void> {
    triggerHaptic("medium");

    try {
      await this.hass.callService(
        "tsuryphone",
        "dial",
        {
          number: this.contact.number,
        },
        {
          entity_id: this._getPhoneStateEntityId(),
        }
      );
    } catch (error) {
      console.error("[ContactItem] Failed to dial:", error);
    }
  }

  private _handleEdit(): void {
    triggerHaptic("light");
    this.dispatchEvent(
      new CustomEvent("edit-contact", {
        detail: { contact: this.contact },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    const formattedNumber = formatPhoneNumber(
      this.contact.display_number || this.contact.number
    );

    // Check if contact is priority
    const phoneState = this.hass?.states[this._getPhoneStateEntityId()];
    const priorityNumbers: string[] =
      phoneState?.attributes?.priority_numbers || [];
    const isPriority = priorityNumbers.includes(this.contact.normalized_number);

    return html`
      <div class="list-item" @click=${this._handleEdit}>
        <div class="contact-info">
          <tsuryphone-avatar .name=${this.contact.name}></tsuryphone-avatar>
          <div class="contact-details">
            <div class="contact-name">
              ${this.contact.name}
              ${isPriority
                ? html`<ha-icon
                    class="priority-star"
                    icon="mdi:star"
                  ></ha-icon>`
                : ""}
            </div>
            <div class="contact-number">${formattedNumber}</div>
          </div>
        </div>
        <div class="contact-actions">
          <button
            class="call-button"
            @click=${(e: Event) => {
              e.stopPropagation();
              this._handleCall();
            }}
            title="Call ${this.contact.name}"
          >
            <ha-icon icon="mdi:phone"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-contact-item": TsuryPhoneContactItem;
  }
}
