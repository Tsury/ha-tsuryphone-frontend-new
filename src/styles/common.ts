import { css } from 'lit';

/**
 * Common utility styles used across components
 */
export const commonStyles = css`
  * {
    box-sizing: border-box;
  }

  .flex {
    display: flex;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flex-1 {
    flex: 1;
  }

  .text-center {
    text-align: center;
  }

  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clickable {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .disabled {
    opacity: 0.38;
    pointer-events: none;
  }

  .hidden {
    display: none !important;
  }

  .scrollable {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .scrollable::-webkit-scrollbar {
    width: 8px;
  }

  .scrollable::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.3);
    border-radius: 4px;
  }

  .scrollable::-webkit-scrollbar-thumb:hover {
    background-color: rgba(128, 128, 128, 0.5);
  }

  /* Fade animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  .fade-in {
    animation: fadeIn var(--tsury-transition-duration) var(--tsury-transition-timing);
  }

  .fade-out {
    animation: fadeOut var(--tsury-transition-duration) var(--tsury-transition-timing);
  }

  .slide-in-up {
    animation: slideInUp var(--tsury-transition-duration) var(--tsury-transition-timing);
  }

  .slide-out-down {
    animation: slideOutDown var(--tsury-transition-duration) var(--tsury-transition-timing);
  }
`;
