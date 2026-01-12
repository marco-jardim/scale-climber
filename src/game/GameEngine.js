/**
 * GameEngine
 * Main game orchestrator - manages game state, audio integration, and game modes
 */

import AudioContextManager from '../audio/AudioContextManager.js';
import PitchDetector from '../audio/PitchDetector.js';
import CalibrationEngine from '../audio/CalibrationEngine.js';
import ScaleChallenge from './ScaleChallenge.js';
import PracticeMode from './PracticeMode.js';
import ScoreSystem from './ScoreSystem.js';
import StateRecovery from './StateRecovery.js';

class GameEngine {
  constructor() {
    // Audio components
    this.audioManager = null;
    this.pitchDetector = null;
    this.calibrationEngine = null;

    // Game components
    this.currentMode = null; // ScaleChallenge or PracticeMode
    this.scoreSystem = new ScoreSystem();
    this.stateRecovery = new StateRecovery();

    // Game state
    this.state = 'idle'; // idle, calibration, countdown, playing, paused, complete, failed, error
    this.subState = null;
    this.currentNote = 0;
    this.lastPitchResult = null;
    this.frameTime = 0;

    // Event listeners
    this.listeners = new Map();

    // Game loop
    this.gameLoopId = null;
    this.isPaused = false;
  }

  /**
   * Initialize game engine
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async initialize() {
    try {
      // Initialize audio context manager
      this.audioManager = AudioContextManager.getInstance();
      const audioResult = await this.audioManager.initialize();

      if (!audioResult.success) {
        return {
          success: false,
          error: audioResult.error,
        };
      }

      // Initialize pitch detector
      this.pitchDetector = new PitchDetector(this.audioManager);
      await this.pitchDetector.init();

      // Initialize calibration engine
      this.calibrationEngine = new CalibrationEngine(this.pitchDetector);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'INITIALIZATION_FAILED',
        message: error.message,
      };
    }
  }

  /**
   * Start calibration process
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<object>} Calibration result
   */
  async startCalibration(onProgress) {
    this.state = 'calibration';

    const result = await this.calibrationEngine.start(onProgress);

    if (result.success) {
      this.emit('calibration-complete', result);
    } else {
      this.emit('calibration-failed', result);
    }

    return result;
  }

  /**
   * Start scale challenge mode
   * @param {number} octave - Octave for scale
   * @param {string} difficulty - Difficulty level
   */
  startChallenge(octave = 4, difficulty = 'normal') {
    this.state = 'countdown';
    this.scoreSystem.reset();

    // Create scale challenge
    this.currentMode = new ScaleChallenge({
      octave,
      difficulty,
      onNoteHit: (noteData) => this.handleNoteHit(noteData),
      onNoteMiss: (noteData) => this.handleNoteMiss(noteData),
      onComplete: () => this.handleChallengeComplete(),
      onFail: (reason) => this.handleChallengeFail(reason),
      onProgress: (progress) => this.emit('challenge-progress', progress),
    });

    // Countdown: 3, 2, 1, GO
    this.emit('countdown-start');
    let countdown = 3;

    const countdownInterval = setInterval(() => {
      this.emit('countdown-tick', countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.state = 'playing';
        this.currentMode.start();
        this.startGameLoop();
        this.emit('game-start');
      }
    }, 1000);
  }

  /**
   * Start practice mode
   * @param {string} targetNote - Note to practice
   * @param {string} difficulty - Difficulty level
   */
  startPractice(targetNote = 'C4', difficulty = 'normal') {
    this.state = 'playing';

    const tolerances = {
      easy: 50,
      normal: 25,
      hard: 10,
    };

    this.currentMode = new PracticeMode({
      targetNote,
      tolerance: tolerances[difficulty],
      holdTime: 1500,
      onNoteHit: (noteData) => {
        this.emit('practice-note-hit', noteData);
      },
      onProgress: (progress) => {
        this.emit('practice-progress', progress);
      },
    });

    this.currentMode.start();
    this.startGameLoop();
    this.emit('practice-start', { targetNote });
  }

  /**
   * Main game loop
   */
  async startGameLoop() {
    const loop = async () => {
      if (this.state !== 'playing' || this.isPaused) {
        return;
      }

      const frameStart = performance.now();

      try {
        // Get current pitch
        this.lastPitchResult = await this.pitchDetector.detect();

        // Update current game mode
        if (this.currentMode) {
          const update = this.currentMode.update(this.lastPitchResult);

          if (update.stateChanged) {
            this.subState = update.newState;
          }

          if (update.noteCompleted) {
            this.emit('note-completed', {
              currentNote: this.currentMode.getCurrentNote?.(),
              holdProgress: this.currentMode.getHoldProgress?.() || 0,
            });
          }
        }

        // Emit pitch update for UI
        this.emit('pitch-update', {
          ...this.lastPitchResult,
          targetNote: this.currentMode?.getCurrentNote?.() || null,
          holdProgress: this.currentMode?.getHoldProgress?.() || 0,
        });

        // Auto-save every 5 seconds (for challenge mode)
        if (this.currentMode?.type !== 'practice' && frameStart % 5000 < 16) {
          this.saveGameState();
        }
      } catch (error) {
        console.error('Game loop error:', error);
      }

      // Performance monitoring
      this.frameTime = performance.now() - frameStart;

      // Continue loop
      this.gameLoopId = requestAnimationFrame(loop);
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }

  /**
   * Stop game loop
   */
  stopGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * Handle successful note hit
   * @param {object} noteData - Note hit data
   */
  handleNoteHit(noteData) {
    const score = this.scoreSystem.addNote(
      noteData.averageCents,
      noteData.timeToHit,
      true,
    );

    this.currentNote++;

    this.emit('note-hit', { noteData, score });
  }

  /**
   * Handle note miss
   * @param {object} noteData - Note miss data
   */
  handleNoteMiss(noteData) {
    this.scoreSystem.addNote(0, 0, false);
    this.emit('note-miss', { noteData });
  }

  /**
   * Handle challenge completion
   */
  handleChallengeComplete() {
    this.state = 'complete';
    this.stopGameLoop();

    const finalScore = this.scoreSystem.getFinalScore();
    const grade = this.scoreSystem.getGrade();
    const statistics = this.scoreSystem.getStatistics();

    // Save high score
    this.stateRecovery.saveHighScore(finalScore, grade, {
      ...statistics,
      mode: 'challenge',
      octave: this.currentMode.config.octave,
      difficulty: this.currentMode.config.difficulty,
    });

    // Clear session
    this.stateRecovery.clearSession();

    this.emit('challenge-complete', {
      finalScore,
      grade,
      statistics,
    });
  }

  /**
   * Handle challenge failure
   * @param {string} reason - Failure reason
   */
  handleChallengeFail(reason) {
    this.state = 'failed';
    this.stopGameLoop();
    this.stateRecovery.clearSession();

    this.emit('challenge-failed', { reason });
  }

  /**
   * Pause game
   */
  pause() {
    if (this.state === 'playing') {
      this.isPaused = true;
      this.state = 'paused';
      this.saveGameState();
      this.emit('game-paused');
    }
  }

  /**
   * Resume game
   */
  resume() {
    if (this.state === 'paused') {
      this.isPaused = false;
      this.state = 'playing';
      this.startGameLoop();
      this.emit('game-resumed');
    }
  }

  /**
   * Stop/quit current game
   */
  stop() {
    this.stopGameLoop();
    this.state = 'idle';
    this.currentMode = null;
    this.emit('game-stopped');
  }

  /**
   * Save current game state
   */
  saveGameState() {
    if (!this.currentMode || this.currentMode.type === 'practice') {
      return;
    }

    this.stateRecovery.saveSession({
      mode: 'challenge',
      modeState: this.currentMode.getStateForPersistence(),
      score: this.scoreSystem.getState(),
      currentNote: this.currentNote,
      config: this.currentMode.config,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if there's a saved session
   * @returns {boolean}
   */
  hasSavedSession() {
    return this.stateRecovery.hasSession();
  }

  /**
   * Resume saved session
   * @returns {Promise<{success: boolean}>}
   */
  async resumeSession() {
    const savedState = this.stateRecovery.loadSession();
    if (!savedState) {
      return { success: false, error: 'NO_SAVED_SESSION' };
    }

    // Restore game mode
    if (savedState.mode === 'challenge') {
      this.currentMode = new ScaleChallenge(savedState.config);
      this.currentMode.restore(savedState.modeState);
    }

    this.scoreSystem.restore(savedState.score);
    this.currentNote = savedState.currentNote;

    this.state = 'playing';
    this.startGameLoop();

    return { success: true };
  }

  /**
   * Get current game state
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Get last pitch result
   * @returns {object|null}
   */
  getLastPitchResult() {
    return this.lastPitchResult;
  }

  /**
   * Get current score
   * @returns {number}
   */
  getCurrentScore() {
    return this.scoreSystem.getFinalScore();
  }

  /**
   * Get score statistics
   * @returns {object}
   */
  getScoreStatistics() {
    return this.scoreSystem.getStatistics();
  }

  /**
   * Get high scores
   * @returns {Array}
   */
  getHighScores() {
    return this.stateRecovery.getHighScores();
  }

  /**
   * Event emitter - register listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Event emitter - remove listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Event emitter - emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Clean up resources
   */
  async destroy() {
    this.stopGameLoop();

    if (this.pitchDetector) {
      this.pitchDetector.destroy();
    }

    if (this.audioManager) {
      await this.audioManager.destroy();
    }

    this.listeners.clear();
  }
}

export default GameEngine;
