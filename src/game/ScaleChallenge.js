/**
 * ScaleChallenge
 * Manages the 8-note C major scale challenge gameplay
 * Players must sing each note in sequence with correct pitch
 */

import { getCMajorScale, checkNoteMatch } from '../audio/NoteMapper.js';

// Difficulty settings (cent tolerance)
const DIFFICULTY_SETTINGS = {
  easy: { tolerance: 50, holdTime: 1200, maxAttempts: 5 },
  normal: { tolerance: 25, holdTime: 1500, maxAttempts: 3 },
  hard: { tolerance: 10, holdTime: 1800, maxAttempts: 3 },
};

// Time limit for entire challenge (milliseconds)
const CHALLENGE_TIME_LIMIT = 120000; // 2 minutes

class ScaleChallenge {
  constructor(config) {
    this.config = {
      octave: config.octave || 4,
      difficulty: config.difficulty || 'normal',
      onNoteHit: config.onNoteHit || (() => {}),
      onNoteMiss: config.onNoteMiss || (() => {}),
      onComplete: config.onComplete || (() => {}),
      onFail: config.onFail || (() => {}),
      onProgress: config.onProgress || (() => {}),
    };

    this.scale = getCMajorScale(this.config.octave);
    this.difficultySettings = DIFFICULTY_SETTINGS[this.config.difficulty];

    this.currentNoteIndex = 0;
    this.currentNoteAttempts = 0;
    this.totalAttempts = 0;
    this.startTime = null;
    this.noteStartTime = null;

    this.holdStartTime = null;
    this.holdSamples = [];
    this.isHolding = false;

    this.failureCount = 0;
    this.state = 'ready'; // ready, active, complete, failed
  }

  /**
   * Start the challenge
   */
  start() {
    this.startTime = Date.now();
    this.noteStartTime = Date.now();
    this.state = 'active';
    this.emitProgress();
  }

  /**
   * Update with current pitch detection result
   * @param {object} pitchResult - Pitch detection result
   * @returns {{stateChanged: boolean, newState?: string, noteCompleted?: boolean}}
   */
  update(pitchResult) {
    if (this.state !== 'active') {
      return { stateChanged: false };
    }

    // Check for time limit exceeded
    if (Date.now() - this.startTime > CHALLENGE_TIME_LIMIT) {
      this.fail('TIME_LIMIT_EXCEEDED');
      return { stateChanged: true, newState: 'failed' };
    }

    // Get current target note
    const targetNote = this.scale[this.currentNoteIndex];

    // Check if current pitch matches target
    if (pitchResult.frequency && pitchResult.confidence > 0.7) {
      const match = checkNoteMatch(
        pitchResult.frequency,
        targetNote,
        this.difficultySettings.tolerance,
      );

      if (match.match) {
        return this.handleNoteMatch(pitchResult, match);
      }
      return this.handleNoteOff();
    }
    return this.handleNoteOff();
  }

  /**
   * Handle when pitch matches target note
   * @param {object} pitchResult - Pitch detection result
   * @param {object} match - Note match result
   * @returns {object} Update result
   */
  handleNoteMatch(pitchResult, match) {
    // Start holding if not already
    if (!this.isHolding) {
      this.isHolding = true;
      this.holdStartTime = Date.now();
      this.holdSamples = [];
    }

    // Collect samples during hold
    this.holdSamples.push({
      cents: match.cents,
      confidence: pitchResult.confidence,
      timestamp: Date.now(),
    });

    // Check if held long enough
    const holdDuration = Date.now() - this.holdStartTime;
    if (holdDuration >= this.difficultySettings.holdTime) {
      return this.completeNote();
    }

    return { stateChanged: false };
  }

  /**
   * Handle when pitch is off target
   * @returns {object} Update result
   */
  handleNoteOff() {
    if (this.isHolding) {
      // Lost the note before completing hold
      this.isHolding = false;
      this.holdStartTime = null;
      this.holdSamples = [];
    }

    return { stateChanged: false };
  }

  /**
   * Complete current note and move to next
   * @returns {object} Update result
   */
  completeNote() {
    // Calculate average cents during hold
    const avgCents = this.holdSamples.length > 0
      ? this.holdSamples.reduce((sum, s) => sum + s.cents, 0) / this.holdSamples.length
      : 0;

    const timeToHit = Date.now() - this.noteStartTime;

    // Emit note hit event
    this.config.onNoteHit({
      noteIndex: this.currentNoteIndex,
      note: this.scale[this.currentNoteIndex],
      averageCents: avgCents,
      timeToHit,
      holdDuration: this.holdSamples.length > 0
        ? this.holdSamples[this.holdSamples.length - 1].timestamp - this.holdSamples[0].timestamp
        : 0,
      attempts: this.currentNoteAttempts + 1,
    });

    // Reset for next note
    this.isHolding = false;
    this.holdStartTime = null;
    this.holdSamples = [];
    this.currentNoteIndex++;
    this.currentNoteAttempts = 0;
    this.noteStartTime = Date.now();

    // Check if challenge complete
    if (this.currentNoteIndex >= this.scale.length) {
      this.state = 'complete';
      this.config.onComplete();
      return { stateChanged: true, newState: 'complete', noteCompleted: true };
    }

    this.emitProgress();
    return { stateChanged: false, noteCompleted: true };
  }

  /**
   * Record a failed attempt on current note
   */
  recordFailedAttempt() {
    this.currentNoteAttempts++;
    this.totalAttempts++;

    if (this.currentNoteAttempts >= this.difficultySettings.maxAttempts) {
      this.failureCount++;

      // Emit note miss event
      this.config.onNoteMiss({
        noteIndex: this.currentNoteIndex,
        note: this.scale[this.currentNoteIndex],
        attempts: this.currentNoteAttempts,
      });

      // Check if too many failures
      if (this.failureCount >= 3) {
        this.fail('TOO_MANY_FAILURES');
      } else {
        // Move to next note even after failure
        this.currentNoteIndex++;
        this.currentNoteAttempts = 0;
        this.noteStartTime = Date.now();

        if (this.currentNoteIndex >= this.scale.length) {
          this.state = 'complete';
          this.config.onComplete();
        } else {
          this.emitProgress();
        }
      }
    }
  }

  /**
   * Fail the challenge
   * @param {string} reason - Failure reason
   */
  fail(reason) {
    this.state = 'failed';
    this.config.onFail(reason);
  }

  /**
   * Emit progress event
   */
  emitProgress() {
    this.config.onProgress({
      currentNoteIndex: this.currentNoteIndex,
      totalNotes: this.scale.length,
      currentNote: this.scale[this.currentNoteIndex],
      progress: this.currentNoteIndex / this.scale.length,
    });
  }

  /**
   * Get current state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get current target note
   * @returns {string} Note name
   */
  getCurrentNote() {
    if (this.currentNoteIndex >= this.scale.length) return null;
    return this.scale[this.currentNoteIndex];
  }

  /**
   * Get hold progress (0-1)
   * @returns {number} Hold progress
   */
  getHoldProgress() {
    if (!this.isHolding || !this.holdStartTime) return 0;

    const elapsed = Date.now() - this.holdStartTime;
    return Math.min(elapsed / this.difficultySettings.holdTime, 1.0);
  }

  /**
   * Get serializable state for persistence
   * @returns {object} State object
   */
  getStateForPersistence() {
    return {
      currentNoteIndex: this.currentNoteIndex,
      currentNoteAttempts: this.currentNoteAttempts,
      totalAttempts: this.totalAttempts,
      failureCount: this.failureCount,
      startTime: this.startTime,
      noteStartTime: this.noteStartTime,
      state: this.state,
    };
  }

  /**
   * Restore from saved state
   * @param {object} savedState - Saved state
   */
  restore(savedState) {
    this.currentNoteIndex = savedState.currentNoteIndex || 0;
    this.currentNoteAttempts = savedState.currentNoteAttempts || 0;
    this.totalAttempts = savedState.totalAttempts || 0;
    this.failureCount = savedState.failureCount || 0;
    this.startTime = savedState.startTime || Date.now();
    this.noteStartTime = savedState.noteStartTime || Date.now();
    this.state = savedState.state || 'ready';
  }

  /**
   * Get challenge statistics
   * @returns {object} Statistics
   */
  getStatistics() {
    return {
      notesCompleted: this.currentNoteIndex,
      totalNotes: this.scale.length,
      totalAttempts: this.totalAttempts,
      failureCount: this.failureCount,
      timeElapsed: this.startTime ? Date.now() - this.startTime : 0,
      difficulty: this.config.difficulty,
      octave: this.config.octave,
    };
  }
}

export default ScaleChallenge;
