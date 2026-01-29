
import React, { useRef, useState } from 'react';
import { GeneratedAsset } from '../types';

interface MediaVaultProps {
  assets: GeneratedAsset[];
  isOpen: boolean;
  onClose: () => void;
}

export const MediaVault: React.FC<MediaVaultProps> = ({ assets, isOpen, onClose }) => {
  const [arAsset, setArAsset] = useState<GeneratedAsset | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const arVideoRef = useRef<HTMLVideoElement>(null);

  const startAR = (asset: GeneratedAsset) => {
    setArAsset(asset);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (arVideoRef.current) arVideoRef.current.srcObject = stream;
      });
  };

  const closeAR = () => {
    if (arVideoRef.current?.srcObject) {
      (arVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setArAsset(null);
  };

  return (
    <>
      {/* AR OVERLAY */}
      {arAsset && (
        <div className="fixed inset-0 z-[500] bg-black">
          <video ref={arVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-80 md:w-[30rem] h-auto animate-in zoom-in duration-1000 shadow-2xl border-4 border-cyan-500/30 rounded-[3rem] overflow-hidden">
                {arAsset.type === 'image' ? <img src={arAsset.url} className="w-full h-auto" /> : <video src={arAsset.url} autoPlay loop muted className="w-full h-auto" />}
             </div>
          </div>

          <div className="absolute top-10 right-10 flex gap-4">
             <button onClick={closeAR} className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>
          <div className="absolute bottom-10 left-10 text-white orbitron font-black text-xs tracking-widest uppercase bg-black/60 px-6 py-2 rounded-full border border-cyan-500/20">AR_Spatial_Projection_Mode</div>
        </div>
      )}

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]" onClick={onClose}></div>}
      
      <div className={`fixed left-0 top-0 bottom-0 md:top-24 md:bottom-24 w-full md:w-80 z-[45] flex flex-col gap-4 overflow-y-auto scrollbar-hide pointer-events-auto hud-glass border-r border-cyan-500/20 px-6 py-10 md:py-6 transition-transform duration-500 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:opacity-0 md:pointer-events-none'}`}>
        
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-2">
          <div className="text-[10px] orbitron text-cyan-500 font-bold flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-cyan-500 animate-pulse"></div>
            NEURAL_RENDER_VAULT
          </div>
          <button onClick={onClose} className="md:hidden text-cyan-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {assets.map((asset) => (
          <div key={asset.id} className="relative group border rounded-3xl overflow-hidden bg-slate-900/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] border-cyan-500/20">
            <div className="relative">
               {asset.type === 'image' ? <img src={asset.url} className="w-full h-auto" /> : <video src={asset.url} autoPlay loop muted className="w-full h-auto" />}
               <button 
                onClick={() => startAR(asset)}
                className="absolute top-4 right-4 w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-95"
               >
                 <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/></svg>
               </button>
            </div>
            <div className="p-4 border-t border-white/5 bg-black/40">
               <div className="text-[10px] orbitron text-white opacity-80 leading-tight line-clamp-1">{asset.prompt}</div>
               <div className="text-[7px] orbitron text-cyan-700 mt-2 flex justify-between uppercase italic">
                 <span>Style: {asset.config?.style || 'STANDARD'}</span>
                 <span>{asset.type.toUpperCase()}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
