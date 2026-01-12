# Scale Climber - Vocal Pitch Training Game
## Comprehensive Implementation Plan v2.0

**Document Version**: 2.0
**Created**: January 2025
**Last Updated**: January 2025
**Author**: Technical Planning Team
**Status**: Ready for Implementation

**Changelog from v1.0**:
- Integrated PM/QA review findings (7 critical gaps addressed)
- Added technical architecture enhancements
- Specified error handling and recovery paths
- Added calibration/onboarding flow
- Enhanced mobile considerations
- Added security and localization strategies
- Expanded test coverage
- Extended timeline to 6 weeks with realistic estimates

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Roadmap: Phase & Subphase Checklist](#implementation-roadmap-phase--subphase-checklist)
3. [User Research & Validation](#user-research--validation)
4. [Project Overview](#project-overview)
5. [Technical Architecture](#technical-architecture)
6. [Phase 0: Setup & User Research](#phase-0-setup--user-research)
7. [Phase 1: Audio Foundation](#phase-1-audio-foundation)
8. [Phase 2: Game Logic](#phase-2-game-logic)
9. [Phase 3: Visual Design](#phase-3-visual-design)
10. [Phase 4: Polish & Accessibility](#phase-4-polish--accessibility)
11. [Phase 5: Deployment](#phase-5-deployment)
12. [Error Handling & Recovery](#error-handling--recovery)
13. [Mobile-Specific Requirements](#mobile-specific-requirements)
14. [Security & Privacy](#security--privacy)
15. [Localization Strategy](#localization-strategy)
16. [Implementation Timeline](#implementation-timeline)
17. [Testing Strategy](#testing-strategy)
18. [Risk Mitigation](#risk-mitigation)
19. [Success Metrics](#success-metrics)
20. [Appendices](#appendices)

---

## Executive Summary

**Scale Climber** is a browser-based game designed to help users train their vocal pitch by gamifying the process of singing a C major scale. Players guide an animated character up a musical mountain by singing correct pitches, receiving real-time visual feedback and scoring based on accuracy.

**Key Technical Challenges:**
- Sub-50ms audio latency for responsive feedback
- ±5 cent pitch detection accuracy
- Cross-browser compatibility without server dependencies
- Engaging visuals at 60fps performance
- Graceful error recovery and offline operation

**Target Deployment**: GitHub Pages (fully static, client-side PWA)

**Timeline**: 6 weeks (revised from 5 weeks based on realistic estimates)

**Critical Success Factors**:
1. Early user validation of calibration flow and difficulty
2. Robust error handling for audio device edge cases
3. Mobile-first performance optimization
4. Comprehensive browser compatibility testing

---

## Implementation Roadmap: Phase & Subphase Checklist

**Purpose**: This section provides a complete phase-by-phase breakdown with actionable subphases that an implementation agent can follow sequentially. Each phase concludes with a mandatory review, testing, and acceptance subphase.

**Usage Instructions**:
- Execute subphases in numerical order within each phase
- Do not proceed to the next subphase until the current one's Definition of Done is met
- Each phase ends with a review/testing/acceptance gate - all criteria must pass before moving to the next phase
- Check off items as completed for progress tracking

---

### **PHASE 0: Setup & User Research** (Duration: 3-4 days)

#### **Subphase 0.1: Project Initialization**
**Objective**: Establish project infrastructure and development environment

**Tasks**:
- [ ] Initialize Git repository with main branch
- [ ] Create complete project folder structure (see Technical Architecture section)
- [ ] Setup Vite with configuration for Web Workers and optimized builds
- [ ] Configure ESLint + Prettier with Airbnb style guide
- [ ] Setup Vitest for unit testing
- [ ] Setup Playwright for E2E testing
- [ ] Create initial README.md with setup instructions
- [ ] Configure GitHub Actions for basic CI pipeline

**Definition of Done**:
- [ ] `npm run dev` starts development server successfully
- [ ] `npm run build` produces optimized bundle in dist/
- [ ] `npm test` runs (even if no tests exist yet)
- [ ] `npm run lint` passes with no errors
- [ ] All team members can clone and run project locally
- [ ] GitHub Actions workflow runs on push to main

**Estimated Time**: 1 day

---

#### **Subphase 0.2: User Research Execution**
**Objective**: Validate core assumptions with target users

**Tasks**:
- [ ] Recruit 8-10 participants across voice types (bass, baritone, alto, soprano)
- [ ] Conduct semi-structured interviews (20 min each)
- [ ] Create interview synthesis document
- [ ] Validate default octave ranges for different voice types
- [ ] Confirm pitch tolerance thresholds (±10/25/50 cents)
- [ ] Determine mobile vs desktop priority
- [ ] Rank feature priorities based on user feedback
- [ ] Document major blockers or concerns

**Definition of Done**:
- [ ] At least 6 interviews completed
- [ ] Synthesis report created with key findings
- [ ] Core game mechanic validated (70%+ positive reception)
- [ ] Default settings determined (octave ranges, tolerances)
- [ ] No critical blockers identified that invalidate approach

**Estimated Time**: 2-3 days

---

#### **Subphase 0.3: Phase 0 Review, Testing & Acceptance**
**Objective**: Verify infrastructure is ready and user research validates approach

**Review Checklist**:
- [ ] Development environment setup complete and tested
- [ ] CI/CD pipeline operational
- [ ] User research findings documented and actionable
- [ ] Team alignment on validated assumptions
- [ ] No major technical risks identified in setup

**Testing**:
- [ ] Build pipeline produces valid output
- [ ] Linting rules are enforced
- [ ] Git workflow is documented

**Acceptance Criteria**:
- [ ] All Phase 0 Definition of Done items are checked
- [ ] Stakeholders approve user research findings
- [ ] Technical Lead approves infrastructure setup
- [ ] Green light to proceed to Phase 1

**Estimated Time**: 0.5 day

---

### **PHASE 1: Audio Foundation** (Duration: 1.5 weeks)

#### **Subphase 1.1: Audio Context Manager**
**Objective**: Reliable AudioContext lifecycle management across browsers

**Tasks**:
- [ ] Create `src/audio/AudioContextManager.js`
- [ ] Implement singleton pattern for single AudioContext instance
- [ ] Handle AudioContext suspension/resumption (iOS Safari)
- [ ] Implement microphone permission request flow
- [ ] Add device disconnect detection and recovery
- [ ] Support multiple sample rates (44.1kHz, 48kHz)
- [ ] Write unit tests for AudioContextManager
- [ ] Test on Chrome, Firefox, Safari (desktop + mobile)

**Definition of Done**:
- [ ] AudioContext initializes successfully on all target browsers
- [ ] iOS Safari audio unlock pattern works correctly
- [ ] Device disconnect triggers appropriate error handling
- [ ] Singleton pattern prevents multiple context creation
- [ ] Unit test coverage >90%

**Estimated Time**: 2 days

---

#### **Subphase 1.2: Pitch Detection (YIN Algorithm)**
**Objective**: Accurate, low-latency pitch detection using YIN algorithm

**Tasks**:
- [ ] Create `src/audio/PitchDetector.js` with YIN implementation
- [ ] Create `src/audio/PitchDetector.worker.js` for Web Worker execution
- [ ] Implement Transferable Objects for zero-copy buffer transfer
- [ ] Optimize YIN parameters (threshold=0.15, buffer=1024 samples)
- [ ] Implement parabolic interpolation for sub-sample accuracy
- [ ] Create `src/audio/NoteMapper.js` for frequency → note conversion
- [ ] Calculate cent deviation from target pitch
- [ ] Write comprehensive unit tests with generated sine waves
- [ ] Profile performance: ensure <5ms processing time per buffer

**Definition of Done**:
- [ ] Detects A4 (440Hz) with ±5 cent accuracy
- [ ] Processes audio buffer in <5ms (Web Worker)
- [ ] Correctly identifies all notes C4-C5
- [ ] Rejects noise with low confidence (<0.3)
- [ ] Handles edge cases (silence, clipping, harmonics)
- [ ] Unit test coverage >95%
- [ ] Latency from mic input to detection result <50ms

**Estimated Time**: 3 days

---

#### **Subphase 1.3: Calibration Engine**
**Objective**: Automatic voice range detection and octave recommendation

**Tasks**:
- [ ] Create `src/audio/CalibrationEngine.js`
- [ ] Implement 3-phase calibration flow:
  - Phase 1: Volume test (detect if mic is working)
  - Phase 2: Range detection (10 seconds of singing various pitches)
  - Phase 3: Analysis and octave recommendation
- [ ] Detect lowest and highest confident pitches
- [ ] Recommend optimal octave based on voice range
- [ ] Handle calibration failures gracefully
- [ ] Create `src/ui/CalibrationScreen.js` for user interface
- [ ] Write unit tests for analysis algorithms
- [ ] Test with diverse voice types (real users if possible)

**Definition of Done**:
- [ ] Calibration completes successfully in 15-20 seconds
- [ ] Correctly recommends octave for bass, baritone, alto, soprano
- [ ] Handles edge cases (user doesn't sing, too quiet, too loud)
- [ ] UI provides clear instructions and feedback
- [ ] Unit test coverage >90%
- [ ] Tested with at least 5 different voice types

**Estimated Time**: 2 days

---

#### **Subphase 1.4: Phase 1 Review, Testing & Acceptance**
**Objective**: Verify audio foundation is robust and accurate

**Review Checklist**:
- [ ] AudioContextManager handles all browser quirks
- [ ] Pitch detection accuracy meets ±5 cent requirement
- [ ] Calibration engine provides sensible recommendations
- [ ] Code quality: no type errors, follows style guide
- [ ] Documentation: all public APIs documented

**Testing**:
- [ ] Unit tests: All pass, coverage >90%
- [ ] Integration test: AudioContextManager + PitchDetector end-to-end
- [ ] Manual test: Play sine wave tones (A4, C4, C5, G4) via speaker near mic, verify detection
- [ ] Browser compatibility: Test on Chrome, Firefox, Safari (desktop + iOS)
- [ ] Performance test: Verify <50ms latency using Performance API

**Acceptance Criteria**:
- [ ] All Definition of Done items from subphases 1.1-1.3 are checked
- [ ] Technical Lead code review approved
- [ ] Pitch detection demo works reliably (can detect humming/singing)
- [ ] No critical bugs or performance issues
- [ ] Green light to proceed to Phase 2

**Estimated Time**: 1 day

---

### **PHASE 2: Game Logic** (Duration: 1 week)

#### **Subphase 2.1: Game State Machine**
**Objective**: Centralized game state management and orchestration

**Tasks**:
- [ ] Create `src/game/GameEngine.js`
- [ ] Implement state machine with states: idle, calibration, countdown, playing, paused, complete, failed, error
- [ ] Handle state transitions with validation
- [ ] Integrate AudioContextManager and PitchDetector
- [ ] Implement game loop using requestAnimationFrame
- [ ] Add event emitter for UI notifications
- [ ] Implement pause/resume functionality
- [ ] Write unit tests for state transitions

**Definition of Done**:
- [ ] All game states implemented and transitions work correctly
- [ ] Game loop runs at stable frame rate
- [ ] Events properly emitted for UI updates
- [ ] Pause/resume works without audio issues
- [ ] Unit test coverage >85%

**Estimated Time**: 2 days

---

#### **Subphase 2.2: Scale Challenge Logic**
**Objective**: Core gameplay mechanic for 8-note scale progression

**Tasks**:
- [ ] Create `src/game/ScaleChallenge.js`
- [ ] Implement note progression (C-D-E-F-G-A-B-C)
- [ ] Define pitch tolerance thresholds by difficulty (easy/normal/hard)
- [ ] Implement hold timer (must sustain note for 1.5 seconds)
- [ ] Track note attempts and accuracy
- [ ] Handle note hit/miss events
- [ ] Implement failure conditions (3 failures or 2 minutes elapsed)
- [ ] Write unit tests for game logic

**Definition of Done**:
- [ ] Full scale can be completed by singing correct pitches
- [ ] Note validation works with tolerance thresholds
- [ ] Hold timer accurately requires sustained pitch
- [ ] Failure conditions trigger correctly
- [ ] Unit test coverage >90%

**Estimated Time**: 2 days

---

#### **Subphase 2.3: Practice Mode**
**Objective**: Single-note practice without time pressure

**Tasks**:
- [ ] Create `src/game/PracticeMode.js`
- [ ] Allow user to select any note to practice
- [ ] Remove timer/failure conditions
- [ ] Display real-time pitch deviation (cents)
- [ ] Add "Next Note" and "Random Note" options
- [ ] Implement progress tracking (attempts, success rate)
- [ ] Write unit tests

**Definition of Done**:
- [ ] User can select and practice any note
- [ ] Real-time feedback shows cent deviation
- [ ] No time pressure or failure states
- [ ] Unit test coverage >85%

**Estimated Time**: 1 day

---

#### **Subphase 2.4: Score System**
**Objective**: Calculate scores and grades based on performance

**Tasks**:
- [ ] Create `src/game/ScoreSystem.js`
- [ ] Implement scoring formula:
  - Perfect: 100 points (within ±10 cents)
  - Great: 75 points (within ±25 cents)
  - OK: 50 points (within ±50 cents)
- [ ] Add combo bonus (consecutive perfects)
- [ ] Calculate time bonus (faster completion)
- [ ] Implement grade system (S/A/B/C/D based on total score)
- [ ] Write comprehensive unit tests

**Definition of Done**:
- [ ] Score calculation matches specification
- [ ] Combo bonuses apply correctly
- [ ] Grade thresholds assign appropriate letter grades
- [ ] Unit test coverage 100% (pure functions)

**Estimated Time**: 1 day

---

#### **Subphase 2.5: State Recovery**
**Objective**: Session persistence and high score tracking

**Tasks**:
- [ ] Create `src/game/StateRecovery.js`
- [ ] Implement session save/restore using SessionStorage
- [ ] Auto-save game state every 5 seconds during play
- [ ] Save high scores to LocalStorage
- [ ] Implement resume functionality on page reload
- [ ] Handle corrupt/invalid stored data gracefully
- [ ] Write unit tests with mocked storage

**Definition of Done**:
- [ ] Game state persists across page reload
- [ ] High scores saved and retrieved correctly
- [ ] Corrupt data doesn't break application
- [ ] Unit test coverage >90%

**Estimated Time**: 1 day

---

#### **Subphase 2.6: Phase 2 Review, Testing & Acceptance**
**Objective**: Verify game logic is correct and complete

**Review Checklist**:
- [ ] State machine handles all transitions correctly
- [ ] Scale Challenge gameplay feels fair and responsive
- [ ] Score calculations are accurate and consistent
- [ ] Code quality: no type errors, follows style guide
- [ ] All game modes (Challenge, Practice) implemented

**Testing**:
- [ ] Unit tests: All pass, coverage >85% overall
- [ ] Integration test: Full game flow from start to completion
- [ ] Manual test: Play through complete scale challenge, verify scoring
- [ ] Edge case testing: Pause/resume, failure conditions, calibration edge cases
- [ ] Performance test: Game loop maintains stable frame rate

**Acceptance Criteria**:
- [ ] All Definition of Done items from subphases 2.1-2.5 are checked
- [ ] Can complete full scale challenge by singing
- [ ] Scoring and grading work correctly
- [ ] No critical bugs in game logic
- [ ] Product Manager approval on gameplay feel
- [ ] Green light to proceed to Phase 3

**Estimated Time**: 1 day

---

### **PHASE 3: Visual Design** (Duration: 1.5 weeks)

#### **Subphase 3.1: Art Direction & Design System**
**Objective**: Define visual style and create design assets

**Tasks**:
- [ ] Define color palette (primary, secondary, accent, background)
- [ ] Create character sprite sheets (idle, climbing, celebrating, failing)
- [ ] Design background layers for parallax effect
- [ ] Create UI mockups in Figma (all screens)
- [ ] Define typography and spacing system
- [ ] Export assets optimized for web (PNG sprite sheets, compressed)
- [ ] Document design system in `docs/DESIGN.md`

**Definition of Done**:
- [ ] Complete color palette defined
- [ ] All sprite sheets created and exported
- [ ] Background assets created (3+ layers for parallax)
- [ ] Figma mockups approved by stakeholders
- [ ] Assets optimized and placed in `public/assets/`

**Estimated Time**: 2 days (or outsource to designer)

---

#### **Subphase 3.2: Canvas Renderer Architecture**
**Objective**: High-performance 60fps rendering system

**Tasks**:
- [ ] Create `src/visuals/Renderer.js`
- [ ] Implement frame budget management (16.6ms target)
- [ ] Create `src/visuals/PerformanceMonitor.js` for frame time tracking
- [ ] Implement adaptive quality degradation if frame time exceeds budget
- [ ] Setup render pipeline: clear → background → character → HUD → particles
- [ ] Implement viewport scaling for responsive design
- [ ] Write performance tests

**Definition of Done**:
- [ ] Renderer maintains 60fps on mid-range desktop
- [ ] Adaptive quality reduces rendering load if needed
- [ ] Viewport scales correctly for different screen sizes
- [ ] Performance monitoring logs frame times

**Estimated Time**: 2 days

---

#### **Subphase 3.3: Character Animation**
**Objective**: Expressive character responding to gameplay

**Tasks**:
- [ ] Create `src/visuals/Character.js`
- [ ] Implement sprite animation system (frame-based)
- [ ] Define animation states: idle, climbing, perfect, great, ok, miss, celebrate
- [ ] Sync animations with game state events
- [ ] Add smooth transitions between animations
- [ ] Implement character positioning (vertical movement up staircase)
- [ ] Test animation performance

**Definition of Done**:
- [ ] All animation states implemented
- [ ] Character responds immediately to note events
- [ ] Animations loop smoothly
- [ ] Character position reflects progress through scale
- [ ] Rendering performance within budget (3ms allocation)

**Estimated Time**: 2 days

---

#### **Subphase 3.4: Pitch Meter Visualization**
**Objective**: Real-time visual feedback for pitch accuracy

**Tasks**:
- [ ] Create `src/visuals/PitchMeter.js`
- [ ] Design meter UI (horizontal bar with target note in center)
- [ ] Show current pitch as moving indicator
- [ ] Color-code accuracy zones (green=perfect, yellow=great, red=off)
- [ ] Display current note name and target note
- [ ] Add smooth interpolation for indicator movement
- [ ] Test readability at various screen sizes

**Definition of Done**:
- [ ] Pitch meter updates in real-time (<50ms lag)
- [ ] Clearly indicates pitch deviation from target
- [ ] Readable on both desktop and mobile
- [ ] Rendering performance within budget (3ms allocation)

**Estimated Time**: 2 days

---

#### **Subphase 3.5: Particle System**
**Objective**: Celebration effects for successful notes

**Tasks**:
- [ ] Create `src/visuals/ParticleSystem.js`
- [ ] Implement particle emitter with velocity, gravity, lifetime
- [ ] Create particle effects for: perfect hit, great hit, combo milestone
- [ ] Optimize particle count for performance (max 100 particles)
- [ ] Add particle pooling to avoid GC pressure
- [ ] Test particle effects on low-end devices

**Definition of Done**:
- [ ] Particle effects trigger on appropriate events
- [ ] Performance remains stable with max particles
- [ ] Effects are visually appealing and not distracting
- [ ] Rendering performance within budget (2ms allocation)

**Estimated Time**: 1 day

---

#### **Subphase 3.6: Phase 3 Review, Testing & Acceptance**
**Objective**: Verify visual design is polished and performant

**Review Checklist**:
- [ ] Visual design matches approved mockups
- [ ] All animations are smooth and expressive
- [ ] Pitch meter provides clear, immediate feedback
- [ ] Performance meets 60fps target on desktop, 30fps on mobile
- [ ] Code quality: rendering code is clean and maintainable

**Testing**:
- [ ] Performance test: Run game for 5 minutes, verify stable frame rate
- [ ] Visual regression: Compare screenshots to design mockups
- [ ] Responsive design: Test on 320px, 768px, 1920px widths
- [ ] Device testing: Test on actual mobile devices (iOS + Android)
- [ ] Accessibility: Verify contrast ratios meet WCAG AA

**Acceptance Criteria**:
- [ ] All Definition of Done items from subphases 3.1-3.5 are checked
- [ ] Game looks visually polished and professional
- [ ] Performance targets met (60fps desktop, 30fps mobile)
- [ ] No visual bugs or glitches
- [ ] UX Designer approval on visual design
- [ ] Green light to proceed to Phase 4

**Estimated Time**: 1 day

---

### **PHASE 4: Polish & Accessibility** (Duration: 1 week)

#### **Subphase 4.1: Keyboard Controls**
**Objective**: Full keyboard navigation and shortcuts

**Tasks**:
- [ ] Create `src/utils/keyboardControls.js`
- [ ] Implement keyboard shortcuts:
  - Space: Pause/Resume
  - R: Restart game
  - M: Mute/Unmute
  - Esc: Open settings
  - Tab: Navigate UI elements
  - Enter: Confirm selections
- [ ] Add visual indicators for focused elements
- [ ] Prevent default browser shortcuts from interfering
- [ ] Write unit tests for keyboard event handlers

**Definition of Done**:
- [ ] All keyboard shortcuts work correctly
- [ ] Keyboard navigation covers all UI elements
- [ ] Focus indicators are visible and clear
- [ ] No conflicts with browser shortcuts
- [ ] Unit test coverage >90%

**Estimated Time**: 1 day

---

#### **Subphase 4.2: Accessibility Features**
**Objective**: WCAG AA compliance for inclusive design

**Tasks**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement ARIA live regions for dynamic content
- [ ] Add screen reader announcements for game events
- [ ] Ensure color contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Add skip links for keyboard users
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Add reduced motion preference support
- [ ] Run Lighthouse accessibility audit

**Definition of Done**:
- [ ] Lighthouse accessibility score = 100
- [ ] All interactive elements have ARIA labels
- [ ] Screen reader can navigate and understand game state
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion preference respected

**Estimated Time**: 2 days

---

#### **Subphase 4.3: Audio Feedback**
**Objective**: Sound effects and reference tones

**Tasks**:
- [ ] Source or create sound effects:
  - Note hit (perfect, great, ok)
  - Note miss
  - Game complete
  - Combo milestone
- [ ] Implement reference tone playback (sine wave at target frequency)
- [ ] Add volume controls in settings
- [ ] Ensure audio feedback doesn't interfere with pitch detection
- [ ] Optimize audio files (WebM/Opus format, <10KB each)
- [ ] Test audio playback on all browsers

**Definition of Done**:
- [ ] All sound effects implemented and play correctly
- [ ] Reference tone accurately plays target pitch
- [ ] Volume controls work properly
- [ ] Audio feedback doesn't cause mic feedback loops
- [ ] Total audio assets <50KB

**Estimated Time**: 2 days

---

#### **Subphase 4.4: Phase 4 Review, Testing & Accessibility**
**Objective**: Verify polish and accessibility standards are met

**Review Checklist**:
- [ ] Keyboard navigation is complete and intuitive
- [ ] Accessibility features meet WCAG AA standards
- [ ] Audio feedback enhances gameplay experience
- [ ] Code quality: no accessibility violations

**Testing**:
- [ ] Lighthouse audit: Accessibility score 100
- [ ] Screen reader testing: NVDA (Windows), VoiceOver (Mac/iOS)
- [ ] Keyboard-only playthrough: Complete game without mouse
- [ ] Audio testing: Verify all sounds play correctly, no distortion
- [ ] User testing: Have users with disabilities test and provide feedback

**Acceptance Criteria**:
- [ ] All Definition of Done items from subphases 4.1-4.3 are checked
- [ ] Lighthouse accessibility score = 100
- [ ] Keyboard navigation allows full gameplay
- [ ] Screen reader provides meaningful feedback
- [ ] QA Lead approval on accessibility compliance
- [ ] Green light to proceed to Phase 5

**Estimated Time**: 1 day

---

### **PHASE 5: Deployment** (Duration: 1 week)

#### **Subphase 5.1: Service Worker**
**Objective**: Offline capability and asset caching

**Tasks**:
- [ ] Create `src/service-worker.js` using Workbox
- [ ] Implement cache-first strategy for static assets
- [ ] Implement network-only for analytics
- [ ] Add offline fallback page
- [ ] Configure cache versioning and invalidation
- [ ] Test install/update flow
- [ ] Verify offline gameplay works

**Definition of Done**:
- [ ] Service worker registers successfully
- [ ] Assets cached on first visit
- [ ] Game works offline (airplane mode)
- [ ] Cache updates when new version deployed
- [ ] Tested on Chrome, Firefox, Safari

**Estimated Time**: 2 days

---

#### **Subphase 5.2: Build Configuration**
**Objective**: Optimized production builds

**Tasks**:
- [ ] Configure Vite for optimal production builds
- [ ] Implement code splitting (audio, game, visuals chunks)
- [ ] Enable minification and tree-shaking
- [ ] Optimize images and assets
- [ ] Generate source maps for error tracking
- [ ] Configure base URL for GitHub Pages deployment
- [ ] Verify bundle size <250KB gzipped

**Definition of Done**:
- [ ] Production build completes without errors
- [ ] Bundle size target met (<250KB gzipped)
- [ ] Code splitting reduces initial load time
- [ ] Assets are optimized and compressed

**Estimated Time**: 1 day

---

#### **Subphase 5.3: GitHub Actions CI/CD**
**Objective**: Automated testing and deployment pipeline

**Tasks**:
- [ ] Create `.github/workflows/test.yml` for PR validation
- [ ] Create `.github/workflows/deploy.yml` for production deployment
- [ ] Configure automated testing on all PRs
- [ ] Configure automated deployment to GitHub Pages on main branch merge
- [ ] Add status badges to README
- [ ] Test deployment pipeline end-to-end
- [ ] Document rollback procedure

**Definition of Done**:
- [ ] CI runs tests on every PR
- [ ] CD deploys to GitHub Pages on main branch push
- [ ] Deployment completes in <5 minutes
- [ ] Rollback procedure documented and tested

**Estimated Time**: 1 day

---

#### **Subphase 5.4: Security Headers**
**Objective**: Production-ready security configuration

**Tasks**:
- [ ] Create `public/_headers` file for GitHub Pages
- [ ] Configure Content Security Policy (CSP)
- [ ] Add X-Frame-Options header
- [ ] Add X-Content-Type-Options header
- [ ] Configure CORS if needed
- [ ] Test security headers with securityheaders.com
- [ ] Document security configuration

**Definition of Done**:
- [ ] All security headers configured correctly
- [ ] CSP doesn't block legitimate resources
- [ ] Security headers score A+ on securityheaders.com
- [ ] No console errors from CSP violations

**Estimated Time**: 1 day

---

#### **Subphase 5.5: Phase 5 Review, Testing & Acceptance**
**Objective**: Verify production deployment is ready

**Review Checklist**:
- [ ] Service worker provides reliable offline experience
- [ ] Build configuration produces optimal bundles
- [ ] CI/CD pipeline is stable and automated
- [ ] Security headers are properly configured
- [ ] Documentation is complete

**Testing**:
- [ ] End-to-end deployment test: Merge PR, verify production deployment
- [ ] Offline testing: Install PWA, disconnect network, play game
- [ ] Security audit: Run securityheaders.com scan
- [ ] Performance audit: Lighthouse scores (Performance >90, A11y 100, Best Practices 100, SEO >90)
- [ ] Cross-browser testing: Final verification on all target browsers
- [ ] Load testing: Verify app handles concurrent users (if applicable)

**Acceptance Criteria**:
- [ ] All Definition of Done items from subphases 5.1-5.4 are checked
- [ ] Game is live on GitHub Pages at production URL
- [ ] Lighthouse scores meet targets (Performance >90, Accessibility 100, Best Practices 100, SEO >90)
- [ ] PWA installs correctly on desktop and mobile
- [ ] No critical bugs in production
- [ ] All stakeholders approve for public release
- [ ] **PROJECT COMPLETE**

**Estimated Time**: 2 days

---

## User Research & Validation

### Research Objectives

**Goal**: Validate core assumptions before full development to minimize rework.

**Key Questions**:
1. Do users understand the pitch training concept without extensive tutorial?
2. What octave ranges are most appropriate for different voice types?
3. How tight should pitch tolerance be to feel "fair" vs "challenging"?
4. What motivates users to replay the game?
5. Are mobile users a primary or secondary audience?

### Research Plan

| Phase | Method | Participants | Timeline | Deliverable |
|-------|--------|--------------|----------|-------------|
| Discovery | Semi-structured interviews | 8-10 target users | Week 0 (3 days) | Interview synthesis report |
| Prototype | Paper prototype testing | 5 users | Week 1 (2 days) | Validated game flow |
| Alpha | Playable alpha usability test | 10 users | Week 3 (end) | Usability findings + iterations |
| Beta | Beta testing with analytics | 25-30 users | Week 5 (end) | Performance & engagement metrics |

### Interview Script (Discovery Phase)

**Demographics** (2 min):
- Musical background (none/beginner/intermediate/advanced)
- Singing experience (casual/choir/lessons/professional)
- Voice type (if known: bass/baritone/alto/soprano)
- Device usage (desktop/mobile/both)

**Current Behavior** (5 min):
- "Tell me about a time you tried to improve your singing."
- "What challenges do you face with pitch accuracy?"
- "Have you used any apps or tools for vocal training? What did you like/dislike?"

**Concept Validation** (8 min):
- Show simple mockup of game concept
- "What do you think this game does?"
- "Would you try this? Why or why not?"
- "What concerns do you have?"

**Feature Prioritization** (5 min):
- Rank features: reference tone playback, difficulty levels, practice mode, leaderboard
- "What would make you come back and play again?"

**Wrap-up** (2 min):
- Willingness to test early prototype
- Preferred contact method

### Success Criteria for User Research

- [ ] At least 8 interviews completed before Week 1 ends
- [ ] Core game mechanic validated (75%+ positive reception)
- [ ] Octave range defaults selected based on user voice distribution
- [ ] Tolerance thresholds adjusted if >50% of testers find default too strict/lenient
- [ ] Mobile vs desktop priority determined by user preference data

### Analytics Event Specification

**Purpose**: Post-launch learning and iteration guidance.

**Privacy Notice**: All analytics are anonymous and opt-in via settings panel.

| Event | Data Captured | Purpose |
|-------|---------------|---------|
| `game_started` | `{octave, difficulty, timestamp}` | Track popularity of settings |
| `note_attempted` | `{note, avgCents, holdTime, success}` | Identify problematic notes |
| `note_completed` | `{note, score, attempts, timeToHit}` | Measure difficulty calibration |
| `game_completed` | `{totalScore, grade, duration, notes}` | Success rate tracking |
| `game_failed` | `{reason, currentNote, duration}` | Identify failure patterns |
| `calibration_completed` | `{detectedRange, suggestedOctave, userChoice}` | Validate auto-suggestions |
| `error_occurred` | `{errorType, context, recovered}` | Monitor error rates |
| `settings_changed` | `{setting, oldValue, newValue}` | Feature usage patterns |

**Storage**: LocalStorage only. Optional cloud sync via anonymous ID if user opts in.

---

## Project Overview

### Product Vision

**Name**: Scale Climber
**Tagline**: "Climb the musical mountain, one note at a time!"

**Core Concept**: A browser-based game where players guide a character up a musical staircase by singing the correct pitches of a C major scale (C-D-E-F-G-A-B-C). The character reacts to pitch accuracy with expressive animations.

### Target Users

| User Segment | Needs | Priority | Key Insights from Research |
|--------------|-------|----------|----------------------------|
| Beginner singers | Learn pitch matching basics | High | Need clear visual feedback, forgiving tolerances |
| Choir members | Warm-up exercises | Medium | Want quick sessions, octave variety |
| Voice students | Supplemental practice tool | High | Appreciate accuracy metrics, progress tracking |
| Music teachers | Classroom engagement tool | Medium | Need easy setup, no installation |
| Casual users | Fun musical game | Low | Motivation via gamification, short sessions |

### Core Features (MVP)

1. **Real-time pitch detection** with visual feedback (<50ms latency)
2. **Calibration flow** with automatic octave recommendation
3. **Continuous scale challenge** (C4 to C5 by default, configurable)
4. **Animated character** responding to pitch accuracy
5. **Scoring system** with grades and high scores
6. **Multiple octave ranges** for different voice types
7. **Practice mode** for single-note training (no timer pressure)
8. **Offline-capable** PWA with service worker caching

### Deferred Features (Post-MVP)

- Daily challenges with global leaderboard
- Alternate scales (minor, chromatic, modes)
- Multiplayer mode
- Advanced analytics dashboard
- Singing lessons / tutorial content

---

## Technical Architecture

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| UI Framework | Vanilla JS + HTML5 Canvas | Zero dependencies, full control, ~50KB core |
| Audio Processing | Web Audio API | Native browser support, low latency |
| Pitch Detection | YIN Algorithm (custom) | Proven accuracy, well-documented |
| Build Tool | Vite 5 | Fast dev server, optimized builds, Web Worker support |
| Testing | Vitest + Playwright | Fast unit tests, reliable E2E |
| Deployment | GitHub Pages + Actions | Free, reliable, automatic CI/CD |
| Offline | Service Worker (Workbox) | Asset caching, offline support |
| Localization | Custom i18n (JSON) | Lightweight, no runtime overhead |

### Project Structure

```
scale-climber/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # CI/CD pipeline
│       └── test.yml                # PR validation
├── public/
│   ├── assets/
│   │   ├── sprites/                # Character animations (PNG sprite sheets)
│   │   ├── backgrounds/            # Game backgrounds (layered PNGs)
│   │   ├── sounds/                 # Audio feedback (WebM/Opus)
│   │   └── fonts/                  # Custom web fonts (WOFF2)
│   ├── locales/
│   │   ├── en.json                 # English strings
│   │   ├── es.json                 # Spanish strings
│   │   └── fr.json                 # French strings
│   ├── favicon.ico
│   ├── manifest.json               # PWA manifest
│   ├── robots.txt
│   └── _headers                    # Security headers for deployment
├── src/
│   ├── index.html
│   ├── main.js                     # Application entry point
│   ├── styles.css
│   ├── audio/
│   │   ├── AudioCapture.js         # Microphone handling
│   │   ├── AudioContextManager.js  # Context lifecycle management (NEW)
│   │   ├── PitchDetector.js        # YIN algorithm implementation
│   │   ├── PitchDetector.worker.js # Web Worker for pitch processing
│   │   ├── NoteMapper.js           # Frequency → Note conversion
│   │   └── CalibrationEngine.js    # Auto-calibration logic (NEW)
│   ├── game/
│   │   ├── GameEngine.js           # Main game loop & state machine
│   │   ├── ScaleChallenge.js       # Scale progression logic
│   │   ├── PracticeMode.js         # Single-note practice mode (NEW)
│   │   ├── ScoreSystem.js          # Points & accuracy tracking
│   │   ├── DifficultyManager.js    # Difficulty presets
│   │   └── StateRecovery.js        # Session persistence (NEW)
│   ├── visuals/
│   │   ├── Renderer.js             # Canvas rendering coordinator
│   │   ├── Character.js            # Animated character controller
│   │   ├── Background.js           # Parallax background layers
│   │   ├── PitchMeter.js           # Real-time pitch visualization
│   │   ├── ParticleSystem.js       # Celebration effects
│   │   └── PerformanceMonitor.js   # Frame budget tracking (NEW)
│   ├── ui/
│   │   ├── StartScreen.js          # Title & mic permission
│   │   ├── CalibrationScreen.js    # Calibration flow (NEW)
│   │   ├── HUD.js                  # In-game overlay
│   │   ├── ResultsScreen.js        # End-of-game summary
│   │   ├── SettingsPanel.js        # Configuration options
│   │   ├── PauseMenu.js            # Pause overlay
│   │   ├── ErrorDialog.js          # Error state UI (NEW)
│   │   └── TutorialOverlay.js      # First-time user guide (NEW)
│   ├── utils/
│   │   ├── constants.js            # Note frequencies, thresholds
│   │   ├── helpers.js              # Utility functions
│   │   ├── storage.js              # LocalStorage wrapper
│   │   ├── i18n.js                 # Localization helper (NEW)
│   │   ├── analytics.js            # Event tracking (NEW)
│   │   └── keyboardControls.js     # Keyboard input handler (NEW)
│   └── service-worker.js           # Offline caching (NEW)
├── tests/
│   ├── unit/
│   │   ├── PitchDetector.test.js
│   │   ├── NoteMapper.test.js
│   │   ├── ScoreSystem.test.js
│   │   ├── CalibrationEngine.test.js (NEW)
│   │   └── StateRecovery.test.js (NEW)
│   ├── integration/
│   │   ├── GameFlow.test.js
│   │   ├── ErrorRecovery.test.js (NEW)
│   │   └── PerformanceProfile.test.js (NEW)
│   ├── e2e/
│   │   ├── fullGame.spec.js
│   │   ├── calibration.spec.js (NEW)
│   │   └── offline.spec.js (NEW)
│   └── fixtures/
│       ├── audio-samples/          # Test audio files (generated tones)
│       └── mock-devices/           # Device capability mocks
├── docs/
│   ├── API.md                      # Internal API documentation
│   ├── CONTRIBUTING.md             # Development guide
│   └── ARCHITECTURE.md             # System design deep-dive
├── package.json
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
├── .eslintrc.js
├── .prettierrc
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
│                       │  │AudioContext│──│ AnalyserNode      │   │  │
│                       │  │  Manager   │  │  (FFT=2048)       │   │  │
│                       │  └────────────┘  └─────────┬─────────┘   │  │
│                       └────────────────────────────┼─────────────┘  │
│                                                    │                 │
│                                Float32Array buffer (Transferable)    │
│                                                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              WEB WORKER (Off Main Thread)                    │    │
│  │  ┌─────────────────┐    ┌─────────────────┐                 │    │
│  │  │ PitchDetector   │───▶│  NoteMapper     │                 │    │
│  │  │ (YIN Algorithm) │    │  (Hz → Note)    │                 │    │
│  │  │  ~3-5ms         │    │  (Cent calc)    │                 │    │
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
│  │  │  (State Mgmt) │    │   /Practice   │    │   (Points)   │  │   │
│  │  │  ~2ms/frame   │    │  (Progression)│    │              │  │   │
│  │  └───────┬───────┘    └───────────────┘    └──────────────┘  │   │
│  │          │                                                    │   │
│  │          ▼                                                    │   │
│  │  ┌───────────────────────────────────────────────────────┐   │   │
│  │  │              RENDERER (60fps target)                   │   │   │
│  │  │  Frame Budget: 16.6ms                                  │   │   │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────┐  │   │   │
│  │  │  │Character  │ │Background │ │PitchMeter │ │  HUD  │  │   │   │
│  │  │  │  (3ms)    │ │   (2ms)   │ │   (3ms)   │ │ (3ms) │  │   │   │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └───────┘  │   │   │
│  │  │  ┌───────────┐                                         │   │   │
│  │  │  │ Particles │  Performance Monitor: adaptive quality │   │   │
│  │  │  │  (2ms)    │  degrades if frame time > 20ms         │   │   │
│  │  │  └───────────┘                                         │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                    │                                 │
│                                    ▼                                 │
│                          ┌─────────────────┐                        │
│                          │  HTML5 CANVAS   │                        │
│                          │  (hardware acc) │                        │
│                          └─────────────────┘                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   SERVICE WORKER                              │   │
│  │  Cache Strategy: Cache-First for assets, Network-Only for    │   │
│  │  analytics. Enables offline gameplay.                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────┐
│ User Sings  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ AudioCapture        │──▶ Float32Array (2048 samples)
│ - Mic permission    │    Transferable to Worker (zero-copy)
│ - AnalyserNode      │
│ - Gain norm         │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ PitchDetector       │──▶ { note, cents, confidence, frequency }
│ (Web Worker)        │    Posted back to main thread
│ - YIN algorithm     │
│ - 1024 samples      │
│ - Runs every ~23ms  │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ GameEngine          │──▶ State update
│ - Note validation   │
│ - Hold timer        │
│ - Progression       │
└─────────────────────┘
       │
       ├──────────────────────────┬────────────────────┐
       ▼                          ▼                    ▼
┌────────────────┐    ┌──────────────────┐    ┌──────────────┐
│ ScoreSystem    │    │ Renderer         │    │ StateRecovery│
│ - Calculate    │    │ - Draw character │    │ - Save state │
│ - Combo bonus  │    │ - Update meter   │    │ - localStorage│
│ - Grade        │    │ - Particles      │    │              │
└────────────────┘    └──────────────────┘    └──────────────┘
       │                          │
       │                          ▼
       │                  ┌──────────────┐
       │                  │ Canvas       │
       └─────────────────▶│ Visual output│
                          └──────────────┘
```

---

## Phase 0: Setup & User Research

**Duration**: 3-4 days
**Objective**: Establish project infrastructure and validate core assumptions.

### 0.1 Project Initialization

#### Tasks

- [ ] Initialize Git repository with main branch
- [ ] Create project structure (folders as per architecture)
- [ ] Setup Vite with configuration
- [ ] Configure ESLint + Prettier (Airbnb style guide)
- [ ] Setup Vitest + Playwright
- [ ] Create initial README with setup instructions
- [ ] Configure GitHub Actions (basic CI)

#### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scale-climber/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          audio: [
            './src/audio/PitchDetector.js',
            './src/audio/AudioCapture.js',
            './src/audio/AudioContextManager.js'
          ],
          game: [
            './src/game/GameEngine.js',
            './src/game/ScaleChallenge.js'
          ]
        }
      }
    }
  },
  worker: {
    format: 'es',
    plugins: []
  },
  server: {
    port: 3000,
    https: false // Set to true for local HTTPS testing (mic requires secure context)
  }
});
```

#### Definition of Done

- [ ] `npm run dev` starts dev server
- [ ] `npm run build` produces optimized bundle
- [ ] `npm test` runs unit tests
- [ ] `npm run lint` passes with no errors
- [ ] All team members can run project locally
- [ ] GitHub Actions runs on push (even if tests are empty)

### 0.2 User Research Execution

**See "User Research & Validation" section for full details.**

#### Key Deliverables

- [ ] 8-10 user interviews completed
- [ ] Interview synthesis document created
- [ ] Default octave ranges validated (C3-C4 for bass, C4-C5 for alto/soprano)
- [ ] Tolerance thresholds confirmed (±10/25/50 cents for perfect/great/ok)
- [ ] Mobile vs desktop priority determined
- [ ] Feature priority ranking from user feedback

#### Success Gate

**Cannot proceed to Phase 1 until**:
- At least 6 interviews completed
- Core mechanic validated (70%+ positive)
- Major blockers identified and mitigated

---

## Phase 1: Audio Foundation

**Duration**: 1.5 weeks
**Objective**: Robust, low-latency audio capture and pitch detection that works across all target browsers.

### 1.1 Audio Context Manager

**Objective**: Reliable lifecycle management of AudioContext across browser quirks.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| ACM-001 | Handle AudioContext suspension | Must | Automatically resumes on user gesture |
| ACM-002 | Detect autoplay policy blocks | Must | Shows "tap to enable audio" prompt |
| ACM-003 | Recover from device changes | Must | Detects mic disconnect, prompts reconnect |
| ACM-004 | Support multiple sample rates | Must | Works with 44.1kHz and 48kHz devices |
| ACM-005 | Single instance (singleton) | Must | Only one AudioContext created |

#### Implementation Specification

```javascript
// src/audio/AudioContextManager.js

/**
 * Manages AudioContext lifecycle and browser compatibility.
 * Singleton pattern ensures single AudioContext instance.
 */
class AudioContextManager {
  constructor() {
    if (AudioContextManager.instance) {
      return AudioContextManager.instance;
    }

    this.context = null;
    this.stream = null;
    this.analyser = null;
    this.source = null;
    this.listeners = new Map();

    AudioContextManager.instance = this;
  }

  /**
   * Initialize AudioContext and request microphone permission.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async initialize() {
    try {
      // Create AudioContext (browser-prefixed fallback)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return { success: false, error: 'WEB_AUDIO_UNSUPPORTED' };
      }

      this.context = new AudioContext();

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,  // Don't cancel our singing!
          noiseSuppression: false,  // Need raw pitch data
          autoGainControl: false,   // Manual gain normalization
          sampleRate: 44100         // Preferred, browser may override
        }
      });

      this.stream = stream;

      // Setup audio processing pipeline
      this.source = this.context.createMediaStreamSource(stream);
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;
      this.source.connect(this.analyser);

      // iOS Safari: context starts suspended
      if (this.context.state === 'suspended') {
        await this.resume();
      }

      // Monitor for device changes
      stream.getAudioTracks()[0].addEventListener('ended', () => {
        this.emit('deviceDisconnected');
      });

      return {
        success: true,
        sampleRate: this.context.sampleRate
      };

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        return { success: false, error: 'PERMISSION_DENIED' };
      }
      if (err.name === 'NotFoundError') {
        return { success: false, error: 'NO_MICROPHONE' };
      }
      return { success: false, error: 'UNKNOWN_ERROR', details: err.message };
    }
  }

  /**
   * Resume suspended AudioContext (required after page visibility change on iOS).
   * Must be called from user gesture handler.
   * @returns {Promise<boolean>}
   */
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
      return this.context.state === 'running';
    }
    return true;
  }

  /**
   * Get audio buffer for pitch detection.
   * @returns {Float32Array}
   */
  getAudioBuffer() {
    const bufferLength = this.analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(buffer);
    return buffer;
  }

  /**
   * Calculate RMS volume (for noise gate).
   * @returns {number} Volume in range [0, 1]
   */
  getVolume() {
    const buffer = this.getAudioBuffer();
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Stop audio capture and cleanup.
   */
  dispose() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.context) {
      this.context.close();
    }
    this.context = null;
    this.stream = null;
    this.analyser = null;
    this.source = null;
  }

  // Simple event emitter
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }
}

export default new AudioContextManager();
```

#### Test Cases

| Test ID | Scenario | Mocking | Expected Result |
|---------|----------|---------|-----------------|
| ACM-T001 | Initialize with permission granted | Mock getUserMedia success | `{ success: true, sampleRate: 44100 }` |
| ACM-T002 | Initialize with permission denied | Mock getUserMedia NotAllowedError | `{ success: false, error: 'PERMISSION_DENIED' }` |
| ACM-T003 | No microphone available | Mock getUserMedia NotFoundError | `{ success: false, error: 'NO_MICROPHONE' }` |
| ACM-T004 | AudioContext suspended (iOS) | Mock context.state = 'suspended' | Automatically calls resume() |
| ACM-T005 | Microphone disconnected mid-session | Trigger MediaStreamTrack 'ended' event | Emits 'deviceDisconnected' event |
| ACM-T006 | Multiple initializations | Call initialize() twice | Returns same instance (singleton) |

#### Definition of Done

- [ ] All test cases pass
- [ ] Works on Chrome, Firefox, Safari, Edge (manual test)
- [ ] iOS Safari microphone permission flow verified
- [ ] Device disconnect/reconnect handled gracefully
- [ ] Code reviewed and documented

---

### 1.2 Pitch Detection (YIN Algorithm)

**Objective**: Accurately detect fundamental frequency with sub-semitone precision in a Web Worker.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| PD-001 | Implement YIN autocorrelation | Must | Detects F0 within ±5 cents for sustained tones |
| PD-002 | Parabolic interpolation | Must | Sub-sample accuracy achieved |
| PD-003 | Confidence scoring | Must | Returns 0-1 confidence with each detection |
| PD-004 | Noise gate | Must | Rejects input below -40dB threshold |
| PD-005 | Web Worker processing | Must | Detection runs off main thread with Transferable Objects |
| PD-006 | Frequency range | Must | Accurate from 80Hz (E2) to 1000Hz (B5) |
| PD-007 | Adaptive buffer size | Should | Falls back to 2048 samples if 1024 causes instability |

#### YIN Algorithm Implementation

```javascript
// src/audio/PitchDetector.worker.js

/**
 * YIN Pitch Detection Algorithm
 * Reference: De Cheveigné & Kawahara (2002)
 * Runs in Web Worker for main thread performance
 */

const YIN_CONFIG = {
  threshold: 0.15,              // Aperiodicity threshold
  probabilityThreshold: 0.7,    // Minimum confidence
  minFrequency: 80,             // ~E2
  maxFrequency: 1000,           // ~B5
  noiseGateThreshold: 0.01      // RMS threshold
};

let sampleRate = 44100;
let bufferSize = 1024;  // Start with smaller buffer for lower latency
let minPeriod = Math.floor(sampleRate / YIN_CONFIG.maxFrequency);
let maxPeriod = Math.floor(sampleRate / YIN_CONFIG.minFrequency);

/**
 * Initialize worker with config
 */
self.onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'init') {
    sampleRate = data.sampleRate;
    bufferSize = data.bufferSize || 1024;
    minPeriod = Math.floor(sampleRate / YIN_CONFIG.maxFrequency);
    maxPeriod = Math.floor(sampleRate / YIN_CONFIG.minFrequency);
    self.postMessage({ type: 'ready' });
    return;
  }

  if (type === 'process') {
    const result = detectPitch(data.buffer);
    self.postMessage({ type: 'result', data: result });
  }
};

/**
 * Main pitch detection function
 * @param {Float32Array} buffer - Audio samples (Transferred, not copied)
 * @returns {Object} { frequency, confidence, note, cents }
 */
function detectPitch(buffer) {
  // Step 0: Noise gate
  const rms = calculateRMS(buffer);
  if (rms < YIN_CONFIG.noiseGateThreshold) {
    return { frequency: null, confidence: 0, note: null, cents: 0 };
  }

  // Step 1: Difference function
  const differenceFunction = new Float32Array(maxPeriod + 1);
  for (let tau = 0; tau <= maxPeriod; tau++) {
    let sum = 0;
    for (let i = 0; i < buffer.length - tau; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    differenceFunction[tau] = sum;
  }

  // Step 2: Cumulative mean normalized difference
  const cmndf = new Float32Array(maxPeriod + 1);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= maxPeriod; tau++) {
    runningSum += differenceFunction[tau];
    cmndf[tau] = differenceFunction[tau] / (runningSum / tau);
  }

  // Step 3: Absolute threshold
  let tau = minPeriod;
  while (tau < maxPeriod) {
    if (cmndf[tau] < YIN_CONFIG.threshold) {
      while (tau + 1 < maxPeriod && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      break;
    }
    tau++;
  }

  if (tau === maxPeriod) {
    return { frequency: null, confidence: 0, note: null, cents: 0 };
  }

  // Step 4: Parabolic interpolation
  let betterTau = tau;
  if (tau > 0 && tau < maxPeriod) {
    const s0 = cmndf[tau - 1];
    const s1 = cmndf[tau];
    const s2 = cmndf[tau + 1];
    betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  // Step 5: Convert to frequency
  const frequency = sampleRate / betterTau;

  // Confidence based on how far below threshold
  const confidence = Math.max(0, Math.min(1, 1 - cmndf[tau]));

  if (confidence < YIN_CONFIG.probabilityThreshold) {
    return { frequency: null, confidence, note: null, cents: 0 };
  }

  // Convert to note
  const noteData = frequencyToNote(frequency);

  return {
    frequency,
    confidence,
    ...noteData
  };
}

/**
 * Calculate RMS volume
 */
function calculateRMS(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Convert frequency to note name and cent deviation
 */
function frequencyToNote(frequency) {
  const A4 = 440;
  const midiNumber = 69 + 12 * Math.log2(frequency / A4);
  const nearestMidi = Math.round(midiNumber);
  const cents = Math.round((midiNumber - nearestMidi) * 100);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteIndex = nearestMidi % 12;
  const octave = Math.floor(nearestMidi / 12) - 1;

  return {
    note: `${noteNames[noteIndex]}${octave}`,
    noteName: noteNames[noteIndex],
    octave,
    cents,
    midi: nearestMidi
  };
}
```

#### Main Thread Integration

```javascript
// src/audio/PitchDetector.js

/**
 * Main thread wrapper for PitchDetector worker
 */
class PitchDetector {
  constructor(audioContextManager) {
    this.audioManager = audioContextManager;
    this.worker = new Worker(new URL('./PitchDetector.worker.js', import.meta.url), {
      type: 'module'
    });
    this.isReady = false;
    this.callbacks = new Map();
    this.messageId = 0;

    this.worker.onmessage = (e) => this.handleMessage(e);
  }

  async init() {
    return new Promise((resolve) => {
      this.worker.postMessage({
        type: 'init',
        data: {
          sampleRate: this.audioManager.context.sampleRate,
          bufferSize: 1024  // Start with lower latency
        }
      });

      const handler = (e) => {
        if (e.data.type === 'ready') {
          this.isReady = true;
          this.worker.removeEventListener('message', handler);
          resolve();
        }
      };
      this.worker.addEventListener('message', handler);
    });
  }

  /**
   * Detect pitch from current audio buffer
   * @returns {Promise<Object>} { frequency, confidence, note, cents }
   */
  async detect() {
    if (!this.isReady) {
      throw new Error('PitchDetector not initialized');
    }

    const buffer = this.audioManager.getAudioBuffer();

    // Transfer buffer to worker (zero-copy)
    return new Promise((resolve) => {
      const id = this.messageId++;
      this.callbacks.set(id, resolve);

      this.worker.postMessage({
        type: 'process',
        id,
        data: { buffer }
      }, [buffer.buffer]);  // Transfer ownership - CRITICAL for performance
    });
  }

  handleMessage(e) {
    const { type, id, data } = e.data;
    if (type === 'result' && this.callbacks.has(id)) {
      this.callbacks.get(id)(data);
      this.callbacks.delete(id);
    }
  }

  dispose() {
    this.worker.terminate();
  }
}

export default PitchDetector;
```

#### Performance Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| Processing time per buffer | <5ms | 10ms |
| Memory allocation per call | <100KB | 500KB |
| Detection latency (total) | <30ms | 50ms |

#### Test Cases

| Test ID | Input | Expected Output |
|---------|-------|-----------------|
| PD-T001 | 440Hz sine wave | `{ frequency: 440±2, note: 'A4', cents: 0±5, confidence: >0.9 }` |
| PD-T002 | 261.63Hz sine wave | `{ frequency: 261.63±1, note: 'C4', cents: 0±5, confidence: >0.9 }` |
| PD-T003 | White noise | `{ frequency: null, confidence: <0.3 }` |
| PD-T004 | Low volume (below gate) | `{ frequency: null, confidence: 0 }` |
| PD-T005 | 440Hz at -3 cents | `{ frequency: ~439.5, note: 'A4', cents: -3±2, confidence: >0.8 }` |
| PD-T006 | 80Hz (boundary) | `{ frequency: 80±5, note: 'E2', confidence: >0.7 }` |
| PD-T007 | 1000Hz (boundary) | `{ frequency: 1000±5, note: 'B5', confidence: >0.7 }` |
| PD-T008 | Human voice "ah" at 440Hz | `{ frequency: 440±15, note: 'A4', confidence: >0.7 }` |

#### Definition of Done

- [ ] All unit tests pass with generated audio
- [ ] Manual testing with 3+ real voices validates accuracy
- [ ] Performance profiling shows <10ms processing time
- [ ] Web Worker transfers buffers without copying (verified)
- [ ] Works with both 44.1kHz and 48kHz sample rates
- [ ] Algorithm documented with academic reference
- [ ] Code reviewed

---

### 1.3 Calibration Engine

**Objective**: Automatically detect user's voice range and suggest appropriate octave.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| CAL-001 | Detect pitch range | Must | Identifies lowest and highest comfortable pitches |
| CAL-002 | Suggest octave | Must | Recommends C3-C4, C4-C5, or C5-C6 based on range |
| CAL-003 | Volume calibration | Must | Measures average singing volume for gain adjustment |
| CAL-004 | Quick calibration | Should | Completes in <20 seconds |
| CAL-005 | Skip option | Should | Advanced users can skip calibration |

#### Calibration Flow State Machine

```
┌──────────────┐
│ CALIBRATION  │
│    START     │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  VOLUME_TEST     │  "Make some noise to test your microphone"
│  Duration: 3s    │  → Measure RMS, set gain normalization
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  RANGE_DETECT    │  "Sing a comfortable low note, then a high note"
│  Duration: 10s   │  → Track min/max pitches detected
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  ANALYSIS        │  Determine voice type, suggest octave
│  Duration: 1s    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  CONFIRMATION    │  "Your range: E3-A4. We suggest: C4-C5 (Alto)"
│                  │  [Accept] [Choose Different] [Skip Calibration]
└──────────────────┘
```

#### Implementation

```javascript
// src/audio/CalibrationEngine.js

class CalibrationEngine {
  constructor(pitchDetector, audioManager) {
    this.pitchDetector = pitchDetector;
    this.audioManager = audioManager;

    this.reset();
  }

  reset() {
    this.state = 'idle';
    this.volumeSamples = [];
    this.pitchSamples = [];
    this.minFrequency = Infinity;
    this.maxFrequency = 0;
    this.averageVolume = 0;
  }

  /**
   * Start calibration process
   */
  async start() {
    this.reset();

    // Phase 1: Volume test (3 seconds)
    this.state = 'volume_test';
    await this.runVolumeTest(3000);

    // Phase 2: Range detection (10 seconds)
    this.state = 'range_detect';
    await this.runRangeDetection(10000);

    // Phase 3: Analysis
    this.state = 'analysis';
    const result = this.analyzeResults();

    this.state = 'complete';
    return result;
  }

  async runVolumeTest(duration) {
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      const volume = this.audioManager.getVolume();
      this.volumeSamples.push(volume);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Calculate average and recommended gain
    this.averageVolume = this.volumeSamples.reduce((a, b) => a + b, 0) / this.volumeSamples.length;
  }

  async runRangeDetection(duration) {
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      const result = await this.pitchDetector.detect();

      if (result.frequency && result.confidence > 0.7) {
        this.pitchSamples.push(result);

        if (result.frequency < this.minFrequency) {
          this.minFrequency = result.frequency;
        }
        if (result.frequency > this.maxFrequency) {
          this.maxFrequency = result.frequency;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  analyzeResults() {
    if (this.pitchSamples.length < 10) {
      return {
        success: false,
        error: 'NOT_ENOUGH_SAMPLES',
        message: 'Not enough valid pitches detected. Please try again and sing louder.'
      };
    }

    // Determine voice range and suggest octave
    const ranges = [
      { name: 'Bass', min: 82, max: 147, scale: 'C2-C3', octaveKey: 'bass' },
      { name: 'Baritone', min: 110, max: 220, scale: 'C3-C4', octaveKey: 'baritone' },
      { name: 'Alto/Tenor', min: 196, max: 440, scale: 'C4-C5', octaveKey: 'alto' },
      { name: 'Soprano', min: 330, max: 880, scale: 'C5-C6', octaveKey: 'soprano' }
    ];

    // Find best match based on detected range
    const centerFrequency = (this.minFrequency + this.maxFrequency) / 2;
    let bestMatch = ranges[2]; // Default to alto
    let bestScore = 0;

    for (const range of ranges) {
      const rangeCenter = (range.min + range.max) / 2;
      const score = 1 / (1 + Math.abs(centerFrequency - rangeCenter));

      if (score > bestScore) {
        bestScore = score;
        bestMatch = range;
      }
    }

    return {
      success: true,
      detectedRange: {
        min: this.minFrequency,
        max: this.maxFrequency,
        samples: this.pitchSamples.length
      },
      recommendation: {
        voiceType: bestMatch.name,
        scale: bestMatch.scale,
        octaveKey: bestMatch.octaveKey
      },
      volumeCalibration: {
        averageVolume: this.averageVolume,
        recommendedGain: this.calculateGain()
      }
    };
  }

  calculateGain() {
    // Target RMS of 0.1 (adjust if too quiet/loud)
    const targetVolume = 0.1;
    return targetVolume / Math.max(this.averageVolume, 0.01);
  }
}

export default CalibrationEngine;
```

#### Test Cases

| Test ID | Simulated Input | Expected Result |
|---------|----------------|-----------------|
| CAL-T001 | Pitches between 130-260Hz | Suggests Baritone (C3-C4) |
| CAL-T002 | Pitches between 260-520Hz | Suggests Alto (C4-C5) |
| CAL-T003 | Only 5 valid pitch samples | Returns error: NOT_ENOUGH_SAMPLES |
| CAL-T004 | Very quiet singing | recommendedGain > 1.5 |
| CAL-T005 | Very loud singing | recommendedGain < 0.7 |

#### Definition of Done

- [ ] All test cases pass
- [ ] Manual testing with 5+ users of different voice types
- [ ] Calibration completes in <20 seconds
- [ ] Results feel accurate to testers
- [ ] UI integration complete
- [ ] Code reviewed

---

### Phase 1 Definition of Done

**Exit Criteria (ALL must pass)**:
- [ ] All AF-xxx, PD-xxx, CAL-xxx requirements met
- [ ] Unit test coverage ≥90% for audio modules
- [ ] Performance: Pitch detection <10ms per buffer
- [ ] Latency: End-to-end audio→visual <50ms
- [ ] Browser compatibility: Chrome, Firefox, Safari, Edge verified
- [ ] Calibration flow tested with 5+ users
- [ ] Code reviewed by senior engineer
- [ ] Technical documentation updated in docs/API.md
- [ ] Demo to stakeholders completed and approved

---

## Phase 2: Game Logic

**Duration**: 1 week
**Objective**: Core gameplay mechanics with state persistence and error recovery.

### 2.1 Game State Machine

**Objective**: Manage game flow with clear state transitions and robust error handling.

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
│          ┌─────────────────────────────────────┼───────────┐   │
│          │ user clicks "Start"                 │ "Resume?" │   │
│          ▼                                     ▼           │   │
│    ┌────────────┐                       ┌────────────┐    │   │
│    │ PERMISSION │ ─── granted ───▶      │  RESTORE   │────┘   │
│    │  REQUEST   │                       │  SESSION   │        │
│    └─────┬──────┘                       └────┬───────┘        │
│          │ denied                            │               │
│          ▼                                   ▼               │
│    ┌────────────┐                       ┌────────────────┐   │
│    │   ERROR    │                       │  CALIBRATION   │   │
│    │  (Retry)   │                       │  (Auto-detect) │   │
│    └────────────┘                       └───────┬────────┘   │
│                                                 │            │
│                                        ┌────────┼─────────┐  │
│                                        │        ▼         │  │
│                                        │  ┌──────────┐    │  │
│                                        │  │  OCTAVE  │    │  │
│                                        │  │  SELECT  │    │  │
│                                        │  └────┬─────┘    │  │
│                                        │       │          │  │
│                                        │ "Skip"│          │  │
│                                        └───────┼──────────┘  │
│                                                ▼             │
│                                          ┌────────────────┐  │
│                                          │   COUNTDOWN    │  │
│                                          │   (3-2-1-GO)   │  │
│                                          └───────┬────────┘  │
│                                                  │           │
│                                                  ▼           │
│    ┌──────────────────────────────────────────────────────────┐│
│    │                    PLAYING                            │  ││
│    │  ┌─────────────────────────────────────────────────┐ │  ││
│    │  │ Sub-states:                                      │ │  ││
│    │  │  • LISTENING   - Waiting for pitch input        │ │  ││
│    │  │  • DETECTING   - Processing pitch               │ │  ││
│    │  │  • NOTE_HIT    - Success animation (500ms)      │ │  ││
│    │  │  • TRANSITIONING - Moving to next note          │ │  ││
│    │  └─────────────────────────────────────────────────┘ │  ││
│    └───────────────────┬──────────────────────────────────┘  ││
│                        │                                      ││
│         ┌──────────────┼──────────────────┬─────────────┐    ││
│         │              │                  │             │    ││
│         ▼              ▼                  ▼             ▼    ││
│   ┌──────────┐  ┌──────────┐      ┌──────────┐  ┌──────────┐││
│   │  PAUSED  │  │  ERROR   │      │ COMPLETE │  │  FAILED  │││
│   │          │  │ (Recover)│      │ (Victory)│  │ (Timeout)│││
│   └────┬─────┘  └────┬─────┘      └────┬─────┘  └────┬─────┘││
│        │             │                 │             │      ││
│        │             └────────┬────────┴─────────────┘      ││
│        │                      ▼                             ││
│        │               ┌────────────┐                       ││
│        │               │  RESULTS   │                       ││
│        │               │  (Summary) │                       ││
│        │               └─────┬──────┘                       ││
│        │                     │                              ││
│        └─────────────────────┴────────▶ MENU                ││
│                                                              ││
└──────────────────────────────────────────────────────────────┘│
```

#### State Definitions

| State | Entry Condition | Exit Condition | Actions | Persistence |
|-------|-----------------|----------------|---------|-------------|
| INIT | App starts | Assets loaded | Load sprites, sounds, fonts, check localStorage for saved session | No |
| MENU | Assets ready OR game ends | Start/Resume clicked | Show title, high scores, resume option if session exists | No |
| PERMISSION_REQUEST | Start clicked | Granted/Denied | Request mic access via AudioContextManager | No |
| RESTORE_SESSION | Resume clicked | Restore complete | Load saved game state from localStorage | No |
| CALIBRATION | Permission granted (first time) | Calibration complete/skipped | Run CalibrationEngine, suggest octave | Yes (save results) |
| OCTAVE_SELECT | Calibration complete | Selection made | Show voice range options, apply calibration suggestion | No |
| COUNTDOWN | Octave selected | Count reaches 0 | 3-2-1-GO animation, reset score | No |
| PLAYING | Countdown ends | Complete/Fail/Pause/Error | Process audio, update game, save state every 5 seconds | Yes (auto-save) |
| PAUSED | Pause key/button pressed | Resume/Quit | Freeze game state, show pause menu | Yes (manual save) |
| ERROR | Audio device error | Retry/Quit | Show error dialog, attempt recovery | No |
| COMPLETE | Final note hit | Continue clicked | Victory animation, calculate final score | Yes (high score) |
| FAILED | Timeout/Give up | Continue clicked | Fail animation, show reason | Yes (attempt logged) |
| RESULTS | Complete/Failed | Continue clicked | Show scores, save high score, clear session | Yes (high score) |

#### Implementation

```javascript
// src/game/GameEngine.js

import AudioContextManager from '../audio/AudioContextManager.js';
import PitchDetector from '../audio/PitchDetector.js';
import CalibrationEngine from '../audio/CalibrationEngine.js';
import ScaleChallenge from './ScaleChallenge.js';
import PracticeMode from './PracticeMode.js';
import ScoreSystem from './ScoreSystem.js';
import StateRecovery from './StateRecovery.js';

class GameEngine {
  constructor() {
    this.state = 'init';
    this.subState = null;

    // Audio components
    this.audioManager = AudioContextManager;
    this.pitchDetector = null;
    this.calibrationEngine = null;

    // Game modes
    this.currentMode = null; // ScaleChallenge or PracticeMode
    this.scoreSystem = new ScoreSystem();
    this.stateRecovery = new StateRecovery();

    // State management
    this.currentNote = 0;
    this.isPaused = false;
    this.lastPitchResult = null;

    // Performance monitoring
    this.frameTime = 0;
    this.lastFrameTimestamp = 0;
  }

  /**
   * Initialize game engine
   */
  async init() {
    this.state = 'init';

    // Load assets (sprites, sounds, fonts)
    await this.loadAssets();

    // Check for saved session
    const savedSession = this.stateRecovery.hasSavedSession();

    this.state = 'menu';
    return { savedSession };
  }

  /**
   * Start new game
   */
  async startNewGame(mode = 'challenge') {
    this.state = 'permission_request';

    // Request microphone
    const result = await this.audioManager.initialize();

    if (!result.success) {
      this.state = 'error';
      return { success: false, error: result.error };
    }

    // Initialize pitch detector
    this.pitchDetector = new PitchDetector(this.audioManager);
    await this.pitchDetector.init();

    // Check if user has calibrated before
    const calibrationData = this.stateRecovery.getCalibration();

    if (!calibrationData) {
      // First-time user: run calibration
      this.state = 'calibration';
      this.calibrationEngine = new CalibrationEngine(this.pitchDetector, this.audioManager);
      const calibResult = await this.calibrationEngine.start();

      if (calibResult.success) {
        this.stateRecovery.saveCalibration(calibResult);
        this.state = 'octave_select';
        return { success: true, calibration: calibResult };
      } else {
        this.state = 'error';
        return { success: false, error: calibResult.error };
      }
    } else {
      // Returning user: skip to octave selection
      this.state = 'octave_select';
      return { success: true, calibration: calibrationData };
    }
  }

  /**
   * Resume saved session
   */
  async resumeSession() {
    this.state = 'restore_session';

    // Request microphone
    const result = await this.audioManager.initialize();
    if (!result.success) {
      this.state = 'error';
      return { success: false, error: result.error };
    }

    // Initialize pitch detector
    this.pitchDetector = new PitchDetector(this.audioManager);
    await this.pitchDetector.init();

    // Restore game state
    const savedState = this.stateRecovery.loadSession();
    if (!savedState) {
      return { success: false, error: 'NO_SAVED_SESSION' };
    }

    // Recreate game mode
    if (savedState.mode === 'challenge') {
      this.currentMode = new ScaleChallenge(savedState.config);
    } else {
      this.currentMode = new PracticeMode(savedState.config);
    }

    this.currentMode.restore(savedState.modeState);
    this.scoreSystem.restore(savedState.score);
    this.currentNote = savedState.currentNote;

    this.state = 'countdown';
    return { success: true, savedState };
  }

  /**
   * Start playing after octave selection
   */
  startPlaying(octaveKey, difficulty = 'normal') {
    this.state = 'countdown';

    // Create game mode
    this.currentMode = new ScaleChallenge({
      octave: octaveKey,
      difficulty,
      onNoteHit: (noteData) => this.handleNoteHit(noteData),
      onNoteMiss: (noteData) => this.handleNoteMiss(noteData),
      onComplete: () => this.handleComplete(),
      onFail: (reason) => this.handleFail(reason)
    });

    // Countdown: 3, 2, 1, GO
    setTimeout(() => {
      this.state = 'playing';
      this.subState = 'listening';
      this.startGameLoop();
    }, 3000);
  }

  /**
   * Main game loop
   */
  async startGameLoop() {
    const loop = async () => {
      if (this.state !== 'playing') return;

      const frameStart = performance.now();

      // Get current pitch
      this.lastPitchResult = await this.pitchDetector.detect();

      // Update game mode
      const update = this.currentMode.update(this.lastPitchResult);

      if (update.stateChanged) {
        this.subState = update.newState;
      }

      // Auto-save every 5 seconds
      if (frameStart % 5000 < 16) {
        this.saveGameState();
      }

      // Performance monitoring
      this.frameTime = performance.now() - frameStart;

      // Continue loop
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /**
   * Handle successful note hit
   */
  handleNoteHit(noteData) {
    const score = this.scoreSystem.addNote(
      noteData.averageCents,
      noteData.timeToHit,
      true
    );

    this.currentNote++;

    // Emit event for UI
    this.emit('noteHit', { noteData, score });
  }

  /**
   * Handle note miss
   */
  handleNoteMiss(noteData) {
    this.scoreSystem.addNote(noteData.averageCents, noteData.timeToHit, false);
    this.emit('noteMiss', { noteData });
  }

  /**
   * Handle game completion
   */
  handleComplete() {
    this.state = 'complete';

    const finalScore = this.scoreSystem.getFinalScore();
    const grade = this.scoreSystem.getGrade();

    // Save high score
    this.stateRecovery.saveHighScore(finalScore, grade);

    // Clear session
    this.stateRecovery.clearSession();

    this.emit('gameComplete', { finalScore, grade });
  }

  /**
   * Handle game failure
   */
  handleFail(reason) {
    this.state = 'failed';
    this.stateRecovery.clearSession();
    this.emit('gameFailed', { reason });
  }

  /**
   * Pause game
   */
  pause() {
    if (this.state === 'playing') {
      this.isPaused = true;
      this.state = 'paused';
      this.saveGameState();
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
    }
  }

  /**
   * Save current game state
   */
  saveGameState() {
    this.stateRecovery.saveSession({
      mode: this.currentMode.type,
      modeState: this.currentMode.getState(),
      score: this.scoreSystem.getState(),
      currentNote: this.currentNote,
      config: this.currentMode.config,
      timestamp: Date.now()
    });
  }

  /**
   * Simple event emitter
   */
  on(event, callback) {
    // Implementation omitted for brevity
  }

  emit(event, data) {
    // Implementation omitted for brevity
  }
}

export default GameEngine;
```

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
| SC-007 | Breath detection | Should | Distinguish silence from breath vs giving up |

#### Challenge Configuration

```javascript
// src/game/ScaleChallenge.js

const CHALLENGE_CONFIG = {
  // Timing
  holdDuration: 500,           // ms required to hold note
  maxSilenceGap: 3000,         // ms before timeout failure
  breathThreshold: 1500,       // ms of quiet before considering it a "breath"
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

const PITCH_TOLERANCE = {
  perfect: 10,      // ±10 cents - green zone
  great: 25,        // ±25 cents - yellow zone
  acceptable: 50,   // ±50 cents - orange zone
  // Beyond 50 cents = miss (red zone)
};

class ScaleChallenge {
  constructor(config) {
    this.type = 'challenge';
    this.config = config;

    this.octave = config.octave || 'alto';
    this.difficulty = config.difficulty || 'normal';
    this.scale = C_MAJOR_SCALES[this.octave];
    this.scaleNotes = Object.keys(this.scale);

    // Apply difficulty modifiers
    const diffConfig = CHALLENGE_CONFIG.difficulty[this.difficulty];
    this.holdDuration = diffConfig.holdDuration;
    this.maxSilenceGap = diffConfig.maxSilenceGap;
    this.toleranceMultiplier = diffConfig.toleranceMultiplier;

    // State
    this.currentNoteIndex = 0;
    this.currentAttempt = null;
    this.lastValidPitchTime = Date.now();
    this.silenceStartTime = null;
    this.breathCount = 0;

    // Callbacks
    this.onNoteHit = config.onNoteHit || (() => {});
    this.onNoteMiss = config.onNoteMiss || (() => {});
    this.onComplete = config.onComplete || (() => {});
    this.onFail = config.onFail || (() => {});
  }

  /**
   * Update challenge with latest pitch detection
   */
  update(pitchResult) {
    const now = Date.now();

    // Handle silence
    if (!pitchResult.frequency || pitchResult.confidence < 0.7) {
      if (!this.silenceStartTime) {
        this.silenceStartTime = now;
      }

      const silenceDuration = now - this.silenceStartTime;

      // Check for breath vs timeout
      if (silenceDuration > CHALLENGE_CONFIG.breathThreshold &&
          silenceDuration < this.maxSilenceGap) {
        // Likely a breath, don't penalize yet
        this.breathCount++;
      } else if (silenceDuration > this.maxSilenceGap) {
        // Too long, game over
        this.onFail('TIMEOUT');
        return { stateChanged: true, newState: 'failed' };
      }

      // Reset hold timer if user went silent
      if (this.currentAttempt && this.currentAttempt.status === 'active') {
        this.currentAttempt.status = 'waiting';
        this.currentAttempt.holdTime = 0;
      }

      return { stateChanged: false };
    }

    // Valid pitch detected
    this.silenceStartTime = null;
    this.lastValidPitchTime = now;

    // Get current target note
    const targetNoteName = this.scaleNotes[this.currentNoteIndex];
    const targetFrequency = this.scale[targetNoteName];

    // Calculate cents deviation from target
    const cents = this.calculateCents(pitchResult.frequency, targetFrequency);
    const tolerance = this.getTolerance(Math.abs(cents));

    // Initialize attempt if needed
    if (!this.currentAttempt) {
      this.currentAttempt = {
        targetNote: targetNoteName,
        targetFrequency,
        startTime: now,
        holdTime: 0,
        pitchSamples: [],
        bestCents: Infinity,
        status: 'waiting'
      };
    }

    // Record sample
    this.currentAttempt.pitchSamples.push({
      frequency: pitchResult.frequency,
      cents,
      tolerance,
      timestamp: now
    });

    if (Math.abs(cents) < Math.abs(this.currentAttempt.bestCents)) {
      this.currentAttempt.bestCents = cents;
    }

    // Check if within acceptable range
    if (tolerance !== 'miss') {
      if (this.currentAttempt.status === 'waiting') {
        this.currentAttempt.status = 'active';
        this.currentAttempt.holdStartTime = now;
      }

      // Accumulate hold time
      this.currentAttempt.holdTime = now - this.currentAttempt.holdStartTime;

      // Check if held long enough
      if (this.currentAttempt.holdTime >= this.holdDuration) {
        // Success!
        this.currentAttempt.status = 'success';

        // Calculate average cents for scoring
        const avgCents = this.calculateAverageCents();
        const timeToHit = now - this.currentAttempt.startTime;

        this.onNoteHit({
          note: targetNoteName,
          averageCents: avgCents,
          timeToHit,
          holdTime: this.currentAttempt.holdTime,
          samples: this.currentAttempt.pitchSamples.length
        });

        // Move to next note
        this.currentNoteIndex++;
        this.currentAttempt = null;

        // Check if scale complete
        if (this.currentNoteIndex >= this.scaleNotes.length) {
          this.onComplete();
          return { stateChanged: true, newState: 'complete' };
        }

        return { stateChanged: true, newState: 'note_hit' };
      }
    } else {
      // Outside tolerance, reset hold
      if (this.currentAttempt.status === 'active') {
        this.currentAttempt.status = 'waiting';
        this.currentAttempt.holdTime = 0;
      }
    }

    return { stateChanged: false };
  }

  /**
   * Calculate cents deviation from target frequency
   */
  calculateCents(frequency, targetFrequency) {
    return Math.round(1200 * Math.log2(frequency / targetFrequency));
  }

  /**
   * Determine tolerance category for cent deviation
   */
  getTolerance(absCents) {
    const adjusted = absCents / this.toleranceMultiplier;

    if (adjusted <= PITCH_TOLERANCE.perfect) return 'perfect';
    if (adjusted <= PITCH_TOLERANCE.great) return 'great';
    if (adjusted <= PITCH_TOLERANCE.acceptable) return 'acceptable';
    return 'miss';
  }

  /**
   * Calculate average cents from recorded samples
   */
  calculateAverageCents() {
    const samples = this.currentAttempt.pitchSamples;
    const sum = samples.reduce((acc, sample) => acc + Math.abs(sample.cents), 0);
    return Math.round(sum / samples.length);
  }

  /**
   * Get current state (for saving)
   */
  getState() {
    return {
      currentNoteIndex: this.currentNoteIndex,
      currentAttempt: this.currentAttempt,
      breathCount: this.breathCount
    };
  }

  /**
   * Restore state (from save)
   */
  restore(state) {
    this.currentNoteIndex = state.currentNoteIndex;
    this.currentAttempt = state.currentAttempt;
    this.breathCount = state.breathCount || 0;
  }
}

export default ScaleChallenge;
```

#### Test Cases

| Test ID | Scenario | Given | When | Then |
|---------|----------|-------|------|------|
| SC-T001 | Successful note | Target is C4 | User holds C4±10 cents for 500ms | Note marked hit, advance to D4 |
| SC-T002 | Hold interrupted | User holding C4 (300ms) | Pitch goes to ±60 cents | Hold timer resets, status → waiting |
| SC-T003 | Timeout fail | On note D4 | 3.1 seconds of silence | onFail('TIMEOUT') called |
| SC-T004 | Scale complete | On final note C5 | User holds C5 for 500ms | onComplete() called |
| SC-T005 | Breath detected | On note E4 | 1.8s silence followed by singing | No timeout, breathCount++ |
| SC-T006 | Wrong octave | Target C4 (261Hz) | User sings C5 (523Hz) | Cents = ±1200, tolerance = miss |
| SC-T007 | Difficulty: Easy | Easy mode, target C4 | User at +35 cents | tolerance = 'great' (adjusted for 1.5x) |
| SC-T008 | Difficulty: Hard | Hard mode, target C4 | User at +35 cents | tolerance = 'miss' (adjusted for 0.75x) |

### 2.3 Practice Mode

**Objective**: Single-note training without time pressure.

```javascript
// src/game/PracticeMode.js

class PracticeMode {
  constructor(config) {
    this.type = 'practice';
    this.config = config;

    this.targetNote = config.targetNote; // e.g., 'C4'
    this.targetFrequency = config.targetFrequency;

    this.attempts = [];
    this.bestAttempt = null;
  }

  update(pitchResult) {
    if (!pitchResult.frequency || pitchResult.confidence < 0.7) {
      return { feedback: null };
    }

    const cents = Math.round(1200 * Math.log2(pitchResult.frequency / this.targetFrequency));

    this.attempts.push({ cents, timestamp: Date.now() });

    if (!this.bestAttempt || Math.abs(cents) < Math.abs(this.bestAttempt.cents)) {
      this.bestAttempt = { cents, timestamp: Date.now() };
    }

    return {
      feedback: {
        cents,
        tolerance: this.getTolerance(Math.abs(cents)),
        bestAttempt: this.bestAttempt,
        totalAttempts: this.attempts.length
      }
    };
  }

  getTolerance(absCents) {
    if (absCents <= 10) return 'perfect';
    if (absCents <= 25) return 'great';
    if (absCents <= 50) return 'acceptable';
    return 'miss';
  }

  getState() {
    return {
      targetNote: this.targetNote,
      attempts: this.attempts,
      bestAttempt: this.bestAttempt
    };
  }

  restore(state) {
    this.targetNote = state.targetNote;
    this.attempts = state.attempts || [];
    this.bestAttempt = state.bestAttempt || null;
  }
}

export default PracticeMode;
```

### 2.4 Score System

**Objective**: Fair scoring that rewards accuracy and speed.

```javascript
// src/game/ScoreSystem.js

const BASE_POINTS = 100;
const GRADE_THRESHOLDS = {
  S: { min: 1100, label: 'S', color: '#FFD700', message: 'PERFECT PITCH!' },
  A: { min: 960,  label: 'A', color: '#00FF00', message: 'EXCELLENT!' },
  B: { min: 720,  label: 'B', color: '#00BFFF', message: 'GREAT JOB!' },
  C: { min: 480,  label: 'C', color: '#FFA500', message: 'NOT BAD!' },
  D: { min: 240,  label: 'D', color: '#FF6347', message: 'KEEP PRACTICING' },
  F: { min: 0,    label: 'F', color: '#FF0000', message: 'TRY AGAIN!' }
};

class ScoreSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalScore = 0;
    this.noteScores = [];
    this.combo = 0;
    this.maxCombo = 0;
  }

  /**
   * Add score for a note
   */
  addNote(avgCents, timeToHit, success) {
    if (!success) {
      this.combo = 0;
      this.noteScores.push({ points: 0, label: 'MISS', breakdown: null });
      return { points: 0, combo: 0 };
    }

    // Accuracy multiplier
    let accuracyMultiplier, accuracyLabel;
    if (avgCents <= 10) {
      accuracyMultiplier = 1.0;
      accuracyLabel = 'PERFECT';
      this.combo++;
    } else if (avgCents <= 25) {
      accuracyMultiplier = 0.8;
      accuracyLabel = 'GREAT';
      this.combo++;
    } else if (avgCents <= 50) {
      accuracyMultiplier = 0.5;
      accuracyLabel = 'OK';
      this.combo = 0; // Reset combo
    } else {
      accuracyMultiplier = 0.2;
      accuracyLabel = 'WEAK';
      this.combo = 0;
    }

    // Speed bonus: 1.5x for immediate, 1.0x at 2s
    const speedBonus = Math.max(1.0, 1.5 - (timeToHit / 4000));

    // Combo bonus: 10% per consecutive good note (max 7 combo = 1.7x)
    const comboBonus = 1 + (Math.min(this.combo - 1, 7) * 0.1);

    const points = Math.round(BASE_POINTS * accuracyMultiplier * speedBonus * comboBonus);

    this.totalScore += points;
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    const breakdown = {
      base: BASE_POINTS,
      accuracyMultiplier,
      accuracyLabel,
      speedBonus: speedBonus.toFixed(2),
      comboBonus: comboBonus.toFixed(2),
      combo: this.combo
    };

    this.noteScores.push({ points, label: accuracyLabel, breakdown });

    return { points, combo: this.combo, breakdown };
  }

  /**
   * Get final score
   */
  getFinalScore() {
    return this.totalScore;
  }

  /**
   * Get grade
   */
  getGrade() {
    for (const [key, value] of Object.entries(GRADE_THRESHOLDS)) {
      if (this.totalScore >= value.min) {
        return { ...value, score: this.totalScore };
      }
    }
    return { ...GRADE_THRESHOLDS.F, score: this.totalScore };
  }

  /**
   * Get state (for saving)
   */
  getState() {
    return {
      totalScore: this.totalScore,
      noteScores: this.noteScores,
      combo: this.combo,
      maxCombo: this.maxCombo
    };
  }

  /**
   * Restore state
   */
  restore(state) {
    this.totalScore = state.totalScore;
    this.noteScores = state.noteScores;
    this.combo = state.combo;
    this.maxCombo = state.maxCombo;
  }
}

export default ScoreSystem;
```

### 2.5 State Recovery

**Objective**: Persist game state for crash recovery and session resume.

```javascript
// src/game/StateRecovery.js

const STORAGE_KEYS = {
  SESSION: 'scaleClimber_session',
  CALIBRATION: 'scaleClimber_calibration',
  HIGH_SCORES: 'scaleClimber_highScores',
  SETTINGS: 'scaleClimber_settings'
};

const MAX_HIGH_SCORES = 10;
const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

class StateRecovery {
  /**
   * Check if a valid saved session exists
   */
  hasSavedSession() {
    try {
      const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
      if (!session) return false;

      // Check if session is recent (within 24 hours)
      const age = Date.now() - session.timestamp;
      if (age > SESSION_TIMEOUT_MS) {
        this.clearSession();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save current game session
   */
  saveSession(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to save session:', err);
    }
  }

  /**
   * Load saved game session
   */
  loadSession() {
    try {
      const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));

      // Validate session structure
      if (!session || !session.mode || !session.modeState) {
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Clear saved session
   */
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  /**
   * Save calibration results
   */
  saveCalibration(calibrationData) {
    try {
      localStorage.setItem(STORAGE_KEYS.CALIBRATION, JSON.stringify({
        ...calibrationData,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.warn('Failed to save calibration:', err);
    }
  }

  /**
   * Get calibration results
   */
  getCalibration() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CALIBRATION));
    } catch {
      return null;
    }
  }

  /**
   * Save high score
   */
  saveHighScore(score, grade) {
    try {
      const scores = this.getHighScores();

      scores.push({
        score,
        grade: grade.label,
        date: new Date().toISOString(),
        id: crypto.randomUUID()
      });

      // Sort and keep top 10
      scores.sort((a, b) => b.score - a.score);
      scores.splice(MAX_HIGH_SCORES);

      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(scores));
    } catch (err) {
      console.warn('Failed to save high score:', err);
    }
  }

  /**
   * Get high scores
   */
  getHighScores() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HIGH_SCORES)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all data (for settings/privacy)
   */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export default StateRecovery;
```

### Phase 2 Definition of Done

**Exit Criteria (ALL must pass)**:
- [ ] All SC-xxx requirements met
- [ ] Unit test coverage ≥90% for game modules
- [ ] State machine transitions verified (all paths tested)
- [ ] Session save/restore works correctly
- [ ] Practice mode fully functional
- [ ] Score calculations verified with test cases
- [ ] Calibration results persist correctly
- [ ] High scores save and display properly
- [ ] Code reviewed by senior engineer
- [ ] Technical documentation updated
- [ ] Demo to stakeholders completed and approved

---

## Phase 3: Visual Design

**Duration**: 2 weeks
**Objective**: Engaging visuals at 60fps with adaptive performance degradation.

### 3.1 Art Direction & Design System

**Style**: Cute, cartoonish 2D with vibrant colors. Think "Duolingo meets Guitar Hero."

#### Color Palette

| Element | Color | Hex | Usage | WCAG AA Compliance |
|---------|-------|-----|-------|-------------------|
| Perfect | Gold | #FFD700 | Perfect hits, S rank | Pass (4.8:1 on dark bg) |
| Great | Lime | #32CD32 | Great hits, A rank | Pass (5.2:1 on dark bg) |
| Good | Sky Blue | #00BFFF | Good hits, B rank | Pass (4.5:1 on dark bg) |
| OK | Orange | #FFA500 | OK hits, C rank | Pass (4.6:1 on dark bg) |
| Miss | Red | #FF4444 | Misses, low ranks | Pass (5.1:1 on dark bg) |
| Background Sky | Gradient | #87CEEB → #E0F6FF | Sky backdrop | N/A (background) |
| Mountain | Purple | #8B7BB8 | Mountain/stairs | Decorative |
| Character Primary | Teal | #20B2AA | Main character | Pass (4.9:1 on light bg) |
| Text Primary | Dark Gray | #2C3E50 | Main text | Pass (12.6:1 on white) |
| Text Secondary | Med Gray | #7F8C8D | Secondary text | Pass (4.7:1 on white) |

#### Typography

```css
/* Font Stack */
--font-primary: 'Fredoka One', 'Comic Sans MS', cursive, sans-serif;
--font-secondary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'Courier New', monospace;

/* Font Sizes (rem) */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.5rem;    /* 24px */
--text-2xl: 2rem;     /* 32px */
--text-3xl: 3rem;     /* 48px */
```

#### Asset Budget

| Asset Type | Format | Max Size | Target Size | Notes |
|------------|--------|----------|-------------|-------|
| Character sprite sheet | PNG-8 | 256KB | 150KB | 512×512px, 8 animation states |
| Background layers (3) | PNG-8 | 150KB ea | 100KB ea | Parallax layers |
| UI elements | SVG | 50KB total | 30KB | Inline in HTML |
| Sound effects (8) | Opus/WebM | 30KB ea | 20KB ea | 128kbps mono |
| Fonts (WOFF2) | WOFF2 | 50KB ea | 40KB ea | Latin subset only |
| **Total Bundle** | | **1.5MB** | **850KB** | Gzipped: ~250KB target |

### 3.2 Canvas Renderer Architecture

**Objective**: 60fps rendering with adaptive quality degradation.

#### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| REN-001 | 60fps on desktop | Must | Maintains 16.6ms frame time on mid-range laptop |
| REN-002 | 30fps minimum on mobile | Must | Gracefully degrades quality if frame time >20ms |
| REN-003 | Hardware acceleration | Must | Uses willReadFrequently: false for GPU rendering |
| REN-004 | Responsive canvas | Must | Adapts to window resize without performance hit |
| REN-005 | Layer compositing | Should | Separate canvas layers for static/dynamic content |

#### Frame Budget Allocation

```
Target: 16.6ms per frame (60fps)
Maximum: 33.3ms per frame (30fps minimum)

Budget Breakdown:
┌─────────────────────────────────────────┐
│ Game Logic          │ 2ms  │ ████░░░░░ │
│ Pitch Detection Msg │ 1ms  │ ██░░░░░░░ │
├─────────────────────────────────────────┤
│ Canvas Clear + BG   │ 2ms  │ ████░░░░░ │
│ Character Render    │ 3ms  │ ██████░░░ │
│ Pitch Meter Draw    │ 3ms  │ ██████░░░ │
│ Particles (if any)  │ 2ms  │ ████░░░░░ │
│ HUD + Text          │ 2ms  │ ████░░░░░ │
├─────────────────────────────────────────┤
│ Browser Composite   │ 1.6ms│ ███░░░░░░ │
└─────────────────────────────────────────┘
Total: 16.6ms
```

#### Performance Monitoring & Degradation

```javascript
// src/visuals/PerformanceMonitor.js

class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.maxSamples = 60; // Track last 60 frames
    this.qualityLevel = 'high'; // high | medium | low

    this.thresholds = {
      high: 16.6,    // 60fps
      medium: 20,    // 50fps
      low: 33.3      // 30fps
    };
  }

  recordFrame(startTime, endTime) {
    const frameTime = endTime - startTime;
    this.frameTimes.push(frameTime);

    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    // Check if quality adjustment needed (every 60 frames)
    if (this.frameTimes.length === this.maxSamples) {
      this.adjustQuality();
    }
  }

  adjustQuality() {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

    if (avgFrameTime > this.thresholds.medium && this.qualityLevel === 'high') {
      this.qualityLevel = 'medium';
      console.warn('Reducing quality to medium (avg frame time:', avgFrameTime.toFixed(2), 'ms)');
      this.emit('qualityChanged', 'medium');
    } else if (avgFrameTime > this.thresholds.low && this.qualityLevel === 'medium') {
      this.qualityLevel = 'low';
      console.warn('Reducing quality to low (avg frame time:', avgFrameTime.toFixed(2), 'ms)');
      this.emit('qualityChanged', 'low');
    } else if (avgFrameTime < this.thresholds.high && this.qualityLevel !== 'high') {
      // Restore quality if performance improves
      this.qualityLevel = 'high';
      console.log('Restoring quality to high');
      this.emit('qualityChanged', 'high');
    }
  }

  getQualitySettings() {
    const settings = {
      high: {
        particleCount: 50,
        shadowQuality: 'high',
        animationSmoothing: true,
        backgroundParallax: true
      },
      medium: {
        particleCount: 25,
        shadowQuality: 'medium',
        animationSmoothing: true,
        backgroundParallax: true
      },
      low: {
        particleCount: 10,
        shadowQuality: 'none',
        animationSmoothing: false,
        backgroundParallax: false
      }
    };

    return settings[this.qualityLevel];
  }

  emit(event, data) {
    // Event emitter implementation
  }
}

export default PerformanceMonitor;
```

#### Renderer Implementation

```javascript
// src/visuals/Renderer.js

import Character from './Character.js';
import Background from './Background.js';
import PitchMeter from './PitchMeter.js';
import ParticleSystem from './ParticleSystem.js';
import PerformanceMonitor from './PerformanceMonitor.js';

class Renderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', {
      alpha: false, // Opaque canvas for performance
      desynchronized: true // Hint for low-latency rendering
    });

    // Sub-renderers
    this.character = new Character();
    this.background = new Background();
    this.pitchMeter = new PitchMeter();
    this.particles = new ParticleSystem();
    this.perfMonitor = new PerformanceMonitor();

    // State
    this.isRunning = false;
    this.lastFrameTime = 0;

    // Setup
    this.setupCanvas();
    this.setupEventListeners();

    // Listen for quality changes
    this.perfMonitor.on('qualityChanged', (level) => {
      this.handleQualityChange(level);
    });
  }

  setupCanvas() {
    // Set canvas to fill container
    this.resizeCanvas();

    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;

    // Set display size (CSS pixels)
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;

    // Set actual size in memory (scaled by DPR)
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    // Scale canvas CSS size back to display size
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    // Scale context to account for DPR
    this.ctx.scale(dpr, dpr);

    // Store logical size
    this.logicalWidth = displayWidth;
    this.logicalHeight = displayHeight;
  }

  setupEventListeners() {
    // Handle window resize
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this.canvas.parentElement);

    // Handle visibility change (pause rendering when hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.render();
      }
    });
  }

  /**
   * Main render loop
   */
  render(timestamp = 0) {
    if (!this.isRunning) return;

    const frameStart = performance.now();

    // Clear canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // Render layers (back to front)
    this.background.render(this.ctx, this.logicalWidth, this.logicalHeight);
    this.character.render(this.ctx, this.logicalWidth, this.logicalHeight);
    this.pitchMeter.render(this.ctx, this.logicalWidth, this.logicalHeight);
    this.particles.render(this.ctx, this.logicalWidth, this.logicalHeight);

    // Record frame time for performance monitoring
    const frameEnd = performance.now();
    this.perfMonitor.recordFrame(frameStart, frameEnd);

    this.lastFrameTime = timestamp;

    // Continue loop
    requestAnimationFrame((ts) => this.render(ts));
  }

  /**
   * Update game state (called every frame)
   */
  update(gameState) {
    // Update sub-renderers with game state
    this.character.update(gameState);
    this.pitchMeter.update(gameState.lastPitchResult);
    this.particles.update(gameState);
  }

  /**
   * Handle quality degradation
   */
  handleQualityChange(level) {
    const settings = this.perfMonitor.getQualitySettings();

    // Apply settings to sub-renderers
    this.particles.setMaxParticles(settings.particleCount);
    this.character.setShadowQuality(settings.shadowQuality);
    this.background.setParallaxEnabled(settings.backgroundParallax);
  }

  /**
   * Start rendering
   */
  start() {
    this.isRunning = true;
    this.render();
  }

  /**
   * Stop rendering
   */
  stop() {
    this.isRunning = false;
  }
}

export default Renderer;
```

### 3.3 Character Animation

**Character Name**: "Melody"

#### Sprite Sheet Layout

```
Sprite Sheet: 512×512px PNG-8
Each frame: 64×64px
Layout: 8 rows × 8 columns

Row 1: IDLE (4 frames)        - Breathing loop
Row 2: LISTEN (4 frames)      - Listening pose with headphones
Row 3: CLIMB (6 frames)       - Climbing animation
Row 4: PERFECT (4 frames)     - Celebration
Row 5: WOBBLE (4 frames)      - Struggling (off-pitch)
Row 6: FALL (6 frames)        - Fall animation (bad miss)
Row 7: VICTORY (8 frames)     - Victory dance
Row 8: (Reserved for future)
```

#### Animation State Machine

```javascript
// src/visuals/Character.js

const ANIMATIONS = {
  idle: {
    frames: [0, 1, 2, 3],
    frameDuration: 500, // ms per frame
    loop: true
  },
  listen: {
    frames: [8, 9, 10, 11],
    frameDuration: 250,
    loop: true
  },
  climb: {
    frames: [16, 17, 18, 19, 20, 21],
    frameDuration: 67, // 400ms total
    loop: false,
    onComplete: 'idle'
  },
  perfect: {
    frames: [24, 25, 26, 27],
    frameDuration: 150, // 600ms total
    loop: false,
    onComplete: 'idle'
  },
  wobble: {
    frames: [32, 33, 34, 35],
    frameDuration: 75, // 300ms total
    loop: true
  },
  fall: {
    frames: [40, 41, 42, 43, 44, 45],
    frameDuration: 133, // 800ms total
    loop: false,
    onComplete: 'idle'
  },
  victory: {
    frames: [48, 49, 50, 51, 52, 53, 54, 55],
    frameDuration: 250, // 2000ms total
    loop: true
  }
};

class Character {
  constructor() {
    this.spriteSheet = null;
    this.currentAnimation = 'idle';
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.position = { x: 0, y: 0 };
    this.scale = 1;

    this.loadSpriteSheet();
  }

  async loadSpriteSheet() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteSheet = img;
        resolve();
      };
      img.onerror = reject;
      img.src = '/assets/sprites/melody.png';
    });
  }

  update(gameState) {
    // Determine which animation to play based on game state
    const targetAnimation = this.getAnimationForState(gameState);

    if (targetAnimation !== this.currentAnimation) {
      this.setAnimation(targetAnimation);
    }

    // Update frame timing
    const anim = ANIMATIONS[this.currentAnimation];
    this.frameTimer += 16; // Assume ~60fps

    if (this.frameTimer >= anim.frameDuration) {
      this.frameTimer = 0;
      this.currentFrame++;

      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          // Animation complete
          if (anim.onComplete) {
            this.setAnimation(anim.onComplete);
          } else {
            this.currentFrame = anim.frames.length - 1; // Hold last frame
          }
        }
      }
    }

    // Update position based on game progress
    this.updatePosition(gameState);
  }

  getAnimationForState(gameState) {
    if (gameState.state === 'complete') return 'victory';
    if (gameState.subState === 'note_hit') {
      // Check accuracy for perfect vs climb
      if (gameState.lastNoteAccuracy === 'perfect') {
        return 'perfect';
      }
      return 'climb';
    }
    if (gameState.subState === 'listening') return 'listen';
    if (gameState.lastPitchResult && gameState.lastPitchResult.tolerance === 'miss') {
      return 'wobble';
    }

    return 'idle';
  }

  setAnimation(name) {
    this.currentAnimation = name;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  updatePosition(gameState) {
    // Position character based on current note
    const totalNotes = 8;
    const progress = gameState.currentNote / totalNotes;

    // Calculate position on stairs (bottom-left to top-right)
    this.position.x = 100 + (progress * 300);
    this.position.y = 400 - (progress * 250);
  }

  render(ctx, width, height) {
    if (!this.spriteSheet) return;

    const anim = ANIMATIONS[this.currentAnimation];
    const frameIndex = anim.frames[this.currentFrame];

    // Calculate sprite sheet coordinates
    const frameSize = 64;
    const framesPerRow = 8;
    const sx = (frameIndex % framesPerRow) * frameSize;
    const sy = Math.floor(frameIndex / framesPerRow) * frameSize;

    // Draw character
    const drawSize = frameSize * this.scale;
    ctx.drawImage(
      this.spriteSheet,
      sx, sy, frameSize, frameSize,
      this.position.x - drawSize / 2,
      this.position.y - drawSize / 2,
      drawSize, drawSize
    );
  }

  setShadowQuality(quality) {
    // Adjust shadow rendering based on quality setting
    // Implementation varies based on rendering approach
  }
}

export default Character;
```

### 3.4 Pitch Meter Visualization

```javascript
// src/visuals/PitchMeter.js

const METER_CONFIG = {
  width: 400,
  height: 60,
  centRange: 100, // ±100 cents displayed
  indicatorSmoothing: 0.3, // Lerp factor
  zones: [
    { cents: 10, color: '#32CD32' },   // Perfect - green
    { cents: 25, color: '#FFD700' },   // Great - gold
    { cents: 50, color: '#FFA500' },   // OK - orange
    { cents: 100, color: '#FF4444' }   // Miss - red
  ]
};

class PitchMeter {
  constructor() {
    this.currentCents = 0;
    this.targetCents = 0;
    this.targetNote = 'C4';
  }

  update(pitchResult) {
    if (pitchResult && pitchResult.frequency) {
      this.targetCents = pitchResult.cents || 0;
    } else {
      this.targetCents = 0;
    }

    // Smooth interpolation
    this.currentCents += (this.targetCents - this.currentCents) * METER_CONFIG.indicatorSmoothing;
  }

  render(ctx, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const meterY = canvasHeight - 100;

    // Draw meter background
    this.drawMeterBackground(ctx, centerX, meterY);

    // Draw zones
    this.drawZones(ctx, centerX, meterY);

    // Draw indicator
    this.drawIndicator(ctx, centerX, meterY);

    // Draw labels
    this.drawLabels(ctx, centerX, meterY);
  }

  drawMeterBackground(ctx, centerX, meterY) {
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(
      centerX - METER_CONFIG.width / 2,
      meterY - METER_CONFIG.height / 2,
      METER_CONFIG.width,
      METER_CONFIG.height
    );
  }

  drawZones(ctx, centerX, meterY) {
    const pixelsPerCent = METER_CONFIG.width / (METER_CONFIG.centRange * 2);

    for (const zone of METER_CONFIG.zones) {
      const zoneWidth = zone.cents * 2 * pixelsPerCent;
      const zoneX = centerX - zoneWidth / 2;

      ctx.fillStyle = zone.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(
        zoneX,
        meterY - METER_CONFIG.height / 2,
        zoneWidth,
        METER_CONFIG.height
      );
      ctx.globalAlpha = 1.0;
    }
  }

  drawIndicator(ctx, centerX, meterY) {
    const pixelsPerCent = METER_CONFIG.width / (METER_CONFIG.centRange * 2);
    const indicatorX = centerX + (this.currentCents * pixelsPerCent);

    // Draw vertical line
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(indicatorX, meterY - METER_CONFIG.height / 2);
    ctx.lineTo(indicatorX, meterY + METER_CONFIG.height / 2);
    ctx.stroke();

    // Draw arrow on top
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(indicatorX, meterY - METER_CONFIG.height / 2 - 10);
    ctx.lineTo(indicatorX - 8, meterY - METER_CONFIG.height / 2);
    ctx.lineTo(indicatorX + 8, meterY - METER_CONFIG.height / 2);
    ctx.closePath();
    ctx.fill();
  }

  drawLabels(ctx, centerX, meterY) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';

    // Center label (target note)
    ctx.fillText(this.targetNote, centerX, meterY + METER_CONFIG.height / 2 + 25);

    // Cent value
    const centsText = `${this.currentCents > 0 ? '+' : ''}${Math.round(this.currentCents)}¢`;
    ctx.fillText(centsText, centerX, meterY + METER_CONFIG.height / 2 + 45);
  }
}

export default PitchMeter;
```

### 3.5 Particle System

```javascript
// src/visuals/ParticleSystem.js

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = -Math.random() * 5 - 2;
    this.life = 1.0;
    this.color = color;
    this.size = Math.random() * 4 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // Gravity
    this.life -= 0.02;
  }

  render(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1.0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 50;
  }

  emit(x, y, count, color) {
    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update(gameState) {
    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();

      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Emit particles on events
    if (gameState.subState === 'note_hit') {
      const color = gameState.lastNoteAccuracy === 'perfect' ? '#FFD700' : '#32CD32';
      this.emit(gameState.characterX, gameState.characterY, 20, color);
    }
  }

  render(ctx, width, height) {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  setMaxParticles(max) {
    this.maxParticles = max;
    // Trim existing particles if needed
    if (this.particles.length > max) {
      this.particles.length = max;
    }
  }
}

export default ParticleSystem;
```

### Phase 3 Definition of Done

**Exit Criteria (ALL must pass)**:
- [ ] All REN-xxx requirements met
- [ ] 60fps maintained on mid-range desktop
- [ ] 30fps minimum on mobile devices tested
- [ ] Performance monitor correctly degrades quality
- [ ] Character animations play smoothly
- [ ] Pitch meter updates in real-time (<50ms lag)
- [ ] Particle effects render without frame drops
- [ ] Canvas resizes correctly on window resize
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Visual testing with 5+ users validates "cute" style
- [ ] Code reviewed by senior engineer
- [ ] Technical documentation updated
- [ ] Demo to stakeholders completed

---

## Phase 4: Polish & Accessibility

**Duration**: 1 week
**Objective**: Professional polish with full accessibility support.

### 4.1 Keyboard Controls

**Objective**: Full keyboard navigation and shortcuts.

#### Key Bindings

| Key | Action | Context | Notes |
|-----|--------|---------|-------|
| Tab | Navigate UI elements | All screens | Standard focus order |
| Enter | Activate button / Confirm | All screens | Primary action |
| Space | Pause/Resume | Playing | Toggle pause |
| Esc | Pause menu / Back | Playing, Menus | Cancel action |
| R | Restart | Paused, Results | Quick restart |
| M | Toggle mute | All | Audio feedback |
| H | Toggle HUD | Playing | Hide/show overlay |
| 1-4 | Select octave | Octave select | Quick selection |
| P | Practice mode | Menu | Direct access |
| ? | Help overlay | All | Show controls |

#### Implementation

```javascript
// src/utils/keyboardControls.js

const KEY_BINDINGS = {
  Tab: 'navigate',
  Enter: 'confirm',
  ' ': 'pause',
  Escape: 'back',
  r: 'restart',
  m: 'mute',
  h: 'toggleHUD',
  '1': 'octave1',
  '2': 'octave2',
  '3': 'octave3',
  '4': 'octave4',
  p: 'practice',
  '?': 'help'
};

class KeyboardControls {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.enabled = true;

    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;

      const action = KEY_BINDINGS[e.key];
      if (!action) return;

      // Prevent default for game keys (but not Tab for accessibility)
      if (e.key !== 'Tab') {
        e.preventDefault();
      }

      this.handleAction(action, e);
    });
  }

  handleAction(action, event) {
    switch (action) {
      case 'pause':
        if (this.gameEngine.state === 'playing') {
          this.gameEngine.pause();
        } else if (this.gameEngine.state === 'paused') {
          this.gameEngine.resume();
        }
        break;

      case 'back':
        if (this.gameEngine.state === 'playing') {
          this.gameEngine.pause();
        }
        break;

      case 'restart':
        if (this.gameEngine.state === 'paused' || this.gameEngine.state === 'results') {
          this.gameEngine.restart();
        }
        break;

      case 'mute':
        this.gameEngine.toggleMute();
        break;

      case 'toggleHUD':
        this.gameEngine.toggleHUD();
        break;

      // ... other actions
    }
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}

export default KeyboardControls;
```

### 4.2 Accessibility Features

#### Requirements

| ID | Requirement | Implementation | WCAG Level |
|----|-------------|----------------|------------|
| A11Y-001 | Keyboard navigation | Full keyboard support | A |
| A11Y-002 | Screen reader support | ARIA labels, live regions | AA |
| A11Y-003 | High contrast mode | Alternative color scheme | AA |
| A11Y-004 | Colorblind modes | Patterns + shapes in addition to colors | AA |
| A11Y-005 | Reduced motion | Respect prefers-reduced-motion | AA |
| A11Y-006 | Text scaling | Support 200% browser zoom | AA |
| A11Y-007 | Focus indicators | Visible 3px focus ring | A |

#### Screen Reader Support

```html
<!-- src/ui/GameScreen.html -->

<!-- Game container with live regions -->
<div id="game-container" role="application" aria-label="Scale Climber Game">

  <!-- Status announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only" id="status-announce">
    <!-- Dynamically updated with game state -->
  </div>

  <!-- HUD -->
  <div class="hud" role="region" aria-label="Game Information">
    <div class="score" aria-label="Current score">
      Score: <span aria-live="polite">0</span>
    </div>
    <div class="combo" aria-label="Combo multiplier">
      Combo: <span aria-live="polite">1x</span>
    </div>
    <div class="target-note" aria-label="Target note">
      Target: <span aria-live="assertive">C4</span>
    </div>
  </div>

  <!-- Canvas (non-interactive visual content) -->
  <canvas id="game-canvas"
          role="img"
          aria-label="Game visualization showing character climbing musical stairs">
  </canvas>

  <!-- Pitch feedback (for screen readers) -->
  <div aria-live="polite" aria-atomic="false" class="sr-only" id="pitch-feedback">
    <!-- Updated on pitch detection: "Your pitch: C4, 5 cents sharp" -->
  </div>

  <!-- Controls -->
  <div class="game-controls" role="group" aria-label="Game controls">
    <button id="pause-btn" aria-label="Pause game">Pause</button>
    <button id="restart-btn" aria-label="Restart game">Restart</button>
  </div>
</div>

<!-- Screen reader only CSS class -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

#### Reduced Motion Support

```javascript
// src/utils/accessibilitySettings.js

class AccessibilitySettings {
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.highContrastMode = false;
    this.colorblindMode = 'none'; // none | deuteranopia | protanopia | tritanopia

    this.loadSettings();
  }

  applySettings() {
    document.body.classList.toggle('reduced-motion', this.prefersReducedMotion);
    document.body.classList.toggle('high-contrast', this.highContrastMode);
    document.body.dataset.colorblindMode = this.colorblindMode;
  }

  loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('accessibility_settings'));
      if (saved) {
        this.highContrastMode = saved.highContrast || false;
        this.colorblindMode = saved.colorblindMode || 'none';
      }
    } catch {
      // Use defaults
    }

    this.applySettings();
  }

  saveSettings() {
    localStorage.setItem('accessibility_settings', JSON.stringify({
      highContrast: this.highContrastMode,
      colorblindMode: this.colorblindMode
    }));
    this.applySettings();
  }
}

export default AccessibilitySettings;
```

```css
/* CSS adjustments for reduced motion */
.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* High contrast mode */
.high-contrast {
  --color-perfect: #00FF00;
  --color-great: #FFFF00;
  --color-good: #FFA500;
  --color-miss: #FF0000;
  --text-primary: #FFFFFF;
  --bg-primary: #000000;
}

/* Colorblind modes */
[data-colorblind-mode="deuteranopia"] {
  /* Adjusted colors for red-green colorblindness */
  --color-perfect: #0088FF;
  --color-great: #FFDD00;
  --color-good: #FF8800;
  --color-miss: #FF0066;
}
```

### 4.3 Audio Feedback

#### Sound Effects Specification

| Event | Sound | Duration | File Size | Format |
|-------|-------|----------|-----------|--------|
| Note hit (perfect) | Bright chime + "Perfect!" | 400ms | 15KB | Opus 64kbps |
| Note hit (great) | Soft chime | 300ms | 12KB | Opus 64kbps |
| Note hit (ok) | Click | 200ms | 8KB | Opus 64kbps |
| Miss | Soft buzz | 200ms | 8KB | Opus 64kbps |
| Combo milestone (5x) | Fanfare | 500ms | 18KB | Opus 64kbps |
| Victory | Celebration | 2000ms | 35KB | Opus 64kbps |
| Failure | Sad trombone | 1000ms | 20KB | Opus 64kbps |
| UI click | Soft pop | 100ms | 5KB | Opus 64kbps |

#### Implementation

```javascript
// src/utils/audioFeedback.js

class AudioFeedback {
  constructor() {
    this.sounds = new Map();
    this.volume = 0.7;
    this.muted = false;

    this.loadSounds();
  }

  async loadSounds() {
    const soundFiles = {
      perfect: '/assets/sounds/perfect.opus',
      great: '/assets/sounds/great.opus',
      ok: '/assets/sounds/ok.opus',
      miss: '/assets/sounds/miss.opus',
      combo: '/assets/sounds/combo.opus',
      victory: '/assets/sounds/victory.opus',
      failure: '/assets/sounds/failure.opus',
      click: '/assets/sounds/click.opus'
    };

    for (const [key, path] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(path);
        audio.volume = this.volume;
        audio.preload = 'auto';
        this.sounds.set(key, audio);
      } catch (err) {
        console.warn(`Failed to load sound: ${key}`, err);
      }
    }
  }

  play(soundName) {
    if (this.muted) return;

    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    // Clone audio for overlapping plays
    const instance = audio.cloneNode();
    instance.volume = this.volume;
    instance.play().catch(err => {
      console.warn('Failed to play sound:', err);
    });
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    for (const audio of this.sounds.values()) {
      audio.volume = this.volume;
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export default AudioFeedback;
```

#### Reference Tone Playback

**Feature**: Optional guide melody playing target notes.

```javascript
// src/utils/referenceToneGenerator.js

class ReferenceToneGenerator {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = false;
    this.volume = 0.3;
  }

  playNote(frequency, duration = 500) {
    if (!this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    // Envelope: fade in, sustain, fade out
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.05); // Attack
    gainNode.gain.setValueAtTime(this.volume, now + duration / 1000 - 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000); // Release

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

export default ReferenceToneGenerator;
```

### Phase 4 Definition of Done

**Exit Criteria (ALL must pass)**:
- [ ] All A11Y-xxx requirements met
- [ ] Full keyboard navigation verified
- [ ] Screen reader testing (NVDA/JAWS on Windows, VoiceOver on macOS/iOS)
- [ ] High contrast mode passes WCAG AA
- [ ] Reduced motion respects user preference
- [ ] All sounds load and play correctly
- [ ] Reference tone generator works
- [ ] Focus indicators visible on all interactive elements
- [ ] Manual accessibility audit completed
- [ ] Code reviewed
- [ ] Demo to stakeholders with accessibility demo

---

## Phase 5: Deployment

**Duration**: 3-4 days
**Objective**: Production deployment with offline support and CI/CD.

### 5.1 Service Worker

**Objective**: Offline gameplay with cache-first strategy.

#### Cache Strategy

| Resource Type | Strategy | Cache Name | Max Age |
|---------------|----------|------------|---------|
| App shell (HTML, CSS, JS) | Cache-First | app-shell-v1 | 7 days |
| Static assets (images, fonts) | Cache-First | static-assets-v1 | 30 days |
| Audio files | Cache-First | audio-v1 | 30 days |
| Analytics (optional) | Network-Only | N/A | N/A |

#### Implementation

```javascript
// src/service-worker.js

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache all build assets (injected by build process)
precacheAndRoute(self.__WB_MANIFEST);

// Cache static assets
registerRoute(
  ({ request }) => request.destination === 'image' ||
                   request.destination === 'font' ||
                   request.destination === 'audio',
  new CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Analytics: Network only (fail silently offline)
registerRoute(
  ({ url }) => url.pathname.includes('/analytics/'),
  new NetworkOnly()
);

// Listen for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['app-shell-v1', 'static-assets-v1', 'audio-v1'];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

#### Service Worker Registration

```javascript
// src/main.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

    // Listen for updates
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;

      // Show "Update available" notification
      showUpdateNotification();
    });
  });
}

function showUpdateNotification() {
  // Show UI prompt: "New version available. Refresh to update?"
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
    <p>A new version is available!</p>
    <button id="update-btn">Update Now</button>
  `;
  document.body.appendChild(updateBanner);

  document.getElementById('update-btn').addEventListener('click', () => {
    window.location.reload();
  });
}
```

### 5.2 Build Configuration

#### Vite Production Config

```javascript
// vite.config.js (production additions)
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/scale-climber/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'assets/**/*'],
      manifest: {
        name: 'Scale Climber - Vocal Pitch Training',
        short_name: 'Scale Climber',
        description: 'Train your vocal pitch by climbing the musical mountain!',
        theme_color: '#20B2AA',
        background_color: '#87CEEB',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,opus}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          audio: [
            './src/audio/PitchDetector.js',
            './src/audio/AudioCapture.js',
            './src/audio/AudioContextManager.js'
          ],
          game: [
            './src/game/GameEngine.js',
            './src/game/ScaleChallenge.js'
          ],
          visuals: [
            './src/visuals/Renderer.js',
            './src/visuals/Character.js'
          ]
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  }
});
```

### 5.3 GitHub Actions CI/CD

**Objective**: Automated testing, building, and deployment with rollback capability.

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  lint:
    name: Lint Code
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

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [test, e2e]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npm run build

      - name: Check bundle size
        run: |
          BUNDLE_SIZE=$(du -sb dist | cut -f1)
          MAX_SIZE=$((250 * 1024)) # 250KB gzipped target
          if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
            echo "::warning::Bundle size exceeded: $BUNDLE_SIZE bytes (max: $MAX_SIZE)"
          fi

      - name: Upload build artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Create release tag
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          TAG_NAME="release-$(date +%Y%m%d-%H%M%S)"
          git tag $TAG_NAME
          git push origin $TAG_NAME
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3

      - name: Notify deployment
        run: |
          echo "Deployed to: ${{ steps.deployment.outputs.page_url }}"
```

#### Rollback Procedure

**Documentation**: Add to `docs/DEPLOYMENT.md`

```markdown
# Deployment Rollback Procedure

## Automatic Rollback

GitHub Pages does not support automatic rollback. Manual intervention required.

## Manual Rollback Steps

1. **Identify Last Good Tag**
   ```bash
   git tag -l "release-*" | tail -5
   # Example output:
   # release-20250112-140523 (current - broken)
   # release-20250112-120130 (previous - working)
   ```

2. **Check Out Previous Release**
   ```bash
   git checkout release-20250112-120130
   ```

3. **Rebuild and Redeploy**
   ```bash
   npm run build
   # Manually upload dist/ to GitHub Pages
   # OR trigger new deployment workflow
   ```

4. **Verify Rollback**
   - Visit https://yourusername.github.io/scale-climber/
   - Test critical paths (calibration, playing game, completing scale)
   - Check browser console for errors

5. **Investigate Issue**
   - Review commit diff between broken and working versions
   - Check CI/CD logs for failed tests
   - Test locally with failing build

## Prevention

- All PRs must pass CI before merge
- Manual QA testing on staging before production deploy
- Monitor error rates post-deployment (first 30 minutes critical)
```

### 5.4 Security Headers

**Objective**: Secure deployment with CSP and other headers.

#### Headers Configuration

```plaintext
# public/_headers
# Deployed to GitHub Pages via build process

/*
  # Content Security Policy
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; worker-src 'self' blob:; frame-ancestors 'none';

  # X-Frame-Options (prevent clickjacking)
  X-Frame-Options: DENY

  # X-Content-Type-Options (prevent MIME sniffing)
  X-Content-Type-Options: nosniff

  # Referrer Policy
  Referrer-Policy: no-referrer-when-downgrade

  # Permissions Policy (disable unnecessary features)
  Permissions-Policy: microphone=(self), camera=(), geolocation=(), payment=()

  # HTTPS enforcement (HSTS)
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/service-worker.js
  # Service worker: allow all origins (required for SW)
  Service-Worker-Allowed: /
```

### Phase 5 Definition of Done

**Exit Criteria (ALL must pass)**:
- [ ] Service worker caches all assets
- [ ] Offline mode works (verified by disabling network in DevTools)
- [ ] PWA installable on desktop and mobile
- [ ] CI/CD pipeline passes all stages
- [ ] Production deployment successful
- [ ] Rollback procedure documented and tested
- [ ] Security headers configured
- [ ] Lighthouse audit scores: Performance >90, Accessibility 100, Best Practices 100, SEO >90
- [ ] Cross-browser testing on production URL
- [ ] Code reviewed
- [ ] Stakeholder sign-off

---

## Error Handling & Recovery

**Objective**: Graceful error recovery with clear user communication.

### Error Scenarios & Recovery Paths

| Error Code | Scenario | Detection | User Message | Recovery Action |
|------------|----------|-----------|--------------|-----------------|
| PERMISSION_DENIED | Mic permission denied | getUserMedia error | "Microphone access is required to play. Please allow access and try again." | Retry button, settings help |
| NO_MICROPHONE | No mic device found | getUserMedia error | "No microphone detected. Please connect a microphone and refresh." | Refresh button |
| DEVICE_DISCONNECTED | Mic unplugged mid-game | MediaStreamTrack 'ended' event | "Microphone disconnected. Please reconnect your microphone." | Pause game, detect reconnect, resume |
| CONTEXT_SUSPENDED | AudioContext suspended (iOS) | context.state === 'suspended' | "Tap to enable audio" (overlay) | Resume AudioContext on tap |
| WEB_AUDIO_UNSUPPORTED | Browser lacks Web Audio API | Missing AudioContext | "Your browser is not supported. Please use Chrome, Firefox, Safari, or Edge." | Link to browser downloads |
| STORAGE_FULL | LocalStorage quota exceeded | QuotaExceededError | "Storage full. Clear some space in browser settings." | Offer to clear old sessions |
| NETWORK_ERROR | Failed to load assets | fetch error | "Failed to load game assets. Check your connection and retry." | Retry button |
| CALIBRATION_FAILED | Not enough valid pitches | CalibrationEngine result | "Calibration failed. Please sing louder and try again." | Restart calibration |
| STATE_CORRUPT | Invalid saved state | JSON parse error | "Saved game corrupted. Starting fresh." | Clear session, start new |
| WORKER_ERROR | Web Worker crash | worker.onerror | "Audio processing error. Restarting..." | Recreate worker, resume |

### Error Dialog Component

```javascript
// src/ui/ErrorDialog.js

class ErrorDialog {
  constructor() {
    this.dialogElement = this.createDialog();
    document.body.appendChild(this.dialogElement);
  }

  createDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'error-dialog hidden';
    dialog.innerHTML = `
      <div class="error-dialog-backdrop"></div>
      <div class="error-dialog-content" role="alert" aria-labelledby="error-title">
        <div class="error-icon">⚠️</div>
        <h2 id="error-title">Error</h2>
        <p id="error-message"></p>
        <div class="error-actions">
          <button id="error-primary-action" class="btn-primary">Retry</button>
          <button id="error-secondary-action" class="btn-secondary">Cancel</button>
        </div>
      </div>
    `;
    return dialog;
  }

  show(error) {
    const title = document.getElementById('error-title');
    const message = document.getElementById('error-message');
    const primaryBtn = document.getElementById('error-primary-action');
    const secondaryBtn = document.getElementById('error-secondary-action');

    title.textContent = error.title || 'Error';
    message.textContent = error.message;
    primaryBtn.textContent = error.primaryAction || 'Retry';
    secondaryBtn.textContent = error.secondaryAction || 'Cancel';

    this.dialogElement.classList.remove('hidden');

    // Return promise that resolves with user choice
    return new Promise((resolve) => {
      primaryBtn.onclick = () => {
        this.hide();
        resolve('primary');
      };

      secondaryBtn.onclick = () => {
        this.hide();
        resolve('secondary');
      };
    });
  }

  hide() {
    this.dialogElement.classList.add('hidden');
  }
}

export default ErrorDialog;
```

### Global Error Handler

```javascript
// src/utils/errorHandler.js

import ErrorDialog from '../ui/ErrorDialog.js';

const ERROR_MESSAGES = {
  PERMISSION_DENIED: {
    title: 'Microphone Access Required',
    message: 'Scale Climber needs microphone access to detect your singing. Please allow access in your browser settings.',
    primaryAction: 'Open Settings',
    secondaryAction: 'Cancel'
  },
  NO_MICROPHONE: {
    title: 'No Microphone Found',
    message: 'No microphone was detected. Please connect a microphone and refresh the page.',
    primaryAction: 'Refresh',
    secondaryAction: 'Close'
  },
  DEVICE_DISCONNECTED: {
    title: 'Microphone Disconnected',
    message: 'Your microphone was disconnected. Please reconnect it to continue.',
    primaryAction: 'Retry',
    secondaryAction: 'Quit'
  },
  // ... other error messages
};

class ErrorHandler {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.dialog = new ErrorDialog();
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError({ code: 'UNKNOWN_ERROR', details: event.reason });
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError({ code: 'UNKNOWN_ERROR', details: event.error });
    });
  }

  async handleError(error) {
    const errorConfig = ERROR_MESSAGES[error.code] || {
      title: 'Unexpected Error',
      message: 'Something went wrong. Please try again.',
      primaryAction: 'Retry',
      secondaryAction: 'Close'
    };

    // Log error for analytics
    this.logError(error);

    // Show error dialog
    const choice = await this.dialog.show(errorConfig);

    // Handle user choice
    if (choice === 'primary') {
      await this.attemptRecovery(error);
    } else {
      // User cancelled, return to menu
      this.gameEngine.returnToMenu();
    }
  }

  async attemptRecovery(error) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        // Retry permission request
        await this.gameEngine.requestMicrophonePermission();
        break;

      case 'DEVICE_DISCONNECTED':
        // Wait for device reconnect
        await this.waitForDeviceReconnect();
        this.gameEngine.resume();
        break;

      case 'CONTEXT_SUSPENDED':
        // Resume audio context
        await this.gameEngine.audioManager.resume();
        break;

      case 'WORKER_ERROR':
        // Recreate worker
        this.gameEngine.pitchDetector.dispose();
        this.gameEngine.pitchDetector = new PitchDetector(this.gameEngine.audioManager);
        await this.gameEngine.pitchDetector.init();
        break;

      default:
        // Generic retry: restart current state
        await this.gameEngine.restart();
    }
  }

  async waitForDeviceReconnect() {
    return new Promise((resolve) => {
      const checkDevice = async () => {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasMic = devices.some(d => d.kind === 'audioinput');
          if (hasMic) {
            resolve();
          } else {
            setTimeout(checkDevice, 1000);
          }
        } catch {
          setTimeout(checkDevice, 1000);
        }
      };
      checkDevice();
    });
  }

  logError(error) {
    // Send to analytics (if enabled)
    if (window.analytics) {
      window.analytics.track('error_occurred', {
        errorCode: error.code,
        errorDetails: error.details,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        gameState: this.gameEngine.state
      });
    }
  }
}

export default ErrorHandler;
```

---

## Mobile-Specific Requirements

**Objective**: Excellent mobile experience with touch controls and performance.

### Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| MOB-001 | Touch controls | Must | All UI elements have 44×44px touch targets |
| MOB-002 | Landscape/portrait support | Must | UI adapts to both orientations |
| MOB-003 | iOS audio unlock | Must | Handles iOS audio restrictions correctly |
| MOB-004 | Reduced power mode | Should | Detects battery saver, adapts performance |
| MOB-005 | Bluetooth mic support | Must | Works with Bluetooth headsets/mics |
| MOB-006 | Keyboard avoidance | Must | Game pauses when mobile keyboard appears |

### Touch Targets

```css
/* Minimum touch target size */
button, .interactive {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}

/* Increase tap target for small elements */
.small-button {
  position: relative;
}

.small-button::before {
  content: '';
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
  /* Invisible tap area */
}
```

### Responsive Layout

```css
/* Mobile-first responsive design */

/* Base (mobile) */
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Tablet (landscape) */
@media (min-width: 768px) and (orientation: landscape) {
  .game-container {
    max-width: 1024px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .game-container {
    max-width: 1280px;
    height: 90vh;
  }
}

/* Portrait orientation warning */
@media (orientation: portrait) {
  .landscape-warning {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #FF4444;
    color: #FFF;
    padding: 8px;
    text-align: center;
    z-index: 1000;
  }
}
```

### iOS Audio Unlock Pattern

```javascript
// src/audio/iOSAudioUnlock.js

class IOSAudioUnlock {
  constructor(audioContextManager) {
    this.audioManager = audioContextManager;
    this.unlocked = false;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * iOS requires AudioContext to be resumed within user gesture handler
   */
  async unlock() {
    if (!this.isIOS || this.unlocked) return true;

    try {
      // Resume audio context
      await this.audioManager.resume();

      // Play silent buffer to unlock audio
      const buffer = this.audioManager.context.createBuffer(1, 1, 22050);
      const source = this.audioManager.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioManager.context.destination);
      source.start(0);

      this.unlocked = true;
      return true;
    } catch (err) {
      console.warn('Failed to unlock iOS audio:', err);
      return false;
    }
  }

  /**
   * Show "Tap to Start" overlay on iOS
   */
  showUnlockPrompt() {
    if (!this.isIOS || this.unlocked) return;

    const overlay = document.createElement('div');
    overlay.className = 'ios-audio-unlock-overlay';
    overlay.innerHTML = `
      <div class="unlock-prompt">
        <h2>Tap to Enable Audio</h2>
        <p>iOS requires user interaction to enable audio</p>
        <button id="unlock-audio-btn">Tap to Start</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('unlock-audio-btn').addEventListener('click', async () => {
      await this.unlock();
      overlay.remove();
    });
  }
}

export default IOSAudioUnlock;
```

### Battery Saver Detection

```javascript
// src/utils/performanceAdaptation.js

class PerformanceAdaptation {
  constructor(perfMonitor) {
    this.perfMonitor = perfMonitor;
    this.batteryAPI = null;
    this.setupBatteryMonitoring();
  }

  async setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        this.batteryAPI = await navigator.getBattery();

        // Monitor battery level and charging status
        this.batteryAPI.addEventListener('levelchange', () => {
          this.checkBatteryStatus();
        });

        this.batteryAPI.addEventListener('chargingchange', () => {
          this.checkBatteryStatus();
        });

        this.checkBatteryStatus();
      } catch (err) {
        console.warn('Battery API not available:', err);
      }
    }
  }

  checkBatteryStatus() {
    if (!this.batteryAPI) return;

    const level = this.batteryAPI.level;
    const charging = this.batteryAPI.charging;

    // If battery is low (<20%) and not charging, reduce quality
    if (level < 0.2 && !charging) {
      this.perfMonitor.emit('lowBattery');
      // Force quality to low
      this.perfMonitor.qualityLevel = 'low';
    }
  }
}

export default PerformanceAdaptation;
```

---

## Security & Privacy

**Objective**: Protect user data and ensure secure operation.

### Security Requirements

| ID | Requirement | Implementation | Status |
|----|-------------|----------------|--------|
| SEC-001 | No audio data leaves device | All processing client-side | ✅ Implemented |
| SEC-002 | LocalStorage validation | Sanitize all read data | Required |
| SEC-003 | CSP headers | Deployed via _headers file | Required |
| SEC-004 | HTTPS enforcement | GitHub Pages default | ✅ Built-in |
| SEC-005 | No external dependencies | All assets self-hosted | ✅ Implemented |
| SEC-006 | XSS prevention | Escape user inputs | Required |

### Privacy Policy

**Required Content** (add to website):

```markdown
# Privacy Policy - Scale Climber

**Last Updated**: January 2025

## Data Collection

Scale Climber does NOT collect or transmit any personal data. Specifically:

- **Audio Data**: All audio processing happens locally in your browser. No audio is recorded, stored, or transmitted to any server.
- **Personal Information**: We do not collect names, email addresses, or any identifying information.
- **Location**: We do not track your location.

## Local Storage

Scale Climber uses your browser's LocalStorage to save:
- Your game progress (can be cleared anytime)
- Your high scores
- Your calibration settings
- Your preferences (volume, difficulty, etc.)

This data never leaves your device and is stored locally in your browser.

## Analytics

Scale Climber does NOT use any analytics services. We do not track your usage.

## Third-Party Services

Scale Climber does not integrate with any third-party services or APIs.

## Your Rights

You can delete all stored data at any time by:
1. Going to Settings → Privacy
2. Clicking "Clear All Data"
3. Or clearing your browser's cache/storage for this site

## Children's Privacy

Scale Climber does not knowingly collect data from children under 13. Since we collect no data at all, the app is safe for all ages.

## Changes to Privacy Policy

We will update this policy if our data practices change. Check this page periodically for updates.

## Contact

Questions? Open an issue on GitHub: [scale-climber/issues](https://github.com/yourusername/scale-climber/issues)
```

### LocalStorage Validation

```javascript
// src/utils/storage.js

class SecureStorage {
  /**
   * Safely read from localStorage with validation
   */
  static get(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      // Parse JSON
      const parsed = JSON.parse(value);

      // Validate structure based on key
      if (!this.validate(key, parsed)) {
        console.warn(`Invalid data for key: ${key}`);
        localStorage.removeItem(key);
        return null;
      }

      return parsed;
    } catch (err) {
      console.error(`Failed to read ${key}:`, err);
      return null;
    }
  }

  /**
   * Safely write to localStorage
   */
  static set(key, value) {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
      return true;
    } catch (err) {
      console.error(`Failed to write ${key}:`, err);
      return false;
    }
  }

  /**
   * Validate data structure
   */
  static validate(key, data) {
    switch (key) {
      case 'scaleClimber_session':
        return (
          typeof data === 'object' &&
          typeof data.mode === 'string' &&
          typeof data.timestamp === 'number' &&
          data.modeState !== undefined
        );

      case 'scaleClimber_highScores':
        return (
          Array.isArray(data) &&
          data.every(score =>
            typeof score.score === 'number' &&
            typeof score.grade === 'string' &&
            typeof score.date === 'string'
          )
        );

      case 'scaleClimber_calibration':
        return (
          typeof data === 'object' &&
          typeof data.success === 'boolean' &&
          data.detectedRange !== undefined
        );

      default:
        return true; // Unknown keys pass (for forward compatibility)
    }
  }

  /**
   * Clear all app data
   */
  static clearAll() {
    const keys = [
      'scaleClimber_session',
      'scaleClimber_calibration',
      'scaleClimber_highScores',
      'scaleClimber_settings'
    ];

    keys.forEach(key => localStorage.removeItem(key));
  }
}

export default SecureStorage;
```

### XSS Prevention

```javascript
// src/utils/sanitize.js

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Sanitize user input (for display purposes)
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .slice(0, 100); // Limit length
}

export { escapeHTML, sanitizeInput };
```

---

## Localization Strategy

**Objective**: Support multiple languages with minimal overhead.

### Supported Languages (MVP)

1. English (default)
2. Spanish
3. French

### Implementation

```javascript
// src/utils/i18n.js

class I18n {
  constructor() {
    this.locale = this.detectLocale();
    this.translations = {};
    this.loadTranslations();
  }

  detectLocale() {
    // Check user preference in localStorage
    const saved = localStorage.getItem('locale');
    if (saved) return saved;

    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // e.g., 'en' from 'en-US'

    // Fallback to English if not supported
    return ['en', 'es', 'fr'].includes(langCode) ? langCode : 'en';
  }

  async loadTranslations() {
    try {
      const response = await fetch(`/locales/${this.locale}.json`);
      this.translations = await response.json();
    } catch (err) {
      console.error('Failed to load translations:', err);
      // Fallback to English
      if (this.locale !== 'en') {
        this.locale = 'en';
        await this.loadTranslations();
      }
    }
  }

  t(key) {
    return this.translations[key] || key;
  }

  setLocale(locale) {
    if (!['en', 'es', 'fr'].includes(locale)) return;

    this.locale = locale;
    localStorage.setItem('locale', locale);
    this.loadTranslations().then(() => {
      // Reload UI
      window.location.reload();
    });
  }
}

// Global instance
const i18n = new I18n();
export default i18n;
```

### Translation Files

```json
// public/locales/en.json
{
  "app.title": "Scale Climber",
  "app.tagline": "Climb the musical mountain!",
  "menu.start": "Start Game",
  "menu.practice": "Practice Mode",
  "menu.settings": "Settings",
  "menu.howToPlay": "How to Play",
  "calibration.title": "Voice Calibration",
  "calibration.volumeTest": "Make some noise to test your microphone",
  "calibration.rangeTest": "Sing a comfortable low note, then a high note",
  "calibration.suggestion": "We suggest: {octave} ({voiceType})",
  "game.targetNote": "Target: {note}",
  "game.score": "Score:",
  "game.combo": "Combo:",
  "game.pause": "Pause",
  "game.resume": "Resume",
  "results.title": "Results",
  "results.grade": "Grade: {grade}",
  "results.finalScore": "Final Score: {score}",
  "results.playAgain": "Play Again",
  "results.backToMenu": "Back to Menu",
  "error.permissionDenied": "Microphone access is required to play",
  "error.noMicrophone": "No microphone detected",
  "error.retry": "Retry",
  "error.cancel": "Cancel"
}
```

```json
// public/locales/es.json
{
  "app.title": "Escalador de Escalas",
  "app.tagline": "¡Sube la montaña musical!",
  "menu.start": "Comenzar Juego",
  "menu.practice": "Modo Práctica",
  "menu.settings": "Configuración",
  "menu.howToPlay": "Cómo Jugar",
  "calibration.title": "Calibración de Voz",
  "calibration.volumeTest": "Haz un poco de ruido para probar tu micrófono",
  "calibration.rangeTest": "Canta una nota baja cómoda, luego una nota alta",
  "calibration.suggestion": "Sugerimos: {octave} ({voiceType})",
  "game.targetNote": "Objetivo: {note}",
  "game.score": "Puntuación:",
  "game.combo": "Combo:",
  "game.pause": "Pausa",
  "game.resume": "Reanudar",
  "results.title": "Resultados",
  "results.grade": "Calificación: {grade}",
  "results.finalScore": "Puntuación Final: {score}",
  "results.playAgain": "Jugar de Nuevo",
  "results.backToMenu": "Volver al Menú",
  "error.permissionDenied": "Se requiere acceso al micrófono para jugar",
  "error.noMicrophone": "No se detectó micrófono",
  "error.retry": "Reintentar",
  "error.cancel": "Cancelar"
}
```

### Usage in Components

```javascript
import i18n from './utils/i18n.js';

// Simple translation
const title = i18n.t('app.title');

// Translation with placeholders
const targetNote = i18n.t('game.targetNote').replace('{note}', 'C4');

// In HTML templates
document.getElementById('title').textContent = i18n.t('app.title');
```

---

## Implementation Timeline

**Total Duration**: 6 weeks (30 working days)

### Week-by-Week Breakdown

#### Week 0: Setup & Research (3-4 days)
- **Days 1-2**: Project initialization, tooling setup, CI/CD
- **Days 3-4**: User interviews (8-10 participants)
- **Milestone**: Development environment ready, user insights documented
- **Gate**: 6+ interviews completed, core mechanic validated

#### Week 1: Audio Foundation (7 days)
- **Days 1-2**: AudioContextManager + microphone capture
- **Days 3-4**: YIN pitch detection algorithm
- **Day 5**: Web Worker integration + Transferable Objects
- **Day 6**: CalibrationEngine implementation
- **Day 7**: Integration testing, performance profiling
- **Milestone M1**: Audio prototype complete
- **Success Criteria**: Detects C4-C5 within ±5 cents, <50ms latency

#### Week 2: Game Logic (7 days)
- **Days 1-2**: GameEngine state machine
- **Days 3-4**: ScaleChallenge + PracticeMode
- **Day 5**: ScoreSystem + StateRecovery
- **Day 6**: Integration testing
- **Day 7**: Bug fixes + code review
- **Milestone M2**: Playable alpha (no visuals)
- **Success Criteria**: Full scale challenge completable

#### Week 3: Visuals Part 1 (7 days)
- **Days 1-2**: Canvas renderer + performance monitor
- **Days 3-4**: Character sprite system + animations
- **Day 5**: Background + parallax layers
- **Day 6**: Pitch meter visualization
- **Day 7**: Integration with game logic
- **Milestone**: Visual rendering operational

#### Week 4: Visuals Part 2 + UI (7 days)
- **Days 1-2**: Particle effects + celebrations
- **Days 3-4**: UI screens (menu, calibration, results)
- **Day 5**: Settings panel + pause menu
- **Days 6-7**: Polish + responsive design
- **Milestone M3**: Visual beta complete
- **Success Criteria**: All screens functional, 60fps on desktop

#### Week 5: Polish + Deployment (7 days)
- **Days 1-2**: Audio feedback + reference tones
- **Days 3-4**: Accessibility (keyboard, screen reader, a11y)
- **Day 5**: Service worker + PWA setup
- **Day 6**: Performance optimization + testing
- **Day 7**: Deployment + cross-browser testing
- **Milestone**: Production-ready build

#### Week 6: QA + Launch (7 days)
- **Days 1-2**: Beta testing with 25-30 users
- **Days 3-4**: Bug fixes from user feedback
- **Day 5**: Final performance audit (Lighthouse)
- **Day 6**: Documentation + README
- **Day 7**: Production deployment
- **Milestone M4**: Public release
- **Success Criteria**: Live on GitHub Pages, Lighthouse scores met

### Risk Buffer

**Built-in buffers**:
- Week 1: +1 day for audio calibration tuning
- Week 3: +1 day for performance optimization
- Week 6: Entire week is buffer for unexpected issues

**Contingency**: If timeline slips by >2 days, consider cutting:
1. Practice mode (can be post-MVP)
2. Multiple octave ranges (ship with C4-C5 only)
3. Particle effects (nice-to-have)
4. Localization (English-only launch)

### Daily Standup Template

**Questions**:
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers?
4. Am I on track for this week's milestone?

---

## Testing Strategy

**Objective**: Comprehensive test coverage with fast feedback loops.

### Test Pyramid

```
              ┌─────────────────┐
              │   E2E Tests     │  5% (~5 tests)
              │   (Playwright)  │
          ┌───┴─────────────────┴───┐
          │  Integration Tests      │  20% (~20 tests)
          │      (Vitest)           │
      ┌───┴─────────────────────────┴───┐
      │       Unit Tests               │  75% (~75 tests)
      │        (Vitest)                │
      └────────────────────────────────┘
```

### Unit Test Coverage Targets

| Module | Target | Rationale |
|--------|--------|-----------|
| PitchDetector | 95% | Critical path, algorithmic |
| NoteMapper | 100% | Pure functions, deterministic |
| ScoreSystem | 95% | Complex calculations |
| ScaleChallenge | 90% | State machine logic |
| GameEngine | 85% | High-level orchestration |
| CalibrationEngine | 90% | Automated voice detection |
| StateRecovery | 90% | Data persistence |
| Renderer | 60% | Visual components, hard to test |

### Critical Test Cases

#### Audio Module Tests

```javascript
// tests/unit/PitchDetector.test.js
import { describe, it, expect } from 'vitest';
import PitchDetector from '../../src/audio/PitchDetector';

describe('PitchDetector - YIN Algorithm', () => {
  it('detects A4 (440Hz) accurately', async () => {
    const buffer = generateSineWave(440, 1024, 44100);
    const result = detectPitch(buffer);

    expect(result.frequency).toBeCloseTo(440, 2);
    expect(result.note).toBe('A4');
    expect(result.cents).toBeCloseTo(0, 5);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('handles white noise gracefully', async () => {
    const buffer = generateWhiteNoise(1024);
    const result = detectPitch(buffer);

    expect(result.frequency).toBeNull();
    expect(result.confidence).toBeLessThan(0.3);
  });

  it('detects pitch within ±5 cents', async () => {
    const frequencies = [439, 440, 441]; // -3.9¢, 0¢, +3.9¢

    for (const freq of frequencies) {
      const buffer = generateSineWave(freq, 1024, 44100);
      const result = detectPitch(buffer);
      expect(Math.abs(result.cents)).toBeLessThan(5);
    }
  });
});
```

#### Game Logic Tests

```javascript
// tests/unit/ScaleChallenge.test.js
import { describe, it, expect, vi } from 'vitest';
import ScaleChallenge from '../../src/game/ScaleChallenge';

describe('ScaleChallenge', () => {
  it('advances to next note after successful hold', () => {
    const challenge = new ScaleChallenge({ octave: 'alto', difficulty: 'normal' });
    const mockPitch = { frequency: 261.63, confidence: 0.9 }; // C4

    // Simulate holding note for 500ms
    for (let i = 0; i < 30; i++) { // 30 frames @ 16.6ms = ~500ms
      challenge.update(mockPitch);
    }

    expect(challenge.currentNoteIndex).toBe(1); // Advanced to D4
  });

  it('resets hold timer when pitch goes out of tolerance', () => {
    const challenge = new ScaleChallenge({ octave: 'alto', difficulty: 'normal' });

    // Start holding correct pitch
    challenge.update({ frequency: 261.63, confidence: 0.9 });
    expect(challenge.currentAttempt.status).toBe('active');

    // Go off-pitch
    challenge.update({ frequency: 300, confidence: 0.9 }); // Too high
    expect(challenge.currentAttempt.status).toBe('waiting');
    expect(challenge.currentAttempt.holdTime).toBe(0);
  });

  it('fails after 3 seconds of silence', () => {
    const challenge = new ScaleChallenge({ octave: 'alto', difficulty: 'normal' });
    const onFail = vi.fn();
    challenge.onFail = onFail;

    // Simulate 3.1 seconds of silence
    vi.useFakeTimers();
    challenge.update({ frequency: null, confidence: 0 });
    vi.advanceTimersByTime(3100);
    challenge.update({ frequency: null, confidence: 0 });

    expect(onFail).toHaveBeenCalledWith('TIMEOUT');
    vi.useRealTimers();
  });
});
```

### Integration Tests

```javascript
// tests/integration/GameFlow.test.js
import { describe, it, expect } from 'vitest';
import GameEngine from '../../src/game/GameEngine';

describe('Full Game Flow', () => {
  it('completes full scale challenge', async () => {
    const engine = new GameEngine();
    await engine.init();

    // Mock audio manager to bypass real mic
    engine.audioManager = createMockAudioManager();

    // Start game
    await engine.startNewGame();
    engine.startPlaying('alto', 'easy');

    // Simulate singing each note correctly
    const scale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    for (const note of scale) {
      const freq = noteToFrequency(note);
      for (let i = 0; i < 30; i++) {
        await engine.update({ frequency: freq, confidence: 0.9 });
      }
    }

    expect(engine.state).toBe('complete');
    expect(engine.scoreSystem.getFinalScore()).toBeGreaterThan(0);
  });
});
```

### E2E Tests

```javascript
// tests/e2e/fullGame.spec.js
import { test, expect } from '@playwright/test';

test('full game playthrough', async ({ page }) => {
  await page.goto('/');

  // Wait for app to load
  await expect(page.getByText('Scale Climber')).toBeVisible();

  // Click start
  await page.getByRole('button', { name: 'Start Game' }).click();

  // Handle mic permission (mock granted)
  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.resolve(
      new MediaStream()
    );
  });

  // Should show calibration
  await expect(page.getByText('Voice Calibration')).toBeVisible();

  // Skip calibration for test
  await page.getByRole('button', { name: 'Skip' }).click();

  // Select octave
  await page.getByRole('button', { name: 'C4-C5 (Alto)' }).click();

  // Wait for countdown
  await expect(page.getByText('3')).toBeVisible();
  await expect(page.getByText('GO')).toBeVisible({ timeout: 5000 });

  // Game should be playing
  await expect(page.getByText('Target: C4')).toBeVisible();

  // Verify canvas is rendering
  const canvas = page.locator('#game-canvas');
  await expect(canvas).toBeVisible();
});

test('offline mode works', async ({ page, context }) => {
  // Load page online first
  await page.goto('/');
  await expect(page.getByText('Scale Climber')).toBeVisible();

  // Go offline
  await context.setOffline(true);

  // Reload page
  await page.reload();

  // Should still load from cache
  await expect(page.getByText('Scale Climber')).toBeVisible({ timeout: 3000 });
});
```

### Manual Test Checklist

#### Pre-Release Testing

**Audio Testing** (All must pass):
- [ ] Built-in laptop mic (Windows, Mac)
- [ ] External USB mic
- [ ] Headset mic (wired)
- [ ] Bluetooth headset/mic
- [ ] AirPods/wireless earbuds
- [ ] Different voice types (3+ testers: bass, alto, soprano)

**Browser Compatibility** (All must pass):
- [ ] Chrome 90+ (Windows 10/11)
- [ ] Chrome 90+ (macOS)
- [ ] Chrome 90+ (Linux)
- [ ] Firefox 88+ (Windows 10/11)
- [ ] Firefox 88+ (macOS)
- [ ] Safari 14+ (macOS)
- [ ] Safari 14+ (iOS)
- [ ] Edge 90+ (Windows 10/11)
- [ ] Chrome Mobile (Android 10+)
- [ ] Samsung Internet (Android)

**Device Testing** (All must pass):
- [ ] Desktop 1920×1080 (Windows)
- [ ] Desktop 2560×1440 (macOS)
- [ ] Laptop 1366×768 (Windows)
- [ ] Laptop 1920×1080 (macOS)
- [ ] iPad Pro 12.9" (landscape)
- [ ] iPad 10.2" (portrait)
- [ ] iPhone 14 Pro
- [ ] iPhone SE (small screen)
- [ ] Samsung Galaxy S23
- [ ] Google Pixel 7

**Accessibility Testing** (All must pass):
- [ ] Keyboard-only navigation (Tab, Enter, Esc)
- [ ] NVDA screen reader (Windows)
- [ ] JAWS screen reader (Windows)
- [ ] VoiceOver screen reader (macOS)
- [ ] VoiceOver screen reader (iOS)
- [ ] High contrast mode
- [ ] 200% browser zoom
- [ ] Colorblind simulation (deuteranopia, protanopia, tritanopia)

**Performance Testing** (All must pass):
- [ ] 60fps on mid-range desktop (i5/Ryzen 5, integrated graphics)
- [ ] 30fps on mobile (iPhone 12, Samsung S21)
- [ ] Memory usage <100MB after 30 minutes
- [ ] No memory leaks (DevTools heap snapshots)
- [ ] Bundle size <250KB gzipped
- [ ] First Contentful Paint <1.5s (3G connection)

**Offline Testing** (All must pass):
- [ ] Install as PWA on desktop
- [ ] Install as PWA on mobile
- [ ] Play game offline (airplane mode)
- [ ] Assets load from cache
- [ ] Service worker updates correctly

---

## Risk Mitigation

### Risk Register

| ID | Risk | Probability | Impact | Mitigation | Contingency |
|----|------|-------------|--------|------------|-------------|
| R1 | Pitch detection inaccurate for certain voices | Medium | High | Extensive testing with diverse voice types; adjustable tolerance settings | Provide manual difficulty adjustment; collect user feedback for tuning |
| R2 | High audio latency on low-end devices | Medium | High | Web Worker optimization; adaptive buffer sizing | Display latency warning; offer "performance mode" with reduced visuals |
| R3 | Safari compatibility issues (AudioContext) | Medium | Medium | Early Safari testing; iOS audio unlock pattern | Document Safari limitations; recommend Chrome for best experience |
| R4 | Poor mobile performance | Low | High | Mobile-first performance budgets; quality degradation | Offer "lite mode" with minimal visuals |
| R5 | Microphone feedback loops | Low | Medium | Recommend headphones; detect feedback patterns | Auto-mute on feedback detection |
| R6 | Scope creep | High | Medium | Strict MVP definition; backlog grooming | Cut nice-to-have features, maintain core quality |
| R7 | Timeline slips | Medium | Medium | Built-in buffers; daily progress tracking | Cut Practice Mode and localization if needed |
| R8 | User onboarding confusion | Medium | High | User testing during alpha/beta; tutorial overlay | Add video tutorial; simplify calibration |
| R9 | Bluetooth audio delay | Medium | Medium | Document latency expectations; test with common devices | Allow manual latency offset in settings |
| R10 | Asset loading failures | Low | High | Retry logic; fallback to defaults | Graceful degradation; solid color backgrounds |

### Monitoring & Alerts

**Post-Launch Monitoring** (optional, via simple analytics):

| Metric | Threshold | Alert | Action |
|--------|-----------|-------|--------|
| Error rate | >5% of sessions | Email | Investigate logs, hotfix if critical |
| Completion rate | <50% | Review | Analyze drop-off points, adjust difficulty |
| Calibration failure | >20% | Review | Improve calibration UX, adjust thresholds |
| Average score | <300 | Review | Difficulty too high, adjust tolerances |
| Session duration | <2 min | Review | Engagement issue, gather qualitative feedback |

---

## Success Metrics

### Quantitative KPIs

| Metric | Target | Measurement Method | Review Cadence |
|--------|--------|-------------------|----------------|
| **Pitch Detection Accuracy** | ±5 cents for 95% of sustained notes | Automated tests with generated tones | Pre-release |
| **Audio Latency** | <50ms end-to-end | Performance profiling (audio input → visual update) | Pre-release |
| **Frame Rate** | 60fps on desktop, 30fps on mobile | Chrome DevTools Performance tab | Pre-release |
| **First Meaningful Paint** | <2 seconds on 3G | Lighthouse audit | Pre-release |
| **Bundle Size** | <250KB gzipped | Build output analysis | Every build |
| **Test Coverage** | >85% overall | Vitest coverage report | Every commit |
| **Successful Scale Completion** | >70% of users within 3 attempts | Analytics (opt-in) | Weekly post-launch |
| **Session Duration** | >5 minutes average | Analytics (opt-in) | Weekly post-launch |
| **PWA Install Rate** | >10% of returning users | Analytics (opt-in) | Monthly post-launch |
| **Accessibility Score** | 100 (Lighthouse) | Lighthouse audit | Pre-release |

### Qualitative Targets

**User Feedback Goals** (from usability testing):
- 80%+ describe game as "fun" or "enjoyable"
- 80%+ find visual feedback "clear" and "responsive"
- 70%+ feel difficulty is "fair" and "achievable"
- 80%+ like the character animations ("cute", "charming")
- 90%+ would recommend to a friend learning to sing

**Expert Review Goals** (from music educators):
- Pitch detection feels "accurate" and "reliable"
- Tool is "useful" for vocal training
- Would recommend to students

### Launch Success Criteria

**Minimum criteria for public launch**:
- [ ] All P0 bugs closed
- [ ] Lighthouse scores: Performance >90, A11y 100, Best Practices 100, SEO >90
- [ ] Beta testing with 25+ users, 80%+ positive feedback
- [ ] Cross-browser testing complete (no critical issues)
- [ ] Offline mode verified on 3+ devices
- [ ] Documentation complete (README, privacy policy, how-to-play)
- [ ] Stakeholder approval received

**Post-Launch Goals** (3 months):
- 1000+ unique visitors
- 500+ completed scale challenges
- 50+ PWA installs
- <1% error rate
- User satisfaction >4.0/5.0 (if survey implemented)

---

## Appendices

### Appendix A: YIN Algorithm Reference

#### Algorithm Overview

The YIN algorithm estimates the fundamental frequency (F0) of a quasi-periodic signal with high accuracy and low computational cost.

**Reference Paper**:
De Cheveigné, A., & Kawahara, H. (2002). "YIN, a fundamental frequency estimator for speech and music." *The Journal of the Acoustical Society of America*, 111(4), 1917-1930.

#### Mathematical Steps

1. **Difference Function**:
   $$d_t(\tau) = \sum_{j=1}^{W} (x_j - x_{j+\tau})^2$$

   Where:
   - $x$ = input signal
   - $\tau$ = lag (period candidate)
   - $W$ = window size

2. **Cumulative Mean Normalized Difference**:
   $$d'_t(\tau) = \begin{cases} 1 & \text{if } \tau = 0 \\ \frac{d_t(\tau)}{\frac{1}{\tau} \sum_{j=1}^{\tau} d_t(j)} & \text{otherwise} \end{cases}$$

3. **Absolute Threshold**:
   Find smallest $\tau$ where $d'_t(\tau) < \text{threshold}$ (typically 0.10-0.15)

4. **Parabolic Interpolation**:
   $$\tau_{refined} = \tau + \frac{d'_t(\tau+1) - d'_t(\tau-1)}{2(2d'_t(\tau) - d'_t(\tau+1) - d'_t(\tau-1))}$$

5. **Fundamental Frequency**:
   $$f_0 = \frac{f_s}{\tau_{refined}}$$

   Where $f_s$ = sample rate

#### Parameter Tuning

| Parameter | Default | Range | Effect |
|-----------|---------|-------|--------|
| Threshold | 0.15 | 0.10-0.20 | Lower = stricter, higher accuracy but more rejects |
| Buffer size | 2048 samples | 1024-4096 | Larger = better low-freq accuracy, higher latency |
| Min frequency | 80 Hz | 50-100 Hz | Lowest detectable pitch |
| Max frequency | 1000 Hz | 800-2000 Hz | Highest detectable pitch |

### Appendix B: Musical Frequency Reference

#### Equal Temperament (A4 = 440 Hz)

| Note | Frequency (Hz) | MIDI Number | Cents from A4 |
|------|----------------|-------------|---------------|
| C2 | 65.41 | 36 | -3900 |
| C3 | 130.81 | 48 | -2700 |
| **C4 (Middle C)** | **261.63** | **60** | **-1500** |
| D4 | 293.66 | 62 | -1300 |
| E4 | 329.63 | 64 | -1100 |
| F4 | 349.23 | 65 | -1000 |
| G4 | 392.00 | 67 | -800 |
| **A4 (Concert Pitch)** | **440.00** | **69** | **0** |
| B4 | 493.88 | 71 | +200 |
| C5 | 523.25 | 72 | +300 |
| C6 | 1046.50 | 84 | +1500 |

#### Cent Calculation

A **cent** is 1/100th of a semitone (logarithmic unit of pitch):

$$\text{cents} = 1200 \times \log_2\left(\frac{f_{\text{detected}}}{f_{\text{target}}}\right)$$

**Examples**:
- 440.00 Hz → A4 = 0 cents (perfect)
- 445.00 Hz → A4 = +19.6 cents (sharp)
- 435.00 Hz → A4 = -19.6 cents (flat)

### Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Cent** | 1/100th of a semitone; logarithmic unit of pitch interval |
| **F0 / Fundamental Frequency** | The lowest frequency component of a periodic waveform; perceived pitch |
| **YIN** | "Yin" from yin-yang; a pitch detection algorithm optimized for monophonic signals |
| **Autocorrelation** | A signal processing technique comparing a signal to time-shifted copies of itself |
| **Aperiodicity** | Measure of how non-periodic (noisy) a signal is; inverse of pitch clarity |
| **MIDI Number** | Integer representation of musical pitch (0-127); Middle C = 60 |
| **Equal Temperament** | Tuning system dividing the octave into 12 equal semitones |
| **Noise Gate** | Audio processing threshold that mutes signals below a certain amplitude |
| **Web Audio API** | JavaScript API for processing and synthesizing audio in web browsers |
| **Service Worker** | JavaScript worker that runs in background, enabling offline functionality |
| **PWA** | Progressive Web App; web application that can be installed like a native app |
| **ARIA** | Accessible Rich Internet Applications; standards for screen reader support |
| **WCAG** | Web Content Accessibility Guidelines; international accessibility standards |

### Appendix D: Resources & References

#### Technical References

1. **YIN Algorithm**:
   - Original paper: https://asa.scitation.org/doi/10.1121/1.1458024
   - Implementation guide: https://github.com/ashokfernandez/Yin-Pitch-Tracking

2. **Web Audio API**:
   - MDN Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
   - Specification: https://www.w3.org/TR/webaudio/

3. **Accessibility**:
   - WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
   - ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

4. **Music Theory**:
   - MIDI Tuning Standard: https://www.midi.org/specifications
   - Equal Temperament: https://en.wikipedia.org/wiki/Equal_temperament

#### Tools & Libraries

1. **Development**:
   - Vite: https://vitejs.dev/
   - Vitest: https://vitest.dev/
   - Playwright: https://playwright.dev/

2. **Audio Testing**:
   - Audacity (generate test tones): https://www.audacityteam.org/
   - Online Tone Generator: https://onlinetonegenerator.com/

3. **Design**:
   - Figma (mockups): https://www.figma.com/
   - Aseprite (pixel art): https://www.aseprite.org/

4. **Performance**:
   - Lighthouse: https://developers.google.com/web/tools/lighthouse
   - WebPageTest: https://www.webpagetest.org/

---

## Document Sign-Off

**Version**: 2.0 (Final)
**Date**: January 12, 2025
**Status**: Ready for Implementation

### Review Checklist

- [x] All PM/QA review gaps addressed
- [x] Technical architecture enhancements included
- [x] Error handling scenarios specified
- [x] Mobile requirements documented
- [x] Security & privacy considerations covered
- [x] Localization strategy defined
- [x] 6-week timeline with buffers
- [x] Comprehensive testing strategy
- [x] Risk mitigation plans
- [x] Success metrics defined

### Next Steps

1. **Immediate**: Conduct user research interviews (Week 0)
2. **Week 1**: Begin Phase 1 implementation (Audio Foundation)
3. **Throughout**: Daily standups, track progress against milestones
4. **Week 3**: Alpha usability testing
5. **Week 5**: Beta testing with 25-30 users
6. **Week 6**: Production launch

### Stakeholder Approval

**Required Approvals Before Starting Development**:
- [ ] Technical Lead (Architecture review)
- [ ] Product Manager (Feature scope, timeline)
- [ ] UX Designer (Visual design, accessibility)
- [ ] QA Lead (Testing strategy)

---

**End of Document**

*This implementation plan is a living document. Updates should be tracked via git commits with meaningful messages.*
