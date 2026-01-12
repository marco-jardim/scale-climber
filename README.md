# 🎵 Scale Climber

A browser-based vocal pitch training game where you climb a musical mountain by singing the correct notes of a C major scale.

[![Test](https://github.com/marco-jardim/scale-climber/workflows/Test/badge.svg)](https://github.com/marco-jardim/scale-climber/actions)
[![Deploy](https://github.com/marco-jardim/scale-climber/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/marco-jardim/scale-climber/actions)

## Features

- 🎤 Real-time pitch detection using the YIN algorithm
- 🎮 Engaging gameplay with animated character
- 📊 Accurate scoring and grading system
- 🎨 Responsive design (desktop and mobile)
- ♿ WCAG AA accessibility compliance
- 📴 Offline-capable PWA
- 🌍 Multi-language support

## Quick Start

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/marco-jardim/scale-climber.git
cd scale-climber

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:30000` to play the game.

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

## How to Play

1. **Grant microphone permission** when prompted
2. **Calibrate your voice** by singing high and low notes
3. **Sing the C major scale** (C-D-E-F-G-A-B-C) to help your character climb
4. **Hold each note** for 1.5 seconds to lock it in
5. **Get scored** based on pitch accuracy (Perfect/Great/OK)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers with Web Audio API support

**Note**: For best results, use wired headphones to avoid audio feedback.

## Development

### Project Structure

```
scale-climber/
├── src/
│   ├── audio/          # Pitch detection, audio processing
│   ├── game/           # Game logic, state management
│   ├── visuals/        # Canvas rendering, animations
│   ├── ui/             # UI components
│   └── utils/          # Helper functions
├── public/
│   ├── assets/         # Sprites, sounds, fonts
│   └── locales/        # Translation files
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
└── docs/               # Documentation
```

### Testing

We follow the test pyramid approach:
- **75% unit tests** - Fast, isolated component tests
- **20% integration tests** - Module interaction tests
- **5% E2E tests** - Full user flow tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

## Architecture

Built with:
- **Vanilla JavaScript** - No framework dependencies
- **Web Audio API** - Native browser audio processing
- **YIN Algorithm** - Accurate pitch detection
- **HTML5 Canvas** - High-performance rendering
- **Vite** - Fast build tool and dev server
- **Vitest** - Lightning-fast unit testing
- **Playwright** - Reliable E2E testing

## Performance

- **Bundle size**: <250KB gzipped
- **First Contentful Paint**: <2s on 3G
- **Frame rate**: 60fps desktop, 30fps mobile
- **Audio latency**: <50ms end-to-end

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- YIN pitch detection algorithm by Cheveigné & Kawahara (2002)
- Web Audio API community
- All our beta testers and contributors

---

**Made with ❤️ for singers and music learners**
