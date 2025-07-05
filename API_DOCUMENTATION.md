# BASSQUAKE API Documentation

## Overview

BASSQUAKE is a seismic dubstep sequencer - a modern, web-based music production tool that combines a drum sequencer, dubstep bass synthesizer, and motion-controlled effects. Built with React, TypeScript, and Tone.js, it provides a complete electronic music production environment in the browser.

## Table of Contents

1. [Core Components](#core-components)
2. [Audio Engine](#audio-engine)
3. [User Interface](#user-interface)
4. [Motion Control](#motion-control)
5. [Pattern Generation](#pattern-generation)
6. [Keyboard Interface](#keyboard-interface)
7. [Configuration](#configuration)
8. [PWA Features](#pwa-features)
9. [Testing](#testing)
10. [Docker Support](#docker-support)

---

## Core Components

### App Component

**Location:** `src/App.tsx`

The main application component that provides the top-level structure and error handling.

```typescript
interface AppProps {}

function App(): JSX.Element
```

**Features:**
- Error boundary integration
- Suspense-based loading
- Main application bootstrap

**Usage:**
```typescript
import App from './App';

// Application is automatically initialized in main.tsx
// No direct usage required
```

### MusicTracker Component

**Location:** `src/components/MusicTracker.tsx`

The core music production interface providing all sequencing, synthesis, and control functionality.

```typescript
interface MusicTrackerProps {}

const MusicTracker: React.FC<MusicTrackerProps>
```

**State Management:**
- `isPlaying: boolean` - Transport playback state
- `bpm: number` - Beats per minute (60-200)
- `currentStep: number` - Current sequencer position (-1 to 15)
- `pattern: Array<Record<string, boolean>>` - 16-step drum pattern
- `bassPattern: Array<string | null>` - 16-step bass note sequence
- `volumes: Record<string, number>` - Track volume levels (-30 to 0 dB)
- `webcamEnabled: boolean` - Motion control activation
- `motionIntensity: number` - Normalized motion detection (0-1)
- `arpeggiatorEnabled: boolean` - Arpeggiator activation
- `selectedNotes: string[]` - Notes for arpeggiation

**Key Methods:**
- `togglePlayback()` - Start/stop the sequencer
- `toggleStep(step: number, track: string)` - Toggle drum step
- `toggleBassNote(step: number)` - Toggle bass note
- `cycleBassNote(step: number)` - Cycle through bass notes
- `generateBeat()` - Generate drum pattern
- `generateBassline()` - Generate bass pattern
- `clearPattern()` - Clear all patterns
- `clearDrums()` - Clear drum patterns only
- `clearBass()` - Clear bass pattern only

### ErrorBoundary Component

**Location:** `src/components/ErrorBoundary.tsx`

React error boundary for graceful error handling with cyberpunk-themed UI.

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState>
```

**Features:**
- Catches JavaScript errors in component tree
- Displays user-friendly error interface
- Provides system restart functionality
- Shows technical details in expandable section

### LoadingSpinner Component

**Location:** `src/components/LoadingSpinner.tsx`

Animated loading indicator with BASSQUAKE branding.

```typescript
const LoadingSpinner: React.FC = (): JSX.Element
```

**Features:**
- Animated bouncing dots
- Gradient text effects
- Audio engine initialization messaging

---

## Audio Engine

### Synthesis Architecture

The audio engine is built on Tone.js and provides:

#### Drum Instruments
- **Kick Drum:** MembraneSynth with reverb
- **Snare Drum:** NoiseSynth with reverb
- **Hi-Hat:** MetalSynth with delay

#### Bass Synthesizer
- **Oscillator:** Sawtooth wave
- **Filter:** Wobble-controlled lowpass
- **Effects:** Distortion, chorus, reverb

#### Lead Synthesizer
- **Oscillator:** Sawtooth wave
- **Effects:** Lowpass filter, ping-pong delay, chorus

### Audio Configuration

```typescript
// Volume ranges
const volumeRanges = {
  kick: { min: -30, max: 0, default: -6 },
  snare: { min: -30, max: 0, default: -8 },
  hihat: { min: -30, max: 0, default: -12 },
  bass: { min: -30, max: 0, default: -4 }
};

// Wobble settings
const wobbleSettings = {
  rate: ['4n', '8n', '16n', '32n'], // Note divisions
  depth: { min: 0, max: 1, default: 0.7 }
};
```

### Visualization

**Waveform Mode:**
- Real-time oscilloscope display
- 512-point waveform analysis
- Cyan color scheme

**Spectrum Mode:**
- 64-band frequency analysis
- Color-coded frequency bars
- Purple to cyan gradient

---

## User Interface

### Control Layout

#### Transport Controls
- **Play/Stop Button:** Toggle sequencer playback
- **BPM Slider:** Adjust tempo (60-200 BPM)
- **Clear Button:** Reset all patterns
- **Motion Toggle:** Enable/disable webcam control

#### Sequencer Grid
- **16-Step Pattern:** Visual step sequencer
- **4/4 Time Signature:** Beat markers every 4 steps
- **Track Rows:** Kick, snare, hi-hat, bass
- **Volume Sliders:** Per-track level control

#### Pattern Generation
- **Style Selection:** Boom-bap, trap, bounce, drill
- **Generate Beat:** Create drum patterns
- **Generate Bass:** Create basslines
- **Clear Options:** Individual track clearing

#### Synthesizer Keyboard
- **Piano Layout:** White and black keys
- **Key Mapping:** QWERTY keyboard to notes
- **Note Display:** Key labels and note names
- **Visual Feedback:** Glow effects on active keys

### Styling System

```typescript
const colorScheme = {
  bg: '#0a0a0f',
  surface: 'rgba(20, 20, 30, 0.8)',
  primary: '#00ffcc',    // Cyan
  secondary: '#ff0080',  // Pink
  accent: '#7c3aed',     // Purple
  text: '#ffffff',
  textDim: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.2)'
};
```

---

## Motion Control

### Webcam Integration

The motion control system uses webcam input to modulate audio parameters in real-time.

#### Setup Process
1. Request user media permission
2. Initialize video stream (320x240)
3. Set up motion detection canvas
4. Start frame-by-frame analysis

#### Motion Detection Algorithm
```typescript
const detectMotion = (currentFrame: ImageData, previousFrame: ImageData): number => {
  let motion = 0;
  for (let i = 0; i < currentFrame.data.length; i += 4) {
    const diff = Math.abs(currentFrame.data[i] - previousFrame.data[i]) +
                 Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]) +
                 Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
    motion += diff;
  }
  return Math.min(motion / (320 * 240 * 100), 1);
};
```

#### Audio Parameter Mapping
- **Filter Cutoff:** 200Hz + (motion × 3000Hz)
- **Update Rate:** 60fps via requestAnimationFrame
- **Smoothing:** 0.1 second ramp time

---

## Pattern Generation

### Beat Patterns

Pre-defined drum patterns for different genres:

#### Boom-Bap
```typescript
const boomBap = {
  kick:  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
  snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
  hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]
};
```

#### Trap
```typescript
const trap = {
  kick:  [1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0],
  snare: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
  hihat: [1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1]
};
```

#### Bass Patterns

Dubstep-inspired bassline patterns:

```typescript
const bassPatterns = [
  // Classic wobble
  ['E1', null, null, 'E1', null, null, 'E1', null, 'G1', null, null, 'G1', null, null, 'D1', null],
  // Sub drops
  ['E1', 'E1', null, null, 'E1', null, null, null, 'C1', 'C1', null, null, 'G1', null, null, null],
  // Syncopated
  ['E1', null, 'E1', null, null, 'G1', null, 'E1', null, null, 'D1', null, 'D1', null, 'C1', null]
];
```

### Pattern Variations

Generation includes probability-based variations:
- **Hit Probability:** 85-90% for main hits
- **Ghost Notes:** 5-15% chance for additional hits
- **Guaranteed Beats:** Always kick on 1, snare on 2 and 4

---

## Keyboard Interface

### Note Mapping

QWERTY keyboard mapped to chromatic piano layout:

```typescript
const keyToNote = {
  'a': 'C4',  'w': 'C#4', 's': 'D4',  'e': 'D#4', 'd': 'E4',
  'f': 'F4',  't': 'F#4', 'g': 'G4',  'y': 'G#4', 'h': 'A4',
  'u': 'A#4', 'j': 'B4',  'k': 'C5',  'o': 'C#5', 'l': 'D5',
  'p': 'D#5', ';': 'E5',  "'": 'F5'
};
```

### Arpeggiator

The arpeggiator provides automatic pattern generation from held notes:

#### Modes
- **Up:** Ascending note order
- **Down:** Descending note order
- **Up/Down:** Pingpong pattern
- **Random:** Random note selection

#### Speed Settings
- **1/4 Note:** Quarter note timing
- **1/8 Note:** Eighth note timing
- **1/16 Note:** Sixteenth note timing
- **1/32 Note:** Thirty-second note timing

#### Usage
```typescript
// Enable arpeggiator
setArpeggiatorEnabled(true);

// Hold keys to add notes
// Notes are automatically played in selected pattern
```

---

## Configuration

### Environment Variables

```bash
# Development
VITE_API_URL=http://localhost:3000
VITE_ENV=development

# Production
VITE_API_URL=https://bassquake.app
VITE_ENV=production
```

### Build Configuration

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'tone': ['tone'],
          'react': ['react', 'react-dom']
        }
      }
    }
  }
});
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## PWA Features

### Service Worker

Automatic caching and offline functionality:

```typescript
// main.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed'));
}
```

### Manifest Configuration

```json
{
  "name": "BASSQUAKE",
  "short_name": "Bassquake",
  "description": "Seismic Dubstep Sequencer",
  "theme_color": "#00ffcc",
  "background_color": "#0a0a0f",
  "display": "standalone",
  "orientation": "landscape",
  "scope": "/",
  "start_url": "/"
}
```

### Mobile Support

#### Capacitor Configuration
```json
{
  "appId": "com.bassquake.app",
  "appName": "Bassquake",
  "webDir": "dist",
  "bundledWebRuntime": false
}
```

#### Platform Commands
```bash
# Add platforms
npm run cap:add:ios
npm run cap:add:android

# Sync changes
npm run cap:sync

# Open in IDEs
npm run cap:open:ios
npm run cap:open:android
```

---

## Testing

### Test Structure

Comprehensive test suite covering all functionality:

#### Component Tests
- **App.test.tsx** - Main application
- **MusicTracker.test.tsx** - Core functionality
- **ErrorBoundary.test.tsx** - Error handling
- **LoadingSpinner.test.tsx** - Loading states

#### Audio Tests
- **audio.test.ts** - Audio engine
- **synthesis.test.ts** - Synthesizer functionality
- **patterns.test.ts** - Pattern generation

#### Integration Tests
- **integration.test.tsx** - End-to-end workflows
- **motion.test.ts** - Motion control
- **visual.test.ts** - Visualization

#### PWA Tests
- **pwa.test.ts** - Progressive web app features

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:components
npm run test:audio
npm run test:visual
npm run test:integration
npm run test:pwa
npm run test:utils

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

---

## Docker Support

### Development Environment

```bash
# Start development server
npm run docker:dev

# Build production image
npm run docker:build

# Run tests in container
npm run docker:test

# CI/CD pipeline
npm run docker:ci

# Cleanup containers
npm run docker:cleanup
```

### Docker Configuration

#### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  bassquake:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

---

## API Reference Summary

### Core Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `togglePlayback()` | Start/stop sequencer | None | `Promise<void>` |
| `toggleStep(step, track)` | Toggle drum step | `step: number, track: string` | `void` |
| `generateBeat()` | Generate drum pattern | None | `void` |
| `generateBassline()` | Generate bass pattern | None | `void` |
| `clearPattern()` | Clear all patterns | None | `void` |

### Configuration Objects

| Object | Properties | Default Values |
|--------|------------|----------------|
| `volumes` | `{kick: -6, snare: -8, hihat: -12, bass: -4}` | dB levels |
| `wobbleSettings` | `{rate: '8n', depth: 0.7}` | LFO parameters |
| `colorScheme` | `{primary: '#00ffcc', secondary: '#ff0080', ...}` | UI colors |

### Event Handlers

| Handler | Trigger | Payload |
|---------|---------|---------|
| `onKeyDown` | Keyboard press | `KeyboardEvent` |
| `onKeyUp` | Keyboard release | `KeyboardEvent` |
| `onMotionDetected` | Webcam motion | `number` (0-1) |
| `onStepChange` | Sequencer advance | `number` (0-15) |

---

## Examples

### Basic Usage

```typescript
import { MusicTracker } from './components/MusicTracker';

function App() {
  return (
    <div className="app">
      <MusicTracker />
    </div>
  );
}
```

### Custom Pattern

```typescript
// Create custom drum pattern
const customPattern = Array(16).fill(null).map((_, i) => ({
  kick: i % 4 === 0,
  snare: i % 8 === 4,
  hihat: i % 2 === 1
}));

// Apply pattern
setPattern(customPattern);
```

### Motion Control Integration

```typescript
// Enable motion control
setWebcamEnabled(true);

// Motion automatically controls filter cutoff
// 200Hz + (motionIntensity * 3000Hz)
```

---

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required APIs
- Web Audio API
- MediaDevices API (for motion control)
- Canvas API (for visualization)
- Service Worker API (for PWA)

---

## Performance Considerations

### Audio Optimization
- Pre-load audio samples
- Use efficient synthesis algorithms
- Limit concurrent voices
- Implement audio worklets for heavy processing

### Visual Optimization
- Use requestAnimationFrame for smooth animation
- Minimize canvas redraws
- Implement viewport culling
- Use CSS transforms for performance

### Memory Management
- Dispose audio nodes properly
- Clean up event listeners
- Manage webcam stream lifecycle
- Implement proper component unmounting

---

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/cculb/bassquake.git
cd bassquake

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Write comprehensive tests
- Use semantic commit messages

---

## License

MIT License - see LICENSE file for details.

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/cculb/bassquake/issues
- Documentation: https://bassquake.app/docs
- Community: https://discord.gg/bassquake