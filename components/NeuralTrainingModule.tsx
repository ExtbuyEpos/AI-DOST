
import React, { useEffect, useRef, useState } from 'react';
import { TrainingSession } from '../types';

interface NeuralTrainingModuleProps {
  session: TrainingSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NeuralTrainingModule: React.FC<NeuralTrainingModuleProps> = ({ session, isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localMetrics, setLocalMetrics] = useState<number[]>([]);

  useEffect(() => {
    if (session) {
      setLocalMetrics(prev => [...prev.slice(-40), session.accuracy]);
    }
  }, [session]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current || localMetrics.length < 2) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Draw Grid
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h / 10) * i);
        ctx.lineTo(w, (h / 10) * i);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo((w / 10) * i, 0);
        ctx.lineTo((w / 10) * i, h);
        ctx.stroke();
      }

      // Draw Metric Line
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22d3ee';
      
      const step = w / (localMetrics.length - 1);
      localMetrics.forEach((m, i) => {
        const x = i * step;
        const y = h - (m / 100) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Area under curve
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
      ctx.fill();
    };

    render();
  }, [isOpen, localMetrics]);

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-[#010409]/80 backdrop-blur-xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-black/90 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_150px_rgba(34,211,238,0.15)] pointer-events-auto flex flex-col p-6 md:p-10 gap-8 animate-in zoom-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-cyan-500/20 pb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl orbitron font-black text-white tracking-widest uppercase italic">
              Neural_Weight_Refinement
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] orbitron font-bold text-cyan-500/60 uppercase tracking-widest">Target: {session.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] orbitron font-bold text-green-500 uppercase">{session.status}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
             <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Training Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Section */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="hud-glass p-4 rounded-xl flex flex-col gap-1 border-cyan-500/10">
                  <span className="text-[8px] orbitron text-cyan-600 font-black">ACCURACY</span>
                  <span className="text-xl orbitron font-bold text-cyan-400">{session.accuracy.toFixed(2)}%</span>
               </div>
               <div className="hud-glass p-4 rounded-xl flex flex-col gap-1 border-cyan-500/10">
                  <span className="text-[8px] orbitron text-cyan-600 font-black">LOSS_COEF</span>
                  <span className="text-xl orbitron font-bold text-orange-500">{session.loss.toFixed(4)}</span>
               </div>
               <div className="hud-glass p-4 rounded-xl flex flex-col gap-1 border-cyan-500/10">
                  <span className="text-[8px] orbitron text-cyan-600 font-black">CURRENT_EPOCH</span>
                  <span className="text-xl orbitron font-bold text-white">{session.epoch} / {session.totalEpochs}</span>
               </div>
               <div className="hud-glass p-4 rounded-xl flex flex-col gap-1 border-cyan-500/10">
                  <span className="text-[8px] orbitron text-cyan-600 font-black">LATENCY</span>
                  <span className="text-xl orbitron font-bold text-white">4.2ms</span>
               </div>
            </div>

            <div className="flex-1 hud-glass p-6 rounded-2xl flex flex-col gap-4 border-cyan-500/10">
               <span className="text-[10px] orbitron text-cyan-500 font-black border-b border-cyan-500/20 pb-2">NEURAL_DENSITY_LOG</span>
               <div className="flex-1 overflow-y-auto font-mono text-[9px] text-cyan-200/60 space-y-2 scrollbar-hide">
                  <div className="flex justify-between"><span>[OK] Weight Mapping Layer 04</span><span className="text-cyan-400">0.992</span></div>
                  <div className="flex justify-between"><span>[OK] Backprop Optimized</span><span className="text-cyan-400">DELTA: -0.001</span></div>
                  <div className="flex justify-between"><span>[OK] Relu Function Stabilized</span><span className="text-cyan-400">0.827</span></div>
                  <div className="flex justify-between"><span>[WARN] Gradient Clipping Act</span><span className="text-orange-400">LIMIT_HIT</span></div>
                  <div className="flex justify-between"><span>[OK] Data Shuffling Node_7</span><span className="text-cyan-400">COMPLETE</span></div>
                  <div className="animate-pulse">_ Awaiting node response...</div>
               </div>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-2 flex flex-col gap-4">
             <div className="flex-1 hud-glass rounded-3xl relative overflow-hidden bg-black/40 border-cyan-500/20 p-2">
                <div className="absolute top-4 left-6 text-[10px] orbitron text-cyan-400 font-black flex items-center gap-2">
                   <div className="w-2 h-2 bg-cyan-500 animate-ping"></div>
                   LIVE_TRAINING_CURVE
                </div>
                <canvas ref={canvasRef} width={800} height={400} className="w-full h-full opacity-80" />
             </div>
             
             {/* Progress Bar */}
             <div className="hud-glass p-6 rounded-2xl border-cyan-500/10 flex flex-col gap-3">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] orbitron text-cyan-500 font-black">TOTAL_TRAINING_PROGRESS</span>
                   <span className="text-lg orbitron font-black text-cyan-400">{session.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/20">
                   <div 
                    className="h-full bg-cyan-400 transition-all duration-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]" 
                    style={{ width: `${session.progress}%` }}
                   ></div>
                </div>
                <div className="flex justify-between text-[8px] orbitron text-cyan-700 font-bold uppercase">
                   <span>Input Buffer: User_Tactical_Data</span>
                   <span>Model Hash: 0x82...FA21</span>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[9px] orbitron text-cyan-900 font-black text-center tracking-[1em] uppercase opacity-40">
           Distributed Neural Node Processing Active // Secure Satellite Uplink Finalized
        </div>
      </div>
    </div>
  );
};
