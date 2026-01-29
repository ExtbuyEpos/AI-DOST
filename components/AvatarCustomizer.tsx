
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
    hairstyle: ['Cyber-Fade', 'Neon-Locs', 'Sleek-Synthetic', 'Spiky-Energy', 'Classic-Combed'],
    faceType: ['Android-Prime', 'Hyper-Humanoid', 'Abstract-Data', 'Cyborg-Elite', 'Crystal-Core'],
    accessory: ['Neural-Link', 'Tactical-Visor', 'Aura-Crown', 'None', 'Data-Halo'],
    voices: [
      { name: 'Charon', gender: 'MALE', tone: 'Sophisticated' },
      { name: 'Fenrir', gender: 'MALE', tone: 'Authoritative' },
      { name: 'Puck', gender: 'NEUTRAL', tone: 'Swift' },
      { name: 'Zephyr', gender: 'FEMALE', tone: 'Tactical' },
      { name: 'Kore', gender: 'FEMALE', tone: 'Clear' }
    ]
  };

  return (
    <div className="fixed left-6 md:left-12 top-28 bottom-28 w-80 md:w-96 z-[60] flex flex-col gap-6 animate-in slide-in-from-left-10 duration-700 pointer-events-auto hud-glass rounded-[2.5rem] p-8 overflow-y-auto premium-scroll border-slate-200/50 dark:border-cyan-500/30 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)]">
      <div className="text-[14px] orbitron text-slate-800 dark:text-cyan-400 font-black tracking-[0.3em] border-b-2 border-slate-100 dark:border-cyan-500/20 pb-5 mb-2 flex justify-between items-center uppercase italic">
        Identity_Editor
        <div className={`w-3 h-3 bg-sky-500 dark:bg-cyan-500 rounded-full ${isGenerating ? 'animate-ping' : ''}`}></div>
      </div>

      <div className="flex flex-col gap-8">
        {/* FACE UPLOAD */}
        <section className="space-y-4">
           <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Neural_Face_Uplink</label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={`w-full aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${config.userFaceImage ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/50'}`}
           >
             {config.userFaceImage ? (
               <img src={config.userFaceImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Face Source" />
             ) : (
               <span className="text-[9px] orbitron font-black text-slate-500 dark:text-cyan-400 uppercase tracking-widest text-center">Upload_Tactical_Likeness</span>
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

        {/* GRANULAR CONTROLS */}
        <section className="space-y-6">
           <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Granular_Morphology</label>
           {[
             { id: 'noseSize', label: 'Nose_Scale' },
             { id: 'eyeWidth', label: 'Optic_Span' },
             { id: 'jawLine', label: 'Mandible_V01' },
             { id: 'glowIntensity', label: 'Aura_Lumen' }
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
                  className="w-full accent-cyan-500 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                />
             </div>
           ))}
        </section>

        {/* THEME COLOR PICKER */}
        <section className="space-y-4">
           <div className="flex justify-between items-center">
              <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Chroma_Spectral_Map</label>
              <input 
                type="color" 
                value={config.themeColor} 
                onChange={(e) => onUpdate({ themeColor: e.target.value })} 
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer overflow-hidden" 
              />
           </div>
        </section>

        {/* VOICE SYNTHESIZER */}
        <section className="space-y-4">
          <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Vocal_Synthesizer</label>
          <div className="grid grid-cols-2 gap-3">
            {options.voices.map(v => (
              <button 
                key={v.name}
                onClick={() => onUpdate({ voiceName: v.name })}
                className={`py-3 px-4 border-2 rounded-2xl transition-all text-left relative overflow-hidden ${config.voiceName === v.name ? 'bg-sky-500 dark:bg-cyan-500/20 border-sky-500 dark:border-cyan-400' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5'}`}
              >
                <span className="text-[10px] orbitron font-black block">{v.name.toUpperCase()}</span>
                <span className="text-[7px] orbitron font-bold opacity-40">{v.gender}_{v.tone}</span>
              </button>
            ))}
          </div>
        </section>

        <button onClick={onGenerate} className="w-full py-5 bg-slate-900 dark:bg-cyan-500 text-white dark:text-black orbitron font-black text-[13px] rounded-[1.5rem] hover:scale-105 transition-all shadow-xl relative overflow-hidden group">
          {isGenerating ? 'Synthesizing...' : 'FINALIZE_DOST_SYNTH'}
        </button>
      </div>
    </div>
  );
};
