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

  // Mock localStorage
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  // Mock sessionStorage
  global.sessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
