/**
 * Empty State Component
 * Reusable empty state message
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { emptyStateStyles } from "../../styles/shared-styles";

@customElement("tsuryphone-empty-state")
export class TsuryPhoneEmptyState extends LitElement {
  @property({ type: String }) icon = "mdi:alert-circle-outline";
  @property({ type: String }) title = "No items";
  @property({ type: String }) message = "";
  @property({ type: String }) actionLabel?: string;
  @property({ type: Function }) onAction?: () => void;

  static get styles(): CSSResultGroup {
    return [
      emptyStateStyles,
      css`
        :host {
          display: block;
        }
      `,
    ];
  }

  private _handleAction(): void {
    if (this.onAction) {
      this.onAction();
    }
    this.dispatchEvent(new CustomEvent("action", { bubbles: true, composed: true }));
  }

  protected render(): TemplateResult {
    return html`
      <div class="empty-state">
        <ha-icon class="empty-state-icon" .icon=${this.icon}></ha-icon>
        <div class="empty-state-title">${this.title}</div>
        ${this.message
          ? html`<div class="empty-state-message">${this.message}</div>`
          : ""}
        ${this.actionLabel
          ? html`
              <button class="action-button" @click=${this._handleAction}>
                ${this.actionLabel}
              </button>
            `
          : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-empty-state": TsuryPhoneEmptyState;
  }
}
