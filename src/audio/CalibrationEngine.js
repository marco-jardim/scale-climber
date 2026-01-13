/**
 * CalibrationEngine
 * Automatically detects user's comfortable voice range and recommends octave
 * Two-phase process: volume test → range detection → analysis
 * Optimized for faster feedback and lower volume thresholds
 */

// Configuration constants
const CONFIG = {
  // Volume thresholds (after RMS * 10 scaling in AudioContextManager)
  // Typical singing RMS is 0.002-0.01, so after 10x = 0.02-0.1
  // Set thresholds very low to accommodate quiet mics/environments
  VOLUME_THRESHOLD_PASS: 0.008, // Very low - just need some signal
  VOLUME_THRESHOLD_PITCH: 0.008, // Match pass threshold
  VOLUME_THRESHOLD_GOOD: 0.03, // Volume considered "good"

  // Timing
  VOLUME_TEST_DURATION: 1500, // 1.5 seconds
  RANGE_DETECT_DURATION: 6000, // 6 seconds
  VOLUME_SAMPLE_INTERVAL: 50, // Fast sampling
  RANGE_SAMPLE_INTERVAL: 150, // Fast sampling

  // Requirements
  MIN_PITCH_SAMPLES: 10,
  PITCH_CONFIDENCE_THRESHOLD: 0.3, // Relaxed further
};

class CalibrationEngine {
  constructor(pitchDetector) {
    this.pitchDetector = pitchDetector;
    this.state = 'idle'; // idle, volume_test, range_detect, analysis, complete
    this.volumeSamples = [];
    this.pitchSamples = [];
    this.result = null;
    this.onProgressCallback = null;
    this.currentVolume = 0; // Real-time volume for UI
    this.maxVolume = 0; // Track max volume during test
  }

  /**
   * Start calibration process
   * @param {Function} onProgress - Progress callback (phase, progress, message)
   * @returns {Promise<{
   *   success: boolean,
   *   lowestNote: string,
   *   highestNote: string,
   *   recommendedOctave: number,
   *   voiceType: string
   * }>}
   */
  async start(onProgress) {
    this.reset();
    this.onProgressCallback = onProgress;

    try {
      // Phase 1: Volume Test (1.5 seconds, early exit on success)
      this.state = 'volume_test';
      this.reportProgress(0, 'Testing microphone volume...');
      const volumeTestPassed = await this.runVolumeTest(CONFIG.VOLUME_TEST_DURATION);

      if (!volumeTestPassed) {
        return {
          success: false,
          error: 'VOLUME_TOO_LOW',
          message:
            `Microphone volume too low (max: ${Math.round(this.maxVolume * 100)}%). `
            + 'Please sing louder or check mic settings.',
        };
      }

      // Phase 2: Range Detection (6 seconds, early exit when enough samples)
      this.state = 'range_detect';
      this.reportProgress(0.3, 'Detecting vocal range... Sing from low to high notes');
      await this.runRangeDetection(CONFIG.RANGE_DETECT_DURATION);

      // Check if enough pitch samples collected
      if (this.pitchSamples.length < CONFIG.MIN_PITCH_SAMPLES) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          message:
            `Only ${this.pitchSamples.length} notes detected `
            + `(need ${CONFIG.MIN_PITCH_SAMPLES}). Please sing more clearly.`,
        };
      }

      // Phase 3: Analysis
      this.state = 'analysis';
      this.reportProgress(0.9, 'Analyzing results...');
      this.result = this.analyzeResults();

      this.state = 'complete';
      this.reportProgress(1.0, 'Calibration complete!');

      return {
        success: true,
        ...this.result,
      };
    } catch (error) {
      console.error('Calibration error:', error);
      return {
        success: false,
        error: 'CALIBRATION_FAILED',
        message: error.message,
      };
    }
  }

  /**
   * Phase 1: Run volume test
   * Returns true if volume threshold met, false otherwise
   * Early exits as soon as sufficient volume detected
   * @param {number} duration - Max test duration in ms
   * @returns {Promise<boolean>}
   */
  async runVolumeTest(duration) {
    const startTime = Date.now();
    let consecutiveGoodSamples = 0;
    const requiredConsecutive = 3; // Need 3 good samples in a row

    while (Date.now() - startTime < duration) {
      const detection = await this.pitchDetector.detect();
      const { volume } = detection;

      this.volumeSamples.push(volume);
      this.currentVolume = volume;
      this.maxVolume = Math.max(this.maxVolume, volume);

      // Check for early success (consecutive good volumes)
      if (volume >= CONFIG.VOLUME_THRESHOLD_PASS) {
        consecutiveGoodSamples += 1;
        if (consecutiveGoodSamples >= requiredConsecutive) {
          this.reportProgress(0.3, 'Microphone OK!');
          return true;
        }
      } else {
        consecutiveGoodSamples = 0;
      }

      const progress = (Date.now() - startTime) / duration;
      const volumePercent = Math.round(volume * 100);
      let volumeStatus = '✗';
      if (volume >= CONFIG.VOLUME_THRESHOLD_GOOD) {
        volumeStatus = '✓';
      } else if (volume >= CONFIG.VOLUME_THRESHOLD_PASS) {
        volumeStatus = '~';
      }

      this.reportProgress(
        progress * 0.3,
        `Testing mic... Volume: ${volumePercent}% ${volumeStatus}`,
      );

      await this.sleep(CONFIG.VOLUME_SAMPLE_INTERVAL);
    }

    // Check if max volume ever met threshold
    return this.maxVolume >= CONFIG.VOLUME_THRESHOLD_PASS;
  }

  /**
   * Phase 2: Run range detection
   * Early exits when enough pitch samples collected
   * @param {number} duration - Max test duration in ms
   */
  async runRangeDetection(duration) {
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      const detection = await this.pitchDetector.detect();
      this.currentVolume = detection.volume;

      // Only record confident pitch detections (relaxed thresholds)
      const isValidPitch = detection.frequency
        && detection.confidence > CONFIG.PITCH_CONFIDENCE_THRESHOLD
        && detection.volume > CONFIG.VOLUME_THRESHOLD_PITCH;

      if (isValidPitch) {
        this.pitchSamples.push({
          frequency: detection.frequency,
          note: detection.note,
          midi: detection.midi,
          confidence: detection.confidence,
        });
      }

      const elapsed = Date.now() - startTime;
      const progress = 0.3 + (elapsed / duration) * 0.6;
      const remaining = Math.ceil((duration - elapsed) / 1000);
      const samplesCollected = this.pitchSamples.length;
      const currentNote = detection.note || '--';
      const volumePercent = Math.round(detection.volume * 100);

      // Early exit if we have enough samples
      if (samplesCollected >= CONFIG.MIN_PITCH_SAMPLES) {
        this.reportProgress(0.9, `${samplesCollected} notes detected - analyzing...`);
        return;
      }

      const statusMsg = `♪ ${currentNote} | Vol: ${volumePercent}% | `
        + `${samplesCollected}/${CONFIG.MIN_PITCH_SAMPLES} notes (${remaining}s)`;
      this.reportProgress(progress, statusMsg);

      await this.sleep(CONFIG.RANGE_SAMPLE_INTERVAL);
    }
  }

  /**
   * Phase 3: Analyze collected data and recommend octave
   * @returns {{
   *   lowestNote: string,
   *   highestNote: string,
   *   lowestMidi: number,
   *   highestMidi: number,
   *   recommendedOctave: number,
   *   voiceType: string
   * }}
   */
  analyzeResults() {
    // Find lowest and highest MIDI notes
    const midiNumbers = this.pitchSamples.map((s) => s.midi);
    const lowestMidi = Math.min(...midiNumbers);
    const highestMidi = Math.max(...midiNumbers);

    // Get most common notes in range
    const lowestSample = this.pitchSamples.find((s) => s.midi === lowestMidi);
    const highestSample = this.pitchSamples.find((s) => s.midi === highestMidi);

    // Determine voice type and recommended octave based on range
    const midpoint = (lowestMidi + highestMidi) / 2;
    let voiceType;
    let recommendedOctave;

    if (midpoint < 50) {
      // Bass range (E2-E4, MIDI 40-64)
      voiceType = 'Bass';
      recommendedOctave = 3; // C3-C4
    } else if (midpoint < 57) {
      // Baritone range (A2-A4, MIDI 45-69)
      voiceType = 'Baritone';
      recommendedOctave = 3; // C3-C4
    } else if (midpoint < 64) {
      // Tenor range (C3-C5, MIDI 48-72)
      voiceType = 'Tenor';
      recommendedOctave = 4; // C4-C5
    } else if (midpoint < 72) {
      // Alto range (F3-F5, MIDI 53-77)
      voiceType = 'Alto';
      recommendedOctave = 4; // C4-C5
    } else {
      // Soprano range (C4-C6, MIDI 60-84)
      voiceType = 'Soprano';
      recommendedOctave = 4; // C4-C5 (or could be 5 for C5-C6)
    }

    return {
      lowestNote: lowestSample.note,
      highestNote: highestSample.note,
      lowestMidi,
      highestMidi,
      recommendedOctave,
      voiceType,
    };
  }

  /**
   * Report progress to callback
   * @param {number} progress - Progress 0-1
   * @param {string} message - Status message
   */
  reportProgress(progress, message) {
    if (this.onProgressCallback) {
      this.onProgressCallback(this.state, progress, message);
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset calibration state
   */
  reset() {
    this.state = 'idle';
    this.volumeSamples = [];
    this.pitchSamples = [];
    this.result = null;
    this.currentVolume = 0;
    this.maxVolume = 0;
  }

  /**
   * Get current real-time volume (for UI visualization)
   * @returns {number} Volume 0-1
   */
  getCurrentVolume() {
    return this.currentVolume;
  }

  /**
   * Get volume thresholds for UI
   * @returns {{pass: number, good: number}}
   */
  static getVolumeThresholds() {
    return {
      pass: CONFIG.VOLUME_THRESHOLD_PASS,
      good: CONFIG.VOLUME_THRESHOLD_GOOD,
    };
  }

  /**
   * Get current calibration state
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Get calibration result (if complete)
   * @returns {object|null}
   */
  getResult() {
    return this.result;
  }
}

export default CalibrationEngine;
