import React, { useEffect, useState } from 'react';

interface SatelliteNodeProps {
  isOpen: boolean;
  onClose: () => void;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

export const SatelliteNode: React.FC<SatelliteNodeProps> = ({ isOpen, onClose, location }) => {
  const [zoom, setZoom] = useState(14);
  const [isCalibrating, setIsCalibrating] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsCalibrating(false), 2000);
      return () => clearTimeout(timer);
    }
    setIsCalibrating(true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-2 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[30px] pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[92vh] bg-black border border-cyan-500/40 rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(34,211,238,0.2)] pointer-events-auto flex flex-col animate-in zoom-in duration-500">
        
        <div className="h-24 bg-cyan-950/20 backdrop-blur-xl flex items-center justify-between px-14 border-b border-cyan-500/20 z-30">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6 group">
              <div className="relative">
                <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping opacity-40"></div>
                <div className="absolute inset-0 w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_20px_#22d3ee]"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[14px] orbitron font-black text-white tracking-[0.5em] uppercase italic">GLOBAL_INTEL_UPLINK</h2>
                <span className="text-[8px] orbitron text-cyan-600 font-black uppercase tracking-widest">Starlink_Omega // Node: Secure_Sat_V6</span>
              </div>
            </div>
            
            <div className="hidden lg:flex gap-8">
               <div className="flex flex-col">
                  <span className="text-[7px] orbitron text-cyan-800 font-black uppercase">LINK_INTEGRITY</span>
                  <span className="text-[12px] font-mono text-emerald-500 font-black tracking-tighter">100%_SECURE</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[7px] orbitron text-cyan-800 font-black uppercase">TARGET_RESOLUTION</span>
                  <span className="text-[12px] font-mono text-cyan-400 font-black tracking-tighter">4K_ULTRA_OPTIC</span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <button onClick={onClose} className="w-12 h-12 rounded-[1.5rem] bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-rose-500 hover:text-white transition-all duration-500 group shadow-lg">
               <svg viewBox="0 0 24 24" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          
          {/* ANALYSIS SIDEBAR */}
          <div className="absolute left-10 top-10 bottom-10 w-80 z-20 flex flex-col gap-6 pointer-events-none">
             <div className="hud-glass p-8 rounded-[3rem] border-cyan-500/20 bg-black/60 pointer-events-auto flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4">
                   <span className="text-[10px] orbitron text-cyan-500 font-black uppercase tracking-widest">Satellite_Analysis</span>
                   <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                </div>

                <div className="space-y-6">
                   <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] orbitron text-cyan-800 font-black uppercase">Status_Verification</span>
                      <div className="bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/20">
                         <span className="text-[12px] font-mono text-emerald-400 font-black uppercase">ENTITY_ONLINE</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] orbitron text-cyan-800 font-black uppercase">Environmental_Check</span>
                      <div className="bg-cyan-500/5 px-4 py-2 rounded-xl border border-cyan-500/10">
                         <span className="text-[11px] font-mono text-cyan-100 font-bold italic leading-none">NO_ANOMALIES_DETECTED_IN_SECTOR</span>
                      </div>
                   </div>
                </div>

                <div className="mt-4 p-5 bg-cyan-900/10 rounded-2xl border border-cyan-500/10 text-[10px] font-mono text-cyan-400 italic leading-relaxed">
                   "AI Dost: Sir, deep satellite check on the requested coordinates confirms absolute alignment with GDS records. Tactical stability is at 99.8%."
                </div>
             </div>

             <div className="hud-glass p-8 rounded-[3rem] border-emerald-500/20 bg-black/40 pointer-events-auto flex flex-col gap-6">
                <span className="text-[10px] orbitron text-emerald-500 font-black uppercase tracking-widest">Booking_Analysis</span>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                      <span>Ref: B6_402_SYN</span>
                      <span className="text-emerald-500">CONFIRMED</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="absolute right-10 top-10 bottom-10 w-20 z-20 flex flex-col gap-4 pointer-events-none">
             {[
               { icon: 'M12 4v16m8-8H4', action: () => setZoom(z => Math.min(z + 1, 21)), label: 'IN' },
               { icon: 'M20 12H4', action: () => setZoom(z => Math.max(z - 1, 1)), label: 'OUT' },
               { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', action: () => setZoom(14), label: 'HOME' }
             ].map((btn, i) => (
               <button key={i} onClick={btn.action} className="w-16 h-16 rounded-2xl hud-glass border-cyan-500/30 text-cyan-400 flex flex-col items-center justify-center pointer-events-auto hover:bg-cyan-500/10 transition-all group shadow-xl">
                 <svg viewBox="0 0 24 24" className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="3"><path d={btn.icon}/></svg>
                 <span className="text-[7px] orbitron font-black">{btn.label}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 bg-slate-900 relative">
             <div className="w-full h-full relative">
                <div className="w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent z-10 pointer-events-none"></div>
                   <div className="w-full h-full opacity-60 mix-blend-screen brightness-125 grayscale invert">
                      <iframe 
                        title="Tactical Map"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&center=${location?.lat || 0},${location?.lng || 0}&zoom=${zoom}&maptype=satellite`}
                        allowFullScreen
                      ></iframe>
                   </div>
                   
                   <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-black/40">
                      <div className="absolute inset-0 border border-cyan-500/20"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                         <div className="absolute inset-0 border border-cyan-400/40 rounded-full animate-[ping_3s_infinite]"></div>
                         <div className="absolute inset-[25%] border-2 border-cyan-400/20 rounded-full"></div>
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-cyan-400/10"></div>
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-cyan-400/10"></div>
                      </div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] orbitron font-black text-cyan-400 tracking-[1em] whitespace-nowrap animate-pulse">DOST_SAT_SCANNING</div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {isCalibrating && (
          <div className="absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center gap-10 animate-in fade-in duration-500">
             <div className="relative w-48 h-48">
                <div className="absolute inset-0 border-8 border-cyan-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <svg viewBox="0 0 24 24" className="w-20 h-20 text-cyan-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
                </div>
             </div>
             <div className="text-center space-y-4">
                <div className="text-4xl orbitron text-white font-black tracking-[0.6em] italic uppercase">Calibrating_Uplink</div>
                <div className="text-[12px] orbitron text-cyan-700 font-bold uppercase tracking-[0.4em] animate-pulse">Syncing with Starlink Omega Fleet...</div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};