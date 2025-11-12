/**
 * Block Number Modal Component
 * Modal for adding a phone number to the blocked list
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from '../../types/homeassistant';
import { TsuryPhoneCardConfig } from '../../types/tsuryphone.d';
import { triggerHaptic } from '../../utils/haptics';

interface FormData {
  number: string;
  name: string;
}

interface ValidationErrors {
  number?: string;
  name?: string;
}

@customElement('tsuryphone-block-number-modal')
export class BlockNumberModal extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) config!: TsuryPhoneCardConfig;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) prefillNumber?: string;
  @property({ type: String }) prefillName?: string;

  @state() private formData: FormData = {
    number: '',
    name: '',
  };

  @state() private errors: ValidationErrors = {};
  @state() private saving = false;

  updated(changedProperties: Map<string, any>): void {
    if (changedProperties.has('open') && this.open) {
      // Reset form when opening
      this.formData = {
        number: this.prefillNumber || '',
        name: this.prefillName || '',
      };
      this.errors = {};
      this.saving = false;
    }
  }

  private _handleClose(): void {
    if (this.saving) return;
    triggerHaptic('light');
    this.dispatchEvent(
      new CustomEvent('close-modal', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleInputChange(field: keyof FormData, value: string): void {
    this.formData = { ...this.formData, [field]: value };
    // Clear error for this field
    if (this.errors[field]) {
      this.errors = { ...this.errors, [field]: undefined };
    }
  }

  private _validate(): boolean {
    const errors: ValidationErrors = {};

    if (!this.formData.number.trim()) {
      errors.number = 'Phone number is required';
    }

    // Basic phone number validation (must contain digits)
    if (this.formData.number && !/\d/.test(this.formData.number)) {
      errors.number = 'Must contain at least one digit';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  private async _handleSave(): Promise<void> {
    if (!this._validate()) {
      triggerHaptic('heavy');
      return;
    }

    this.saving = true;
    triggerHaptic('medium');

    const deviceIdPrefix = this.config?.device_id || '';
    const phoneStateEntityId = deviceIdPrefix
      ? `sensor.${deviceIdPrefix}_phone_state`
      : `sensor.phone_state`;

    try {
      await this.hass.callService(
        'tsuryphone',
        'blocked_add',
        {
          number: this.formData.number.trim(),
          name: this.formData.name.trim() || undefined,
        },
        { entity_id: phoneStateEntityId }
      );

      triggerHaptic('medium');
      this._handleClose();
    } catch (err) {
      console.error('Failed to add blocked number:', err);
      triggerHaptic('heavy');
      this.errors = {
        number: 'Failed to add blocked number. Please try again.',
      };
    } finally {
      this.saving = false;
    }
  }

  render(): TemplateResult {
    return html`
      <div class="modal">
        <div class="header">
          <h2 class="title">Block Number</h2>
          <button
            class="close-button"
            @click=${this._handleClose}
            ?disabled=${this.saving}
            aria-label="Close"
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <form class="form" @submit=${(e: Event) => e.preventDefault()}>
          ${this._renderField(
            'number',
            'Phone Number',
            'text',
            '0541234567',
            true
          )}
          ${this._renderField(
            'name',
            'Name',
            'text',
            'Telemarketer',
            false
          )}

          <div class="actions">
            <button
              type="button"
              class="button button-secondary"
              @click=${this._handleClose}
              ?disabled=${this.saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="button button-primary"
              @click=${this._handleSave}
              ?disabled=${this.saving}
            >
              ${this.saving ? 'Blocking...' : 'Block Number'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private _renderField(
    field: keyof FormData,
    label: string,
    type: string,
    placeholder: string,
    required: boolean
  ): TemplateResult {
    const value = this.formData[field];
    const error = this.errors[field];

    return html`
      <div class="form-field ${error ? 'has-error' : ''}">
        <label>
          ${label}
          ${required
            ? html`<span class="required">*</span>`
            : html`<span class="optional">(optional)</span>`}
        </label>
        <input
          type=${type}
          .value=${value}
          placeholder=${placeholder}
          ?disabled=${this.saving}
          @input=${(e: Event) =>
            this._handleInputChange(
              field,
              (e.target as HTMLInputElement).value
            )}
        />
        ${error ? html`<span class="error-message">${error}</span>` : ''}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
      box-sizing: border-box;
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
      box-sizing: border-box;
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

    .close-button:active {
      transform: scale(0.95);
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

    .form-field.has-error input {
      border-color: var(--error-color, #db4437);
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
      border-color: var(--primary-color, #03a9f4);
    }

    .form-field input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      font-size: 12px;
      color: var(--error-color, #db4437);
      margin-top: 4px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .button {
      flex: 1;
      padding: 14px 24px;
      border-radius: 12px;
      border: none;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .button-secondary {
      background: var(--divider-color, #e0e0e0);
      color: var(--primary-text-color);
    }

    .button-secondary:hover:not(:disabled) {
      background: var(--secondary-background-color, #d0d0d0);
    }

    .button-primary {
      background: var(--error-color, #f44336);
      color: white;
    }

    .button-primary:hover:not(:disabled) {
      background: var(--error-color-dark, #d32f2f);
      transform: translateY(-1px);
      opacity: 0.9;
    }

    .button-primary:active:not(:disabled) {
      transform: translateY(0);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'tsuryphone-block-number-modal': BlockNumberModal;
  }
}
