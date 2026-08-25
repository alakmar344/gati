'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Trophy, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  QrCode,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCurrentUser } from '@/lib/storage';

export default function AdttSimulatorPage() {
  const currentUser = getCurrentUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Selected Track
  const [selectedTrack, setSelectedTrack] = useState<'eight' | 'parking' | 'reverse_s'>('eight');
  
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(100);
  const [faults, setFaults] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  // Car Physics State
  const carState = useRef({
    x: 100,
    y: 200,
    angle: 0,
    speed: 0,
    maxSpeed: 2.2,
    steering: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const startTrack = (track: 'eight' | 'parking' | 'reverse_s') => {
    setSelectedTrack(track);
    setScore(100);
    setFaults([]);
    setTimeElapsed(0);
    setIsPassed(false);
    setIsFailed(false);
    setIsPlaying(true);

    if (track === 'eight') {
      carState.current = { x: 70, y: 150, angle: 0, speed: 0, maxSpeed: 2.2, steering: 0 };
    } else if (track === 'parking') {
      carState.current = { x: 60, y: 80, angle: 0, speed: 0, maxSpeed: 1.8, steering: 0 };
    } else {
      carState.current = { x: 60, y: 220, angle: 0, speed: 0, maxSpeed: 1.8, steering: 0 };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let timerInterval: any;

    if (isPlaying) {
      timerInterval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    const render = () => {
      // Clear background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Specific Track Boundaries
      if (selectedTrack === 'eight') {
        // Draw 8 Figure
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 36;
        ctx.lineCap = 'round';

        // Left circle
        ctx.beginPath();
        ctx.arc(180, 150, 65, 0, Math.PI * 2);
        ctx.stroke();

        // Right circle
        ctx.beginPath();
        ctx.arc(380, 150, 65, 0, Math.PI * 2);
        ctx.stroke();

        // Inner safe path
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 26;
        ctx.beginPath();
        ctx.arc(180, 150, 65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(380, 150, 65, 0, Math.PI * 2);
        ctx.stroke();

        // Finish Line Box
        ctx.fillStyle = '#10b981';
        ctx.fillRect(490, 135, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('FINISH', 492, 153);
      } else if (selectedTrack === 'parking') {
        // Parallel Parking Track
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6;
        ctx.strokeRect(40, 40, 480, 220);

        // Parking Bay
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(360, 160, 120, 70);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(360, 160, 120, 70);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('PARK HERE', 390, 200);
      } else {
        // Reverse S Bend
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 32;
        ctx.beginPath();
        ctx.moveTo(60, 220);
        ctx.bezierCurveTo(200, 220, 200, 80, 340, 80);
        ctx.bezierCurveTo(460, 80, 460, 220, 520, 220);
        ctx.stroke();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(60, 220);
        ctx.bezierCurveTo(200, 220, 200, 80, 340, 80);
        ctx.bezierCurveTo(460, 80, 460, 220, 520, 220);
        ctx.stroke();

        // Finish Line
        ctx.fillStyle = '#10b981';
        ctx.fillRect(490, 205, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('GOAL', 495, 223);
      }

      // Update Car Movement if Playing
      if (isPlaying && !isPassed && !isFailed) {
        const car = carState.current;

        if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W']) {
          car.speed = Math.min(car.speed + 0.1, car.maxSpeed);
        } else if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S']) {
          car.speed = Math.max(car.speed - 0.1, -car.maxSpeed / 2);
        } else {
          car.speed *= 0.92;
        }

        if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) {
          car.angle -= 0.045 * (car.speed !== 0 ? Math.sign(car.speed) : 0);
        }
        if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) {
          car.angle += 0.045 * (car.speed !== 0 ? Math.sign(car.speed) : 0);
        }

        car.x += Math.cos(car.angle) * car.speed;
        car.y += Math.sin(car.angle) * car.speed;

        // Boundary bounds
        if (car.x < 20 || car.x > canvas.width - 20 || car.y < 20 || car.y > canvas.height - 20) {
          // Kerb collision
          car.speed = -car.speed * 0.5;
          setScore(s => Math.max(0, s - 10));
          setFaults(f => [...f.slice(-3), 'Kerb sensor boundary contact (-10 Pts)']);
        }

        // Check Goal
        if (selectedTrack === 'eight' && car.x > 480 && car.y > 120 && car.y < 170) {
          setIsPassed(true);
          setIsPlaying(false);
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        } else if (selectedTrack === 'parking' && car.x > 360 && car.x < 470 && car.y > 160 && car.y < 220 && Math.abs(car.speed) < 0.1) {
          setIsPassed(true);
          setIsPlaying(false);
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        } else if (selectedTrack === 'reverse_s' && car.x > 490 && car.y > 190 && car.y < 240) {
          setIsPassed(true);
          setIsPlaying(false);
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        }
      }

      // Draw Car
      const car = carState.current;
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Car Body
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 16, 4);
      ctx.fill();

      // Roof & Windshield
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(-6, -6, 12, 12);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12, -7, 2, 4);
      ctx.fillRect(12, 3, 2, 4);

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-14, -7, 2, 4);
      ctx.fillRect(-14, 3, 2, 4);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isPlaying, selectedTrack, isPassed, isFailed]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Interactive RTO Sensor Track Practice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ADTT Driving Test Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Master the official Indian automated sensor test track maneuvers (8-Figure, Parallel Parking & Reverse &apos;S&apos;) before your RTO appointment.
        </p>
      </div>

      {/* Track Selector & Score HUD */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Track Selector Buttons */}
        <div className="flex items-center gap-2 text-xs font-bold w-full md:w-auto">
          {[
            { id: 'eight', label: '♾️ 8-Figure Maneuver' },
            { id: 'parking', label: '🅿️ Parallel Parking Box' },
            { id: 'reverse_s', label: '🔄 Reverse S-Bend Track' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => startTrack(t.id as any)}
              className={`px-4 py-2 rounded-full transition-all flex-1 md:flex-none ${
                selectedTrack === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Live HUD Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2 px-3 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Time</span>
            <span className="font-bold text-slate-900">{timeElapsed}s</span>
          </div>

          <div className="p-2 px-3 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase">Sensor Score</span>
            <span className={`font-bold ${score >= 80 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {score} / 100
            </span>
          </div>

          <button
            onClick={() => startTrack(selectedTrack)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Restart Track"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Interactive Simulator Screen */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-2xl flex flex-col items-center justify-center space-y-6">
        
        {/* Canvas Area */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={560}
            height={300}
            className="max-w-full h-auto block select-none"
          />

          {/* Overlay Result Badge */}
          {isPassed && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ADTT Track Cleared!
              </h3>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Final Sensor Score: {score}/100 • Completed in {timeElapsed} seconds
              </p>
              <div className="flex gap-3 mt-5 text-xs font-bold">
                <button
                  onClick={() => startTrack(selectedTrack)}
                  className="px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100"
                >
                  Retry Maneuver
                </button>
                <Link
                  href="/driver-licence"
                  className="px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  Book Official Slot
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Controls Guide & On-Screen D-Pad */}
        <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="space-y-1 text-slate-500 text-center sm:text-left">
            <span className="font-bold text-slate-800 block">Keyboard Controls:</span>
            <div>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800">▲</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800">W</kbd> Accelerate</div>
            <div>Use <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800">◀</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800">▶</kbd> Steer & Reverse</div>
          </div>

          {/* On-screen touch buttons for mobile/mouse */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onMouseDown={() => { keysPressed.current['ArrowUp'] = true; }}
              onMouseUp={() => { keysPressed.current['ArrowUp'] = false; }}
              className="w-10 h-10 rounded-xl bg-slate-200 active:bg-slate-300 font-bold flex items-center justify-center shadow-xs"
            >
              ▲
            </button>
            <div className="flex gap-1.5">
              <button
                onMouseDown={() => { keysPressed.current['ArrowLeft'] = true; }}
                onMouseUp={() => { keysPressed.current['ArrowLeft'] = false; }}
                className="w-10 h-10 rounded-xl bg-slate-200 active:bg-slate-300 font-bold flex items-center justify-center shadow-xs"
              >
                ◀
              </button>
              <button
                onMouseDown={() => { keysPressed.current['ArrowDown'] = true; }}
                onMouseUp={() => { keysPressed.current['ArrowDown'] = false; }}
                className="w-10 h-10 rounded-xl bg-slate-200 active:bg-slate-300 font-bold flex items-center justify-center shadow-xs"
              >
                ▼
              </button>
              <button
                onMouseDown={() => { keysPressed.current['ArrowRight'] = true; }}
                onMouseUp={() => { keysPressed.current['ArrowRight'] = false; }}
                className="w-10 h-10 rounded-xl bg-slate-200 active:bg-slate-300 font-bold flex items-center justify-center shadow-xs"
              >
                ▶
              </button>
            </div>
          </div>

        </div>

        {/* Live Fault Logs */}
        {faults.length > 0 && (
          <div className="w-full max-w-lg p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Sensor Penalties Recorded:
            </span>
            {faults.map((f, i) => (
              <div key={i} className="text-[11px]">• {f}</div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
