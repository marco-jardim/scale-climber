// Vitest setup file for global test configuration
import { beforeAll, afterEach, vi } from 'vitest';

// Mock Web Audio API for testing
beforeAll(() => {
  global.AudioContext = vi.fn(() => ({
    createAnalyser: vi.fn(() => ({
      fftSize: 2048,
      frequencyBinCount: 1024,
      getByteTimeDomainData: vi.fn(),
      getFloatTimeDomainData: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
    })),
    createMediaStreamSource: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createOscillator: vi.fn(() => ({
      frequency: { value: 440 },
      type: 'sine',
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    sampleRate: 44100,
    state: 'running',
    resume: vi.fn(),
    close: vi.fn(),
  }));

  // Mock getUserMedia
  global.navigator.mediaDevices = {
    getUserMedia: vi.fn(() => Promise.resolve({
      id: 'test-stream',
      active: true,
      getTracks: () => [{
        kind: 'audio',
        enabled: true,
        stop: vi.fn(),
      }],
    })),
  };

  // Mock localStorage with actual storage implementation
  const localStorageData = {};
  global.localStorage = {
    getItem: vi.fn((key) => localStorageData[key] || null),
    setItem: vi.fn((key, value) => { localStorageData[key] = String(value); }),
    removeItem: vi.fn((key) => { delete localStorageData[key]; }),
    clear: vi.fn(() => { Object.keys(localStorageData).forEach(key => delete localStorageData[key]); }),
    get length() { return Object.keys(localStorageData).length; },
    key: vi.fn((index) => Object.keys(localStorageData)[index] || null),
  };

  // Mock sessionStorage with actual storage implementation
  const sessionStorageData = {};
  global.sessionStorage = {
    getItem: vi.fn((key) => sessionStorageData[key] || null),
    setItem: vi.fn((key, value) => { sessionStorageData[key] = String(value); }),
    removeItem: vi.fn((key) => { delete sessionStorageData[key]; }),
    clear: vi.fn(() => { Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key]); }),
    get length() { return Object.keys(sessionStorageData).length; },
    key: vi.fn((index) => Object.keys(sessionStorageData)[index] || null),
  };
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
