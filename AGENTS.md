# SCALE CLIMBER - PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-13 | **Commit:** 61946a0 | **Branch:** main

## OVERVIEW

Browser-based vocal pitch training PWA. Vanilla JS + Vite + Canvas. User sings C major scale, YIN algorithm detects pitch, character climbs mountain.

## STRUCTURE

```
scale-climber/
├── src/
│   ├── main.js           # App entry, screen orchestration, event wiring
│   ├── audio/            # Pitch detection, calibration, audio context
│   ├── game/             # Game logic, scoring, state management
│   ├── visuals/          # Canvas rendering, sprites, particles
│   └── utils/            # Shared helpers (keyboard, accessibility, tones)
├── tests/
│   ├── unit/             # Vitest (jsdom, v8 coverage)
│   └── e2e/              # Playwright
├── public/assets/        # Sprites, sounds, icons
└── scripts/              # Build utilities
```

## WHERE TO LOOK

| Task                    | Location                         | Notes                                           |
| ----------------------- | -------------------------------- | ----------------------------------------------- |
| Add new game mode       | `src/game/`                      | Follow PracticeMode.js pattern                  |
| Modify pitch detection  | `src/audio/PitchDetector.js`     | YIN algorithm, uses Web Worker                  |
| Change visual effects   | `src/visuals/ParticleSystem.js`  | Canvas-based particles                          |
| Add UI screen           | `src/main.js`                    | Screen manager pattern, add to `screens` object |
| Add keyboard shortcut   | `src/utils/KeyboardControls.js`  | Central keyboard handler                        |
| Modify calibration flow | `src/audio/CalibrationEngine.js` | Vocal range detection                           |

## ARCHITECTURE

```
main.js (orchestrator)
    ├── GameEngine ─────┬── ScaleChallenge (active gameplay)
    │                   ├── PracticeMode (free practice)
    │                   ├── ScoreSystem (points, combos, grades)
    │                   └── StateRecovery (crash recovery)
    │
    ├── AudioContextManager ── PitchDetector (YIN in Web Worker)
    │                       └── CalibrationEngine
    │
    └── CanvasRenderer ─┬── CharacterSprite
                        ├── PitchMeter
                        └── ParticleSystem
```

**Event-driven**: GameEngine emits `pitch-update`, `note-hit`, `note-miss`, `challenge-complete`.

## CONVENTIONS

- **No frameworks** - Vanilla JS only, ES modules
- **Airbnb ESLint** - `eslint-config-airbnb-base`
- **Class-based** - Each module exports single class
- **Event pattern** - `gameEngine.on('event', handler)` for cross-module communication

## ANTI-PATTERNS (FORBIDDEN)

| DO NOT                               | WHY                                                   |
| ------------------------------------ | ----------------------------------------------------- |
| Auto-start AudioContext on page load | Browser autoplay policy - requires user gesture first |
| Skip "Definition of Done" gates      | Strict phased implementation plan                     |
| Add analytics/telemetry              | Local-only PWA - user data never leaves device        |
| Bundle size > 500KB                  | CI gate will fail                                     |

## COMMANDS

```bash
npm run dev          # Dev server at localhost:30000
npm run build        # Production build to dist/
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint (Airbnb)
npm run format       # Prettier
```

## BUILD & CI

- **Vite** builds to `dist/`, 3 manual chunks: `game-logic`, `audio`, `visuals`
- **GitHub Actions**: PR triggers `test.yml` (lint+unit+e2e), push to main triggers deploy to GitHub Pages
- **PWA**: Service worker via `vite-plugin-pwa`, workbox caching

## NOTES

- **Microphone required** - Secure context (HTTPS/localhost) needed for `getUserMedia`
- **Port 30000** - Non-standard dev server port
- **Safari quirks** - AudioContext must be resumed after user gesture
- **Test pyramid** - 75% unit, 20% integration, 5% E2E
