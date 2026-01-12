import { describe, it, expect, beforeEach, vi } from 'vitest';
import PracticeMode from '../../src/game/PracticeMode.js';

describe('PracticeMode', () => {
  let practiceMode;
  let mockCallbacks;

  beforeEach(() => {
    vi.useFakeTimers();

    mockCallbacks = {
      onNoteHit: vi.fn(),
      onProgress: vi.fn(),
    };

    practiceMode = new PracticeMode({
      targetNote: 'C4',
      tolerance: 25,
      holdTime: 1500,
      ...mockCallbacks,
    });
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(practiceMode.config.targetNote).toBe('C4');
      expect(practiceMode.config.tolerance).toBe(25);
      expect(practiceMode.config.holdTime).toBe(1500);
      expect(practiceMode.type).toBe('practice');
    });

    it('should initialize with zero statistics', () => {
      expect(practiceMode.attempts).toBe(0);
      expect(practiceMode.successfulHits).toBe(0);
      expect(practiceMode.totalHoldTime).toBe(0);
      expect(practiceMode.bestAccuracy).toBeNull();
    });

    it('should apply custom configuration', () => {
      const custom = new PracticeMode({
        targetNote: 'A4',
        tolerance: 50,
        holdTime: 2000,
      });

      expect(custom.config.targetNote).toBe('A4');
      expect(custom.config.tolerance).toBe(50);
      expect(custom.config.holdTime).toBe(2000);
    });
  });

  describe('Pitch Detection Update', () => {
    it('should start holding when pitch matches target', () => {
      const result = practiceMode.update({
        frequency: 261.63, // C4
        confidence: 0.8,
      });

      expect(practiceMode.isHolding).toBe(true);
      expect(practiceMode.attempts).toBe(1);
      expect(result.stateChanged).toBe(false);
    });

    it('should collect samples during hold', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      practiceMode.update({ frequency: 262.0, confidence: 0.85 });
      practiceMode.update({ frequency: 261.3, confidence: 0.9 });

      expect(practiceMode.holdSamples).toHaveLength(3);
    });

    it('should emit progress during hold', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(750);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          isHolding: true,
          holdDuration: expect.any(Number),
          requiredDuration: 1500,
          progress: expect.any(Number),
          currentCents: expect.any(Number),
        })
      );
    });

    it('should reset hold if pitch goes off target', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      expect(practiceMode.isHolding).toBe(true);

      practiceMode.update({ frequency: 350.0, confidence: 0.8 }); // Wrong note
      expect(practiceMode.isHolding).toBe(false);
      expect(practiceMode.holdSamples).toHaveLength(0);
    });

    it('should emit progress when losing note', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      mockCallbacks.onProgress.mockClear();

      practiceMode.update({ frequency: 350.0, confidence: 0.8 });

      expect(mockCallbacks.onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          isHolding: false,
          holdDuration: 0,
          progress: 0,
        })
      );
    });

    it('should ignore low confidence detections', () => {
      practiceMode.update({
        frequency: 261.63,
        confidence: 0.5, // Below 0.7 threshold
      });

      expect(practiceMode.isHolding).toBe(false);
    });

    it('should complete hold after holding long enough', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);

      const result = practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(result.noteCompleted).toBe(true);
      expect(mockCallbacks.onNoteHit).toHaveBeenCalled();
      expect(practiceMode.successfulHits).toBe(1);
    });
  });

  describe('Note Hit', () => {
    it('should emit note hit with correct data', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(mockCallbacks.onNoteHit).toHaveBeenCalledWith(
        expect.objectContaining({
          note: 'C4',
          averageCents: expect.any(Number),
          holdDuration: expect.any(Number),
          attempt: 1,
        })
      );
    });

    it('should calculate average cents from samples', () => {
      // Simulate slightly varying pitch
      practiceMode.update({ frequency: 261.0, confidence: 0.8 }); // -4 cents
      practiceMode.update({ frequency: 262.0, confidence: 0.8 }); // +4 cents
      practiceMode.update({ frequency: 261.5, confidence: 0.8 }); // 0 cents
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      const call = mockCallbacks.onNoteHit.mock.calls[0][0];
      expect(Math.abs(call.averageCents)).toBeLessThan(5);
    });

    it('should update statistics after hit', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(practiceMode.successfulHits).toBe(1);
      expect(practiceMode.totalHoldTime).toBeGreaterThan(0);
      expect(practiceMode.statistics.hits).toBe(1);
    });

    it('should track best accuracy', () => {
      // First attempt: 10 cents
      practiceMode.update({ frequency: 263.0, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 263.0, confidence: 0.8 });

      const firstBest = Math.abs(practiceMode.bestAccuracy);

      // Second attempt: better accuracy
      practiceMode.update({ frequency: 261.8, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.8, confidence: 0.8 });

      const secondBest = Math.abs(practiceMode.bestAccuracy);

      expect(secondBest).toBeLessThan(firstBest);
    });

    it('should reset for next attempt after hit', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(practiceMode.isHolding).toBe(false);
      expect(practiceMode.holdSamples).toHaveLength(0);
      expect(practiceMode.holdStartTime).toBeNull();
    });
  });

  describe('Multiple Attempts', () => {
    it('should allow unlimited attempts', () => {
      for (let i = 0; i < 10; i++) {
        practiceMode.update({ frequency: 261.63, confidence: 0.8 });
        vi.advanceTimersByTime(1500);
        practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      }

      expect(practiceMode.attempts).toBe(10);
      expect(practiceMode.successfulHits).toBe(10);
      expect(mockCallbacks.onNoteHit).toHaveBeenCalledTimes(10);
    });

    it('should track failed attempts separately', () => {
      // Success
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      // Failed attempt (lost note before completing)
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(500);
      practiceMode.update({ frequency: 350.0, confidence: 0.8 }); // Lost it

      // Success
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(practiceMode.attempts).toBe(3); // Started 3 times
      expect(practiceMode.successfulHits).toBe(2); // Completed 2 times
    });
  });

  describe('Change Target Note', () => {
    it('should change target note', () => {
      practiceMode.setTargetNote('A4');

      expect(practiceMode.config.targetNote).toBe('A4');
    });

    it('should reset statistics when changing note', () => {
      // Build up some stats
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      expect(practiceMode.successfulHits).toBe(1);

      // Change note
      practiceMode.setTargetNote('A4');

      expect(practiceMode.attempts).toBe(0);
      expect(practiceMode.successfulHits).toBe(0);
      expect(practiceMode.bestAccuracy).toBeNull();
    });

    it('should accept new target note pitch', () => {
      practiceMode.setTargetNote('A4');

      practiceMode.update({ frequency: 440.0, confidence: 0.8 }); // A4

      expect(practiceMode.isHolding).toBe(true);
    });
  });

  describe('Hold Progress', () => {
    it('should return 0 progress when not holding', () => {
      expect(practiceMode.getHoldProgress()).toBe(0);
    });

    it('should return correct progress during hold', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(750); // Half of 1500ms

      const progress = practiceMode.getHoldProgress();
      expect(progress).toBeCloseTo(0.5, 1);
    });

    it('should cap progress at 1.0', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(2000); // More than required

      const progress = practiceMode.getHoldProgress();
      expect(progress).toBe(1.0);
    });
  });

  describe('Statistics', () => {
    it('should return practice statistics', () => {
      // Success
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      // Failed attempt
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(500);
      practiceMode.update({ frequency: 350.0, confidence: 0.8 });

      // Success
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      const stats = practiceMode.getStatistics();

      expect(stats.targetNote).toBe('C4');
      expect(stats.attempts).toBe(3);
      expect(stats.successfulHits).toBe(2);
      expect(stats.successRate).toBe(67); // 2/3 = 66.67%, rounded to 67
      expect(stats.averageAccuracy).toBeGreaterThanOrEqual(0);
      expect(stats.bestAccuracy).toBeGreaterThanOrEqual(0);
      expect(stats.totalPracticeTime).toBeGreaterThan(0);
    });

    it('should handle zero attempts gracefully', () => {
      const stats = practiceMode.getStatistics();

      expect(stats.successRate).toBe(0);
      expect(stats.averageAccuracy).toBe(0);
      expect(stats.bestAccuracy).toBeNull();
    });

    it('should calculate average accuracy correctly', () => {
      // Hit with 10 cents
      practiceMode.update({ frequency: 263.0, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 263.0, confidence: 0.8 });

      // Hit with 5 cents
      practiceMode.update({ frequency: 262.0, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 262.0, confidence: 0.8 });

      const stats = practiceMode.getStatistics();

      // Average should be around 7.5 cents
      expect(stats.averageAccuracy).toBeGreaterThan(5);
      expect(stats.averageAccuracy).toBeLessThan(15);
    });
  });

  describe('State Persistence', () => {
    it('should return serializable state', () => {
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      vi.advanceTimersByTime(1500);
      practiceMode.update({ frequency: 261.63, confidence: 0.8 });

      const state = practiceMode.getStateForPersistence();

      expect(state).toEqual({
        targetNote: 'C4',
        tolerance: 25,
        attempts: 1,
        successfulHits: 1,
        bestAccuracy: expect.any(Number),
        statistics: expect.objectContaining({
          attempts: 0,
          hits: 1,
          totalCents: expect.any(Number),
          bestCents: expect.any(Number),
        }),
      });
    });

    it('should restore from saved state', () => {
      const savedState = {
        targetNote: 'G4',
        tolerance: 30,
        attempts: 10,
        successfulHits: 7,
        bestAccuracy: 5.2,
        statistics: {
          attempts: 0,
          hits: 7,
          totalCents: 50,
          bestCents: 5.2,
        },
      };

      practiceMode.restore(savedState);

      expect(practiceMode.config.targetNote).toBe('G4');
      expect(practiceMode.config.tolerance).toBe(30);
      expect(practiceMode.attempts).toBe(10);
      expect(practiceMode.successfulHits).toBe(7);
      expect(practiceMode.bestAccuracy).toBe(5.2);
      expect(practiceMode.statistics.hits).toBe(7);
    });
  });

  describe('Tolerance Variations', () => {
    it('should accept wider pitch range with higher tolerance', () => {
      const easy = new PracticeMode({
        targetNote: 'C4',
        tolerance: 50,
      });

      // 40 cents off - would fail with 25 cent tolerance
      easy.update({ frequency: 267.0, confidence: 0.8 });

      expect(easy.isHolding).toBe(true);
    });

    it('should require tighter pitch with lower tolerance', () => {
      const hard = new PracticeMode({
        targetNote: 'C4',
        tolerance: 10,
      });

      // 15 cents off - would pass with 25 cent tolerance
      hard.update({ frequency: 264.0, confidence: 0.8 });

      expect(hard.isHolding).toBe(false);
    });
  });

  describe('State Method', () => {
    it('should always return active state', () => {
      expect(practiceMode.getState()).toBe('active');

      practiceMode.start();
      expect(practiceMode.getState()).toBe('active');

      practiceMode.update({ frequency: 261.63, confidence: 0.8 });
      expect(practiceMode.getState()).toBe('active');
    });
  });
});
