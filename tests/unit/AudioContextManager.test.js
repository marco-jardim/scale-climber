import {
  describe, it, expect, beforeEach, afterEach, vi,
} from 'vitest';
import AudioContextManager from '../../src/audio/AudioContextManager.js';

describe('AudioContextManager', () => {
  let manager;

  beforeEach(() => {
    // Clear singleton instance before each test
    AudioContextManager.instance = null;
    manager = new AudioContextManager();
  });

  afterEach(async () => {
    if (manager && manager.isInitialized) {
      await manager.destroy();
    }
    AudioContextManager.instance = null;
  });

  describe('Singleton Pattern', () => {
    it('should enforce singleton pattern', () => {
      const instance1 = new AudioContextManager();
      const instance2 = new AudioContextManager();
      expect(instance1).toBe(instance2);
    });

    it('should return same instance via getInstance', () => {
      const instance1 = AudioContextManager.getInstance();
      const instance2 = AudioContextManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully with mock audio', async () => {
      const result = await manager.initialize();

      expect(result.success).toBe(true);
      expect(result.sampleRate).toBe(44100);
      expect(manager.isInitialized).toBe(true);
      expect(manager.context).toBeDefined();
      expect(manager.analyser).toBeDefined();
    });

    it('should return error when getUserMedia fails (permission denied)', async () => {
      // Mock permission denied error
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = vi.fn(() => {
        const error = new Error('Permission denied');
        error.name = 'NotAllowedError';
        return Promise.reject(error);
      });

      const result = await manager.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBe('PERMISSION_DENIED');

      // Restore
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    });

    it('should return error when no microphone found', async () => {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = vi.fn(() => {
        const error = new Error('No devices found');
        error.name = 'NotFoundError';
        return Promise.reject(error);
      });

      const result = await manager.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_MICROPHONE');

      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    });

    it('should return error when Web Audio API not supported', async () => {
      // Temporarily remove AudioContext
      const originalAudioContext = window.AudioContext;
      const originalWebkitAudioContext = window.webkitAudioContext;
      delete window.AudioContext;
      delete window.webkitAudioContext;

      const newManager = new AudioContextManager();
      const result = await newManager.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBe('WEB_AUDIO_UNSUPPORTED');

      // Restore
      window.AudioContext = originalAudioContext;
      window.webkitAudioContext = originalWebkitAudioContext;
    });
  });

  describe('Audio Data', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should return audio data from analyser', () => {
      const data = manager.getAudioData();

      expect(data).toBeInstanceOf(Float32Array);
      expect(data.length).toBe(manager.analyser.fftSize);
    });

    it('should return empty array if not initialized', () => {
      const uninitializedManager = new AudioContextManager();
      AudioContextManager.instance = null; // Reset singleton for this test

      const data = uninitializedManager.getAudioData();

      expect(data).toBeInstanceOf(Float32Array);
      expect(data.length).toBe(0);
    });

    it('should calculate volume level (RMS)', () => {
      const volume = manager.getVolumeLevel();

      expect(volume).toBeGreaterThanOrEqual(0);
      expect(volume).toBeLessThanOrEqual(1);
      expect(typeof volume).toBe('number');
    });
  });

  describe('State Management', () => {
    it('should return not-initialized state before init', () => {
      expect(manager.getState()).toBe('not-initialized');
    });

    it('should return running state after init', async () => {
      await manager.initialize();
      expect(manager.getState()).toBe('running');
    });

    it('should resume suspended AudioContext', async () => {
      await manager.initialize();

      // Simulate suspended state
      vi.spyOn(manager.context, 'resume').mockResolvedValue();
      Object.defineProperty(manager.context, 'state', {
        get: vi.fn()
          .mockReturnValueOnce('suspended')
          .mockReturnValue('running'),
        configurable: true,
      });

      const result = await manager.resume();

      expect(result).toBe(true);
      expect(manager.context.resume).toHaveBeenCalled();
    });
  });

  describe('Reference Tones', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should play reference tone at 440Hz', async () => {
      // This will create an oscillator and play it
      const promise = manager.playReferenceTone(440, 0.1);

      expect(promise).toBeInstanceOf(Promise);
      await promise;
      // If no error thrown, test passes
    });

    it('should throw error if not initialized', async () => {
      const uninitializedManager = new AudioContextManager();
      AudioContextManager.instance = null;

      await expect(
        uninitializedManager.playReferenceTone(440),
      ).rejects.toThrow('AudioContext not initialized');
    });
  });

  describe('Event System', () => {
    it('should register and emit events', () => {
      const callback = vi.fn();
      manager.on('test-event', callback);

      manager.emit('test-event', { data: 'test' });

      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should remove event listeners', () => {
      const callback = vi.fn();
      manager.on('test-event', callback);
      manager.off('test-event', callback);

      manager.emit('test-event', { data: 'test' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.on('test-event', callback1);
      manager.on('test-event', callback2);

      manager.emit('test-event', { data: 'test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should not throw if emitting event with no listeners', () => {
      expect(() => {
        manager.emit('non-existent-event', {});
      }).not.toThrow();
    });
  });

  describe('Error Categorization', () => {
    it('should categorize permission denied error', () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';

      const errorType = manager.categorizeError(error);
      expect(errorType).toBe('PERMISSION_DENIED');
    });

    it('should categorize no microphone error', () => {
      const error = new Error('No devices');
      error.name = 'NotFoundError';

      const errorType = manager.categorizeError(error);
      expect(errorType).toBe('NO_MICROPHONE');
    });

    it('should categorize device in use error', () => {
      const error = new Error('Device busy');
      error.name = 'NotReadableError';

      const errorType = manager.categorizeError(error);
      expect(errorType).toBe('DEVICE_IN_USE');
    });

    it('should return unknown error for uncategorized errors', () => {
      const error = new Error('Something went wrong');
      error.name = 'RandomError';

      const errorType = manager.categorizeError(error);
      expect(errorType).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Cleanup', () => {
    it('should clean up all resources on destroy', async () => {
      await manager.initialize();

      const { stream } = manager;
      const stopSpy = vi.spyOn(stream.getTracks()[0], 'stop');

      await manager.destroy();

      expect(stopSpy).toHaveBeenCalled();
      expect(manager.stream).toBeNull();
      expect(manager.context).toBeNull();
      expect(manager.isInitialized).toBe(false);
      expect(AudioContextManager.instance).toBeNull();
    });

    it('should handle destroy when not initialized', async () => {
      // Should not throw
      await expect(manager.destroy()).resolves.not.toThrow();
    });
  });

  describe('Sample Rate', () => {
    it('should return 0 if not initialized', () => {
      expect(manager.getSampleRate()).toBe(0);
    });

    it('should return sample rate after initialization', async () => {
      await manager.initialize();
      expect(manager.getSampleRate()).toBe(44100);
    });
  });
});
