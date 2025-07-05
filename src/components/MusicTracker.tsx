import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import styles from './MusicTracker.module.css';

// Utility for controlled error logging
const logError = (context: string, error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, error);
};

const MusicTracker = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(-1);
  const [pattern, setPattern] = useState<Record<string, boolean>[]>(
    Array(16)
      .fill(null)
      .map(() => ({}))
  );
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [arpeggiatorEnabled, setArpeggiatorEnabled] = useState(false);
  const [arpPattern, setArpPattern] = useState('up');
  const [arpSpeed, setArpSpeed] = useState('16n');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [beatStyle, setBeatStyle] = useState('boom-bap');
  const [bassPattern, setBassPattern] = useState(Array(16).fill(null));
  const [volumes, setVolumes] = useState({ kick: -6, snare: -8, hihat: -12, bass: -4 });
  const [wobbleRate, setWobbleRate] = useState('8n');
  const [wobbleDepth, setWobbleDepth] = useState(0.7);
  const [scopeMode, setScopeMode] = useState('waveform');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const instrumentsRef = useRef<Record<string, unknown>>({});
  const filterRef = useRef<Tone.Filter | null>(null);
  const arpeggiatorRef = useRef<Tone.Pattern<string> | null>(null);
  // const arpIndexRef = useRef(0); // Reserved for future arpeggiator implementation
  const wobbleLfoRef = useRef<Tone.LFO | null>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const waveformRef = useRef<Tone.Analyser | null>(null);
  const scopeAnimationRef = useRef<number | null>(null);

  // Initialize audio system
  useEffect(() => {
    // Create analyser for visualization
    analyserRef.current = new Tone.Analyser('waveform', 512);
    waveformRef.current = new Tone.Analyser('fft', 64);

    // Connect everything to analysers before going to destination
    const masterGain = new Tone.Gain(0.8)
      .connect(analyserRef.current)
      .connect(waveformRef.current)
      .toDestination();

    // Create instruments with effects
    const kickReverb = new Tone.Reverb({ decay: 0.5, wet: 0.1 }).connect(masterGain);
    const snareReverb = new Tone.Reverb({ decay: 0.3, wet: 0.2 }).connect(masterGain);
    const hihatDelay = new Tone.FeedbackDelay('16n', 0.2).connect(masterGain);
    hihatDelay.wet.value = 0.1;

    // Dubstep bass with wobble effects
    const bassFilter = new Tone.Filter(100, 'lowpass').connect(masterGain);
    wobbleLfoRef.current = new Tone.LFO(wobbleRate, 50, 2000).start();
    wobbleLfoRef.current.connect(bassFilter.frequency);

    const bassDistortion = new Tone.Distortion(0.8).connect(bassFilter);
    const bassChorus = new Tone.Chorus(2, 1.5, 0.5).connect(bassDistortion);

    instrumentsRef.current = {
      kick: new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
        volume: volumes.kick,
      }).connect(kickReverb),

      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
        volume: volumes.snare,
      }).connect(snareReverb),

      hihat: new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: volumes.hihat,
      }).connect(hihatDelay),

      bass: new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.2 },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.5,
          release: 0.2,
          baseFrequency: 80,
          octaves: 2.5,
        },
        volume: volumes.bass,
      }).connect(bassChorus),
    };

    // Create synth with effects chain
    filterRef.current = new Tone.Filter(800, 'lowpass').connect(masterGain);
    const delay = new Tone.PingPongDelay('8n', 0.3).connect(masterGain);
    const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(masterGain);

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
    })
      .connect(filterRef.current)
      .connect(delay)
      .connect(chorus);

    // Set up transport
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = '1m';

    // Start visualization
    drawScope();

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (scopeAnimationRef.current) {
        cancelAnimationFrame(scopeAnimationRef.current);
      }
      Object.values(instrumentsRef.current).forEach(inst =>
        (inst as { dispose: () => void }).dispose()
      );
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      analyserRef.current?.dispose();
      waveformRef.current?.dispose();
      wobbleLfoRef.current?.dispose();
      masterGain.dispose();
      kickReverb.dispose();
      snareReverb.dispose();
      hihatDelay.dispose();
      bassFilter.dispose();
      bassDistortion.dispose();
      bassChorus.dispose();
      delay.dispose();
      chorus.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update BPM
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Update volumes
  useEffect(() => {
    Object.entries(volumes).forEach(([track, volume]) => {
      if (instrumentsRef.current[track]) {
        (instrumentsRef.current[track] as { volume: { value: number } }).volume.value = volume;
      }
    });
  }, [volumes]);

  // Update wobble settings
  useEffect(() => {
    if (wobbleLfoRef.current) {
      wobbleLfoRef.current.frequency.value = wobbleRate;
      wobbleLfoRef.current.amplitude.value = wobbleDepth;
    }
  }, [wobbleRate, wobbleDepth]);

  // Modern color scheme
  const colors = {
    bg: '#0a0a0f',
    bgGradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a0f1f 100%)',
    surface: 'rgba(20, 20, 30, 0.8)',
    surfaceHover: 'rgba(30, 30, 40, 0.9)',
    primary: '#00ffcc',
    primaryGlow: '#00ffcc',
    secondary: '#ff0080',
    secondaryGlow: '#ff0080',
    accent: '#7c3aed',
    accentGlow: '#7c3aed',
    text: '#ffffff',
    textDim: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.2)',
  };

  // Draw scope visualization
  const drawScope = () => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (scopeMode === 'waveform' && analyserRef.current) {
      const waveform = analyserRef.current.getValue();
      if (waveform && waveform.length > 0) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < waveform.length; i++) {
          const x = (i / waveform.length) * width;
          const y = ((Number(waveform[i]) + 1) / 2) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }
    } else if (scopeMode === 'spectrum' && waveformRef.current) {
      const fft = waveformRef.current.getValue();
      const barWidth = width / fft.length;

      fft.forEach((value, i) => {
        const height = (Number(value) + 140) * 2;
        const hue = (i / fft.length) * 60 + 280; // Purple to cyan gradient

        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);
      });
    }

    scopeAnimationRef.current = requestAnimationFrame(drawScope);
  };

  // Arpeggiator logic
  useEffect(() => {
    if (arpeggiatorRef.current) {
      arpeggiatorRef.current.dispose();
    }

    if (arpeggiatorEnabled && selectedNotes.length > 0) {
      arpeggiatorRef.current = new Tone.Pattern<string>(
        (time, note) => {
          synthRef.current?.triggerAttackRelease(note, '16n', time);
        },
        selectedNotes,
        arpPattern as 'up' | 'down' | 'upDown' | 'random'
      ).start(0);

      arpeggiatorRef.current.interval = arpSpeed;
    }

    return () => {
      if (arpeggiatorRef.current) {
        arpeggiatorRef.current.dispose();
      }
    };
  }, [arpeggiatorEnabled, selectedNotes, arpPattern, arpSpeed]);

  // Main sequencer loop
  useEffect(() => {
    // Clear previous events
    Tone.Transport.cancel();

    // Schedule pattern playback
    pattern.forEach((step, stepIndex) => {
      Tone.Transport.schedule(time => {
        // Update current step
        Tone.Draw.schedule(() => {
          setCurrentStep(stepIndex);
        }, time);

        // Play sounds for this step
        Object.entries(step).forEach(([track, active]) => {
          if (active) {
            if (track === 'kick') {
              (
                instrumentsRef.current.kick as {
                  // eslint-disable-next-line no-unused-vars
                  triggerAttackRelease: (note: string, duration: string, time: number) => void;
                }
              ).triggerAttackRelease('C2', '8n', time);
            } else if (track === 'snare') {
              (
                instrumentsRef.current.snare as {
                  // eslint-disable-next-line no-unused-vars
                  triggerAttackRelease: (duration: string, time: number) => void;
                }
              ).triggerAttackRelease('8n', time);
            } else if (track === 'hihat') {
              (
                instrumentsRef.current.hihat as {
                  // eslint-disable-next-line no-unused-vars
                  triggerAttackRelease: (note: string, duration: string, time: number) => void;
                }
              ).triggerAttackRelease('C4', '16n', time);
            }
          }
        });

        // Play bass note if present
        if (bassPattern[stepIndex]) {
          (
            instrumentsRef.current.bass as {
              // eslint-disable-next-line no-unused-vars
              triggerAttackRelease: (note: string, duration: string, time: number) => void;
            }
          ).triggerAttackRelease(bassPattern[stepIndex], '16n', time);
        }
      }, `0:0:${stepIndex}`);
    });

    // Schedule the reset at the end of the bar
    Tone.Transport.schedule(time => {
      Tone.Draw.schedule(() => {
        setCurrentStep(-1);
      }, time);
    }, '0:3:3.5');
  }, [pattern, bassPattern]);

  // Handle play/pause
  const togglePlayback = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      await Tone.start();
      Tone.Transport.position = 0;
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  // Handle pattern updates
  const toggleStep = (step: number, track: string) => {
    const newPattern = [...pattern];
    newPattern[step] = { ...newPattern[step], [track]: !newPattern[step][track] };
    setPattern(newPattern);
  };

  // Clear pattern
  const clearPattern = () => {
    setPattern(
      Array(16)
        .fill(null)
        .map(() => ({}))
    );
    setBassPattern(Array(16).fill(null));
  };

  // Clear only drums
  const clearDrums = () => {
    setPattern(
      Array(16)
        .fill(null)
        .map(() => ({}))
    );
  };

  // Clear only bass
  const clearBass = () => {
    setBassPattern(Array(16).fill(null));
  };

  // Beat generation patterns
  const beatPatterns = {
    'boom-bap': {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    },
    trap: {
      kick: [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      hihat: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
    },
    bounce: {
      kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    },
    drill: {
      kick: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      snare: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      hihat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
    },
  };

  // Dubstep bassline patterns (Bassnectar-inspired)
  const basslinePatterns = [
    // Pattern 1: Classic wobble
    [
      'E1',
      null,
      null,
      'E1',
      null,
      null,
      'E1',
      null,
      'G1',
      null,
      null,
      'G1',
      null,
      null,
      'D1',
      null,
    ],
    // Pattern 2: Sub drops
    [
      'E1',
      'E1',
      null,
      null,
      'E1',
      null,
      null,
      null,
      'C1',
      'C1',
      null,
      null,
      'G1',
      null,
      null,
      null,
    ],
    // Pattern 3: Syncopated
    [
      'E1',
      null,
      'E1',
      null,
      null,
      'G1',
      null,
      'E1',
      null,
      null,
      'D1',
      null,
      'D1',
      null,
      'C1',
      null,
    ],
    // Pattern 4: Heavy drops
    [
      'E1',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      'C1',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    // Pattern 5: Rolling bass
    [
      'E1',
      'E1',
      'G1',
      null,
      'E1',
      'E1',
      'D1',
      null,
      'C1',
      'C1',
      'E1',
      null,
      'G1',
      'G1',
      'E1',
      null,
    ],
  ];

  // Generate beat with variations
  const generateBeat = () => {
    const basePattern = beatPatterns[beatStyle as keyof typeof beatPatterns];
    const newPattern: Record<string, boolean>[] = Array(16)
      .fill(null)
      .map(() => ({}));

    // Apply base pattern with variations
    ['kick', 'snare', 'hihat'].forEach(track => {
      (basePattern as Record<string, number[]>)[track].forEach((hit: number, index: number) => {
        if (hit) {
          // Add the hit with some probability-based variations
          const probability = track === 'hihat' ? 0.85 : 0.9;
          if (Math.random() < probability) {
            newPattern[index][track] = true;
          }
        } else {
          // Occasionally add ghost notes
          const ghostProbability = track === 'hihat' ? 0.15 : 0.05;
          if (Math.random() < ghostProbability) {
            newPattern[index][track] = true;
          }
        }
      });
    });

    // Ensure we always have at least kick on beat 1
    newPattern[0].kick = true;

    // Ensure we have snare on 2 and 4
    newPattern[4].snare = true;
    newPattern[12].snare = true;

    setPattern(newPattern);
  };

  // Generate dubstep bassline
  const generateBassline = () => {
    // Pick a random pattern
    const randomPattern = basslinePatterns[Math.floor(Math.random() * basslinePatterns.length)];
    const newBassPattern = [...randomPattern];

    // Add some variations
    for (let i = 0; i < newBassPattern.length; i++) {
      if (newBassPattern[i]) {
        // Occasionally transpose notes
        if (Math.random() < 0.2) {
          const notes = ['C1', 'D1', 'E1', 'G1', 'A1'];
          newBassPattern[i] = notes[Math.floor(Math.random() * notes.length)];
        }
        // Occasionally remove notes for space
        if (Math.random() < 0.1) {
          newBassPattern[i] = null;
        }
      } else {
        // Occasionally add notes
        if (Math.random() < 0.1) {
          const notes = ['E1', 'G1', 'C1'];
          newBassPattern[i] = notes[Math.floor(Math.random() * notes.length)];
        }
      }
    }

    setBassPattern(newBassPattern);
  };

  // Toggle bass note
  const toggleBassNote = (step: number) => {
    const newBassPattern = [...bassPattern];
    if (newBassPattern[step]) {
      newBassPattern[step] = null;
    } else {
      // Default to E1 (root note for dubstep)
      newBassPattern[step] = 'E1';
    }
    setBassPattern(newBassPattern);
  };

  // Cycle through bass notes
  const cycleBassNote = (step: number) => {
    const notes = [null, 'C1', 'D1', 'E1', 'G1', 'A1', 'C2', 'D2', 'E2'];
    const newBassPattern = [...bassPattern];
    const currentIndex = notes.indexOf(newBassPattern[step]);
    newBassPattern[step] = notes[(currentIndex + 1) % notes.length];
    setBassPattern(newBassPattern);
  };

  // Keyboard mapping
  const keyToNote = useMemo(
    () => ({
      a: 'C4',
      w: 'C#4',
      s: 'D4',
      e: 'D#4',
      d: 'E4',
      f: 'F4',
      t: 'F#4',
      g: 'G4',
      y: 'G#4',
      h: 'A4',
      u: 'A#4',
      j: 'B4',
      k: 'C5',
      o: 'C#5',
      l: 'D5',
      p: 'D#5',
      ';': 'E5',
      "'": 'F5',
    }),
    []
  );

  // Keyboard handlers
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() as keyof typeof keyToNote;
      if (keyToNote[key] && !activeKeys[key]) {
        setActiveKeys(prev => ({ ...prev, [key]: true }));

        if (arpeggiatorEnabled) {
          // Add note to arpeggiator
          setSelectedNotes(prev => [...new Set([...prev, keyToNote[key]])]);
        } else {
          // Play note directly
          synthRef.current?.triggerAttack(keyToNote[key]);
        }
      }
    },
    [activeKeys, arpeggiatorEnabled, keyToNote]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() as keyof typeof keyToNote;
      if (keyToNote[key]) {
        setActiveKeys(prev => ({ ...prev, [key]: false }));

        if (arpeggiatorEnabled) {
          // Remove note from arpeggiator
          setSelectedNotes(prev => prev.filter(note => note !== keyToNote[key]));
        } else {
          // Release note directly
          synthRef.current?.triggerRelease(keyToNote[key]);
        }
      }
    },
    [arpeggiatorEnabled, keyToNote]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Webcam functionality
  const detectMotion = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !webcamEnabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 320;
    canvas.height = 240;

    const processFrame = () => {
      if (!webcamEnabled || !video.srcObject) return;

      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (previousFrameRef.current) {
          let motion = 0;
          for (let i = 0; i < currentFrame.data.length; i += 4) {
            const diff =
              Math.abs(currentFrame.data[i] - previousFrameRef.current.data[i]) +
              Math.abs(currentFrame.data[i + 1] - previousFrameRef.current.data[i + 1]) +
              Math.abs(currentFrame.data[i + 2] - previousFrameRef.current.data[i + 2]);
            motion += diff;
          }
          const normalizedMotion = Math.min(motion / (canvas.width * canvas.height * 100), 1);
          setMotionIntensity(normalizedMotion);

          if (filterRef.current) {
            const filterFreq = 200 + normalizedMotion * 3000;
            filterRef.current.frequency.rampTo(filterFreq, 0.1);
          }
        }

        previousFrameRef.current = currentFrame;
        animationFrameRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        logError('Frame Processing', err);
      }
    };

    processFrame();
  }, [webcamEnabled]);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.onloadedmetadata = () => {
          detectMotion();
        };
      }
    } catch (err) {
      logError('Webcam Access', err);
      setWebcamEnabled(false);
    }
  }, [detectMotion]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setMotionIntensity(0);
  }, []);

  useEffect(() => {
    if (webcamEnabled) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [webcamEnabled, startWebcam, stopWebcam]);

  // Helper function to get black key positioning class
  const getBlackKeyClass = (key: string) => {
    const positions: Record<string, string> = {
      w: styles.blackKeyW,
      e: styles.blackKeyE,
      t: styles.blackKeyT,
      y: styles.blackKeyY,
      u: styles.blackKeyU,
      o: styles.blackKeyO,
      p: styles.blackKeyP,
    };
    return positions[key] || '';
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>MOTION TRACKER</h1>
        <p className={styles.subtitle}>ELECTRONIC MUSIC SEQUENCER</p>
      </div>

      {/* Scope Display */}
      <div className={`${styles.scopeSection} ${styles.surface}`}>
        <div className={styles.scopeHeader}>
          <h3 className={styles.sectionTitle}>VISUALIZER</h3>
          <div className={styles.scopeControls}>
            <button
              onClick={() => setScopeMode('waveform')}
              className={`${styles.scopeButton} ${
                scopeMode === 'waveform' ? styles.scopeButtonActive : styles.scopeButtonInactive
              }`}
            >
              WAVEFORM
            </button>
            <button
              onClick={() => setScopeMode('spectrum')}
              className={`${styles.scopeButton} ${
                scopeMode === 'spectrum' ? styles.scopeButtonActive : styles.scopeButtonInactive
              }`}
            >
              SPECTRUM
            </button>
          </div>
        </div>
        <canvas ref={scopeCanvasRef} className={styles.scopeCanvas} />
      </div>

      {/* Main Controls */}
      <div className={styles.mainControls}>
        <button
          onClick={togglePlayback}
          className={`${styles.playButton} ${
            isPlaying ? styles.playButtonPlaying : styles.playButtonStopped
          }`}
        >
          {isPlaying ? 'STOP' : 'PLAY'}
        </button>

        <div className={styles.bpmControl}>
          <label htmlFor='bpm-slider' className={styles.controlLabel}>
            BPM
          </label>
          <input
            id='bpm-slider'
            type='range'
            min='60'
            max='200'
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className={styles.rangeInput}
            title={`BPM: ${bpm}`}
          />
          <span className={styles.bpmDisplay}>{bpm}</span>
        </div>

        <button onClick={clearPattern} className={styles.clearButton}>
          CLEAR
        </button>

        <button
          onClick={() => setWebcamEnabled(!webcamEnabled)}
          className={`${styles.motionButton} ${
            webcamEnabled ? styles.motionButtonOn : styles.motionButtonOff
          }`}
        >
          MOTION {webcamEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Beat Generator Controls */}
      <div className={styles.beatControls}>
        <div className={styles.styleControl}>
          <label className={styles.controlLabel}>STYLE</label>
          <select
            value={beatStyle}
            onChange={e => setBeatStyle(e.target.value)}
            className={styles.select}
          >
            <option value='boom-bap' className={styles.selectOption}>
              BOOM BAP
            </option>
            <option value='trap' className={styles.selectOption}>
              TRAP
            </option>
            <option value='bounce' className={styles.selectOption}>
              BOUNCE
            </option>
            <option value='drill' className={styles.selectOption}>
              DRILL
            </option>
          </select>
        </div>

        <button
          onClick={generateBeat}
          className={`${styles.generateButton} ${styles.generateBeatButton}`}
        >
          <span className={styles.emojiIcon}>🎲</span>
          GENERATE BEAT
        </button>

        <button
          onClick={generateBassline}
          className={`${styles.generateButton} ${styles.generateBassButton}`}
        >
          <span className={styles.emojiIcon}>🔊</span>
          GENERATE BASS
        </button>
      </div>

      {/* Motion Visualizer */}
      {webcamEnabled && (
        <div className={styles.motionVisualizer}>
          <div className={styles.motionLabel}>MOTION INTENSITY</div>
          <div className={styles.motionBarContainer}>
            <div className={styles.motionBar} style={{ width: `${motionIntensity * 100}%` }} />
          </div>
        </div>
      )}

      {/* Sequencer Section */}
      <div className={`${styles.sequencerSection} ${styles.surface}`}>
        <div className={styles.sequencerHeader}>
          <h3 className={styles.sectionTitle}>DRUM SEQUENCER</h3>
          <button onClick={clearDrums} className={styles.clearDrumsButton}>
            CLEAR DRUMS
          </button>
        </div>

        {/* Beat indicators */}
        <div className={styles.beatIndicators}>
          <div></div>
          {[...Array(16)].map((_, i) => (
            <div key={i} className={styles.beatNumber}>
              {i % 4 === 0 && <div className={styles.beatNumberText}>{i / 4 + 1}</div>}
              <div
                className={`${styles.beatDot} ${
                  i % 4 === 0 ? styles.beatDotMain : styles.beatDotSub
                }`}
              >
                •
              </div>
            </div>
          ))}
        </div>

        {['kick', 'snare', 'hihat'].map(track => (
          <div key={track} className={styles.trackRow}>
            <div className={styles.trackLabel}>
              <span>{track}</span>
              <input
                type='range'
                min='-30'
                max='0'
                value={volumes[track as keyof typeof volumes]}
                onChange={e => setVolumes(prev => ({ ...prev, [track]: Number(e.target.value) }))}
                className={styles.trackVolumeSlider}
                title={`${track} volume: ${volumes[track as keyof typeof volumes]}dB`}
              />
            </div>
            {[...Array(16)].map((_, i) => (
              <button
                key={i}
                onClick={() => toggleStep(i, track)}
                className={`${styles.stepButton} ${
                  pattern[i][track]
                    ? currentStep === i
                      ? styles.stepButtonActiveCurrent
                      : styles.stepButtonActiveNormal
                    : currentStep === i
                      ? styles.stepButtonInactiveCurrent
                      : styles.stepButtonInactiveNormal
                } ${
                  !pattern[i][track] &&
                  (i % 4 === 0 ? styles.stepButtonBorder : styles.stepButtonBorderTransparent)
                } ${pattern[i][track] ? styles.stepButtonActive : ''}`}
                title={`${track} step ${i + 1} ${pattern[i][track] ? 'active' : 'inactive'}`}
              />
            ))}
          </div>
        ))}

        {/* Bass track */}
        <div className={styles.bassSection}>
          <div className={styles.bassHeader}>
            <h4 className={styles.bassSectionTitle}>BASS SEQUENCER</h4>
            <div className={styles.bassControls}>
              <div className={styles.wobbleControls}>
                <label className={styles.wobbleLabel}>WOBBLE</label>
                <select
                  value={wobbleRate}
                  onChange={e => setWobbleRate(e.target.value)}
                  className={styles.wobbleSelect}
                >
                  <option value='4n' className={styles.selectOption}>
                    1/4
                  </option>
                  <option value='8n' className={styles.selectOption}>
                    1/8
                  </option>
                  <option value='16n' className={styles.selectOption}>
                    1/16
                  </option>
                  <option value='32n' className={styles.selectOption}>
                    1/32
                  </option>
                </select>
                <input
                  type='range'
                  min='0'
                  max='1'
                  step='0.1'
                  value={wobbleDepth}
                  onChange={e => setWobbleDepth(Number(e.target.value))}
                  className={styles.wobbleSlider}
                  title={`Wobble depth: ${(wobbleDepth * 100).toFixed(0)}%`}
                />
              </div>
              <button onClick={clearBass} className={styles.clearBassButton}>
                CLEAR BASS
              </button>
            </div>
          </div>

          <div className={styles.bassTrackRow}>
            <div className={styles.bassTrackLabel}>
              <span>BASS</span>
              <input
                type='range'
                min='-30'
                max='0'
                value={volumes.bass}
                onChange={e => setVolumes(prev => ({ ...prev, bass: Number(e.target.value) }))}
                className={styles.bassVolumeSlider}
                title={`Bass volume: ${volumes.bass}dB`}
              />
            </div>
            {[...Array(16)].map((_, i) => (
              <button
                key={i}
                onClick={() => toggleBassNote(i)}
                onContextMenu={e => {
                  e.preventDefault();
                  cycleBassNote(i);
                }}
                className={`${styles.bassStepButton} ${
                  bassPattern[i]
                    ? currentStep === i
                      ? styles.bassStepButtonActiveCurrent
                      : styles.bassStepButtonActiveNormal
                    : currentStep === i
                      ? styles.bassStepButtonInactiveCurrent
                      : styles.bassStepButtonInactiveNormal
                } ${
                  !bassPattern[i] &&
                  (i % 4 === 0 ? styles.stepButtonBorder : styles.stepButtonBorderTransparent)
                } ${bassPattern[i] ? styles.bassStepButtonActive : ''}`}
              >
                {bassPattern[i] ? bassPattern[i].replace('1', '').replace('2', '') : ''}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.bassInstructions}>
          Left-click to toggle • Right-click to change note
        </div>
      </div>

      {/* Arpeggiator Controls */}
      <div className={`${styles.arpeggiatorSection} ${styles.surface}`}>
        <button
          onClick={() => setArpeggiatorEnabled(!arpeggiatorEnabled)}
          className={`${styles.arpToggleButton} ${
            arpeggiatorEnabled ? styles.arpToggleButtonOn : styles.arpToggleButtonOff
          }`}
        >
          ARP {arpeggiatorEnabled ? 'ON' : 'OFF'}
        </button>

        {arpeggiatorEnabled && (
          <>
            <select
              value={arpPattern}
              onChange={e => setArpPattern(e.target.value)}
              className={styles.arpSelect}
            >
              <option value='up' className={styles.selectOption}>
                UP
              </option>
              <option value='down' className={styles.selectOption}>
                DOWN
              </option>
              <option value='upDown' className={styles.selectOption}>
                UP/DOWN
              </option>
              <option value='random' className={styles.selectOption}>
                RANDOM
              </option>
            </select>

            <select
              value={arpSpeed}
              onChange={e => setArpSpeed(e.target.value)}
              className={styles.arpSelect}
            >
              <option value='4n' className={styles.selectOption}>
                1/4
              </option>
              <option value='8n' className={styles.selectOption}>
                1/8
              </option>
              <option value='16n' className={styles.selectOption}>
                1/16
              </option>
              <option value='32n' className={styles.selectOption}>
                1/32
              </option>
            </select>
          </>
        )}
      </div>

      {/* Keyboard Section */}
      <div className={`${styles.keyboardSection} ${styles.surface}`}>
        <h3 className={styles.keyboardTitle}>
          SYNTHESIZER {arpeggiatorEnabled && '• ARPEGGIATOR MODE'}
        </h3>
        <div className={styles.keyboardContainer}>
          {Object.entries(keyToNote).map(([key, note]) => {
            const isBlackKey = note.includes('#');

            return (
              <div
                key={key}
                className={`${styles.keyContainer} ${
                  isBlackKey
                    ? `${styles.keyContainerBlack} ${getBlackKeyClass(key)}`
                    : styles.keyContainerWhite
                }`}
              >
                <button
                  className={`${styles.pianoKey} ${
                    isBlackKey ? styles.pianoKeyBlack : styles.pianoKeyWhite
                  } ${activeKeys[key] ? styles.pianoKeyActive : ''}`}
                >
                  <div className={styles.keyLabel}>
                    <div
                      className={`${styles.keyLabelKey} ${
                        activeKeys[key]
                          ? styles.keyLabelActiveText
                          : isBlackKey
                            ? styles.keyLabelBlackText
                            : styles.keyLabelWhiteText
                      }`}
                    >
                      {key.toUpperCase()}
                    </div>
                    <div
                      className={`${styles.keyLabelNote} ${
                        activeKeys[key]
                          ? styles.keyLabelActiveText
                          : isBlackKey
                            ? styles.keyLabelBlackNote
                            : styles.keyLabelWhiteNote
                      }`}
                    >
                      {note}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden elements */}
      <video ref={videoRef} className={styles.hiddenVideo} autoPlay playsInline muted />
      <canvas ref={canvasRef} className={styles.hiddenCanvas} />
    </div>
  );
};

export default MusicTracker;
