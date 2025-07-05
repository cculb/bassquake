import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

const MusicTracker = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(-1);
  const [pattern, setPattern] = useState(Array(16).fill(null).map(() => ({})));
  const [activeKeys, setActiveKeys] = useState({});
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [arpeggiatorEnabled, setArpeggiatorEnabled] = useState(false);
  const [arpPattern, setArpPattern] = useState('up');
  const [arpSpeed, setArpSpeed] = useState('16n');
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [beatStyle, setBeatStyle] = useState('boom-bap');
  const [bassPattern, setBassPattern] = useState(Array(16).fill(null));
  const [volumes, setVolumes] = useState({ kick: -6, snare: -8, hihat: -12, bass: -4 });
  const [wobbleRate, setWobbleRate] = useState('8n');
  const [wobbleDepth, setWobbleDepth] = useState(0.7);
  const [scopeMode, setScopeMode] = useState('waveform');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scopeCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const previousFrameRef = useRef(null);
  const animationFrameRef = useRef(null);
  const synthRef = useRef(null);
  const instrumentsRef = useRef({});
  const filterRef = useRef(null);
  const arpeggiatorRef = useRef(null);
  const arpIndexRef = useRef(0);
  const wobbleLfoRef = useRef(null);
  const analyserRef = useRef(null);
  const waveformRef = useRef(null);
  const scopeAnimationRef = useRef(null);

  // Initialize audio system
  useEffect(() => {
    // Create analyser for visualization
    analyserRef.current = new Tone.Analyser('waveform', 512);
    waveformRef.current = new Tone.Analyser('fft', 64);

    // Connect everything to analysers before going to destination
    const masterGain = new Tone.Gain(0.8).connect(analyserRef.current).connect(waveformRef.current).toDestination();

    // Create instruments with effects
    const kickReverb = new Tone.Reverb({ decay: 0.5, wet: 0.1 }).connect(masterGain);
    const snareReverb = new Tone.Reverb({ decay: 0.3, wet: 0.2 }).connect(masterGain);
    const hihatDelay = new Tone.FeedbackDelay("16n", 0.2).connect(masterGain);
    hihatDelay.wet.value = 0.1;

    // Dubstep bass with wobble effects
    const bassFilter = new Tone.Filter(100, "lowpass").connect(masterGain);
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
        volume: volumes.kick
      }).connect(kickReverb),

      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
        volume: volumes.snare
      }).connect(snareReverb),

      hihat: new Tone.MetalSynth({
        frequency: 250,
        envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: volumes.hihat
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
          octaves: 2.5
        },
        volume: volumes.bass
      }).connect(bassChorus)
    };

    // Create synth with effects chain
    filterRef.current = new Tone.Filter(800, "lowpass").connect(masterGain);
    const delay = new Tone.PingPongDelay("8n", 0.3).connect(masterGain);
    const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(masterGain);

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 }
    }).connect(filterRef.current).connect(delay).connect(chorus);

    // Set up transport
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = "1m";

    // Start visualization
    drawScope();

    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (scopeAnimationRef.current) {
        cancelAnimationFrame(scopeAnimationRef.current);
      }
      Object.values(instrumentsRef.current).forEach(inst => inst.dispose());
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
  }, []);

  // Update BPM
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Update volumes
  useEffect(() => {
    Object.entries(volumes).forEach(([track, volume]) => {
      if (instrumentsRef.current[track]) {
        instrumentsRef.current[track].volume.value = volume;
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
    border: 'rgba(255, 255, 255, 0.2)'
  };

  // Draw scope visualization
  const drawScope = () => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
    ctx.fillRect(0, 0, width, height);

    if (scopeMode === 'waveform' && analyserRef.current) {
      const waveform = analyserRef.current.getValue();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < waveform.length; i++) {
        const x = (i / waveform.length) * width;
        const y = ((waveform[i] + 1) / 2) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    } else if (scopeMode === 'spectrum' && waveformRef.current) {
      const fft = waveformRef.current.getValue();
      const barWidth = width / fft.length;

      fft.forEach((value, i) => {
        const height = (value + 140) * 2;
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
      arpeggiatorRef.current = new Tone.Pattern((time, note) => {
        synthRef.current.triggerAttackRelease(note, "16n", time);
      }, selectedNotes, arpPattern).start(0);

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
      Tone.Transport.schedule((time) => {
        // Update current step
        Tone.Draw.schedule(() => {
          setCurrentStep(stepIndex);
        }, time);

        // Play sounds for this step
        Object.entries(step).forEach(([track, active]) => {
          if (active) {
            if (track === 'kick') {
              instrumentsRef.current.kick.triggerAttackRelease('C2', '8n', time);
            } else if (track === 'snare') {
              instrumentsRef.current.snare.triggerAttackRelease('8n', time);
            } else if (track === 'hihat') {
              instrumentsRef.current.hihat.triggerAttackRelease('C4', '16n', time);
            }
          }
        });

        // Play bass note if present
        if (bassPattern[stepIndex]) {
          instrumentsRef.current.bass.triggerAttackRelease(bassPattern[stepIndex], '16n', time);
        }
      }, `0:0:${stepIndex}`);
    });

    // Schedule the reset at the end of the bar
    Tone.Transport.schedule((time) => {
      Tone.Draw.schedule(() => {
        setCurrentStep(-1);
      }, time);
    }, "0:3:3.5");

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
  const toggleStep = (step, track) => {
    const newPattern = [...pattern];
    newPattern[step] = { ...newPattern[step], [track]: !newPattern[step][track] };
    setPattern(newPattern);
  };

  // Clear pattern
  const clearPattern = () => {
    setPattern(Array(16).fill(null).map(() => ({})));
    setBassPattern(Array(16).fill(null));
  };

  // Clear only drums
  const clearDrums = () => {
    setPattern(Array(16).fill(null).map(() => ({})));
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
  };

  // Dubstep bassline patterns (Bassnectar-inspired)
  const basslinePatterns = [
    // Pattern 1: Classic wobble
    ['E1', null, null, 'E1', null, null, 'E1', null, 'G1', null, null, 'G1', null, null, 'D1', null],
    // Pattern 2: Sub drops
    ['E1', 'E1', null, null, 'E1', null, null, null, 'C1', 'C1', null, null, 'G1', null, null, null],
    // Pattern 3: Syncopated
    ['E1', null, 'E1', null, null, 'G1', null, 'E1', null, null, 'D1', null, 'D1', null, 'C1', null],
    // Pattern 4: Heavy drops
    ['E1', null, null, null, null, null, null, null, 'C1', null, null, null, null, null, null, null],
    // Pattern 5: Rolling bass
    ['E1', 'E1', 'G1', null, 'E1', 'E1', 'D1', null, 'C1', 'C1', 'E1', null, 'G1', 'G1', 'E1', null]
  ];

  // Generate beat with variations
  const generateBeat = () => {
    const basePattern = beatPatterns[beatStyle];
    const newPattern = Array(16).fill(null).map(() => ({}));

    // Apply base pattern with variations
    ['kick', 'snare', 'hihat'].forEach(track => {
      basePattern[track].forEach((hit, index) => {
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
  const toggleBassNote = (step) => {
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
  const cycleBassNote = (step) => {
    const notes = [null, 'C1', 'D1', 'E1', 'G1', 'A1', 'C2', 'D2', 'E2'];
    const newBassPattern = [...bassPattern];
    const currentIndex = notes.indexOf(newBassPattern[step]);
    newBassPattern[step] = notes[(currentIndex + 1) % notes.length];
    setBassPattern(newBassPattern);
  };

  // Keyboard mapping
  const keyToNote = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
    'p': 'D#5', ';': 'E5', "'": 'F5'
  };

  // Keyboard handlers
  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (keyToNote[key] && !activeKeys[key]) {
      setActiveKeys(prev => ({ ...prev, [key]: true }));

      if (arpeggiatorEnabled) {
        // Add note to arpeggiator
        setSelectedNotes(prev => [...new Set([...prev, keyToNote[key]])]);
      } else {
        // Play note directly
        synthRef.current.triggerAttack(keyToNote[key]);
      }
    }
  }, [activeKeys, arpeggiatorEnabled]);

  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    if (keyToNote[key]) {
      setActiveKeys(prev => ({ ...prev, [key]: false }));

      if (arpeggiatorEnabled) {
        // Remove note from arpeggiator
        setSelectedNotes(prev => prev.filter(note => note !== keyToNote[key]));
      } else {
        // Release note directly
        synthRef.current.triggerRelease(keyToNote[key]);
      }
    }
  }, [arpeggiatorEnabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Webcam functionality
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 }
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
      console.error('Error accessing webcam:', err);
      setWebcamEnabled(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setMotionIntensity(0);
  };

  const detectMotion = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !webcamEnabled) return;

    const ctx = canvas.getContext('2d');
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
            const diff = Math.abs(currentFrame.data[i] - previousFrameRef.current.data[i]) +
                         Math.abs(currentFrame.data[i + 1] - previousFrameRef.current.data[i + 1]) +
                         Math.abs(currentFrame.data[i + 2] - previousFrameRef.current.data[i + 2]);
            motion += diff;
          }
          const normalizedMotion = Math.min(motion / (canvas.width * canvas.height * 100), 1);
          setMotionIntensity(normalizedMotion);

          if (filterRef.current) {
            const filterFreq = 200 + (normalizedMotion * 3000);
            filterRef.current.frequency.rampTo(filterFreq, 0.1);
          }
        }

        previousFrameRef.current = currentFrame;
        animationFrameRef.current = requestAnimationFrame(processFrame);
      } catch (err) {
        console.error('Error processing frame:', err);
      }
    };

    processFrame();
  };

  useEffect(() => {
    if (webcamEnabled) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [webcamEnabled]);


  const glowStyle = (color, intensity = 20) => ({
    boxShadow: `0 0 ${intensity}px ${color}40, 0 0 ${intensity * 2}px ${color}20, inset 0 0 ${intensity}px ${color}10`
  });

  return (
    <div className="flex flex-col min-h-screen p-6" style={{
      background: colors.bgGradient,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 tracking-wider" style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 20px ${colors.primaryGlow}40)`
        }}>
          MOTION TRACKER
        </h1>
        <p className="text-sm tracking-widest" style={{ color: colors.textDim }}>
          ELECTRONIC MUSIC SEQUENCER
        </p>
      </div>

      {/* Scope Display */}
      <div className="mb-6 p-4 rounded-2xl"
           style={{
             background: colors.surface,
             border: `1px solid ${colors.border}`,
             backdropFilter: 'blur(10px)'
           }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold tracking-widest" style={{ color: colors.primary }}>
            VISUALIZER
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setScopeMode('waveform')}
              className="px-3 py-1 rounded-lg text-xs font-medium tracking-wider"
              style={{
                background: scopeMode === 'waveform' ? colors.primary : colors.surface,
                color: scopeMode === 'waveform' ? colors.bg : colors.text,
                border: `1px solid ${colors.primary}`
              }}
            >
              WAVEFORM
            </button>
            <button
              onClick={() => setScopeMode('spectrum')}
              className="px-3 py-1 rounded-lg text-xs font-medium tracking-wider"
              style={{
                background: scopeMode === 'spectrum' ? colors.primary : colors.surface,
                color: scopeMode === 'spectrum' ? colors.bg : colors.text,
                border: `1px solid ${colors.primary}`
              }}
            >
              SPECTRUM
            </button>
          </div>
        </div>
        <canvas
          ref={scopeCanvasRef}
          className="w-full h-32 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: `1px solid ${colors.border}`
          }}
        />
      </div>

      {/* Main Controls */}
      <div className="flex gap-6 mb-6 justify-center items-center flex-wrap">
        <button
          onClick={togglePlayback}
          className="relative px-8 py-3 rounded-full font-bold text-lg tracking-wider transition-all duration-300 transform hover:scale-105"
          style={{
            background: isPlaying
              ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`
              : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            color: colors.bg,
            ...glowStyle(isPlaying ? colors.secondaryGlow : colors.primaryGlow, 30),
            border: 'none'
          }}
        >
          {isPlaying ? 'STOP' : 'PLAY'}
        </button>

        <div className="flex items-center gap-3 px-6 py-3 rounded-full"
             style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <label className="text-xs tracking-wider" style={{ color: colors.textDim }}>BPM</label>
          <input
            type="range"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-32"
            style={{ accentColor: colors.primary }}
          />
          <span className="w-12 text-center font-mono font-bold">{bpm}</span>
        </div>

        <button
          onClick={clearPattern}
          className="px-6 py-3 rounded-full font-medium tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.secondary}`,
            color: colors.secondary,
            ...glowStyle(colors.secondaryGlow, 10)
          }}
        >
          CLEAR
        </button>

        <button
          onClick={() => setWebcamEnabled(!webcamEnabled)}
          className="px-6 py-3 rounded-full font-medium tracking-wider transition-all duration-300 hover:scale-105"
          style={{
            background: webcamEnabled ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%)` : colors.surface,
            border: `1px solid ${colors.accent}`,
            ...glowStyle(colors.accentGlow, webcamEnabled ? 20 : 10)
          }}
        >
          MOTION {webcamEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Beat Generator Controls */}
      <div className="flex gap-4 mb-6 justify-center items-center">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full"
             style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <label className="text-xs tracking-wider" style={{ color: colors.textDim }}>STYLE</label>
          <select
            value={beatStyle}
            onChange={(e) => setBeatStyle(e.target.value)}
            className="px-4 py-1 rounded-lg font-medium text-sm"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              outline: 'none'
            }}
          >
            <option value="boom-bap" style={{ background: colors.bg }}>BOOM BAP</option>
            <option value="trap" style={{ background: colors.bg }}>TRAP</option>
            <option value="bounce" style={{ background: colors.bg }}>BOUNCE</option>
            <option value="drill" style={{ background: colors.bg }}>DRILL</option>
          </select>
        </div>

        <button
          onClick={generateBeat}
          className="px-6 py-3 rounded-full font-medium tracking-wider transition-all duration-300 hover:scale-105 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
            color: colors.bg,
            ...glowStyle(colors.primaryGlow, 20)
          }}
        >
          <span style={{ fontSize: '16px' }}>🎲</span>
          GENERATE BEAT
        </button>

        <button
          onClick={generateBassline}
          className="px-6 py-3 rounded-full font-medium tracking-wider transition-all duration-300 hover:scale-105 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%)`,
            color: colors.bg,
            ...glowStyle(colors.accentGlow, 20)
          }}
        >
          <span style={{ fontSize: '16px' }}>🔊</span>
          GENERATE BASS
        </button>
      </div>

      {/* Motion Visualizer */}
      {webcamEnabled && (
        <div className="mb-6 mx-auto">
          <div className="text-xs tracking-wider mb-2 text-center" style={{ color: colors.textDim }}>
            MOTION INTENSITY
          </div>
          <div className="w-80 h-2 rounded-full overflow-hidden"
               style={{
                 background: colors.surface,
                 ...glowStyle(colors.accentGlow, 5)
               }}>
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${motionIntensity * 100}%`,
                background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.secondary} 100%)`,
                ...glowStyle(colors.accentGlow, 15)
              }}
            />
          </div>
        </div>
      )}

      {/* Sequencer Section */}
      <div className="mb-6 p-6 rounded-2xl"
           style={{
             background: colors.surface,
             border: `1px solid ${colors.border}`,
             backdropFilter: 'blur(10px)'
           }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold tracking-widest" style={{ color: colors.primary }}>
            DRUM SEQUENCER
          </h3>
          <button
            onClick={clearDrums}
            className="px-4 py-1 rounded-lg text-xs font-medium tracking-wider"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.secondary}`,
              color: colors.secondary
            }}
          >
            CLEAR DRUMS
          </button>
        </div>

        {/* Beat indicators */}
        <div className="grid grid-cols-17 gap-1 mb-3">
          <div></div>
          {[...Array(16)].map((_, i) => (
            <div key={i} className="text-center">
              {i % 4 === 0 && (
                <div className="text-xs font-bold" style={{ color: colors.primary }}>
                  {i / 4 + 1}
                </div>
              )}
              <div className="text-xs" style={{
                color: i % 4 === 0 ? colors.text : colors.textDim,
                opacity: i % 4 === 0 ? 1 : 0.3
              }}>
                •
              </div>
            </div>
          ))}
        </div>

        {['kick', 'snare', 'hihat'].map(track => (
          <div key={track} className="grid grid-cols-18 gap-1 mb-2">
            <div className="flex items-center justify-between px-3 text-sm font-medium tracking-wider uppercase"
                 style={{ color: colors.text }}>
              <span>{track}</span>
              <input
                type="range"
                min="-30"
                max="0"
                value={volumes[track]}
                onChange={(e) => setVolumes(prev => ({ ...prev, [track]: Number(e.target.value) }))}
                className="w-16 h-2"
                style={{ accentColor: colors.primary }}
                title={`${track} volume: ${volumes[track]}dB`}
              />
            </div>
            {[...Array(16)].map((_, i) => (
              <button
                key={i}
                onClick={() => toggleStep(i, track)}
                className="h-10 rounded-lg transition-all duration-200 transform hover:scale-110"
                style={{
                  background: pattern[i][track]
                    ? currentStep === i
                      ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`
                      : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                    : currentStep === i
                      ? colors.surfaceHover
                      : colors.surface,
                  border: `1px solid ${
                    currentStep === i ? colors.secondary :
                    pattern[i][track] ? colors.primary :
                    i % 4 === 0 ? colors.border : 'transparent'
                  }`,
                  ...(pattern[i][track] ? glowStyle(currentStep === i ? colors.secondaryGlow : colors.primaryGlow, 15) : {})
                }}
              />
            ))}
          </div>
        ))}

        {/* Bass track */}
        <div className="mt-4 pt-4" style={{ borderTop: `2px solid ${colors.border}` }}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold tracking-widest" style={{ color: colors.accent }}>
              BASS SEQUENCER
            </h4>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs" style={{ color: colors.textDim }}>WOBBLE</label>
                <select
                  value={wobbleRate}
                  onChange={(e) => setWobbleRate(e.target.value)}
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    outline: 'none'
                  }}
                >
                  <option value="4n" style={{ background: colors.bg }}>1/4</option>
                  <option value="8n" style={{ background: colors.bg }}>1/8</option>
                  <option value="16n" style={{ background: colors.bg }}>1/16</option>
                  <option value="32n" style={{ background: colors.bg }}>1/32</option>
                </select>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={wobbleDepth}
                  onChange={(e) => setWobbleDepth(Number(e.target.value))}
                  className="w-16 h-2"
                  style={{ accentColor: colors.accent }}
                  title={`Wobble depth: ${(wobbleDepth * 100).toFixed(0)}%`}
                />
              </div>
              <button
                onClick={clearBass}
                className="px-3 py-1 rounded-lg text-xs font-medium tracking-wider"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.secondary}`,
                  color: colors.secondary
                }}
              >
                CLEAR BASS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-18 gap-1 mb-2">
            <div className="flex items-center justify-between px-3 text-sm font-medium tracking-wider uppercase"
                 style={{ color: colors.accent }}>
              <span>BASS</span>
              <input
                type="range"
                min="-30"
                max="0"
                value={volumes.bass}
                onChange={(e) => setVolumes(prev => ({ ...prev, bass: Number(e.target.value) }))}
                className="w-16 h-2"
                style={{ accentColor: colors.accent }}
                title={`Bass volume: ${volumes.bass}dB`}
              />
            </div>
            {[...Array(16)].map((_, i) => (
              <button
                key={i}
                onClick={() => toggleBassNote(i)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  cycleBassNote(i);
                }}
                className="h-10 rounded-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center text-xs font-mono"
                style={{
                  background: bassPattern[i]
                    ? currentStep === i
                      ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%)`
                      : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`
                    : currentStep === i
                      ? colors.surfaceHover
                      : colors.surface,
                  border: `1px solid ${
                    currentStep === i ? colors.accent :
                    bassPattern[i] ? colors.accent :
                    i % 4 === 0 ? colors.border : 'transparent'
                  }`,
                  ...(bassPattern[i] ? glowStyle(colors.accentGlow, 15) : {}),
                  color: bassPattern[i] ? colors.bg : colors.textDim
                }}
              >
                {bassPattern[i] ? bassPattern[i].replace('1', '').replace('2', '') : ''}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-center mt-2" style={{ color: colors.textDim }}>
          Left-click to toggle • Right-click to change note
        </div>
      </div>

      {/* Arpeggiator Controls */}
      <div className="mb-4 p-4 rounded-2xl flex items-center justify-center gap-6"
           style={{
             background: colors.surface,
             border: `1px solid ${colors.border}`,
             backdropFilter: 'blur(10px)'
           }}>
        <button
          onClick={() => setArpeggiatorEnabled(!arpeggiatorEnabled)}
          className="px-6 py-2 rounded-full font-medium tracking-wider transition-all duration-300"
          style={{
            background: arpeggiatorEnabled
              ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`
              : colors.surface,
            border: `1px solid ${colors.primary}`,
            ...(arpeggiatorEnabled ? glowStyle(colors.primaryGlow, 15) : {})
          }}
        >
          ARP {arpeggiatorEnabled ? 'ON' : 'OFF'}
        </button>

        {arpeggiatorEnabled && (
          <>
            <select
              value={arpPattern}
              onChange={(e) => setArpPattern(e.target.value)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                outline: 'none'
              }}
            >
              <option value="up" style={{ background: colors.bg }}>UP</option>
              <option value="down" style={{ background: colors.bg }}>DOWN</option>
              <option value="upDown" style={{ background: colors.bg }}>UP/DOWN</option>
              <option value="random" style={{ background: colors.bg }}>RANDOM</option>
            </select>

            <select
              value={arpSpeed}
              onChange={(e) => setArpSpeed(e.target.value)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                outline: 'none'
              }}
            >
              <option value="4n" style={{ background: colors.bg }}>1/4</option>
              <option value="8n" style={{ background: colors.bg }}>1/8</option>
              <option value="16n" style={{ background: colors.bg }}>1/16</option>
              <option value="32n" style={{ background: colors.bg }}>1/32</option>
            </select>
          </>
        )}
      </div>

      {/* Keyboard Section */}
      <div className="flex-1 p-6 rounded-2xl"
           style={{
             background: colors.surface,
             border: `1px solid ${colors.border}`,
             backdropFilter: 'blur(10px)'
           }}>
        <h3 className="text-sm font-bold tracking-widest mb-4" style={{ color: colors.primary }}>
          SYNTHESIZER {arpeggiatorEnabled && '• ARPEGGIATOR MODE'}
        </h3>
        <div className="flex gap-1 justify-center items-end">
          {Object.entries(keyToNote).map(([key, note]) => {
            const isBlackKey = note.includes('#');
            const blackKeyPositions = { 'w': -15, 'e': 15, 't': -15, 'y': 0, 'u': 15, 'o': -15, 'p': 15 };

            return (
              <div
                key={key}
                className="relative"
                style={{
                  width: isBlackKey ? '0px' : '45px',
                  marginLeft: isBlackKey ? blackKeyPositions[key] + 'px' : '0'
                }}
              >
                <button
                  className="transition-all duration-200 transform hover:scale-105"
                  style={{
                    width: isBlackKey ? '35px' : '45px',
                    height: isBlackKey ? '100px' : '150px',
                    background: activeKeys[key]
                      ? `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`
                      : isBlackKey
                        ? 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'
                        : 'linear-gradient(180deg, #fafafa 0%, #e0e0e0 100%)',
                    border: `1px solid ${isBlackKey ? '#000' : '#999'}`,
                    ...(activeKeys[key] ? glowStyle(colors.primaryGlow, 20) : {}),
                    position: isBlackKey ? 'absolute' : 'relative',
                    zIndex: isBlackKey ? 10 : 1,
                    borderRadius: '0 0 8px 8px',
                    cursor: 'pointer'
                  }}
                >
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-xs font-bold"
                         style={{ color: activeKeys[key] ? colors.bg : (isBlackKey ? '#fff' : '#000') }}>
                      {key.toUpperCase()}
                    </div>
                    <div className="text-xs mt-1"
                         style={{ color: activeKeys[key] ? colors.bg : (isBlackKey ? '#999' : '#666') }}>
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
      <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default MusicTracker;
