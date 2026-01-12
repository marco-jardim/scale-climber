import { describe, it, expect, beforeEach } from 'vitest';
import ScoreSystem from '../../src/game/ScoreSystem.js';

describe('ScoreSystem', () => {
  let scoreSystem;

  beforeEach(() => {
    scoreSystem = new ScoreSystem();
  });

  describe('Note Scoring', () => {
    it('should score perfect note (±10 cents)', () => {
      const result = scoreSystem.addNote(5, 1500, true);

      expect(result.tier).toBe('PERFECT');
      expect(result.points).toBe(100);
      expect(result.combo).toBe(1);
    });

    it('should score great note (±25 cents)', () => {
      const result = scoreSystem.addNote(20, 2000, true);

      expect(result.tier).toBe('GREAT');
      expect(result.points).toBe(75);
      expect(result.combo).toBe(0);
    });

    it('should score ok note (±50 cents)', () => {
      const result = scoreSystem.addNote(40, 2500, true);

      expect(result.tier).toBe('OK');
      expect(result.points).toBe(50);
      expect(result.combo).toBe(0);
    });

    it('should score miss for >50 cents', () => {
      const result = scoreSystem.addNote(60, 3000, true);

      expect(result.tier).toBe('MISS');
      expect(result.points).toBe(0);
      expect(result.combo).toBe(0);
    });

    it('should score miss for unsuccessful note', () => {
      const result = scoreSystem.addNote(0, 0, false);

      expect(result.tier).toBe('MISS');
      expect(result.totalPoints).toBe(0);
    });
  });

  describe('Combo System', () => {
    it('should build combo on consecutive perfects', () => {
      const result1 = scoreSystem.addNote(5, 1500, true);
      const result2 = scoreSystem.addNote(8, 1500, true);
      const result3 = scoreSystem.addNote(3, 1500, true);

      expect(result1.combo).toBe(1);
      expect(result2.combo).toBe(2);
      expect(result3.combo).toBe(3);
    });

    it('should reset combo on non-perfect', () => {
      scoreSystem.addNote(5, 1500, true); // Perfect, combo=1
      scoreSystem.addNote(20, 1500, true); // Great, combo resets
      const result = scoreSystem.addNote(5, 1500, true); // Perfect, combo=1 again

      expect(result.combo).toBe(1);
    });

    it('should apply combo bonus', () => {
      scoreSystem.addNote(5, 1500, true); // combo=1, no bonus
      const result2 = scoreSystem.addNote(5, 1500, true); // combo=2, bonus=5

      expect(result2.comboBonus).toBe(5);
    });

    it('should track max combo', () => {
      scoreSystem.addNote(5, 1500, true);
      scoreSystem.addNote(5, 1500, true);
      scoreSystem.addNote(5, 1500, true);
      scoreSystem.addNote(20, 1500, true); // Break combo

      expect(scoreSystem.maxCombo).toBe(3);
    });
  });

  describe('Time Bonus', () => {
    it('should give max time bonus for <2s', () => {
      const result = scoreSystem.addNote(5, 1500, true);

      expect(result.timeBonus).toBe(10);
    });

    it('should give partial time bonus for 2-3s', () => {
      const result = scoreSystem.addNote(5, 2500, true);

      expect(result.timeBonus).toBe(5);
    });

    it('should give no time bonus for >3s', () => {
      const result = scoreSystem.addNote(5, 3500, true);

      expect(result.timeBonus).toBe(0);
    });
  });

  describe('Total Score', () => {
    it('should accumulate total score', () => {
      scoreSystem.addNote(5, 1500, true); // 100 + 10 = 110
      scoreSystem.addNote(20, 2000, true); // 75 + 5 = 80

      expect(scoreSystem.getFinalScore()).toBe(190);
    });

    it('should calculate correct total with combo bonus', () => {
      scoreSystem.addNote(5, 1500, true); // 100 + 10 = 110
      scoreSystem.addNote(5, 1500, true); // 100 + 5 (combo) + 10 = 115

      expect(scoreSystem.getFinalScore()).toBe(225);
    });
  });

  describe('Grading', () => {
    it('should give S grade for >700 points', () => {
      // Simulate perfect performance
      for (let i = 0; i < 8; i++) {
        scoreSystem.addNote(5, 1500, true); // Each note ~110-130 points
      }

      expect(scoreSystem.getGrade()).toBe('S');
    });

    it('should give A grade for 600-699 points', () => {
      scoreSystem.totalScore = 650;
      expect(scoreSystem.getGrade()).toBe('A');
    });

    it('should give B grade for 500-599 points', () => {
      scoreSystem.totalScore = 550;
      expect(scoreSystem.getGrade()).toBe('B');
    });

    it('should give C grade for 400-499 points', () => {
      scoreSystem.totalScore = 450;
      expect(scoreSystem.getGrade()).toBe('C');
    });

    it('should give D grade for 300-399 points', () => {
      scoreSystem.totalScore = 350;
      expect(scoreSystem.getGrade()).toBe('D');
    });

    it('should give F grade for <300 points', () => {
      scoreSystem.totalScore = 250;
      expect(scoreSystem.getGrade()).toBe('F');
    });
  });

  describe('Statistics', () => {
    it('should track all tier counts', () => {
      scoreSystem.addNote(5, 1500, true); // Perfect
      scoreSystem.addNote(5, 1500, true); // Perfect
      scoreSystem.addNote(20, 1500, true); // Great
      scoreSystem.addNote(40, 1500, true); // OK
      scoreSystem.addNote(60, 1500, true); // Miss

      const stats = scoreSystem.getStatistics();

      expect(stats.perfectCount).toBe(2);
      expect(stats.greatCount).toBe(1);
      expect(stats.okCount).toBe(1);
      expect(stats.missCount).toBe(1);
    });

    it('should calculate accuracy percentage', () => {
      scoreSystem.addNote(5, 1500, true); // Success
      scoreSystem.addNote(5, 1500, true); // Success
      scoreSystem.addNote(60, 1500, true); // Miss
      scoreSystem.addNote(60, 1500, true); // Miss

      const stats = scoreSystem.getStatistics();

      expect(stats.accuracy).toBe(50); // 2/4 = 50%
    });

    it('should calculate average cents', () => {
      scoreSystem.addNote(10, 1500, true);
      scoreSystem.addNote(20, 1500, true);
      scoreSystem.addNote(30, 1500, true);

      const stats = scoreSystem.getStatistics();

      expect(stats.averageCents).toBe(20); // (10+20+30)/3 = 20
    });

    it('should exclude misses from average cents', () => {
      scoreSystem.addNote(10, 1500, true);
      scoreSystem.addNote(60, 1500, true); // Miss
      scoreSystem.addNote(20, 1500, true);

      const stats = scoreSystem.getStatistics();

      expect(stats.averageCents).toBe(15); // (10+20)/2 = 15
    });
  });

  describe('State Persistence', () => {
    it('should save and restore state', () => {
      scoreSystem.addNote(5, 1500, true);
      scoreSystem.addNote(5, 1500, true);
      scoreSystem.addNote(20, 1500, true);

      const state = scoreSystem.getState();
      const newScoreSystem = new ScoreSystem();
      newScoreSystem.restore(state);

      expect(newScoreSystem.totalScore).toBe(scoreSystem.totalScore);
      expect(newScoreSystem.perfectCount).toBe(scoreSystem.perfectCount);
      expect(newScoreSystem.maxCombo).toBe(scoreSystem.maxCombo);
    });
  });

  describe('Reset', () => {
    it('should reset all values', () => {
      scoreSystem.addNote(5, 1500, true);
      scoreSystem.addNote(5, 1500, true);

      scoreSystem.reset();

      expect(scoreSystem.totalScore).toBe(0);
      expect(scoreSystem.currentCombo).toBe(0);
      expect(scoreSystem.perfectCount).toBe(0);
      expect(scoreSystem.notes.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative cents correctly', () => {
      const result = scoreSystem.addNote(-8, 1500, true);

      expect(result.tier).toBe('PERFECT');
      expect(result.points).toBe(100);
    });

    it('should handle exact boundary values', () => {
      const result10 = scoreSystem.addNote(10, 1500, true);
      const result25 = scoreSystem.addNote(25, 1500, true);
      const result50 = scoreSystem.addNote(50, 1500, true);

      expect(result10.tier).toBe('PERFECT');
      expect(result25.tier).toBe('GREAT');
      expect(result50.tier).toBe('OK');
    });
  });
});
