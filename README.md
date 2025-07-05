# 🎵 BASSQUAKE - Seismic Dubstep Sequencer

<div align="center">

![Bassquake Logo](public/logo.png)

**A modern, web-based music production tool that combines a drum sequencer,
dubstep bass synthesizer, and motion-controlled effects into a futuristic
interface.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.2-green.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-blue.svg)](https://tailwindcss.com/)

[🚀 Live Demo](https://bassquake.app) | [📱 PWA Install](https://bassquake.app)
| [🎮 Try Now](https://bassquake.app)

</div>

## ✨ Features

### 🥁 **Drum Sequencer**

- 16-step sequencer with 3 tracks (kick, snare, hi-hat)
- Visual beat indicators showing quarter notes (1-4)
- Real-time playback visualization with current step highlighting
- Individual volume controls for each drum track (-30dB to 0dB)
- Clear drums button for quick pattern reset

### 🔊 **Dubstep Bass Sequencer**

- Dedicated bass track with sub-bass frequencies
- 8 bass notes available (C1, D1, E1, G1, A1, C2, D2, E2)
- Left-click to toggle notes, right-click to cycle through pitches
- **Wobble LFO Controls:**
  - Rate selector (1/4, 1/8, 1/16, 1/32)
  - Depth slider (0-100%)
  - Creates authentic dubstep filter modulation
- Individual bass volume control
- Clear bass button for pattern management

### 🎛️ **Beat Generation System**

- 4 hip-hop/electronic styles:
  - **Boom Bap**: Classic 90s hip-hop patterns
  - **Trap**: Modern trap rhythms
  - **Bounce**: West coast bounce grooves
  - **Drill**: UK/Chicago drill patterns
- Intelligent randomization that maintains musical integrity
- Separate bass pattern generator with 5 Bassnectar-inspired templates

### 🎹 **Synthesizer & Arpeggiator**

- Full piano keyboard (A-L keys for white keys, W-E-T-Y-U-O-P for black keys)
- Polyphonic synthesizer with professional effects chain
- **Arpeggiator modes:**
  - Up, Down, Up/Down, Random patterns
  - Speed control (1/4, 1/8, 1/16, 1/32)
- Visual feedback on active keys with neon glow effects

### 📹 **Motion Control**

- Webcam-based motion detection system
- Controls synthesizer filter frequency (200Hz - 3200Hz)
- Visual motion intensity meter
- Real-time audio parameter modulation
- Privacy-focused: all processing happens locally

### 📊 **Visual Scope Display**

- **Waveform mode**: Real-time audio waveform visualization
- **Spectrum mode**: FFT frequency analysis with gradient effects
- Smooth animations with trail effects
- Cyberpunk aesthetic with neon colors

### 🎧 **Professional Audio Effects**

- **Drums**: Individual reverb and delay effects per track
- **Bass**: Distortion, chorus, and LFO-controlled filter
- **Synth**: Filter, ping-pong delay, and chorus
- Master gain stage with analyzers
- Built on Tone.js for professional Web Audio API performance

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.19+ or 22.12+
- **npm** 10.0+
- Modern browser with Web Audio API support

### Installation

```bash
# Clone the repository
git clone https://github.com/cculb/bassquake.git
cd bassquake

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

## 📱 Mobile Deployment

### Progressive Web App (PWA)

Bassquake is built as a PWA and can be installed on mobile devices:

1. Open the app in your mobile browser
2. Add to home screen when prompted
3. Launch like a native app

### Native Mobile Apps (Capacitor)

```bash
# Add iOS platform
npm run cap:add:ios

# Add Android platform
npm run cap:add:android

# Build and sync
npm run build:mobile

# Open in Xcode
npm run cap:open:ios

# Open in Android Studio
npm run cap:open:android
```

## 🎮 Usage Guide

### Basic Controls

| Action         | Control                  |
| -------------- | ------------------------ |
| Play/Stop      | Space bar or Play button |
| BPM Control    | Slider (60-200 BPM)      |
| Clear All      | Clear button             |
| Motion Control | Toggle webcam on/off     |

### Keyboard Controls

| Keys            | Function                 |
| --------------- | ------------------------ |
| `A-L`           | White piano keys (C4-F5) |
| `W,E,T,Y,U,O,P` | Black piano keys         |
| `Space`         | Play/Stop transport      |

### Sequencer

- **Left-click**: Toggle drum hits or bass notes
- **Right-click**: Cycle through bass note pitches
- **Volume sliders**: Adjust individual track levels
- **Wobble controls**: Adjust LFO rate and depth for bass

### Motion Control

1. Click "MOTION ON" to enable webcam
2. Allow camera access when prompted
3. Move in front of camera to control filter frequency
4. Motion intensity bar shows current activity level

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🛠️ Development

### Project Structure

```text
src/
├── components/          # React components
│   ├── MusicTracker.tsx # Main application component
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── audio/              # Audio-related modules
├── assets/             # Static assets
└── test/               # Test utilities and setup
```

### Available Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `npm run dev`        | Start development server  |
| `npm run build`      | Build for production      |
| `npm run preview`    | Preview production build  |
| `npm run test`       | Run tests                 |
| `npm run lint`       | Lint code                 |
| `npm run format`     | Format code with Prettier |
| `npm run type-check` | Check TypeScript types    |

### Code Quality

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Vitest** for testing
- **Husky** for pre-commit hooks (optional)

## 🎨 Design System

### Color Palette

- **Primary**: `#00ffcc` (Neon Cyan)
- **Secondary**: `#ff0080` (Neon Pink)
- **Accent**: `#7c3aed` (Neon Purple)
- **Background**: `#0a0a0f` (Dark)
- **Surface**: `rgba(20, 20, 30, 0.8)` (Glass)

### Typography

- **System Font**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- **Monospace**: `Monaco, Menlo, "Courier New", monospace`

## 🌐 Browser Support

| Browser | Version | Status          |
| ------- | ------- | --------------- |
| Chrome  | 111+    | ✅ Full Support |
| Safari  | 16.4+   | ✅ Full Support |
| Firefox | 128+    | ✅ Full Support |
| Edge    | 111+    | ✅ Full Support |

**Note**: Older browsers may have limited functionality, especially for Web
Audio features.

## 📊 Performance

### Optimization Features

- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Service Worker**: Offline functionality and caching
- **Lazy Loading**: Components loaded on demand

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Bundle Size**: < 500KB gzipped

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=BASSQUAKE
VITE_APP_VERSION=1.0.0
VITE_ANALYTICS_ID=your_analytics_id
```

### Capacitor Configuration

Edit `capacitor.config.ts` for native app settings:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bassquake.app',
  appName: 'Bassquake',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md)
for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add awesome feature'`)
6. Push to the branch (`git push origin feature/awesome-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- **Tone.js** - Powerful Web Audio framework
- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling framework
- **Bassnectar** - Inspiration for bass patterns
- **Web Audio API** - Browser audio capabilities

## 📞 Support

- 🐛 [Report Bug](https://github.com/cculb/bassquake/issues)
- 💡 [Request Feature](https://github.com/cculb/bassquake/issues)
- 💬 [Discussions](https://github.com/cculb/bassquake/discussions)
- 📧 [Email Support](mailto:support@bassquake.app)

## 🚀 Roadmap

### Version 1.1.0

- [ ] MIDI export capability
- [ ] Additional synthesizer presets
- [ ] Pattern save/load functionality

### Version 1.2.0

- [ ] More visual effects modes
- [ ] Recording capabilities
- [ ] Additional drum kits
- [ ] Cloud sync for patterns

### Version 2.0.0

- [ ] Collaboration features
- [ ] Advanced sequencing features
- [ ] Plugin system
- [ ] Desktop app (Electron)

---

<div align="center">

## Made with 💜 by the Bassquake Team

[Website](https://bassquake.app) • [GitHub](https://github.com/cculb/bassquake)
• [Twitter](https://twitter.com/bassquakeapp)

</div>
