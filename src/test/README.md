# Test Suite Documentation

This directory contains comprehensive unit tests for the Bassquake application. The tests are organized by functionality and cover all major aspects of the music production application.

## Test Files Overview

### Component Tests
- **`App.test.tsx`** - Tests the main App component integration
- **`MusicTracker.test.tsx`** - Comprehensive tests for the main MusicTracker component
- **`LoadingSpinner.test.tsx`** - Tests for the loading spinner component
- **`ErrorBoundary.test.tsx`** - Error handling and boundary testing

### Audio System Tests
- **`audio.test.ts`** - Basic audio system functionality and validation
- **`synthesis.test.ts`** - Audio synthesis, effects chain, and arpeggiator tests
- **`patterns.test.ts`** - Beat pattern generation, validation, and bass patterns

### Visual System Tests
- **`visual.test.ts`** - Color schemes, scope visualization, animations, and responsive design
- **`motion.test.ts`** - Motion detection, webcam integration, and filter mapping

### Integration Tests
- **`integration.test.tsx`** - End-to-end component integration and user workflows

### PWA Tests
- **`pwa.test.ts`** - Progressive Web App functionality, service workers, and offline capabilities

### Utility Tests
- **`utils.test.ts`** - Helper functions, utilities, and common operations

### Test Setup
- **`setup.ts`** - Test environment configuration and mocks

## Test Categories

### 1. Component Testing
Tests React components in isolation with proper mocking of dependencies:
- Rendering behavior
- User interactions
- State management
- Props handling
- Event handling

### 2. Audio Engine Testing
Validates the core audio functionality:
- Synthesizer configurations
- Audio effects chains
- Pattern generation algorithms
- BPM and timing calculations
- Volume and gain staging

### 3. Visual System Testing
Ensures proper visual feedback and UI behavior:
- Color scheme validation
- Canvas rendering
- Animation performance
- Responsive design
- Touch and gesture support

### 4. Motion Control Testing
Tests webcam-based motion detection:
- Motion intensity calculations
- Filter frequency mapping
- Camera permission handling
- Performance optimization

### 5. Integration Testing
Tests component interactions and user workflows:
- Audio engine integration
- Beat generation workflows
- Arpeggiator functionality
- Motion control integration
- Pattern editing flows

### 6. PWA Testing
Validates Progressive Web App features:
- Service worker registration
- Offline functionality
- App installation
- Platform detection
- Storage management

### 7. Utility Testing
Tests helper functions and utilities:
- Audio calculations (dB/gain conversion)
- Timing utilities
- Pattern manipulation
- Color conversions
- Performance helpers

## Running Tests

### Run All Tests
```bash
npm test
```

### Run with UI Dashboard
```bash
npm run test:ui
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Suites
```bash
# Component tests
npm run test:components

# Audio system tests
npm run test:audio

# Visual system tests
npm run test:visual

# Integration tests
npm run test:integration

# PWA tests
npm run test:pwa

# Utility tests
npm run test:utils
```

### Watch Mode
```bash
npm run test:watch
```

## Test Coverage Goals

- **Global Coverage**: 75% minimum
- **Components**: 80% minimum
- **Critical Audio Functions**: 90% minimum
- **Error Boundaries**: 100%

## Mocking Strategy

### Audio APIs
- Web Audio API components (AudioContext, GainNode, etc.)
- Tone.js synthesizers and effects
- Audio analysis and visualization

### Browser APIs
- MediaDevices (camera access)
- Service Worker registration
- Local storage and IndexedDB
- Canvas rendering context

### User Interactions
- Keyboard events
- Mouse/touch events
- Device motion events

## Test Patterns

### 1. Arrange-Act-Assert (AAA)
```typescript
it('should do something', () => {
  // Arrange
  const input = createTestInput()
  
  // Act
  const result = functionUnderTest(input)
  
  // Assert
  expect(result).toBe(expectedOutput)
})
```

### 2. User-Centric Testing
```typescript
it('allows user to create a beat pattern', async () => {
  render(<MusicTracker />)
  
  const generateButton = screen.getByRole('button', { name: /generate beat/i })
  await user.click(generateButton)
  
  expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
})
```

### 3. Error Case Testing
```typescript
it('handles audio context errors gracefully', async () => {
  mockAudioContext.resume.mockRejectedValue(new Error('Audio context error'))
  
  // Should not crash the application
  expect(() => render(<MusicTracker />)).not.toThrow()
})
```

## Performance Testing

Tests include performance validations for:
- Animation frame rates (60fps target)
- Audio processing latency
- Memory usage patterns
- Touch response times
- Canvas rendering efficiency

## Accessibility Testing

Validates accessibility features:
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management
- ARIA attributes

## Browser Compatibility

Tests are designed to work across:
- Chrome 111+
- Safari 16.4+
- Firefox 128+
- Edge 111+

## Continuous Integration

Tests are configured to run in CI/CD pipelines with:
- Parallel test execution
- Coverage reporting
- Performance benchmarks
- Cross-browser testing

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Test behavior, not implementation
3. Keep tests isolated and independent
4. Mock external dependencies
5. Test edge cases and error conditions

### Maintaining Tests
1. Update tests when features change
2. Remove obsolete tests
3. Refactor test code for clarity
4. Monitor test performance
5. Review coverage reports regularly

## Debugging Tests

### Common Issues
- **Timing Issues**: Use `waitFor` for async operations
- **Mock Problems**: Ensure mocks are properly reset
- **DOM Queries**: Use appropriate query methods
- **Event Handling**: Verify event propagation

### Debug Commands
```bash
# Run specific test with debug output
npx vitest src/test/MusicTracker.test.tsx --reporter=verbose

# Run tests in browser for debugging
npm run test:ui
```

## Contributing Tests

When adding new features:
1. Write tests first (TDD approach)
2. Ensure adequate coverage
3. Test both success and failure paths
4. Add integration tests for user workflows
5. Update documentation

## Performance Benchmarks

Key performance metrics tracked:
- Test execution time: < 30 seconds for full suite
- Individual test time: < 1 second average
- Memory usage: < 100MB during test runs
- Coverage generation: < 10 seconds

---

**Note**: This test suite ensures the reliability and quality of the Bassquake music production application across all platforms and use cases.