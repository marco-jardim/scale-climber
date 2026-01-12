/**
 * AudioFeedback
 * Sound effects system for game events
 * Supports Opus format for minimal file size
 */

class AudioFeedback {
  constructor() {
    this.sounds = new Map();
    this.volume = 0.7;
    this.muted = false;
    this.loadingPromises = [];

    this.loadSounds();
  }

  /**
   * Load all sound effects
   * @returns {Promise} Resolves when all sounds loaded
   */
  async loadSounds() {
    const soundFiles = {
      perfect: '/assets/sounds/perfect.opus',
      great: '/assets/sounds/great.opus',
      ok: '/assets/sounds/ok.opus',
      miss: '/assets/sounds/miss.opus',
      combo: '/assets/sounds/combo.opus',
      victory: '/assets/sounds/victory.opus',
      failure: '/assets/sounds/failure.opus',
      click: '/assets/sounds/click.opus',
    };

    // Fallback to silent audio if files don't exist
    const fallbackSoundFiles = {
      perfect: this.createSilentAudio(),
      great: this.createSilentAudio(),
      ok: this.createSilentAudio(),
      miss: this.createSilentAudio(),
      combo: this.createSilentAudio(),
      victory: this.createSilentAudio(),
      failure: this.createSilentAudio(),
      click: this.createSilentAudio(),
    };

    for (const [key, path] of Object.entries(soundFiles)) {
      const promise = this.loadSound(key, path, fallbackSoundFiles[key]);
      this.loadingPromises.push(promise);
    }

    return Promise.all(this.loadingPromises);
  }

  /**
   * Load a single sound file
   * @param {string} key - Sound identifier
   * @param {string} path - Path to sound file
   * @param {Audio} fallback - Fallback audio if load fails
   * @returns {Promise} Resolves when sound loaded
   */
  async loadSound(key, path, fallback) {
    try {
      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';

      // Return promise that resolves when audio can play
      return new Promise((resolve) => {
        audio.addEventListener('canplaythrough', () => {
          this.sounds.set(key, audio);
          resolve();
        });

        audio.addEventListener('error', () => {
          // eslint-disable-next-line no-console
          console.warn(`Failed to load sound: ${key}, using silent fallback`);
          this.sounds.set(key, fallback);
          resolve();
        });

        audio.src = path;
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to load sound: ${key}`, err);
      this.sounds.set(key, fallback);
      return Promise.resolve();
    }
  }

  /**
   * Create silent audio element as fallback
   * @returns {Audio} Silent audio element
   */
  createSilentAudio() {
    const audio = new Audio();
    // Data URL for silent audio (1 second of silence, WAV format)
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    audio.volume = 0;
    return audio;
  }

  /**
   * Play a sound effect
   * @param {string} soundName - Name of sound to play
   * @param {number} volumeMultiplier - Volume multiplier (0-1)
   */
  play(soundName, volumeMultiplier = 1.0) {
    if (this.muted) return;

    const audio = this.sounds.get(soundName);
    if (!audio) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      // Clone audio to allow overlapping sounds
      const instance = audio.cloneNode();
      instance.volume = this.volume * volumeMultiplier;

      instance.play().catch((err) => {
        // Silently fail if autoplay blocked or audio errors
        // eslint-disable-next-line no-console
        console.debug('Failed to play sound:', err);
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.debug('Error playing sound:', err);
    }
  }

  /**
   * Play sound for note result
   * @param {string} result - 'PERFECT' | 'GREAT' | 'OK' | 'MISS'
   */
  playNoteResult(result) {
    const soundMap = {
      PERFECT: 'perfect',
      GREAT: 'great',
      OK: 'ok',
      MISS: 'miss',
    };

    const soundName = soundMap[result];
    if (soundName) {
      this.play(soundName);
    }
  }

  /**
   * Play combo milestone sound
   * @param {number} combo - Combo count
   */
  playCombo(combo) {
    // Play combo sound at milestones (5, 10, 15, 20...)
    if (combo > 0 && combo % 5 === 0) {
      this.play('combo', 0.8);
    }
  }

  /**
   * Play UI click sound
   */
  playClick() {
    this.play('click', 0.5);
  }

  /**
   * Play victory sound
   */
  playVictory() {
    this.play('victory', 0.9);
  }

  /**
   * Play failure sound
   */
  playFailure() {
    this.play('failure', 0.9);
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update volume of all loaded sounds
    for (const audio of this.sounds.values()) {
      audio.volume = this.volume;
    }
  }

  /**
   * Get current volume
   * @returns {number} Current volume (0-1)
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Set muted state
   * @param {boolean} muted - True to mute
   */
  setMuted(muted) {
    this.muted = muted;
  }

  /**
   * Toggle mute
   * @returns {boolean} New muted state
   */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Check if muted
   * @returns {boolean} True if muted
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Stop all playing sounds
   */
  stopAll() {
    for (const audio of this.sounds.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Wait for all sounds to load
   * @returns {Promise} Resolves when all sounds loaded
   */
  async waitForLoad() {
    return Promise.all(this.loadingPromises);
  }
}

export default AudioFeedback;
