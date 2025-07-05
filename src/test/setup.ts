import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Environment detection
const isDockerOrCI = !!(
  process.env.CI ||
  process.env.DOCKER ||
  process.env.VITEST_WORKER_ID ||
  process.env.NODE_ENV === 'test'
);

// Enhanced timing for Docker environment
const DOCKER_TIMEOUT_MULTIPLIER = isDockerOrCI ? 3 : 1;

// Helper to simulate async operations in Docker
const simulateAsyncOperation = (delay = 50) => {
  return new Promise(resolve => setTimeout(resolve, delay * DOCKER_TIMEOUT_MULTIPLIER));
};

// Mock Web Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { value: 1 },
  }),
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440 },
  }),
  createAnalyser: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn(),
    frequencyBinCount: 1024,
  }),
  destination: {},
  sampleRate: 44100,
  currentTime: 0,
  close: vi.fn(),
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  createBiquadFilter: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    frequency: { value: 350 },
    Q: { value: 1 },
    type: 'lowpass',
  }),
}));

// Mock MediaDevices for webcam
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([
        {
          stop: vi.fn(),
        },
      ]),
    }),
  },
  writable: true,
});

// Enhanced Transport mock with realistic timing behavior
let transportState = 'stopped';
let transportCallbacks: Array<{ callback: Function; time: number }> = [];
let transportInterval: ReturnType<typeof setInterval> | null = null;

const mockTransport = {
  bpm: { value: 120 },
  start: vi.fn().mockImplementation(async () => {
    transportState = 'started';
    // Simulate transport starting with proper timing - longer delay in Docker
    await simulateAsyncOperation(isDockerOrCI ? 150 : 50);
    
    // Start the transport loop simulation
    if (transportInterval) clearInterval(transportInterval);
    transportInterval = setInterval(() => {
      transportCallbacks.forEach(({ callback, time }) => {
        try {
          callback(time);
        } catch {
          // Silent error handling for test environment
        }
      });
    }, 100 / DOCKER_TIMEOUT_MULTIPLIER); // Simulate regular callbacks
    
    return Promise.resolve();
  }),
  stop: vi.fn().mockImplementation(async () => {
    transportState = 'stopped';
    if (transportInterval) {
      clearInterval(transportInterval);
      transportInterval = null;
    }
    await simulateAsyncOperation(10);
    return Promise.resolve();
  }),
  cancel: vi.fn().mockImplementation(() => {
    transportCallbacks = [];
    if (transportInterval) {
      clearInterval(transportInterval);
      transportInterval = null;
    }
  }),
  loop: false,
  loopEnd: '1m',
  position: 0,
  schedule: vi.fn().mockImplementation((callback: Function, time: number) => {
    transportCallbacks.push({ callback, time });
  }),
  state: transportState,
};

// Mock Tone.js - Create comprehensive mock
const mockToneJS = {
  start: vi.fn().mockImplementation(async () => {
    // Simulate Tone.js audio context initialization
    await simulateAsyncOperation(isDockerOrCI ? 100 : 20);
    return Promise.resolve();
  }),
  Transport: mockTransport,
  Gain: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    toDestination: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  })),
  MembraneSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -6 },
  })),
  NoiseSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -8 },
  })),
  MetalSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -12 },
  })),
  MonoSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -4 },
  })),
  PolySynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    dispose: vi.fn(),
  })),
  Synth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
  })),
  Filter: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    frequency: { rampTo: vi.fn() },
  })),
  LFO: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    start: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    frequency: { value: '8n' },
    amplitude: { value: 0.7 },
  })),
  Analyser: vi.fn().mockImplementation(() => ({
    getValue: vi.fn().mockReturnValue(new Float32Array(512)),
    dispose: vi.fn(),
  })),
  Reverb: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  })),
  FeedbackDelay: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    wet: { value: 0.1 },
  })),
  Distortion: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  })),
  Chorus: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  })),
  PingPongDelay: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
  })),
  Pattern: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    interval: '16n',
  })),
  Draw: {
    schedule: vi.fn(),
  },
};

// Mock both default and named exports
vi.mock('tone', () => ({
  default: mockToneJS,
  ...mockToneJS,
}));

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn().mockReturnValue({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
    }),
    putImageData: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  }),
  width: 800,
  height: 400,
  offsetWidth: 800,
  offsetHeight: 400,
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(cb => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  value: vi.fn(),
  writable: true,
});

// Clean up after each test
afterEach(() => {
  cleanup();
  // Clean up transport simulation
  if (transportInterval) {
    clearInterval(transportInterval);
    transportInterval = null;
  }
  transportCallbacks = [];
  transportState = 'stopped';
});

// Export environment helpers for use in tests
export { isDockerOrCI, DOCKER_TIMEOUT_MULTIPLIER, simulateAsyncOperation };
