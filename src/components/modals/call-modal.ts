/**
 * Call Modal Component
 * Full-screen in-card modal for incoming and active calls
 * Similar to contact-modal - position: absolute, fills entire card
 */

import { LitElement, html, css, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant } from "../../types/homeassistant";
import { triggerHaptic } from "../../utils/haptics";
import { normalizePhoneNumberForDisplay } from "../../utils/formatters";

export type CallModalMode = "incoming" | "active" | "waiting";

export interface CallInfo {
  number: string;
  name?: string;
  isPriority?: boolean;
  isIncoming: boolean;
  duration?: number; // seconds
  audioOutput?: "earpiece" | "speaker" | "bluetooth";
}

export interface WaitingCallInfo {
  number: string;
  name?: string;
  isPriority?: boolean;
}

@customElement("tsuryphone-call-modal")
export class TsuryPhoneCallModal extends LitElement {
  @property({ type: Object }) hass!: HomeAssistant;
  @property({ type: String }) entityId?: string; // Phone state entity ID for service targeting
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) mode: CallModalMode = "incoming";
  @property({ type: Object }) callInfo?: CallInfo;
  @property({ type: Object }) waitingCall?: WaitingCallInfo;
  @property({ type: Boolean }) callWaitingAvailable = false;

  @state() private _isAnswering = false;
  @state() private _isDeclining = false;
  @state() private _isMuted = false;
  @state() private _showKeypad = false;
  @state() private _swipeStartX = 0;
  @state() private _swipeDistance = 0;
  @state() private _isSwipingLeft = false;
  @state() private _isSwipingRight = false;

  static override styles: CSSResultGroup = css`
    :host {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
      background: var(--card-background-color);
      box-sizing: border-box;
    }

    :host([open]) {
      display: flex;
      flex-direction: column;
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

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--divider-color);
      background: var(--card-background-color);
    }

    .modal-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--primary-text-color);
      font-size: 18px;
      line-height: 1;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .close-button:hover {
      opacity: 1;
    }

    .modal-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-y: auto;
      box-sizing: border-box;
    }

    /* Incoming Call UI */
    .caller-info {
      text-align: center;
      margin-bottom: 48px;
    }

    .caller-name {
      font-size: 32px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 8px;
    }

    .caller-number {
      font-size: 18px;
      color: var(--secondary-text-color);
    }

    .priority-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: var(--warning-color);
      color: var(--text-primary-color, white);
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 12px;
    }

    .call-status {
      font-size: 16px;
      color: var(--secondary-text-color);
      margin-bottom: 24px;
    }

    /* Swipe Slider */
    .swipe-slider {
      width: 100%;
      max-width: 320px;
      height: 72px;
      background: var(--divider-color);
      border-radius: 36px;
      position: relative;
      overflow: hidden;
      touch-action: none;
      user-select: none;
    }

    .swipe-track {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
    }

    .swipe-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      pointer-events: none;
    }

    .swipe-handle {
      position: absolute;
      top: 6px;
      left: 6px;
      width: 60px;
      height: 60px;
      background: var(--card-background-color);
      border-radius: 30px;
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      transition:
        transform 0.2s ease-out,
        background-color 0.2s;
      z-index: 2;
    }

    .swipe-handle:active {
      cursor: grabbing;
    }

    .swipe-handle.swiping-left {
      background: var(--error-color);
    }

    .swipe-handle.swiping-right {
      background: var(--success-color);
    }

    /* Active Call Controls */
    .call-timer {
      font-size: 48px;
      font-weight: 300;
      color: var(--primary-text-color);
      margin-bottom: 48px;
      font-variant-numeric: tabular-nums;
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .call-controls {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      width: 100%;
      max-width: 400px;
      margin-bottom: 24px;
    }

    .control-button {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: none;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
      justify-self: center;
    }

    .control-button ha-icon {
      --mdc-icon-size: 28px;
    }

    .control-button:hover {
      background: var(--divider-color);
    }

    .control-button:active {
      transform: scale(0.95);
    }

    .control-button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .hangup-button {
      grid-column: 1 / -1;
      width: 120px;
      height: 56px;
      background: var(--error-color);
      color: var(--text-primary-color, white);
      justify-self: center;
      border-radius: 28px;
      margin-top: 12px;
    }

    .hangup-button:hover {
      filter: brightness(0.9);
    }

    /* Call Waiting */
    .waiting-call {
      width: 100%;
      max-width: 400px;
      padding: 16px;
      background: var(--secondary-background-color);
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .waiting-call-info {
      text-align: center;
      margin-bottom: 12px;
    }

    .waiting-call-name {
      font-size: 18px;
      font-weight: 500;
      color: var(--primary-text-color, #000);
    }

    .waiting-call-number {
      font-size: 14px;
      color: var(--secondary-text-color, #666);
    }

    .waiting-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .waiting-action-button {
      padding: 8px 16px;
      border-radius: 20px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .swap-button {
      background: var(--primary-color, #03a9f4);
      color: white;
    }

    .merge-button {
      background: var(--success-color, #4caf50);
      color: white;
    }

    /* Loading State */
    .loading {
      opacity: 0.6;
      pointer-events: none;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  override willUpdate(changedProps: Map<string, any>): void {
    super.willUpdate(changedProps);
    
    // Sync mute state from HA entity
    if (this.entityId && this.hass?.states[this.entityId]) {
      const phoneState = this.hass.states[this.entityId];
      const isMuted = phoneState.attributes?.is_muted ?? false;
      if (isMuted !== this._isMuted) {
        this._isMuted = isMuted;
      }
    }
  }

  private _formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  private _handleClose(): void {
    triggerHaptic("selection");
    this.dispatchEvent(
      new CustomEvent("close", { bubbles: true, composed: true })
    );
  }

  private _handleSwipeStart(e: TouchEvent): void {
    this._swipeStartX = e.touches[0].clientX;
    this._swipeDistance = 0;
  }

  private _handleSwipeMove(e: TouchEvent): void {
    if (this._isAnswering || this._isDeclining) return;

    const currentX = e.touches[0].clientX;
    this._swipeDistance = currentX - this._swipeStartX;

    // Limit swipe distance
    const maxDistance = 200;
    this._swipeDistance = Math.max(
      -maxDistance,
      Math.min(maxDistance, this._swipeDistance)
    );

    // Update visual state
    this._isSwipingLeft = this._swipeDistance < -50;
    this._isSwipingRight = this._swipeDistance > 50;

    this.requestUpdate();
  }

  private _handleSwipeEnd(): void {
    const threshold = 120;

    if (this._swipeDistance < -threshold) {
      // Swipe left to decline
      this._handleDecline();
    } else if (this._swipeDistance > threshold) {
      // Swipe right to answer
      this._handleAnswer();
    }

    // Reset swipe state
    this._swipeDistance = 0;
    this._isSwipingLeft = false;
    this._isSwipingRight = false;
    this.requestUpdate();
  }

  private async _handleAnswer(): Promise<void> {
    this._isAnswering = true;
    triggerHaptic("medium");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "answer_call",
        {},
        { entity_id: this.entityId }
      );
      this.dispatchEvent(
        new CustomEvent("call-answered", { bubbles: true, composed: true })
      );
    } catch (error) {
      console.error("Failed to answer call:", error);
      triggerHaptic("failure");
      this.dispatchEvent(
        new CustomEvent("error", {
          detail: { message: "Failed to answer call" },
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._isAnswering = false;
    }
  }

  private async _handleDecline(): Promise<void> {
    this._isDeclining = true;
    triggerHaptic("medium");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "hangup",
        {},
        { entity_id: this.entityId }
      );
      this.dispatchEvent(
        new CustomEvent("call-declined", { bubbles: true, composed: true })
      );
    } catch (error) {
      console.error("Failed to decline call:", error);
      triggerHaptic("failure");
      this.dispatchEvent(
        new CustomEvent("error", {
          detail: { message: "Failed to decline call" },
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._isDeclining = false;
    }
  }

  private async _handleHangup(): Promise<void> {
    triggerHaptic("medium");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "hangup",
        {},
        { entity_id: this.entityId }
      );
      this.dispatchEvent(
        new CustomEvent("call-ended", { bubbles: true, composed: true })
      );
    } catch (error) {
      console.error("Failed to hang up:", error);
      triggerHaptic("failure");
    }
  }

  private async _handleMute(): Promise<void> {
    triggerHaptic("selection");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "toggle_mute",
        {},
        { entity_id: this.entityId }
      );
      // State will be updated via HA state changes
    } catch (error) {
      console.error("Failed to toggle mute:", error);
      triggerHaptic("failure");
    }
  }

  private async _handleSpeaker(): Promise<void> {
    triggerHaptic("selection");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "toggle_volume_mode",
        {},
        { entity_id: this.entityId }
      );
    } catch (error) {
      console.error("Failed to toggle speaker:", error);
    }
  }

  private _handleKeypad(): void {
    triggerHaptic("selection");
    this._showKeypad = !this._showKeypad;
    this.requestUpdate();
  }

  /**
   * Get normalized phone number for display
   */
  private _getNormalizedNumber(number: string): string {
    if (!this.entityId) {
      return number;
    }
    
    const phoneStateEntity = this.hass.states[this.entityId];
    const dialingContext = phoneStateEntity?.attributes?.dialing_context;
    const defaultDialCode = dialingContext?.default_code || "";
    
    const normalized = normalizePhoneNumberForDisplay(number, defaultDialCode);
    
    return normalized;
  }

  private async _handleSwapCalls(): Promise<void> {
    triggerHaptic("medium");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "swap_calls",
        {},
        { entity_id: this.entityId }
      );
    } catch (error) {
      console.error("Failed to swap calls:", error);
    }
  }

  private async _handleMergeCalls(): Promise<void> {
    triggerHaptic("medium");

    try {
      if (!this.entityId) {
        throw new Error("Entity ID is required");
      }
      await this.hass.callService(
        "tsuryphone",
        "merge_calls",
        {},
        { entity_id: this.entityId }
      );
    } catch (error) {
      console.error("Failed to merge calls:", error);
    }
  }

  private _renderIncomingCall(): TemplateResult {
    const { callInfo } = this;
    if (!callInfo) return html``;

    const displayNumber = this._getNormalizedNumber(callInfo.number);

    return html`
      <div class="caller-info">
        <div class="caller-name">${callInfo.name || displayNumber}</div>
        ${callInfo.name
          ? html`<div class="caller-number">${displayNumber}</div>`
          : ""}
        ${callInfo.isPriority
          ? html` <div class="priority-badge">⭐ Priority Caller</div> `
          : ""}
      </div>

      <div class="call-status">Incoming call...</div>

      <div
        class="swipe-slider"
        @touchstart=${this._handleSwipeStart}
        @touchmove=${this._handleSwipeMove}
        @touchend=${this._handleSwipeEnd}
      >
        <div class="swipe-track">
          <span class="swipe-label">Decline</span>
          <span class="swipe-label">Answer</span>
        </div>
        <div
          class="swipe-handle ${this._isSwipingLeft
            ? "swiping-left"
            : ""} ${this._isSwipingRight ? "swiping-right" : ""}"
          style="transform: translateX(${this._swipeDistance}px)"
        >
          ${this._isSwipingLeft
            ? html`<ha-icon icon="mdi:close"></ha-icon>`
            : this._isSwipingRight
              ? html`<ha-icon icon="mdi:check"></ha-icon>`
              : html`<ha-icon icon="mdi:phone"></ha-icon>`}
        </div>
      </div>
    `;
  }

  private _renderActiveCall(): TemplateResult {
    const { callInfo } = this;
    if (!callInfo) return html``;

  const isSpeaker = callInfo.audioOutput === "speaker";

  // Check phone state to determine if we're dialing
  const phoneState = this.entityId ? this.hass.states[this.entityId]?.state : null;
  const isDialing = phoneState === "Dialing";

  // Use backend duration directly - simple and robust
  const duration = callInfo.duration ?? 0;
  const formattedDuration = this._formatDuration(duration);
  const callTimerAriaLabel = isDialing ? "Dialing" : formattedDuration;

  const displayNumber = this._getNormalizedNumber(callInfo.number);

    return html`
      <div class="caller-info">
        <div class="caller-name">${callInfo.name || displayNumber}</div>
        ${callInfo.name
          ? html`<div class="caller-number">${displayNumber}</div>`
          : ""}
      </div>

      <div class="call-timer" aria-live="polite" aria-label=${callTimerAriaLabel}>
        ${isDialing ? html`&nbsp;` : formattedDuration}
      </div>

      ${this.callWaitingAvailable && this.waitingCall
        ? this._renderWaitingCall()
        : ""}

      <div class="call-controls">
        <button
          class="control-button ${this._isMuted ? "active" : ""}"
          @click=${this._handleMute}
          title="Mute"
          style="visibility: ${isDialing ? 'hidden' : 'visible'}"
          aria-pressed=${this._isMuted}
        >
          <ha-icon icon="mdi:microphone-off"></ha-icon>
        </button>

        <button
          class="control-button ${this._showKeypad ? "active" : ""}"
          @click=${this._handleKeypad}
          title="Keypad"
          style="visibility: ${isDialing ? 'hidden' : 'visible'}"
          aria-pressed=${this._showKeypad}
        >
          <ha-icon icon="mdi:dialpad"></ha-icon>
        </button>

        <button
          class="control-button ${isSpeaker ? "active" : ""}"
          @click=${this._handleSpeaker}
          title="Speaker"
          style="visibility: ${isDialing ? 'hidden' : 'visible'}"
          aria-pressed=${isSpeaker}
        >
          <ha-icon icon="${isSpeaker ? "mdi:volume-high" : "mdi:phone"}"></ha-icon>
        </button>

        <button
          class="control-button hangup-button"
          @click=${this._handleHangup}
          title="Hang up"
        >
          <ha-icon icon="mdi:phone-hangup"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderWaitingCall(): TemplateResult {
    const { waitingCall } = this;
    if (!waitingCall) return html``;

    const displayNumber = this._getNormalizedNumber(waitingCall.number);

    return html`
      <div class="waiting-call">
        <div class="waiting-call-info">
          <div class="waiting-call-name">
            ${waitingCall.name || displayNumber}
          </div>
          ${waitingCall.name
            ? html`<div class="waiting-call-number">${displayNumber}</div>`
            : ""}
          ${waitingCall.isPriority
            ? html`<div class="priority-badge">⭐ Priority</div>`
            : ""}
        </div>
        <div class="waiting-actions">
          <button
            class="waiting-action-button swap-button"
            @click=${this._handleSwapCalls}
          >
            Swap
          </button>
          <button
            class="waiting-action-button merge-button"
            @click=${this._handleMergeCalls}
          >
            Merge
          </button>
        </div>
      </div>
    `;
  }

  override render(): TemplateResult {
    const titleMap = {
      incoming: "Incoming Call",
      active: "Active Call",
      waiting: "Call Waiting",
    };

    return html`
      <div class="modal-header">
        <h2 class="modal-title">${titleMap[this.mode]}</h2>
        <button
          class="close-button"
          @click=${this._handleClose}
          title="Minimize"
        >
          −
        </button>
      </div>

      <div
        class="modal-content ${this._isAnswering || this._isDeclining
          ? "loading"
          : ""}"
      >
        ${this.mode === "incoming"
          ? this._renderIncomingCall()
          : this._renderActiveCall()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tsuryphone-call-modal": TsuryPhoneCallModal;
  }
}
