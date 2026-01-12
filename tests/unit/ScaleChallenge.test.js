import {
  describe, it, expect, beforeEach, vi,
} from 'vitest';
import ScaleChallenge from '../../src/game/ScaleChallenge.js';

describe('ScaleChallenge', () => {
  let challenge;
  let mockCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();

    mockCallbacks = {
      onNoteHit: vi.fn(),
      onNoteMiss: vi.fn(),
      onComplete: vi.fn(),
      onFail: vi.fn(),
      onProgress: vi.fn(),
    };

    challenge = new ScaleChallenge({
      octave: 4,
      difficulty: 'normal',
      ...mockCallbacks,
    });
  });

  describe('Initialization', () => {
    it('should initialize with correct difficulty settings', () => {
      expect(challenge.difficultySettings.tolerance).toBe(25);
      expect(challenge.difficultySettings.holdTime).toBe(1500);
      expect(challenge.difficultySettings.maxAttempts).toBe(3);
    });

    it('should initialize with 8-note C major scale', () => {
      expect(challenge.scale).toHaveLength(8);
      expect(challenge.scale[0]).toBe('C4');
      expect(challenge.scale[7]).toBe('C5');
    });

    it('should initialize with ready state', () => {
      expect(challenge.state).toBe('ready');
      expect(challenge.currentNoteIndex).toBe(0);
    });

    it('should apply easy difficulty settings', () => {
      const easy = new ScaleChallenge({ difficulty: 'easy' });
      expect(easy.difficultySettings.tolerance).toBe(50);
      expect(easy.difficultySettings.holdTime).toBe(1200);
      expect(easy.difficultySettings.maxAttempts).toBe(5);
    });

    it('should apply hard difficulty settings', () => {
      const hard = new ScaleChallenge({ difficulty: 'hard' });
      expect(hard.difficultySettings.tolerance).toBe(10);
      expect(hard.difficultySettings.holdTime).toBe(1800);
      expect(hard.difficultySettings.maxAttempts).toBe(3);
    });
  });

  describe('Challenge Start', () => {
    it('should start challenge and set active state', () => {
      challenge.start();

      expect(challenge.state).toBe('active');
      expect(challenge.startTime).toBeDefined();
      expect(challenge.noteStartTime).toBeDefined();
      expect(mockCallbacks.onProgress).toHaveBeenCalled();
    });

    it('should emit progress on start', () => {
      challenge.start();

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          currentNoteIndex: 0,
          totalNotes: 8,
          currentNote: 'C4',
          progress: 0,
        }),
      );
    });
  });

  describe('Pitch Detection Update', () => {
    beforeEach(() => {
      challenge.start();
    });

    it('should ignore updates when not active', () => {
      challenge.state = 'ready';
      const result = challenge.update({
        frequency: 261.63,
        confidence: 0.8,
      });

      expect(result.stateChanged).toBe(false);
    });

    it('should start holding when pitch matches target', () => {
      const result = challenge.update({
        frequency: 261.63, // C4
        confidence: 0.8,
      });

      expect(challenge.isHolding).toBe(true);
      expect(challenge.holdSamples).toHaveLength(1);
      expect(result.stateChanged).toBe(false);
    });

    it('should collect samples during hold', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });
      challenge.update({ frequency: 262.0, confidence: 0.85 });
      challenge.update({ frequency: 261.3, confidence: 0.9 });

      expect(challenge.holdSamples).toHaveLength(3);
    });

    it('should reset hold if pitch goes off target', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });
      expect(challenge.isHolding).toBe(true);

      challenge.update({ frequency: 350.0, confidence: 0.8 }); // Wrong note
      expect(challenge.isHolding).toBe(false);
      expect(challenge.holdSamples).toHaveLength(0);
    });

    it('should ignore low confidence detections', () => {
      const result = challenge.update({
        frequency: 261.63,
        confidence: 0.5, // Below 0.7 threshold
      });

      expect(challenge.isHolding).toBe(false);
      expect(result.stateChanged).toBe(false);
    });

    it('should complete note after holding long enough', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });

      // Simulate hold time passing
      vi.advanceTimersByTime(1500);

      const result = challenge.update({ frequency: 261.63, confidence: 0.8 });

      expect(result.noteCompleted).toBe(true);
      expect(mockCallbacks.onNoteHit).toHaveBeenCalled();
      expect(challenge.currentNoteIndex).toBe(1);
    });
  });

  describe('Note Completion', () => {
    beforeEach(() => {
      challenge.start();
    });

    it('should emit note hit with correct data', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      challenge.update({ frequency: 261.63, confidence: 0.8 });

      expect(mockCallbacks.onNoteHit).toHaveBeenCalledWith(
        expect.objectContaining({
          noteIndex: 0,
          note: 'C4',
          averageCents: expect.any(Number),
          timeToHit: expect.any(Number),
          holdDuration: expect.any(Number),
          attempts: 1,
        }),
      );
    });

    it('should progress to next note after completion', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      challenge.update({ frequency: 261.63, confidence: 0.8 });

      expect(challenge.currentNoteIndex).toBe(1);
      expect(challenge.getCurrentNote()).toBe('D4');
      expect(challenge.currentNoteAttempts).toBe(0);
    });

    it('should emit progress after note completion', () => {
      mockCallbacks.onProgress.mockClear();

      challenge.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      challenge.update({ frequency: 261.63, confidence: 0.8 });

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          currentNoteIndex: 1,
          currentNote: 'D4',
          progress: 1 / 8,
        }),
      );
    });

    it('should complete challenge after all 8 notes', () => {
      const frequencies = [
        261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
      ];

      for (let i = 0; i < 8; i++) {
        challenge.update({ frequency: frequencies[i], confidence: 0.8 });
        vi.advanceTimersByTime(1500);
        challenge.update({ frequency: frequencies[i], confidence: 0.8 });
      }

      expect(challenge.state).toBe('complete');
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
    });
  });

  describe('Time Limit', () => {
    it('should fail when time limit exceeded', () => {
      challenge.start();

      // Advance 2 minutes
      vi.advanceTimersByTime(120001);

      const result = challenge.update({
        frequency: 261.63,
        confidence: 0.8,
      });

      expect(result.stateChanged).toBe(true);
      expect(result.newState).toBe('failed');
      expect(mockCallbacks.onFail).toHaveBeenCalledWith(
        'TIME_LIMIT_EXCEEDED',
      );
    });
  });

  describe('Failure Handling', () => {
    beforeEach(() => {
      challenge.start();
    });

    it('should track failed attempts', () => {
      challenge.recordFailedAttempt();
      expect(challenge.currentNoteAttempts).toBe(1);
    });

    it('should emit note miss after max attempts', () => {
      challenge.recordFailedAttempt();
      challenge.recordFailedAttempt();
      challenge.recordFailedAttempt(); // maxAttempts = 3

      expect(mockCallbacks.onNoteMiss).toHaveBeenCalledWith(
        expect.objectContaining({
          noteIndex: 0,
          note: 'C4',
          attempts: 3,
        }),
      );
    });

    it('should move to next note after miss', () => {
      challenge.recordFailedAttempt();
      challenge.recordFailedAttempt();
      challenge.recordFailedAttempt();

      expect(challenge.currentNoteIndex).toBe(1);
      expect(challenge.currentNoteAttempts).toBe(0);
    });

    it('should fail challenge after 3 total misses', () => {
      // Miss first note
      for (let i = 0; i < 3; i++) challenge.recordFailedAttempt();
      // Miss second note
      for (let i = 0; i < 3; i++) challenge.recordFailedAttempt();
      // Miss third note
      for (let i = 0; i < 3; i++) challenge.recordFailedAttempt();

      expect(challenge.state).toBe('failed');
      expect(mockCallbacks.onFail).toHaveBeenCalledWith('TOO_MANY_FAILURES');
    });

    it('should complete challenge even with 2 misses', () => {
      const frequencies = [
        261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
      ];

      // Complete first 6 notes
      for (let i = 0; i < 6; i++) {
        challenge.update({ frequency: frequencies[i], confidence: 0.8 });
        vi.advanceTimersByTime(1500);
        challenge.update({ frequency: frequencies[i], confidence: 0.8 });
      }

      // Miss note 7
      for (let i = 0; i < 3; i++) challenge.recordFailedAttempt();

      // Miss note 8
      for (let i = 0; i < 3; i++) challenge.recordFailedAttempt();

      expect(challenge.state).toBe('complete');
      expect(challenge.failureCount).toBe(2);
      expect(mockCallbacks.onComplete).toHaveBeenCalled();
    });
  });

  describe('Hold Progress', () => {
    beforeEach(() => {
      challenge.start();
    });

    it('should return 0 progress when not holding', () => {
      expect(challenge.getHoldProgress()).toBe(0);
    });

    it('should return correct progress during hold', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(750); // Half of 1500ms

      const progress = challenge.getHoldProgress();
      expect(progress).toBeCloseTo(0.5, 1);
    });

    it('should cap progress at 1.0', () => {
      challenge.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(2000); // More than required

      const progress = challenge.getHoldProgress();
      expect(progress).toBe(1.0);
    });
  });

  describe('State Persistence', () => {
    it('should return serializable state', () => {
      challenge.start();
      challenge.currentNoteIndex = 3;
      challenge.failureCount = 1;

      const state = challenge.getStateForPersistence();

      expect(state).toEqual({
        currentNoteIndex: 3,
        currentNoteAttempts: 0,
        totalAttempts: 0,
        failureCount: 1,
        startTime: expect.any(Number),
        noteStartTime: expect.any(Number),
        state: 'active',
      });
    });

    it('should restore from saved state', () => {
      const savedState = {
        currentNoteIndex: 5,
        currentNoteAttempts: 1,
        totalAttempts: 7,
        failureCount: 2,
        startTime: Date.now() - 30000,
        noteStartTime: Date.now() - 5000,
        state: 'active',
      };

      challenge.restore(savedState);

      expect(challenge.currentNoteIndex).toBe(5);
      expect(challenge.currentNoteAttempts).toBe(1);
      expect(challenge.totalAttempts).toBe(7);
      expect(challenge.failureCount).toBe(2);
      expect(challenge.state).toBe('active');
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      challenge.start();
    });

    it('should return challenge statistics', () => {
      challenge.currentNoteIndex = 5;
      challenge.totalAttempts = 8;
      challenge.failureCount = 1;

      const stats = challenge.getStatistics();

      expect(stats).toEqual({
        notesCompleted: 5,
        totalNotes: 8,
        totalAttempts: 8,
        failureCount: 1,
        timeElapsed: expect.any(Number),
        difficulty: 'normal',
        octave: 4,
      });
    });
  });

  describe('Difficulty Variations', () => {
    it('should accept wider tolerance in easy mode', () => {
      const easy = new ScaleChallenge({
        difficulty: 'easy',
        onNoteHit: vi.fn(),
      });

      easy.start();

      // 40 cents off - would fail in normal/hard
      easy.update({ frequency: 267.0, confidence: 0.8 }); // ~40 cents sharp

      expect(easy.isHolding).toBe(true);
    });

    it('should require tighter tolerance in hard mode', () => {
      const hard = new ScaleChallenge({
        difficulty: 'hard',
        onNoteHit: vi.fn(),
      });

      hard.start();

      // 15 cents off - would pass in easy/normal
      hard.update({ frequency: 264.0, confidence: 0.8 }); // ~15 cents sharp

      expect(hard.isHolding).toBe(false);
    });

    it('should require longer hold in hard mode', () => {
      const hard = new ScaleChallenge({
        difficulty: 'hard',
        onNoteHit: vi.fn(),
      });

      hard.start();
      hard.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500); // Not enough for hard mode

      const result = hard.update({ frequency: 261.63, confidence: 0.8 });

      expect(result.noteCompleted).toBeUndefined();
      expect(hard.isHolding).toBe(true);
    });
  });
});
