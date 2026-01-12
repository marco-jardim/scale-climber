/**
 * StateRecovery
 * Manages session persistence and high score tracking using browser storage
 */

const SESSION_KEY = 'scale-climber-session';
const HIGH_SCORES_KEY = 'scale-climber-high-scores';
const SETTINGS_KEY = 'scale-climber-settings';

class StateRecovery {
  constructor() {
    this.hasSessionStorage = this.checkStorageAvailability('sessionStorage');
    this.hasLocalStorage = this.checkStorageAvailability('localStorage');
  }

  /**
   * Check if storage is available
   * @param {string} type - 'localStorage' or 'sessionStorage'
   * @returns {boolean}
   */
  checkStorageAvailability(type) {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save current session state
   * @param {object} sessionData - Game session data
   * @returns {boolean} Success
   */
  saveSession(sessionData) {
    if (!this.hasSessionStorage) return false;

    try {
      const data = {
        ...sessionData,
        timestamp: Date.now(),
        version: '1.0',
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }

  /**
   * Load saved session
   * @returns {object|null} Session data or null
   */
  loadSession() {
    if (!this.hasSessionStorage) return null;

    try {
      const data = sessionStorage.getItem(SESSION_KEY);
      if (!data) return null;

      const session = JSON.parse(data);

      // Validate session age (expire after 1 hour)
      const age = Date.now() - session.timestamp;
      if (age > 60 * 60 * 1000) {
        this.clearSession();
        return null;
      }

      // Validate required fields
      if (!session.mode || !session.config) {
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  /**
   * Clear current session
   */
  clearSession() {
    if (!this.hasSessionStorage) return;

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if there's a saved session
   * @returns {boolean}
   */
  hasSession() {
    if (!this.hasSessionStorage) return false;

    const session = this.loadSession();
    return session !== null;
  }

  /**
   * Save high score
   * @param {number} score - Final score
   * @param {string} grade - Grade achieved
   * @param {object} metadata - Additional metadata (optional)
   * @returns {boolean} Is new high score
   */
  saveHighScore(score, grade, metadata = {}) {
    if (!this.hasLocalStorage) return false;

    try {
      const scores = this.getHighScores();

      const newScore = {
        score,
        grade,
        timestamp: Date.now(),
        date: new Date().toISOString(),
        ...metadata,
      };

      scores.push(newScore);

      // Sort by score descending
      scores.sort((a, b) => b.score - a.score);

      // Keep top 10 scores
      const topScores = scores.slice(0, 10);

      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(topScores));

      // Return true if this is a top 10 score
      return topScores.some((s) => s.timestamp === newScore.timestamp);
    } catch (error) {
      console.error('Failed to save high score:', error);
      return false;
    }
  }

  /**
   * Get high scores
   * @returns {Array} Array of high scores
   */
  getHighScores() {
    if (!this.hasLocalStorage) return [];

    try {
      const data = localStorage.getItem(HIGH_SCORES_KEY);
      if (!data) return [];

      const scores = JSON.parse(data);
      return Array.isArray(scores) ? scores : [];
    } catch (error) {
      console.error('Failed to load high scores:', error);
      return [];
    }
  }

  /**
   * Get personal best score
   * @returns {number} Highest score or 0
   */
  getPersonalBest() {
    const scores = this.getHighScores();
    if (scores.length === 0) return 0;
    return scores[0].score;
  }

  /**
   * Clear all high scores
   */
  clearHighScores() {
    if (!this.hasLocalStorage) return;

    try {
      localStorage.removeItem(HIGH_SCORES_KEY);
    } catch (error) {
      console.error('Failed to clear high scores:', error);
    }
  }

  /**
   * Save user settings
   * @param {object} settings - User settings
   */
  saveSettings(settings) {
    if (!this.hasLocalStorage) return;

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Load user settings
   * @returns {object} Settings object
   */
  loadSettings() {
    if (!this.hasLocalStorage) {
      return this.getDefaultSettings();
    }

    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return this.getDefaultSettings();

      const settings = JSON.parse(data);
      return { ...this.getDefaultSettings(), ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   * @returns {object} Default settings
   */
  getDefaultSettings() {
    return {
      volume: 0.7,
      difficulty: 'normal',
      octave: 4,
      showReferenceTone: true,
      autoCalibrate: true,
      theme: 'dark',
    };
  }

  /**
   * Clear all stored data
   */
  clearAll() {
    this.clearSession();
    this.clearHighScores();

    if (this.hasLocalStorage) {
      try {
        localStorage.removeItem(SETTINGS_KEY);
      } catch (error) {
        console.error('Failed to clear settings:', error);
      }
    }
  }

  /**
   * Get storage info for debugging
   * @returns {object} Storage availability and usage
   */
  getStorageInfo() {
    return {
      sessionStorage: this.hasSessionStorage,
      localStorage: this.hasLocalStorage,
      hasSession: this.hasSession(),
      highScoreCount: this.getHighScores().length,
      personalBest: this.getPersonalBest(),
    };
  }
}

export default StateRecovery;
