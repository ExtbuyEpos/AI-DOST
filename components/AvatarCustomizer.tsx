
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
  config, 
  isOpen, 
  onUpdate, 
  onGenerate, 
  isGenerating,
  isGeneratingTheme,
  isGeneratingAccessory,
  onGenerateTheme,
  onGenerateAccessory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ userFaceImage: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const options = {
    hairstyle: ['Cyber-Fade', 'Neon-Locs', 'Sleek-Synthetic', 'Spiky-Energy', 'Classic-Combed'],
    faceType: ['Android-Prime', 'Hyper-Humanoid', 'Abstract-Data', 'Cyborg-Elite', 'Crystal-Core'],
    accessory: ['Neural-Link', 'Tactical-Visor', 'Aura-Crown', 'None', 'Data-Halo'],
    themeColor: ['#0284c7', '#f97316', '#a855f7', '#10b981', '#ef4444', '#0f172a'],
    voices: [
      { name: 'Charon', gender: 'MALE', tone: 'Sophisticated' },
      { name: 'Fenrir', gender: 'MALE', tone: 'Authoritative' },
      { name: 'Puck', gender: 'NEUTRAL', tone: 'Swift' },
      { name: 'Zephyr', gender: 'FEMALE', tone: 'Tactical' },
      { name: 'Kore', gender: 'FEMALE', tone: 'Clear' }
    ]
  };

  const isAccessoryPreset = options.accessory.includes(config.accessory);

  return (
    <div className="fixed left-6 md:left-12 top-28 bottom-28 w-80 md:w-96 z-[60] flex flex-col gap-6 animate-in slide-in-from-left-10 duration-700 pointer-events-auto hud-glass rounded-[2.5rem] p-8 overflow-y-auto premium-scroll border-slate-200/50 dark:border-cyan-500/30 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)]">
      <div className="text-[14px] orbitron text-slate-800 dark:text-cyan-400 font-black tracking-[0.3em] border-b-2 border-slate-100 dark:border-cyan-500/20 pb-5 mb-2 flex justify-between items-center uppercase italic">
        Identity_Editor
        <div className={`w-3 h-3 bg-sky-500 dark:bg-cyan-500 rounded-full ${isGenerating || isGeneratingTheme || isGeneratingAccessory ? 'animate-ping' : ''}`}></div>
      </div>

      <div className="flex flex-col gap-7">
        {/* FACE RECOGNITION UPLOAD */}
        <section className="space-y-4">
           <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Neural_Face_Uplink</label>
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={`w-full aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${config.userFaceImage ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-200 dark:border-white/10 hover:border-cyan-500/50'}`}
           >
             {config.userFaceImage ? (
               <>
                 <img src={config.userFaceImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Face Source" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] orbitron font-black text-white uppercase tracking-widest bg-cyan-600 px-3 py-1 rounded-full">Recalibrate_Face</span>
                 </div>
               </>
             ) : (
               <>
                 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-400 dark:text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 4v16m8-8H4"/></svg>
                 </div>
                 <span className="text-[9px] orbitron font-black text-slate-500 dark:text-cyan-400 uppercase tracking-widest">Upload_Personal_Optics</span>
                 <p className="text-[7px] text-slate-400 mt-1">Sir's facial data for 3D likeness</p>
               </>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
           </div>
        </section>

        {/* VOICE SYNTHESIZER SECTION */}
        <section>
          <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase mb-3 block tracking-widest">Vocal_Synthesizer [Real_Voice]</label>
          <div className="grid grid-cols-2 gap-2.5">
            {options.voices.map(v => (
              <button 
                key={v.name}
                onClick={() => onUpdate({ voiceName: v.name })}
                className={`flex flex-col gap-1 py-3 px-4 border-2 rounded-2xl transition-all text-left relative overflow-hidden group/voice ${config.voiceName === v.name ? 'bg-sky-500 dark:bg-cyan-500/20 border-sky-500 dark:border-cyan-400 shadow-lg' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5 hover:border-sky-300'}`}
              >
                <div className="flex items-center justify-between">
                   <span className={`text-[10px] orbitron font-black ${config.voiceName === v.name ? 'text-white dark:text-cyan-50' : 'text-slate-800 dark:text-slate-200'}`}>{v.name.toUpperCase()}</span>
                   <div className={`w-1.5 h-1.5 rounded-full ${v.gender === 'FEMALE' ? 'bg-rose-500 shadow-[0_0_5px_#f43f5e]' : 'bg-blue-500 shadow-[0_0_5px_#3b82f6]'}`}></div>
                </div>
                <span className={`text-[7px] orbitron font-bold uppercase tracking-widest ${config.voiceName === v.name ? 'text-white/60 dark:text-cyan-500' : 'text-slate-400'}`}>{v.gender}_{v.tone}</span>
                {config.voiceName === v.name && <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rotate-45 translate-x-4 translate-y-[-4px]"></div>}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase mb-3 block tracking-widest">Hairstyle_Matrix</label>
          <div className="grid grid-cols-1 gap-2.5">
            {options.hairstyle.map(h => (
              <button 
                key={h}
                onClick={() => onUpdate({ hairstyle: h })}
                className={`text-[10px] font-mono py-3 px-4 border-2 rounded-2xl transition-all text-left truncate font-bold ${config.hairstyle === h ? 'bg-sky-500 dark:bg-cyan-500/20 border-sky-500 dark:border-cyan-400 text-white dark:text-cyan-50 shadow-lg' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-sky-300 dark:hover:border-cyan-500/30'}`}
              >
                {h.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Accessory_Module</label>
          </div>
          
          <button 
            onClick={onGenerateAccessory}
            disabled={isGeneratingAccessory}
            className={`w-full py-5 border-2 border-dashed rounded-[1.5rem] transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${isGeneratingAccessory ? 'bg-sky-500/20 border-sky-500' : 'bg-sky-50 dark:bg-cyan-500/5 border-sky-200 dark:border-cyan-500/20 hover:border-sky-500 hover:bg-sky-500/10 shadow-sm'}`}
          >
            {isGeneratingAccessory && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[scan_2s_linear_infinite]"></div>
            )}
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isGeneratingAccessory ? 'bg-white border-sky-500 animate-spin' : 'border-sky-500 group-hover:scale-110 shadow-[0_0_100px_rgba(14,165,233,0.2)]'}`}>
              <svg viewBox="0 0 24 24" className={`w-4 h-4 ${isGeneratingAccessory ? 'text-sky-500' : 'text-sky-600 dark:text-cyan-400'}`} fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
            </div>
            <span className="text-[10px] orbitron font-black text-sky-600 dark:text-cyan-400 uppercase tracking-widest mt-1">
              {isGeneratingAccessory ? 'Analyzing_Spectral_Data...' : 'AI_Generate_Accessory'}
            </span>
          </button>

          <div className="grid grid-cols-1 gap-2.5">
            {!isAccessoryPreset && config.accessory !== 'None' && (
              <div className="relative group/unique">
                <button 
                  onClick={() => onUpdate({ accessory: config.accessory })}
                  className={`w-full text-[11px] font-mono py-4 px-4 border-2 rounded-2xl transition-all text-left font-bold shadow-lg relative overflow-hidden bg-sky-600 dark:bg-sky-900 border-sky-400 text-white`}
                  style={{ boxShadow: `0 0 20px ${config.themeColor}33` }}
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-white text-sky-600 text-[7px] orbitron font-black uppercase tracking-tighter">Unique_Gen</div>
                  {config.accessory.toUpperCase()}
                </button>
              </div>
            )}
            {options.accessory.map(a => (
              <button 
                key={a}
                onClick={() => onUpdate({ accessory: a })}
                className={`text-[11px] font-mono py-3 px-4 border-2 rounded-2xl transition-all text-left font-bold ${config.accessory === a ? 'bg-sky-500 dark:bg-cyan-500/20 border-sky-500 dark:border-cyan-400 text-white dark:text-cyan-50 shadow-lg' : 'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-sky-300 dark:hover:border-cyan-500/30'}`}
              >
                {a.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] orbitron text-slate-400 dark:text-cyan-600 font-black uppercase block tracking-widest">Primary_Chroma</label>
            <button 
              onClick={onGenerateTheme}
              disabled={isGeneratingTheme}
              className="text-[8px] orbitron font-black text-sky-600 dark:text-cyan-400 hover:text-white dark:hover:text-white bg-sky-50 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-500/30 px-3 py-1 rounded-xl transition-all disabled:opacity-50 uppercase shadow-sm"
            >
              {isGeneratingTheme ? 'SYNTH...' : 'AI_Random'}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {options.themeColor.map(c => (
              <button 
                key={c}
                onClick={() => onUpdate({ themeColor: c })}
                className={`w-9 h-9 rounded-full border-4 transition-all shadow-md ${config.themeColor === c ? 'border-white scale-115 ring-2 ring-sky-500 dark:ring-cyan-400' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                style={{ backgroundColor: c, color: c }}
              />
            ))}
          </div>
        </section>

        <div className="pt-4 border-t-2 border-slate-100 dark:border-cyan-500/10 mt-2">
          <button 
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full py-5 bg-slate-900 dark:bg-cyan-500 text-white dark:text-black orbitron font-black text-[13px] rounded-[1.5rem] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-wait relative overflow-hidden group shadow-xl"
          >
            {isGenerating ? 'Synthesizing_Identity...' : config.userFaceImage ? 'SYNTHESIZE_REAL_AVATAR' : 'INITIALIZE_CORE_SYNTH'}
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>
        </div>

        <p className="text-[8px] orbitron text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest mt-2 leading-relaxed">
          High-fidelity rendering utilizes distributed neural clusters for Sir's specific likeness.
        </p>
      </div>
    </div>
  );
};
