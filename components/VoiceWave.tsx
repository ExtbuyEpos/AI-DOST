
import React, { useEffect, useRef } from 'react';

interface VoiceWaveProps {
  isActive: boolean;
  isModelTalking: boolean;
  themeColor?: string;
}

export const VoiceWave: React.FC<VoiceWaveProps> = ({ isActive, isModelTalking, themeColor = '#22d3ee' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      const waves = 3;
      const frequency = isActive ? 0.05 : 0.01;
      const amplitude = isActive ? (isModelTalking ? 40 : 20) : 5;

      for (let i = 0; i < waves; i++) {
        ctx.beginPath();
        ctx.strokeStyle = i === 0 ? themeColor : `${themeColor}99`;
        ctx.lineWidth = i === 0 ? 3 : 1;
        ctx.globalAlpha = isActive ? 1 / (i + 1) : 0.2;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * frequency + offset + i * 2) * amplitude * Math.sin(offset * 0.5 + i);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      offset += isActive ? 0.15 : 0.05;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isModelTalking, themeColor]);

  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={128} 
        className="max-w-full"
      />
    </div>
  );
};
