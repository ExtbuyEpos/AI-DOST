import React, { useRef, useState } from 'react';
import { GeneratedAsset } from '../types';

interface MediaVaultProps {
  assets: GeneratedAsset[];
  isOpen: boolean;
  onClose: () => void;
}

export const MediaVault: React.FC<MediaVaultProps> = ({ assets, isOpen, onClose }) => {
  const [arAsset, setArAsset] = useState<GeneratedAsset | null>(null);
  const arVideoRef = useRef<HTMLVideoElement>(null);
  const [gyroOffset, setGyroOffset] = useState({ x: 0, y: 0 });

  const startAR = (asset: GeneratedAsset) => {
    setArAsset(asset);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (arVideoRef.current) arVideoRef.current.srcObject = stream;
      });

    const handleMotion = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        setGyroOffset({ x: e.gamma / 2, y: e.beta / 2 });
      }
    };
    window.addEventListener('deviceorientation', handleMotion);
    return () => window.removeEventListener('deviceorientation', handleMotion);
  };

  const closeAR = () => {
    if (arVideoRef.current?.srcObject) {
      (arVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setArAsset(null);
  };

  return (
    <>
      {/* TACTICAL AR OVERLAY */}
      {arAsset && (
        <div className="fixed inset-0 z-[500] bg-black">
          <video ref={arVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
          
          {/* Spatial Grid Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(var(--accent-color)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div 
               className="w-[90%] max-w-2xl animate-in zoom-in duration-700 shadow-[0_0_120px_rgba(6,182,212,0.4)] border-4 border-cyan-500/40 rounded-[4rem] overflow-hidden bg-black/20 backdrop-blur-md"
               style={{ transform: `translate(${gyroOffset.x}px, ${gyroOffset.y}px) rotateX(${-gyroOffset.y/5}deg) rotateY(${gyroOffset.x/5}deg)` }}
             >
                {arAsset.type === 'image' ? (
                  <img src={arAsset.url} className="w-full h-auto brightness-110" />
                ) : (
                  <video src={arAsset.url} autoPlay loop muted className="w-full h-auto brightness-110" />
                )}
                {/* HUD Elements on projection */}
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                   <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                      <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full"></div>
                      <span className="text-[10px] orbitron font-black text-white uppercase tracking-widest">SPATIAL_LOCK_ACTIVE</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="absolute top-10 right-10 flex gap-4">
             <button onClick={closeAR} className="w-16 h-16 bg-rose-600/90 rounded-[2rem] flex items-center justify-center text-white shadow-2xl hover:bg-rose-500 transition-all active:scale-90">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
             <div className="bg-black/60 backdrop-blur-xl px-10 py-3 rounded-full border border-cyan-500/30 flex items-center gap-6">
                <span className="text-[11px] orbitron font-black text-cyan-400 uppercase tracking-[0.4em]">AR_Reality_Projection_Modality</span>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
             </div>
          </div>
        </div>
      )}

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-[40]" onClick={onClose}></div>}
      
      <div className={`fixed left-0 top-0 bottom-0 md:top-28 md:bottom-28 w-full md:w-[22rem] z-[45] flex flex-col gap-8 overflow-y-auto pointer-events-auto hud-glass border-r border-cyan-500/20 px-8 py-12 md:py-10 transition-all duration-700 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-8 mb-4">
          <div className="flex flex-col gap-1">
            <div className="text-[14px] orbitron text-cyan-400 font-black tracking-[0.2em] flex items-center gap-3 uppercase italic">
              <div className="w-3 h-3 bg-cyan-500 rounded shadow-[0_0_10px_#06b6d4]"></div>
              Neural_Vault
            </div>
            <span className="text-[8px] orbitron text-slate-500 font-bold uppercase tracking-widest">Secured_Identity_L7</span>
          </div>
          <button onClick={onClose} className="md:hidden w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-8 premium-scroll pb-20">
          {assets.map((asset) => (
            <div key={asset.id} className="relative group border-2 border-white/5 rounded-[3rem] overflow-hidden bg-black/40 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/40 shadow-2xl hover:scale-[1.02]">
              <div className="relative aspect-square overflow-hidden">
                 {asset.type === 'image' ? (
                   <img src={asset.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                 ) : (
                   <video src={asset.url} autoPlay loop muted className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 
                 <button 
                  onClick={() => startAR(asset)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto"
                 >
                   <div className="px-8 py-3 bg-cyan-500 text-black orbitron font-black text-[10px] rounded-full shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-75 group-hover:scale-100 transition-transform uppercase tracking-widest flex items-center gap-3">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/></svg>
                      Project_Spatial
                   </div>
                 </button>
              </div>
              
              <div className="p-8 space-y-4">
                 <div className="text-[11px] font-mono text-cyan-50 leading-relaxed line-clamp-2 italic opacity-80 group-hover:opacity-100 transition-opacity">"{asset.prompt}"</div>
                 <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[8px] orbitron font-black text-cyan-600 uppercase tracking-widest">{asset.type} // {asset.config?.style || 'PRO'}</span>
                    <div className="flex gap-1">
                       <div className="w-1 h-1 rounded-full bg-cyan-500/20"></div>
                       <div className="w-1 h-1 rounded-full bg-cyan-500/40"></div>
                       <div className="w-1 h-1 rounded-full bg-cyan-500/60"></div>
                    </div>
                 </div>
              </div>
            </div>
          ))}

          {assets.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-20 grayscale">
               <div className="w-20 h-20 border-2 border-dashed border-white rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
               </div>
               <span className="text-[10px] orbitron font-black uppercase tracking-widest text-center">Vault_Awaiting_Neural_Synthesis</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};