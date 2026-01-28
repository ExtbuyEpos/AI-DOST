
import React, { useRef, useEffect } from 'react';
import { AIPersonality, AvatarConfig } from '../types';

interface VideoCallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stream: MediaStream | null;
  isModelTalking: boolean;
  isProcessing: boolean;
  personality: AIPersonality;
  config: AvatarConfig;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ 
  isOpen, onClose, stream, isModelTalking, isProcessing, personality, config 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && isOpen) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black animate-in fade-in duration-500 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30 blur-[4px]">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
         <div className="absolute top-16 left-16 flex flex-col gap-1">
            <span className="text-[14px] orbitron font-black tracking-[0.5em] text-white italic">{personality}_UPLINK_OMEGA</span>
            <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
               <span className={`text-[10px] font-mono font-black uppercase tracking-widest ${isProcessing ? 'text-orange-500' : 'text-emerald-500'}`}>
                 {isProcessing ? 'SYNAPTIC_PROCESSING' : 'LIVE_NEURAL_SYNC'}
               </span>
            </div>
         </div>
      </div>

      <div className="relative z-20 flex flex-col items-center gap-14">
          <div className={`relative w-[300px] h-[300px] flex items-center justify-center transition-transform duration-700 ${isModelTalking ? 'scale-110' : 'scale-100'}`}>
             {config.generatedUrl ? (
               <div className="w-72 h-72 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_120px_rgba(255,255,255,0.1)]">
                  <img src={config.generatedUrl} className="w-full h-full object-cover" alt="AI Avatar" />
               </div>
             ) : (
               <div className="w-72 h-72 rounded-full border-4 border-dashed border-white/20 animate-pulse flex items-center justify-center">
                  <span className="text-6xl orbitron font-black text-white opacity-20">{personality[0]}</span>
               </div>
             )}
          </div>
          <h1 className="text-5xl md:text-6xl orbitron font-black text-white tracking-[0.4em] uppercase italic">
            {isModelTalking ? 'TALKING' : isProcessing ? 'THINKING' : 'LISTENING'}
          </h1>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
         <button onClick={onClose} className="w-24 h-24 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-2xl hover:bg-rose-500 transition-all border-2 border-rose-400/30">
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12"/></svg>
         </button>
      </div>
    </div>
  );
};
