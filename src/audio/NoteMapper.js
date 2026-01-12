/**
 * NoteMapper
 * Converts frequencies to musical notes and calculates cent deviations
 * Based on equal temperament tuning with A4 = 440 Hz
 */

// Note names for one octave
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// A4 reference frequency
const A4_FREQUENCY = 440.0;
const A4_MIDI_NUMBER = 69;

/**
 * Convert frequency to MIDI note number (floating point for precision)
 * @param {number} frequency - Frequency in Hz
 * @returns {number} MIDI note number (can be fractional)
 */
export function frequencyToMidi(frequency) {
  if (frequency <= 0) return 0;
  return 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER;
}

/**
 * Convert MIDI note number to frequency
 * @param {number} midi - MIDI note number
 * @returns {number} Frequency in Hz
 */
export function midiToFrequency(midi) {
  return A4_FREQUENCY * 2 ** ((midi - A4_MIDI_NUMBER) / 12);
}

/**
 * Get note name from MIDI number
 * @param {number} midi - MIDI note number (integer)
 * @returns {string} Note name with octave (e.g., 'C4', 'A4')
 */
export function midiToNoteName(midi) {
  const midiInt = Math.round(midi);
  const octave = Math.floor(midiInt / 12) - 1;
  const noteIndex = midiInt % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Calculate cent deviation from nearest semitone
 * A cent is 1/100 of a semitone
 * @param {number} frequency - Frequency in Hz
 * @returns {number} Cents deviation (-50 to +50)
 */
export function getCentDeviation(frequency) {
  const midiFloat = frequencyToMidi(frequency);
  const nearestMidi = Math.round(midiFloat);
  const cents = (midiFloat - nearestMidi) * 100;
  return cents;
}

/**
 * Get note name from frequency with octave
 * @param {number} frequency - Frequency in Hz
 * @returns {string} Note name (e.g., 'C4', 'A#3')
 */
export function frequencyToNoteName(frequency) {
  const midi = frequencyToMidi(frequency);
  return midiToNoteName(midi);
}

/**
 * Get nearest note information from frequency
 * @param {number} frequency - Frequency in Hz
 * @returns {{
 *   note: string,
 *   frequency: number,
 *   targetFrequency: number,
 *   cents: number,
 *   midi: number
 * }}
 */
export function getNoteInfo(frequency) {
  if (frequency <= 0) {
    return {
      note: null,
      frequency: 0,
      targetFrequency: 0,
      cents: 0,
      midi: 0,
    };
  }

  const midiFloat = frequencyToMidi(frequency);
  const nearestMidi = Math.round(midiFloat);
  const cents = (midiFloat - nearestMidi) * 100;
  const targetFrequency = midiToFrequency(nearestMidi);
  const noteName = midiToNoteName(nearestMidi);

  return {
    note: noteName,
    frequency,
    targetFrequency,
    cents: Math.round(cents * 10) / 10, // Round to 1 decimal place
    midi: nearestMidi,
  };
}

/**
 * Check if frequency is within tolerance of target note
 * @param {number} frequency - Detected frequency in Hz
 * @param {string} targetNote - Target note name (e.g., 'C4')
 * @param {number} toleranceCents - Tolerance in cents (default: 25)
 * @returns {{match: boolean, cents: number, targetFrequency: number}}
 */
export function checkNoteMatch(frequency, targetNote, toleranceCents = 25) {
  // Convert target note to MIDI and then to frequency
  const targetMidi = noteNameToMidi(targetNote);
  const targetFrequency = midiToFrequency(targetMidi);

  // Calculate cent deviation from target
  const midiFloat = frequencyToMidi(frequency);
  const cents = (midiFloat - targetMidi) * 100;

  return {
    match: Math.abs(cents) <= toleranceCents,
    cents: Math.round(cents * 10) / 10,
    targetFrequency,
  };
}

/**
 * Convert note name to MIDI number
 * @param {string} noteName - Note name (e.g., 'C4', 'A#3')
 * @returns {number} MIDI note number
 */
export function noteNameToMidi(noteName) {
  // Extract note and octave
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  const note = match[1];
  const octave = parseInt(match[2], 10);

  const noteIndex = NOTE_NAMES.indexOf(note);
  if (noteIndex === -1) {
    throw new Error(`Invalid note: ${note}`);
  }

  return (octave + 1) * 12 + noteIndex;
}

/**
 * Get all notes in a C major scale for a given octave
 * @param {number} octave - Octave number (e.g., 4 for C4-C5)
 * @returns {string[]} Array of note names
 */
export function getCMajorScale(octave) {
  return [
    `C${octave}`,
    `D${octave}`,
    `E${octave}`,
    `F${octave}`,
    `G${octave}`,
    `A${octave}`,
    `B${octave}`,
    `C${octave + 1}`,
  ];
}

/**
 * Get frequency range for all C major scale notes in an octave
 * @param {number} octave - Octave number
 * @returns {{min: number, max: number, notes: Array}}
 */
export function getCMajorScaleFrequencies(octave) {
  const notes = getCMajorScale(octave);
  const frequencies = notes.map((note) => ({
    note,
    frequency: midiToFrequency(noteNameToMidi(note)),
  }));

  return {
    min: frequencies[0].frequency,
    max: frequencies[frequencies.length - 1].frequency,
    notes: frequencies,
  };
}

export default {
  frequencyToMidi,
  midiToFrequency,
  midiToNoteName,
  getCentDeviation,
  frequencyToNoteName,
  getNoteInfo,
  checkNoteMatch,
  noteNameToMidi,
  getCMajorScale,
  getCMajorScaleFrequencies,
};
