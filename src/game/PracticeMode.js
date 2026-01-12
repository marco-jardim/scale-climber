/**
 * PracticeMode
 * Practice individual notes without time pressure or failure conditions
 * Focus on accuracy and holding the correct pitch
 */

import { checkNoteMatch } from '../audio/NoteMapper.js';

class PracticeMode {
  constructor(config) {
    this.config = {
      targetNote: config.targetNote || 'C4',
      tolerance: config.tolerance || 25, // cents
      holdTime: config.holdTime || 1500, // ms
      onNoteHit: config.onNoteHit || (() => {}),
      onProgress: config.onProgress || (() => {}),
    };

    this.type = 'practice';
    this.attempts = 0;
    this.successfulHits = 0;
    this.totalHoldTime = 0;
    this.bestAccuracy = null;

    this.isHolding = false;
    this.holdStartTime = null;
    this.holdSamples = [];

    this.statistics = {
      attempts: 0,
      hits: 0,
      totalCents: 0,
      bestCents: null,
    };
  }

  /**
   * Start practice mode
   */
  start() {
    // Practice mode doesn't have a formal start, just begins immediately
  }

  /**
   * Update with current pitch detection result
   * @param {object} pitchResult - Pitch detection result
   * @returns {{stateChanged: boolean, noteCompleted?: boolean}}
   */
  update(pitchResult) {
    // Check if current pitch matches target
    if (pitchResult.frequency && pitchResult.confidence > 0.7) {
      const match = checkNoteMatch(
        pitchResult.frequency,
        this.config.targetNote,
        this.config.tolerance
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
      this.attempts++;
    }

    // Collect samples during hold
    this.holdSamples.push({
      cents: match.cents,
      confidence: pitchResult.confidence,
      timestamp: Date.now(),
    });

    // Emit progress
    this.config.onProgress({
      isHolding: true,
      holdDuration: Date.now() - this.holdStartTime,
      requiredDuration: this.config.holdTime,
      progress: Math.min((Date.now() - this.holdStartTime) / this.config.holdTime, 1.0),
      currentCents: match.cents,
    });

    // Check if held long enough
    const holdDuration = Date.now() - this.holdStartTime;
    if (holdDuration >= this.config.holdTime) {
      return this.completeHold();
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

      this.config.onProgress({
        isHolding: false,
        holdDuration: 0,
        requiredDuration: this.config.holdTime,
        progress: 0,
      });
    }

    return { stateChanged: false };
  }

  /**
   * Complete a successful hold
   * @returns {object} Update result
   */
  completeHold() {
    // Calculate average cents during hold
    const avgCents = this.holdSamples.length > 0
      ? this.holdSamples.reduce((sum, s) => sum + s.cents, 0) / this.holdSamples.length
      : 0;

    const absAvgCents = Math.abs(avgCents);

    // Update statistics
    this.successfulHits++;
    this.totalHoldTime += (Date.now() - this.holdStartTime);
    this.statistics.hits++;
    this.statistics.totalCents += absAvgCents;

    if (this.bestAccuracy === null || absAvgCents < Math.abs(this.bestAccuracy)) {
      this.bestAccuracy = avgCents;
      this.statistics.bestCents = avgCents;
    }

    // Emit note hit event
    this.config.onNoteHit({
      note: this.config.targetNote,
      averageCents: avgCents,
      holdDuration: Date.now() - this.holdStartTime,
      attempt: this.attempts,
    });

    // Reset for next attempt
    this.isHolding = false;
    this.holdStartTime = null;
    this.holdSamples = [];

    this.config.onProgress({
      isHolding: false,
      holdDuration: 0,
      requiredDuration: this.config.holdTime,
      progress: 0,
    });

    return { stateChanged: false, noteCompleted: true };
  }

  /**
   * Change target note
   * @param {string} noteName - New target note
   */
  setTargetNote(noteName) {
    this.config.targetNote = noteName;
    this.resetStatistics();
  }

  /**
   * Get current target note
   * @returns {string} Note name
   */
  getTargetNote() {
    return this.config.targetNote;
  }

  /**
   * Get hold progress (0-1)
   * @returns {number} Hold progress
   */
  getHoldProgress() {
    if (!this.isHolding || !this.holdStartTime) return 0;

    const elapsed = Date.now() - this.holdStartTime;
    return Math.min(elapsed / this.config.holdTime, 1.0);
  }

  /**
   * Get practice statistics
   * @returns {object} Statistics
   */
  getStatistics() {
    const successRate = this.attempts > 0
      ? (this.successfulHits / this.attempts) * 100
      : 0;

    const avgAccuracy = this.successfulHits > 0
      ? this.statistics.totalCents / this.successfulHits
      : 0;

    return {
      targetNote: this.config.targetNote,
      attempts: this.attempts,
      successfulHits: this.successfulHits,
      successRate: Math.round(successRate),
      averageAccuracy: Math.round(avgAccuracy * 10) / 10,
      bestAccuracy: this.bestAccuracy !== null
        ? Math.round(Math.abs(this.bestAccuracy) * 10) / 10
        : null,
      totalPracticeTime: this.totalHoldTime,
    };
  }

  /**
   * Reset statistics for current note
   */
  resetStatistics() {
    this.attempts = 0;
    this.successfulHits = 0;
    this.totalHoldTime = 0;
    this.bestAccuracy = null;
    this.statistics = {
      attempts: 0,
      hits: 0,
      totalCents: 0,
      bestCents: null,
    };
  }

  /**
   * Get state for persistence
   * @returns {object} State object
   */
  getStateForPersistence() {
    return {
      targetNote: this.config.targetNote,
      tolerance: this.config.tolerance,
      attempts: this.attempts,
      successfulHits: this.successfulHits,
      bestAccuracy: this.bestAccuracy,
      statistics: this.statistics,
    };
  }

  /**
   * Restore from saved state
   * @param {object} savedState - Saved state
   */
  restore(savedState) {
    this.config.targetNote = savedState.targetNote || 'C4';
    this.config.tolerance = savedState.tolerance || 25;
    this.attempts = savedState.attempts || 0;
    this.successfulHits = savedState.successfulHits || 0;
    this.bestAccuracy = savedState.bestAccuracy || null;
    this.statistics = savedState.statistics || {
      attempts: 0,
      hits: 0,
      totalCents: 0,
      bestCents: null,
    };
  }

  /**
   * Get current state (always active in practice mode)
   * @returns {string}
   */
  getState() {
    return 'active';
  }
}

export default PracticeMode;
