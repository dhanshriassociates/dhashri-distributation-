import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CloudRain, Music, Waves, Disc, CheckCircle } from 'lucide-react';
import { soundscapeEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

const MODES = {
  work: { label: 'Deep Focus Work', time: 25 * 60, color: '#8B5CF6' },
  shortBreak: { label: 'Short Break', time: 5 * 60, color: '#06B6D4' },
  longBreak: { label: 'Long Break', time: 15 * 60, color: '#10B981' }
};

export default function FocusTimer({ tasks, onLogTaskTime }) {
  const [activeMode, setActiveMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.time);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Audio Soundscape State
  const [audioPreset, setAudioPreset] = useState('rain');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      soundscapeEngine.stop();
      setIsAudioPlaying(false);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

      if (activeMode === 'work') {
        setSessionsCompleted(prev => prev + 1);
        if (selectedTaskId) {
          // Log 0.42 hrs (25 mins) to selected task
          onLogTaskTime(selectedTaskId, 0.42);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeMode, selectedTaskId, onLogTaskTime]);

  const switchMode = (modeKey) => {
    setActiveMode(modeKey);
    setTimeLeft(MODES[modeKey].time);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);

    if (nextState && isAudioPlaying) {
      soundscapeEngine.start(audioPreset, volume);
    } else if (!nextState && isAudioPlaying) {
      soundscapeEngine.stop();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[activeMode].time);
    soundscapeEngine.stop();
    setIsAudioPlaying(false);
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      soundscapeEngine.stop();
      setIsAudioPlaying(false);
    } else {
      soundscapeEngine.start(audioPreset, volume);
      setIsAudioPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    soundscapeEngine.setVolume(newVol);
  };

  const changePreset = (presetId) => {
    setAudioPreset(presetId);
    if (isAudioPlaying) {
      soundscapeEngine.start(presetId, volume);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = MODES[activeMode].time;
  const progressPct = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div style={{ padding: '2rem 1.8rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Mode Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2.5rem' }}>
        {Object.keys(MODES).map(mKey => (
          <button
            key={mKey}
            onClick={() => switchMode(mKey)}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: activeMode === mKey ? MODES[mKey].color : 'var(--border-subtle)',
              background: activeMode === mKey ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeMode === mKey ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {MODES[mKey].label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        
        {/* Main Countdown Radial Timer */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* SVG Circular Ring */}
            <svg width="240" height="240" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle
                cx="120"
                cy="120"
                r="100"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="120"
                cy="120"
                r="100"
                stroke={MODES[activeMode].color}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progressPct / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>

            {/* Time Digital Text Display */}
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <h1 style={{ fontSize: '3.2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.03em', color: '#FFF' }}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </h1>
              <span style={{ fontSize: '0.8rem', color: MODES[activeMode].color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {MODES[activeMode].label}
              </span>
            </div>

          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={toggleTimer} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pause' : 'Start Focus'}
            </button>

            <button onClick={resetTimer} className="btn-secondary" style={{ padding: '0.8rem 1.2rem' }} title="Reset Timer">
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Task Linker */}
          <div style={{ width: '100%', marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              🎯 Link Focus Session to Task (Auto-log hours)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.84rem' }}
            >
              <option value="">No task linked (Standalone timer)</option>
              {tasks.filter(t => t.status !== 'done').map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.loggedHours || 0}h / {t.estimatedHours || 0}h)</option>
              ))}
            </select>
          </div>

        </div>

        {/* Web Audio Ambient Soundscapes Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ambient Soundscapes</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Web Audio Binaural Synth</p>
            </div>

            <button
              onClick={toggleAudio}
              className="btn-secondary"
              style={{
                background: isAudioPlaying ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isAudioPlaying ? '#10B981' : 'var(--border-subtle)',
                color: isAudioPlaying ? '#10B981' : 'var(--text-muted)'
              }}
            >
              {isAudioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {isAudioPlaying ? 'Playing' : 'Muted'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { id: 'rain', name: 'Rainfall', icon: CloudRain },
              { id: 'lofi', name: 'Lofi Chill', icon: Music },
              { id: 'waves', name: 'Ocean Waves', icon: Waves },
              { id: 'focus', name: 'Deep Focus', icon: Disc }
            ].map(p => {
              const Icon = p.icon;
              const isSelected = audioPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => changePreset(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-subtle)',
                    background: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                    color: isSelected ? '#FFF' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} color={isSelected ? 'var(--accent-color)' : 'var(--text-dim)'} />
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Volume Control</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              style={{ width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
            />
          </div>

          {/* Sessions Counter Badge */}
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Completed Sessions Today: <strong style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>{sessionsCompleted}</strong>
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
