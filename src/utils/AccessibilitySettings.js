/**
 * AccessibilitySettings
 * Manages accessibility features: high contrast, colorblind modes, reduced motion
 * WCAG AA compliant
 */

class AccessibilitySettings {
  constructor() {
    this.prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    this.highContrastMode = false;
    this.colorblindMode = 'none'; // none | deuteranopia | protanopia | tritanopia
    this.focusVisible = true;

    this.loadSettings();
    this.setupMediaQueryListeners();
  }

  /**
   * Setup listeners for media query changes
   */
  setupMediaQueryListeners() {
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    // Modern syntax with addEventListener
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
        this.applySettings();
      });
    } else {
      // Fallback for older browsers
      reducedMotionQuery.addListener((e) => {
        this.prefersReducedMotion = e.matches;
        this.applySettings();
      });
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem('accessibility_settings')
      );
      if (saved) {
        this.highContrastMode = saved.highContrast || false;
        this.colorblindMode = saved.colorblindMode || 'none';
        this.focusVisible = saved.focusVisible !== false; // Default true
      }
    } catch {
      // Use defaults
    }

    this.applySettings();
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(
        'accessibility_settings',
        JSON.stringify({
          highContrast: this.highContrastMode,
          colorblindMode: this.colorblindMode,
          focusVisible: this.focusVisible,
        })
      );
    } catch (err) {
      console.warn('Failed to save accessibility settings:', err);
    }

    this.applySettings();
  }

  /**
   * Apply current settings to document
   */
  applySettings() {
    // Reduced motion
    document.body.classList.toggle(
      'reduced-motion',
      this.prefersReducedMotion
    );

    // High contrast
    document.body.classList.toggle('high-contrast', this.highContrastMode);

    // Colorblind mode
    document.body.dataset.colorblindMode = this.colorblindMode;

    // Focus visibility
    document.body.classList.toggle('focus-visible', this.focusVisible);

    // Emit event for components to react
    this.emit('settingsChanged', this.getSettings());
  }

  /**
   * Get current settings
   * @returns {object} Current accessibility settings
   */
  getSettings() {
    return {
      prefersReducedMotion: this.prefersReducedMotion,
      highContrastMode: this.highContrastMode,
      colorblindMode: this.colorblindMode,
      focusVisible: this.focusVisible,
    };
  }

  /**
   * Toggle high contrast mode
   * @returns {boolean} New state
   */
  toggleHighContrast() {
    this.highContrastMode = !this.highContrastMode;
    this.saveSettings();
    return this.highContrastMode;
  }

  /**
   * Set colorblind mode
   * @param {string} mode - 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'
   */
  setColorblindMode(mode) {
    const validModes = ['none', 'deuteranopia', 'protanopia', 'tritanopia'];
    if (!validModes.includes(mode)) {
      console.warn(`Invalid colorblind mode: ${mode}`);
      return;
    }

    this.colorblindMode = mode;
    this.saveSettings();
  }

  /**
   * Get adjusted colors for current colorblind mode
   * @param {string} originalColor - Original color name
   * @returns {string} Adjusted color
   */
  getAdjustedColor(originalColor) {
    if (this.colorblindMode === 'none' && !this.highContrastMode) {
      return originalColor;
    }

    // High contrast overrides
    if (this.highContrastMode) {
      const highContrastMap = {
        perfect: '#00FF00',
        great: '#FFFF00',
        good: '#FFA500',
        ok: '#FF6600',
        miss: '#FF0000',
      };
      return highContrastMap[originalColor] || originalColor;
    }

    // Colorblind mode adjustments
    const colorblindMaps = {
      deuteranopia: {
        // Red-green colorblindness
        perfect: '#0088FF', // Blue instead of gold
        great: '#FFDD00', // Yellow
        good: '#FF8800', // Orange
        ok: '#FF6600', // Dark orange
        miss: '#FF0066', // Pink-red
      },
      protanopia: {
        // Red-blind
        perfect: '#0088FF', // Blue
        great: '#FFDD00', // Yellow
        good: '#FF8800', // Orange
        ok: '#FF6600', // Dark orange
        miss: '#8800FF', // Purple instead of red
      },
      tritanopia: {
        // Blue-yellow colorblindness
        perfect: '#FF00FF', // Magenta
        great: '#00FFFF', // Cyan
        good: '#FF8800', // Orange
        ok: '#FF6600', // Dark orange
        miss: '#FF0000', // Red
      },
    };

    const colorMap = colorblindMaps[this.colorblindMode];
    return colorMap ? colorMap[originalColor] || originalColor : originalColor;
  }

  /**
   * Check if reduced motion is preferred
   * @returns {boolean} True if reduced motion preferred
   */
  shouldReduceMotion() {
    return this.prefersReducedMotion;
  }

  /**
   * Simple event emitter
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const customEvent = new CustomEvent(`accessibility:${event}`, {
      detail: data,
    });
    document.dispatchEvent(customEvent);
  }

  /**
   * Listen for accessibility events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    document.addEventListener(`accessibility:${event}`, (e) => {
      callback(e.detail);
    });
  }

  /**
   * Get description of current colorblind mode
   * @returns {string} Description
   */
  getColorblindModeDescription() {
    const descriptions = {
      none: 'Standard colors',
      deuteranopia: 'Red-green colorblindness (Deuteranopia)',
      protanopia: 'Red-blind (Protanopia)',
      tritanopia: 'Blue-yellow colorblindness (Tritanopia)',
    };
    return descriptions[this.colorblindMode] || 'Unknown';
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.highContrastMode = false;
    this.colorblindMode = 'none';
    this.focusVisible = true;
    this.saveSettings();
  }
}

export default AccessibilitySettings;
