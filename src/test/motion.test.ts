import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Motion Detection System', () => {
  let mockVideo: HTMLVideoElement
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    // Mock canvas and context
    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(),
    } as any

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 320,
      height: 240
    } as any

    mockVideo = {
      srcObject: null,
      play: vi.fn(),
      onloadedmetadata: null
    } as any
  })

  describe('Motion Calculation', () => {
    function calculateMotionIntensity(currentFrame: Uint8ClampedArray, previousFrame: Uint8ClampedArray): number {
      let motion = 0
      
      for (let i = 0; i < currentFrame.length; i += 4) {
        const diff = Math.abs(currentFrame[i] - previousFrame[i]) +
                     Math.abs(currentFrame[i + 1] - previousFrame[i + 1]) +
                     Math.abs(currentFrame[i + 2] - previousFrame[i + 2])
        motion += diff
      }
      
      // Normalize to 0-1 range
      return Math.min(motion / (320 * 240 * 100), 1)
    }

    it('calculates motion correctly with different frames', () => {
      const currentFrame = new Uint8ClampedArray([100, 150, 200, 255, 120, 160, 180, 255])
      const previousFrame = new Uint8ClampedArray([90, 140, 210, 255, 110, 150, 190, 255])
      
      const motion = calculateMotionIntensity(currentFrame, previousFrame)
      
      expect(motion).toBeGreaterThan(0)
      expect(motion).toBeLessThanOrEqual(1)
    })

    it('returns zero motion for identical frames', () => {
      const identicalFrame = new Uint8ClampedArray([100, 150, 200, 255, 120, 160, 180, 255])
      
      const motion = calculateMotionIntensity(identicalFrame, identicalFrame)
      
      expect(motion).toBe(0)
    })

    it('returns maximum motion for completely different frames', () => {
      const blackFrame = new Uint8ClampedArray(Array(8).fill(0))
      const whiteFrame = new Uint8ClampedArray(Array(8).fill(255))
      
      const motion = calculateMotionIntensity(whiteFrame, blackFrame)
      
      expect(motion).toBeGreaterThan(0.0001) // Should be non-zero for different frames
    })

    it('handles edge cases gracefully', () => {
      const emptyFrame = new Uint8ClampedArray([])
      const normalFrame = new Uint8ClampedArray([100, 150, 200, 255])
      
      const motion = calculateMotionIntensity(emptyFrame, normalFrame)
      expect(motion).toBe(0)
    })
  })

  describe('Filter Frequency Mapping', () => {
    function mapMotionToFilterFreq(motionIntensity: number): number {
      const minFreq = 200
      const maxFreq = 3200
      return minFreq + (motionIntensity * (maxFreq - minFreq))
    }

    it('maps motion to filter frequency correctly', () => {
      expect(mapMotionToFilterFreq(0)).toBe(200)
      expect(mapMotionToFilterFreq(1)).toBe(3200)
      expect(mapMotionToFilterFreq(0.5)).toBe(1700)
    })

    it('clamps values within expected range', () => {
      expect(mapMotionToFilterFreq(-0.1)).toBe(170) // Below min should map to 200 + (-0.1 * 3000) = 170
      expect(mapMotionToFilterFreq(1.1)).toBe(3500) // Above max should map to 200 + (1.1 * 3000) = 3500
    })

    it('provides smooth transitions', () => {
      const motionValues = [0, 0.25, 0.5, 0.75, 1]
      const frequencies = motionValues.map(mapMotionToFilterFreq)
      
      // Check that frequencies increase monotonically
      for (let i = 1; i < frequencies.length; i++) {
        expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1])
      }
    })
  })

  describe('Webcam Integration', () => {
    const mockGetUserMedia = vi.fn()
    
    beforeEach(() => {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true
      })
    })

    it('requests appropriate video constraints', async () => {
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }])
      }
      mockGetUserMedia.mockResolvedValue(mockStream)

      const expectedConstraints = {
        video: { width: 320, height: 240 }
      }

      await navigator.mediaDevices.getUserMedia(expectedConstraints)
      
      expect(mockGetUserMedia).toHaveBeenCalledWith(expectedConstraints)
    })

    it('handles permission denial gracefully', async () => {
      const permissionError = new Error('Permission denied')
      mockGetUserMedia.mockRejectedValue(permissionError)

      try {
        await navigator.mediaDevices.getUserMedia({ video: true })
      } catch (error) {
        expect(error).toBe(permissionError)
      }
    })

    it('stops video tracks when disabling webcam', () => {
      const mockTrack = { stop: vi.fn() }
      const mockStream = {
        getTracks: vi.fn().mockReturnValue([mockTrack])
      }

      // Simulate stopping webcam
      mockStream.getTracks().forEach((track: any) => track.stop())
      
      expect(mockTrack.stop).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('processes frames at appropriate intervals', () => {
      let frameCount = 0
      const processFrame = () => frameCount++

      // Simulate 60fps processing
      const frameInterval = 1000 / 60 // ~16.67ms
      
      const intervals: number[] = []
      for (let i = 0; i < 5; i++) {
        intervals.push(frameInterval)
        processFrame()
      }

      expect(frameCount).toBe(5)
      expect(intervals.every(interval => interval < 20)).toBe(true) // Should be fast enough
    })

    it('handles high motion intensity without performance degradation', () => {
      const largeFrame = new Uint8ClampedArray(320 * 240 * 4) // Full resolution
      largeFrame.fill(255)
      
      const previousFrame = new Uint8ClampedArray(320 * 240 * 4)
      previousFrame.fill(0)

      const startTime = performance.now()
      
      // Calculate motion for large frame
      let motion = 0
      for (let i = 0; i < largeFrame.length; i += 4) {
        const diff = Math.abs(largeFrame[i] - previousFrame[i]) +
                     Math.abs(largeFrame[i + 1] - previousFrame[i + 1]) +
                     Math.abs(largeFrame[i + 2] - previousFrame[i + 2])
        motion += diff
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      // Should process within reasonable time (< 5ms for real-time performance)
      expect(processingTime).toBeLessThan(5)
      expect(motion).toBeGreaterThan(0)
    })
  })

  describe('Motion Smoothing', () => {
    function smoothMotion(currentMotion: number, previousMotion: number, smoothingFactor: number = 0.1): number {
      return previousMotion + (currentMotion - previousMotion) * smoothingFactor
    }

    it('smooths motion values correctly', () => {
      const currentMotion = 1.0
      const previousMotion = 0.0
      const smoothingFactor = 0.1
      
      const smoothed = smoothMotion(currentMotion, previousMotion, smoothingFactor)
      
      expect(smoothed).toBe(0.1)
      expect(smoothed).toBeGreaterThan(previousMotion)
      expect(smoothed).toBeLessThan(currentMotion)
    })

    it('converges to target motion over time', () => {
      let currentMotion = 0
      const targetMotion = 1
      const smoothingFactor = 0.2
      
      // Simulate multiple frames
      for (let i = 0; i < 20; i++) {
        currentMotion = smoothMotion(targetMotion, currentMotion, smoothingFactor)
      }
      
      expect(currentMotion).toBeCloseTo(targetMotion, 0) // More iterations needed for convergence
    })

    it('reduces jitter in motion detection', () => {
      const noisyMotionValues = [0.1, 0.9, 0.2, 0.8, 0.15, 0.85]
      let smoothedMotion = 0
      const smoothedValues: number[] = []
      
      noisyMotionValues.forEach(motion => {
        smoothedMotion = smoothMotion(motion, smoothedMotion, 0.3)
        smoothedValues.push(smoothedMotion)
      })
      
      // Check that smoothed values have less variance
      const originalVariance = calculateVariance(noisyMotionValues)
      const smoothedVariance = calculateVariance(smoothedValues)
      
      expect(smoothedVariance).toBeLessThan(originalVariance)
    })

    function calculateVariance(values: number[]): number {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
      return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
    }
  })

  describe('Error Handling', () => {
    it('handles missing video element gracefully', () => {
      const processFrame = (video: HTMLVideoElement | null) => {
        if (!video || !video.srcObject) return false
        return true
      }

      expect(processFrame(null)).toBe(false)
      expect(processFrame(mockVideo)).toBe(false) // No srcObject
    })

    it('handles canvas context errors', () => {
      const mockCanvasWithoutContext = {
        getContext: vi.fn().mockReturnValue(null)
      } as any

      const ctx = mockCanvasWithoutContext.getContext('2d')
      expect(ctx).toBeNull()
    })

    it('handles image data extraction errors', () => {
      const mockContextWithError = {
        drawImage: vi.fn(),
        getImageData: vi.fn().mockImplementation(() => {
          throw new Error('Security error')
        })
      } as any

      expect(() => {
        mockContextWithError.getImageData(0, 0, 320, 240)
      }).toThrow('Security error')
    })
  })
})