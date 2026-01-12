/**
 * Scale Climber - Main Entry Point
 * Initializes the application and manages screen navigation
 */

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

// Button event listeners
document.getElementById('start-button')?.addEventListener('click', () => {
  console.log('Start button clicked');
  showScreen('calibration');
  // TODO: Start calibration process
});

document.getElementById('practice-button')?.addEventListener('click', () => {
  console.log('Practice button clicked');
  // TODO: Start practice mode
});

document.getElementById('settings-button')?.addEventListener('click', () => {
  console.log('Settings button clicked');
  // TODO: Show settings modal
});

document.getElementById('play-again-button')?.addEventListener('click', () => {
  console.log('Play again button clicked');
  showScreen('calibration');
  // TODO: Restart game
});

document.getElementById('menu-button')?.addEventListener('click', () => {
  console.log('Menu button clicked');
  showScreen('start');
});

document.getElementById('error-menu-button')?.addEventListener('click', () => {
  console.log('Error menu button clicked');
  showScreen('start');
});

document.getElementById('retry-button')?.addEventListener('click', () => {
  console.log('Retry button clicked');
  showScreen('start');
});

document.getElementById('pause-button')?.addEventListener('click', () => {
  console.log('Pause button clicked');
  // TODO: Pause game
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

    // TODO: Load assets
    // TODO: Initialize audio system
    // TODO: Initialize game engine
    // TODO: Initialize renderer

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
