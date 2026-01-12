import { describe, it, expect } from 'vitest';
import {
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
} from '../../src/audio/NoteMapper.js';

describe('NoteMapper', () => {
  describe('frequencyToMidi', () => {
    it('should convert A4 (440Hz) to MIDI 69', () => {
      expect(frequencyToMidi(440)).toBeCloseTo(69, 2);
    });

    it('should convert C4 (261.63Hz) to MIDI 60', () => {
      expect(frequencyToMidi(261.63)).toBeCloseTo(60, 1);
    });

    it('should return 0 for invalid frequencies', () => {
      expect(frequencyToMidi(0)).toBe(0);
      expect(frequencyToMidi(-10)).toBe(0);
    });
  });

  describe('midiToFrequency', () => {
    it('should convert MIDI 69 to 440Hz (A4)', () => {
      expect(midiToFrequency(69)).toBeCloseTo(440, 2);
    });

    it('should convert MIDI 60 to ~261.63Hz (C4)', () => {
      expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
    });

    it('should convert MIDI 72 to ~523.25Hz (C5)', () => {
      expect(midiToFrequency(72)).toBeCloseTo(523.25, 2);
    });
  });

  describe('midiToNoteName', () => {
    it('should convert MIDI 60 to C4', () => {
      expect(midiToNoteName(60)).toBe('C4');
    });

    it('should convert MIDI 69 to A4', () => {
      expect(midiToNoteName(69)).toBe('A4');
    });

    it('should convert MIDI 72 to C5', () => {
      expect(midiToNoteName(72)).toBe('C5');
    });

    it('should handle sharps correctly', () => {
      expect(midiToNoteName(61)).toBe('C#4');
      expect(midiToNoteName(70)).toBe('A#4');
    });
  });

  describe('noteNameToMidi', () => {
    it('should convert C4 to MIDI 60', () => {
      expect(noteNameToMidi('C4')).toBe(60);
    });

    it('should convert A4 to MIDI 69', () => {
      expect(noteNameToMidi('A4')).toBe(69);
    });

    it('should handle sharps', () => {
      expect(noteNameToMidi('C#4')).toBe(61);
      expect(noteNameToMidi('A#4')).toBe(70);
    });

    it('should throw error for invalid note names', () => {
      expect(() => noteNameToMidi('H4')).toThrow();
      expect(() => noteNameToMidi('C')).toThrow();
      expect(() => noteNameToMidi('invalid')).toThrow();
    });
  });

  describe('getCentDeviation', () => {
    it('should return 0 cents for exact frequency', () => {
      const a4Freq = midiToFrequency(69); // Exact A4
      expect(getCentDeviation(a4Freq)).toBeCloseTo(0, 1);
    });

    it('should return positive cents for sharp (higher) pitch', () => {
      const a4Freq = midiToFrequency(69);
      const sharpFreq = a4Freq * 2 ** (0.25 / 12); // 25 cents sharp
      expect(getCentDeviation(sharpFreq)).toBeCloseTo(25, 0);
    });

    it('should return negative cents for flat (lower) pitch', () => {
      const a4Freq = midiToFrequency(69);
      const flatFreq = a4Freq * 2 ** (-0.25 / 12); // 25 cents flat
      expect(getCentDeviation(flatFreq)).toBeCloseTo(-25, 0);
    });
  });

  describe('frequencyToNoteName', () => {
    it('should return C4 for 261.63Hz', () => {
      expect(frequencyToNoteName(261.63)).toBe('C4');
    });

    it('should return A4 for 440Hz', () => {
      expect(frequencyToNoteName(440)).toBe('A4');
    });

    it('should round to nearest semitone', () => {
      // Slightly sharp C4 should still be C4
      expect(frequencyToNoteName(265)).toBe('C4');
    });
  });

  describe('getNoteInfo', () => {
    it('should return complete note info for 440Hz', () => {
      const info = getNoteInfo(440);

      expect(info.note).toBe('A4');
      expect(info.frequency).toBe(440);
      expect(info.targetFrequency).toBeCloseTo(440, 2);
      expect(info.cents).toBeCloseTo(0, 1);
      expect(info.midi).toBe(69);
    });

    it('should calculate cents deviation', () => {
      const sharpA4 = 445; // Slightly sharp
      const info = getNoteInfo(sharpA4);

      expect(info.note).toBe('A4');
      expect(info.cents).toBeGreaterThan(0);
    });

    it('should handle zero/invalid frequency', () => {
      const info = getNoteInfo(0);

      expect(info.note).toBeNull();
      expect(info.frequency).toBe(0);
      expect(info.cents).toBe(0);
    });
  });

  describe('checkNoteMatch', () => {
    it('should match exact frequency to target note', () => {
      const c4Freq = midiToFrequency(60);
      const result = checkNoteMatch(c4Freq, 'C4', 25);

      expect(result.match).toBe(true);
      expect(result.cents).toBeCloseTo(0, 1);
    });

    it('should match within tolerance', () => {
      const c4Freq = midiToFrequency(60);
      const slightlySharp = c4Freq * 2 ** (0.15 / 12); // 15 cents sharp

      const result = checkNoteMatch(slightlySharp, 'C4', 25);
      expect(result.match).toBe(true);
    });

    it('should not match outside tolerance', () => {
      const c4Freq = midiToFrequency(60);
      const waySharp = c4Freq * 2 ** (0.40 / 12); // 40 cents sharp

      const result = checkNoteMatch(waySharp, 'C4', 25);
      expect(result.match).toBe(false);
    });

    it('should return cent deviation and target frequency', () => {
      const result = checkNoteMatch(440, 'A4', 25);

      expect(result.targetFrequency).toBeCloseTo(440, 2);
      expect(result.cents).toBeCloseTo(0, 1);
    });
  });

  describe('getCMajorScale', () => {
    it('should return C major scale notes for octave 4', () => {
      const scale = getCMajorScale(4);

      expect(scale).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
      expect(scale.length).toBe(8);
    });

    it('should work for different octaves', () => {
      const scale3 = getCMajorScale(3);
      expect(scale3).toEqual(['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4']);
    });
  });

  describe('getCMajorScaleFrequencies', () => {
    it('should return frequencies for C4-C5 scale', () => {
      const result = getCMajorScaleFrequencies(4);

      expect(result.notes.length).toBe(8);
      expect(result.notes[0].note).toBe('C4');
      expect(result.notes[7].note).toBe('C5');
      expect(result.min).toBeCloseTo(261.63, 1); // C4
      expect(result.max).toBeCloseTo(523.25, 1); // C5
    });

    it('should have correct frequency for A4', () => {
      const result = getCMajorScaleFrequencies(4);
      const a4 = result.notes.find((n) => n.note === 'A4');

      expect(a4.frequency).toBeCloseTo(440, 2);
    });
  });

  describe('Integration: Round-trip conversions', () => {
    it('should maintain accuracy in frequency <-> MIDI <-> frequency', () => {
      const original = 440;
      const midi = frequencyToMidi(original);
      const converted = midiToFrequency(midi);

      expect(converted).toBeCloseTo(original, 2);
    });

    it('should maintain accuracy in note <-> MIDI <-> note', () => {
      const original = 'C4';
      const midi = noteNameToMidi(original);
      const converted = midiToNoteName(midi);

      expect(converted).toBe(original);
    });
  });
});
