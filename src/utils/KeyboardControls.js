/**
 * KeyboardControls
 * Full keyboard navigation and game shortcuts
 * Implements WCAG AA keyboard accessibility
 */

const KEY_BINDINGS = {
  Tab: 'navigate',
  Enter: 'confirm',
  ' ': 'pause',
  Escape: 'back',
  r: 'restart',
  R: 'restart',
  m: 'mute',
  M: 'mute',
  h: 'toggleHUD',
  H: 'toggleHUD',
  '1': 'octave1',
  '2': 'octave2',
  '3': 'octave3',
  '4': 'octave4',
  p: 'practice',
  P: 'practice',
  '?': 'help',
};

class KeyboardControls {
  constructor(gameEngine, options = {}) {
    this.gameEngine = gameEngine;
    this.enabled = true;
    this.helpVisible = false;
    this.hudVisible = true;

    this.callbacks = {
      onHelp: options.onHelp || null,
      onHUDToggle: options.onHUDToggle || null,
    };

    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    if (!this.enabled) return;

    const action = KEY_BINDINGS[e.key];
    if (!action) return;

    // Don't prevent Tab (needed for accessibility)
    if (e.key !== 'Tab') {
      e.preventDefault();
    }

    this.handleAction(action, e);
  }

  handleAction(action, event) {
    const state = this.gameEngine?.state || 'idle';

    switch (action) {
      case 'pause':
        if (state === 'playing') {
          this.gameEngine.pause();
          this.announceToScreenReader('Game paused');
        } else if (state === 'paused') {
          this.gameEngine.resume();
          this.announceToScreenReader('Game resumed');
        }
        break;

      case 'back':
        if (state === 'playing') {
          this.gameEngine.pause();
          this.announceToScreenReader('Game paused');
        }
        break;

      case 'restart':
        if (state === 'paused' || state === 'results' || state === 'failed') {
          this.gameEngine.restart();
          this.announceToScreenReader('Restarting game');
        }
        break;

      case 'mute':
        const muted = this.gameEngine.toggleMute();
        this.announceToScreenReader(muted ? 'Audio muted' : 'Audio unmuted');
        break;

      case 'toggleHUD':
        this.hudVisible = !this.hudVisible;
        if (this.callbacks.onHUDToggle) {
          this.callbacks.onHUDToggle(this.hudVisible);
        }
        this.announceToScreenReader(
          this.hudVisible ? 'HUD shown' : 'HUD hidden'
        );
        break;

      case 'help':
        this.helpVisible = !this.helpVisible;
        if (this.callbacks.onHelp) {
          this.callbacks.onHelp(this.helpVisible);
        }
        break;

      case 'practice':
        if (state === 'idle' || state === 'menu') {
          // Trigger practice mode
          const practiceButton = document.getElementById('practice-button');
          if (practiceButton) {
            practiceButton.click();
          }
        }
        break;

      case 'octave1':
      case 'octave2':
      case 'octave3':
      case 'octave4':
        // Handle octave selection (if on octave select screen)
        const octaveNum = action.slice(-1);
        this.handleOctaveSelect(octaveNum);
        break;

      default:
        break;
    }
  }

  handleOctaveSelect(octaveNum) {
    // This would be implemented when octave selection UI is added
    console.log(`Octave ${octaveNum} selected`);
  }

  /**
   * Announce message to screen readers via ARIA live region
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    const announcer =
      document.getElementById('status-announce') ||
      this.createAnnouncer();

    // Clear and set new message
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }

  /**
   * Create ARIA live region for screen reader announcements
   * @returns {HTMLElement} Announcer element
   */
  createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'status-announce';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    return announcer;
  }

  /**
   * Enable keyboard controls
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable keyboard controls
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Get help text for all key bindings
   * @returns {Array} Array of {key, action, description} objects
   */
  getHelpText() {
    return [
      { key: 'Space', action: 'Pause/Resume', description: 'Toggle game pause' },
      { key: 'Esc', action: 'Back', description: 'Pause game or go back' },
      { key: 'R', action: 'Restart', description: 'Restart current challenge' },
      { key: 'M', action: 'Mute', description: 'Toggle audio mute' },
      { key: 'H', action: 'Toggle HUD', description: 'Show/hide game overlay' },
      { key: 'P', action: 'Practice', description: 'Start practice mode' },
      { key: '1-4', action: 'Select Octave', description: 'Quick octave selection' },
      { key: '?', action: 'Help', description: 'Show/hide this help' },
      { key: 'Tab', action: 'Navigate', description: 'Move focus to next element' },
      { key: 'Enter', action: 'Confirm', description: 'Activate focused button' },
    ];
  }

  /**
   * Clean up resources
   */
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export default KeyboardControls;
