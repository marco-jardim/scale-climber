/**
 * CalibrationEngine
 * Automatically detects user's comfortable voice range and recommends octave
 * Three-phase process: volume test → range detection → analysis
 */

class CalibrationEngine {
  constructor(pitchDetector) {
    this.pitchDetector = pitchDetector;
    this.state = 'idle'; // idle, volume_test, range_detect, analysis, complete
    this.volumeSamples = [];
    this.pitchSamples = [];
    this.result = null;
    this.onProgressCallback = null;
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
      // Phase 1: Volume Test (3 seconds)
      this.state = 'volume_test';
      this.reportProgress(0, 'Testing microphone volume...');
      await this.runVolumeTest(3000);

      // Check if microphone is working
      const avgVolume = this.volumeSamples.reduce((sum, v) => sum + v, 0)
        / this.volumeSamples.length;

      if (avgVolume < 0.05) {
        return {
          success: false,
          error: 'VOLUME_TOO_LOW',
          message: 'Microphone not detecting sound. Please speak or sing louder.',
        };
      }

      // Phase 2: Range Detection (10 seconds)
      this.state = 'range_detect';
      this.reportProgress(0.3, 'Detecting vocal range... Sing from low to high notes');
      await this.runRangeDetection(10000);

      // Check if enough pitch samples collected
      if (this.pitchSamples.length < 10) {
        return {
          success: false,
          error: 'INSUFFICIENT_DATA',
          message: 'Not enough pitch data. Please sing more notes.',
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
   * @param {number} duration - Test duration in ms
   */
  async runVolumeTest(duration) {
    const startTime = Date.now();
    const sampleInterval = 100; // Sample every 100ms

    while (Date.now() - startTime < duration) {
      const detection = await this.pitchDetector.detect();
      this.volumeSamples.push(detection.volume);

      const progress = (Date.now() - startTime) / duration;
      this.reportProgress(progress * 0.3, 'Testing microphone volume...');

      await this.sleep(sampleInterval);
    }
  }

  /**
   * Phase 2: Run range detection
   * @param {number} duration - Test duration in ms
   */
  async runRangeDetection(duration) {
    const startTime = Date.now();
    const sampleInterval = 200; // Sample every 200ms

    while (Date.now() - startTime < duration) {
      const detection = await this.pitchDetector.detect();

      // Only record confident pitch detections (relaxed thresholds)
      if (detection.frequency && detection.confidence > 0.5 && detection.volume > 0.05) {
        this.pitchSamples.push({
          frequency: detection.frequency,
          note: detection.note,
          midi: detection.midi,
          confidence: detection.confidence,
        });
      }

      const progress = 0.3 + ((Date.now() - startTime) / duration) * 0.6;
      const remaining = Math.ceil((duration - (Date.now() - startTime)) / 1000);
      const samplesCollected = this.pitchSamples.length;

      this.reportProgress(
        progress,
        `Sing from low to high... ${samplesCollected} notes detected (${remaining}s)`,
      );

      await this.sleep(sampleInterval);
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
