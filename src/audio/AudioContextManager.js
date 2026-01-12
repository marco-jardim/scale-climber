/**
 * AudioContextManager
 * Manages AudioContext lifecycle and handles browser compatibility issues.
 * Singleton pattern ensures only one AudioContext instance exists.
 */

class AudioContextManager {
  constructor() {
    // Enforce singleton pattern
    if (AudioContextManager.instance) {
      return AudioContextManager.instance;
    }

    this.context = null;
    this.stream = null;
    this.analyser = null;
    this.source = null;
    this.gainNode = null;
    this.isInitialized = false;
    this.listeners = new Map();
    this.deviceChangeListener = null;

    AudioContextManager.instance = this;
  }

  /**
   * Initialize AudioContext and request microphone permission
   * @returns {Promise<{success: boolean, sampleRate?: number, error?: string}>}
   */
  async initialize() {
    try {
      // Check for Web Audio API support
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return { success: false, error: 'WEB_AUDIO_UNSUPPORTED' };
      }

      // Create AudioContext
      this.context = new AudioContext();

      // Handle iOS Safari autoplay policy
      if (this.context.state === 'suspended') {
        // Will be resumed on user gesture
        console.warn('AudioContext suspended. Waiting for user gesture to resume.');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: { ideal: 44100 },
          channelCount: 1,
        },
      });

      this.stream = stream;

      // Setup audio processing chain
      this.source = this.context.createMediaStreamSource(stream);

      // Create analyser node for frequency analysis
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0;

      // Create gain node for volume control
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = 1.0;

      // Connect audio graph: source → gain → analyser
      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      // Note: We don't connect to destination to avoid feedback

      // Monitor device disconnect
      this.setupDeviceChangeMonitoring();

      this.isInitialized = true;

      return {
        success: true,
        sampleRate: this.context.sampleRate,
      };
    } catch (error) {
      const errorType = this.categorizeError(error);
      return {
        success: false,
        error: errorType,
      };
    }
  }

  /**
   * Resume AudioContext (required for iOS Safari after user gesture)
   * @returns {Promise<boolean>}
   */
  async resume() {
    if (!this.context) {
      return false;
    }

    if (this.context.state === 'suspended') {
      try {
        await this.context.resume();
        return this.context.state === 'running';
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        return false;
      }
    }

    return this.context.state === 'running';
  }

  /**
   * Get current audio data from analyser
   * @returns {Float32Array} Audio time-domain data
   */
  getAudioData() {
    // Check if this instance is still the active singleton
    // This handles test cases where the singleton is cleared after initialization
    if (!this.analyser || !this.isInitialized || AudioContextManager.instance !== this) {
      return new Float32Array(0);
    }

    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);

    return dataArray;
  }

  /**
   * Get volume level (RMS)
   * @returns {number} Volume level between 0 and 1
   */
  getVolumeLevel() {
    const dataArray = this.getAudioData();

    if (dataArray.length === 0) {
      return 0;
    }

    // Calculate RMS (Root Mean Square)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    return Math.min(rms * 10, 1.0); // Scale and clamp to [0, 1]
  }

  /**
   * Setup device change monitoring
   */
  setupDeviceChangeMonitoring() {
    if (!this.stream) return;

    // Monitor stream track endings
    const tracks = this.stream.getTracks();
    tracks.forEach((track) => {
      track.addEventListener('ended', () => {
        this.emit('device-disconnected', { deviceId: track.id });
      });
    });

    // Monitor device changes (additions/removals)
    this.deviceChangeListener = () => {
      this.emit('device-changed');
    };

    navigator.mediaDevices.addEventListener(
      'devicechange',
      this.deviceChangeListener,
    );
  }

  /**
   * Categorize microphone errors
   * @param {Error} error
   * @returns {string} Error type
   */
  categorizeError(error) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return 'NO_MEDIA_DEVICES';
    }

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'PERMISSION_DENIED';
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'NO_MICROPHONE';
    }

    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'DEVICE_IN_USE';
    }

    if (error.name === 'OverconstrainedError') {
      return 'CONSTRAINTS_NOT_SATISFIED';
    }

    if (error.name === 'TypeError') {
      return 'TYPE_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Get AudioContext state
   * @returns {string} 'suspended' | 'running' | 'closed' | 'not-initialized'
   */
  getState() {
    if (!this.context) {
      return 'not-initialized';
    }
    return this.context.state;
  }

  /**
   * Get sample rate
   * @returns {number} Sample rate in Hz
   */
  getSampleRate() {
    return this.context ? this.context.sampleRate : 0;
  }

  /**
   * Create an oscillator for reference tones
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @returns {Promise<void>}
   */
  async playReferenceTone(frequency, duration = 1.0) {
    // Check if this instance is still the active singleton
    // This handles test cases where the singleton is cleared after initialization
    if (!this.context || AudioContextManager.instance !== this) {
      throw new Error('AudioContext not initialized');
    }

    // Resume context if suspended
    await this.resume();

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Fade in/out to avoid clicks
    const now = this.context.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.3, now + duration - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

    return new Promise((resolve) => {
      oscillator.onended = resolve;
    });
  }

  /**
   * Event emitter - register listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Event emitter - remove listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Event emitter - emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    const callbacks = this.listeners.get(event);
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Clean up resources
   */
  async destroy() {
    // Remove device change listener
    if (this.deviceChangeListener) {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        this.deviceChangeListener,
      );
      this.deviceChangeListener = null;
    }

    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Disconnect audio nodes
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.analyser) {
      this.analyser = null;
    }

    // Close AudioContext
    if (this.context && this.context.state !== 'closed') {
      await this.context.close();
      this.context = null;
    }

    this.isInitialized = false;
    this.listeners.clear();

    // Clear singleton instance
    AudioContextManager.instance = null;
  }

  /**
   * Get singleton instance
   * @returns {AudioContextManager}
   */
  static getInstance() {
    if (!AudioContextManager.instance) {
      return new AudioContextManager();
    }
    return AudioContextManager.instance;
  }
}

export default AudioContextManager;
