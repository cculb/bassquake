import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('Audio Helpers', () => {
    function dbToGain(db: number): number {
      return Math.pow(10, db / 20);
    }

    function gainToDb(gain: number): number {
      return 20 * Math.log10(Math.max(gain, 0.0001));
    }

    function clamp(value: number, min: number, max: number): number {
      return Math.min(Math.max(value, min), max);
    }

    function linearInterpolate(start: number, end: number, factor: number): number {
      return start + (end - start) * factor;
    }

    it('converts dB to gain correctly', () => {
      expect(dbToGain(0)).toBeCloseTo(1.0, 3);
      expect(dbToGain(-6)).toBeCloseTo(0.501, 3);
      expect(dbToGain(-20)).toBeCloseTo(0.1, 3);
      expect(dbToGain(-40)).toBeCloseTo(0.01, 3);
      expect(dbToGain(-60)).toBeCloseTo(0.001, 3);
    });

    it('converts gain to dB correctly', () => {
      expect(gainToDb(1.0)).toBeCloseTo(0, 1);
      expect(gainToDb(0.5)).toBeCloseTo(-6, 1);
      expect(gainToDb(0.1)).toBeCloseTo(-20, 1);
      expect(gainToDb(0.01)).toBeCloseTo(-40, 1);
    });

    it('clamps values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(7.5, 0, 10)).toBe(7.5);
    });

    it('interpolates linearly between values', () => {
      expect(linearInterpolate(0, 10, 0.5)).toBe(5);
      expect(linearInterpolate(0, 10, 0)).toBe(0);
      expect(linearInterpolate(0, 10, 1)).toBe(10);
      expect(linearInterpolate(-10, 10, 0.5)).toBe(0);
    });
  });

  describe('Timing Utilities', () => {
    function noteValueToSeconds(noteValue: string, bpm: number): number {
      const wholeDuration = (60 / bpm) * 4; // 4 beats per whole note

      const noteValues: { [key: string]: number } = {
        '1n': 1, // whole note
        '2n': 0.5, // half note
        '4n': 0.25, // quarter note
        '8n': 0.125, // eighth note
        '16n': 0.0625, // sixteenth note
        '32n': 0.03125, // thirty-second note
      };

      return wholeDuration * (noteValues[noteValue] || 0.25);
    }

    function bpmToMs(bpm: number, noteValue: string = '16n'): number {
      return noteValueToSeconds(noteValue, bpm) * 1000;
    }

    function quantizeToGrid(time: number, gridSize: number): number {
      return Math.round(time / gridSize) * gridSize;
    }

    it('converts note values to seconds correctly', () => {
      // At 120 BPM, quarter note = 0.5 seconds
      expect(noteValueToSeconds('4n', 120)).toBeCloseTo(0.5, 3);
      expect(noteValueToSeconds('8n', 120)).toBeCloseTo(0.25, 3);
      expect(noteValueToSeconds('16n', 120)).toBeCloseTo(0.125, 3);

      // At 60 BPM, quarter note = 1 second
      expect(noteValueToSeconds('4n', 60)).toBeCloseTo(1.0, 3);
    });

    it('converts BPM to milliseconds', () => {
      expect(bpmToMs(120, '16n')).toBeCloseTo(125, 1); // 125ms per 16th note
      expect(bpmToMs(140, '16n')).toBeCloseTo(107.14, 1);
      expect(bpmToMs(120, '8n')).toBeCloseTo(250, 1); // 250ms per 8th note
    });

    it('quantizes time to grid correctly', () => {
      expect(quantizeToGrid(123, 125)).toBe(125); // Snap to nearest 16th note
      expect(quantizeToGrid(62, 125)).toBe(0); // Snap to beginning
      expect(quantizeToGrid(187, 125)).toBe(125); // Snap to nearest 16th note (187 is closer to 125 than 250)
    });
  });

  describe('Pattern Utilities', () => {
    function shuffleArray<T>(array: T[]): T[] {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    function rotateArray<T>(array: T[], steps: number): T[] {
      const len = array.length;
      const normalizedSteps = ((steps % len) + len) % len;
      return [...array.slice(normalizedSteps), ...array.slice(0, normalizedSteps)];
    }

    function generateEuclideanRhythm(steps: number, pulses: number): boolean[] {
      if (pulses >= steps) return Array(steps).fill(true);
      if (pulses <= 0) return Array(steps).fill(false);

      const pattern = Array(steps).fill(false);
      const interval = steps / pulses;

      for (let i = 0; i < pulses; i++) {
        const index = Math.round(i * interval) % steps;
        pattern[index] = true;
      }

      return pattern;
    }

    function countPatternDensity(pattern: (boolean | number)[]): number {
      const activeSteps = pattern.filter(step => Boolean(step)).length;
      return activeSteps / pattern.length;
    }

    it('shuffles arrays randomly', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort()); // Same elements, different order
    });

    it('rotates arrays correctly', () => {
      const array = [1, 2, 3, 4, 5];

      expect(rotateArray(array, 1)).toEqual([2, 3, 4, 5, 1]);
      expect(rotateArray(array, 2)).toEqual([3, 4, 5, 1, 2]);
      expect(rotateArray(array, -1)).toEqual([5, 1, 2, 3, 4]);
      expect(rotateArray(array, 0)).toEqual(array);
      expect(rotateArray(array, 5)).toEqual(array); // Full rotation
    });

    it('generates euclidean rhythms', () => {
      // Classic euclidean rhythms
      const threeFour = generateEuclideanRhythm(8, 3); // [X..X..X.]
      const fiveSeven = generateEuclideanRhythm(16, 5);

      expect(threeFour).toHaveLength(8);
      expect(threeFour.filter(x => x)).toHaveLength(3);

      expect(fiveSeven).toHaveLength(16);
      expect(fiveSeven.filter(x => x)).toHaveLength(5);
    });

    it('calculates pattern density', () => {
      const sparsePattern = [true, false, false, false];
      const densePattern = [true, true, false, true];
      const emptyPattern = [false, false, false, false];
      const fullPattern = [true, true, true, true];

      expect(countPatternDensity(sparsePattern)).toBe(0.25);
      expect(countPatternDensity(densePattern)).toBe(0.75);
      expect(countPatternDensity(emptyPattern)).toBe(0);
      expect(countPatternDensity(fullPattern)).toBe(1);
    });
  });

  describe('Color Utilities', () => {
    function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }

    function rgbToHex(r: number, g: number, b: number): string {
      const toHex = (n: number) => {
        const hex = Math.round(clamp(n, 0, 255)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
      h /= 360;
      s /= 100;
      l /= 100;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      if (s === 0) {
        const gray = Math.round(l * 255);
        return { r: gray, g: gray, b: gray };
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
      };
    }

    function clamp(value: number, min: number, max: number): number {
      return Math.min(Math.max(value, min), max);
    }

    it('converts hex to RGB correctly', () => {
      expect(hexToRgb('#ff0080')).toEqual({ r: 255, g: 0, b: 128 });
      expect(hexToRgb('#00ffcc')).toEqual({ r: 0, g: 255, b: 204 });
      expect(hexToRgb('#7c3aed')).toEqual({ r: 124, g: 58, b: 237 });
      expect(hexToRgb('invalid')).toBeNull();
    });

    it('converts RGB to hex correctly', () => {
      expect(rgbToHex(255, 0, 128)).toBe('#ff0080');
      expect(rgbToHex(0, 255, 204)).toBe('#00ffcc');
      expect(rgbToHex(124, 58, 237)).toBe('#7c3aed');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('converts HSL to RGB correctly', () => {
      const red = hslToRgb(0, 100, 50);
      const green = hslToRgb(120, 100, 50);
      const blue = hslToRgb(240, 100, 50);

      expect(red).toEqual({ r: 255, g: 0, b: 0 });
      expect(green).toEqual({ r: 0, g: 255, b: 0 });
      expect(blue).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('handles edge cases in color conversion', () => {
      // Test grayscale (zero saturation)
      const gray = hslToRgb(0, 0, 50);
      expect(gray.r).toEqual(gray.g);
      expect(gray.g).toEqual(gray.b);
      expect(gray.r).toBeCloseTo(128, 0);
    });
  });

  describe('Device Detection', () => {
    function isMobile(): boolean {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    }

    function isTouchDevice(): boolean {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    function getDevicePixelRatio(): number {
      return window.devicePixelRatio || 1;
    }

    function getViewportSize(): { width: number; height: number } {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    it('detects mobile devices', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      expect(isMobile()).toBe(true);

      // Mock desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });

      expect(isMobile()).toBe(false);
    });

    it('detects touch capability', () => {
      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', { value: null });
      expect(isTouchDevice()).toBe(true);

      // Mock non-touch
      delete (window as any).ontouchstart;
      Object.defineProperty(navigator, 'maxTouchPoints', { value: 0 });
      expect(isTouchDevice()).toBe(false);
    });

    it('gets device pixel ratio', () => {
      Object.defineProperty(window, 'devicePixelRatio', { value: 2 });
      expect(getDevicePixelRatio()).toBe(2);

      delete (window as any).devicePixelRatio;
      expect(getDevicePixelRatio()).toBe(1); // Fallback
    });

    it('gets viewport dimensions', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1920 });
      Object.defineProperty(window, 'innerHeight', { value: 1080 });

      const viewport = getViewportSize();
      expect(viewport.width).toBe(1920);
      expect(viewport.height).toBe(1080);
    });
  });

  describe('Performance Utilities', () => {
    // eslint-disable-next-line no-unused-vars
    function debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
      // eslint-disable-next-line no-unused-vars
    ): (...args: Parameters<T>) => void {
      let timeout: ReturnType<typeof setTimeout> | null = null;

      return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    }

    // eslint-disable-next-line no-unused-vars
    function throttle<T extends (...args: any[]) => any>(
      func: T,
      limit: number
      // eslint-disable-next-line no-unused-vars
    ): (...args: Parameters<T>) => void {
      let inThrottle = false;

      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }

    function measurePerformance(fn: () => void): number {
      const start = performance.now();
      fn();
      const end = performance.now();
      return end - start;
    }

    it('debounces function calls', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => callCount++, 50);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should only execute once after delay
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callCount).toBe(1);
    });

    it('throttles function calls', async () => {
      let callCount = 0;
      const throttledFn = throttle(() => callCount++, 50);

      // Call multiple times rapidly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should execute immediately for first call
      expect(callCount).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 60));
      throttledFn();
      expect(callCount).toBe(2); // Second execution after throttle period
    });

    it('measures performance accurately', () => {
      const duration = measurePerformance(() => {
        // Simulate some computational work
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i);
        }
      });

      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10); // Should be fast
    });
  });

  describe('Array Utilities', () => {
    function chunk<T>(array: T[], size: number): T[][] {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    }

    function flatten<T>(arrays: T[][]): T[] {
      return arrays.reduce((acc, arr) => acc.concat(arr), []);
    }

    function unique<T>(array: T[]): T[] {
      return [...new Set(array)];
    }

    it('chunks arrays correctly', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8];

      expect(chunk(array, 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8],
      ]);
      expect(chunk(array, 4)).toEqual([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ]);
      expect(chunk(array, 10)).toEqual([[1, 2, 3, 4, 5, 6, 7, 8]]);
    });

    it('flattens nested arrays', () => {
      const nested = [
        [1, 2],
        [3, 4],
        [5, 6],
      ];
      expect(flatten(nested)).toEqual([1, 2, 3, 4, 5, 6]);

      const empty = [[]];
      expect(flatten(empty)).toEqual([]);
    });

    it('removes duplicates from arrays', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(unique([])).toEqual([]);
    });
  });
});
