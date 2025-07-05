# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project: BASSQUAKE - Seismic Dubstep Sequencer

A modern, web-based music production tool that combines a drum sequencer,
dubstep bass synthesizer, and motion-controlled effects into a futuristic
interface. Built with React and Tone.js.

## Development Commands

### Primary Commands

- `npm run dev` - Start development server (Vite) on http://localhost:3000
- `npm run build` - Build for production (TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm test` - Run tests with Vitest
- `npm run lint` - Lint code with ESLint
- `npm run type-check` - Check TypeScript types

### Testing Commands

- `npm run test:ui` - Run tests with Vitest UI dashboard
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Mobile Development

- `npm run build:mobile` - Build and sync for mobile (Capacitor)
- `npm run cap:add:ios` - Add iOS platform
- `npm run cap:add:android` - Add Android platform
- `npm run cap:sync` - Sync web assets to native platforms
- `npm run cap:open:ios` - Open in Xcode
- `npm run cap:open:android` - Open in Android Studio

### PWA Commands

- `npm run pwa:generate-assets` - Generate PWA icons and splash screens
- `npm run deploy:pwa` - Build and preview PWA deployment

## Architecture

### Core Technologies

- **React** - Frontend framework with hooks for state management
- **Tone.js** - Web Audio API abstraction for audio engine
- **Webcam Motion Control** - Real-time motion detection for parameter
  modulation

### Audio Engine Structure

- **Drum Synthesizers**:
  - MembraneSynth (kick)
  - NoiseSynth (snare)
  - MetalSynth (hi-hat)
- **Bass Synthesizer**: MonoSynth with sawtooth oscillator and LFO wobble
- **Melodic Synthesizer**: PolySynth for keyboard input
- **Effects Chain**: Reverb, delay, distortion, chorus, and filtering

### Key Components

- **16-step Sequencer**: 3 drum tracks + bass track with visual beat indicators
- **Beat Generation System**: 4 hip-hop/electronic styles (Boom Bap, Trap,
  Bounce, Drill)
- **Dubstep Bass Features**: 8 bass notes with wobble LFO controls
- **Arpeggiator**: Multiple modes (Up, Down, Up/Down, Random) with speed control
- **Motion Control**: Webcam-based filter frequency modulation (200Hz - 3200Hz)
- **Visual Scope**: Waveform and spectrum analyzer with gradient effects

### Project Structure

```
src/
├── components/          # React components
│   ├── MusicTracker.tsx # Main sequencer component
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
├── hooks/              # Custom React hooks (future)
├── utils/              # Utility functions (future)
├── types/              # TypeScript type definitions (future)
├── audio/              # Audio-related modules (future)
├── assets/             # Static assets
└── test/               # Test files and setup
    ├── setup.ts        # Vitest configuration
    ├── App.test.tsx
    ├── MusicTracker.test.tsx
    ├── LoadingSpinner.test.tsx
    ├── ErrorBoundary.test.tsx
    └── audio.test.ts
```

### State Management

- React hooks for UI state
- Refs for audio objects and animation frames
- Pattern arrays for sequencer data
- Error boundaries for graceful error handling

### Visual Design

- Futuristic cyberpunk aesthetic with neon colors (cyan, pink, purple)
- Glassmorphism panels with backdrop blur
- Gradient text and glowing effects
- TailwindCSS 4.x for modern styling
- Custom CSS animations and keyframes

### Testing Strategy

- Vitest 3.2.4 for fast testing
- React Testing Library for component testing
- Comprehensive mocks for Web Audio API and Tone.js
- Coverage reporting and UI dashboard
- Error boundary testing for crash scenarios

## Development Notes

- Uses latest React 19.1.0 with modern features
- TypeScript 5.8.3 for type safety
- Vite 7.0.2 for fast development and building
- PWA support with Workbox 7.3.0
- Mobile deployment ready with Capacitor
- Motion control requires camera permissions

## Keyboard Controls

- **A-L keys**: White piano keys (C4-F5)
- **W,E,T,Y,U,O,P**: Black keys
- **Left-click**: Toggle bass note
- **Right-click**: Change bass pitch
