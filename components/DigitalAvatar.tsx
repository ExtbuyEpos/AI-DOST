import React, { useEffect, useRef } from 'react';
import { AvatarConfig } from '../types';

interface DigitalAvatarProps {
  isModelTalking: boolean;
  isActive: boolean;
  isProcessing?: boolean;
  config: AvatarConfig;
}

export const DigitalAvatar: React.FC<DigitalAvatarProps> = ({ isModelTalking, isActive, isProcessing, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; z: number; phase: number; speed: number; orbit: number }[] = [];
    const particleCount = 1000;
    const radius = 120;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        phase: Math.random() * Math.PI * 2,
        speed: 1.0 + Math.random() * 2.5,
        orbit: Math.random() * 60
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const baseRotation = isActive ? 0.025 : 0.01;
      angleX += baseRotation;
      angleY += baseRotation * 1.4;

      const talkingScale = isModelTalking 
        ? 1.25 + Math.sin(Date.now() * 0.018) * 0.1 
        : 1.0;
      
      const processingScale = isProcessing 
        ? 1.15 + Math.cos(Date.now() * 0.035) * 0.06 
        : 1.0;

      const finalScale = talkingScale * processingScale;

      // Hex to RGBA conversion
      const r = parseInt(config.themeColor.slice(1, 3), 16);
      const g = parseInt(config.themeColor.slice(3, 5), 16);
      const b = parseInt(config.themeColor.slice(5, 7), 16);

      // Render Orbital Rings Behind
      if (isActive) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * 2 * finalScale, radius * 0.6 * finalScale, angleX * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * 1.8 * finalScale, radius * 0.4 * finalScale, -angleY * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.05)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      particles.forEach((p, i) => {
        let x = p.x;
        let y = p.y;
        let z = p.z;

        if (isModelTalking) {
          const displacement = Math.sin(Date.now() * 0.025 * p.speed + p.phase) * 20;
          x += (x / radius) * displacement;
          y += (y / radius) * displacement;
          z += (z / radius) * displacement;
        }

        if (isProcessing) {
          const jitter = (Math.random() - 0.5) * 8;
          x += jitter; y += jitter; z += jitter;
        }

        // Apply 3D rotation
        let tx = x * Math.cos(angleY) - z * Math.sin(angleY);
        let tz = x * Math.sin(angleY) + z * Math.cos(angleY);
        x = tx; z = tz;

        let ty = y * Math.cos(angleX) - z * Math.sin(angleX);
        tz = y * Math.sin(angleX) + z * Math.cos(angleX);
        y = ty; z = tz;

        const perspective = 500 / (500 - z);
        const sx = centerX + x * perspective * finalScale;
        const sy = centerY + y * perspective * finalScale;

        const alpha = Math.max(0.08, (z + radius) / (2 * radius)) * (isActive ? 1.0 : 0.45);
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * (isModelTalking ? 1.0 : 0.7)})`;

        ctx.beginPath();
        const pSize = (isModelTalking ? 3.0 : 2.0) * perspective;
        ctx.arc(sx, sy, pSize, 0, Math.PI * 2);
        ctx.fill();

        // High-density neural connections
        if (isActive && i % 40 === 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(sx, sy);
          ctx.lineTo(centerX, centerY);
          ctx.stroke();
        }
      });

      // Render Foreground Orbital Overlay
      if (isActive) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * 2.2 * finalScale, radius * 0.7 * finalScale, angleX + Math.PI/2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([10, 20]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isModelTalking, isActive, isProcessing, config.themeColor]);

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center group">
      {/* GLOW ATMOSPHERE */}
      <div 
        className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 ${isActive ? 'opacity-20 scale-125' : 'opacity-0 scale-100'}`}
        style={{ backgroundColor: config.themeColor }}
      ></div>
      
      {/* SPINNING HUD GEOMETRY */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
            className="absolute inset-0 border border-white/5 rounded-full animate-[spin_30s_linear_infinite]"
            style={{ borderTop: `1px solid ${config.themeColor}22` }}
        ></div>
        <div 
            className="absolute inset-20 border border-white/5 rounded-full animate-[spin_25s_linear_infinite_reverse]"
            style={{ borderBottom: `2px solid ${config.themeColor}33` }}
        ></div>
        <div 
            className="absolute inset-40 border border-white/5 rounded-full animate-[spin_15s_linear_infinite]"
            style={{ borderLeft: `1px solid ${config.themeColor}44` }}
        ></div>
      </div>

      <div className="relative z-10">
        <canvas ref={canvasRef} width={500} height={500} className="drop-shadow-[0_0_80px_rgba(6,182,212,0.4)] transition-transform duration-1000" />
      </div>

      {/* DIEGETIC STATUS RING */}
      <div className="absolute bottom-[-60px] flex flex-col items-center">
        <div 
            className={`px-10 py-3 rounded-full border backdrop-blur-3xl transition-all duration-1000 flex items-center gap-4 ${isActive ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 opacity-30'}`}
            style={isActive ? { borderColor: `${config.themeColor}80` } : {}}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: config.themeColor }}></div>
          <span className="text-[11px] orbitron font-black uppercase tracking-[0.6em] text-glow" style={isActive ? { color: config.themeColor } : { color: '#64748b' }}>
             {isActive ? 'DOST_LINK_ESTABLISHED' : 'UPLINK_OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};