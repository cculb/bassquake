import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Web Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { value: 1 }
  }),
  createOscillator: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440 }
  }),
  createAnalyser: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn(),
    frequencyBinCount: 1024
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
    type: 'lowpass'
  })
}))

// Mock MediaDevices for webcam
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([{
        stop: vi.fn()
      }])
    })
  },
  writable: true
})

// Mock Tone.js - Create comprehensive mock
const mockToneJS = {
  start: vi.fn().mockResolvedValue(undefined),
  Transport: {
    bpm: { value: 120 },
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    loop: false,
    loopEnd: '1m',
    position: 0,
    schedule: vi.fn()
  },
  Gain: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    toDestination: vi.fn().mockReturnThis(),
    dispose: vi.fn()
  })),
  MembraneSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -6 }
  })),
  NoiseSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -8 }
  })),
  MetalSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -12 }
  })),
  MonoSynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: -4 }
  })),
  PolySynth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    dispose: vi.fn()
  })),
  Synth: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn()
  })),
  Filter: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    frequency: { rampTo: vi.fn() }
  })),
  LFO: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    start: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    frequency: { value: '8n' },
    amplitude: { value: 0.7 }
  })),
  Analyser: vi.fn().mockImplementation(() => ({
    getValue: vi.fn().mockReturnValue(new Float32Array(512)),
    dispose: vi.fn()
  })),
  Reverb: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn()
  })),
  FeedbackDelay: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    wet: { value: 0.1 }
  })),
  Distortion: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn()
  })),
  Chorus: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn()
  })),
  PingPongDelay: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockReturnThis(),
    dispose: vi.fn()
  })),
  Pattern: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockReturnThis(),
    dispose: vi.fn(),
    interval: '16n'
  })),
  Draw: {
    schedule: vi.fn()
  }
}

// Mock both default and named exports
vi.mock('tone', () => ({
  default: mockToneJS,
  ...mockToneJS
}))

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
      data: new Uint8ClampedArray(4)
    }),
    putImageData: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn()
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn()
    })
  }),
  width: 800,
  height: 400,
  offsetWidth: 800,
  offsetHeight: 400
}

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Mock HTMLMediaElement methods
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  value: vi.fn(),
  writable: true
})

// Clean up after each test
afterEach(() => {
  cleanup()
})