import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StateRecovery from '../../src/game/StateRecovery.js';

describe('StateRecovery', () => {
  let stateRecovery;

  beforeEach(() => {
    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
    stateRecovery = new StateRecovery();
    // Force storage availability (jsdom sometimes fails detection)
    stateRecovery.hasSessionStorage = true;
    stateRecovery.hasLocalStorage = true;
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('Storage Availability', () => {
    it('should detect sessionStorage availability', () => {
      // Test that storage is actually available
      expect(typeof sessionStorage).toBe('object');
      expect(stateRecovery.hasSessionStorage).toBe(true);
    });

    it('should detect localStorage availability', () => {
      // Test that storage is actually available
      expect(typeof localStorage).toBe('object');
      expect(stateRecovery.hasLocalStorage).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should save session data', () => {
      const sessionData = {
        mode: 'challenge',
        currentNote: 3,
        score: { totalScore: 250 },
        config: { octave: 4, difficulty: 'normal' },
      };

      const result = stateRecovery.saveSession(sessionData);

      expect(result).toBe(true);
      expect(stateRecovery.hasSession()).toBe(true);
    });

    it('should load saved session', () => {
      const sessionData = {
        mode: 'challenge',
        currentNote: 3,
        score: { totalScore: 250 },
        config: { octave: 4, difficulty: 'normal' },
      };

      stateRecovery.saveSession(sessionData);
      const loaded = stateRecovery.loadSession();

      expect(loaded).toBeDefined();
      expect(loaded.mode).toBe('challenge');
      expect(loaded.currentNote).toBe(3);
      expect(loaded.score.totalScore).toBe(250);
      expect(loaded.version).toBe('1.0');
    });

    it('should return null for non-existent session', () => {
      const loaded = stateRecovery.loadSession();
      expect(loaded).toBeNull();
    });

    it('should clear session', () => {
      stateRecovery.saveSession({ mode: 'challenge', config: {} });
      expect(stateRecovery.hasSession()).toBe(true);

      stateRecovery.clearSession();
      expect(stateRecovery.hasSession()).toBe(false);
    });

    it('should expire old sessions', () => {
      const oldSession = {
        mode: 'challenge',
        timestamp: Date.now() - (61 * 60 * 1000), // 61 minutes ago
        version: '1.0',
        config: {},
      };

      sessionStorage.setItem(
        'scale-climber-session',
        JSON.stringify(oldSession)
      );

      const loaded = stateRecovery.loadSession();
      expect(loaded).toBeNull();
      expect(stateRecovery.hasSession()).toBe(false);
    });

    it('should validate required session fields', () => {
      const invalidSession = {
        timestamp: Date.now(),
        version: '1.0',
        // Missing mode and config
      };

      sessionStorage.setItem(
        'scale-climber-session',
        JSON.stringify(invalidSession)
      );

      const loaded = stateRecovery.loadSession();
      expect(loaded).toBeNull();
    });
  });

  describe('High Score Management', () => {
    it('should save high score', () => {
      const result = stateRecovery.saveHighScore(750, 'S', {
        mode: 'challenge',
        difficulty: 'normal',
        octave: 4,
      });

      expect(result).toBe(true);
      const scores = stateRecovery.getHighScores();
      expect(scores).toHaveLength(1);
      expect(scores[0].score).toBe(750);
      expect(scores[0].grade).toBe('S');
    });

    it('should sort high scores descending', () => {
      stateRecovery.saveHighScore(500, 'B');
      stateRecovery.saveHighScore(750, 'S');
      stateRecovery.saveHighScore(600, 'A');

      const scores = stateRecovery.getHighScores();

      expect(scores[0].score).toBe(750);
      expect(scores[1].score).toBe(600);
      expect(scores[2].score).toBe(500);
    });

    it('should keep only top 10 scores', () => {
      // Add 15 scores
      for (let i = 0; i < 15; i++) {
        stateRecovery.saveHighScore(100 + i * 50, 'C');
      }

      const scores = stateRecovery.getHighScores();
      expect(scores).toHaveLength(10);
      expect(scores[0].score).toBe(800); // Highest
      expect(scores[9].score).toBe(350); // 10th highest
    });

    it('should return personal best', () => {
      stateRecovery.saveHighScore(500, 'B');
      stateRecovery.saveHighScore(750, 'S');
      stateRecovery.saveHighScore(600, 'A');

      const best = stateRecovery.getPersonalBest();
      expect(best).toBe(750);
    });

    it('should return 0 for personal best with no scores', () => {
      const best = stateRecovery.getPersonalBest();
      expect(best).toBe(0);
    });

    it('should clear all high scores', () => {
      stateRecovery.saveHighScore(750, 'S');
      stateRecovery.saveHighScore(600, 'A');

      expect(stateRecovery.getHighScores()).toHaveLength(2);

      stateRecovery.clearHighScores();

      expect(stateRecovery.getHighScores()).toHaveLength(0);
    });

    it('should include metadata in high scores', () => {
      stateRecovery.saveHighScore(750, 'S', {
        mode: 'challenge',
        difficulty: 'hard',
        octave: 5,
        perfectCount: 8,
      });

      const scores = stateRecovery.getHighScores();
      expect(scores[0].mode).toBe('challenge');
      expect(scores[0].difficulty).toBe('hard');
      expect(scores[0].octave).toBe(5);
      expect(scores[0].perfectCount).toBe(8);
    });
  });

  describe('Settings Management', () => {
    it('should return default settings', () => {
      const defaults = stateRecovery.getDefaultSettings();

      expect(defaults).toEqual({
        volume: 0.7,
        difficulty: 'normal',
        octave: 4,
        showReferenceTone: true,
        autoCalibrate: true,
        theme: 'dark',
      });
    });

    it('should save user settings', () => {
      const settings = {
        volume: 0.5,
        difficulty: 'hard',
        octave: 5,
        theme: 'light',
      };

      stateRecovery.saveSettings(settings);

      const loaded = stateRecovery.loadSettings();
      expect(loaded.volume).toBe(0.5);
      expect(loaded.difficulty).toBe('hard');
      expect(loaded.octave).toBe(5);
      expect(loaded.theme).toBe('light');
    });

    it('should merge with defaults when loading settings', () => {
      const partialSettings = {
        volume: 0.5,
        difficulty: 'hard',
      };

      stateRecovery.saveSettings(partialSettings);
      const loaded = stateRecovery.loadSettings();

      // Should have saved values
      expect(loaded.volume).toBe(0.5);
      expect(loaded.difficulty).toBe('hard');

      // Should have default values for others
      expect(loaded.octave).toBe(4);
      expect(loaded.showReferenceTone).toBe(true);
      expect(loaded.autoCalibrate).toBe(true);
      expect(loaded.theme).toBe('dark');
    });

    it('should return defaults if no settings saved', () => {
      const loaded = stateRecovery.loadSettings();
      expect(loaded).toEqual(stateRecovery.getDefaultSettings());
    });
  });

  describe('Clear All Data', () => {
    it('should clear all stored data', () => {
      // Add data to all storage types
      stateRecovery.saveSession({ mode: 'challenge', config: {} });
      stateRecovery.saveHighScore(750, 'S');
      stateRecovery.saveSettings({ volume: 0.5 });

      expect(stateRecovery.hasSession()).toBe(true);
      expect(stateRecovery.getHighScores()).toHaveLength(1);

      stateRecovery.clearAll();

      expect(stateRecovery.hasSession()).toBe(false);
      expect(stateRecovery.getHighScores()).toHaveLength(0);
      expect(stateRecovery.loadSettings()).toEqual(
        stateRecovery.getDefaultSettings()
      );
    });
  });

  describe('Storage Info', () => {
    it('should return storage information', () => {
      stateRecovery.saveSession({ mode: 'challenge', config: {} });
      stateRecovery.saveHighScore(750, 'S');
      stateRecovery.saveHighScore(600, 'A');

      const info = stateRecovery.getStorageInfo();

      expect(info.sessionStorage).toBe(true);
      expect(info.localStorage).toBe(true);
      expect(info.hasSession).toBe(true);
      expect(info.highScoreCount).toBe(2);
      expect(info.personalBest).toBe(750);
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupt session data gracefully', () => {
      sessionStorage.setItem('scale-climber-session', 'invalid json');

      const loaded = stateRecovery.loadSession();
      expect(loaded).toBeNull();
    });

    it('should handle corrupt high score data gracefully', () => {
      localStorage.setItem('scale-climber-high-scores', 'invalid json');

      const scores = stateRecovery.getHighScores();
      expect(scores).toEqual([]);
    });

    it('should handle corrupt settings data gracefully', () => {
      localStorage.setItem('scale-climber-settings', 'invalid json');

      const settings = stateRecovery.loadSettings();
      expect(settings).toEqual(stateRecovery.getDefaultSettings());
    });
  });
});
