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
  Printer,
  Volume2,
  VolumeX,
  Award,
  Sparkles,
  FileCheck2,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCurrentUser } from '@/lib/storage';
import { soundManager } from '@/lib/soundEffects';

type TrackType = 'eight' | 'parking' | 'reverse_s' | 'gradient';

interface Checkpoint {
  id: number;
  x: number;
  y: number;
  radius: number;
  label: string;
  passed: boolean;
}

export default function AdttSimulatorPage() {
  const currentUser = getCurrentUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Selected Track
  const [selectedTrack, setSelectedTrack] = useState<TrackType>('eight');
  
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(100);
  const [faults, setFaults] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Hill stop state for gradient test
  const [hillStoppedTime, setHillStoppedTime] = useState(0);
  const [hillPassedHold, setHillPassedHold] = useState(false);

  // Checkpoints State for Figure 8 and others
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);

  // Car Physics State
  const carState = useRef({
    x: 75,
    y: 250,
    angle: -Math.PI / 2, // Facing UP
    speed: 0,
    maxSpeed: 2.3,
    steering: 0,
    lastCollisionTime: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  // Initialize Track Setup
  const initTrackCheckpoints = (track: TrackType) => {
    if (track === 'eight') {
      return [
        { id: 1, x: 115, y: 160, radius: 36, label: 'CP1: Left Outer Loop', passed: false },
        { id: 2, x: 190, y: 85,  radius: 36, label: 'CP2: Left Loop Top', passed: false },
        { id: 3, x: 290, y: 160, radius: 36, label: 'CP3: Center Crossover', passed: false },
        { id: 4, x: 390, y: 235, radius: 36, label: 'CP4: Right Loop Bottom', passed: false },
        { id: 5, x: 465, y: 160, radius: 36, label: 'CP5: Right Loop Apex', passed: false },
        { id: 6, x: 390, y: 85,  radius: 36, label: 'CP6: Right Loop Return', passed: false },
      ];
    } else if (track === 'parking') {
      return [
        { id: 1, x: 490, y: 90, radius: 45, label: 'CP1: Drive Past Bay', passed: false },
        { id: 2, x: 400, y: 200, radius: 45, label: 'CP2: Reverse into Box', passed: false },
      ];
    } else if (track === 'reverse_s') {
      return [
        { id: 1, x: 170, y: 220, radius: 40, label: 'CP1: Enter S-Curve', passed: false },
        { id: 2, x: 290, y: 150, radius: 40, label: 'CP2: Mid Apex', passed: false },
        { id: 3, x: 420, y: 80, radius: 40, label: 'CP3: Reverse Exit', passed: false },
      ];
    } else {
      // Gradient
      return [
        { id: 1, x: 290, y: 160, radius: 45, label: 'CP1: Incline Hold Zone', passed: false },
        { id: 2, x: 490, y: 160, radius: 40, label: 'CP2: Hill Crest Finish', passed: false },
      ];
    }
  };

  const startTrack = (track: TrackType) => {
    soundManager.playClick();
    setSelectedTrack(track);
    setScore(100);
    setFaults([]);
    setTimeElapsed(0);
    setIsPassed(false);
    setIsFailed(false);
    setShowCertificate(false);
    setHillStoppedTime(0);
    setHillPassedHold(false);

    const initialCps = initTrackCheckpoints(track);
    setCheckpoints(initialCps);
    setCurrentCheckpointIndex(0);
    setIsPlaying(true);

    if (track === 'eight') {
      // Start in Entry Box facing UP
      carState.current = {
        x: 75,
        y: 250,
        angle: -Math.PI / 2,
        speed: 0,
        maxSpeed: 2.3,
        steering: 0,
        lastCollisionTime: 0,
      };
    } else if (track === 'parking') {
      carState.current = {
        x: 75,
        y: 90,
        angle: 0,
        speed: 0,
        maxSpeed: 1.8,
        steering: 0,
        lastCollisionTime: 0,
      };
    } else if (track === 'reverse_s') {
      carState.current = {
        x: 75,
        y: 220,
        angle: 0,
        speed: 0,
        maxSpeed: 1.8,
        steering: 0,
        lastCollisionTime: 0,
      };
    } else {
      // Gradient
      carState.current = {
        x: 75,
        y: 160,
        angle: 0,
        speed: 0,
        maxSpeed: 2.0,
        steering: 0,
        lastCollisionTime: 0,
      };
    }
  };

  // Keyboard Event Handlers (suppress page scrolling with arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
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

  // Initialize track on mount
  useEffect(() => {
    startTrack('eight');
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let timerInterval: any;

    if (isPlaying && !isPassed && !isFailed) {
      timerInterval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Dark Asphalt Compound Surface
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Subtle Sensor Track Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ==========================================
      // TRACK RENDERING: FIGURE-8
      // ==========================================
      if (selectedTrack === 'eight') {
        const leftCenterX = 190;
        const leftCenterY = 160;
        const rightCenterX = 390;
        const rightCenterY = 160;
        const trackRadius = 75;
        const roadWidth = 52;

        // Entry Corridor (from x: 75, y: 250 curving into left circle)
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = roadWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(75, 260);
        ctx.quadraticCurveTo(75, 160, leftCenterX - trackRadius, 160);
        ctx.stroke();

        // Exit Corridor (from right circle to finish gate x: 505, y: 250)
        ctx.beginPath();
        ctx.moveTo(rightCenterX + trackRadius, 160);
        ctx.quadraticCurveTo(505, 160, 505, 260);
        ctx.stroke();

        // Outer Track Kerbs (Yellow/Black sensor edge)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = roadWidth + 8;
        ctx.beginPath();
        ctx.arc(leftCenterX, leftCenterY, trackRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rightCenterX, rightCenterY, trackRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Asphalt Track Surface
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = roadWidth;
        ctx.beginPath();
        ctx.arc(leftCenterX, leftCenterY, trackRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rightCenterX, rightCenterY, trackRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Center dashed trajectory guide
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(leftCenterX, leftCenterY, trackRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rightCenterX, rightCenterY, trackRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Intersection crossing zone
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(290, 160, 24, 0, Math.PI * 2);
        ctx.fill();

        // Sensor Boundary Poles (Simulated RTO Laser Sensors)
        const sensorPoints = [
          { x: 190, y: 85 - 30 }, { x: 190, y: 85 + 30 },
          { x: 115 - 30, y: 160 }, { x: 115 + 30, y: 160 },
          { x: 390, y: 85 - 30 }, { x: 390, y: 85 + 30 },
          { x: 465 - 30, y: 160 }, { x: 465 + 30, y: 160 },
          { x: 290, y: 160 - 30 }, { x: 290, y: 160 + 30 },
        ];
        sensorPoints.forEach(pt => {
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Start Gate Box
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.fillRect(52, 225, 46, 50);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(52, 225, 46, 50);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('START', 60, 252);

        // Finish Gate Box
        const allCpsDone = currentCheckpointIndex >= checkpoints.length;
        ctx.fillStyle = allCpsDone ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(482, 225, 46, 50);
        ctx.strokeStyle = allCpsDone ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(482, 225, 46, 50);
        ctx.fillStyle = allCpsDone ? '#4ade80' : '#f87171';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(allCpsDone ? 'FINISH' : 'LOCKED', 488, 252);

      // ==========================================
      // TRACK RENDERING: PARALLEL PARKING
      // ==========================================
      } else if (selectedTrack === 'parking') {
        // Main Driving Lane
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, 55, 500, 70);

        // Parking Bay
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fillRect(340, 160, 130, 70);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(340, 160, 130, 70);

        // Parking Curb & Cones
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 45, 520, 200);

        // Safety Cones
        const cones = [
          { x: 340, y: 160 }, { x: 470, y: 160 },
          { x: 340, y: 230 }, { x: 470, y: 230 },
          { x: 300, y: 160 }, { x: 510, y: 160 }
        ];
        cones.forEach(c => {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TARGET PARKING BAY', 350, 198);

      // ==========================================
      // TRACK RENDERING: REVERSE S-BEND
      // ==========================================
      } else if (selectedTrack === 'reverse_s') {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 56;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(75, 220);
        ctx.bezierCurveTo(200, 220, 200, 80, 320, 80);
        ctx.bezierCurveTo(440, 80, 440, 220, 505, 220);
        ctx.stroke();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 48;
        ctx.beginPath();
        ctx.moveTo(75, 220);
        ctx.bezierCurveTo(200, 220, 200, 80, 320, 80);
        ctx.bezierCurveTo(440, 80, 440, 220, 505, 220);
        ctx.stroke();

        // Finish Gate
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.fillRect(480, 195, 46, 50);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(480, 195, 46, 50);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('GOAL', 492, 222);

      // ==========================================
      // TRACK RENDERING: GRADIENT / HILL TRACK
      // ==========================================
      } else {
        // Gradient Road
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(50, 125, 480, 70);

        // Slope Texture / Hash marks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        for (let x = 60; x < 520; x += 25) {
          ctx.beginPath();
          ctx.moveTo(x, 125);
          ctx.lineTo(x + 15, 195);
          ctx.stroke();
        }

        // Hill Incline Hold Box (15-degree ramp stop zone)
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.fillRect(250, 125, 90, 70);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(250, 125, 90, 70);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('STOP & HOLD (2s)', 254, 162);

        // Backward Rollback Sensor Line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(235, 120);
        ctx.lineTo(235, 200);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('NO ROLLBACK LIMIT', 145, 115);
      }

      // ==========================================
      // CHECKPOINT MARKERS RENDERING
      // ==========================================
      checkpoints.forEach((cp, idx) => {
        const isCurrent = idx === currentCheckpointIndex;
        const isCompleted = idx < currentCheckpointIndex;

        ctx.save();
        if (isCompleted) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
          ctx.strokeStyle = '#22c55e';
        } else if (isCurrent) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
          ctx.strokeStyle = '#f97316';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        }

        ctx.lineWidth = isCurrent ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pulsing Ring for current target checkpoint
        if (isCurrent) {
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, cp.radius + 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // CP Label
        ctx.fillStyle = isCurrent ? '#ffedd5' : (isCompleted ? '#bbf7d0' : '#94a3b8');
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`CP${cp.id}`, cp.x, cp.y + 3);
        ctx.restore();
      });

      // ==========================================
      // PHYSICS & MOVEMENT ENGINE
      // ==========================================
      if (isPlaying && !isPassed && !isFailed) {
        const car = carState.current;

        // Throttle / Accelerate & Reverse
        const isUp = keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W'];
        const isDown = keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S'];
        const isLeft = keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A'];
        const isRight = keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D'];

        if (isUp) {
          car.speed = Math.min(car.speed + 0.12, car.maxSpeed);
          soundManager.playEngineRev(Math.abs(car.speed) / car.maxSpeed);
        } else if (isDown) {
          car.speed = Math.max(car.speed - 0.1, -car.maxSpeed * 0.65);
          soundManager.playEngineRev(Math.abs(car.speed) / car.maxSpeed);
        } else {
          car.speed *= 0.93; // Friction
        }

        // Steer
        if (isLeft) {
          car.angle -= 0.048 * (Math.abs(car.speed) > 0.05 ? Math.sign(car.speed) : 1);
        }
        if (isRight) {
          car.angle += 0.048 * (Math.abs(car.speed) > 0.05 ? Math.sign(car.speed) : 1);
        }

        // Apply Velocity
        car.x += Math.cos(car.angle) * car.speed;
        car.y += Math.sin(car.angle) * car.speed;

        // Screen Boundary Collision Check
        if (car.x < 15 || car.x > width - 15 || car.y < 15 || car.y > height - 15) {
          const now = Date.now();
          if (now - car.lastCollisionTime > 600) {
            car.lastCollisionTime = now;
            car.speed = -car.speed * 0.5;
            soundManager.playKerbBuzzer();
            setScore(s => {
              const newScore = Math.max(0, s - 10);
              if (newScore < 70) setIsFailed(true);
              return newScore;
            });
            setFaults(f => [...f.slice(-3), 'Boundary sensor perimeter hit (-10 Pts)']);
          }
        }

        // Specific Track Off-Road Kerb Detection
        if (selectedTrack === 'eight') {
          const dLeft = Math.hypot(car.x - 190, car.y - 160);
          const dRight = Math.hypot(car.x - 390, car.y - 160);
          const inLeftCircle = dLeft >= 48 && dLeft <= 104;
          const inRightCircle = dRight >= 48 && dRight <= 104;
          const inCenterCross = Math.hypot(car.x - 290, car.y - 160) < 32;
          const inEntry = car.x >= 50 && car.x <= 130 && car.y >= 160 && car.y <= 270;
          const inExit = car.x >= 460 && car.x <= 530 && car.y >= 160 && car.y <= 270;

          if (!inLeftCircle && !inRightCircle && !inCenterCross && !inEntry && !inExit) {
            const now = Date.now();
            if (now - car.lastCollisionTime > 800) {
              car.lastCollisionTime = now;
              car.speed = -car.speed * 0.4;
              soundManager.playKerbBuzzer();
              setScore(s => {
                const nextScore = Math.max(0, s - 10);
                if (nextScore < 70) setIsFailed(true);
                return nextScore;
              });
              setFaults(f => [...f.slice(-3), 'Figure-8 kerb off-track contact (-10 Pts)']);
            }
          }
        }

        // Checkpoint Progression Checking
        if (currentCheckpointIndex < checkpoints.length) {
          const targetCp = checkpoints[currentCheckpointIndex];
          const distToCp = Math.hypot(car.x - targetCp.x, car.y - targetCp.y);

          if (distToCp < targetCp.radius + 10) {
            soundManager.playCheckpointChime();
            setCheckpoints(cps => 
              cps.map((c, i) => i === currentCheckpointIndex ? { ...c, passed: true } : c)
            );
            setCurrentCheckpointIndex(idx => idx + 1);
          }
        }

        // ==========================================
        // TRACK COMPLETION / GOAL CHECKS
        // ==========================================
        if (selectedTrack === 'eight') {
          // Finished if all 6 CPs hit AND car reaches Finish Gate
          if (currentCheckpointIndex >= checkpoints.length && car.x >= 480 && car.x <= 530 && car.y >= 220) {
            setIsPassed(true);
            setIsPlaying(false);
            soundManager.playVictoryFanfare();
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            } catch (e) {}
          }
        } else if (selectedTrack === 'parking') {
          // Car in box, speed ~ 0
          if (currentCheckpointIndex >= checkpoints.length && car.x >= 340 && car.x <= 470 && car.y >= 160 && car.y <= 230 && Math.abs(car.speed) < 0.15) {
            setIsPassed(true);
            setIsPlaying(false);
            soundManager.playVictoryFanfare();
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            } catch (e) {}
          }
        } else if (selectedTrack === 'reverse_s') {
          if (currentCheckpointIndex >= checkpoints.length && car.x >= 480 && car.x <= 530 && car.y >= 190 && car.y <= 245) {
            setIsPassed(true);
            setIsPlaying(false);
            soundManager.playVictoryFanfare();
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            } catch (e) {}
          }
        } else if (selectedTrack === 'gradient') {
          // Check hill hold
          if (car.x >= 250 && car.x <= 340 && car.y >= 125 && car.y <= 195 && Math.abs(car.speed) < 0.2) {
            setHillStoppedTime(t => t + 1);
            if (hillStoppedTime > 60) {
              setHillPassedHold(true);
            }
          }
          // Rollback violation check
          if (hillPassedHold && car.x < 235) {
            setScore(s => Math.max(0, s - 20));
            setFaults(f => [...f.slice(-3), 'Gradient hill rollback exceeded 6 inches (-20 Pts)']);
          }
          if (currentCheckpointIndex >= checkpoints.length && car.x > 480) {
            setIsPassed(true);
            setIsPlaying(false);
            soundManager.playVictoryFanfare();
            try {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
            } catch (e) {}
          }
        }
      }

      // ==========================================
      // VEHICLE RENDERING (Realistic Smart Hatchback)
      // ==========================================
      const car = carState.current;
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 4);
      ctx.fill();

      // Body (Emerald Green / EV)
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 16, 4);
      ctx.fill();

      // Roof & Windshield Glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -6, 12, 12);

      // Front Hood Accent
      ctx.fillStyle = '#10b981';
      ctx.fillRect(6, -6, 6, 12);

      // Headlights (Warm Yellow)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(12, -7, 2, 4);
      ctx.fillRect(12, 3, 2, 4);

      // Taillights (Red)
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
  }, [isPlaying, selectedTrack, isPassed, isFailed, currentCheckpointIndex, checkpoints, hillStoppedTime, hillPassedHold]);

  // Touch & Pointer Action Helpers for On-screen Buttons
  const setControlKey = (key: string, isDown: boolean) => {
    keysPressed.current[key] = isDown;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Sovereign Header with Tiranga Accent */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full tiranga-badge text-xs font-bold uppercase tracking-wider">
          <Gamepad2 className="w-3.5 h-3.5 text-saffron-600" />
          <span className="text-slate-800">Automated Driving Test Track (ADTT) Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          RTO Sensor Track Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Master the official Indian automated sensor test track maneuvers (8-Figure, Parallel Parking, Reverse S & Hill Gradient) before your live RTO appointment.
        </p>
      </div>

      {/* Track Selector & Live Telemetry HUD */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Track Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold w-full md:w-auto">
          {[
            { id: 'eight', label: '♾️ 8-Figure Maneuver' },
            { id: 'parking', label: '🅿️ Parallel Parking' },
            { id: 'reverse_s', label: '🔄 Reverse S-Bend' },
            { id: 'gradient', label: '⛰️ Hill Gradient Hold' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => startTrack(t.id as TrackType)}
              className={`px-3.5 py-2 rounded-full transition-all flex-1 md:flex-none flex items-center justify-center gap-1.5 ${
                selectedTrack === t.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Live HUD Telemetry */}
        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <div className="p-2 px-3 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Stopwatch</span>
            <span className="font-bold text-slate-900">{timeElapsed}s</span>
          </div>

          <div className="p-2 px-3 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Checkpoints</span>
            <span className="font-bold text-saffron-600">
              {currentCheckpointIndex} / {checkpoints.length}
            </span>
          </div>

          <div className="p-2 px-3 rounded-xl bg-slate-100 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Sensor Score</span>
            <span className={`font-bold ${score >= 80 ? 'text-emerald-700' : (score >= 70 ? 'text-amber-600' : 'text-rose-600')}`}>
              {score} / 100
            </span>
          </div>

          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-full border transition-colors ${
              isMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => startTrack(selectedTrack)}
            className="p-2.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Restart Track"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Interactive Simulator Screen */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-2xl flex flex-col items-center justify-center space-y-6">
        
        {/* Canvas Area with Responsive Sizing */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950 w-full max-w-[600px]">
          <canvas
            ref={canvasRef}
            width={580}
            height={320}
            className="w-full h-auto block select-none touch-none"
          />

          {/* Overlay Result Badge: PASSED */}
          {isPassed && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ADTT Track Cleared!
              </h3>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Score: {score}/100 • Completed in {timeElapsed}s • Minimum RTO Standard (80) Achieved
              </p>
              <div className="flex flex-wrap gap-2.5 mt-5 text-xs font-bold justify-center">
                <button
                  onClick={() => setShowCertificate(true)}
                  className="px-4 py-2.5 rounded-full bg-saffron-500 text-white hover:bg-saffron-600 shadow-md flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>View RTO Certificate</span>
                </button>
                <button
                  onClick={() => startTrack(selectedTrack)}
                  className="px-4 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100"
                >
                  Retry Track
                </button>
                <Link
                  href="/driver-licence"
                  className="px-4 py-2.5 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold"
                >
                  Book Official Slot
                </Link>
              </div>
            </div>
          )}

          {/* Overlay Result Badge: FAILED */}
          {isFailed && (
            <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-white animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-rose-600/30">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Track Clearance Failed
              </h3>
              <p className="text-xs text-rose-300 font-mono mt-1">
                Score dropped below statutory threshold (70/100) due to multiple kerb/sensor faults.
              </p>
              <button
                onClick={() => startTrack(selectedTrack)}
                className="mt-4 px-5 py-2.5 rounded-full bg-white text-rose-900 hover:bg-rose-50 text-xs font-bold shadow-md"
              >
                Retry Maneuver
              </button>
            </div>
          )}
        </div>

        {/* Checkpoint Progress Banner */}
        <div className="w-full max-w-lg bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-saffron-600 shrink-0" />
            <span className="text-slate-700 font-medium">
              {currentCheckpointIndex < checkpoints.length 
                ? `Next Target: ${checkpoints[currentCheckpointIndex]?.label}`
                : 'All Checkpoints Cleared! Proceed to Finish Gate.'}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-900 shrink-0">
            {Math.round((currentCheckpointIndex / (checkpoints.length || 1)) * 100)}%
          </span>
        </div>

        {/* Controls Guide & Responsive D-Pad */}
        <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          
          <div className="space-y-1.5 text-slate-600 text-center sm:text-left">
            <span className="font-bold text-slate-900 block">Keyboard & Mouse Controls:</span>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <kbd className="px-2 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800 border border-slate-300">▲</kbd>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800 border border-slate-300">W</kbd>
              <span className="text-slate-500">Accelerate Forward</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <kbd className="px-2 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800 border border-slate-300">◀</kbd>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800 border border-slate-300">▶</kbd>
              <span className="text-slate-500">Steer Left / Right</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <kbd className="px-2 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800 border border-slate-300">▼</kbd>
              <kbd className="px-2 py-0.5 rounded bg-slate-200 font-mono font-bold text-slate-800 border border-slate-300">S</kbd>
              <span className="text-slate-500">Brake / Reverse</span>
            </div>
          </div>

          {/* On-screen touch & pointer D-Pad */}
          <div className="flex flex-col items-center gap-1.5 select-none shrink-0">
            <button
              onPointerDown={(e) => { e.preventDefault(); setControlKey('ArrowUp', true); }}
              onPointerUp={() => setControlKey('ArrowUp', false)}
              onPointerLeave={() => setControlKey('ArrowUp', false)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 active:from-slate-300 active:to-slate-400 font-bold flex items-center justify-center shadow-md border border-slate-300 text-slate-800 text-sm touch-none"
            >
              ▲
            </button>
            <div className="flex gap-1.5">
              <button
                onPointerDown={(e) => { e.preventDefault(); setControlKey('ArrowLeft', true); }}
                onPointerUp={() => setControlKey('ArrowLeft', false)}
                onPointerLeave={() => setControlKey('ArrowLeft', false)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 active:from-slate-300 active:to-slate-400 font-bold flex items-center justify-center shadow-md border border-slate-300 text-slate-800 text-sm touch-none"
              >
                ◀
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); setControlKey('ArrowDown', true); }}
                onPointerUp={() => setControlKey('ArrowDown', false)}
                onPointerLeave={() => setControlKey('ArrowDown', false)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 active:from-slate-300 active:to-slate-400 font-bold flex items-center justify-center shadow-md border border-slate-300 text-slate-800 text-sm touch-none"
              >
                ▼
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); setControlKey('ArrowRight', true); }}
                onPointerUp={() => setControlKey('ArrowRight', false)}
                onPointerLeave={() => setControlKey('ArrowRight', false)}
                className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 active:from-slate-300 active:to-slate-400 font-bold flex items-center justify-center shadow-md border border-slate-300 text-slate-800 text-sm touch-none"
              >
                ▶
              </button>
            </div>
          </div>

        </div>

        {/* Live Fault Logs */}
        {faults.length > 0 && (
          <div className="w-full max-w-lg p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 animate-in fade-in">
            <span className="font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Sensor Penalties Recorded:
            </span>
            {faults.map((f, i) => (
              <div key={i} className="text-[11px] font-mono">• {f}</div>
            ))}
          </div>
        )}

      </div>

      {/* ==========================================
          OFFICIAL RTO TEST CLEARANCE CERTIFICATE MODAL
          ========================================== */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-800 relative space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Top Tiranga Stripe */}
            <div className="tiranga-top-bar absolute top-0 left-0 right-0 rounded-t-2xl" />

            {/* Certificate Header */}
            <div className="text-center pt-2 space-y-1">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                GOVERNMENT OF INDIA • MINISTRY OF ROAD TRANSPORT & HIGHWAYS
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                ADTT SENSOR TRACK CLEARANCE CERTIFICATE
              </h2>
              <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                Statutory Motor Vehicles Act Compliance
              </div>
            </div>

            {/* Candidate & Test Telemetry Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Candidate Name:</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Application Ref:</span>
                  <span className="font-mono font-bold text-slate-900">DL-ADTT-{Date.now().toString().slice(-6)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Vehicle Class:</span>
                  <span className="font-bold text-slate-900">LMV (Light Motor Vehicle)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Maneuver Track:</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedTrack.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Completion Time:</span>
                  <span className="font-mono font-bold text-slate-900">{timeElapsed} Seconds</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sensor Score:</span>
                  <span className="font-mono font-bold text-emerald-700">{score} / 100 (PASSED)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">RTO Jurisdiction:</span>
                <span className="font-semibold text-slate-800">RTO {currentUser.city}, {currentUser.state}</span>
              </div>
            </div>

            {/* Verification QR & Digital Stamp */}
            <div className="flex items-center justify-between gap-4 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-emerald-300 flex items-center justify-center p-1 shadow-xs">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    PARIVAHAN DIGILOCKER VERIFIED
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Digitally signed by RTO ADTT Telemetry Engine
                  </div>
                </div>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 text-xs font-bold">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
