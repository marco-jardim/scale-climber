# GEMINI.md - Context for AI Assistants

This file documents the `scale-climber` project context, architecture, and development conventions. Use this to understand the codebase and perform tasks effectively.

## 1. Project Overview
**Name:** Scale Climber
**Type:** Browser-based Vocal Pitch Training Game (PWA)
**Purpose:** Gamifies singing a C major scale. Users control a character by singing specific pitches.
**Core Mechanic:** Real-time pitch detection (YIN algorithm) via Web Audio API, driving a canvas-based game loop.

## 2. Technology Stack
*   **Language:** Vanilla JavaScript (ES Modules), HTML5, CSS3.
*   **Build Tool:** Vite 5.
*   **Testing:**
    *   **Unit:** Vitest
    *   **E2E:** Playwright
*   **Audio:** Web Audio API (Native), Custom YIN Pitch Detection Algorithm (in Web Worker).
*   **Rendering:** HTML5 Canvas (Hardware accelerated).
*   **Offline:** Service Worker (Workbox).
*   **Linting/Formatting:** ESLint (Airbnb config), Prettier.

## 3. Architecture & Key Components

### 3.1 Data Flow
`Microphone` -> `AudioContextManager` -> `PitchDetector (Worker)` -> `GameEngine` -> `Renderer` -> `Canvas`

### 3.2 Core Modules (`src/`)
*   **`audio/`**:
    *   `AudioContextManager.js`: Singleton for AudioContext lifecycle, mic permissions, and device handling.
    *   `PitchDetector.js` & `worker.js`: Implements the YIN algorithm for pitch detection. Runs off-main-thread.
    *   `NoteMapper.js`: Converts frequencies to notes and calculates cent deviation.
    *   `CalibrationEngine.js`: Auto-detects user voice range.
*   **`game/`**:
    *   `GameEngine.js`: Central state machine (Idle, Calibration, Playing, etc.).
    *   `ScaleChallenge.js`: Logic for the specific gameplay (C Major scale progression).
    *   `ScoreSystem.js`: Calculates points based on pitch accuracy/timing.
    *   `StateRecovery.js`: Handles session persistence (localStorage/sessionStorage).
*   **`visuals/`**:
    *   `Renderer.js`: Manages the 60fps canvas render loop.
    *   `Character.js`: Sprite animation logic.
    *   `PitchMeter.js`: Visual feedback for pitch accuracy.
*   **`ui/`**: DOM-based UI overlays (Menus, HUD, Results).

## 4. Development Workflow

### Commands
*   `npm run dev`: Start Vite development server (default port 3000).
*   `npm run build`: Production build to `dist/`.
*   `npm run preview`: Preview production build.
*   `npm test`: Run unit tests (Vitest).
*   `npm run test:e2e`: Run E2E tests (Playwright).
*   `npm run lint`: Lint code (ESLint).
*   `npm run format`: Format code (Prettier).

### Testing Strategy
*   **Unit (75%)**: Focus on `src/audio` (accuracy) and `src/game` (logic).
*   **Integration (20%)**: Game flow and component interaction.
*   **E2E (5%)**: Critical user paths (Calibration -> Gameplay -> Results).

## 5. Conventions & Style
*   **Code Style**: Airbnb JavaScript Style Guide.
*   **Imports**: Use ES Module syntax (`import`/`export`).
*   **Comments**: JSDoc for functions/classes. Explain *why*, not just *what*.
*   **Git**:
    *   Branches: `feature/feature-name`, `fix/bug-name`.
    *   Commits: Descriptive messages (e.g., "Add pitch detection worker", "Fix audio context suspension").

## 6. Key Configuration Files
*   `scale-climber-implementation-plan.md`: **CRITICAL**. Contains the detailed specification, phases, and requirements for every feature. Consult this before implementing anything.
*   `vite.config.js`: Build and worker configuration.
*   `package.json`: Dependencies and scripts.
*   `playwright.config.js`: E2E test config.

## 7. Status
The project is currently following a detailed 6-week implementation plan. Check `scale-climber-implementation-plan.md` to see the current phase and pending tasks.
