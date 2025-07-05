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

// Mock Tone.js
vi.mock('tone', () => ({
  default: {
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
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Clean up after each test
afterEach(() => {
  cleanup()
})