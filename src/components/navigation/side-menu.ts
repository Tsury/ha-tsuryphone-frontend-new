import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

type MenuTarget = "blocked" | "settings";

@customElement("tsuryphone-side-menu")
export class TsuryPhoneSideMenu extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;

  static styles: CSSResultGroup = css`
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 120;
      display: block;
    }

    :host([open]) {
      pointer-events: auto;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.32);
      opacity: 0;
      transition: opacity 200ms ease;
      display: flex;
      justify-content: flex-start;
    }

    .overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    .panel {
      width: min(320px, 80vw);
      height: 100%;
      background: var(--card-background-color);
      box-shadow: var(--ha-card-box-shadow, 0 12px 32px rgba(15, 23, 42, 0.35));
      transform: translateX(-100%);
      transition: transform 240ms ease;
      display: flex;
      flex-direction: column;
      padding: 28px 24px 32px;
      box-sizing: border-box;
      gap: 24px;
    }

    .overlay.open .panel {
      transform: translateX(0);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .panel-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .panel-title h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .panel-title span {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .close-button {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .close-button:hover {
      background: var(--divider-color);
    }

    .close-button:active {
      transform: scale(0.95);
    }

    .menu-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--secondary-text-color);
    }

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 12px;
      border-radius: 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: background 0.2s ease;
      color: var(--primary-text-color);
    }

    .menu-item:hover {
      background: var(--divider-color);
    }

    .menu-item:active {
      background: var(--secondary-background-color);
    }

    .menu-item-content {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 500;
    }

    .menu-item ha-icon.chevron {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }

    .menu-item-content ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 20px;
    }

    @media (max-width: 480px) {
      .panel {
        width: min(280px, 82vw);
        padding: 24px 20px 28px;
      }

      .menu-item {
        padding: 12px 10px;
      }
    }
  `;

  private _emitClose(): void {
    this.dispatchEvent(
      new CustomEvent("close-menu", { bubbles: true, composed: true })
    );
  }

  private _handleOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this._emitClose();
    }
  }

  private _handleNavigate(target: MenuTarget): void {
    this.dispatchEvent(
      new CustomEvent("menu-navigate", {
        detail: { target },
        bubbles: true,
        composed: true,
      })
    );
    this._emitClose();
  }

  protected render(): TemplateResult {
    return html`
      <div
        class="overlay ${this.open ? "open" : ""}"
        @click=${this._handleOverlayClick}
        aria-hidden=${this.open ? "false" : "true"}
      >
        <div class="panel" role="navigation" @click=${(e: Event) => e.stopPropagation()}>
          <div class="panel-header">
            <div class="panel-title">
              <h2>TsuryPhone</h2>
              <span>Manage your device</span>
            </div>
            <button
              class="close-button"
              @click=${this._emitClose}
              aria-label="Close menu"
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="menu-section" role="group" aria-label="Navigation">
            <div class="section-label">Navigate</div>
            <button
              class="menu-item"
              @click=${() => this._handleNavigate("blocked")}
            >
              <span class="menu-item-content">
                <ha-icon icon="mdi:block-helper"></ha-icon>
                Blocked Numbers
              </span>
              <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
            </button>

            <button
              class="menu-item"
              @click=${() => this._handleNavigate("settings")}
            >
              <span class="menu-item-content">
                <ha-icon icon="mdi:cog"></ha-icon>
                Settings
              </span>
              <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-side-menu": TsuryPhoneSideMenu;
  }
}
