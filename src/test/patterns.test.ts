import { describe, it, expect } from 'vitest'

// Test beat pattern generation and validation
describe('Beat Patterns', () => {
  const beatPatterns = {
    'boom-bap': {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
    },
    'trap': {
      kick: [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      hihat: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1]
    },
    'bounce': {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
    },
    'drill': {
      kick: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      hihat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0]
    }
  }

  describe('Pattern Structure Validation', () => {
    Object.entries(beatPatterns).forEach(([style, pattern]) => {
      it(`${style} pattern has correct structure`, () => {
        expect(pattern.kick).toHaveLength(16)
        expect(pattern.snare).toHaveLength(16)
        expect(pattern.hihat).toHaveLength(16)
        
        // All values should be 0 or 1
        const allValues = [...pattern.kick, ...pattern.snare, ...pattern.hihat]
        allValues.forEach(value => {
          expect([0, 1]).toContain(value)
        })
      })
    })
  })

  describe('Musical Integrity', () => {
    it('boom bap has proper kick placement', () => {
      const { kick, snare } = beatPatterns['boom-bap']
      
      // Should have kick on beat 1
      expect(kick[0]).toBe(1)
      
      // Should have snare on beats 2 and 4 (steps 4 and 12)
      expect(snare[4]).toBe(1)
      expect(snare[12]).toBe(1)
    })

    it('trap has syncopated kick pattern', () => {
      const { kick } = beatPatterns.trap
      
      // Trap should have kick on 1, 8th note of beat 2, and 10th step
      expect(kick[0]).toBe(1)
      expect(kick[7]).toBe(1)
      expect(kick[9]).toBe(1)
    })

    it('drill has characteristic hi-hat pattern', () => {
      const { hihat } = beatPatterns.drill
      
      // Drill should have complex hi-hat patterns with rapid-fire sections
      const hihatCount = hihat.reduce((sum, hit) => sum + hit, 0)
      expect(hihatCount).toBeGreaterThan(8) // Should be busy
    })
  })

  describe('Pattern Generation', () => {
    function generateBeatWithVariations(basePattern: { kick: number[], snare: number[], hihat: number[] }, style: string) {
      const newPattern = Array(16).fill(null).map(() => ({}))
      
      if (!basePattern || !basePattern.kick || !basePattern.snare || !basePattern.hihat) {
        return newPattern
      }
      
      ['kick', 'snare', 'hihat'].forEach(track => {
        const trackPattern = basePattern[track as keyof typeof basePattern]
        if (trackPattern) {
          trackPattern.forEach((hit: number, index: number) => {
            if (hit) {
              const probability = track === 'hihat' ? 0.85 : 0.9
              if (Math.random() < probability) {
                newPattern[index][track] = true
              }
            } else {
              const ghostProbability = track === 'hihat' ? 0.15 : 0.05
              if (Math.random() < ghostProbability) {
                newPattern[index][track] = true
              }
            }
          })
        }
      })
      
      // Ensure essential beats
      newPattern[0].kick = true
      newPattern[4].snare = true
      newPattern[12].snare = true
      
      return newPattern
    }

    it('generates valid patterns with variations', () => {
      const basePattern = beatPatterns['boom-bap']
      const generated = generateBeatWithVariations(basePattern, 'boom-bap')
      
      expect(generated).toHaveLength(16)
      expect(generated[0].kick).toBe(true)
      expect(generated[4].snare).toBe(true)
      expect(generated[12].snare).toBe(true)
    })

    it('maintains musical structure with randomization', () => {
      const basePattern = beatPatterns.trap
      
      // Generate multiple patterns and check consistency
      for (let i = 0; i < 10; i++) {
        const generated = generateBeatWithVariations(basePattern, 'trap')
        
        // Should always have kick on beat 1
        expect(generated[0].kick).toBe(true)
        
        // Should always have snare on beats 2 and 4
        expect(generated[4].snare).toBe(true)
        expect(generated[12].snare).toBe(true)
      }
    })
  })

  describe('Bass Patterns', () => {
    const basslinePatterns = [
      ['E1', null, null, 'E1', null, null, 'E1', null, 'G1', null, null, 'G1', null, null, 'D1', null],
      ['E1', 'E1', null, null, 'E1', null, null, null, 'C1', 'C1', null, null, 'G1', null, null, null],
      ['E1', null, 'E1', null, null, 'G1', null, 'E1', null, null, 'D1', null, 'D1', null, 'C1', null],
      ['E1', null, null, null, null, null, null, null, 'C1', null, null, null, null, null, null, null],
      ['E1', 'E1', 'G1', null, 'E1', 'E1', 'D1', null, 'C1', 'C1', 'E1', null, 'G1', 'G1', 'E1', null]
    ]

    it('has valid bass note values', () => {
      const validNotes = ['C1', 'D1', 'E1', 'G1', 'A1', 'C2', 'D2', 'E2']
      
      basslinePatterns.forEach((pattern, index) => {
        pattern.forEach((note, stepIndex) => {
          if (note !== null) {
            expect(validNotes).toContain(note)
          }
        })
        expect(pattern).toHaveLength(16)
      })
    })

    it('has appropriate note density', () => {
      basslinePatterns.forEach((pattern, index) => {
        const noteCount = pattern.filter(note => note !== null).length
        expect(noteCount).toBeGreaterThan(0)
        expect(noteCount).toBeLessThan(16) // Should have some rests
      })
    })

    it('uses dubstep-appropriate root notes', () => {
      basslinePatterns.forEach(pattern => {
        const uniqueNotes = [...new Set(pattern.filter(note => note !== null))]
        
        // Should contain typical dubstep notes
        const hasE1 = uniqueNotes.includes('E1')
        const hasC1 = uniqueNotes.includes('C1') 
        const hasG1 = uniqueNotes.includes('G1')
        
        expect(hasE1 || hasC1 || hasG1).toBe(true)
      })
    })
  })

  describe('Pattern Cycling and Mutation', () => {
    function cycleBassNote(currentNote: string | null) {
      const notes = [null, 'C1', 'D1', 'E1', 'G1', 'A1', 'C2', 'D2', 'E2']
      const currentIndex = notes.indexOf(currentNote)
      return notes[(currentIndex + 1) % notes.length]
    }

    it('cycles through bass notes correctly', () => {
      expect(cycleBassNote(null)).toBe('C1')
      expect(cycleBassNote('C1')).toBe('D1')
      expect(cycleBassNote('E2')).toBe(null) // Cycles back to null
    })

    it('handles edge cases in note cycling', () => {
      expect(cycleBassNote('InvalidNote' as any)).toBe(null) // Invalid note cycles to null (first in array)
    })
  })

  describe('Wobble LFO Settings', () => {
    const wobbleRates = ['4n', '8n', '16n', '32n']
    const wobbleDepthRange = [0, 1]

    it('validates wobble rate options', () => {
      wobbleRates.forEach(rate => {
        expect(['4n', '8n', '16n', '32n']).toContain(rate)
      })
    })

    it('validates wobble depth range', () => {
      const testDepths = [0, 0.25, 0.5, 0.7, 1.0]
      
      testDepths.forEach(depth => {
        expect(depth).toBeGreaterThanOrEqual(wobbleDepthRange[0])
        expect(depth).toBeLessThanOrEqual(wobbleDepthRange[1])
      })
    })

    it('calculates wobble frequency correctly', () => {
      // Simplified wobble frequency calculation
      const baseFreq = 100
      const wobbleDepth = 0.7
      const maxModulation = 2000
      
      const modulatedFreq = baseFreq + (wobbleDepth * maxModulation * Math.sin(Date.now() * 0.001))
      
      expect(modulatedFreq).toBeGreaterThan(baseFreq - (wobbleDepth * maxModulation))
      expect(modulatedFreq).toBeLessThan(baseFreq + (wobbleDepth * maxModulation))
    })
  })
})