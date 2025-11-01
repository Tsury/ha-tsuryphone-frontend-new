/**
 * Avatar Circle Component
 * Reusable avatar with letter and color
 */

import { LitElement, html, css, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import { generateColor, getAvatarLetter } from "../../utils/formatters";
import { avatarStyles } from "../../styles/shared-styles";

@customElement("tsuryphone-avatar")
export class TsuryPhoneAvatar extends LitElement {
  @property({ type: String }) name = "";
  @property({ type: String }) size: "small" | "medium" | "large" = "medium";
  @property({ type: String }) color?: string;

  static get styles(): CSSResultGroup {
    return [
      avatarStyles,
      css`
        :host {
          display: inline-block;
        }
      `,
    ];
  }

  protected render() {
    const letter = getAvatarLetter(this.name);
    const backgroundColor = this.color || generateColor(this.name);
    const sizeClass = this.size === "medium" ? "" : this.size;

    return html`
      <div
        class="avatar ${sizeClass}"
        style="background-color: ${backgroundColor}"
      >
        ${letter}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-avatar": TsuryPhoneAvatar;
  }
}
