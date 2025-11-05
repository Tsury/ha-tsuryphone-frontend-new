/**
 * Contacts View Component
 * Main container for contacts management
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";
import { TsuryPhoneCardConfig, QuickDialEntry } from "../../types/tsuryphone";
import "../shared/empty-state";
import "./contact-item";

@customElement("tsuryphone-contacts-view")
export class TsuryPhoneContactsView extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TsuryPhoneCardConfig;

  @state() private _searchQuery = "";
  @state() private _showAddModal = false;
  @state() private _showMenu = false;

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--card-background-color);
      }

      .contacts-header {
        padding: 16px;
        border-bottom: 1px solid var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 12px;
        position: sticky;
        top: 0;
        background: var(--card-background-color);
        z-index: 2;
      }

      .search-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        flex: 1;
      }

      .search-bar-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .menu-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        position: relative;
      }

      .menu-button:hover {
        background: var(--secondary-background-color);
      }

      .menu-button:active {
        transform: scale(0.95);
      }

      .menu-dropdown {
        position: absolute;
        top: 48px;
        right: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
        box-shadow: var(
          --ha-card-box-shadow,
          0 4px 12px rgba(0, 0, 0, 0.15)
        );
        min-width: 160px;
        z-index: 10;
        overflow: hidden;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        cursor: pointer;
        color: var(--primary-text-color);
        font-size: 14px;
        transition: background 0.2s;
      }

      .menu-item:hover {
        background: var(--secondary-background-color);
      }

      .menu-item:active {
        background: var(--divider-color);
      }

      .search-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 16px;
        color: var(--primary-text-color);
        outline: none;
      }

      .search-input::placeholder {
        color: var(--secondary-text-color);
      }

      .add-button {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .add-button:hover {
        background: var(--dark-primary-color, var(--primary-color));
      }

      .add-button:active {
        transform: scale(0.98);
      }

      .contacts-list {
        flex: 1;
        overflow-y: auto;
      }

      .section-header {
        padding: 12px 16px;
        background: var(--secondary-background-color);
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        position: sticky;
        top: 0;
        z-index: 1;
      }
    `;
  }

  private _getContacts(): QuickDialEntry[] {
    const phoneStateEntityId = this._getPhoneStateEntityId();
    const phoneState = this.hass?.states[phoneStateEntityId];
    const contacts = phoneState?.attributes?.quick_dials || [];

    return contacts;
  }

  private _getFilteredContacts(): QuickDialEntry[] {
    const contacts = this._getContacts();

    if (!this._searchQuery.trim()) {
      return contacts;
    }

    const query = this._searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name?.toLowerCase().includes(query) ||
        contact.number?.toLowerCase().includes(query) ||
        contact.code?.toLowerCase().includes(query)
    );
  }

  private _groupContactsByLetter(): Map<string, QuickDialEntry[]> {
    const contacts = this._getFilteredContacts();
    const grouped = new Map<string, QuickDialEntry[]>();

    contacts.forEach((contact) => {
      const firstLetter = (contact.name?.[0] || "#").toUpperCase();
      if (!grouped.has(firstLetter)) {
        grouped.set(firstLetter, []);
      }
      grouped.get(firstLetter)!.push(contact);
    });

    // Sort groups alphabetically
    return new Map([...grouped.entries()].sort());
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

  private _handleSearch(e: Event): void {
    const input = e.target as HTMLInputElement;
    this._searchQuery = input.value;
  }

  private _handleAddContact(): void {
    this.dispatchEvent(
      new CustomEvent("action", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggleMenu(): void {
    this._showMenu = !this._showMenu;
  }

  private _handleBlockedClick(): void {
    this._showMenu = false;
    this.dispatchEvent(
      new CustomEvent("navigate-blocked", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleClickOutside(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (this._showMenu && !target.closest('.menu-button') && !target.closest('.menu-dropdown')) {
      this._showMenu = false;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('click', this._handleClickOutside.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this._handleClickOutside.bind(this));
  }

  protected render(): TemplateResult {
    const contacts = this._getContacts();
    const groupedContacts = this._groupContactsByLetter();

    return html`
      <div class="contacts-header">
        <div class="search-bar-container">
          <div class="search-bar">
            <ha-icon icon="mdi:magnify"></ha-icon>
            <input
              class="search-input"
              type="text"
              placeholder="Search contacts"
              .value=${this._searchQuery}
              @input=${this._handleSearch}
            />
            ${this._searchQuery
              ? html`
                  <ha-icon
                    icon="mdi:close"
                    @click=${() => (this._searchQuery = "")}
                    style="cursor: pointer"
                  ></ha-icon>
                `
              : ""}
          </div>
          <button class="menu-button" @click=${this._toggleMenu} title="More options">
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </button>
          ${this._showMenu
            ? html`
                <div class="menu-dropdown">
                  <button class="menu-item" @click=${this._handleBlockedClick}>
                    <ha-icon icon="mdi:block-helper"></ha-icon>
                    Blocked
                  </button>
                </div>
              `
            : ""}
        </div>
        <button class="add-button" @click=${this._handleAddContact}>
          <ha-icon icon="mdi:plus"></ha-icon>
          Create contact
        </button>
      </div>

      <div class="contacts-list">
        ${contacts.length === 0
          ? html`
              <tsuryphone-empty-state
                icon="mdi:contacts-outline"
                title="No contacts yet"
                message="Add your first contact to get started"
                actionLabel="Create contact"
                .onAction=${() => this._handleAddContact()}
              ></tsuryphone-empty-state>
            `
          : groupedContacts.size === 0
            ? html`
                <tsuryphone-empty-state
                  icon="mdi:magnify"
                  title="No results"
                  message="No contacts match your search"
                ></tsuryphone-empty-state>
              `
            : Array.from(groupedContacts.entries()).map(
                ([letter, contacts]) => html`
                  <div class="section-header">${letter}</div>
                  ${contacts.map(
                    (contact) => html`
                      <tsuryphone-contact-item
                        .hass=${this.hass}
                        .config=${this.config}
                        .contact=${contact}
                      ></tsuryphone-contact-item>
                    `
                  )}
                `
              )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-contacts-view": TsuryPhoneContactsView;
  }
}
