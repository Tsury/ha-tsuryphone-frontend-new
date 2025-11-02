import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";
import { QuickDialEntry } from "../../types/tsuryphone";
import { triggerHaptic } from "../../utils/haptics";

type ContactModalMode = "add" | "edit";

interface FormData {
  name: string;
  number: string;
  code: string;
  priority: boolean;
}

interface ValidationErrors {
  name?: string;
  number?: string;
  code?: string;
}

@customElement("tsuryphone-contact-modal")
export class ContactModal extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) mode: ContactModalMode = "add";
  @property({ attribute: false }) contact?: QuickDialEntry;

  @state() private formData: FormData = {
    name: "",
    number: "",
    code: "",
    priority: false,
  };

  @state() private errors: ValidationErrors = {};
  @state() private saving = false;
  @state() private showDeleteConfirm = false;

  static styles = css`
    :host {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
    }

    :host([open]) {
      display: flex;
      flex-direction: column;
    }

    .modal {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--card-background-color, #fff);
      padding: 24px;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .title {
      font-size: 24px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin: 0;
    }

    .close-button {
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
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: var(--divider-color, rgba(0, 0, 0, 0.1));
    }

    .close-button ha-icon {
      --mdc-icon-size: 24px;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-field label {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .form-field label .required {
      color: var(--error-color, #db4437);
    }

    .form-field label .optional {
      color: var(--secondary-text-color);
      font-weight: 400;
      font-size: 12px;
    }

    .form-field input {
      padding: 12px 16px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 12px;
      font-size: 16px;
      font-family: inherit;
      color: var(--primary-text-color);
      background: var(--card-background-color);
      transition: border-color 0.2s;
    }

    .form-field input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .form-field input.error {
      border-color: var(--error-color, #db4437);
    }

    .form-field .error-message {
      font-size: 12px;
      color: var(--error-color, #db4437);
      margin-top: 4px;
    }

    .priority-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }

    .priority-toggle input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: var(--primary-color);
    }

    .priority-toggle label {
      font-size: 16px;
      color: var(--primary-text-color);
      cursor: pointer;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .priority-toggle ha-icon {
      --mdc-icon-size: 20px;
      color: var(--warning-color, #f57c00);
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .actions button {
      flex: 1;
      padding: 14px 24px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .button-cancel {
      background: transparent;
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color, #e0e0e0);
    }

    .button-cancel:hover:not(:disabled) {
      background: var(--divider-color, rgba(0, 0, 0, 0.05));
    }

    .button-save {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }

    .button-save:hover:not(:disabled) {
      opacity: 0.9;
    }

    .button-delete {
      background: var(--error-color, #db4437);
      color: white;
      margin-bottom: 12px;
    }

    .button-delete:hover:not(:disabled) {
      opacity: 0.9;
    }

    .delete-confirm {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .delete-confirm-text {
      font-size: 14px;
      color: var(--primary-text-color);
      margin-bottom: 12px;
    }

    .delete-confirm-actions {
      display: flex;
      gap: 8px;
    }

    .delete-confirm-actions button {
      flex: 1;
      padding: 10px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("open") && this.open) {
      this._initializeForm();
    }
  }

  private _initializeForm() {
    if (this.mode === "edit" && this.contact) {
      this.formData = {
        name: this.contact.name || "",
        number: this.contact.number || "",
        code: this.contact.code || "",
        priority: this._isContactPriority(this.contact),
      };
    } else {
      this.formData = {
        name: "",
        number: "",
        code: "",
        priority: false,
      };
    }
    this.errors = {};
    this.showDeleteConfirm = false;
  }

  private _getPhoneStateId(): string | null {
    // Find the phone_state sensor entity
    return (
      Object.keys(this.hass.states).find(
        (id) =>
          id.includes("tsuryphone") &&
          id.includes("phone_state") &&
          this.hass.states[id].entity_id.includes("sensor")
      ) || null
    );
  }

  private _isContactPriority(contact: QuickDialEntry): boolean {
    const phoneStateId = this._getPhoneStateId();
    if (!phoneStateId) return false;

    const phoneState = this.hass.states[phoneStateId];
    const priorityCallers = phoneState?.attributes?.priority_callers || [];
    return priorityCallers.some((p: any) => p.number === contact.number);
  }

  private _handleClose() {
    if (this.saving) return;
    triggerHaptic("light");
    this.open = false;
    this.dispatchEvent(new CustomEvent("close"));
  }

  private _handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const field = input.name as keyof FormData;

    if (field === "priority") {
      this.formData = { ...this.formData, [field]: input.checked };
    } else {
      this.formData = { ...this.formData, [field]: input.value };
    }

    // Clear error for this field
    if (this.errors[field as keyof ValidationErrors]) {
      this.errors = { ...this.errors, [field]: undefined };
    }
  }

  private _validate(): boolean {
    const errors: ValidationErrors = {};

    // Name validation
    if (!this.formData.name.trim()) {
      errors.name = "Name is required";
    }

    // Number validation
    if (!this.formData.number.trim()) {
      errors.number = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(this.formData.number)) {
      errors.number = "Invalid phone number format";
    }

    // Code validation (uniqueness check if provided)
    if (this.formData.code.trim()) {
      const phoneStateId = this._getPhoneStateId();
      if (phoneStateId) {
        const phoneState = this.hass.states[phoneStateId];
        const quickDials = phoneState?.attributes?.quick_dials || [];
        const isDuplicate = quickDials.some(
          (qd: QuickDialEntry) =>
            qd.code === this.formData.code.trim() &&
            (this.mode === "add" || qd.id !== this.contact?.id)
        );
        if (isDuplicate) {
          errors.code = "This code is already in use";
        }
      }
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private async _handleSave() {
    if (!this._validate()) {
      triggerHaptic("heavy");
      return;
    }

    this.saving = true;
    triggerHaptic("medium");

    try {
      if (this.mode === "edit" && this.contact) {
        // Edit mode: delete old + add new
        await this._deleteContact(this.contact.id);
        await this._addContact();
      } else {
        // Add mode
        await this._addContact();
      }

      // Handle priority changes
      await this._handlePriorityChange();

      triggerHaptic("medium");
      this.open = false;
      this.dispatchEvent(
        new CustomEvent("contact-saved", {
          detail: { mode: this.mode },
        })
      );
    } catch (error) {
      console.error("Error saving contact:", error);
      triggerHaptic("heavy");
      this.dispatchEvent(
        new CustomEvent("error", {
          detail: { message: "Failed to save contact" },
        })
      );
    } finally {
      this.saving = false;
    }
  }

  private async _addContact() {
    const serviceData: any = {
      number: this.formData.number.trim(),
      name: this.formData.name.trim(),
    };

    if (this.formData.code.trim()) {
      serviceData.code = this.formData.code.trim();
    }

    await this.hass.callService("tsuryphone", "quick_dial_add", serviceData);
  }

  private async _deleteContact(id: string) {
    await this.hass.callService("tsuryphone", "quick_dial_remove", { id });
  }

  private async _handlePriorityChange() {
    const wasPriority =
      this.mode === "edit" && this.contact
        ? this._isContactPriority(this.contact)
        : false;
    const isPriority = this.formData.priority;

    if (isPriority && !wasPriority) {
      // Add to priority
      await this.hass.callService("tsuryphone", "priority_add", {
        number: this.formData.number.trim(),
      });
    } else if (!isPriority && wasPriority && this.contact) {
      // Remove from priority - need to find the priority entry ID
      const phoneStateId = this._getPhoneStateId();
      if (phoneStateId) {
        const phoneState = this.hass.states[phoneStateId];
        const priorityCallers = phoneState?.attributes?.priority_callers || [];
        const priorityEntry = priorityCallers.find(
          (p: any) => p.number === this.contact!.number
        );
        if (priorityEntry) {
          await this.hass.callService("tsuryphone", "priority_remove", {
            id: priorityEntry.id,
          });
        }
      }
    }
  }

  private _handleDeleteClick() {
    triggerHaptic("medium");
    this.showDeleteConfirm = true;
  }

  private _handleDeleteCancel() {
    triggerHaptic("light");
    this.showDeleteConfirm = false;
  }

  private async _handleDeleteConfirm() {
    if (!this.contact) return;

    this.saving = true;
    triggerHaptic("heavy");

    try {
      await this._deleteContact(this.contact.id);

      // Also remove from priority if it's a priority contact
      if (this._isContactPriority(this.contact)) {
        const phoneStateId = this._getPhoneStateId();
        if (phoneStateId) {
          const phoneState = this.hass.states[phoneStateId];
          const priorityCallers =
            phoneState?.attributes?.priority_callers || [];
          const priorityEntry = priorityCallers.find(
            (p: any) => p.number === this.contact!.number
          );
          if (priorityEntry) {
            await this.hass.callService("tsuryphone", "priority_remove", {
              id: priorityEntry.id,
            });
          }
        }
      }

      this.open = false;
      this.dispatchEvent(
        new CustomEvent("contact-deleted", {
          detail: { id: this.contact.id },
        })
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
      triggerHaptic("heavy");
      this.dispatchEvent(
        new CustomEvent("error", {
          detail: { message: "Failed to delete contact" },
        })
      );
    } finally {
      this.saving = false;
    }
  }

  protected render(): TemplateResult {
    if (!this.open) return html``;

    const title = this.mode === "add" ? "Add Contact" : "Edit Contact";

    return html`
      <div class="modal">
        <div class="header">
          <h2 class="title">${title}</h2>
          <button
            class="close-button"
            @click=${this._handleClose}
            ?disabled=${this.saving}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

          ${this.showDeleteConfirm
            ? html`
                <div class="delete-confirm">
                  <div class="delete-confirm-text">
                    Are you sure you want to delete this contact? This action
                    cannot be undone.
                  </div>
                  <div class="delete-confirm-actions">
                    <button
                      @click=${this._handleDeleteCancel}
                      ?disabled=${this.saving}
                    >
                      Cancel
                    </button>
                    <button
                      class="button-delete"
                      @click=${this._handleDeleteConfirm}
                      ?disabled=${this.saving}
                    >
                      ${this.saving
                        ? html`<div class="spinner"></div>`
                        : "Delete"}
                    </button>
                  </div>
                </div>
              `
            : ""}

          <div class="form">
            <div class="form-field">
              <label>
                Name <span class="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                .value=${this.formData.name}
                @input=${this._handleInputChange}
                class=${this.errors.name ? "error" : ""}
                ?disabled=${this.saving}
                placeholder="Contact name"
              />
              ${this.errors.name
                ? html`<div class="error-message">${this.errors.name}</div>`
                : ""}
            </div>

            <div class="form-field">
              <label>
                Phone Number <span class="required">*</span>
              </label>
              <input
                type="tel"
                name="number"
                .value=${this.formData.number}
                @input=${this._handleInputChange}
                class=${this.errors.number ? "error" : ""}
                ?disabled=${this.saving}
                placeholder="+1234567890"
              />
              ${this.errors.number
                ? html`<div class="error-message">${this.errors.number}</div>`
                : ""}
            </div>

            <div class="form-field">
              <label>
                Quick Dial Code <span class="optional">(optional)</span>
              </label>
              <input
                type="text"
                name="code"
                .value=${this.formData.code}
                @input=${this._handleInputChange}
                class=${this.errors.code ? "error" : ""}
                ?disabled=${this.saving}
                placeholder="e.g., 1, 2, mom, work"
              />
              ${this.errors.code
                ? html`<div class="error-message">${this.errors.code}</div>`
                : ""}
            </div>

            <div class="priority-toggle">
              <input
                type="checkbox"
                name="priority"
                id="priority-checkbox"
                .checked=${this.formData.priority}
                @change=${this._handleInputChange}
                ?disabled=${this.saving}
              />
              <label for="priority-checkbox">
                <ha-icon icon="mdi:star"></ha-icon>
                Priority Contact
              </label>
            </div>
          </div>

          ${this.mode === "edit" && !this.showDeleteConfirm
            ? html`
                <button
                  class="button-delete"
                  @click=${this._handleDeleteClick}
                  ?disabled=${this.saving}
                  style="width: 100%; margin-top: 24px;"
                >
                  <ha-icon icon="mdi:delete"></ha-icon>
                  Delete Contact
                </button>
              `
            : ""}

          <div class="actions">
            <button
              class="button-cancel"
              @click=${this._handleClose}
              ?disabled=${this.saving}
            >
              Cancel
            </button>
            <button
              class="button-save"
              @click=${this._handleSave}
              ?disabled=${this.saving}
            >
              ${this.saving
                ? html`<div class="spinner"></div>`
                : this.mode === "add"
                ? "Add Contact"
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-contact-modal": ContactModal;
  }
}
