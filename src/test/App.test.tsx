import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getAllByText(/MOTION TRACKER/i)[0]).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('MOTION TRACKER');
  });

  it('has the main control buttons', () => {
    render(<App />);

    // Main play/stop button
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();

    // Multiple clear buttons exist, so check for all
    const clearButtons = screen.getAllByRole('button', { name: /clear/i });
    expect(clearButtons.length).toBeGreaterThan(0);

    // Motion control button
    expect(screen.getByRole('button', { name: /motion/i })).toBeInTheDocument();
  });

  it('has BPM control', () => {
    render(<App />);
    const bpmSlider = screen.getByDisplayValue('120');
    expect(bpmSlider).toBeInTheDocument();
    expect(bpmSlider).toHaveAttribute('type', 'range');
  });

  it('displays the sequencer grid', () => {
    render(<App />);

    // Check for drum tracks
    expect(screen.getByText(/kick/i)).toBeInTheDocument();
    expect(screen.getByText(/snare/i)).toBeInTheDocument();
    expect(screen.getByText(/hihat/i)).toBeInTheDocument();

    // Check for bass track - use getAllByText since there are multiple bass elements
    const bassElements = screen.getAllByText(/bass/i);
    expect(bassElements.length).toBeGreaterThan(0);
  });

  it('has arpeggiator controls', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /arp off/i })).toBeInTheDocument();
  });

  it('displays the synthesizer keyboard', () => {
    render(<App />);
    expect(screen.getByText(/synthesizer/i)).toBeInTheDocument();
  });
});
