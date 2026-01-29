
import React, { useEffect, useRef } from 'react';
import { AvatarConfig, SystemStatus } from '../types';

interface DigitalAvatarProps {
  isModelTalking: boolean;
  isActive: boolean;
  isProcessing?: boolean;
  systemInfo?: Partial<SystemStatus>;
  config: AvatarConfig;
  isLightMode?: boolean;
  lookAt?: { x: number; y: number };
}

export const DigitalAvatar: React.FC<DigitalAvatarProps> = ({ isModelTalking, isActive, isProcessing, systemInfo, config, isLightMode, lookAt = { x: 0, y: 0 } }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; z: number; phase: number; speed: number; }[] = [];
    const particleCount = isLightMode ? 600 : 1200;
    const radius = 110;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        phase: Math.random() * Math.PI * 2,
        speed: 1.0 + Math.random() * 2
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // RUNNING STATE: Increase rotation speed significantly when motion is detected
      const rotationSpeed = isActive ? (isProcessing ? 0.08 : 0.02) : 0.005;
      angleX += rotationSpeed;
      angleY += rotationSpeed * 1.2;

      const scale = (isModelTalking ? 1.2 : 1.0) * (isProcessing ? 1.15 : 1.0);

      // Color Adaptation
      const hex = config.themeColor;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      // Render Orbital Rings
      if (isActive) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * 1.8 * scale, radius * 0.5 * scale, angleX * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isLightMode ? 0.05 : 0.08})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      particles.forEach((p, i) => {
        let x = p.x;
        let y = p.y;
        let z = p.z;

        // Turbulence for "Running" effect
        if (isProcessing) {
          const turbulence = Math.sin(Date.now() * 0.01 + i) * 10;
          x += turbulence;
          y += turbulence;
        }

        if (isModelTalking) {
          const displacement = Math.sin(Date.now() * 0.02 * p.speed + p.phase) * 15;
          x += (x / radius) * displacement;
          y += (y / radius) * displacement;
          z += (z / radius) * displacement;
        }

        // Apply 3D rotation
        let tx = x * Math.cos(angleY) - z * Math.sin(angleY);
        let tz = x * Math.sin(angleY) + z * Math.cos(angleY);
        x = tx; z = tz;

        let ty = y * Math.cos(angleX) - z * Math.sin(angleX);
        tz = y * Math.sin(angleX) + z * Math.cos(angleX);
        y = ty; z = tz;

        const perspective = 400 / (400 - z);
        const sx = centerX + x * perspective * scale;
        const sy = centerY + y * perspective * scale;

        const alpha = Math.max(0.05, (z + radius) / (2 * radius)) * (isActive ? 1.0 : 0.3);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * (isLightMode ? 0.8 : 0.7)})`;

        ctx.beginPath();
        const pSize = (isModelTalking ? 2.5 : 1.5) * perspective;
        ctx.arc(sx, sy, pSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // EYE RENDERING - CHAIA PROTOCOL
      if (isActive) {
          const eyeOffset = 25 * scale;
          const lookX = lookAt.x * 15;
          const lookY = lookAt.y * 15;

          const drawEye = (ox: number) => {
            const ex = centerX + ox + lookX;
            const ey = centerY - 20 * scale + lookY;
            
            // Outer Glow
            const grad = ctx.createRadialGradient(ex, ey, 2, ex, ey, 20);
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex, ey, 20, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = isProcessing ? '#fff' : config.themeColor;
            ctx.beginPath();
            ctx.arc(ex, ey, isProcessing ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Lens highlight
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(ex - 1.5, ey - 1.5, 1, 0, Math.PI * 2);
            ctx.fill();
          };

          drawEye(-eyeOffset);
          drawEye(eyeOffset);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isModelTalking, isActive, isProcessing, config.themeColor, isLightMode, lookAt]);

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center pointer-events-none">
      <div 
        className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 ${isActive ? (isLightMode ? 'opacity-10' : 'opacity-20') : 'opacity-0'}`}
        style={{ backgroundColor: config.themeColor }}
      ></div>
      
      <div className="relative z-10">
        <canvas ref={canvasRef} width={500} height={500} className={`drop-shadow-2xl transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-90 opacity-40'}`} />
      </div>

      <div className="absolute bottom-[-40px] flex flex-col items-center">
        <div 
            className={`px-8 py-2.5 rounded-full border backdrop-blur-3xl transition-all duration-1000 flex items-center gap-3 ${isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-500/5 border-slate-500/10 opacity-30'}`}
            style={isActive ? { borderColor: `${config.themeColor}50` } : {}}
        >
          <div className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: config.themeColor }}></div>
          <span className={`text-[10px] orbitron font-black uppercase tracking-[0.4em] ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
             {/* Fix: use systemInfo from props to avoid ReferenceError */}
             {isProcessing && systemInfo?.motionDetected ? 'CHAIA_LINK_ENGAGED' : (isActive ? 'OMNI_NEXUS_LINKED' : 'UPLINK_OFFLINE')}
          </span>
        </div>
      </div>
    </div>
  );
};
