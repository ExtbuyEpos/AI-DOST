
import React, { useState } from 'react';

interface MiniPopupNodeProps {
  isOpen: boolean;
  onClose: () => void;
  stream: MediaStream | null;
}

export const MiniPopupNode: React.FC<MiniPopupNodeProps> = ({ isOpen, onClose, stream }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream && !isMinimized) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isMinimized, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-36 left-10 z-[100] transition-all duration-500 ${isMinimized ? 'w-12 h-12' : 'w-64 h-44'} pointer-events-auto`}>
      <div className={`relative w-full h-full hud-glass rounded-2xl overflow-hidden border-2 border-cyan-500/30 flex flex-col shadow-[0_0_30px_rgba(34,211,238,0.2)] ${isMinimized ? 'rounded-full' : ''}`}>
        
        {/* HEADER */}
        <div className={`flex items-center justify-between px-3 py-1.5 bg-cyan-950/40 border-b border-cyan-500/20 ${isMinimized ? 'hidden' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-[8px] orbitron font-black text-cyan-400 uppercase tracking-widest">MINI_NODE_SEC</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsMinimized(true)} className="text-cyan-500 hover:text-white">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/></svg>
            </button>
            <button onClick={onClose} className="text-red-500 hover:text-white">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 relative bg-black">
          {isMinimized ? (
            <button 
              onClick={() => setIsMinimized(false)}
              className="w-full h-full flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/40 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            </button>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60 grayscale brightness-125" />
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/10">
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400"></div>
              </div>
            </>
          )}
        </div>

        {/* DATA BAR */}
        {!isMinimized && (
          <div className="px-3 py-1 bg-black/60 flex justify-between items-center border-t border-cyan-500/10">
             <span className="text-[6px] orbitron font-bold text-cyan-800">UPLINK_STABLE</span>
             <div className="flex gap-1">
                <div className="w-1 h-2 bg-cyan-500/20"></div>
                <div className="w-1 h-3 bg-cyan-500/40"></div>
                <div className="w-1 h-2 bg-cyan-500/60"></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
