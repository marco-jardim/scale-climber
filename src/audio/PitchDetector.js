/**
 * PitchDetector
 * Manages Web Worker for YIN algorithm pitch detection
 * Provides simple interface for detecting pitch from audio input
 */

import { getNoteInfo } from './NoteMapper.js';

class PitchDetector {
  constructor(audioContextManager) {
    this.audioContextManager = audioContextManager;
    this.worker = null;
    this.isInitialized = false;
    this.messageId = 0;
    this.pendingRequests = new Map();
    this.lastResult = null;
  }

  /**
   * Initialize the Web Worker
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      try {
        // eslint-disable-next-line no-console
        console.log('Initializing PitchDetector worker...');

        // Create Web Worker
        this.worker = new Worker(
          new URL('./PitchDetector.worker.js', import.meta.url),
          { type: 'module' },
        );

        // Handle worker messages
        this.worker.onmessage = (e) => {
          this.handleWorkerMessage(e.data);
        };

        // Handle worker errors
        this.worker.onerror = (error) => {
          console.error('PitchDetector Worker Error:', error);
          reject(new Error(`Worker error: ${error.message}`));
        };

        // Initialize worker with sample rate
        const sampleRate = this.audioContextManager.getSampleRate();
        // eslint-disable-next-line no-console
        console.log('Sending init message to worker, sampleRate:', sampleRate);

        this.worker.postMessage({
          type: 'init',
          data: {
            sampleRate,
            bufferSize: 1024,
            yinThreshold: 0.15,
          },
        });

        // Wait for initialization confirmation
        const checkInit = (e) => {
          // eslint-disable-next-line no-console
          console.log('Worker message received:', e.data);
          if (e.data.type === 'initialized') {
            // eslint-disable-next-line no-console
            console.log('Worker initialized successfully');
            this.isInitialized = true;
            this.worker.removeEventListener('message', checkInit);
            resolve();
          }
        };

        this.worker.addEventListener('message', checkInit);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.isInitialized) {
            reject(new Error('Worker initialization timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle messages from Web Worker
   * @param {{type: string, id?: number, data: *}} message
   */
  handleWorkerMessage(message) {
    const { type, id, data } = message;

    switch (type) {
      case 'result':
        if (this.pendingRequests.has(id)) {
          const { resolve } = this.pendingRequests.get(id);
          this.pendingRequests.delete(id);

          // Add note information if frequency detected
          let result = data;
          if (data.frequency) {
            const noteInfo = getNoteInfo(data.frequency);
            result = {
              ...data,
              ...noteInfo,
            };
          } else {
            result = {
              ...data,
              note: null,
              cents: 0,
              targetFrequency: 0,
              midi: 0,
            };
          }

          this.lastResult = result;
          resolve(result);
        }
        break;

      case 'initialized':
      case 'config-updated':
        // Handled elsewhere or ignored
        break;

      default:
        console.warn(`Unknown worker message type: ${type}`);
    }
  }

  /**
   * Detect pitch from current audio input
   * @returns {Promise<{
   *   frequency: number|null,
   *   note: string|null,
   *   cents: number,
   *   confidence: number,
   *   clarity: number,
   *   volume: number,
   *   targetFrequency: number,
   *   midi: number
   * }>}
   */
  async detect() {
    if (!this.isInitialized) {
      throw new Error('PitchDetector not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      try {
        // Get audio data from AudioContext
        const audioData = this.audioContextManager.getAudioData();

        if (audioData.length === 0) {
          resolve({
            frequency: null,
            note: null,
            cents: 0,
            confidence: 0,
            clarity: 0,
            volume: 0,
            targetFrequency: 0,
            midi: 0,
          });
          return;
        }

        // Generate unique message ID
        const id = this.messageId++;

        // Store pending request
        this.pendingRequests.set(id, { resolve, reject });

        // Create a copy of the buffer for transfer
        const bufferCopy = new Float32Array(audioData);

        // Send to worker with Transferable Object (zero-copy transfer)
        this.worker.postMessage(
          {
            type: 'process',
            id,
            data: {
              buffer: bufferCopy,
            },
          },
          [bufferCopy.buffer], // Transfer ownership of ArrayBuffer
        );

        // Timeout after 1 second
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error('Pitch detection timeout'));
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get last detection result without triggering new detection
   * @returns {object|null}
   */
  getLastResult() {
    return this.lastResult;
  }

  /**
   * Update YIN algorithm configuration
   * @param {{sampleRate?: number, bufferSize?: number, yinThreshold?: number}} config
   */
  updateConfig(config) {
    if (!this.worker) return;

    this.worker.postMessage({
      type: 'update-config',
      data: config,
    });
  }

  /**
   * Check if detector is ready
   * @returns {boolean}
   */
  isReady() {
    return this.isInitialized && this.worker !== null;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.pendingRequests.clear();
    this.isInitialized = false;
    this.lastResult = null;
  }
}

export default PitchDetector;
