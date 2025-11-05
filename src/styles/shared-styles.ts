/**
 * Shared Styles
 * Reusable CSS patterns for TsuryPhone components
 */

import { css } from "lit";

/**
 * Common avatar styles
 */
export const avatarStyles = css`
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 16px;
    color: white;
    flex-shrink: 0;
  }

  .avatar.large {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }

  .avatar.small {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

/**
 * Common list item styles
 */
export const listItemStyles = css`
  .list-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 12px;
    background: var(--card-background-color);
    border-bottom: 1px solid var(--divider-color);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .list-item:hover {
    background: var(--secondary-background-color);
  }

  .list-item:active {
    background: var(--divider-color);
  }

  .list-item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .list-item-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-subtitle {
    font-size: 14px;
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .list-item-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
`;

/**
 * Common button styles
 */
export const buttonStyles = css`
  .action-button {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: var(--primary-color);
    color: var(--text-primary-color, white);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: var(--dark-primary-color, var(--primary-color));
    transform: scale(1.02);
  }

  .action-button:active {
    transform: scale(0.98);
  }

  .action-button:disabled {
    background: var(--disabled-color);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-button.secondary {
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
  }

  .action-button.danger {
    background: var(--error-color);
    color: var(--text-primary-color, white);
  }

  .icon-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .icon-button:hover {
    background: var(--secondary-background-color);
  }

  .icon-button:active {
    background: var(--divider-color);
    transform: scale(0.95);
  }
`;

/**
 * Common modal styles
 */
export const modalStyles = css`
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.5));
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal {
    background: var(--card-background-color);
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(
      --ha-card-box-shadow,
      0 8px 32px rgba(0, 0, 0, 0.3)
    );
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--divider-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--divider-color);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
`;

/**
 * Common form styles
 */
export const formStyles = css`
  .form-field {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    color: var(--primary-text-color);
    background: var(--card-background-color);
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .form-input::placeholder {
    color: var(--secondary-text-color);
  }

  .form-helper {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .form-error {
    font-size: 12px;
    color: var(--error-color);
    margin-top: 4px;
  }
`;

/**
 * Common empty state styles
 */
export const emptyStateStyles = css`
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    text-align: center;
  }

  .empty-state-icon {
    width: 64px;
    height: 64px;
    color: var(--secondary-text-color);
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 8px;
  }

  .empty-state-message {
    font-size: 14px;
    color: var(--secondary-text-color);
    margin-bottom: 24px;
  }
`;
