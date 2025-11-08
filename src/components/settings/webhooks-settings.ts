import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";

interface WebhookEntry {
  code: string;
  webhook_id: string;
  action_name: string;
  automation_entity_id?: string;
}

@customElement("tsuryphone-webhooks-settings")
export class TsuryPhoneWebhooksSettings extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string;

  @state() private _loading = false;
  @state() private _webhooks: WebhookEntry[] = [];
  @state() private _selectedAutomation: string | null = null;
  @state() private _detectedWebhookIds: string[] = [];
  @state() private _newCode = "";
  @state() private _newActionName = "";
  @state() private _entityPickerLoaded = false;

  static styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--card-background-color);
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
      padding: 16px 0;
    }

    /* Settings Groups */
    .settings-group {
      margin-bottom: 32px;
    }

    .group-header {
      padding: 8px 20px 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--secondary-text-color);
    }

    /* Add Webhook Form */
    .add-webhook-form {
      margin: 0 20px;
      padding: 20px;
      background: var(--card-background-color);
      border-radius: 12px;
      border: 1px solid var(--divider-color);
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-input::placeholder {
      color: var(--secondary-text-color);
      opacity: 0.6;
    }

    .loading-message {
      padding: 16px;
      text-align: center;
      color: var(--secondary-text-color);
      font-size: 14px;
    }

    /* Webhook detected list */
    .detected-webhooks {
      margin-top: 12px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 8px;
    }

    .detected-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }

    .webhook-chip {
      display: inline-block;
      padding: 6px 12px;
      margin: 4px 4px 4px 0;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      border-radius: 16px;
      font-size: 12px;
      font-family: monospace;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .webhook-chip:hover {
      opacity: 0.8;
    }

    /* Add Button */
    .add-button {
      width: 100%;
      padding: 12px 20px;
      border-radius: 8px;
      border: none;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .add-button:hover:not(:disabled) {
      opacity: 0.9;
    }

    .add-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .add-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* Webhook List */
    .webhook-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 0 20px;
    }

    .webhook-item {
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .webhook-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .webhook-icon ha-icon {
      --mdc-icon-size: 24px;
    }

    .webhook-info {
      flex: 1;
      min-width: 0;
    }

    .webhook-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }

    .webhook-details {
      font-size: 13px;
      color: var(--secondary-text-color);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .webhook-code {
      font-family: monospace;
      color: var(--primary-color);
    }

    .webhook-id {
      font-family: monospace;
      opacity: 0.8;
    }

    .webhook-actions {
      display: flex;
      gap: 8px;
    }

    .delete-button {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: rgb(244, 67, 54);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .delete-button:hover {
      background: rgba(244, 67, 54, 0.1);
      border-color: rgb(244, 67, 54);
    }

    .delete-button ha-icon {
      --mdc-icon-size: 20px;
    }

    /* Empty State */
    .empty-state {
      margin: 0 20px;
      padding: 48px 20px;
      text-align: center;
      color: var(--secondary-text-color);
    }

    .empty-state ha-icon {
      --mdc-icon-size: 64px;
      opacity: 0.3;
      margin-bottom: 16px;
    }

    .empty-state-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }

    .empty-state-description {
      font-size: 14px;
      line-height: 1.5;
    }

    /* Help Text */
    .help-text {
      margin: 0 20px 16px;
      padding: 12px 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .help-text ha-icon {
      --mdc-icon-size: 20px;
      margin-top: 2px;
      flex-shrink: 0;
      color: var(--primary-color);
    }

    /* Loading Overlay */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    @media (max-width: 480px) {
      .settings-header {
        padding: 12px 16px;
      }

      .add-webhook-form,
      .webhook-list,
      .help-text,
      .empty-state {
        margin: 0 16px;
      }

      .webhook-item {
        padding: 14px;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._loadWebhooks();
    this._loadEntityPicker();
  }

  // Load ha-entity-picker component by triggering glance card editor
  // See: https://community.home-assistant.io/t/re-using-existing-frontend-components-in-lovelace-card-editor/103415
  private async _loadEntityPicker(): Promise<void> {
    if (!customElements.get("ha-entity-picker")) {
      const glanceCard = customElements.get("hui-glance-card");
      if (glanceCard && typeof (glanceCard as any).getConfigElement === "function") {
        try {
          await (glanceCard as any).getConfigElement();
        } catch (e) {
          console.warn("Failed to load ha-entity-picker:", e);
        }
      }
    }
    this._entityPickerLoaded = true;
  }

  willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);

    if (changedProps.has("hass") && this.hass && this.entityId) {
      this._loadWebhooks();
    }
  }

  private _findEntity(prefix: string, keywords: string[]): string | null {
    if (!this.hass) return null;

    const allEntityIds = Object.keys(this.hass.states);

    const found =
      allEntityIds.find(
        (id) => id.startsWith(prefix) && keywords.some((kw) => id.includes(kw))
      ) || null;

    return found;
  }

  private async _loadWebhooks(): Promise<void> {
    if (!this.hass || !this.entityId) return;

    try {
      // Get webhooks from coordinator state via sensor attributes
      const sensorEntity = this.hass.states[this.entityId];
      if (sensorEntity?.attributes?.webhooks) {
        this._webhooks = sensorEntity.attributes.webhooks;
      }
    } catch (error) {
      console.error("Failed to load webhooks:", error);
    }
  }

  private _handleBack(): void {
    this.dispatchEvent(
      new CustomEvent("navigate-back", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _handleAutomationSelected(e: CustomEvent): Promise<void> {
    const entityId = e.detail.value;
    this._selectedAutomation = entityId;
    this._detectedWebhookIds = [];

    if (!entityId) return;

    this._loading = true;
    try {
      // Fetch automation config via WebSocket
      const config = await this.hass.callWS<any>({
        type: "automation/config",
        entity_id: entityId,
      });

      console.log("Automation config:", config); // Debug log

      // Extract webhook triggers - handle both 'trigger' and 'triggers' keys
      let triggers: any[] = [];
      if (Array.isArray(config?.trigger)) {
        triggers = config.trigger;
      } else if (Array.isArray(config?.triggers)) {
        triggers = config.triggers;
      } else if (config?.trigger) {
        triggers = [config.trigger];
      } else if (config?.triggers) {
        triggers = [config.triggers];
      }

      // Filter for webhook triggers - check both 'platform' and 'trigger' fields
      this._detectedWebhookIds = triggers
        .filter((t: any) => {
          console.log("Checking trigger:", t); // Debug individual trigger
          const isWebhook = t?.platform === "webhook" || t?.trigger === "webhook";
          const hasWebhookId = t?.webhook_id;
          console.log(`  isWebhook: ${isWebhook}, hasWebhookId: ${hasWebhookId}`);
          return isWebhook && hasWebhookId;
        })
        .map((t: any) => t.webhook_id);

      console.log("Detected webhook IDs:", this._detectedWebhookIds); // Debug log

      // Auto-fill action name from automation friendly_name
      if (config?.alias) {
        this._newActionName = config.alias;
      }
    } catch (error) {
      console.error("Failed to fetch automation config:", error);
      this._detectedWebhookIds = [];
    } finally {
      this._loading = false;
    }
  }

  private _handleWebhookIdClick(webhookId: string): void {
    // Auto-populate the webhook ID input when user clicks a detected webhook
    const webhookIdEntity = this._findEntity("text.", ["webhook_id"]);
    if (webhookIdEntity) {
      this.hass.callService("text", "set_value", {
        entity_id: webhookIdEntity,
        value: webhookId,
      });
    }
  }

  private async _handleAddWebhook(): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID is required");
      return;
    }

    const codeEntity = this._findEntity("text.", ["webhook_code"]);
    const nameEntity = this._findEntity("text.", ["webhook", "action_name"]);

    if (!codeEntity || !nameEntity) {
      console.error("Webhook text entities not found");
      return;
    }

    this._loading = true;
    try {
      // The button service will read from the text entities
      await this.hass.callService(
        "button",
        "press",
        {},
        {
          entity_id: this._findEntity("button.", ["webhook", "add"]),
        }
      );

      // Clear form
      this._newCode = "";
      this._newActionName = "";
      this._selectedAutomation = null;
      this._detectedWebhookIds = [];

      // Reload webhooks
      await this._loadWebhooks();
    } catch (error) {
      console.error("Failed to add webhook:", error);
    } finally {
      this._loading = false;
    }
  }

  private async _handleDeleteWebhook(webhook: WebhookEntry): Promise<void> {
    if (!this.entityId) {
      console.error("Entity ID is required");
      return;
    }

    this._loading = true;
    try {
      // Select the webhook to delete
      const selectEntity = this._findEntity("select.", ["webhook"]);
      if (selectEntity) {
        const option = webhook.action_name
          ? `${webhook.action_name} (${webhook.code})`
          : webhook.code;

        await this.hass.callService("select", "select_option", {
          entity_id: selectEntity,
          option: option,
        });

        // Trigger remove
        const removeButtonEntity = this._findEntity("button.", [
          "webhook",
          "remove",
        ]);
        if (removeButtonEntity) {
          await this.hass.callService(
            "button",
            "press",
            {},
            {
              entity_id: removeButtonEntity,
            }
          );
        }
      }

      // Reload webhooks
      await this._loadWebhooks();
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    } finally {
      this._loading = false;
    }
  }

  private _handleCodeInput(e: Event): void {
    this._newCode = (e.target as HTMLInputElement).value;

    // Update backend entity
    const codeEntity = this._findEntity("text.", ["webhook_code"]);
    if (codeEntity) {
      this.hass.callService("text", "set_value", {
        entity_id: codeEntity,
        value: this._newCode,
      });
    }
  }

  private _handleActionNameInput(e: Event): void {
    this._newActionName = (e.target as HTMLInputElement).value;

    // Update backend entity
    const nameEntity = this._findEntity("text.", ["webhook", "action_name"]);
    if (nameEntity) {
      this.hass.callService("text", "set_value", {
        entity_id: nameEntity,
        value: this._newActionName,
      });
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="settings-header">
        <button
          class="back-button"
          @click=${this._handleBack}
          aria-label="Back"
        >
          <ha-icon icon="mdi:arrow-left"></ha-icon>
        </button>
        <h1 class="header-title">Webhooks</h1>
      </div>

      <div class="settings-content">
        <!-- Help Text -->
        <div class="help-text">
          <ha-icon icon="mdi:information"></ha-icon>
          <div>
            Configure webhook actions that trigger Home Assistant automations.
            Select an automation to automatically detect and extract webhook IDs.
          </div>
        </div>

        <!-- Add Webhook Form -->
        <div class="settings-group">
          <div class="group-header">Add Webhook</div>

          <div class="add-webhook-form">
            ${!this._entityPickerLoaded
              ? html`<div class="loading-message">Loading picker...</div>`
              : html`
                  <!-- Automation Picker -->
                  <div class="form-row">
                    <label class="form-label">Select Automation</label>
                    <ha-entity-picker
                      .hass=${this.hass}
                      .includeDomains=${["automation"]}
                      .value=${this._selectedAutomation}
                      @value-changed=${this._handleAutomationSelected}
                      ?disabled=${this._loading}
                      label="Choose automation with webhook trigger"
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                `}

            ${this._detectedWebhookIds.length > 0
              ? html`
                  <div class="detected-webhooks">
                    <div class="detected-title">
                      Detected webhook IDs (click to use):
                    </div>
                    ${this._detectedWebhookIds.map(
                      (id) => html`
                        <span
                          class="webhook-chip"
                          @click=${() => this._handleWebhookIdClick(id)}
                          title="Click to use this webhook ID"
                        >
                          ${id}
                        </span>
                      `
                    )}
                  </div>
                `
              : this._selectedAutomation
              ? html`
                  <div class="detected-webhooks">
                    <div class="detected-title">
                      ⚠️ No webhook triggers found in this automation
                    </div>
                  </div>
                `
              : ""}

            <!-- Code Input -->
            <div class="form-row">
              <label class="form-label">Code</label>
              <input
                type="text"
                class="form-input"
                .value=${this._newCode}
                @input=${this._handleCodeInput}
                placeholder="W1"
                ?disabled=${this._loading}
              />
            </div>

            <!-- Action Name Input -->
            <div class="form-row">
              <label class="form-label">Action Name</label>
              <input
                type="text"
                class="form-input"
                .value=${this._newActionName}
                @input=${this._handleActionNameInput}
                placeholder="Front Door Bell"
                ?disabled=${this._loading}
              />
            </div>

            <!-- Add Button -->
            <button
              class="add-button"
              @click=${this._handleAddWebhook}
              ?disabled=${this._loading ||
              !this._selectedAutomation ||
              this._detectedWebhookIds.length === 0 ||
              !this._newCode ||
              !this._newActionName}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              <span>Add Webhook</span>
            </button>
          </div>
        </div>

        <!-- Webhook List -->
        <div class="settings-group">
          <div class="group-header">
            Configured Webhooks (${this._webhooks.length})
          </div>

          ${this._webhooks.length === 0
            ? html`
                <div class="empty-state">
                  <ha-icon icon="mdi:webhook"></ha-icon>
                  <div class="empty-state-title">No Webhooks Configured</div>
                  <div class="empty-state-description">
                    Add a webhook above to trigger automations from your device
                  </div>
                </div>
              `
            : html`
                <div class="webhook-list">
                  ${this._webhooks.map(
                    (webhook) => html`
                      <div class="webhook-item">
                        <div class="webhook-icon">
                          <ha-icon icon="mdi:webhook"></ha-icon>
                        </div>
                        <div class="webhook-info">
                          <div class="webhook-title">
                            ${webhook.action_name || webhook.code}
                          </div>
                          <div class="webhook-details">
                            <span class="webhook-code">Code: ${webhook.code}</span>
                            <span class="webhook-id">ID: ${webhook.webhook_id}</span>
                          </div>
                        </div>
                        <div class="webhook-actions">
                          <button
                            class="delete-button"
                            @click=${() => this._handleDeleteWebhook(webhook)}
                            ?disabled=${this._loading}
                            title="Delete webhook"
                          >
                            <ha-icon icon="mdi:delete"></ha-icon>
                          </button>
                        </div>
                      </div>
                    `
                  )}
                </div>
              `}
        </div>
      </div>

      ${this._loading
        ? html`
            <div class="loading-overlay">
              <ha-circular-progress active></ha-circular-progress>
            </div>
          `
        : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-webhooks-settings": TsuryPhoneWebhooksSettings;
  }
}
