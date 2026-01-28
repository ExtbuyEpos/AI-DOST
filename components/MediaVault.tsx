
import React from 'react';
import { GeneratedAsset } from '../types';

interface MediaVaultProps {
  assets: GeneratedAsset[];
}

export const MediaVault: React.FC<MediaVaultProps> = ({ assets }) => {
  if (assets.length === 0) return null;

  return (
    <div className="fixed left-4 top-24 bottom-24 w-64 z-30 flex flex-col gap-4 overflow-y-auto scrollbar-hide pointer-events-auto">
      <div className="text-[10px] orbitron text-cyan-500 font-bold mb-2 flex items-center gap-2 border-b border-cyan-500/20 pb-2">
        <div className="w-2 h-2 bg-cyan-500 animate-pulse"></div>
        NEURAL_RENDER_VAULT
      </div>
      {assets.map((asset) => (
        <div key={asset.id} className={`relative group border rounded overflow-hidden bg-slate-900/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] ${asset.type === 'video' ? 'border-orange-500/30' : 'border-cyan-500/30'}`}>
          {asset.type === 'image' ? (
            <img src={asset.url} alt={asset.prompt} className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500" />
          ) : (
            <div className="relative">
              <video src={asset.url} autoPlay loop muted className="w-full h-auto" />
              <div className="absolute top-1 right-1 px-1 bg-orange-500 text-[6px] orbitron font-bold rounded">VEO</div>
            </div>
          )}
          <div className={`absolute inset-0 pointer-events-none group-hover:opacity-0 transition-opacity ${asset.type === 'video' ? 'bg-orange-500/5' : 'bg-cyan-500/5'}`}></div>
          <div className="p-3 border-t border-white/5">
             <div className="text-[9px] orbitron text-white opacity-80 leading-tight line-clamp-2">{asset.prompt}</div>
             <div className="text-[6px] orbitron text-cyan-700 mt-2 flex justify-between uppercase">
               <span>Engine: {asset.type === 'video' ? 'Veo_3.1' : 'Flash_2.5'}</span>
               <span>Ready</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
