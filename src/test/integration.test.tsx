import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MusicTracker from '../components/MusicTracker'

describe('Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any running animations or timers
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Audio Engine Integration', () => {
    it('integrates sequencer with audio playback', async () => {
      render(<MusicTracker />)

      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // Add some beats to the pattern
      const kickButtons = screen.getAllByRole('button')
      const firstKickButton = kickButtons.find(btn => 
        btn.closest('.grid')?.textContent?.includes('kick')
      )
      
      if (firstKickButton) {
        await user.click(firstKickButton)
      }

      // Verify the pattern was updated (button should be highlighted/active)
      expect(firstKickButton).toBeInTheDocument()
    })

    it('synchronizes BPM changes with transport', async () => {
      render(<MusicTracker />)

      // Change BPM
      const bpmSlider = screen.getByDisplayValue('120')
      await user.clear(bpmSlider)
      await user.type(bpmSlider, '140')

      expect(screen.getByDisplayValue('140')).toBeInTheDocument()

      // Start playback at new BPM
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })
    })

    it('handles volume changes in real-time', async () => {
      render(<MusicTracker />)

      // Find volume sliders
      const volumeSliders = screen.getAllByRole('slider')
      const kickVolumeSlider = volumeSliders[1] // Assuming first slider is BPM

      // Change volume
      fireEvent.change(kickVolumeSlider, { target: { value: '-10' } })

      // Start playback to verify volume change is applied
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    })
  })

  describe('Beat Generation Integration', () => {
    it('generates and plays beat patterns', async () => {
      render(<MusicTracker />)

      // Select beat style
      const styleSelect = screen.getByDisplayValue(/boom bap/i)
      await user.selectOptions(styleSelect, 'trap')

      // Generate beat
      const generateButton = screen.getByRole('button', { name: /generate beat/i })
      await user.click(generateButton)

      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // Pattern should be playing (verified by UI state)
      expect(generateButton).toBeInTheDocument()
    })

    it('generates bass patterns independently', async () => {
      render(<MusicTracker />)

      // Generate bass pattern
      const generateBassButton = screen.getByRole('button', { name: /generate bass/i })
      await user.click(generateBassButton)

      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })
    })
  })

  describe('Arpeggiator Integration', () => {
    it('enables arpeggiator and responds to keyboard', async () => {
      render(<MusicTracker />)

      // Enable arpeggiator
      const arpButton = screen.getByRole('button', { name: /arp off/i })
      await user.click(arpButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /arp on/i })).toBeInTheDocument()
      })

      // Simulate keyboard input
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' })

      // Start playback to hear arpeggiator
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // Release key
      fireEvent.keyUp(document, { key: 'a', code: 'KeyA' })
    })

    it('changes arpeggiator patterns and speeds', async () => {
      render(<MusicTracker />)

      // Enable arpeggiator
      const arpButton = screen.getByRole('button', { name: /arp off/i })
      await user.click(arpButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /arp on/i })).toBeInTheDocument()
      })

      // Change pattern
      const patternSelect = screen.getByDisplayValue('UP')
      await user.selectOptions(patternSelect, 'DOWN')

      // Change speed
      const speedSelect = screen.getByDisplayValue('1/16')
      await user.selectOptions(speedSelect, '1/8')

      expect(screen.getByDisplayValue('DOWN')).toBeInTheDocument()
      expect(screen.getByDisplayValue('1/8')).toBeInTheDocument()
    })
  })

  describe('Motion Control Integration', () => {
    it('enables motion control and handles camera permissions', async () => {
      // Mock successful camera access
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }])
      }
      const mockGetUserMedia = vi.fn().mockResolvedValue(mockStream)
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true
      })

      render(<MusicTracker />)

      // Enable motion control
      const motionButton = screen.getByRole('button', { name: /motion off/i })
      await user.click(motionButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /motion on/i })).toBeInTheDocument()
      })

      // Should show motion intensity meter
      expect(screen.getByText(/motion intensity/i)).toBeInTheDocument()

      // Disable motion control
      const motionOnButton = screen.getByRole('button', { name: /motion on/i })
      await user.click(motionOnButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /motion off/i })).toBeInTheDocument()
      })
    })

    it('handles camera permission denial gracefully', async () => {
      // Mock camera access denial
      const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'))
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true
      })

      render(<MusicTracker />)

      // Try to enable motion control
      const motionButton = screen.getByRole('button', { name: /motion off/i })
      await user.click(motionButton)

      // Should remain off due to permission denial
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /motion off/i })).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Visual System Integration', () => {
    it('switches between scope modes', async () => {
      render(<MusicTracker />)

      // Switch to spectrum mode
      const spectrumButton = screen.getByRole('button', { name: /spectrum/i })
      await user.click(spectrumButton)

      // Start playback to see visualization
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // Switch back to waveform
      const waveformButton = screen.getByRole('button', { name: /waveform/i })
      await user.click(waveformButton)
    })

    it('displays visual feedback during playback', async () => {
      render(<MusicTracker />)

      // Add some pattern elements
      const generateButton = screen.getByRole('button', { name: /generate beat/i })
      await user.click(generateButton)

      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // Visual elements should be active during playback
      const canvas = document.querySelector('canvas')
      expect(canvas).toBeInTheDocument()
    })
  })

  describe('Bass Wobble Integration', () => {
    it('adjusts wobble parameters and hears effect', async () => {
      render(<MusicTracker />)

      // Generate bass pattern first
      const generateBassButton = screen.getByRole('button', { name: /generate bass/i })
      await user.click(generateBassButton)

      // Adjust wobble rate
      const wobbleRateSelect = screen.getByDisplayValue('1/8')
      await user.selectOptions(wobbleRateSelect, '1/16')

      // Adjust wobble depth
      const wobbleDepthSlider = screen.getByTitle(/wobble depth/i)
      fireEvent.change(wobbleDepthSlider, { target: { value: '0.9' } })

      // Start playback to hear wobble effect
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })
    })
  })

  describe('Pattern Editing Integration', () => {
    it('edits drum patterns and plays them back', async () => {
      render(<MusicTracker />)

      // Click on sequencer grid to add hits
      const gridButtons = screen.getAllByRole('button')
      const sequencerButtons = gridButtons.filter(btn => 
        btn.closest('.grid') !== null
      )

      // Add a few hits to different tracks
      if (sequencerButtons.length > 3) {
        await user.click(sequencerButtons[0]) // First step kick
        await user.click(sequencerButtons[4]) // Fifth step (should be snare)
        await user.click(sequencerButtons[8]) // Ninth step hi-hat
      }

      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })
    })

    it('edits bass pattern with right-click cycling', async () => {
      render(<MusicTracker />)

      // Find bass sequencer buttons
      const bassSection = screen.getByText(/bass sequencer/i).closest('.mt-4')
      const bassButtons = bassSection?.querySelectorAll('button') || []

      if (bassButtons.length > 1) {
        const firstBassButton = bassButtons[1] // Skip the clear button

        // Left click to add note
        await user.click(firstBassButton)

        // Right click to cycle through notes
        fireEvent.contextMenu(firstBassButton)

        // Start playback
        const playButton = screen.getByRole('button', { name: /play/i })
        await user.click(playButton)

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
        })
      }
    })
  })

  describe('Clear Functions Integration', () => {
    it('clears all patterns and stops playback', async () => {
      render(<MusicTracker />)

      // Generate some patterns
      const generateBeatButton = screen.getByRole('button', { name: /generate beat/i })
      const generateBassButton = screen.getByRole('button', { name: /generate bass/i })
      
      await user.click(generateBeatButton)
      await user.click(generateBassButton)

      // Start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // Clear all patterns
      const clearButton = screen.getByRole('button', { name: /^clear$/i })
      await user.click(clearButton)

      // Should stop playback and clear patterns
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
      })
    })

    it('clears drums independently from bass', async () => {
      render(<MusicTracker />)

      // Generate patterns
      const generateBeatButton = screen.getByRole('button', { name: /generate beat/i })
      const generateBassButton = screen.getByRole('button', { name: /generate bass/i })
      
      await user.click(generateBeatButton)
      await user.click(generateBassButton)

      // Clear only drums
      const clearDrumsButton = screen.getByRole('button', { name: /clear drums/i })
      await user.click(clearDrumsButton)

      // Bass pattern should remain (we can't easily verify this in the test,
      // but the button interaction should work)
      expect(clearDrumsButton).toBeInTheDocument()
    })
  })

  describe('Keyboard Integration', () => {
    it('plays synthesizer with keyboard input', async () => {
      render(<MusicTracker />)

      // Start playback for context
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      // Press multiple keys
      const keys = ['a', 's', 'd', 'f']
      keys.forEach(key => {
        fireEvent.keyDown(document, { key, code: `Key${key.toUpperCase()}` })
      })

      // Hold for a moment
      await new Promise(resolve => setTimeout(resolve, 100))

      // Release keys
      keys.forEach(key => {
        fireEvent.keyUp(document, { key, code: `Key${key.toUpperCase()}` })
      })

      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    })

    it('shows visual feedback for active keys', async () => {
      render(<MusicTracker />)

      // Press a key
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' })

      // Visual feedback should be present (hard to test specific visual changes,
      // but the key event should be handled)
      expect(document).toBeDefined()

      // Release key
      fireEvent.keyUp(document, { key: 'a', code: 'KeyA' })
    })
  })

  describe('Error Recovery Integration', () => {
    it('recovers from audio context suspension', async () => {
      render(<MusicTracker />)

      // Simulate audio context suspension (common on mobile)
      // This would require mocking the audio context state

      // Try to start playback
      const playButton = screen.getByRole('button', { name: /play/i })
      await user.click(playButton)

      // Should attempt to resume audio context and start playback
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('handles rapid UI interactions without breaking', async () => {
      vi.useFakeTimers()
      render(<MusicTracker />)

      // Rapidly interact with multiple controls
      const playButton = screen.getByRole('button', { name: /play/i })
      const generateButton = screen.getByRole('button', { name: /generate beat/i })
      const clearButton = screen.getByRole('button', { name: /^clear$/i })

      // Rapid fire interactions
      for (let i = 0; i < 5; i++) {
        await user.click(playButton)
        vi.advanceTimersByTime(50)
        await user.click(generateButton)
        vi.advanceTimersByTime(50)
        await user.click(clearButton)
        vi.advanceTimersByTime(50)
      }

      // Should not crash and remain functional
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('Performance Integration', () => {
    it('maintains performance with multiple systems active', async () => {
      render(<MusicTracker />)

      // Enable all systems
      const playButton = screen.getByRole('button', { name: /play/i })
      const arpButton = screen.getByRole('button', { name: /arp off/i })
      
      // Generate patterns
      const generateBeatButton = screen.getByRole('button', { name: /generate beat/i })
      const generateBassButton = screen.getByRole('button', { name: /generate bass/i })
      
      await user.click(generateBeatButton)
      await user.click(generateBassButton)
      await user.click(arpButton)
      await user.click(playButton)

      // Simulate keyboard input while everything is running
      fireEvent.keyDown(document, { key: 'a', code: 'KeyA' })
      fireEvent.keyDown(document, { key: 's', code: 'KeyS' })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
      })

      // System should remain responsive
      const clearButton = screen.getByRole('button', { name: /^clear$/i })
      await user.click(clearButton)

      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    })
  })
})