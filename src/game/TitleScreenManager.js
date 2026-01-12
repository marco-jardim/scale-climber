/**
 * TitleScreenManager.js
 * Manages the "Basecamp at Night" title screen logic.
 * State machine, audio interaction, and visual coordination.
 */

import TitleSceneRenderer from '../visuals/TitleSceneRenderer.js';

const STATE = {
  IDLE: 'IDLE',
  NEED_MIC: 'NEED_MIC',
  REQUESTING_MIC: 'REQUESTING_MIC',
  LISTENING: 'LISTENING',
  TOO_QUIET: 'TOO_QUIET',
  TOO_NOISY: 'TOO_NOISY',
  PITCH_UNCERTAIN: 'PITCH_UNCERTAIN',
  GUIDANCE_FLAT: 'GUIDANCE_FLAT',
  GUIDANCE_SHARP: 'GUIDANCE_SHARP',
  CLIP_IN_ARMED: 'CLIP_IN_ARMED',
  CLIP_IN_HOLDING: 'CLIP_IN_HOLDING',
  CLIP_IN_SUCCESS: 'CLIP_IN_SUCCESS',
  STARTING: 'STARTING',
  ERROR_MIC_DENIED: 'ERROR_MIC_DENIED',
};

class TitleScreenManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.renderer = null;
    this.canvas = null;

    this.currentState = STATE.IDLE;
    this.stateStartTime = 0;

    this.holdStartTime = 0;
    this.holdDuration = 1500; // 1.5s lock
    this.holdProgress = 0;

    this.rafId = null;
    this.lastFrameTime = 0;

    // UI Elements
    this.ui = {
      container: null,
      headline: null,
      subhead: null,
      ctaBtn: null,
      ctaHelper: null,
      voiceHint: null,
      srStatus: null,
    };

    this.onStartGame = null; // Callback
  }

  init(containerId, onStartGame) {
    this.onStartGame = onStartGame;
    this.ui.container = document.getElementById(containerId);
    if (!this.ui.container) return;

    // Bind UI elements
    this.ui.headline = this.ui.container.querySelector('#ts-headline');
    this.ui.subhead = this.ui.container.querySelector('#ts-subhead');
    this.ui.ctaBtn = this.ui.container.querySelector('#ts-cta-btn');
    this.ui.ctaHelper = this.ui.container.querySelector('#ts-cta-helper');
    this.ui.voiceHint = this.ui.container.querySelector('#ts-voice-hint');
    this.ui.srStatus = this.ui.container.querySelector('#ts-sr-status');

    // Setup Canvas
    this.canvas = document.getElementById('title-canvas');
    this.renderer = new TitleSceneRenderer(this.canvas, null);

    // Initial State
    this.setState(STATE.NEED_MIC);

    // Event Listeners
    this.ui.ctaBtn.addEventListener('click', () => this.handleCtaClick());

    // Start Loop
    this.startLoop();
  }

  handleCtaClick() {
    if (this.currentState === STATE.NEED_MIC || this.currentState === STATE.ERROR_MIC_DENIED) {
      this.requestMic();
    } else if (this.currentState === STATE.CLIP_IN_SUCCESS) {
      this.startGame();
    }
  }

  async requestMic() {
    this.setState(STATE.REQUESTING_MIC);
    try {
      // Use GameEngine to init audio
      const result = await this.gameEngine.initialize();
      if (result.success) {
        // Start listening loop
        this.setState(STATE.LISTENING);
        // Ensure audio context is resumed
        await this.gameEngine.audioManager.resume();
      } else {
        this.setState(STATE.ERROR_MIC_DENIED);
      }
    } catch (e) {
      console.error(e);
      this.setState(STATE.ERROR_MIC_DENIED);
    }
  }

  setState(newState) {
    if (this.currentState === newState) return;

    this.currentState = newState;
    this.stateStartTime = performance.now();
    this.updateUI();
  }

  updateUI() {
    const s = this.currentState;
    const { ui } = this;

    // Helper to set text safely
    const txt = (el, t) => {
      if (el) {
        // eslint-disable-next-line no-param-reassign
        el.textContent = t;
      }
    };

    switch (s) {
      case STATE.NEED_MIC:
        txt(ui.headline, 'Your voice is the controller.');
        txt(ui.subhead, 'Enable your microphone to start climbing.');
        txt(ui.ctaBtn, 'Enable mic');
        ui.ctaBtn.disabled = false;
        break;
      case STATE.REQUESTING_MIC:
        txt(ui.headline, 'One quick step.');
        txt(ui.subhead, 'Choose “Allow” in the browser prompt.');
        txt(ui.ctaBtn, 'Waiting...');
        ui.ctaBtn.disabled = true;
        break;
      case STATE.LISTENING:
        txt(ui.headline, 'Hum a comfy note.');
        txt(ui.subhead, 'Hold it steady to clip in.');
        txt(ui.ctaBtn, 'Hum to clip in');
        ui.ctaBtn.disabled = true; // "Passive" button until success
        break;
      case STATE.TOO_QUIET:
        txt(ui.headline, 'A little louder.');
        break;
      case STATE.CLIP_IN_HOLDING:
        txt(ui.headline, 'Clipping in...');
        txt(ui.subhead, 'Stay with that note.');
        txt(ui.ctaBtn, 'Hold steady...');
        break;
      case STATE.CLIP_IN_SUCCESS:
        txt(ui.headline, 'Locked in.');
        txt(ui.subhead, 'Route revealed.');
        txt(ui.ctaBtn, 'Start Climb');
        ui.ctaBtn.disabled = false;
        ui.ctaBtn.classList.add('pulse-success');
        break;
      case STATE.ERROR_MIC_DENIED:
        txt(ui.headline, 'Mic blocked.');
        txt(ui.ctaBtn, 'Try Again');
        ui.ctaBtn.disabled = false;
        break;

      default:
        break;
    }
  }

  startLoop() {
    this.lastFrameTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;

      this.update(dt);
      this.render();

      if (this.currentState !== STATE.STARTING) {
        this.rafId = requestAnimationFrame(loop);
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  async update(dt) {
    // Get Audio Data from GameEngine
    let pitchData = null;
    let volume = 0;

    if (this.gameEngine.pitchDetector) {
      pitchData = await this.gameEngine.pitchDetector.detect(); // Use async/await if detect is async
      volume = pitchData?.volume || 0;
    }

    // Logic State Machine
    if (this.currentState !== STATE.NEED_MIC
        && this.currentState !== STATE.REQUESTING_MIC
        && this.currentState !== STATE.CLIP_IN_SUCCESS
        && this.currentState !== STATE.ERROR_MIC_DENIED) {
      this.processAudioInput(pitchData, volume);
    }

    // Pass data to renderer
    this.rendererState = {
      volume,
      pitchCents: pitchData?.diff, // Assuming diff is cents from nearest note
      confidence: pitchData?.clarity, // Assuming clarity/confidence
      isClippingIn: this.currentState === STATE.CLIP_IN_HOLDING,
      clipProgress: this.holdProgress,
      nodesVisible: this.currentState === STATE.CLIP_IN_SUCCESS,
    };

    if (pitchData) {
      this.rendererState.pitchCents = this.calculateTargetDiff(pitchData);
    }

    this.renderer.update(dt, this.rendererState);
  }

  calculateTargetDiff(pitchData) {
    // If we are just checking for *stability*, we look at clarity and volume.
    // But for visual feedback (orb), we need a "target".
    // Let's assume target is the nearest semitone for now,
    // but specifically we want to encourage a stable tone.
    // If we use `pitchData.diff` (cents off nearest note), that works well for the Orb logic.
    return pitchData.diff;
  }

  processAudioInput(pitchData, volume) {
    if (!pitchData) return;

    const { diff, clarity } = pitchData;

    // Thresholds
    const VOL_THRESH = 0.02;
    const CLARITY_THRESH = 0.9;
    const STABLE_THRESH_CENTS = 25;

    // 1. Check Volume
    if (volume < VOL_THRESH) {
      this.setState(STATE.TOO_QUIET);
      this.resetHold();
      return;
    }

    // 2. Check Clarity
    if (clarity < CLARITY_THRESH) {
      this.setState(STATE.PITCH_UNCERTAIN);
      this.resetHold();
      return;
    }

    // 3. Check Stability (Hold)
    if (Math.abs(diff) < STABLE_THRESH_CENTS) {
      // We are "on target" (nearest note)
      if (this.currentState !== STATE.CLIP_IN_HOLDING) {
        this.setState(STATE.CLIP_IN_ARMED); // Pulse/Pre-hold
        // Transition to holding
        this.setState(STATE.CLIP_IN_HOLDING);
        this.holdStartTime = performance.now();
      }

      // Increment Hold
      const holdTime = performance.now() - this.holdStartTime;
      this.holdProgress = Math.min(holdTime / this.holdDuration, 1.0);

      if (this.holdProgress >= 1.0) {
        this.setState(STATE.CLIP_IN_SUCCESS);
        // Play success sound here if possible
      }
    } else {
      // Drifted
      if (this.currentState === STATE.CLIP_IN_HOLDING) {
        this.setState(STATE.LISTENING); // Or "Drifted" state
      }
      this.resetHold();
    }
  }

  resetHold() {
    this.holdProgress = 0;
    if (this.currentState === STATE.CLIP_IN_HOLDING) {
      this.setState(STATE.LISTENING);
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.rendererState || {});
    }
  }

  startGame() {
    this.setState(STATE.STARTING);
    cancelAnimationFrame(this.rafId);

    // Hide UI
    this.ui.container.classList.add('hidden');

    // Callback to Main
    if (this.onStartGame) this.onStartGame();
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    // cleanup events
  }
}

export default TitleScreenManager;
