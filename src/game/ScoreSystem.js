/**
 * ScoreSystem
 * Calculates scores and grades based on pitch accuracy and performance
 * Pure functions for deterministic scoring
 */

// Grade thresholds (total score)
const GRADE_THRESHOLDS = {
  S: 700, // Perfect performance
  A: 600, // Excellent
  B: 500, // Good
  C: 400, // Average
  D: 300, // Below average
  F: 0, // Fail
};

// Scoring per note based on cent accuracy
const SCORING_TIERS = {
  PERFECT: { maxCents: 10, points: 100 },
  GREAT: { maxCents: 25, points: 75 },
  OK: { maxCents: 50, points: 50 },
};

class ScoreSystem {
  constructor() {
    this.notes = [];
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.totalScore = 0;
    this.perfectCount = 0;
    this.greatCount = 0;
    this.okCount = 0;
    this.missCount = 0;
  }

  /**
   * Add a completed note and calculate score
   * @param {number} avgCents - Average cent deviation during hold
   * @param {number} timeToHit - Time taken to hit the note (ms)
   * @param {boolean} success - Whether note was successfully hit
   * @returns {{
   *   tier: string,
   *   points: number,
   *   comboBonus: number,
   *   totalPoints: number,
   *   combo: number
   * }}
   */
  addNote(avgCents, timeToHit, success) {
    if (!success) {
      // Note missed
      this.notes.push({
        tier: 'MISS',
        points: 0,
        comboBonus: 0,
        totalPoints: 0,
        avgCents,
        timeToHit,
      });

      this.missCount++;
      this.currentCombo = 0;

      return {
        tier: 'MISS',
        points: 0,
        comboBonus: 0,
        totalPoints: 0,
        combo: 0,
      };
    }

    // Determine tier based on accuracy
    const absCents = Math.abs(avgCents);
    let tier;
    let basePoints;

    if (absCents <= SCORING_TIERS.PERFECT.maxCents) {
      tier = 'PERFECT';
      basePoints = SCORING_TIERS.PERFECT.points;
      this.perfectCount++;
    } else if (absCents <= SCORING_TIERS.GREAT.maxCents) {
      tier = 'GREAT';
      basePoints = SCORING_TIERS.GREAT.points;
      this.greatCount++;
    } else if (absCents <= SCORING_TIERS.OK.maxCents) {
      tier = 'OK';
      basePoints = SCORING_TIERS.OK.points;
      this.okCount++;
    } else {
      tier = 'MISS';
      basePoints = 0;
      this.missCount++;
    }

    // Calculate combo bonus
    if (tier === 'PERFECT') {
      this.currentCombo++;
      this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
    } else {
      this.currentCombo = 0;
    }

    const comboBonus = this.calculateComboBonus(this.currentCombo);

    // Calculate time bonus (faster is better, up to +10 points)
    const timeBonus = this.calculateTimeBonus(timeToHit);

    const totalPoints = basePoints + comboBonus + timeBonus;

    this.notes.push({
      tier,
      points: basePoints,
      comboBonus,
      timeBonus,
      totalPoints,
      avgCents,
      timeToHit,
    });

    this.totalScore += totalPoints;

    return {
      tier,
      points: basePoints,
      comboBonus,
      timeBonus,
      totalPoints,
      combo: this.currentCombo,
    };
  }

  /**
   * Calculate combo bonus
   * @param {number} combo - Current combo count
   * @returns {number} Bonus points
   */
  calculateComboBonus(combo) {
    if (combo < 2) return 0;
    if (combo < 4) return 5;
    if (combo < 6) return 10;
    if (combo < 8) return 15;
    return 20; // Max bonus for 8+ combo
  }

  /**
   * Calculate time bonus (faster note hitting)
   * @param {number} timeMs - Time taken in milliseconds
   * @returns {number} Bonus points (0-10)
   */
  calculateTimeBonus(timeMs) {
    // Perfect time: <2s = +10 points
    // Good time: 2-3s = +5 points
    // Slow time: >3s = 0 points
    if (timeMs < 2000) return 10;
    if (timeMs < 3000) return 5;
    return 0;
  }

  /**
   * Get final score
   * @returns {number} Total score
   */
  getFinalScore() {
    return this.totalScore;
  }

  /**
   * Get grade based on total score
   * @returns {string} Grade (S/A/B/C/D/F)
   */
  getGrade() {
    if (this.totalScore >= GRADE_THRESHOLDS.S) return 'S';
    if (this.totalScore >= GRADE_THRESHOLDS.A) return 'A';
    if (this.totalScore >= GRADE_THRESHOLDS.B) return 'B';
    if (this.totalScore >= GRADE_THRESHOLDS.C) return 'C';
    if (this.totalScore >= GRADE_THRESHOLDS.D) return 'D';
    return 'F';
  }

  /**
   * Get statistics
   * @returns {object} Score statistics
   */
  getStatistics() {
    const totalNotes = this.notes.length;
    const accuracy = totalNotes > 0
      ? ((this.perfectCount + this.greatCount + this.okCount) / totalNotes) * 100
      : 0;

    return {
      totalScore: this.totalScore,
      grade: this.getGrade(),
      totalNotes,
      perfectCount: this.perfectCount,
      greatCount: this.greatCount,
      okCount: this.okCount,
      missCount: this.missCount,
      maxCombo: this.maxCombo,
      accuracy: Math.round(accuracy),
      averageCents: this.getAverageCents(),
    };
  }

  /**
   * Get average cent deviation across all successful notes
   * @returns {number} Average cents
   */
  getAverageCents() {
    const successfulNotes = this.notes.filter((n) => n.tier !== 'MISS');
    if (successfulNotes.length === 0) return 0;

    const sum = successfulNotes.reduce((acc, note) => acc + Math.abs(note.avgCents), 0);
    return Math.round((sum / successfulNotes.length) * 10) / 10;
  }

  /**
   * Get state for persistence
   * @returns {object} Serializable state
   */
  getState() {
    return {
      notes: this.notes,
      currentCombo: this.currentCombo,
      maxCombo: this.maxCombo,
      totalScore: this.totalScore,
      perfectCount: this.perfectCount,
      greatCount: this.greatCount,
      okCount: this.okCount,
      missCount: this.missCount,
    };
  }

  /**
   * Restore from saved state
   * @param {object} state - Saved state
   */
  restore(state) {
    this.notes = state.notes || [];
    this.currentCombo = state.currentCombo || 0;
    this.maxCombo = state.maxCombo || 0;
    this.totalScore = state.totalScore || 0;
    this.perfectCount = state.perfectCount || 0;
    this.greatCount = state.greatCount || 0;
    this.okCount = state.okCount || 0;
    this.missCount = state.missCount || 0;
  }

  /**
   * Reset score system
   */
  reset() {
    this.notes = [];
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.totalScore = 0;
    this.perfectCount = 0;
    this.greatCount = 0;
    this.okCount = 0;
    this.missCount = 0;
  }
}

export default ScoreSystem;
