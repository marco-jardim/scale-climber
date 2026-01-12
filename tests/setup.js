// Vitest setup file for global test configuration
import { beforeAll, afterEach, vi } from 'vitest';

// Mock Web Audio API for testing
beforeAll(() => {
  // Create a mock AudioContext constructor that works with 'new'
  const MockAudioContext = class {
    constructor() {
      this.sampleRate = 44100;
      this.state = 'running';
      this.currentTime = 0;

      this.createAnalyser = vi.fn(() => ({
        fftSize: 2048,
        frequencyBinCount: 1024,
        smoothingTimeConstant: 0,
        getByteTimeDomainData: vi.fn(),
        getFloatTimeDomainData: vi.fn((array) => {
          // Fill array with mock audio waveform data
          for (let i = 0; i < array.length; i++) {
            // eslint-disable-next-line no-param-reassign
            array[i] = Math.sin(i * 0.1) * 0.5;
          }
        }),
        connect: vi.fn(),
        disconnect: vi.fn(),
      }));

      this.createGain = vi.fn(() => ({
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      }));

      this.createMediaStreamSource = vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
      }));

      this.createOscillator = vi.fn(() => {
        const osc = {
          frequency: {
            value: 440,
            setValueAtTime: vi.fn(),
          },
          type: 'sine',
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          disconnect: vi.fn(),
          onended: null,
        };

        // Simulate onended callback after stop is called
        osc.stop = vi.fn(() => {
          setTimeout(() => {
            if (osc.onended) osc.onended();
          }, 0);
        });

        return osc;
      });

      this.destination = {};
      this.resume = vi.fn(() => Promise.resolve());
      this.close = vi.fn(() => Promise.resolve());
    }
  };

  // Set on both global and globalThis to ensure compatibility
  globalThis.AudioContext = MockAudioContext;
  globalThis.webkitAudioContext = MockAudioContext;

  if (typeof window !== 'undefined') {
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = MockAudioContext;
  }

  // Mock getUserMedia
  const mockMediaDevices = {
    getUserMedia: vi.fn(() => {
      // Create tracks array once so getTracks() returns same reference
      const tracks = [{
        id: 'track-1',
        kind: 'audio',
        enabled: true,
        stop: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }];

      return Promise.resolve({
        id: 'test-stream',
        active: true,
        getTracks: () => tracks,
      });
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  if (typeof navigator !== 'undefined') {
    navigator.mediaDevices = mockMediaDevices;
  }

  globalThis.navigator = globalThis.navigator || {};
  globalThis.navigator.mediaDevices = mockMediaDevices;

  // Mock localStorage with actual storage implementation
  const localStorageData = {};
  global.localStorage = {
    getItem: vi.fn((key) => localStorageData[key] || null),
    setItem: vi.fn((key, value) => { localStorageData[key] = String(value); }),
    removeItem: vi.fn((key) => { delete localStorageData[key]; }),
    clear: vi.fn(() => {
      Object.keys(localStorageData).forEach((key) => delete localStorageData[key]);
    }),
    get length() { return Object.keys(localStorageData).length; },
    key: vi.fn((index) => Object.keys(localStorageData)[index] || null),
  };

  // Mock sessionStorage with actual storage implementation
  const sessionStorageData = {};
  global.sessionStorage = {
    getItem: vi.fn((key) => sessionStorageData[key] || null),
    setItem: vi.fn((key, value) => { sessionStorageData[key] = String(value); }),
    removeItem: vi.fn((key) => { delete sessionStorageData[key]; }),
    clear: vi.fn(() => {
      Object.keys(sessionStorageData).forEach((key) => delete sessionStorageData[key]);
    }),
    get length() { return Object.keys(sessionStorageData).length; },
    key: vi.fn((index) => Object.keys(sessionStorageData)[index] || null),
  };
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
