
import React, { useRef, useEffect, useState } from 'react';
import { TranscriptionLine, GeneratedAsset, AdCampaign, SystemStatus } from '../types';

interface OmniMonitorProps {
  stream: MediaStream | null;
  isOpen: boolean;
  facingMode: 'user' | 'environment';
  messages: TranscriptionLine[];
  assets: GeneratedAsset[];
  campaign: AdCampaign | null;
  isSyncing: boolean;
  systemInfo: Partial<SystemStatus>;
  label?: string;
  onToggleCamera?: () => void;
  isScreenSharing?: boolean;
  onStopScreenShare?: () => void;
}

export const OmniMonitor: React.FC<OmniMonitorProps> = ({ 
  stream, 
  isOpen, 
  facingMode, 
  messages, 
  assets, 
  campaign, 
  isSyncing,
  systemInfo,
  label = "MASTER_LINK_V04",
  onToggleCamera,
  isScreenSharing,
  onStopScreenShare
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [baseZoom, setBaseZoom] = useState(1);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isOpen]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const getDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].pageX - touches[1].pageX,
      touches[0].pageY - touches[1].pageY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setInitialDistance(getDistance(e.touches));
      setBaseZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      const currentDistance = getDistance(e.touches);
      const scaleFactor = currentDistance / initialDistance;
      const newZoom = Math.min(Math.max(baseZoom * scaleFactor, 1), 5);
      setZoom(newZoom);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 md:right-10 top-24 w-80 md:w-96 bottom-32 z-40 animate-in fade-in slide-in-from-right-20 duration-500 pointer-events-none flex flex-col gap-3">
      {/* HEADER */}
      <div className="hud-glass p-3 rounded-t-xl border-b-0 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}></div>
          <span className="text-[10px] orbitron font-black text-cyan-400 tracking-widest uppercase">{label}</span>
        </div>
        {!isScreenSharing && (
          <button 
            onClick={onToggleCamera}
            className="pointer-events-auto bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 px-2 py-0.5 rounded text-[8px] orbitron text-cyan-400 font-bold transition-all uppercase"
          >
            Switch_Optic
          </button>
        )}
      </div>

      {/* SENSORS READOUT */}
      <div className="hud-glass p-3 grid grid-cols-2 gap-2 pointer-events-auto bg-black/40 backdrop-blur-md">
         <div className="flex flex-col">
            <span className="text-[7px] orbitron text-cyan-600 font-bold">NET_PROTOCOL</span>
            <span className="text-[9px] orbitron text-white uppercase">{systemInfo.networkType || 'SECURE_VPN'}</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[7px] orbitron text-cyan-600 font-bold">DEVICE_POWER</span>
            <span className="text-[9px] orbitron text-white uppercase">{systemInfo.battery?.level.toFixed(0)}% {systemInfo.battery?.charging ? '(CHARGING)' : ''}</span>
         </div>
      </div>

      {/* VIDEO FEED */}
      <div 
        className={`relative aspect-video hud-glass overflow-hidden pointer-events-auto cursor-zoom-in group border-2 transition-colors ${isScreenSharing ? 'border-orange-500 animate-pulse' : 'border-cyan-500/30'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setInitialDistance(null)}
      >
        <div className="w-full h-full transition-transform duration-75 ease-out origin-center" style={{ transform: `scale(${zoom})` }}>
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover opacity-80 brightness-110 ${facingMode === 'user' && !isScreenSharing ? 'scale-x-[-1]' : ''}`} />
        </div>

        {/* Persistent Screen Sharing Overlay */}
        {isScreenSharing && (
          <div className="absolute inset-0 bg-orange-500/10 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
             <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-orange-500/40">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
                <span className="text-[10px] orbitron font-black text-orange-400 tracking-tighter">BROADCASTING_WORKSPACE</span>
             </div>
             <button 
              onClick={onStopScreenShare}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white orbitron font-black text-[10px] rounded border border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
             >
               STOP_UPLINK
             </button>
          </div>
        )}

        <div className="absolute bottom-2 right-2 text-[9px] orbitron font-black text-cyan-400 bg-black/40 px-2 py-0.5 rounded border border-cyan-500/30">
          MAG: {zoom.toFixed(1)}X
        </div>
      </div>

      {/* NEURAL LOG */}
      <div className="flex-1 hud-glass overflow-hidden flex flex-col pointer-events-auto">
        <div className="bg-cyan-500/10 px-3 py-1 text-[8px] orbitron font-bold text-cyan-400 border-b border-cyan-500/20">SYSTEM_LOGS_STREAM</div>
        <div ref={logRef} className="flex-1 overflow-y-auto p-3 font-mono text-[9px] text-cyan-300/80 leading-relaxed scrollbar-hide space-y-1">
          {messages.slice(-20).map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'model' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <span className="opacity-40">[{new Date(m.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
              <span className="font-bold">{m.role === 'model' ? 'G_X' : 'SIR'}:</span>
              <span className="break-words line-clamp-2">{m.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="hud-glass p-2 rounded-b-xl border-t-0 flex justify-between pointer-events-auto">
        <div className="flex gap-2">
           <div className="w-2 h-2 bg-green-500/40 rounded-full"></div>
           <div className="w-2 h-2 bg-cyan-500/40 rounded-full"></div>
           <div className="w-2 h-2 bg-purple-500/40 rounded-full"></div>
        </div>
        <span className="text-[7px] orbitron font-black text-cyan-700 uppercase">OMNI_MONITOR_ACTIVE</span>
      </div>
    </div>
  );
};
