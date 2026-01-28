
import React, { useRef, useEffect, useState } from 'react';

interface SideMonitorProps {
  stream: MediaStream | null;
  isOpen: boolean;
  facingMode: 'user' | 'environment';
  isSyncing: boolean;
}

export const SideMonitor: React.FC<SideMonitorProps> = ({ stream, isOpen, facingMode, isSyncing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPipSupported, setIsPipSupported] = useState(false);

  useEffect(() => {
    setIsPipSupported(!!document.pictureInPictureEnabled);
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isOpen]);

  const togglePip = async () => {
    try {
      if (videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error("PiP failed", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 md:right-10 top-20 md:top-1/4 w-72 md:w-80 h-52 md:h-60 z-40 animate-in fade-in slide-in-from-right-10 duration-700 pointer-events-none">
      {/* Holographic Container */}
      <div className="relative w-full h-full border border-cyan-500/30 bg-black/60 backdrop-blur-xl rounded-lg overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.2)] pointer-events-auto">
        
        {/* Live Video Feed */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover opacity-80 grayscale brightness-125 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* HUD Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanline and Noise */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="w-full h-[1px] bg-cyan-400/30 absolute top-0 left-0 animate-[scan_4s_linear_infinite]"></div>
          
          {/* Corner Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

          {/* Top Label */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500/20 border-x border-b border-cyan-500/40 rounded-b-md">
            <span className="text-[8px] orbitron font-black text-cyan-400 tracking-[0.2em] uppercase">Mini_Node_v01</span>
          </div>

          {/* Picture in Picture Control (Floating Mini Screen Trigger) */}
          {isPipSupported && (
            <button 
              onClick={(e) => { e.stopPropagation(); togglePip(); }}
              className="absolute top-2 right-10 w-6 h-6 rounded border border-cyan-500/40 bg-black/40 flex items-center justify-center hover:bg-cyan-500/20 transition-all pointer-events-auto group"
              title="Deploy Mini Screen"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="14 3 21 3 21 10" />
                <line x1="21" y1="3" x2="11" y2="13" />
              </svg>
            </button>
          )}

          {/* Status Indicators */}
          <div className="absolute top-4 left-4 flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                <span className="text-[7px] orbitron text-cyan-200 font-bold uppercase tracking-widest">
                  {isSyncing ? 'SYNC_ACTIVE' : 'LOCAL_FEED'}
                </span>
             </div>
          </div>

          {/* Data Readouts */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
             <div className="text-[8px] orbitron text-cyan-400 font-black flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2"><circle cx="12" cy="12" r="10"/></svg>
                MINI_UPLINK
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
