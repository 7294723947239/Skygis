'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TimeControllerProps {
  onDateChange?: (jde: number) => void;
  onSpeedChange?: (speed: number) => void;
}

export default function TimeController({ onDateChange, onSpeedChange }: TimeControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // days per second
  const [currentJDE, setCurrentJDE] = useState(dateToJDE(new Date().toISOString().split('T')[0]));
  const [displayDate, setDisplayDate] = useState(new Date().toISOString().split('T')[0]);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(speed);
  const onDateChangeRef = useRef(onDateChange);

  speedRef.current = speed;
  onDateChangeRef.current = onDateChange;

  function dateToJDE(dateStr: string): number {
    return new Date(dateStr).getTime() / 86400000 + 2440587.5;
  }

  function jdeToDate(jde: number): string {
    const ms = (jde - 2440587.5) * 86400000;
    return new Date(ms).toISOString().split('T')[0];
  }

  const animate = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = (timestamp - lastTimeRef.current) / 1000; // seconds
    lastTimeRef.current = timestamp;

    setCurrentJDE(prev => {
      const newJDE = prev + speedRef.current * dt;
      setDisplayDate(jdeToDate(newJDE));
      onDateChangeRef.current?.(newJDE);
      return newJDE;
    });

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animRef.current);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, animate]);

  const handleDateInput = (dateStr: string) => {
    setDisplayDate(dateStr);
    const jde = dateToJDE(dateStr);
    setCurrentJDE(jde);
    onDateChange?.(jde);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
  };

  const speedOptions = [
    { label: '1天/秒', value: 1 },
    { label: '7天/秒', value: 7 },
    { label: '30天/秒', value: 30 },
    { label: '365天/秒', value: 365 },
    { label: '10年/秒', value: 3650 },
  ];

  const formatJDE = (jde: number) => {
    const ms = (jde - 2440587.5) * 86400000;
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-auto
      bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-4 shadow-xl backdrop-blur-sm">
      {/* Play/Pause */}
      <button onClick={() => setIsPlaying(!isPlaying)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
          ${isPlaying ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5L12 7L3 12.5Z"/></svg>
        )}
      </button>

      {/* Date display */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-mono">JDE</span>
        <input type="date" value={displayDate} onChange={e => handleDateInput(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 font-mono
            focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        <span className="text-xs text-slate-400 font-mono w-28">{formatJDE(currentJDE)}</span>
      </div>

      {/* Speed controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500 mr-1">速度</span>
        {speedOptions.map(opt => (
          <button key={opt.value} onClick={() => handleSpeedChange(opt.value)}
            className={`px-2 py-0.5 rounded text-xs transition-all
              ${speed === opt.value ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reset */}
      <button onClick={() => { handleDateInput(new Date().toISOString().split('T')[0]); setIsPlaying(false); }}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
        重置
      </button>
    </div>
  );
}
