import React, { useRef } from 'react';
import { AvatarConfig } from '../types';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  isOpen: boolean;
  onUpdate: (updates: Partial<AvatarConfig>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isGeneratingTheme: boolean;
  isGeneratingAccessory: boolean;
  onGenerateTheme: () => void;
  onGenerateAccessory: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ 
  config, isOpen, onUpdate, onGenerate, isGenerating, isGeneratingTheme, isGeneratingAccessory, onGenerateTheme, onGenerateAccessory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleGranularUpdate = (key: string, value: number) => {
    onUpdate({ granular: { ...(config.granular || { noseSize: 50, eyeWidth: 50, jawLine: 50, glowIntensity: 50 }), [key]: value } });
  };

  const options = {
    hairstyle: ['Synthetic-Sleek', 'Cyber-Quiff', 'Neon-Locs', 'Symmetry-Cut', 'Digital-Fade', 'Neural-Braids', 'Kinetic-Flow'],
    faceType: ['Hyper-Humanoid', 'Android-Prime', 'Abstract-Data', 'Elite-V5', 'Crystal-Core', 'Titan-Mesh'],
    accessory: ['Tactical-Visor', 'Neural-Link', 'Aura-Halo', 'None', 'Data-Lenses', 'Molt-Interface'],
    voices: [
      { name: 'Charon', gender: 'MALE', tone: 'Sophisticated' },
      { name: 'Fenrir', gender: 'MALE', tone: 'Deep' },
      { name: 'Puck', gender: 'NEUTRAL', tone: 'Playful' },
      { name: 'Zephyr', gender: 'FEMALE', tone: 'Tactical' },
      { name: 'Kore', gender: 'FEMALE', tone: 'Soft' }
    ]
  };

  return (
    <div className="fixed left-8 md:left-14 top-32 bottom-32 w-80 md:w-[24rem] z-[60] flex flex-col gap-8 animate-in slide-in-from-left-12 duration-700 pointer-events-auto hud-glass rounded-[3rem] p-10 overflow-y-auto premium-scroll shadow-2xl">
      <div className="text-[16px] orbitron text-slate-900 dark:text-cyan-400 font-black tracking-[0.4em] border-b border-slate-200 dark:border-cyan-500/20 pb-6 mb-2 flex justify-between items-center uppercase italic">
        Identity_Synth
        <div className={`w-3.5 h-3.5 bg-cyan-500 rounded-full ${isGenerating ? 'animate-ping' : ''}`}></div>
      </div>

      <div className="flex flex-col gap-10">
        {/* FACE UPLINK */}
        <section className="space-y-5">
           <label className="text-[10px] orbitron text-slate-500 font-black uppercase block tracking-widest">Neural_Face_Mapping</label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={`w-full aspect-square rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${config.userFaceImage ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/40'}`}
           >
             {config.userFaceImage ? (
               <img src={config.userFaceImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Face Map" />
             ) : (
               <div className="text-center p-8 space-y-4">
                 <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto text-slate-400 group-hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                 <span className="text-[9px] orbitron font-black text-slate-500 group-hover:text-cyan-400 uppercase tracking-widest block">Upload_Likeness_Vector</span>
               </div>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                 const reader = new FileReader();
                 reader.onload = () => onUpdate({ userFaceImage: reader.result as string });
                 reader.readAsDataURL(file);
               }
             }} />
           </div>
        </section>

        {/* GRANULAR MORPHOLOGY */}
        <section className="space-y-6">
           <label className="text-[10px] orbitron text-slate-500 font-black uppercase block tracking-widest">Granular_Morphology</label>
           {[
             { id: 'noseSize', label: 'Nasal_Scale' },
             { id: 'eyeWidth', label: 'Optic_Span' },
             { id: 'jawLine', label: 'Mandible_V01' },
             { id: 'glowIntensity', label: 'Aura_Intensity' }
           ].map(ctrl => (
             <div key={ctrl.id} className="space-y-2">
                <div className="flex justify-between text-[8px] orbitron font-bold text-slate-500">
                   <span>{ctrl.label.toUpperCase()}</span>
                   <span>{(config.granular as any)?.[ctrl.id] || 50}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={(config.granular as any)?.[ctrl.id] || 50} 
                  onChange={(e) => handleGranularUpdate(ctrl.id, parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer"
                />
             </div>
           ))}
        </section>

        {/* SPECTRAL CHROMA */}
        <section className="space-y-4">
           <div className="flex justify-between items-center">
              <label className="text-[10px] orbitron text-slate-500 font-black uppercase block tracking-widest">Spectral_Chroma</label>
              <div className="flex items-center gap-4">
                 <span className="text-[11px] font-mono text-slate-500 uppercase">{config.themeColor}</span>
                 <input 
                    type="color" 
                    value={config.themeColor} 
                    onChange={(e) => onUpdate({ themeColor: e.target.value })} 
                    className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer overflow-hidden p-0 shadow-lg" 
                 />
              </div>
           </div>
        </section>

        {/* IDENTITY PRESETS */}
        <section className="space-y-5">
          <label className="text-[10px] orbitron text-slate-500 font-black uppercase block tracking-widest">Identity_Matrix</label>
          <div className="grid grid-cols-2 gap-4">
             {options.hairstyle.map(hair => (
               <button 
                key={hair}
                onClick={() => onUpdate({ hairstyle: hair })}
                className={`py-3 px-4 border rounded-2xl text-[9px] orbitron font-black uppercase transition-all ${config.hairstyle === hair ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 hover:border-cyan-500/40'}`}
               >
                 {hair}
               </button>
             ))}
          </div>
        </section>

        <button onClick={onGenerate} className="w-full py-6 bg-slate-900 dark:bg-cyan-500 text-white dark:text-black orbitron font-black text-xs rounded-3xl hover:scale-[1.03] transition-all shadow-2xl uppercase tracking-[0.3em]">
          {isGenerating ? 'Synthesizing_Core...' : 'EXECUTE_MASTER_SYNTH'}
        </button>
      </div>
    </div>
  );
};