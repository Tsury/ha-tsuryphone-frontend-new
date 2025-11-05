/**
 * TsuryPhone Navigation Component
 * Bottom navigation bar with three tabs: Home, Keypad, Contacts
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { haThemeVariables } from "../../styles/theme";

export type NavigationTab = "home" | "keypad" | "contacts" | "blocked";

export interface TabChangeEvent {
  tab: NavigationTab;
}

@customElement("tsuryphone-navigation")
export class TsuryPhoneNavigation extends LitElement {
  @property({ type: String }) activeTab: NavigationTab = "home";
  @property({ type: Boolean }) disabled = false;

  private _handleTabClick(tab: NavigationTab): void {
    if (this.disabled || tab === this.activeTab) {
      return;
    }

    // Dispatch custom event for parent to handle
    this.dispatchEvent(
      new CustomEvent<TabChangeEvent>("tab-change", {
        detail: { tab },
        bubbles: true,
        composed: true,
      })
    );
  }

  render(): TemplateResult {
    return html`
      <nav class="navigation ${this.disabled ? "disabled" : ""}" role="tablist">
        ${this._renderTab("home", "mdi:home", "Home")}
        ${this._renderTab("keypad", "mdi:dialpad", "Keypad")}
        ${this._renderTab("contacts", "mdi:contacts", "Contacts")}
        ${this._renderTab("blocked", "mdi:block-helper", "Blocked")}
      </nav>
    `;
  }

  private _renderTab(
    tab: NavigationTab,
    icon: string,
    label: string
  ): TemplateResult {
    const isActive = this.activeTab === tab;

    return html`
      <button
        class="nav-tab ${isActive ? "active" : ""}"
        role="tab"
        aria-selected="${isActive}"
        aria-label="${label}"
        @click=${() => this._handleTabClick(tab)}
        ?disabled=${this.disabled}
      >
        <ha-icon icon="${icon}"></ha-icon>
        <span class="nav-label">${label}</span>
      </button>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haThemeVariables,
      css`
        :host {
          display: block;
        }

        .navigation {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: var(--tsury-card-background-color);
          border-top: 1px solid var(--tsury-divider-color);
          padding: var(--tsury-spacing-xs) 0;
          min-height: 56px;
          position: relative;
        }

        .navigation.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .nav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 4px;
          padding: var(--tsury-spacing-sm);
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--tsury-secondary-text-color);
          transition: all var(--tsury-transition-duration)
            var(--tsury-transition-timing);
          position: relative;
          min-width: 64px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-tab:disabled {
          cursor: not-allowed;
        }

        .nav-tab:not(:disabled):hover {
          background: rgba(
            var(--rgb-primary-color, 128, 128, 128),
            var(--tsury-state-hover-opacity)
          );
        }

        .nav-tab:not(:disabled):active {
          background: rgba(
            var(--rgb-primary-color, 128, 128, 128),
            var(--tsury-state-pressed-opacity)
          );
        }

        .nav-tab:not(:disabled):focus-visible {
          outline: 2px solid var(--tsury-primary-color);
          outline-offset: -2px;
        }

        .nav-tab.active {
          color: var(--tsury-primary-color);
        }

        .nav-tab.active::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 64px;
          height: 3px;
          background: var(--tsury-primary-color);
          border-radius: 0 0 3px 3px;
          animation: slideIn 200ms var(--tsury-transition-timing);
        }

        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 64px;
            opacity: 1;
          }
        }

        .nav-tab ha-icon {
          --mdc-icon-size: 24px;
          display: block;
        }

        .nav-label {
          font-size: 12px;
          font-weight: var(--tsury-font-weight-medium);
          white-space: nowrap;
        }

        /* Ripple effect on tap */
        .nav-tab::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(var(--rgb-primary-color, 128, 128, 128), 0.2);
          transform: translate(-50%, -50%);
          transition:
            width 0.4s,
            height 0.4s;
          pointer-events: none;
        }

        .nav-tab:active::after {
          width: 100px;
          height: 100px;
        }

        /* Mobile optimization */
        @media (max-width: 600px) {
          .nav-label {
            font-size: 11px;
          }

          .nav-tab {
            min-width: 56px;
          }
        }

        /* Desktop optimization */
        @media (min-width: 1024px) {
          .navigation {
            min-height: 64px;
          }

          .nav-tab {
            min-width: 80px;
          }

          .nav-label {
            font-size: 13px;
          }
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-navigation": TsuryPhoneNavigation;
  }
}
