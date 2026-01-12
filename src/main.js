/**
 * Scale Climber - Main Entry Point
 * Initializes the application and manages screen navigation
 */

import GameEngine from './game/GameEngine.js';
import CanvasRenderer from './visuals/CanvasRenderer.js';
import CharacterSprite from './visuals/CharacterSprite.js';
import PitchMeter from './visuals/PitchMeter.js';
import ParticleSystem from './visuals/ParticleSystem.js';
import KeyboardControls from './utils/KeyboardControls.js';
import AccessibilitySettings from './utils/AccessibilitySettings.js';
import AudioFeedback from './utils/AudioFeedback.js';
import ReferenceToneGenerator from './utils/ReferenceToneGenerator.js';

// Global state
let gameEngine = null;
let renderer = null;
let keyboardControls = null;
let accessibilitySettings = null;
let audioFeedback = null;
let referenceTone = null;

// Screen management
const screens = {
  loading: document.getElementById('loading-screen'),
  start: document.getElementById('start-screen'),
  calibration: document.getElementById('calibration-screen'),
  game: document.getElementById('game-screen'),
  results: document.getElementById('results-screen'),
  error: document.getElementById('error-screen'),
};

/**
 * Show a specific screen and hide all others
 * @param {string} screenName - Name of screen to show
 */
function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  if (screens[screenName]) {
    screens[screenName].classList.add('active');
  }

  // Start/stop renderer based on screen
  if (screenName === 'game' && renderer) {
    renderer.start();
  } else if (renderer) {
    renderer.stop();
  }
}

/**
 * Show error screen with message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = message;
  showScreen('error');
}

/**
 * Start challenge mode
 */
async function startChallenge() {
  try {
    showScreen('calibration');

    // Run calibration
    const calibrationResult = await gameEngine.startCalibration((progress) => {
      const instruction = document.getElementById('calibration-instruction');
      instruction.textContent = `Calibrating... ${Math.round(progress * 100)}%`;
    });

    if (!calibrationResult.success) {
      throw new Error('Calibration failed');
    }

    // Start challenge
    showScreen('game');
    gameEngine.startChallenge(4, 'normal');

    // Setup game event listeners
    setupGameListeners();
  } catch (error) {
    console.error('Failed to start challenge:', error);
    showError(`Failed to start: ${error.message}`);
  }
}

/**
 * Setup game event listeners
 */
function setupGameListeners() {
  // Pitch updates
  gameEngine.on('pitch-update', (data) => {
    if (renderer) {
      renderer.updateGameState({
        pitchData: data,
        targetNote: data.targetNote,
        holdProgress: data.holdProgress,
      });
    }
  });

  // Note hits
  gameEngine.on('note-hit', (data) => {
    if (renderer) {
      renderer.updateGameState({
        noteResult: data.score.tier,
        score: data.score.totalPoints,
        combo: data.score.combo,
      });
    }

    // Play audio feedback
    if (audioFeedback) {
      audioFeedback.playNoteResult(data.score.tier);
      audioFeedback.playCombo(data.score.combo);
    }

    // Update score value for screen readers
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
      scoreValue.textContent = data.score.totalPoints;
    }

    // Update combo value for screen readers
    const comboValue = document.getElementById('combo-value');
    if (comboValue) {
      comboValue.textContent = data.score.combo;
    }
  });

  // Note misses
  gameEngine.on('note-miss', () => {
    if (renderer) {
      renderer.updateGameState({
        noteResult: 'MISS',
      });
    }

    // Play miss sound
    if (audioFeedback) {
      audioFeedback.playNoteResult('MISS');
    }
  });

  // Challenge complete
  gameEngine.on('challenge-complete', (data) => {
    showScreen('results');
    displayResults(data);

    // Play victory sound
    if (audioFeedback) {
      audioFeedback.playVictory();
    }

    // Announce to screen readers
    announceToScreenReader(`Challenge complete! Grade: ${data.grade}`);
  });

  // Challenge failed
  gameEngine.on('challenge-failed', (data) => {
    showError(`Challenge failed: ${data.reason}`);

    // Play failure sound
    if (audioFeedback) {
      audioFeedback.playFailure();
    }
  });
}

/**
 * Display results
 * @param {object} data - Results data
 */
function displayResults(data) {
  document.getElementById('final-grade').textContent = data.grade;
  document.getElementById('final-score').textContent = data.finalScore;

  const statsDisplay = document.getElementById('stats-display');
  statsDisplay.innerHTML = `
    <div>Perfect: ${data.statistics.perfectCount}</div>
    <div>Great: ${data.statistics.greatCount}</div>
    <div>OK: ${data.statistics.okCount}</div>
    <div>Miss: ${data.statistics.missCount}</div>
    <div>Max Combo: ${data.statistics.maxCombo}</div>
    <div>Accuracy: ${data.statistics.accuracy}%</div>
  `;
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('status-announce');
  if (announcer) {
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }
}

/**
 * Toggle help overlay
 */
function toggleHelp() {
  const helpOverlay = document.getElementById('help-overlay');
  if (helpOverlay) {
    const isHidden = helpOverlay.hasAttribute('hidden');
    if (isHidden) {
      helpOverlay.removeAttribute('hidden');
      helpOverlay.focus();
    } else {
      helpOverlay.setAttribute('hidden', '');
    }
  }
}

/**
 * Toggle HUD visibility
 */
function toggleHUD(visible) {
  const hud = document.getElementById('hud');
  if (hud) {
    hud.style.display = visible ? 'flex' : 'none';
  }
}

// Button event listeners
document.getElementById('start-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  startChallenge();
});

document.getElementById('practice-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  console.log('Practice mode not yet implemented');
});

document.getElementById('settings-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  console.log('Settings not yet implemented');
});

document.getElementById('play-again-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  startChallenge();
});

document.getElementById('menu-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  showScreen('start');
});

document.getElementById('error-menu-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  showScreen('start');
});

document.getElementById('retry-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  showScreen('start');
});

document.getElementById('pause-button')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  if (gameEngine) {
    gameEngine.pause();
  }
});

document.getElementById('close-help')?.addEventListener('click', () => {
  if (audioFeedback) audioFeedback.playClick();
  toggleHelp();
});

// Initialize app
async function initializeApp() {
  try {
    console.log('Initializing Scale Climber...');

    // Check for Web Audio API support
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      throw new Error('Web Audio API not supported in this browser');
    }

    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access not supported in this browser');
    }

    // Initialize accessibility settings
    accessibilitySettings = new AccessibilitySettings();
    console.log('Accessibility settings initialized');

    // Initialize audio feedback
    audioFeedback = new AudioFeedback();
    await audioFeedback.waitForLoad();
    console.log('Audio feedback initialized');

    // Initialize reference tone generator
    referenceTone = new ReferenceToneGenerator();
    console.log('Reference tone generator initialized');

    // Initialize game engine
    gameEngine = new GameEngine();
    const initResult = await gameEngine.initialize();

    if (!initResult.success) {
      throw new Error(initResult.error || 'Failed to initialize game engine');
    }

    // Add mute toggle to game engine
    gameEngine.toggleMute = () => {
      const muted = audioFeedback.toggleMute();
      return muted;
    };

    gameEngine.restart = () => {
      // Reset game state and restart
      showScreen('start');
    };

    // Initialize renderer
    const canvas = document.getElementById('game-canvas');
    renderer = new CanvasRenderer(canvas);

    // Create visual components
    const character = new CharacterSprite();
    const pitchMeter = new PitchMeter();
    const particleSystem = new ParticleSystem();

    renderer.setComponents({ character, pitchMeter, particleSystem });

    // Initialize keyboard controls
    keyboardControls = new KeyboardControls(gameEngine, {
      onHelp: toggleHelp,
      onHUDToggle: toggleHUD,
    });
    console.log('Keyboard controls initialized');

    console.log('Scale Climber initialized successfully');

    // Show start screen
    setTimeout(() => {
      showScreen('start');
    }, 500);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError(`Failed to initialize: ${error.message}`);
  }
}

// Start the app
initializeApp();

// Register service worker for PWA/offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/scale-climber/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                showUpdateNotification();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

    // Handle controller change
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}

/**
 * Show update notification banner
 */
function showUpdateNotification() {
  // Create update banner
  const updateBanner = document.createElement('div');
  updateBanner.id = 'update-banner';
  updateBanner.className = 'update-banner';
  updateBanner.setAttribute('role', 'alert');
  updateBanner.setAttribute('aria-live', 'assertive');
  updateBanner.innerHTML = `
    <div class="update-banner-content">
      <p>🎵 A new version is available!</p>
      <button id="update-btn" class="primary-button">Update Now</button>
      <button id="dismiss-update" class="text-button">Later</button>
    </div>
  `;

  document.body.appendChild(updateBanner);

  // Update button handler
  document.getElementById('update-btn')?.addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  });

  // Dismiss button handler
  document.getElementById('dismiss-update')?.addEventListener('click', () => {
    updateBanner.remove();
  });
}
