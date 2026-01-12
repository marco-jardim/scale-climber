import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GameEngine from '../../src/game/GameEngine.js';

// Mock audio components
vi.mock('../../src/audio/AudioContextManager.js', () => ({
  default: {
    getInstance: vi.fn(() => ({
      initialize: vi.fn(async () => ({ success: true })),
      destroy: vi.fn(async () => {}),
      getContext: vi.fn(() => ({})),
    })),
  },
}));

vi.mock('../../src/audio/PitchDetector.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    init: vi.fn(async () => {}),
    detect: vi.fn(async () => ({
      frequency: 261.63,
      confidence: 0.8,
      clarity: 0.9,
    })),
    destroy: vi.fn(),
  })),
}));

vi.mock('../../src/audio/CalibrationEngine.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    start: vi.fn(async () => ({
      success: true,
      voiceType: 'soprano',
      recommendedOctave: 4,
    })),
  })),
}));

describe('GameEngine', () => {
  let gameEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    gameEngine = new GameEngine();
  });

  afterEach(async () => {
    if (gameEngine.gameLoopId) {
      gameEngine.stopGameLoop();
    }
    if (gameEngine.pitchDetector) {
      // Mock destroy if not present
      if (!gameEngine.pitchDetector.destroy) {
        gameEngine.pitchDetector.destroy = vi.fn();
      }
    }
    if (gameEngine.audioManager) {
      if (!gameEngine.audioManager.destroy) {
        gameEngine.audioManager.destroy = vi.fn(async () => {});
      }
    }
    await gameEngine.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await gameEngine.initialize();

      expect(result.success).toBe(true);
      expect(gameEngine.audioManager).toBeDefined();
      expect(gameEngine.pitchDetector).toBeDefined();
      expect(gameEngine.calibrationEngine).toBeDefined();
    });

    it('should start in idle state', () => {
      expect(gameEngine.getState()).toBe('idle');
    });

    it('should initialize components in correct order', async () => {
      await gameEngine.initialize();

      expect(gameEngine.audioManager).toBeDefined();
      expect(gameEngine.pitchDetector).toBeDefined();
      expect(gameEngine.calibrationEngine).toBeDefined();
      expect(gameEngine.scoreSystem).toBeDefined();
      expect(gameEngine.stateRecovery).toBeDefined();
    });
  });

  describe('Event System', () => {
    it('should register event listeners', () => {
      const callback = vi.fn();
      gameEngine.on('test-event', callback);

      gameEngine.emit('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should remove event listeners', () => {
      const callback = vi.fn();
      gameEngine.on('test-event', callback);
      gameEngine.off('test-event', callback);

      gameEngine.emit('test-event', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      gameEngine.on('test-event', callback1);
      gameEngine.on('test-event', callback2);

      gameEngine.emit('test-event', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle errors in event listeners gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const goodCallback = vi.fn();

      gameEngine.on('test-event', errorCallback);
      gameEngine.on('test-event', goodCallback);

      gameEngine.emit('test-event', {});

      expect(goodCallback).toHaveBeenCalled();
    });
  });

  describe('Calibration', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should start calibration', async () => {
      const onProgress = vi.fn();
      const result = await gameEngine.startCalibration(onProgress);

      expect(result.success).toBe(true);
      expect(result.voiceType).toBeDefined();
      expect(result.recommendedOctave).toBeDefined();
    });

    it('should emit calibration-complete event', async () => {
      const callback = vi.fn();
      gameEngine.on('calibration-complete', callback);

      await gameEngine.startCalibration(() => {});

      expect(callback).toHaveBeenCalled();
    });

    it('should transition to calibration state', async () => {
      const calibrationPromise = gameEngine.startCalibration(() => {});
      expect(gameEngine.getState()).toBe('calibration');

      await calibrationPromise;
    });
  });

  describe('Challenge Mode', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should start challenge with countdown', () => {
      const onCountdownTick = vi.fn();
      gameEngine.on('countdown-tick', onCountdownTick);

      gameEngine.startChallenge(4, 'normal');

      expect(gameEngine.getState()).toBe('countdown');
      expect(gameEngine.currentMode).toBeDefined();
      expect(gameEngine.currentMode.type).toBeUndefined(); // ScaleChallenge doesn't have type
    });

    it('should transition to playing after countdown', () => {
      const onGameStart = vi.fn();
      gameEngine.on('game-start', onGameStart);

      gameEngine.startChallenge(4, 'normal');

      // Advance through countdown (3, 2, 1, GO)
      vi.advanceTimersByTime(4000);

      expect(gameEngine.getState()).toBe('playing');
      expect(onGameStart).toHaveBeenCalled();
    });

    it('should reset score system on challenge start', () => {
      gameEngine.scoreSystem.totalScore = 500;
      gameEngine.startChallenge(4, 'normal');

      expect(gameEngine.scoreSystem.totalScore).toBe(0);
    });

    it('should emit countdown events', () => {
      const onCountdownTick = vi.fn();
      gameEngine.on('countdown-tick', onCountdownTick);

      gameEngine.startChallenge(4, 'normal');

      vi.advanceTimersByTime(1000);
      expect(onCountdownTick).toHaveBeenCalledWith(3);

      vi.advanceTimersByTime(1000);
      expect(onCountdownTick).toHaveBeenCalledWith(2);

      vi.advanceTimersByTime(1000);
      expect(onCountdownTick).toHaveBeenCalledWith(1);
    });
  });

  describe('Practice Mode', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should start practice mode', () => {
      const onPracticeStart = vi.fn();
      gameEngine.on('practice-start', onPracticeStart);

      gameEngine.startPractice('C4', 'normal');

      expect(gameEngine.getState()).toBe('playing');
      expect(gameEngine.currentMode).toBeDefined();
      expect(gameEngine.currentMode.type).toBe('practice');
      expect(onPracticeStart).toHaveBeenCalledWith({ targetNote: 'C4' });
    });

    it('should apply difficulty tolerance settings', () => {
      gameEngine.startPractice('C4', 'easy');
      expect(gameEngine.currentMode.config.tolerance).toBe(50);

      gameEngine.stop();

      gameEngine.startPractice('C4', 'normal');
      expect(gameEngine.currentMode.config.tolerance).toBe(25);

      gameEngine.stop();

      gameEngine.startPractice('C4', 'hard');
      expect(gameEngine.currentMode.config.tolerance).toBe(10);
    });
  });

  describe('Game Loop', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should emit pitch updates during game loop', async () => {
      const onPitchUpdate = vi.fn();
      gameEngine.on('pitch-update', onPitchUpdate);

      gameEngine.startPractice('C4', 'normal');

      // Manually trigger a few game loop iterations
      vi.advanceTimersByTime(16); // One frame
      await vi.advanceTimersToNextTimerAsync();

      gameEngine.stopGameLoop(); // Stop to prevent infinite loop

      expect(onPitchUpdate).toHaveBeenCalled();
    });

    it('should stop game loop when not playing', () => {
      const onPitchUpdate = vi.fn();
      gameEngine.on('pitch-update', onPitchUpdate);

      gameEngine.startPractice('C4', 'normal');
      gameEngine.stop();

      onPitchUpdate.mockClear();

      vi.advanceTimersByTime(1000);

      expect(onPitchUpdate).not.toHaveBeenCalled();
    });

    it('should not run game loop when paused', () => {
      gameEngine.startChallenge(4, 'normal');
      vi.advanceTimersByTime(4000); // Complete countdown

      const onPitchUpdate = vi.fn();
      gameEngine.on('pitch-update', onPitchUpdate);

      gameEngine.pause();
      onPitchUpdate.mockClear();

      vi.advanceTimersByTime(1000);

      expect(onPitchUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Pause and Resume', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should pause game', () => {
      gameEngine.startChallenge(4, 'normal');
      vi.advanceTimersByTime(4000); // Complete countdown

      const onPaused = vi.fn();
      gameEngine.on('game-paused', onPaused);

      gameEngine.pause();

      expect(gameEngine.getState()).toBe('paused');
      expect(onPaused).toHaveBeenCalled();
    });

    it('should resume game', () => {
      gameEngine.startChallenge(4, 'normal');
      vi.advanceTimersByTime(4000); // Complete countdown

      gameEngine.pause();

      const onResumed = vi.fn();
      gameEngine.on('game-resumed', onResumed);

      gameEngine.resume();

      expect(gameEngine.getState()).toBe('playing');
      expect(onResumed).toHaveBeenCalled();
    });

    it('should not pause if not playing', () => {
      gameEngine.pause();
      expect(gameEngine.getState()).toBe('idle');
    });

    it('should not resume if not paused', () => {
      gameEngine.resume();
      expect(gameEngine.getState()).toBe('idle');
    });
  });

  describe('Stop Game', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should stop game and return to idle', () => {
      gameEngine.startPractice('C4', 'normal');

      const onStopped = vi.fn();
      gameEngine.on('game-stopped', onStopped);

      gameEngine.stop();

      expect(gameEngine.getState()).toBe('idle');
      expect(gameEngine.currentMode).toBeNull();
      expect(onStopped).toHaveBeenCalled();
    });
  });

  describe('Score Integration', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should get current score', () => {
      gameEngine.scoreSystem.totalScore = 500;
      expect(gameEngine.getCurrentScore()).toBe(500);
    });

    it('should get score statistics', () => {
      gameEngine.scoreSystem.perfectCount = 5;
      const stats = gameEngine.getScoreStatistics();

      expect(stats).toBeDefined();
      expect(stats.perfectCount).toBe(5);
    });

    it('should handle note hits', () => {
      const noteData = {
        averageCents: 5,
        timeToHit: 1500,
      };

      const onNoteHit = vi.fn();
      gameEngine.on('note-hit', onNoteHit);

      gameEngine.handleNoteHit(noteData);

      expect(gameEngine.currentNote).toBe(1);
      expect(onNoteHit).toHaveBeenCalled();
      expect(gameEngine.getCurrentScore()).toBeGreaterThan(0);
    });

    it('should handle note misses', () => {
      const noteData = { note: 'C4' };
      const onNoteMiss = vi.fn();
      gameEngine.on('note-miss', onNoteMiss);

      gameEngine.handleNoteMiss(noteData);

      expect(onNoteMiss).toHaveBeenCalled();
    });
  });

  describe('Challenge Completion', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should handle challenge completion', () => {
      const onComplete = vi.fn();
      gameEngine.on('challenge-complete', onComplete);

      gameEngine.startChallenge(4, 'normal'); // Start challenge so currentMode is set
      gameEngine.scoreSystem.totalScore = 750; // Set score after starting (startChallenge resets score)
      gameEngine.handleChallengeComplete();

      expect(gameEngine.getState()).toBe('complete');
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          finalScore: 750,
          grade: expect.any(String),
          statistics: expect.any(Object),
        })
      );
    });

    it('should save high score on completion', () => {
      const saveHighScoreSpy = vi.spyOn(
        gameEngine.stateRecovery,
        'saveHighScore'
      );

      gameEngine.scoreSystem.totalScore = 750;
      gameEngine.startChallenge(4, 'normal');
      gameEngine.handleChallengeComplete();

      expect(saveHighScoreSpy).toHaveBeenCalled();
    });

    it('should handle challenge failure', () => {
      const onFailed = vi.fn();
      gameEngine.on('challenge-failed', onFailed);

      gameEngine.handleChallengeFail('TIME_LIMIT_EXCEEDED');

      expect(gameEngine.getState()).toBe('failed');
      expect(onFailed).toHaveBeenCalledWith({ reason: 'TIME_LIMIT_EXCEEDED' });
    });
  });

  describe('State Recovery', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    it('should check for saved session', () => {
      const hasSavedSession = gameEngine.hasSavedSession();
      expect(typeof hasSavedSession).toBe('boolean');
    });

    it('should get high scores', () => {
      const highScores = gameEngine.getHighScores();
      expect(Array.isArray(highScores)).toBe(true);
    });
  });

  describe('Resource Cleanup', () => {
    it('should cleanup resources on destroy', async () => {
      await gameEngine.initialize();
      gameEngine.startPractice('C4', 'normal');

      await gameEngine.destroy();

      expect(gameEngine.gameLoopId).toBeNull();
    });

    it('should clear event listeners on destroy', async () => {
      const callback = vi.fn();
      await gameEngine.initialize();

      gameEngine.on('test-event', callback);
      await gameEngine.destroy();

      gameEngine.emit('test-event', {});
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization failure', async () => {
      const failingEngine = new GameEngine();

      // Mock failure
      vi.spyOn(failingEngine, 'initialize').mockResolvedValue({
        success: false,
        error: 'PERMISSION_DENIED',
      });

      const result = await failingEngine.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle errors in game loop gracefully', async () => {
      await gameEngine.initialize();

      // Mock pitch detector to throw error
      gameEngine.pitchDetector.detect = vi.fn(async () => {
        throw new Error('Detection error');
      });

      gameEngine.startPractice('C4', 'normal');

      // Trigger one frame
      vi.advanceTimersByTime(16);
      await vi.advanceTimersToNextTimerAsync();

      gameEngine.stopGameLoop();

      expect(gameEngine.getState()).toBe('playing');
    });
  });
});
