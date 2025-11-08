import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";
import "./dnd-settings";
import "./audio-settings";
import "./device-settings";

export interface SettingsSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  category?: "general" | "device" | "advanced";
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  // General Settings
  {
    id: "dnd",
    title: "Do Not Disturb",
    icon: "mdi:moon-waning-crescent",
    description: "Schedule quiet hours and DND settings",
    category: "general",
  },
  {
    id: "audio",
    title: "Audio",
    icon: "mdi:volume-high",
    description: "Earpiece and speaker volume settings",
    category: "general",
  },
  {
    id: "ring-pattern",
    title: "Ring Pattern",
    icon: "mdi:bell-ring",
    description: "Customize ring tone pattern",
    category: "general",
  },
  
  // Device Settings
  {
    id: "device",
    title: "Device Management",
    icon: "mdi:cellphone-cog",
    description: "Reset and reboot options",
    category: "device",
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    icon: "mdi:stethoscope",
    description: "Device health and system information",
    category: "device",
  },
  
  // Advanced Settings
  {
    id: "send-mode",
    title: "Send Mode",
    icon: "mdi:send",
    description: "Dial behavior and card communication",
    category: "advanced",
  },
  {
    id: "webhooks",
    title: "Webhooks",
    icon: "mdi:webhook",
    description: "Configure event notifications",
    category: "advanced",
  },
  {
    id: "statistics",
    title: "Statistics",
    icon: "mdi:chart-line",
    description: "Call history and usage data",
    category: "advanced",
  },
];

@customElement("tsuryphone-settings-view")
export class TsuryPhoneSettingsView extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;
  @state() private _activeSetting: string | null = null;

  static styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--card-background-color);
      box-sizing: border-box;
    }

    .settings-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: var(--card-background-color);
      border-bottom: 1px solid var(--divider-color);
      position: sticky;
      top: 0;
      z-index: 10;
      gap: 12px;
    }

    .back-button {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
      flex-shrink: 0;
    }

    .back-button:hover {
      background: var(--divider-color);
    }

    .back-button:active {
      background: var(--secondary-background-color);
    }

    .back-button ha-icon {
      --mdc-icon-size: 24px;
    }

    .header-title {
      flex: 1;
      font-size: 20px;
      font-weight: 600;
      color: var(--primary-text-color);
      margin: 0;
    }

    .settings-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .settings-category {
      margin-bottom: 24px;
    }

    .category-header {
      padding: 16px 20px 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--secondary-text-color);
    }

    .settings-list {
      display: flex;
      flex-direction: column;
    }

    .settings-item {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      background: var(--card-background-color);
      border: none;
      cursor: pointer;
      transition: background 0.2s ease;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
      gap: 16px;
    }

    .settings-item:hover {
      background: var(--divider-color);
    }

    .settings-item:active {
      background: var(--secondary-background-color);
    }

    .item-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-icon ha-icon {
      --mdc-icon-size: 22px;
    }

    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .item-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .item-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .item-chevron {
      color: var(--secondary-text-color);
      flex-shrink: 0;
    }

    .item-chevron ha-icon {
      --mdc-icon-size: 20px;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 32px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .empty-state ha-icon {
      --mdc-icon-size: 64px;
      margin-bottom: 16px;
      opacity: 0.3;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 480px) {
      .settings-header {
        padding: 12px 16px;
      }

      .settings-item {
        padding: 14px 16px;
      }

      .item-icon {
        width: 36px;
        height: 36px;
      }

      .item-icon ha-icon {
        --mdc-icon-size: 20px;
      }

      .category-header {
        padding: 12px 16px 6px;
      }
    }
  `;

  private _handleBack(): void {
    this.dispatchEvent(
      new CustomEvent("navigate-back", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleItemClick(sectionId: string): void {
    this._activeSetting = sectionId;
  }

  private _handleBackFromSettings(): void {
    this._activeSetting = null;
  }

  private _renderCategorySection(
    category: "general" | "device" | "advanced",
    label: string
  ): TemplateResult {
    const sections = SETTINGS_SECTIONS.filter((s) => s.category === category);

    if (sections.length === 0) {
      return html``;
    }

    return html`
      <div class="settings-category">
        <div class="category-header">${label}</div>
        <div class="settings-list">
          ${sections.map(
            (section) => html`
              <button
                class="settings-item"
                @click=${() => this._handleItemClick(section.id)}
                aria-label="${section.title}"
              >
                <div class="item-icon">
                  <ha-icon icon="${section.icon}"></ha-icon>
                </div>
                <div class="item-content">
                  <div class="item-title">${section.title}</div>
                  <div class="item-description">${section.description}</div>
                </div>
                <div class="item-chevron">
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </div>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  protected render(): TemplateResult {
    // Show individual setting page if active
    if (this._activeSetting === "dnd") {
      return html`
        <tsuryphone-dnd-settings
          .hass=${this.hass}
          .entityId=${this.entityId}
          @navigate-back=${this._handleBackFromSettings}
        ></tsuryphone-dnd-settings>
      `;
    }

    if (this._activeSetting === "audio") {
      return html`
        <tsuryphone-audio-settings
          .hass=${this.hass}
          .entityId=${this.entityId}
          @navigate-back=${this._handleBackFromSettings}
        ></tsuryphone-audio-settings>
      `;
    }

    if (this._activeSetting === "device") {
      return html`
        <tsuryphone-device-settings
          .hass=${this.hass}
          .entityId=${this.entityId}
          @navigate-back=${this._handleBackFromSettings}
        ></tsuryphone-device-settings>
      `;
    }

    // Show settings overview
    return html`
      <div class="settings-header">
        <button
          class="back-button"
          @click=${this._handleBack}
          aria-label="Back"
        >
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h1 class="header-title">Settings</h1>
      </div>

      <div class="settings-content">
        ${this._renderCategorySection("general", "General")}
        ${this._renderCategorySection("device", "Device")}
        ${this._renderCategorySection("advanced", "Advanced")}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-settings-view": TsuryPhoneSettingsView;
  }
}
