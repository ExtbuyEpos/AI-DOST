
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
    let particles: { x: number; y: number; z: number; phase: number; speed: number }[] = [];
    const particleCount = config.generatedUrl ? 400 : 800; // Less particles if we have an image to show
    const radius = 90;

    particles = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const baseRotation = isActive ? 0.01 : 0.002;
      angleX += isProcessing ? baseRotation * 4 : baseRotation;
      angleY += isProcessing ? baseRotation * 5 : baseRotation * 1.5;

      const scale = isModelTalking 
        ? 1.2 + Math.sin(Date.now() * 0.02) * 0.08 
        : isProcessing ? 1.1 + Math.sin(Date.now() * 0.04) * 0.02 : 1.0;
      
      particles.forEach((p, i) => {
        let x = p.x;
        let y = p.y;
        let z = p.z;

        if (isModelTalking || isProcessing) {
          const mod = isProcessing ? 12 : 6;
          const displacement = Math.sin(Date.now() * 0.02 * p.speed + p.phase) * mod;
          x += (x / radius) * displacement;
          y += (y / radius) * displacement;
          z += (z / radius) * displacement;
        }

        let tx = x * Math.cos(angleY) - z * Math.sin(angleY);
        let tz = x * Math.sin(angleY) + z * Math.cos(angleY);
        x = tx; z = tz;

        let ty = y * Math.cos(angleX) - z * Math.sin(angleX);
        tz = y * Math.sin(angleX) + z * Math.cos(angleX);
        y = ty; z = tz;

        const perspective = 500 / (500 - z);
        const sx = centerX + x * perspective * scale;
        const sy = centerY + y * perspective * scale;

        const alpha = Math.max(0.05, (z + radius) / (2 * radius));
        
        let dotColor = config.themeColor.replace(')', `, ${alpha * (isModelTalking ? 0.8 : 0.4)})`).replace('rgb', 'rgba').replace('#', '');
        // Convert hex to rgba if needed
        if (config.themeColor.startsWith('#')) {
            const r = parseInt(config.themeColor.slice(1, 3), 16);
            const g = parseInt(config.themeColor.slice(3, 5), 16);
            const b = parseInt(config.themeColor.slice(5, 7), 16);
            dotColor = `rgba(${r}, ${g}, ${b}, ${alpha * (isModelTalking ? 0.8 : 0.4)})`;
        }

        if (isProcessing) dotColor = `rgba(249, 115, 22, ${alpha * 0.9})`; 

        ctx.fillStyle = dotColor;
        const size = (isModelTalking ? 2.8 : 1.6) * perspective;
        ctx.beginPath();
        ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
        ctx.fill();

        if (isActive && i % 60 === 0) {
          ctx.beginPath();
          ctx.strokeStyle = isProcessing 
            ? `rgba(249, 115, 22, ${alpha * 0.3})` 
            : `${dotColor.replace(/[\d.]+\)$/, '0.15)')}`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(sx, sy);
          ctx.lineTo(centerX, centerY);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isModelTalking, isActive, isProcessing, config.themeColor, config.generatedUrl]);

  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg viewBox="0 0 200 200" className={`w-full h-full transition-all duration-1000 ${isActive ? 'opacity-60 scale-100' : 'opacity-10 scale-90'} ${isProcessing ? 'text-orange-500' : ''}`} style={{ color: config.themeColor }}>
          <defs>
            <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.1 }} />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="none" stroke="url(#avatarGrad)" strokeWidth="0.5" strokeDasharray="4 8" className="animate-rotate-slow" />
          <path d="M30 10 L10 10 L10 30" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M170 10 L190 10 L190 30" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M30 190 L10 190 L10 170" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M170 190 L190 190 L190 170" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {config.generatedUrl && (
          <div className="absolute w-48 h-48 rounded-full overflow-hidden border-2 border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-in fade-in zoom-in duration-1000">
            <img 
              src={config.generatedUrl} 
              alt="AI Avatar" 
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isModelTalking ? 'brightness-125 saturate-150' : 'brightness-90 saturate-50 opacity-80'}`}
              style={{ filter: `drop-shadow(0 0 10px ${config.themeColor})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>
        )}
        <div className={`absolute w-40 h-40 rounded-full blur-[80px] transition-all duration-700 ${isActive ? 'opacity-40' : 'opacity-0'} ${isProcessing ? 'bg-orange-500/10' : ''}`} style={{ backgroundColor: config.themeColor }}></div>
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="relative z-10 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
        />
      </div>

      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
           <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 px-4 py-1 rounded border backdrop-blur-md transition-colors duration-500 ${isProcessing ? 'bg-orange-950/40 border-orange-500/50 text-orange-400' : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400'}`} style={{ color: isProcessing ? '#fb923c' : config.themeColor, borderColor: isProcessing ? '#fb923c' : config.themeColor }}>
             <div className="text-[10px] orbitron font-black tracking-[0.3em] uppercase flex items-center gap-2">
               <span className={`w-1.5 h-1.5 rounded-full animate-ping`} style={{ backgroundColor: isProcessing ? '#fb923c' : config.themeColor }}></span>
               {isProcessing ? 'Processing_Request' : 'Vocal_Ready'}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
