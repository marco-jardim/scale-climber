# Scale Climber - Vocal Pitch Training Game
## Comprehensive Implementation Plan

**Document Version**: 1.0  
**Created**: January 2025  
**Author**: Technical Planning Team  
**Status**: Draft for Review

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [Phase 1: Audio Foundation](#phase-1-audio-foundation)
5. [Phase 2: Game Logic](#phase-2-game-logic)
6. [Phase 3: Visual Design](#phase-3-visual-design)
7. [Phase 4: Polish & Accessibility](#phase-4-polish--accessibility)
8. [Phase 5: Deployment](#phase-5-deployment)
9. [Implementation Timeline](#implementation-timeline)
10. [Testing Strategy](#testing-strategy)
11. [Risk Mitigation](#risk-mitigation)
12. [Success Metrics](#success-metrics)
13. [Senior PM/QA Review & Findings](#senior-pmqa-review--findings)

---

## Executive Summary

**Scale Climber** is a browser-based game designed to help users train their vocal pitch by gamifying the process of singing a C major scale. Players guide an animated character up a musical mountain by singing correct pitches, receiving real-time visual feedback and scoring based on accuracy.

**Key Technical Challenges:**
- Sub-50ms audio latency for responsive feedback
- ±5 cent pitch detection accuracy
- Cross-browser compatibility without server dependencies
- Engaging visuals at 60fps performance

**Target Deployment**: GitHub Pages (fully static, client-side application)

---

## Project Overview

### Product Vision

**Name**: Scale Climber  
**Tagline**: "Climb the musical mountain, one note at a time!"

**Core Concept**: A browser-based game where players guide a character up a musical staircase by singing the correct pitches of a C major scale (C-D-E-F-G-A-B-C). The character reacts humorously to pitch accuracy—celebrating when on target, struggling comically when off-pitch.

### Target Users

| User Segment | Needs | Priority |
|--------------|-------|----------|
| Beginner singers | Learn pitch matching basics | High |
| Choir members | Warm-up exercises | Medium |
| Voice students | Supplemental practice tool | High |
| Music teachers | Classroom engagement tool | Medium |
| Casual users | Fun musical game | Low |

### Core Features

1. **Real-time pitch detection** with visual feedback
2. **Continuous scale challenge** (C4 to C5, non-stop)
3. **Animated character** responding to pitch accuracy
4. **Scoring system** with grades and high scores
5. **Multiple octave ranges** for different voice types
6. **Offline-capable** (runs entirely in browser)

---

## Technical Architecture

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| UI Framework | Vanilla JS + HTML5 Canvas | No dependencies, small bundle, full control |
| Audio Processing | Web Audio API | Native browser support, low latency |
| Pitch Detection | YIN Algorithm (custom) | Proven accuracy, well-documented |
| Build Tool | Vite | Fast dev server, optimized production builds |
| Testing | Vitest + Playwright | Unit + E2E coverage |
| Deployment | GitHub Pages | Free, reliable, no server needed |

### Project Structure

```
scale-climber/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── public/
│   ├── assets/
│   │   ├── sprites/            # Character animations
│   │   ├── backgrounds/        # Game backgrounds
│   │   └── sounds/             # Audio feedback files
│   ├── favicon.ico
│   └── manifest.json           # PWA manifest
├── src/
│   ├── index.html
│   ├── main.js                 # Application entry point
│   ├── styles.css
│   ├── audio/
│   │   ├── AudioCapture.js     # Microphone handling
│   │   ├── PitchDetector.js    # YIN algorithm implementation
│   │   ├── PitchDetector.worker.js  # Web Worker for processing
│   │   └── NoteMapper.js       # Frequency → Note conversion
│   ├── game/
│   │   ├── GameEngine.js       # Main game loop & state machine
│   │   ├── ScaleChallenge.js   # Scale progression logic
│   │   ├── ScoreSystem.js      # Points & accuracy tracking
│   │   └── DifficultyManager.js # Difficulty presets
│   ├── visuals/
│   │   ├── Renderer.js         # Canvas rendering coordinator
│   │   ├── Character.js        # Animated character controller
│   │   ├── Background.js       # Parallax background layers
│   │   ├── PitchMeter.js       # Real-time pitch visualization
│   │   └── ParticleSystem.js   # Celebration effects
│   ├── ui/
│   │   ├── StartScreen.js      # Title & mic permission
│   │   ├── HUD.js              # In-game overlay
│   │   ├── ResultsScreen.js    # End-of-game summary
│   │   ├── SettingsPanel.js    # Configuration options
│   │   └── PauseMenu.js        # Pause overlay
│   └── utils/
│       ├── constants.js        # Note frequencies, thresholds
│       ├── helpers.js          # Utility functions
│       └── storage.js          # LocalStorage wrapper
├── tests/
│   ├── unit/
│   │   ├── PitchDetector.test.js
│   │   ├── NoteMapper.test.js
│   │   └── ScoreSystem.test.js
│   ├── integration/
│   │   └── GameFlow.test.js
│   └── fixtures/
│       └── audio-samples/      # Test audio files
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
```

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER ENVIRONMENT                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────────────────────────────────┐  │
│  │  MICROPHONE  │────▶│           WEB AUDIO API                   │  │
│  └──────────────┘     │  ┌────────────┐  ┌───────────────────┐   │  │
│                       │  │ AudioCtx   │──│ AnalyserNode      │   │  │
│                       │  └────────────┘  └─────────┬─────────┘   │  │
│                       └────────────────────────────┼─────────────┘  │
│                                                    │                 │
│                                    Float32Array buffer               │
│                                                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    WEB WORKER (Off Main Thread)              │    │
│  │  ┌─────────────────┐    ┌─────────────────┐                 │    │
│  │  │ PitchDetector   │───▶│  NoteMapper     │                 │    │
│  │  │ (YIN Algorithm) │    │  (Hz → Note)    │                 │    │
│  │  └─────────────────┘    └────────┬────────┘                 │    │
│  └─────────────────────────────────┼───────────────────────────┘    │
│                                    │                                 │
│                    { note: 'C4', cents: +5, confidence: 0.92 }      │
│                                    ▼                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      MAIN THREAD                              │   │
│  │                                                               │   │
│  │  ┌───────────────┐    ┌───────────────┐    ┌──────────────┐  │   │
│  │  │  GameEngine   │◀──▶│ ScaleChallenge│◀──▶│ ScoreSystem  │  │   │
│  │  │  (State Mgmt) │    │ (Progression) │    │ (Points)     │  │   │
│  │  └───────┬───────┘    └───────────────┘    └──────────────┘  │   │
│  │          │                                                    │   │
│  │          ▼                                                    │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │                  RENDERER (60fps)                      │   │   │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────┐  │   │   │
│  │  │  │ Character │ │Background │ │PitchMeter │ │  HUD  │  │   │   │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────┘  │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                    │                                 │
│                                    ▼                                 │
│                          ┌─────────────────┐                        │
│                          │  HTML5 CANVAS   │                        │
│                          └─────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Audio Foundation

### 1.1 Microphone Capture Module

**Objective**: Reliably capture audio input with minimal latency across all target browsers.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| AF-001 | Request microphone permission | Must | Permission dialog appears; grant/deny handled gracefully |
| AF-002 | Create audio processing pipeline | Must | AudioContext + AnalyserNode connected |
| AF-003 | Handle browser compatibility | Must | Works on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| AF-004 | Implement gain normalization | Should | Consistent levels across different microphones |
| AF-005 | Support sample rates | Must | Handle 44.1kHz and 48kHz |
| AF-006 | Graceful degradation | Must | Clear error message if Web Audio unavailable |

#### Technical Specification

```javascript
// AudioCapture.js - Core Configuration
const AUDIO_CONFIG = {
  fftSize: 2048,              // Balance between frequency resolution and latency
  smoothingTimeConstant: 0.3, // Slight smoothing to reduce jitter
  minDecibels: -90,
  maxDecibels: -10,
  targetSampleRate: 44100,
  bufferSize: 2048            // ~46ms at 44.1kHz
};

// Browser Compatibility Matrix
const BROWSER_SUPPORT = {
  'Chrome': { minVersion: 90, audioWorklet: true },
  'Firefox': { minVersion: 88, audioWorklet: true },
  'Safari': { minVersion: 14, audioWorklet: false }, // Fallback to ScriptProcessor
  'Edge': { minVersion: 90, audioWorklet: true }
};
```

#### Test Cases

| Test ID | Scenario | Given | When | Then |
|---------|----------|-------|------|------|
| AF-T001 | Permission granted | User on start screen | Clicks "Start" and grants permission | Audio stream captured, visual confirmation shown |
| AF-T002 | Permission denied | User on start screen | Clicks "Start" and denies permission | Clear error message with retry option |
| AF-T003 | No microphone | Device has no mic | Attempts to start | Helpful error: "No microphone detected" |
| AF-T004 | Audio data flow | Microphone active | User makes sound | AnalyserNode receives non-zero data |
| AF-T005 | Sample rate handling | 48kHz device | Audio captured | Pitch detection adjusts calculations |

#### Definition of Done

- [ ] All test cases pass
- [ ] Works on all target browsers (manual verification)
- [ ] Latency measured and documented (<50ms)
- [ ] Error states have user-friendly messages
- [ ] Code reviewed and documented

---

### 1.2 Pitch Detection (YIN Algorithm)

**Objective**: Accurately detect fundamental frequency with sub-semitone precision.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| PD-001 | Implement YIN autocorrelation | Must | Detects F0 within ±5 cents for sustained tones |
| PD-002 | Parabolic interpolation | Must | Sub-sample accuracy achieved |
| PD-003 | Confidence scoring | Must | Returns 0-1 confidence with each detection |
| PD-004 | Noise gate | Must | Rejects input below -40dB threshold |
| PD-005 | Web Worker processing | Should | Detection runs off main thread |
| PD-006 | Frequency range | Must | Accurate from 80Hz (E2) to 1000Hz (B5) |

#### YIN Algorithm Parameters

```javascript
// PitchDetector.js - YIN Configuration
const YIN_CONFIG = {
  // Core parameters
  threshold: 0.15,              // Aperiodicity threshold (lower = stricter)
  probabilityThreshold: 0.7,    // Minimum confidence to report pitch
  
  // Frequency bounds
  minFrequency: 80,             // ~E2 - lowest expected pitch
  maxFrequency: 1000,           // ~B5 - highest expected pitch
  
  // Derived from sample rate
  minPeriod: null,              // Calculated: sampleRate / maxFrequency
  maxPeriod: null,              // Calculated: sampleRate / minFrequency
  
  // Buffer settings
  bufferSize: 2048,             // Must match AudioCapture
  sampleRate: 44100             // Updated dynamically
};

// YIN Algorithm Steps
// 1. Compute difference function d(τ)
// 2. Compute cumulative mean normalized difference d'(τ)
// 3. Apply absolute threshold
// 4. Find first minimum below threshold
// 5. Parabolic interpolation for sub-sample accuracy
// 6. Convert period to frequency: f = sampleRate / period
```

#### Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| Processing time per buffer | <5ms | 10ms |
| Memory allocation | <1MB | 2MB |
| Detection latency (total) | <30ms | 50ms |

#### Test Cases

| Test ID | Scenario | Input | Expected Output |
|---------|----------|-------|-----------------|
| PD-T001 | Pure A4 tone | 440Hz sine wave | frequency: 440±2Hz, confidence: >0.9 |
| PD-T002 | Pure C4 tone | 261.63Hz sine wave | frequency: 261.63±1Hz, confidence: >0.9 |
| PD-T003 | White noise | Random signal | frequency: null, confidence: <0.3 |
| PD-T004 | Low volume | 440Hz at -50dB | frequency: null (below noise gate) |
| PD-T005 | Octave accuracy | 261.63Hz (C4) | Note: C4, NOT C3 or C5 |
| PD-T006 | Complex waveform | Human voice "ah" at A4 | frequency: 440±10Hz, confidence: >0.7 |
| PD-T007 | Frequency sweep | 200Hz → 600Hz glide | Tracks frequency throughout |
| PD-T008 | Edge frequency | 80Hz sine | Detected accurately |
| PD-T009 | Edge frequency | 1000Hz sine | Detected accurately |

#### Definition of Done

- [ ] All unit tests pass with generated audio
- [ ] Manual testing with real voices (3+ testers)
- [ ] Processing time <10ms verified via performance profiling
- [ ] Web Worker implementation complete
- [ ] Algorithm documented with references

---

### 1.3 Note Mapping

**Objective**: Convert detected frequencies to musical notes with cent deviation.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| NM-001 | Frequency to note conversion | Must | Correct note name + octave |
| NM-002 | Cent deviation calculation | Must | Deviation within ±0.5 cents of actual |
| NM-003 | Tolerance zone classification | Must | Correct categorization (perfect/good/ok/miss) |
| NM-004 | Multiple octave support | Must | C2-C6 range supported |
| NM-005 | Equal temperament tuning | Must | A4 = 440Hz standard |

#### Musical Constants

```javascript
// constants.js - Musical Reference Data

// A4 = 440Hz, Equal Temperament
const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

// C Major Scale - Multiple Octaves
const C_MAJOR_SCALES = {
  bass: {     // C2-C3
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31,
    G2: 98.00, A2: 110.00, B2: 123.47, C3: 130.81
  },
  baritone: { // C3-C4
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
    G3: 196.00, A3: 220.00, B3: 246.94, C4: 261.63
  },
  alto: {     // C4-C5 (DEFAULT)
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25
  },
  soprano: {  // C5-C6
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50
  }
};

// Pitch Tolerance Thresholds (in cents)
const PITCH_TOLERANCE = {
  perfect: 10,      // ±10 cents - green zone
  good: 25,         // ±25 cents - yellow zone
  acceptable: 50,   // ±50 cents - orange zone
  // Beyond 50 cents = miss (red zone)
};

// Note names for display
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
```

#### Conversion Formulas

```javascript
// Frequency to MIDI number (floating point for cent accuracy)
function frequencyToMidi(frequency) {
  return 69 + 12 * Math.log2(frequency / 440);
}

// MIDI number to frequency
function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Get note name and octave from MIDI
function midiToNoteName(midi) {
  const noteIndex = Math.round(midi) % 12;
  const octave = Math.floor(Math.round(midi) / 12) - 1;
  return { note: NOTE_NAMES[noteIndex], octave };
}

// Calculate cent deviation from nearest note
function getCentDeviation(frequency) {
  const midi = frequencyToMidi(frequency);
  const nearestMidi = Math.round(midi);
  return (midi - nearestMidi) * 100; // cents
}
```

#### Test Cases

| Test ID | Input Frequency | Expected Note | Expected Cents |
|---------|-----------------|---------------|----------------|
| NM-T001 | 440.00 Hz | A4 | 0 |
| NM-T002 | 261.63 Hz | C4 | 0 |
| NM-T003 | 445.00 Hz | A4 | +20 |
| NM-T004 | 254.18 Hz | C4 | -50 |
| NM-T005 | 523.25 Hz | C5 | 0 |
| NM-T006 | 130.81 Hz | C3 | 0 |

---

## Phase 2: Game Logic

### 2.1 Game State Machine

**Objective**: Manage game flow with clear state transitions and event handling.

#### State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME STATE MACHINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌────────────┐                                               │
│    │   INIT     │ ─── assets loaded ───▶ ┌────────────┐        │
│    │  (Loading) │                        │   MENU     │        │
│    └────────────┘                        │  (Title)   │        │
│                                          └─────┬──────┘        │
│                                                │               │
│          ┌─────────────────────────────────────┘               │
│          │ user clicks "Start"                                 │
│          ▼                                                      │
│    ┌────────────┐                                               │
│    │ PERMISSION │ ─── granted ───▶ ┌────────────────┐          │
│    │  REQUEST   │                  │ OCTAVE_SELECT  │          │
│    └─────┬──────┘                  └───────┬────────┘          │
│          │ denied                          │ octave chosen     │
│          ▼                                 ▼                    │
│    ┌────────────┐                  ┌────────────────┐          │
│    │   ERROR    │                  │   COUNTDOWN    │          │
│    │  (Retry)   │                  │   (3-2-1-GO)   │          │
│    └────────────┘                  └───────┬────────┘          │
│                                            │                    │
│                                            ▼                    │
│    ┌──────────────────────────────────────────────────────┐    │
│    │                    PLAYING                            │    │
│    │  ┌─────────────────────────────────────────────────┐ │    │
│    │  │ Sub-states:                                      │ │    │
│    │  │  • LISTENING   - Waiting for pitch input        │ │    │
│    │  │  • DETECTING   - Processing pitch               │ │    │
│    │  │  • NOTE_HIT    - Success animation (500ms)      │ │    │
│    │  │  • TRANSITIONING - Moving to next note          │ │    │
│    │  └─────────────────────────────────────────────────┘ │    │
│    └───────────────────────┬──────────────────────────────┘    │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐            │
│   │  PAUSED  │      │ COMPLETE │      │  FAILED  │            │
│   │          │      │ (Victory)│      │ (Timeout)│            │
│   └────┬─────┘      └────┬─────┘      └────┬─────┘            │
│        │                 │                 │                   │
│        │                 └────────┬────────┘                   │
│        │                          ▼                            │
│        │                   ┌────────────┐                      │
│        │                   │  RESULTS   │                      │
│        │                   │  (Summary) │                      │
│        │                   └─────┬──────┘                      │
│        │                         │                             │
│        └─────────────────────────┴────────▶ MENU               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### State Definitions

| State | Entry Condition | Exit Condition | Actions |
|-------|-----------------|----------------|---------|
| INIT | App starts | Assets loaded | Load sprites, sounds, fonts |
| MENU | Assets ready OR game ends | Start clicked | Show title, high scores |
| PERMISSION_REQUEST | Start clicked | Granted/Denied | Request mic access |
| OCTAVE_SELECT | Permission granted | Selection made | Show voice range options |
| COUNTDOWN | Octave selected | Count reaches 0 | 3-2-1-GO animation |
| PLAYING | Countdown ends | Complete/Fail/Pause | Process audio, update game |
| PAUSED | Pause triggered | Resume/Quit | Freeze game state |
| COMPLETE | Final note hit | Continue clicked | Victory animation |
| FAILED | Timeout/Give up | Continue clicked | Fail animation |
| RESULTS | Complete/Failed | Continue clicked | Show scores, save high score |

---

### 2.2 Scale Challenge Logic

**Objective**: Track progress through the scale with precise timing and transition detection.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| SC-001 | Track current target note | Must | Correct note displayed, updated on progression |
| SC-002 | Note hold detection | Must | 500ms sustained within tolerance = hit |
| SC-003 | Automatic progression | Must | Advances after successful hit |
| SC-004 | Timeout handling | Must | Fail after 3s silence between notes |
| SC-005 | Transition detection | Should | Detect intentional move to next note |
| SC-006 | Continuous mode | Must | No pause between notes (breathing allowed) |

#### Challenge Configuration

```javascript
// ScaleChallenge.js - Configuration
const CHALLENGE_CONFIG = {
  // Timing
  holdDuration: 500,           // ms required to hold note
  maxSilenceGap: 3000,         // ms before timeout failure
  transitionThreshold: 100,    // cents toward next note to start transition
  
  // Note sequence (indexes into scale array)
  noteSequence: [0, 1, 2, 3, 4, 5, 6, 7], // C, D, E, F, G, A, B, C
  
  // Feedback timing
  successAnimationDuration: 300, // ms
  
  // Difficulty modifiers
  difficulty: {
    easy: {
      holdDuration: 400,
      toleranceMultiplier: 1.5,   // 50% wider tolerance zones
      maxSilenceGap: 5000
    },
    normal: {
      holdDuration: 500,
      toleranceMultiplier: 1.0,
      maxSilenceGap: 3000
    },
    hard: {
      holdDuration: 600,
      toleranceMultiplier: 0.75,  // 25% tighter tolerance
      maxSilenceGap: 2000
    }
  }
};
```

#### Note Progress Tracking

```javascript
// Data structure for tracking each note attempt
const NoteAttempt = {
  targetNote: 'C4',
  targetFrequency: 261.63,
  startTime: null,           // When user first entered tolerance zone
  holdTime: 0,               // Accumulated time within tolerance
  pitchSamples: [],          // Array of { frequency, cents, timestamp }
  averageCents: 0,           // Running average deviation
  bestCents: Infinity,       // Closest approach
  status: 'waiting',         // waiting | active | success | failed
  score: 0
};
```

#### Test Cases

| Test ID | Scenario | Given | When | Then |
|---------|----------|-------|------|------|
| SC-T001 | Successful note | Target is C4 | User holds C4 for 500ms within ±25 cents | Note marked hit, advance to D4 |
| SC-T002 | Hold interrupted | User holding C4 (300ms) | Pitch goes outside tolerance | Hold timer resets |
| SC-T003 | Timeout fail | On note D4 | 3.1 seconds of silence | Game ends, results shown |
| SC-T004 | Scale complete | On note C5 (final) | User holds C5 for 500ms | Victory state triggered |
| SC-T005 | Transition detection | Holding C4 successfully | Pitch shifts 120 cents toward D4 | Begin transition, update target |
| SC-T006 | Wrong direction | Target is D4 | User sings C4 | Does not count, no progression |

---

### 2.3 Scoring System

**Objective**: Calculate fair scores that reward accuracy and speed.

#### Scoring Formula

```javascript
// ScoreSystem.js - Scoring Algorithm

/**
 * Calculate score for a single note attempt
 * @param {number} centDeviation - Average cent deviation from target
 * @param {number} timeToHit - Milliseconds from note becoming active to success
 * @param {number} comboMultiplier - Current combo count (1 = no combo)
 * @returns {object} { points, breakdown }
 */
function calculateNoteScore(centDeviation, timeToHit, comboMultiplier) {
  const BASE_POINTS = 100;
  
  // Accuracy multiplier (based on average cent deviation)
  let accuracyMultiplier;
  let accuracyLabel;
  if (centDeviation <= 10) {
    accuracyMultiplier = 1.0;
    accuracyLabel = 'PERFECT';
  } else if (centDeviation <= 25) {
    accuracyMultiplier = 0.8;
    accuracyLabel = 'GREAT';
  } else if (centDeviation <= 50) {
    accuracyMultiplier = 0.5;
    accuracyLabel = 'OK';
  } else {
    accuracyMultiplier = 0.2;
    accuracyLabel = 'MISS';
  }
  
  // Speed bonus: max 1.5x for immediate hit, 1.0x at 2 seconds
  const speedBonus = Math.max(1.0, 1.5 - (timeToHit / 4000));
  
  // Combo bonus: 10% per consecutive perfect/great
  const comboBonus = 1 + (Math.min(comboMultiplier - 1, 7) * 0.1);
  
  const points = Math.round(BASE_POINTS * accuracyMultiplier * speedBonus * comboBonus);
  
  return {
    points,
    breakdown: {
      base: BASE_POINTS,
      accuracyMultiplier,
      accuracyLabel,
      speedBonus: speedBonus.toFixed(2),
      comboBonus: comboBonus.toFixed(2),
      comboCount: comboMultiplier
    }
  };
}

// Grade thresholds (8 notes × 150 max = 1200 max points)
const GRADE_THRESHOLDS = {
  S: { min: 1100, label: 'S', color: '#FFD700', message: 'PERFECT PITCH!' },
  A: { min: 960,  label: 'A', color: '#00FF00', message: 'EXCELLENT!' },
  B: { min: 720,  label: 'B', color: '#00BFFF', message: 'GREAT JOB!' },
  C: { min: 480,  label: 'C', color: '#FFA500', message: 'NOT BAD!' },
  D: { min: 240,  label: 'D', color: '#FF6347', message: 'KEEP PRACTICING' },
  F: { min: 0,    label: 'F', color: '#FF0000', message: 'TRY AGAIN!' }
};
```

#### High Score Persistence

```javascript
// storage.js - LocalStorage wrapper
const STORAGE_KEY = 'scaleClimber_highScores';
const MAX_SCORES = 10;

function saveHighScore(score, octave, difficulty) {
  const scores = getHighScores();
  scores.push({
    score,
    octave,
    difficulty,
    date: new Date().toISOString(),
    id: crypto.randomUUID()
  });
  scores.sort((a, b) => b.score - a.score);
  scores.splice(MAX_SCORES); // Keep only top 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function getHighScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
```

---

## Phase 3: Visual Design

### 3.1 Art Direction

**Style**: Cute, cartoonish 2D with vibrant colors. Think "Duolingo meets Guitar Hero."

#### Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Perfect | Gold | #FFD700 | Perfect hits, S rank |
| Great | Lime | #32CD32 | Great hits, A rank |
| Good | Sky Blue | #00BFFF | Good hits, B rank |
| OK | Orange | #FFA500 | OK hits, C rank |
| Miss | Red | #FF4444 | Misses, low ranks |
| Background Sky | Gradient | #87CEEB → #E0F6FF | Sky backdrop |
| Mountain | Purple | #8B7BB8 | Mountain/stairs |
| Character Primary | Teal | #20B2AA | Main character color |

#### Character: "Melody"

```
Visual States (Sprite Sheet Layout):
┌─────────────────────────────────────────────────────────┐
│  IDLE      │  LISTEN   │  CLIMB    │  PERFECT  │ WOBBLE │
│  (4 frame) │  (2 frame)│  (6 frame)│  (4 frame)│(4 frame│
├────────────┼───────────┼───────────┼───────────┼────────┤
│   😊       │   🎧      │   🧗      │   🌟      │   😰   │
│  ╱│╲      │   ╱│╲    │   ╱│╲    │   ╲│╱    │   ~│~  │
│  / \       │   / \     │   /|\     │   \\//    │   / \  │
└────────────┴───────────┴───────────┴───────────┴────────┘
```

#### Screen Mockups

**Main Game Screen:**
```
┌──────────────────────────────────────────────────────────────┐
│  ♪ SCALE CLIMBER                      SCORE: 450  COMBO: 3x  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│         ☁️           ⭐            ☁️                        │
│                     ☁️                                       │
│                                  🏔️                          │
│                               ┌─────┐                        │
│                            ┌──┤ C5  │ ← GOAL                 │
│                         ┌──┤ B4  ├──┘                        │
│                      ┌──┤ A4  ├──┘                           │
│                   ┌──┤ G4  ├──┘                              │
│                ┌──┤ F4  ├──┘                                 │
│             ┌──┤ E4  ├──┘                                    │
│          ┌──┤ D4  ├──┘           ← Next target (pulsing)     │
│       😊─┤ C4  ├──┘              ← Character here            │
│      ════╧═════╧════                                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Pitch:      ◀────────[████D4████]────────────▶         │
│                        C4 ───────●─────── D4                 │
│                              ↑                               │
│                         You: D4 +8¢                          │
│                                                              │
│  Target: D4  │  Hold: ████████░░ 400ms  │  ✓C4               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Animation Specifications

| Animation | Frames | Duration | Trigger |
|-----------|--------|----------|---------|
| Idle breathing | 4 | 2000ms loop | Default state |
| Listening | 2 | 500ms loop | Mic active |
| Climbing step | 6 | 400ms | Note success |
| Perfect celebration | 4 | 600ms | Perfect hit |
| Wobble/struggle | 4 | 300ms loop | Off pitch |
| Fall | 8 | 800ms | Bad miss |
| Victory dance | 12 | 2000ms loop | Scale complete |

### 3.3 Pitch Visualization

**Requirements:**
- Horizontal bar showing ±100 cents range around target
- Current pitch indicator (arrow/marker) with smooth interpolation
- Color-coded zones matching tolerance thresholds
- Note name labels at zone boundaries
- Optional: waveform/spectrogram display

```javascript
// PitchMeter.js - Configuration
const PITCH_METER_CONFIG = {
  width: 400,
  height: 60,
  centRange: 100,           // ±100 cents displayed
  indicatorSmoothing: 0.3,  // Lerp factor for smooth movement
  zones: [
    { cents: 10, color: '#32CD32' },   // Perfect - green
    { cents: 25, color: '#FFD700' },   // Great - gold
    { cents: 50, color: '#FFA500' },   // OK - orange
    { cents: 100, color: '#FF4444' }   // Miss - red
  ]
};
```

---

## Phase 4: Polish & Accessibility

### 4.1 Audio Feedback

| Event | Sound | Duration | Notes |
|-------|-------|----------|-------|
| Note hit (perfect) | Bright chime + voice "Perfect!" | 400ms | Pitch matches note |
| Note hit (great) | Soft chime | 300ms | Pleasant, encouraging |
| Note hit (ok) | Click | 200ms | Neutral |
| Miss | Soft buzz | 200ms | Not harsh/annoying |
| Combo milestone (5x) | Fanfare | 500ms | Celebratory |
| Victory | Full celebration | 2000ms | Musical flourish |
| Failure | Sad trombone | 1000ms | Humorous, not punishing |

**Reference Tone Feature:**
- Optional guide melody playing target notes
- Configurable volume (0-100%)
- Can be toggled during gameplay

### 4.2 Accessibility Requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| A11Y-001 | Keyboard navigation | Tab through all controls, Enter to activate |
| A11Y-002 | Screen reader support | ARIA labels, live regions for state changes |
| A11Y-003 | High contrast mode | Toggle in settings, WCAG AA compliant |
| A11Y-004 | Colorblind modes | Patterns/shapes in addition to colors |
| A11Y-005 | Reduced motion | Respect prefers-reduced-motion, simpler animations |
| A11Y-006 | Text scaling | Support browser font scaling up to 200% |

### 4.3 Performance Budgets

| Metric | Budget | Red Line |
|--------|--------|----------|
| First Contentful Paint | <1.0s | 2.0s |
| Time to Interactive | <2.0s | 3.5s |
| Total Bundle Size (gzipped) | <150KB | 250KB |
| Frame Rate | 60fps | 30fps minimum |
| Audio Latency | <30ms | 50ms |
| Memory Usage | <50MB | 100MB |
| CPU Usage (idle) | <5% | 15% |

---

## Phase 5: Deployment

### 5.1 Build Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scale-climber/',  // GitHub Pages subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          audio: ['./src/audio/PitchDetector.js', './src/audio/AudioCapture.js'],
          game: ['./src/game/GameEngine.js', './src/game/ScaleChallenge.js']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
});
```

### 5.2 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

### 5.3 PWA Configuration

```json
// public/manifest.json
{
  "name": "Scale Climber - Vocal Pitch Training",
  "short_name": "Scale Climber",
  "description": "Train your vocal pitch by climbing the musical mountain!",
  "start_url": "/scale-climber/",
  "display": "standalone",
  "background_color": "#87CEEB",
  "theme_color": "#20B2AA",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Implementation Timeline

### Gantt Chart

```
Week 1: Audio Foundation
├── Day 1-2: AudioCapture module + mic permission flow
├── Day 3-4: YIN pitch detection implementation
├── Day 5: Web Worker integration
├── Day 6: NoteMapper + unit tests
└── Day 7: Integration testing with real voices

Week 2: Game Logic
├── Day 1-2: GameEngine state machine
├── Day 3-4: ScaleChallenge progression logic
├── Day 5: ScoreSystem + localStorage
├── Day 6: Integration testing
└── Day 7: Bug fixes + polish

Week 3: Visuals (Part 1)
├── Day 1-2: Canvas renderer setup + background
├── Day 3-4: Character sprite implementation
├── Day 5: Animation system
├── Day 6: Pitch meter visualization
└── Day 7: Integration with game logic

Week 4: Visuals (Part 2) + UI
├── Day 1-2: Particle effects + celebrations
├── Day 3: Start screen + menus
├── Day 4: Results screen
├── Day 5: Settings panel
└── Day 6-7: UI polish + responsive design

Week 5: Polish + Deployment
├── Day 1-2: Audio feedback + sounds
├── Day 3: Accessibility implementation
├── Day 4: Performance optimization
├── Day 5: GitHub Actions setup + deployment
├── Day 6: Cross-browser testing
└── Day 7: Final bug fixes + launch
```

### Milestones

| Milestone | Date | Deliverable | Success Criteria |
|-----------|------|-------------|------------------|
| M1: Audio Prototype | End Week 1 | Working pitch detection | Detects C4-C5 within ±10 cents |
| M2: Playable Alpha | End Week 2 | Complete game loop (no visuals) | Can complete full scale challenge |
| M3: Visual Beta | End Week 4 | Full game with graphics | All screens functional |
| M4: Release | End Week 5 | Production deployment | Live on GitHub Pages |

---

## Testing Strategy

### Test Pyramid

```
                    ┌───────────────┐
                    │    E2E (5%)   │  ← Playwright: critical user flows
                    │   Playwright  │
                ┌───┴───────────────┴───┐
                │   Integration (20%)   │  ← Component interaction tests
                │       Vitest          │
            ┌───┴───────────────────────┴───┐
            │        Unit Tests (75%)       │  ← PitchDetector, ScoreSystem, etc.
            │            Vitest             │
            └───────────────────────────────┘
```

### Unit Test Coverage Targets

| Module | Target Coverage | Critical Paths |
|--------|-----------------|----------------|
| PitchDetector | 95% | YIN algorithm, frequency bounds |
| NoteMapper | 100% | Conversion accuracy |
| ScoreSystem | 95% | Score calculations, grade thresholds |
| ScaleChallenge | 90% | State transitions, timing logic |
| GameEngine | 85% | State machine transitions |

### Manual Test Checklist

#### Audio Testing
- [ ] Test with built-in laptop mic
- [ ] Test with external USB mic
- [ ] Test with headset mic
- [ ] Test with AirPods/Bluetooth
- [ ] Test in quiet environment
- [ ] Test in moderately noisy environment
- [ ] Test with different voice types (3+ testers)

#### Browser Compatibility
- [ ] Chrome (Windows, Mac, Linux)
- [ ] Firefox (Windows, Mac, Linux)
- [ ] Safari (Mac, iOS)
- [ ] Edge (Windows)
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet (Android)

#### Device Testing
- [ ] Desktop (1920×1080)
- [ ] Laptop (1366×768)
- [ ] Tablet (iPad, landscape)
- [ ] Tablet (iPad, portrait)
- [ ] Phone (iPhone 12+)
- [ ] Phone (Android, various sizes)

---

## Risk Mitigation

### Risk Register

| ID | Risk | Probability | Impact | Mitigation | Contingency |
|----|------|-------------|--------|------------|-------------|
| R1 | Pitch detection inaccurate | Medium | High | Use proven YIN algorithm; extensive calibration | Allow wider tolerances as fallback |
| R2 | High audio latency | Low | High | Web Workers; optimize buffer sizes | Display latency warning; adjust timing |
| R3 | Safari compatibility issues | Medium | Medium | Early testing; feature detection | AudioWorklet polyfill; graceful degradation |
| R4 | Poor mobile performance | Medium | Medium | Performance budgets; lazy loading | Reduce visual complexity on mobile |
| R5 | Mic feedback loops | Medium | Low | Recommend headphones; detect feedback | Auto-mute during detected feedback |
| R6 | Scope creep | High | Medium | Clear MVP definition; backlog grooming | Cut features, not quality |

---

## Success Metrics

### Quantitative KPIs

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Pitch Detection Accuracy | ±5 cents for 95% of sustained notes | Automated tests with generated tones |
| Audio Latency | <50ms end-to-end | Performance profiling |
| Frame Rate | 60fps on target devices | Chrome DevTools; user reports |
| First Meaningful Paint | <2 seconds | Lighthouse audit |
| Successful Scale Completion | 90% of users within 3 attempts | Analytics (optional) |
| Session Duration | >5 minutes average | Analytics (optional) |

### Qualitative Targets

- Users describe the game as "fun" and "helpful"
- Visual feedback is "clear" and "responsive"
- Difficulty feels "fair" and "achievable"
- Character animations are "cute" and "motivating"

---

## Appendix A: YIN Algorithm Reference

### Algorithm Steps

1. **Difference Function**: $d(\tau) = \sum_{j=0}^{W-1} (x_j - x_{j+\tau})^2$

2. **Cumulative Mean Normalized Difference**: $d'(\tau) = \begin{cases} 1 & \text{if } \tau = 0 \\ \frac{d(\tau)}{(\frac{1}{\tau}) \sum_{j=1}^{\tau} d(j)} & \text{otherwise} \end{cases}$

3. **Absolute Threshold**: Find first $\tau$ where $d'(\tau) < threshold$

4. **Parabolic Interpolation**: Refine $\tau$ using neighboring values

5. **Frequency**: $f_0 = \frac{f_s}{\tau_{refined}}$

### Implementation Reference

- De Cheveigné, A., & Kawahara, H. (2002). "YIN, a fundamental frequency estimator for speech and music." *The Journal of the Acoustical Society of America*, 111(4), 1917-1930.

---

## Appendix B: Musical Frequency Reference

### Equal Temperament (A4 = 440 Hz)

| Note | Frequency (Hz) | MIDI Number |
|------|----------------|-------------|
| C2 | 65.41 | 36 |
| C3 | 130.81 | 48 |
| C4 (Middle C) | 261.63 | 60 |
| D4 | 293.66 | 62 |
| E4 | 329.63 | 64 |
| F4 | 349.23 | 65 |
| G4 | 392.00 | 67 |
| A4 | 440.00 | 69 |
| B4 | 493.88 | 71 |
| C5 | 523.25 | 72 |
| C6 | 1046.50 | 84 |

### Cent Calculation

$cents = 1200 \times \log_2\left(\frac{f_{detected}}{f_{target}}\right)$

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Cent** | 1/100th of a semitone; logarithmic unit of pitch |
| **F0 / Fundamental Frequency** | The lowest frequency in a complex sound; perceived pitch |
| **YIN** | "Yin" from yin-yang; pitch detection algorithm |
| **Autocorrelation** | Signal compared against time-shifted copies of itself |
| **Aperiodicity** | Measure of how non-periodic a signal is |
| **MIDI Number** | Integer representation of musical pitch (0-127) |
| **Equal Temperament** | Tuning system dividing octave into 12 equal parts |
| **Noise Gate** | Threshold that mutes signals below certain amplitude |

---

# Senior PM/QA Review & Findings

**Reviewer**: Senior Product Manager with QA Engineering Background  
**Review Date**: January 2025  
**Review Type**: Comprehensive Plan Assessment

---

## Executive Assessment

**Overall Rating**: ⭐⭐⭐⭐ (4/5) - Strong plan with notable gaps requiring attention

The implementation plan demonstrates solid technical depth and structure. However, several critical areas need strengthening before development begins.

---

## Strengths Identified

### ✅ Technical Depth
- YIN algorithm specification is thorough with correct parameters
- Audio pipeline architecture is well-designed for low latency
- Frequency constants and musical theory are accurate

### ✅ Testing Strategy
- Good test pyramid structure
- Specific test cases for pitch detection edge cases
- Manual testing checklist is comprehensive

### ✅ State Machine Design
- Clear state transitions
- Proper handling of edge cases (timeout, pause)
- Sub-states within PLAYING state show good granularity

### ✅ Project Structure
- Logical file organization
- Clear separation of concerns
- Web Worker isolation for performance

---

## Critical Gaps & Required Actions

### 🔴 GAP 1: No User Research or Validation Plan

**Finding**: The plan jumps directly to implementation without validating core assumptions.

**Risk**: Building features users don't want; wrong difficulty calibration.

**Required Actions**:
- [ ] Add user interview phase (5-10 target users) before development
- [ ] Create paper prototype for early feedback on game mechanics
- [ ] Define usability testing protocol for alpha/beta milestones
- [ ] Add analytics events specification for post-launch learning

**Acceptance Criteria for Fix**:
- User research plan with interview script documented
- At least 5 user interviews conducted before Phase 1 complete
- Usability test plan with specific tasks and success metrics

---

### 🔴 GAP 2: Missing Error State Specifications

**Finding**: Error handling is mentioned but not fully specified. What happens when:
- Microphone disconnects mid-game?
- Browser tab loses focus?
- Device goes to sleep?
- AudioContext is suspended (Safari autoplay policy)?

**Risk**: Poor user experience; crashes; unrecoverable states.

**Required Actions**:
- [ ] Add Error State Handling section with specific scenarios
- [ ] Define recovery paths for each error type
- [ ] Specify user-facing error messages (copy review needed)
- [ ] Add test cases for error scenarios

**Error Scenarios to Document**:
| Scenario | Detection | User Message | Recovery |
|----------|-----------|--------------|----------|
| Mic disconnected | MediaStream.oninactive | "Microphone disconnected. Please reconnect." | Pause game, resume on reconnect |
| Tab hidden | visibilitychange event | Auto-pause | Resume when tab visible |
| AudioContext suspended | state === 'suspended' | "Tap to enable audio" | context.resume() on user gesture |
| Permission revoked | PermissionStatus.onchange | "Microphone access removed" | Return to permission request |

---

### 🔴 GAP 3: No Calibration / Onboarding Flow

**Finding**: Users are expected to immediately play without any pitch calibration or tutorial.

**Risk**: 
- Users with unusual mic gain will have poor experience
- First-time users won't understand mechanics
- No baseline established for difficulty adjustment

**Required Actions**:
- [ ] Add Calibration Phase to state machine (before COUNTDOWN)
- [ ] Design tutorial overlay for first-time users
- [ ] Implement automatic gain detection/normalization
- [ ] Store calibration data in localStorage

**Calibration Flow Specification**:
```
CALIBRATION STATE:
1. Prompt: "Make some noise to test your microphone"
2. Measure: Average amplitude over 3 seconds
3. Prompt: "Sing any comfortable note"
4. Measure: Detect pitch range (suggest appropriate octave)
5. Confirm: "Ready to climb? Your scale: [C4-C5]"
```

---

### 🟡 GAP 4: Incomplete Mobile Considerations

**Finding**: Mobile testing listed but mobile-specific challenges not addressed:
- Touch vs mouse interactions
- Portrait vs landscape handling
- iOS Safari audio restrictions
- Mobile keyboard interfering with game
- Battery/performance impact of continuous audio processing

**Required Actions**:
- [ ] Add Mobile-Specific Requirements section
- [ ] Define responsive breakpoints and layout changes
- [ ] Document iOS Safari audio unlock pattern
- [ ] Add mobile performance test cases
- [ ] Consider reduced-power mode for mobile

---

### 🟡 GAP 5: No Localization Strategy

**Finding**: All UI strings are hardcoded in English.

**Risk**: Limits international reach; technical debt if added later.

**Required Actions**:
- [ ] Define i18n architecture (recommend: simple JSON locale files)
- [ ] Extract all user-facing strings to locale file
- [ ] Document string formatting for plurals/variables
- [ ] Add RTL consideration (if Arabic/Hebrew planned)

---

### 🟡 GAP 6: Incomplete Security Considerations

**Finding**: No mention of:
- Content Security Policy for GitHub Pages
- Audio data handling (privacy)
- localStorage data validation

**Required Actions**:
- [ ] Document CSP headers for deployment
- [ ] Add privacy notice: "Audio is processed locally, never uploaded"
- [ ] Validate localStorage data on read (prevent injection)

---

### 🟡 GAP 7: Missing Definition of "Done" Per Phase

**Finding**: Individual features have acceptance criteria, but phase-level completion criteria are vague.

**Required Actions**:
- [ ] Add explicit DoD checklist for each phase
- [ ] Include code review, documentation, and deployment verification
- [ ] Define stakeholder sign-off process

**Example Phase 1 Definition of Done**:
- [ ] All AF-xxx and PD-xxx requirements pass acceptance criteria
- [ ] Unit test coverage >90% for audio modules
- [ ] Performance profiling shows <10ms pitch detection
- [ ] Code reviewed by at least 1 other developer
- [ ] Technical documentation updated
- [ ] Demo to stakeholders completed

---

## Test Coverage Analysis

### Missing Test Scenarios

| Category | Missing Test | Priority |
|----------|--------------|----------|
| Audio | Bluetooth mic latency handling | High |
| Audio | Very low/high pitch voices (outliers) | Medium |
| Audio | Background noise cancellation (lack thereof) | Medium |
| Game | Rapid note transitions (melisma singing) | Medium |
| Game | Exact boundary conditions (500ms hold, ±50 cents) | High |
| UI | Touch target sizes on mobile (44×44px minimum) | High |
| Performance | Memory leak during extended sessions | High |
| Integration | State persistence across page reload | Medium |

### Recommended Test Automation Additions

```javascript
// Additional test cases to add

describe('Boundary Conditions', () => {
  test('499ms hold does not register as hit', () => /* ... */);
  test('500ms hold registers as hit', () => /* ... */);
  test('pitch at exactly 50 cents deviation counts as acceptable', () => /* ... */);
  test('pitch at 51 cents deviation counts as miss', () => /* ... */);
});

describe('Extended Session', () => {
  test('no memory leak after 100 scale attempts', () => /* ... */);
  test('AudioContext remains active after 30 minutes', () => /* ... */);
});

describe('Interruption Recovery', () => {
  test('game pauses when tab hidden', () => /* ... */);
  test('game resumes correctly when tab visible', () => /* ... */);
  test('audio restarts after system sleep wake', () => /* ... */);
});
```

---

## Timeline Risk Assessment

| Phase | Allocated Time | Realistic Estimate | Risk Level |
|-------|---------------|-------------------|------------|
| Phase 1: Audio | 1 week | 1.5 weeks | 🟡 Medium |
| Phase 2: Game Logic | 1 week | 1 week | 🟢 Low |
| Phase 3: Visuals | 2 weeks | 2-3 weeks | 🟡 Medium |
| Phase 4: Polish | 1 week | 1.5 weeks | 🟡 Medium |
| Phase 5: Deploy | 2-3 days | 3-4 days | 🟢 Low |

**Timeline Recommendation**: Add 1-week buffer. Target 6 weeks instead of 5.

**Rationale**:
- YIN algorithm tuning often requires iteration
- Character animation quality tends to expand scope
- Cross-browser audio bugs are unpredictable
- Accessibility implementation typically underestimated

---

## Prioritized Backlog of Fixes

### Must Fix Before Development (P0)
1. Add calibration/onboarding flow specification
2. Document error state handling for all scenarios
3. Add Phase-level Definition of Done
4. Create user research plan

### Should Fix Before Alpha (P1)
5. Document mobile-specific requirements
6. Add missing test scenarios
7. Add security considerations
8. Define analytics events

### Can Fix During Development (P2)
9. Localization architecture
10. Extended session testing
11. Advanced accessibility features

---

## Final Recommendations

### Proceed With Caution ⚠️

The plan is strong technically but requires the P0 items addressed before breaking ground. Specifically:

1. **Spend 2-3 days** adding the calibration flow and error handling specifications
2. **Conduct 3-5 user interviews** within first week to validate octave defaults and difficulty assumptions
3. **Extend timeline** to 6 weeks to account for realistic iteration needs
4. **Add weekly milestone reviews** with explicit go/no-go criteria

### Suggested Immediate Next Steps

1. ✏️ Update this document with error handling specifications
2. 📋 Create user interview script and recruit 5 participants
3. 🎨 Create low-fidelity wireframes for calibration flow
4. 📊 Define analytics event schema for post-launch learning
5. ✅ Get stakeholder sign-off on updated plan

---

**Review Complete**

*This review was conducted as a thorough assessment of project readiness. Items flagged should be addressed prior to development kickoff to reduce rework and ensure quality delivery.*

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Technical Planning | Initial draft |
| 1.1 | Jan 2025 | PM/QA Review | Added review findings section |
