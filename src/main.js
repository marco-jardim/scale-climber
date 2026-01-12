/**
 * Scale Climber - Main Entry Point
 * Initializes the application and manages screen navigation
 */

import GameEngine from './game/GameEngine.js';
import CanvasRenderer from './visuals/CanvasRenderer.js';
import CharacterSprite from './visuals/CharacterSprite.js';
import PitchMeter from './visuals/PitchMeter.js';
import ParticleSystem from './visuals/ParticleSystem.js';

// Global state
let gameEngine = null;
let renderer = null;

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
  });

  // Note misses
  gameEngine.on('note-miss', () => {
    if (renderer) {
      renderer.updateGameState({
        noteResult: 'MISS',
      });
    }
  });

  // Challenge complete
  gameEngine.on('challenge-complete', (data) => {
    showScreen('results');
    displayResults(data);
  });

  // Challenge failed
  gameEngine.on('challenge-failed', (data) => {
    showError(`Challenge failed: ${data.reason}`);
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

// Button event listeners
document.getElementById('start-button')?.addEventListener('click', () => {
  startChallenge();
});

document.getElementById('practice-button')?.addEventListener('click', () => {
  console.log('Practice mode not yet implemented');
});

document.getElementById('settings-button')?.addEventListener('click', () => {
  console.log('Settings not yet implemented');
});

document.getElementById('play-again-button')?.addEventListener('click', () => {
  startChallenge();
});

document.getElementById('menu-button')?.addEventListener('click', () => {
  showScreen('start');
});

document.getElementById('error-menu-button')?.addEventListener('click', () => {
  showScreen('start');
});

document.getElementById('retry-button')?.addEventListener('click', () => {
  showScreen('start');
});

document.getElementById('pause-button')?.addEventListener('click', () => {
  if (gameEngine) {
    gameEngine.pause();
  }
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

    // Initialize game engine
    gameEngine = new GameEngine();
    const initResult = await gameEngine.initialize();

    if (!initResult.success) {
      throw new Error(initResult.error || 'Failed to initialize game engine');
    }

    // Initialize renderer
    const canvas = document.getElementById('game-canvas');
    renderer = new CanvasRenderer(canvas);

    // Create visual components
    const character = new CharacterSprite();
    const pitchMeter = new PitchMeter();
    const particleSystem = new ParticleSystem();

    renderer.setComponents({ character, pitchMeter, particleSystem });

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
