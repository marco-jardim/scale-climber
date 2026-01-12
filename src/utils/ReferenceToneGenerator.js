/**
 * ReferenceToneGenerator
 * Plays reference tones to help users match target pitches
 * Optional guide melody feature
 */

class ReferenceToneGenerator {
  constructor() {
    this.audioContext = null;
    this.enabled = false;
    this.volume = 0.3;
    this.oscillatorType = 'sine'; // sine, square, sawtooth, triangle
  }

  /**
   * Initialize audio context
   */
  initialize() {
    if (!this.audioContext) {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
      } else {
        console.warn('Web Audio API not supported');
      }
    }
  }

  /**
   * Play a single note at given frequency
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in milliseconds
   */
  playNote(frequency, duration = 500) {
    if (!this.enabled) return;
    if (!this.audioContext) this.initialize();
    if (!this.audioContext) return;

    try {
      // Resume context if suspended (required for autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      oscillator.type = this.oscillatorType;

      // ADSR envelope: fade in, sustain, fade out
      const now = this.audioContext.currentTime;
      const durationSeconds = duration / 1000;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.05); // Attack
      gainNode.gain.setValueAtTime(
        this.volume,
        now + durationSeconds - 0.1
      ); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + durationSeconds); // Release

      oscillator.start(now);
      oscillator.stop(now + durationSeconds);

      // Clean up after playback
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        gainNode.disconnect();
      });
    } catch (err) {
      console.warn('Failed to play reference tone:', err);
    }
  }

  /**
   * Play note by name (e.g., 'C4', 'A#5')
   * @param {string} noteName - Note name with octave
   * @param {number} duration - Duration in milliseconds
   */
  playNoteName(noteName, duration = 500) {
    const frequency = this.noteToFrequency(noteName);
    if (frequency) {
      this.playNote(frequency, duration);
    }
  }

  /**
   * Play a sequence of notes
   * @param {Array} notes - Array of {frequency, duration} or {noteName, duration}
   * @param {number} gap - Gap between notes in milliseconds
   */
  async playSequence(notes, gap = 100) {
    if (!this.enabled) return;

    for (const note of notes) {
      if (note.noteName) {
        this.playNoteName(note.noteName, note.duration || 500);
      } else if (note.frequency) {
        this.playNote(note.frequency, note.duration || 500);
      }

      // Wait for note duration + gap
      await this.delay((note.duration || 500) + gap);
    }
  }

  /**
   * Convert note name to frequency
   * @param {string} noteName - Note name (e.g., 'C4', 'A#5')
   * @returns {number} Frequency in Hz
   */
  noteToFrequency(noteName) {
    const notePattern = /^([A-G])([#b]?)(\d)$/;
    const match = noteName.match(notePattern);

    if (!match) {
      console.warn(`Invalid note name: ${noteName}`);
      return null;
    }

    const [, note, accidental, octave] = match;

    // A4 = 440Hz reference
    const A4 = 440;
    const noteOffsets = {
      C: -9,
      D: -7,
      E: -5,
      F: -4,
      G: -2,
      A: 0,
      B: 2,
    };

    let semitones = noteOffsets[note];
    if (accidental === '#') semitones += 1;
    if (accidental === 'b') semitones -= 1;

    // Add octave offset (A4 is octave 4)
    semitones += (parseInt(octave) - 4) * 12;

    // Calculate frequency: f = A4 * 2^(semitones/12)
    return A4 * Math.pow(2, semitones / 12);
  }

  /**
   * Enable reference tone generation
   */
  enable() {
    this.enabled = true;
    if (!this.audioContext) {
      this.initialize();
    }
  }

  /**
   * Disable reference tone generation
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Toggle enabled state
   * @returns {boolean} New enabled state
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.enabled;
  }

  /**
   * Check if enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   * @returns {number} Current volume (0-1)
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Set oscillator type
   * @param {string} type - 'sine' | 'square' | 'sawtooth' | 'triangle'
   */
  setOscillatorType(type) {
    const validTypes = ['sine', 'square', 'sawtooth', 'triangle'];
    if (validTypes.includes(type)) {
      this.oscillatorType = type;
    }
  }

  /**
   * Delay helper
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Resolves after delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default ReferenceToneGenerator;
